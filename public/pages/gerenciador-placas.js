/* ═══════════════════════════════════════════════════════════════
   HISTÓRICO DE PLACAS — produto, preço, quem gerou e impressão
   Design system v2 (public/design.css)
   ═══════════════════════════════════════════════════════════════ */

const GP_LIMITE = 50

async function carregarGerenciadorPlacas() {
    setActive('btn-gerenciador-placas')

    const hoje = new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-')

    setConteudo(`
        <div class="ds-page-head fade-in">
            <div>
                <div class="ds-page-eyebrow">Placas</div>
                <h1 class="ds-page-title">Histórico de Placas</h1>
                <p class="ds-page-sub">Qual produto gerou cada placa, o preço usado, quem gerou e se foi impressa.</p>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap">
                <button id="gp-btn-exportar" class="ds-btn">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Exportar CSV
                </button>
                <button id="gp-btn-atualizar" class="ds-btn">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                    Atualizar
                </button>
            </div>
        </div>

        <div class="ds-toolbar fade-in">
            <div style="display:flex; align-items:center; gap:6px;">
                <label class="ds-label" for="gp-de">De</label>
                <input id="gp-de" type="date" class="ds-input" style="width:150px; height:34px;" value="${hoje}">
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
                <label class="ds-label" for="gp-ate">Até</label>
                <input id="gp-ate" type="date" class="ds-input" style="width:150px; height:34px;" value="${hoje}">
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
                <label class="ds-label" for="gp-desc">Produto</label>
                <input id="gp-desc" type="text" class="ds-input" style="width:210px; height:34px;" placeholder="Buscar produto...">
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
                <label class="ds-label" for="gp-usuario">Usuário</label>
                <input id="gp-usuario" type="text" class="ds-input" style="width:150px; height:34px;" placeholder="Ex.: fabricio">
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
                <label class="ds-label" for="gp-status">Status</label>
                <select id="gp-status" class="ds-input" style="width:130px; height:34px;">
                    <option value="">Todos</option>
                    <option value="0">Pendente</option>
                    <option value="1">Impressa</option>
                </select>
            </div>
            <div class="ds-toolbar-spacer"></div>
            <button id="gp-btn-limpar" class="ds-btn ds-btn-sm">Limpar filtros</button>
        </div>

        <div class="ds-grid ds-grid-3" style="margin-bottom:20px">
            <div class="ds-stat">
                <span class="ds-stat-label">Placas no período</span>
                <div class="ds-stat-value" id="gp-total">—</div>
            </div>
            <div class="ds-stat">
                <span class="ds-stat-label">Impressas</span>
                <div class="ds-stat-value" id="gp-impressas" style="color:var(--ok)">—</div>
            </div>
            <div class="ds-stat">
                <span class="ds-stat-label">Pendentes</span>
                <div class="ds-stat-value" id="gp-pendentes" style="color:var(--warn)">—</div>
            </div>
        </div>

        <div class="ds-card" style="overflow:hidden">
            <div class="ds-card-head">
                <div class="ds-card-title">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
                    Registros
                </div>
                <span class="ds-chip" id="gp-contador">—</span>
            </div>
            <div id="gp-tabela-wrapper" style="max-height:620px; overflow:auto">
                <div class="ds-empty" style="padding:40px"><div class="ds-empty-text">Carregando…</div></div>
            </div>
            <div id="gp-paginacao" style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:12px 16px; border-top:1px solid var(--border); font-size:12px; color:var(--text-3);"></div>
        </div>
    `, 'Histórico de Placas')

    let pagina = 1
    let dados = []
    let totalPaginas = 1

    const get = id => document.getElementById(id)

    function filtros() {
        const params = new URLSearchParams()
        if (get('gp-de').value) params.set('de', get('gp-de').value)
        if (get('gp-ate').value) params.set('ate', get('gp-ate').value)
        if (get('gp-desc').value.trim()) params.set('descricao', get('gp-desc').value.trim())
        if (get('gp-usuario').value.trim()) params.set('usuario', get('gp-usuario').value.trim())
        if (get('gp-status').value) params.set('impressa', get('gp-status').value)
        return params
    }

    async function carregar(destino = 1) {
        pagina = destino
        const wrapper = get('gp-tabela-wrapper')
        wrapper.innerHTML = '<div class="ds-empty" style="padding:40px"><div class="ds-empty-text">Carregando…</div></div>'

        try {
            const params = filtros()
            params.set('paginado', '1')
            params.set('pagina', String(pagina))
            params.set('limite', String(GP_LIMITE))

            const res = await fetch(API + '/log-placas?' + params.toString(), { headers: authHeaders() })
            const out = await res.json()
            if (!res.ok) throw new Error(out.error || 'Erro ao carregar')

            dados = out.rows || []
            totalPaginas = out.paginas || 1

            const num = n => Number(n || 0).toLocaleString('pt-BR')
            get('gp-total').textContent = num(out.total)
            get('gp-impressas').textContent = num(out.impressas)
            get('gp-pendentes').textContent = num(out.pendentes)
            get('gp-contador').textContent = `${num(out.total)} registro(s)`

            if (!dados.length) {
                wrapper.innerHTML = '<div class="ds-empty" style="padding:50px"><div class="ds-empty-title">Nenhuma placa encontrada</div><div class="ds-empty-text">Ajuste os filtros ou escolha outro período.</div></div>'
            } else {
                wrapper.innerHTML = `
                    <table class="ds-table-prod">
                        <thead><tr>
                            <th>Data/Hora</th>
                            <th>Produto</th>
                            <th>Código / EAN</th>
                            <th style="text-align:right">Preço</th>
                            <th>Quem gerou</th>
                            <th style="text-align:center">Tipo</th>
                            <th style="text-align:center">Status</th>
                        </tr></thead>
                        <tbody>
                        ${dados.map(p => {
                            const impressa = Number(p.impressa) === 1
                            const dataHora = gpDataHora(p.criado_em)
                            const quando = impressa && p.impressa_em ? `<div class="muted" style="font-size:10px; margin-top:2px">${gpDataHora(p.impressa_em)}</div>` : ''
                            const tituloTipo = ({ pequena: 'Pequena', media: 'Média', grande: 'Grande', 'media-pack': 'Media Pack' })[p.tipo_placa] || p.tipo_placa || '—'
                            return `
                            <tr>
                                <td class="mono muted" style="white-space:nowrap">${gpEsc(dataHora)}</td>
                                <td class="strong">${gpEsc(p.descricao || '—')}</td>
                                <td class="mono muted">${gpEsc(p.codigo || p.ean || '—')}</td>
                                <td class="preco" style="text-align:right; font-weight:600">${p.preco != null ? 'R$ ' + Number(p.preco).toFixed(2).replace('.', ',') : '—'}</td>
                                <td class="muted">${gpEsc(p.usuario_nome || p.usuario || '—')}</td>
                                <td style="text-align:center"><span class="ds-badge" style="background:var(--surface-3); color:var(--text-2)">${gpEsc(tituloTipo)}</span></td>
                                <td style="text-align:center">
                                    <span class="ds-badge" style="background:${impressa ? 'var(--ok-soft)' : 'var(--warn-soft)'}; color:${impressa ? 'var(--ok)' : 'var(--warn)'}">${impressa ? 'Impressa' : 'Pendente'}</span>
                                    ${quando}
                                </td>
                            </tr>`
                        }).join('')}
                        </tbody>
                    </table>`
            }

            const total = Number(out.total || 0)
            get('gp-paginacao').innerHTML = `
                <span>${total ? `${((pagina - 1) * GP_LIMITE) + 1}–${Math.min(pagina * GP_LIMITE, total)} de ${total.toLocaleString('pt-BR')}` : '0 registro(s)'} · página ${pagina} de ${totalPaginas}</span>
                <div style="display:flex; gap:8px">
                    <button class="ds-btn ds-btn-sm" id="gp-anterior" ${pagina <= 1 ? 'disabled' : ''}>◀ Anterior</button>
                    <button class="ds-btn ds-btn-sm" id="gp-proxima" ${pagina >= totalPaginas ? 'disabled' : ''}>Próxima ▶</button>
                </div>`
            const ant = get('gp-anterior')
            const prox = get('gp-proxima')
            if (ant) ant.onclick = () => carregar(pagina - 1)
            if (prox) prox.onclick = () => carregar(pagina + 1)
        } catch (e) {
            wrapper.innerHTML = `<div class="ds-empty" style="padding:40px"><div class="ds-empty-title">Erro ao carregar</div><div class="ds-empty-text">${gpEsc(e.message)}</div></div>`
        }
    }

    ;['gp-de', 'gp-ate', 'gp-desc', 'gp-usuario', 'gp-status'].forEach(id => {
        get(id).addEventListener('change', () => carregar(1))
    })
    get('gp-desc').addEventListener('keydown', e => { if (e.key === 'Enter') carregar(1) })
    get('gp-usuario').addEventListener('keydown', e => { if (e.key === 'Enter') carregar(1) })
    get('gp-btn-atualizar').onclick = () => carregar(pagina)
    get('gp-btn-limpar').onclick = () => {
        get('gp-de').value = ''
        get('gp-ate').value = ''
        get('gp-desc').value = ''
        get('gp-usuario').value = ''
        get('gp-status').value = ''
        carregar(1)
    }

    get('gp-btn-exportar').onclick = async () => {
        const btn = get('gp-btn-exportar')
        const original = btn.innerHTML
        btn.disabled = true
        btn.textContent = 'Exportando…'
        try {
            const params = filtros()
            params.set('paginado', '1')
            params.set('limite', '200')
            params.set('pagina', '1')
            const primeira = await (await fetch(API + '/log-placas?' + params.toString(), { headers: authHeaders() })).json()
            const linhas = [...(primeira.rows || [])]
            const paginas = Math.min(primeira.paginas || 1, 50) // até 10.000 registros
            for (let p = 2; p <= paginas; p++) {
                params.set('pagina', String(p))
                const out = await (await fetch(API + '/log-placas?' + params.toString(), { headers: authHeaders() })).json()
                linhas.push(...(out.rows || []))
            }

            const colunas = [
                ['Data/Hora', p => gpDataHora(p.criado_em)],
                ['Produto', p => p.descricao || ''],
                ['Código', p => p.codigo || ''],
                ['EAN', p => p.ean || ''],
                ['Preço', p => p.preco != null ? Number(p.preco).toFixed(2).replace('.', ',') : ''],
                ['Quem gerou', p => p.usuario_nome || p.usuario || ''],
                ['Tipo', p => p.tipo_placa || ''],
                ['Impressa', p => Number(p.impressa) === 1 ? 'Sim' : 'Não'],
                ['Impressa em', p => p.impressa_em ? gpDataHora(p.impressa_em) : '']
            ]
            const csv = [
                colunas.map(c => c[0]).join(';'),
                ...linhas.map(p => colunas.map(c => `"${String(c[1](p) ?? '').replace(/"/g, '""')}"`).join(';'))
            ].join('\r\n')

            const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
            const a = document.createElement('a')
            a.href = url
            a.download = 'historico-placas-' + new Date().toISOString().slice(0, 10) + '.csv'
            a.click()
            URL.revokeObjectURL(url)
        } catch (e) {
            await window.aviso('Não foi possível exportar o histórico: ' + e.message, { titulo: 'Erro', tipo: 'erro' })
        } finally {
            btn.disabled = false
            btn.innerHTML = original
        }
    }

    carregar(1)
}

function gpDataHora(valor) {
    if (!valor) return '—'
    const d = new Date(String(valor).replace(' ', 'T'))
    if (isNaN(d.getTime())) return String(valor)
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function gpEsc(valor) {
    return String(valor == null ? '' : valor).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]))
}
