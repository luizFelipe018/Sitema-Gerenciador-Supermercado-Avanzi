// Função global — chamada ao imprimir qualquer placa
function registrarImpressaoPlacas() {
    const ids = window._ultimasPlacasGeradas || []
    if (!ids.length) return

    // Aguarda o diálogo de impressão fechar e pergunta ao usuário
    setTimeout(() => {
        // Monta o modal via createElement (sem innerHTML com handlers — evita CSP)
        const overlay = document.createElement('div')
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);z-index:9999;display:flex;align-items:center;justify-content:center;'

        const box = document.createElement('div')
        box.style.cssText = 'background:#fff;border-radius:16px;padding:28px 32px;width:380px;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;'

        const icone = document.createElement('div')
        icone.style.cssText = 'font-size:40px;margin-bottom:12px;'
        icone.textContent = '🖨️'

        const titulo = document.createElement('h3')
        titulo.style.cssText = 'font-size:16px;font-weight:700;color:#111827;margin-bottom:8px;'
        titulo.textContent = 'A impressão foi concluída?'

        const descricao = document.createElement('p')
        descricao.style.cssText = 'font-size:13px;color:#6b7280;margin-bottom:24px;'
        descricao.textContent = 'Confirme para registrar as placas como impressas no relatório.'

        const botoes = document.createElement('div')
        botoes.style.cssText = 'display:flex;gap:10px;'

        const btnSim = document.createElement('button')
        btnSim.style.cssText = 'flex:1;padding:10px;background:#16a34a;color:#fff;border:none;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;'
        btnSim.textContent = '✅ Sim, foi impressa'

        const btnNao = document.createElement('button')
        btnNao.style.cssText = 'flex:1;padding:10px;background:#f3f4f6;color:#374151;border:none;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;'
        btnNao.textContent = '❌ Não'

        btnNao.onclick = () => document.body.removeChild(overlay)

        btnSim.onclick = async () => {
            document.body.removeChild(overlay)
            try {
                await fetch('http://localhost:3000/log-placas/imprimir', {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify({ ids })
                })
                window._ultimasPlacasGeradas = []
            } catch (e) {
                console.warn('Erro ao registrar impressão:', e)
            }
        }

        botoes.appendChild(btnSim)
        botoes.appendChild(btnNao)
        box.appendChild(icone)
        box.appendChild(titulo)
        box.appendChild(descricao)
        box.appendChild(botoes)
        overlay.appendChild(box)
        document.body.appendChild(overlay)
    }, 500)
}

// ── ABA RELATÓRIO ─────────────────────────────────────
async function carregarRelatorioPlacas() {
    setActive('btn-relatorio-placas')
    setConteudo(`
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
            <div class="flex gap-3 flex-wrap items-end">

                <div class="flex flex-col gap-1 flex-1" style="min-width:200px;">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Produto</label>
                    <input id="rel-desc" type="text" placeholder="Nome, código ou EAN..."
                        class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
                </div>

                <div class="flex flex-col gap-1" style="width:130px;">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preço (R$)</label>
                    <input id="rel-preco" type="number" step="0.01" placeholder="Ex: 5,99"
                        class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
                </div>

                <div class="flex flex-col gap-1">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</label>
                    <select id="rel-tipo" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white">
                        <option value="">Todos</option>
                        <option value="branca">Branca</option>
                        <option value="amarela">Amarela</option>
                        <option value="grande">Grande</option>
                    </select>
                </div>

                <button id="rel-btn-buscar" class="px-5 py-2 text-white text-sm font-semibold rounded-lg" style="background:#b51515;">
                    🔍 Buscar
                </button>
                <button id="rel-btn-imprimir" class="px-5 py-2 text-white text-sm font-semibold rounded-lg opacity-40 cursor-not-allowed" style="background:#1a1a2e;" disabled>
                    🖨️ Imprimir
                </button>
            </div>
        </div>

        <div id="rel-resultado"></div>
    `, 'Relatório de Placas')

    document.getElementById('rel-btn-buscar').onclick = buscarRelatorio
    document.getElementById('rel-desc').onkeydown     = (e) => { if (e.key === 'Enter') buscarRelatorio() }
    document.getElementById('rel-preco').onkeydown    = (e) => { if (e.key === 'Enter') buscarRelatorio() }
    document.getElementById('rel-tipo').onchange      = buscarRelatorio

    buscarRelatorio()
}

