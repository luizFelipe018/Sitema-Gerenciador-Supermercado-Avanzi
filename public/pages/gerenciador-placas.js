async function carregarGerenciadorPlacas() {
    setActive('btn-gerenciador-placas')
    setConteudo(`
        <div class="dash-glass dash-animate" style="padding:20px; margin-bottom:20px;">
            <div class="flex gap-3 flex-wrap items-end mb-4">
                <div class="flex flex-col gap-1">
                    <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">De</label>
                    <input type="date" id="gp-de" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s;"
                        onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                        onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                </div>
                <div class="flex flex-col gap-1">
                    <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Até</label>
                    <input type="date" id="gp-ate" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s;"
                        onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                        onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                </div>
                <div class="flex flex-col gap-1">
                    <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Descrição</label>
                    <input type="text" id="gp-desc" placeholder="Buscar descrição..."
                        style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s;"
                        onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                        onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                </div>
                <button id="gp-btn-buscar" style="padding:10px 20px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; gap:6px;">
                    <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Filtrar
                </button>
                <button id="gp-btn-limpar" style="padding:10px 18px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; font-weight:600; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.04); transition:all 0.3s; display:flex; align-items:center; gap:6px;">Limpar</button>
            </div>
            <div class="flex gap-3 items-center border-t pt-4" style="border-top-color:rgba(255,255,255,0.06);">
                <div class="flex gap-2">
                    <span style="padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.06);" id="gp-contador-total">—</span>
                    <span style="padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; background:rgba(255,200,50,0.1); color:#f5d742; border:1px solid rgba(255,200,50,0.15);" id="gp-contador-pendentes">—</span>
                    <span style="padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; background:rgba(22,163,74,0.1); color:#22c55e; border:1px solid rgba(22,163,74,0.15);" id="gp-contador-impressas">—</span>
                </div>
                <button id="gp-btn-exportar" style="padding:10px 18px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#16a34a,#0f7b37); box-shadow:0 4px 16px rgba(22,163,74,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; gap:6px; margin-left:auto;">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Exportar XLSX
                </button>
            </div>
        </div>
        <div id="gp-tabela-wrapper" class="dash-table-wrap">
            <p style="text-align:center; color:rgba(255,255,255,0.4); font-size:13px; padding:40px 0;">Carregando registros...</p>
        </div>
    `, 'Gerenciador de Placas')

    const hoje = new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-')
    document.getElementById('gp-de').value = hoje
    document.getElementById('gp-ate').value = hoje

    let dadosAtuais = []

    async function carregarRegistros() {
        const de = document.getElementById('gp-de').value
        const ate = document.getElementById('gp-ate').value
        const desc = document.getElementById('gp-desc').value.trim()

        const params = new URLSearchParams()
        if (de) params.set('de', de)
        if (ate) params.set('ate', ate)
        if (desc) params.set('descricao', desc)

        const wrapper = document.getElementById('gp-tabela-wrapper')
        wrapper.innerHTML = `<p style="text-align:center; color:rgba(255,255,255,0.4); font-size:13px; padding:40px 0;">Carregando...</p>`

        try {
            const res = await fetch(API+'/log-placas?' + params.toString(), { headers: authHeaders() })
            dadosAtuais = await res.json()

            const total = dadosAtuais.length
            const impressas = dadosAtuais.filter(p => p.impressa === 1).length
            const pendentes = total - impressas

            document.getElementById('gp-contador-total').textContent = `Total: ${total}`
            document.getElementById('gp-contador-pendentes').textContent = `Pendentes: ${pendentes}`
            document.getElementById('gp-contador-impressas').textContent = `Impressas: ${impressas}`

            if (!dadosAtuais.length) {
                wrapper.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 0; gap:12px;"><svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="color:rgba(255,255,255,0.12);"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><span style="color:rgba(255,255,255,0.3); font-size:13px; font-weight:500;">Nenhum registro encontrado</span></div>`
                return
            }

            wrapper.innerHTML = `
                <table class="dash-table">
                    <thead><tr style="background:rgba(255,255,255,0.02); color:rgba(255,255,255,0.3); font-size:10px; text-transform:uppercase; letter-spacing:0.06em; font-weight:700;">
                        <th style="padding:14px 16px; text-align:left;">Data/Hora</th>
                        <th style="padding:14px 16px; text-align:left;">Descrição</th>
                        <th style="padding:14px 16px; text-align:left;">Código</th>
                        <th style="padding:14px 16px; text-align:left;">EAN</th>
                        <th style="padding:14px 16px; text-align:right;">Preço</th>
                        <th style="padding:14px 16px; text-align:center;">Tipo</th>
                        <th style="padding:14px 16px; text-align:center;">Status</th>
                    </tr></thead>
                    <tbody id="gp-tbody"></tbody>
                </table>
                <div id="gp-paginacao" style="display:flex; align-items:center; justify-content:space-between; padding:12px 20px; border-top:1px solid rgba(255,255,255,0.06); font-size:12px; color:rgba(255,255,255,0.4);"></div>
            `

            renderizarTabelaGP(dadosAtuais, 1)
        } catch {
            wrapper.innerHTML = `<p style="text-align:center; color:#ef4444; font-size:13px; padding:40px 0;">Erro ao conectar com o servidor</p>`
        }
    }

    function renderizarTabelaGP(dados, pagina) {
        const porPagina = 100
        const tbody = document.getElementById('gp-tbody')
        const paginacao = document.getElementById('gp-paginacao')
        const totalPaginas = Math.ceil(dados.length / porPagina) || 1
        const inicio = (pagina - 1) * porPagina
        const paginaDados = dados.slice(inicio, inicio + porPagina)

        tbody.innerHTML = paginaDados.map(p => `
            <tr style="background:transparent; border-bottom:1px solid rgba(255,255,255,0.04); transition:all 0.2s; ${p.impressa ? 'opacity:0.45;' : ''}"
                onmouseover="this.style.background='rgba(255,255,255,0.03)'"
                onmouseout="this.style.background='transparent'">
                <td style="padding:10px 16px; color:rgba(255,255,255,0.5); font-size:11px;">${new Date(p.criado_em).toLocaleString('pt-BR')}</td>
                <td style="padding:10px 16px; color:rgba(255,255,255,0.85); font-weight:500; font-size:13px;">${p.descricao || '—'}</td>
                <td style="padding:10px 16px; color:rgba(255,255,255,0.3); font-size:11px; font-family:monospace;">${p.codigo || '—'}</td>
                <td style="padding:10px 16px; color:rgba(255,255,255,0.3); font-size:11px; font-family:monospace;">${p.ean || '—'}</td>
                <td style="padding:10px 16px; text-align:right; font-weight:600; color:rgba(255,255,255,0.85); font-size:13px;">${p.preco != null ? 'R$ ' + parseFloat(p.preco).toFixed(2).replace('.', ',') : '—'}</td>
                <td style="padding:10px 16px; text-align:center;">
                    <span style="padding:2px 10px; border-radius:20px; font-size:11px; font-weight:600; background:${p.tipo_placa === 'branca' ? 'rgba(255,255,255,0.08)' : p.tipo_placa === 'amarela' ? 'rgba(255,200,50,0.15)' : 'rgba(91,154,255,0.15)'}; color:${p.tipo_placa === 'branca' ? 'rgba(255,255,255,0.6)' : p.tipo_placa === 'amarela' ? '#f5d742' : '#5b9aff'};">${p.tipo_placa}</span>
                </td>
                <td style="padding:10px 16px; text-align:center;">
                    <span style="padding:2px 10px; border-radius:20px; font-size:11px; font-weight:600; background:${p.impressa ? 'rgba(22,163,74,0.15)' : 'rgba(255,200,50,0.15)'}; color:${p.impressa ? '#22c55e' : '#f5d742'};">${p.impressa ? '✅ Impressa' : '⏳ Pendente'}</span>
                </td>
            </tr>
        `).join('')

        if (paginacao) {
            paginacao.innerHTML = `
                <span>${dados.length} registro(s) — página ${pagina} de ${totalPaginas}</span>
                <div class="flex gap-2">
                    <button class="gp-pag-btn" style="padding:6px 12px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:11px; color:rgba(255,255,255,0.6); background:rgba(255,255,255,0.04); cursor:pointer; transition:all 0.3s; display:flex; align-items:center; gap:4px;${pagina === 1 ? 'opacity:0.4;cursor:not-allowed;' : ''}" data-pag="${pagina - 1}" ${pagina === 1 ? 'disabled' : ''}>◀ Anterior</button>
                    <button class="gp-pag-btn" style="padding:6px 12px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:11px; color:rgba(255,255,255,0.6); background:rgba(255,255,255,0.04); cursor:pointer; transition:all 0.3s; display:flex; align-items:center; gap:4px;${pagina === totalPaginas ? 'opacity:0.4;cursor:not-allowed;' : ''}" data-pag="${pagina + 1}" ${pagina === totalPaginas ? 'disabled' : ''}>Próxima ▶</button>
                </div>`
            paginacao.querySelectorAll('.gp-pag-btn:not([disabled])').forEach(btn => {
                btn.onclick = () => {
                    const novaPag = parseInt(btn.getAttribute('data-pag'))
                    renderizarTabelaGP(dados, novaPag)
                }
            })
        }
    }

    document.getElementById('gp-btn-buscar').onclick = carregarRegistros
    document.getElementById('gp-btn-limpar').onclick = () => {
        document.getElementById('gp-de').value = hoje
        document.getElementById('gp-ate').value = hoje
        document.getElementById('gp-desc').value = ''
        carregarRegistros()
    }

    document.getElementById('gp-btn-exportar').onclick = () => {
        if (!dadosAtuais.length) { alert('Nenhum dado para exportar'); return }
        const cols = ['criado_em', 'descricao', 'codigo', 'ean', 'preco', 'tipo_placa', 'impressa']
        const header = cols.join('\t')
        const rows = dadosAtuais.map(p => cols.map(c => {
            if (c === 'criado_em') return new Date(p[c]).toLocaleString('pt-BR')
            if (c === 'preco') return p[c] != null ? parseFloat(p[c]).toFixed(2).replace('.', ',') : ''
            if (c === 'impressa') return p[c] ? 'Sim' : 'Não'
            return p[c] || ''
        }).join('\t')).join('\n')

        const blob = new Blob(['\ufeff' + header + '\n' + rows], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'placas_' + new Date().toISOString().slice(0, 10) + '.csv'
        a.click()
    }

    carregarRegistros()
}
