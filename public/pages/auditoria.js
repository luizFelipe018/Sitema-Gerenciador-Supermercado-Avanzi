/* ═══════════════════════════════════════════════════════════════
   PÁGINA AUDITORIA — controle de quem fez as placas
   Design system v2 (public/design.css)
   ═══════════════════════════════════════════════════════════════ */

const AUDIT_FILTROS = { de: '', ate: '', usuario: '', acao: '' }
const AUD_PLACAS_FILTROS = { descricao: '', usuario: '', impressa: '' }
const AUD_PLACAS_LIMITE = 50

function carregarAuditoria() {
    if (!window.podeAcessar || !window.podeAcessar('auditoria')) {
        setConteudo(`
            <div class="ds-card ds-card-pad" style="max-width:520px; margin:60px auto; text-align:center">
                <div class="ds-empty">
                    <svg width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                    <div class="ds-empty-title">Acesso restrito</div>
                    <div class="ds-empty-text">A auditoria está disponível para gerentes e administradores.</div>
                </div>
            </div>
        `, 'Auditoria')
        return
    }

    setActive('btn-auditoria')

    setConteudo(`
        <div class="ds-page-head fade-in">
            <div>
                <div class="ds-page-eyebrow">Controle</div>
                <h1 class="ds-page-title">Auditoria</h1>
                <p class="ds-page-sub">Quem entrou no sistema, quem criou cada placa e o que foi alterado.</p>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap">
                <button id="aud-btn-exportar" class="ds-btn">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Exportar CSV
                </button>
                <button id="aud-btn-atualizar" class="ds-btn">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                    Atualizar
                </button>
            </div>
        </div>

        <!-- Filtros -->
        <div class="ds-toolbar fade-in">
            <div style="display:flex; align-items:center; gap:6px;">
                <label class="ds-label" for="aud-de">De</label>
                <input id="aud-de" type="date" class="ds-input" style="width:150px; height:34px;">
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
                <label class="ds-label" for="aud-ate">Até</label>
                <input id="aud-ate" type="date" class="ds-input" style="width:150px; height:34px;">
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
                <label class="ds-label" for="aud-usuario">Usuário</label>
                <select id="aud-usuario" class="ds-input" style="width:170px; height:34px;">
                    <option value="">Todos</option>
                </select>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
                <label class="ds-label" for="aud-acao">Ação</label>
                <select id="aud-acao" class="ds-input" style="width:200px; height:34px;">
                    <option value="">Todas</option>
                </select>
            </div>
            <div class="ds-toolbar-spacer"></div>
            <button id="aud-btn-limpar" class="ds-btn ds-btn-sm">Limpar filtros</button>
        </div>

        <!-- Resumo -->
        <div class="ds-grid ds-grid-4" style="margin-bottom:24px" id="aud-resumo-cards">
            <div class="ds-stat">
                <span class="ds-stat-label">Eventos no período</span>
                <div class="ds-stat-value" id="aud-total-eventos">—</div>
            </div>
            <div class="ds-stat">
                <span class="ds-stat-label">Placas criadas</span>
                <div class="ds-stat-value" id="aud-total-placas" style="color:var(--brand-2)">—</div>
            </div>
            <div class="ds-stat">
                <span class="ds-stat-label">Usuqários ativos</span>
                <div class="ds-stat-value" id="aud-total-usuarios">—</div>
            </div>
            <div class="ds-stat">
                <span class="ds-stat-label">Falhas de login</span>
                <div class="ds-stat-value" id="aud-total-falhas" style="color:var(--warn)">—</div>
            </div>
        </div>

        <div class="ds-grid" style="grid-template-columns:1.6fr 1fr; align-items:start">
            <!-- Eventos -->
            <div class="ds-card" style="overflow:hidden">
                <div class="ds-card-head">
                    <div class="ds-card-title">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Eventos
                    </div>
                    <span class="ds-chip" id="aud-contagem">—</span>
                </div>
                <div style="max-height:620px; overflow:auto">
                    <table class="ds-table-prod" id="aud-tabela">
                        <thead>
                            <tr>
                                <th style="width:118px;">Data/Hora</th>
                                <th style="width:140px;">Usuário</th>
                                <th style="width:165px;">Ação</th>
                                <th>Detalhe</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>

            <!-- Ranking -->
            <div class="ds-card">
                <div class="ds-card-head">
                    <div class="ds-card-title">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        Placas por usuário
                    </div>
                </div>
                <div class="ds-card-pad">
                    <div id="aud-placas-usuario" class="ds-list"></div>
                </div>
            </div>
        </div>

        <!-- Detalhe das placas: produto, preço, quem gerou e impressão -->
        <div class="ds-card" style="margin-top:24px; overflow:hidden">
            <div class="ds-card-head">
                <div class="ds-card-title">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
                    Detalhe das placas
                </div>
                <span class="ds-chip" id="aud-pl-contagem">—</span>
            </div>
            <div class="ds-toolbar">
                <div style="display:flex; align-items:center; gap:6px;">
                    <label class="ds-label" for="aud-pl-desc">Produto</label>
                    <input id="aud-pl-desc" type="text" class="ds-input" style="width:210px; height:34px;" placeholder="Buscar produto...">
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    <label class="ds-label" for="aud-pl-usuario">Quem gerou</label>
                    <input id="aud-pl-usuario" type="text" class="ds-input" style="width:150px; height:34px;" placeholder="Ex.: fabricio">
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    <label class="ds-label" for="aud-pl-status">Status</label>
                    <select id="aud-pl-status" class="ds-input" style="width:130px; height:34px;">
                        <option value="">Todos</option>
                        <option value="0">Pendente</option>
                        <option value="1">Impressa</option>
                    </select>
                </div>
                <span class="muted" style="font-size:11px">Período: filtros no topo da página</span>
                <div class="ds-toolbar-spacer"></div>
                <button id="aud-pl-limpar" class="ds-btn ds-btn-sm">Limpar</button>
            </div>
            <div id="aud-pl-tabela" style="max-height:520px; overflow:auto">
                <div class="ds-empty" style="padding:40px"><div class="ds-empty-text">Carregando…</div></div>
            </div>
            <div id="aud-pl-paginacao" style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:12px 16px; border-top:1px solid var(--border); font-size:12px; color:var(--text-3);"></div>
        </div>
    `, 'Auditoria')

    vincularEventosAuditoria()
    carregarResumoAuditoria()
    carregarEventosAuditoria()
    carregarDetalhePlacas(1)
}