async function buscarRelatorio() {
    const descricao = document.getElementById('rel-desc').value.trim()
    const preco     = document.getElementById('rel-preco').value.trim()
    const tipo      = document.getElementById('rel-tipo').value
    const resultEl  = document.getElementById('rel-resultado')

    resultEl.innerHTML = `<p class="text-sm text-gray-400 py-4 text-center">Carregando...</p>`

    try {
        const params = new URLSearchParams()
        if (descricao) params.append('descricao', descricao)

        const res  = await fetch(`http://localhost:3000/log-placas?${params}`, { headers: authHeaders() })
        const data = await res.json()

        if (!Array.isArray(data) || !data.length) {
            resultEl.innerHTML = `<p class="text-sm text-gray-400 py-6 text-center">Nenhum registro encontrado.</p>`
            return
        }

        // Filtra por tipo e preço
        let registros = tipo ? data.filter(r => r.tipo_placa === tipo) : data
        if (preco) {
            const precoNum = parseFloat(preco.replace(',', '.'))
            registros = registros.filter(r => Math.abs(parseFloat(r.preco || 0) - precoNum) < 0.01)
        }

        if (!registros.length) {
            resultEl.innerHTML = `<p class="text-sm text-gray-400 py-6 text-center">Nenhum registro para o filtro selecionado.</p>`
            return
        }

        // Agrupa apenas por DESCRIÇÃO + TIPO (junta todas as variações de preço)
        const grupos = {}
        registros.forEach(r => {
            const key = r.descricao.toUpperCase() + '||' + r.tipo_placa
            if (!grupos[key]) grupos[key] = {
                descricao:  r.descricao,
                codigo:     r.codigo,
                ean:        r.ean,
                tipo_placa: r.tipo_placa,
                registros:  []
            }
            grupos[key].registros.push(r)
        })

        // Ordena por descrição
        const linhas = Object.values(grupos).sort((a, b) => a.descricao.localeCompare(b.descricao))

        const totalPlacas   = registros.length
        const totalProdutos = new Set(registros.map(r => r.descricao.toUpperCase())).size

        // Detecta variações de preço por produto
        const variacoes = {}
        linhas.forEach(l => {
            const precos = new Set(l.registros.map(r => Number(r.preco || 0).toFixed(2)))
            variacoes[l.descricao.toUpperCase() + '||' + l.tipo_placa] = precos.size
        })

        const tipoBadge = (t) => {
            const cores = { branca: ['#f3f4f6','#374151'], amarela: ['#fef9c3','#854d0e'], grande: ['#dbeafe','#1d4ed8'] }
            const [bg, color] = cores[t] || ['#f3f4f6','#374151']
            return `<span class="px-2 py-0.5 rounded-full text-xs font-semibold" style="background:${bg};color:${color};">${t}</span>`
        }

        resultEl.innerHTML = `
            <div class="flex gap-3 mb-4 flex-wrap">
                <span class="px-3 py-1.5 rounded-full text-xs font-semibold" style="background:#f3f4f6;color:#374151;">
                    ${totalPlacas} placa(s) no período
                </span>
                <span class="px-3 py-1.5 rounded-full text-xs font-semibold" style="background:#dbeafe;color:#1d4ed8;">
                    ${totalProdutos} produto(s) distinto(s)
                </span>
                <span class="px-3 py-1.5 rounded-full text-xs font-semibold" style="background:#fef3c7;color:#92400e;">
                    ${linhas.filter(l => variacoes[l.descricao.toUpperCase()] > 1).length} variação(ões) de preço
                </span>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table class="w-full text-sm">
                    <thead>
                        <tr style="border-bottom:2px solid #f3f4f6;">
                            <th class="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Produto</th>
                            <th class="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Código</th>
                            <th class="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${linhas.map((g, i) => {
                            const gKey        = g.descricao.toUpperCase() + '||' + g.tipo_placa
                            const temVariacao = variacoes[gKey] > 1
                            const bg          = temVariacao ? '#fffbeb' : (i % 2 === 0 ? '#fff' : '#f9fafb')
                            const uid         = 'datas_' + i


                            // Agrupa por preço com status de cada registro
                            const porPrecoStatus = {}
                            g.registros.forEach(r => {
                                const val = parseFloat(r.preco)
                                const key = (!isNaN(val) && val > 0) ? val.toFixed(2) : 'sem_preco'
                                if (!porPrecoStatus[key]) porPrecoStatus[key] = { preco: (!isNaN(val) && val > 0) ? val.toFixed(2) : null, itens: [] }
                                porPrecoStatus[key].itens.push({ data: new Date(r.criado_em), impressa: r.impressa })
                            })

                            const popupHtml = Object.values(porPrecoStatus)
                                .sort((a,b) => (parseFloat(a.preco)||0) - (parseFloat(b.preco)||0))
                                .map(({ preco, itens }) => {
                                    const label = preco ? 'R$ ' + Number(preco).toFixed(2).replace('.',',') : 'Sem preço'
                                    return '<div style="margin-bottom:12px;">' +
                                        '<div style="font-size:13px;font-weight:700;color:#b51515;margin-bottom:6px;">' + label + '</div>' +
                                        itens.sort((a,b) => b.data - a.data).map(item => {
                                            const dataStr  = item.data.toLocaleDateString('pt-BR') + ' às ' + item.data.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})
                                            const badgeBg  = item.impressa ? '#dcfce7' : '#dbeafe'
                                            const badgeClr = item.impressa ? '#16a34a' : '#1d4ed8'
                                            const badgeTxt = item.impressa ? '🖨️ Impressa' : '💾 Gerada'
                                            return '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f9fafb;">' +
                                                '<span style="font-size:12px;color:#6b7280;">📅 ' + dataStr + '</span>' +
                                                '<span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;background:' + badgeBg + ';color:' + badgeClr + ';">' + badgeTxt + '</span>' +
                                                '</div>'
                                        }).join('') +
                                    '</div>'
                                }).join('<hr style="border:none;border-top:1px solid #f3f4f6;margin:10px 0;">')


                            return `
                                <tr style="background:${bg}; border-bottom:1px solid #f3f4f6;">
                                    <td class="px-5 py-3">
                                        <span class="font-semibold text-gray-800">${g.descricao}</span>
                                        ${temVariacao ? `<span class="ml-2 text-xs font-bold px-1.5 py-0.5 rounded" style="background:#fef3c7;color:#92400e;">⚠ variação de preço</span>` : ''}
                                    </td>
                                    <td class="px-5 py-3 font-mono text-gray-400 text-xs">${g.codigo || '—'}</td>
                                    <td class="px-5 py-3">${tipoBadge(g.tipo_placa)}</td>
                                    <td class="px-5 py-3">
                                        <button class="btn-ver-datas text-xs font-semibold px-2 py-0.5 rounded border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition-all"
                                            data-uid="${uid}"
                                            data-nome="${g.descricao}"
                                            data-tipo="${g.tipo_placa}">
                                            ver datas
                                        </button>
                                        <div id="${uid}" style="display:none;">${popupHtml}</div>
                                    </td>
                                </tr>
                            `
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `

        // Popup datas completas
        resultEl.querySelectorAll('.btn-ver-datas').forEach(btn => {
            btn.onclick = () => {
                const uid      = btn.getAttribute('data-uid')
                const nome     = btn.getAttribute('data-nome')
                const tipo     = btn.getAttribute('data-tipo')
                const conteudo = document.getElementById(uid).innerHTML
                abrirPopupDatas(nome, tipo, conteudo)
            }
        })

        const btnImprimir = document.getElementById('rel-btn-imprimir')
        btnImprimir.disabled = false
        btnImprimir.classList.remove('opacity-40', 'cursor-not-allowed')
        btnImprimir.onclick = () => imprimirRelatorio(linhas, variacoes, totalPlacas)

    } catch (e) {
        console.error(e)
        resultEl.innerHTML = `<p class="text-sm text-red-400 py-6 text-center">Erro ao conectar com o servidor.</p>`
    }
}

