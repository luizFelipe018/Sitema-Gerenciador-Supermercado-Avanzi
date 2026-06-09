// Função global — chamada ao imprimir qualquer placa
function registrarImpressaoPlacas() {
    const ids = window._ultimasPlacasGeradas || []

    // Aguarda o diálogo de impressão fechar e pergunta ao usuário
    setTimeout(() => {
        // Monta o modal via createElement (sem innerHTML com handlers — evita CSP)
        const overlay = document.createElement('div')
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:center;justify-content:center;'

        const box = document.createElement('div')
        box.style.cssText = 'background:rgba(20,20,35,0.95);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:28px 32px;width:380px;box-shadow:0 20px 60px rgba(0,0,0,0.5);text-align:center;backdrop-filter:blur(20px);'

        const icone = document.createElement('div')
        icone.style.cssText = 'font-size:40px;margin-bottom:12px;'
        icone.textContent = '🖨️'

        const titulo = document.createElement('h3')
        titulo.style.cssText = 'font-size:16px;font-weight:700;color:rgba(255,255,255,0.9);margin-bottom:8px;'
        titulo.textContent = 'A impressão foi concluída?'

        const descricao = document.createElement('p')
        descricao.style.cssText = 'font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:24px;'
        descricao.textContent = 'Confirme para registrar as placas como impressas no relatório.'

        const botoes = document.createElement('div')
        botoes.style.cssText = 'display:flex;gap:10px;'

        const btnSim = document.createElement('button')
        btnSim.style.cssText = 'flex:1;padding:10px;border:none;border-radius:10px;font-size:13px;font-weight:700;color:#fff;cursor:pointer;background:linear-gradient(135deg,#16a34a,#0f7b37);box-shadow:0 4px 16px rgba(22,163,74,0.3);transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);'
        btnSim.textContent = '✅ Sim, foi impressa'

        const btnNao = document.createElement('button')
        btnNao.style.cssText = 'flex:1;padding:10px;border:1px solid rgba(255,255,255,0.08);border-radius:10px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.6);cursor:pointer;background:rgba(255,255,255,0.04);transition:all 0.3s;'
        btnNao.textContent = '❌ Não'

        btnNao.onclick = () => document.body.removeChild(overlay)

        btnSim.onclick = async () => {
            document.body.removeChild(overlay)
            try {
                let idsParaMarcar = [...ids]
                if (!idsParaMarcar.length && window._placasAtuais && window._placasAtuais.length) {
                    const logPlacas = window._placasAtuais.map(p => ({
                        descricao: p.descricao || '',
                        codigo: p.codigo || null,
                        ean: p.ean || null,
                        preco: p.preco || 0,
                        tipo_placa: p.tipo_placa || 'branca'
                    }))
                    const res = await fetch(API+'/log-placas', {
                        method: 'POST',
                        headers: authHeaders(),
                        body: JSON.stringify(logPlacas)
                    })
                    const data = await res.json()
                    if (data.ids && data.ids.length) idsParaMarcar = data.ids
                }
                if (idsParaMarcar.length) {
                    await fetch(API+'/log-placas/imprimir', {
                        method: 'POST',
                        headers: authHeaders(),
                        body: JSON.stringify({ ids: idsParaMarcar })
                    })
                }
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
        <div class="dash-glass dash-animate" style="padding:20px; margin-bottom:20px;">
            <div class="flex gap-3 flex-wrap items-end">

                <div class="flex flex-col gap-1 flex-1" style="min-width:200px;">
                    <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Produto</label>
                    <input id="rel-desc" type="text" placeholder="Nome, código ou EAN..."
                        style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s;"
                        onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                        onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                </div>

                <div class="flex flex-col gap-1" style="width:130px;">
                    <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Preço (R$)</label>
                    <input id="rel-preco" type="number" step="0.01" placeholder="Ex: 5,99"
                        style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s;"
                        onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                        onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                </div>

                <div class="flex flex-col gap-1">
                    <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Tipo</label>
                    <select id="rel-tipo" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; cursor:pointer;">
                        <option value="" style="background:#1a1a2e;color:#fafafa;">Todos</option>
                        <option value="branca" style="background:#1a1a2e;color:#fafafa;">Branca</option>
                        <option value="amarela" style="background:#1a1a2e;color:#fafafa;">Amarela</option>
                        <option value="grande" style="background:#1a1a2e;color:#fafafa;">Grande</option>
                    </select>
                </div>

                <button id="rel-btn-buscar" style="padding:10px 20px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; gap:6px;">
                    <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Buscar
                </button>
                <button id="rel-btn-imprimir" style="padding:10px 18px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; font-weight:600; color:rgba(255,255,255,0.6); cursor:not-allowed; background:rgba(255,255,255,0.04); transition:all 0.3s; display:flex; align-items:center; gap:6px; opacity:0.4;" disabled>
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> Imprimir
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

    resultEl.innerHTML = `<p style="text-align:center; color:rgba(255,255,255,0.4); font-size:13px; padding:16px 0;">Carregando...</p>`

    try {
        const params = new URLSearchParams()
        if (descricao) params.append('descricao', descricao)

        const res  = await fetch(API+`/log-placas?${params}`, { headers: authHeaders() })
        const data = await res.json()

        if (!Array.isArray(data) || !data.length) {
            resultEl.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 0; gap:12px;"><svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="color:rgba(255,255,255,0.12);"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><span style="color:rgba(255,255,255,0.3); font-size:13px; font-weight:500;">Nenhum registro encontrado</span></div>`
            return
        }

        // Filtra por tipo e preço
        let registros = tipo ? data.filter(r => r.tipo_placa === tipo) : data
        if (preco) {
            const precoNum = parseFloat(preco.replace(',', '.'))
            registros = registros.filter(r => Math.abs(parseFloat(r.preco || 0) - precoNum) < 0.01)
        }

        if (!registros.length) {
            resultEl.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 0; gap:12px;"><svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="color:rgba(255,255,255,0.12);"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><span style="color:rgba(255,255,255,0.3); font-size:13px; font-weight:500;">Nenhum registro para o filtro selecionado</span></div>`
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
            const cores = { branca: ['rgba(255,255,255,0.08)','rgba(255,255,255,0.6)'], amarela: ['rgba(255,200,50,0.15)','#f5d742'], grande: ['rgba(91,154,255,0.15)','#5b9aff'] }
            const [bg, color] = cores[t] || ['rgba(255,255,255,0.08)','rgba(255,255,255,0.6)']
            return `<span style="padding:2px 10px; border-radius:20px; font-size:11px; font-weight:600; background:${bg}; color:${color};">${t}</span>`
        }

        resultEl.innerHTML = `
            <div style="display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap;">
                <span style="padding:6px 14px; border-radius:20px; font-size:11px; font-weight:700; background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.06);">
                    ${totalPlacas} placa(s) no período
                </span>
                <span style="padding:6px 14px; border-radius:20px; font-size:11px; font-weight:700; background:rgba(91,154,255,0.1); color:#5b9aff; border:1px solid rgba(91,154,255,0.15);">
                    ${totalProdutos} produto(s) distinto(s)
                </span>
                <span style="padding:6px 14px; border-radius:20px; font-size:11px; font-weight:700; background:rgba(255,200,50,0.1); color:#f5d742; border:1px solid rgba(255,200,50,0.15);">
                    ${linhas.filter(l => variacoes[l.descricao.toUpperCase()] > 1).length} variação(ões) de preço
                </span>
            </div>

            <div class="dash-table-wrap">
                <table class="dash-table">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                            <th style="padding:14px 20px; text-align:left; font-size:10px; font-weight:700; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:0.06em;">Produto</th>
                            <th style="padding:14px 20px; text-align:left; font-size:10px; font-weight:700; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:0.06em;">Código</th>
                            <th style="padding:14px 20px; text-align:left; font-size:10px; font-weight:700; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:0.06em;">Tipo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${linhas.map((g, i) => {
                            const gKey        = g.descricao.toUpperCase() + '||' + g.tipo_placa
                            const temVariacao = variacoes[gKey] > 1
                            const bg          = temVariacao ? 'rgba(255,200,50,0.06)' : (i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)')
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
                                            const badgeBg  = item.impressa ? 'rgba(22,163,74,0.15)' : 'rgba(59,130,246,0.15)'
                                            const badgeClr = item.impressa ? '#22c55e' : '#60a5fa'
                                            const badgeTxt = item.impressa ? '🖨️ Impressa' : '💾 Gerada'
                                            return '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);">' +
                                                '<span style="font-size:12px;color:rgba(255,255,255,0.5);">📅 ' + dataStr + '</span>' +
                                                '<span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;background:' + badgeBg + ';color:' + badgeClr + ';">' + badgeTxt + '</span>' +
                                                '</div>'
                                        }).join('') +
                                    '</div>'
                                }).join('<hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:10px 0;">')


                            return `
                                <tr style="background:${bg}; border-bottom:1px solid rgba(255,255,255,0.04);">
                                    <td style="padding:12px 20px;">
                                        <span style="font-weight:600; color:rgba(255,255,255,0.85); font-size:13px;">${g.descricao}</span>
                                        ${temVariacao ? `<span style="margin-left:8px; font-size:10px; font-weight:700; padding:2px 8px; border-radius:4px; background:rgba(255,200,50,0.15); color:#f5d742;">⚠ variação de preço</span>` : ''}
                                    </td>
                                    <td style="padding:12px 20px; font-family:monospace; color:rgba(255,255,255,0.3); font-size:11px;">${g.codigo || '—'}</td>
                                    <td style="padding:12px 20px;">${tipoBadge(g.tipo_placa)}</td>
                                    <td style="padding:12px 20px;">
                                        <button class="btn-ver-datas" style="font-size:11px; font-weight:600; padding:4px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); color:rgba(255,255,255,0.5); background:transparent; cursor:pointer; transition:all 0.3s;"
                                            onmouseover="this.style.borderColor='rgba(181,21,21,0.4)';this.style.color='rgba(181,21,21,0.8)'"
                                            onmouseout="this.style.borderColor='rgba(255,255,255,0.08)';this.style.color='rgba(255,255,255,0.5)'"
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
        btnImprimir.style.opacity = '1'
        btnImprimir.style.cursor = 'pointer'
        btnImprimir.onclick = () => imprimirRelatorio(linhas, variacoes, totalPlacas)

    } catch (e) {
        console.error(e)
        resultEl.innerHTML = `<p style="text-align:center; color:#ef4444; font-size:13px; padding:24px 0;">Erro ao conectar com o servidor.</p>`
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

    const cores = { branca: ['rgba(255,255,255,0.08)','rgba(255,255,255,0.6)'], amarela: ['rgba(255,200,50,0.15)','#f5d742'], grande: ['rgba(91,154,255,0.15)','#5b9aff'] }
    const [bg, color] = cores[tipo] || ['rgba(255,255,255,0.08)','rgba(255,255,255,0.6)']

    const overlay = document.createElement('div')
    overlay.id = 'popup-datas'
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        z-index: 2000;
        display: flex; align-items: center; justify-content: center;
    `

    overlay.innerHTML = `
        <div style="
            background: rgba(20,20,35,0.95);
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 16px;
            width: 80%;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 25px 60px rgba(0,0,0,0.5);
            overflow: hidden;
            backdrop-filter: blur(20px);
        ">
            <!-- Cabeçalho -->
            <div style="padding: 20px 24px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink:0;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                    <h3 style="font-size:16px; font-weight:700; color:rgba(255,255,255,0.9); margin:0;">${nome}</h3>
                    <button id="popup-fechar" style="
                        background: rgba(255,255,255,0.06); border: none; border-radius: 8px;
                        width: 32px; height: 32px; cursor: pointer;
                        color: rgba(255,255,255,0.4); display:flex; align-items:center; justify-content:center;
                        transition:all 0.3s;
                    " onmouseover="this.style.background='rgba(181,21,21,0.2)';this.style.color='#b51515'"
                       onmouseout="this.style.background='rgba(255,255,255,0.06)';this.style.color='rgba(255,255,255,0.4)'">
                       <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <span style="background:${bg}; color:${color}; font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px;">${tipo}</span>
                </div>
            </div>

            <!-- Conteúdo com scroll -->
            <div style="overflow-y: auto; padding: 20px 24px; flex: 1;">
                <p style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:12px;">
                    Todas as datas e horários de criação
                </p>
                <div style="display:flex; flex-direction:column; gap:6px;">
                    ${conteudoHtml}
                </div>
            </div>

            <!-- Rodapé -->
            <div style="padding:14px 24px; border-top:1px solid rgba(255,255,255,0.06); flex-shrink:0; text-align:right;">
                <button id="popup-fechar-btn" style="
                    padding:10px 20px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer;
                    background:linear-gradient(135deg,#b51515,#8a0f0f);
                    box-shadow:0 4px 16px rgba(181,21,21,0.3);
                    transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);
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