function vincularEventosAuditoria() {
    const get = id => document.getElementById(id)

    ;['aud-de', 'aud-ate', 'aud-usuario', 'aud-acao'].forEach(id => {
        get(id)?.addEventListener('change', () => {
            AUDIT_FILTROS.de = get('aud-de').value
            AUDIT_FILTROS.ate = get('aud-ate').value
            AUDIT_FILTROS.usuario = get('aud-usuario').value
            AUDIT_FILTROS.acao = get('aud-acao').value
            carregarResumoAuditoria()
            carregarEventosAuditoria()
            carregarDetalhePlacas(1)
        })
    })

    get('aud-btn-limpar')?.addEventListener('click', () => {
        AUDIT_FILTROS.de = AUDIT_FILTROS.ate = AUDIT_FILTROS.usuario = AUDIT_FILTROS.acao = ''
        ;['aud-de', 'aud-ate'].forEach(id => { if (get(id)) get(id).value = '' })
        if (get('aud-usuario')) get('aud-usuario').value = ''
        if (get('aud-acao')) get('aud-acao').value = ''
        AUD_PLACAS_FILTROS.descricao = AUD_PLACAS_FILTROS.usuario = AUD_PLACAS_FILTROS.impressa = ''
        ;['aud-pl-desc', 'aud-pl-usuario', 'aud-pl-status'].forEach(id => { if (get(id)) get(id).value = '' })
        carregarResumoAuditoria()
        carregarEventosAuditoria()
        carregarDetalhePlacas(1)
    })

    get('aud-btn-atualizar')?.addEventListener('click', () => {
        carregarResumoAuditoria()
        carregarEventosAuditoria()
        carregarDetalhePlacas(1)
    })

    const aoFiltrarPlacas = () => {
        AUD_PLACAS_FILTROS.descricao = get('aud-pl-desc').value.trim()
        AUD_PLACAS_FILTROS.usuario = get('aud-pl-usuario').value.trim()
        AUD_PLACAS_FILTROS.impressa = get('aud-pl-status').value
        carregarDetalhePlacas(1)
    }
    ;['aud-pl-desc', 'aud-pl-usuario', 'aud-pl-status'].forEach(id => {
        get(id)?.addEventListener('change', aoFiltrarPlacas)
        if (id !== 'aud-pl-status') get(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') aoFiltrarPlacas() })
    })
    get('aud-pl-limpar')?.addEventListener('click', () => {
        AUD_PLACAS_FILTROS.descricao = AUD_PLACAS_FILTROS.usuario = AUD_PLACAS_FILTROS.impressa = ''
        ;['aud-pl-desc', 'aud-pl-usuario', 'aud-pl-status'].forEach(id => { if (get(id)) get(id).value = '' })
        carregarDetalhePlacas(1)
    })

    get('aud-btn-exportar')?.addEventListener('click', () => {
        const params = new URLSearchParams()
        Object.entries(AUDIT_FILTROS).forEach(([k, v]) => { if (v) params.set(k, v) })
        const token = localStorage.getItem('token')
        // download do CSV autenticado
        fetch(API + '/auditoria/exportar?' + params.toString(), {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`
                a.click()
                URL.revokeObjectURL(url)
            })
            .catch(() => alert('Erro ao exportar.'))
    })
}

async function carregarDetalhePlacas(pagina = 1) {
    const alvo = document.getElementById('aud-pl-tabela')
    if (!alvo) return
    alvo.innerHTML = '<div class="ds-empty" style="padding:40px"><div class="ds-empty-text">Carregando…</div></div>'

    try {
        const params = new URLSearchParams()
        if (AUDIT_FILTROS.de) params.set('de', AUDIT_FILTROS.de)
        if (AUDIT_FILTROS.ate) params.set('ate', AUDIT_FILTROS.ate)
        Object.entries(AUD_PLACAS_FILTROS).forEach(([k, v]) => { if (v) params.set(k, v) })
        params.set('paginado', '1')
        params.set('pagina', String(pagina))
        params.set('limite', String(AUD_PLACAS_LIMITE))

        const res = await fetch(API + '/log-placas?' + params.toString(), { headers: authHeaders() })
        const out = await res.json()
        if (!res.ok) throw new Error(out.error || 'Erro ao carregar')

        const total = Number(out.total || 0)
        const paginas = out.paginas || 1
        const chip = document.getElementById('aud-pl-contagem')
        if (chip) chip.textContent = `${total.toLocaleString('pt-BR')} placa(s)`
        const linhas = out.rows || []

        if (!linhas.length) {
            alvo.innerHTML = '<div class="ds-empty" style="padding:50px"><div class="ds-empty-title">Nenhuma placa encontrada</div><div class="ds-empty-text">Ajuste os filtros ou o período acima.</div></div>'
        } else {
            alvo.innerHTML = `
                <table class="ds-table-prod">
                    <thead><tr>
                        <th style="width:118px;">Data/Hora</th>
                        <th>Produto</th>
                        <th style="width:100px; text-align:right;">Preço</th>
                        <th style="width:140px;">Quem gerou</th>
                        <th style="width:100px; text-align:center;">Tipo</th>
                        <th style="width:130px; text-align:center;">Status</th>
                    </tr></thead>
                    <tbody>
                    ${linhas.map(p => {
                        const impressa = Number(p.impressa) === 1
                        const tipo = ({ pequena: 'Pequena', media: 'Média', grande: 'Grande', 'media-pack': 'Media Pack' })[p.tipo_placa] || p.tipo_placa || '—'
                        const quando = impressa && p.impressa_em
                            ? `<div class="muted" style="font-size:10px; margin-top:2px">${audEsc(audDataHora(p.impressa_em))}</div>` : ''
                        return `
                        <tr>
                            <td class="mono muted" style="white-space:nowrap">${audEsc(audDataHora(p.criado_em))}</td>
                            <td class="strong">${audEsc(p.descricao || '—')}</td>
                            <td class="preco" style="text-align:right; font-weight:600">${p.preco != null ? 'R$ ' + Number(p.preco).toFixed(2).replace('.', ',') : '—'}</td>
                            <td class="muted">${audEsc(p.usuario_nome || p.usuario || '—')}</td>
                            <td style="text-align:center"><span class="ds-badge" style="background:var(--surface-3); color:var(--text-2)">${audEsc(tipo)}</span></td>
                            <td style="text-align:center">
                                <span class="ds-badge" style="background:${impressa ? 'var(--ok-soft)' : 'var(--warn-soft)'}; color:${impressa ? 'var(--ok)' : 'var(--warn)'}">${impressa ? 'Impressa' : 'Pendente'}</span>
                                ${quando}
                            </td>
                        </tr>`
                    }).join('')}
                    </tbody>
                </table>`
        }

        const inicio = total ? ((pagina - 1) * AUD_PLACAS_LIMITE) + 1 : 0
        const fim = Math.min(pagina * AUD_PLACAS_LIMITE, total)
        const pag = document.getElementById('aud-pl-paginacao')
        if (pag) {
            pag.innerHTML = `
                <span>${total ? `${inicio.toLocaleString('pt-BR')}–${fim.toLocaleString('pt-BR')} de ${total.toLocaleString('pt-BR')}` : '0 registro(s)'} · página ${pagina} de ${paginas}</span>
                <div style="display:flex; gap:8px">
                    <button class="ds-btn ds-btn-sm" id="aud-pl-anterior" ${pagina <= 1 ? 'disabled' : ''}>◀ Anterior</button>
                    <button class="ds-btn ds-btn-sm" id="aud-pl-proxima" ${pagina >= paginas ? 'disabled' : ''}>Próxima ▶</button>
                </div>`
            const ant = document.getElementById('aud-pl-anterior')
            const prox = document.getElementById('aud-pl-proxima')
            if (ant) ant.onclick = () => carregarDetalhePlacas(pagina - 1)
            if (prox) prox.onclick = () => carregarDetalhePlacas(pagina + 1)
        }
    } catch (e) {
        alvo.innerHTML = `<div class="ds-empty" style="padding:40px"><div class="ds-empty-title">Erro ao carregar</div><div class="ds-empty-text">${audEsc(e.message)}</div></div>`
    }
}

function audQuery() {
    const params = new URLSearchParams()
    Object.entries(AUDIT_FILTROS).forEach(([k, v]) => { if (v) params.set(k, v) })
    return params.toString()
}

async function carregarEventosAuditoria() {
    const tbody = document.querySelector('#aud-tabela tbody')
    if (!tbody) return
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:28px; color:var(--text-3); font-size:12.5px;">Carregando…</td></tr>`

    try {
        const res = await fetch(API + '/auditoria?' + audQuery() + '&limite=200', { headers: authHeaders() })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Erro ao carregar')

        const chip = document.getElementById('aud-contagem')
        if (chip) chip.textContent = `${data.total.toLocaleString('pt-BR')} evento(s)`

        // Preenche selects de usuário e ação
        preencherSelectUsuarios(data.porUsuario || [])
        preencherSelectAcoes(data.acoes || [], data.rotulos || {})

        if (!data.rows.length) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:40px; color:var(--text-3); font-size:12.5px;">Nenhum evento no período.</td></tr>`
            return
        }

        tbody.innerHTML = data.rows.map(r => {
            const cor = audCorAcao(r.acao)
            const rotulo = (data.rotulos || {})[r.acao] || r.acao
            // evita repetir a ação no detalhe
            const desc = String(r.descricao || '').trim()
            const repetir = desc.toLowerCase() === String(rotulo).toLowerCase()
                || desc.toLowerCase() === String(rotulo).toLowerCase() + '.'
            const detalhes = audParseDetalhes(r.detalhes)
            const itens = Array.isArray(detalhes?.itens) ? detalhes.itens : []
            const qtd = Number(r.quantidade || itens.length || 0)
            const ehPlaca = ['criar_placas', 'salvar_placas', 'importar_placas'].includes(r.acao)
            const extras = []
            if (r.tipo_placa) extras.push(`tipo: ${r.tipo_placa}`)
            if (qtd) extras.push(ehPlaca
                ? (qtd === 1 ? '1 placa criada' : `${qtd.toLocaleString('pt-BR')} placas criadas`)
                : `${qtd.toLocaleString('pt-BR')} item(ns)`)
            if (r.ip) extras.push(r.ip)
            const itensHtml = itens.length ? `
                <div style="margin-top:7px; display:flex; flex-direction:column; gap:3px; padding:7px 9px; border-radius:8px; background:var(--surface-2)">
                    ${itens.slice(0, 20).map((item, i) => `
                        <div style="font-size:11px; color:var(--text-1); line-height:1.35">
                            <span class="muted">${i + 1}.</span>
                            <strong>${audEsc(item.descricao || '—')}</strong>
                            <span class="muted mono">· cód. ${audEsc(item.codigo || item.ean || '—')}</span>
                            <span class="mono" style="color:var(--brand-text)">· ${audPreco(item.preco)}</span>
                        </div>`).join('')}
                    ${itens.length > 20 ? `<div class="muted" style="font-size:10px">+ ${itens.length - 20} item(ns)…</div>` : ''}
                </div>` : ''
            return `
            <tr>
                <td class="mono muted" style="white-space:nowrap">${audDataHora(r.criado_em)}</td>
                <td>
                    <div class="strong" style="font-size:12.5px">${audEsc(r.nome || r.usuario)}</div>
                    <div class="muted" style="font-size:11px">${audEsc(r.usuario)}${r.cargo ? ' · ' + audEsc(r.cargo) : ''}</div>
                </td>
                <td><span class="ds-badge" style="background:${cor.bg}; color:${cor.fg}">${audEsc(rotulo)}</span></td>
                <td>
                    ${repetir ? '' : `<div style="font-size:12.5px">${audEsc(desc)}</div>`}
                    ${extras.length ? `<div class="muted mono" style="font-size:10.5px; margin-top:2px">${audEsc(extras.join(' · '))}</div>` : ''}
                    ${itensHtml}
                </td>
            </tr>`
        }).join('')
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:28px; color:var(--danger); font-size:12.5px;">${audEsc(e.message)}</td></tr>`
    }
}

async function carregarResumoAuditoria() {
    try {
        const params = new URLSearchParams()
        if (AUDIT_FILTROS.de) params.set('de', AUDIT_FILTROS.de)
        if (AUDIT_FILTROS.ate) params.set('ate', AUDIT_FILTROS.ate)

        const res = await fetch(API + '/auditoria/resumo?' + params.toString(), { headers: authHeaders() })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Erro ao carregar')

        const eventos = (data.porUsuario || []).reduce((s, u) => s + Number(u.eventos || 0), 0)
        const placas = (data.porUsuario || []).reduce((s, u) => s + Number(u.placas || 0), 0)
        const falhas = (data.porAcao || []).find(a => a.acao === 'login_falha')

        const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v }
        set('aud-total-eventos', eventos.toLocaleString('pt-BR'))
        set('aud-total-placas', placas.toLocaleString('pt-BR'))
        set('aud-total-usuarios', (data.porUsuario || []).length.toLocaleString('pt-BR'))
        set('aud-total-falhas', String(Number(falhas?.total || 0)))

        // Placas por usuário (atribuição direta em log_placas)
        const cont = document.getElementById('aud-placas-usuario')
        if (cont) {
            const linhas = data.placasPorUsuario || []
            if (!linhas.length) {
                cont.innerHTML = '<div class="ds-empty" style="padding:32px 8px"><div class="ds-empty-text">Nenhuma placa com usuário registrado ainda.</div></div>'
            } else {
                const max = Math.max(...linhas.map(l => Number(l.total) || 0), 1)
                cont.innerHTML = linhas.slice(0, 12).map(l => {
                    const pct = (Number(l.total) / max) * 100
                    const cor = l.tipo_placa === 'pequena' ? 'var(--brand-2)' : l.tipo_placa === 'media' ? 'var(--info)' : 'var(--text-3)'
                    return `
                    <div class="ds-list-item">
                        <span class="ds-list-name" title="${audEsc(l.usuario_nome || l.usuario)}">${audEsc(l.usuario_nome || l.usuario)}</span>
                        <span class="ds-list-val" style="color:${cor}">${Number(l.total).toLocaleString('pt-BR')}</span>
                        <div class="ds-list-track">
                            <i class="ds-list-fill" style="background:${cor}" data-w="${pct.toFixed(1)}"></i>
                        </div>
                        <div class="muted" style="grid-column:1/-1; font-size:10.5px; margin-top:-4px">${audEsc(l.tipo_placa || '—')} · ${Number(l.impressas || 0).toLocaleString('pt-BR')} impressa(s)</div>
                    </div>`
                }).join('')

                requestAnimationFrame(() => {
                    cont.querySelectorAll('.ds-list-fill[data-w]').forEach((b, i) => {
                        setTimeout(() => { b.style.width = b.dataset.w + '%' }, 60 + i * 45)
                    })
                })
            }
        }
    } catch (e) {
        console.error(e)
    }
}

function preencherSelectUsuarios(usuarios) {
    const sel = document.getElementById('aud-usuario')
    if (!sel || sel.options.length > 1) return
    usuarios.forEach(u => {
        const opt = document.createElement('option')
        opt.value = u.usuario
        opt.textContent = u.nome ? `${u.nome} (${u.usuario})` : u.usuario
        sel.appendChild(opt)
    })
}

function preencherSelectAcoes(acoes, rotulos) {
    const sel = document.getElementById('aud-acao')
    if (!sel || sel.options.length > 1) return
    acoes.forEach(a => {
        const opt = document.createElement('option')
        opt.value = a
        opt.textContent = rotulos[a] || a
        sel.appendChild(opt)
    })
}

function audCorAcao(acao) {
    if (acao === 'login') return { bg: 'var(--ok-soft)', fg: 'var(--ok)' }
    if (acao === 'login_falha') return { bg: 'var(--danger-soft)', fg: 'var(--danger)' }
    if (acao === 'logout') return { bg: 'var(--surface-3)', fg: 'var(--text-2)' }
    if (acao === 'criar_placas' || acao === 'salvar_placas' || acao === 'importar_placas') {
        return { bg: 'var(--brand-soft)', fg: 'var(--brand-text)' }
    }
    if (acao === 'imprimir_placas') return { bg: 'var(--info-soft)', fg: 'var(--info)' }
    if (acao && acao.includes('excluir') || acao === 'zerar_dashboard' || acao === 'limpar_placas') {
        return { bg: 'var(--danger-soft)', fg: 'var(--danger)' }
    }
    if (acao && acao.includes('usuario')) return { bg: 'var(--warn-soft)', fg: 'var(--warn)' }
    return { bg: 'var(--surface-3)', fg: 'var(--text-2)' }
}

function audDataHora(valor) {
    if (!valor) return '—'
    const d = new Date(String(valor).replace(' ', 'T'))
    if (isNaN(d.getTime())) return String(valor)
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function audEsc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]))
}

function audParseDetalhes(v) {
    if (!v) return null
    if (typeof v === 'object') return v
    try { return JSON.parse(v) } catch { return null }
}

function audPreco(v) {
    if (v == null || v === '') return '—'
    const n = Number(v)
    return Number.isFinite(n) ? 'R$ ' + n.toFixed(2).replace('.', ',') : audEsc(v)
}