function imprimirRelatorio(linhas, variacoes, totalPlacas) {

    const rows = linhas.map((g, i) => {
        const gKey   = g.descricao.toUpperCase() + '||' + g.tipo_placa
        const temVar = variacoes[gKey] > 1

        const porPreco = {}
        g.registros.forEach(r => {
            const val = parseFloat(r.preco)
            const p   = (!isNaN(val) && val > 0) ? val.toFixed(2) : null
            const key = p || 'sem_preco'
            if (!porPreco[key]) porPreco[key] = { preco: p, datas: [] }
            porPreco[key].datas.push(new Date(r.criado_em))
        })

        return `<tr style="background:${temVar ? '#fffbeb' : i % 2 === 0 ? '#fff' : '#f9fafb'}">
            <td>${g.descricao}${temVar ? ' ⚠' : ''}</td>
            <td>${g.codigo || '—'}</td>
            <td>${g.tipo_placa}</td>

        </tr>`
    }).join('')

    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
        <title>Relatório de Placas</title>
        <style>
            * { font-family:'Segoe UI',sans-serif; margin:0; padding:0; box-sizing:border-box; }
            body { padding:20px; font-size:12px; }
            h2 { font-size:16px; margin-bottom:4px; color:#b51515; }
            p.sub { font-size:11px; color:#666; margin-bottom:14px; }
            table { width:100%; border-collapse:collapse; }
            th { background:#b51515; color:#fff; font-weight:600; text-align:left; padding:7px 10px; font-size:11px; text-transform:uppercase; }
            td { padding:6px 10px; border-bottom:1px solid #f0f0f0; vertical-align:top; }
            @page { size:A4 landscape; margin:15mm; }
        </style></head><body>
        <h2>Relatório de Placas</h2>
        <p class="sub">${totalPlacas} placa(s) — Gerado em ${new Date().toLocaleString('pt-BR')}</p>
        <table>
            <thead><tr>
                <th>Produto</th><th>Código</th><th>Tipo</th>
            </tr></thead>
            <tbody>${rows}</tbody>
        </table>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body></html>`)
    win.document.close()
}

// ── POPUP DATAS ───────────────────────────────────────
function abrirPopupDatas(nome, tipo, conteudoHtml) {
    // Remove popup anterior se existir
    const anterior = document.getElementById('popup-datas')
    if (anterior) anterior.remove()

    const cores = { branca: ['#f3f4f6','#374151'], amarela: ['#fef9c3','#854d0e'], grande: ['#dbeafe','#1d4ed8'] }
    const [bg, color] = cores[tipo] || ['#f3f4f6','#374151']

    const overlay = document.createElement('div')
    overlay.id = 'popup-datas'
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.45);
        z-index: 2000;
        display: flex; align-items: center; justify-content: center;
    `

    overlay.innerHTML = `
        <div style="
            background: #fff;
            border-radius: 16px;
            width: 80%;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 25px 60px rgba(0,0,0,0.25);
            overflow: hidden;
        ">
            <!-- Cabeçalho -->
            <div style="padding: 20px 24px 16px; border-bottom: 1px solid #f3f4f6; flex-shrink:0;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                    <h3 style="font-size:16px; font-weight:700; color:#111827; margin:0;">${nome}</h3>
                    <button id="popup-fechar" style="
                        background: #f3f4f6; border: none; border-radius: 8px;
                        width: 32px; height: 32px; font-size: 18px; cursor: pointer;
                        color: #6b7280; display:flex; align-items:center; justify-content:center;
                    ">×</button>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <span style="background:${bg}; color:${color}; font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px;">${tipo}</span>
                </div>
            </div>

            <!-- Conteúdo com scroll -->
            <div style="overflow-y: auto; padding: 20px 24px; flex: 1;">
                <p style="font-size:11px; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:12px;">
                    Todas as datas e horários de criação
                </p>
                <div style="display:flex; flex-direction:column; gap:6px;">
                    ${conteudoHtml}
                </div>
            </div>

            <!-- Rodapé -->
            <div style="padding:14px 24px; border-top:1px solid #f3f4f6; flex-shrink:0; text-align:right;">
                <button id="popup-fechar-btn" style="
                    background:#b51515; color:#fff; border:none; border-radius:8px;
                    padding: 8px 20px; font-size:13px; font-weight:600; cursor:pointer;
                ">Fechar</button>
            </div>
        </div>
    `

    document.body.appendChild(overlay)

    // Fechar ao clicar fora ou nos botões
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove() }
    document.getElementById('popup-fechar').onclick     = () => overlay.remove()
    document.getElementById('popup-fechar-btn').onclick = () => overlay.remove()

    // Fechar com Escape
    const onEsc = (e) => { if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onEsc) } }
    document.addEventListener('keydown', onEsc)
}