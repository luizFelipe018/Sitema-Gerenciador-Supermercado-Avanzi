/* ═══════════════════════════════════════════════════════════════
   LISTAS DE PREÇO — montagem do cartaz de ofertas para o designer
   Fluxo: criar lista → adicionar produtos (unitário ou família
   inteira) → revisar → finalizar → exportar Excel / imprimir.
   Design system v2 (public/design.css)
   ═══════════════════════════════════════════════════════════════ */

let listaAtiva = null
let selecaoProduto = null   // produto escolhido na busca
let sugestoesAtuais = []
let sugestaoIndex = -1

// ── TOASTS ──────────────────────────────────────────────
function toast(mensagem, tipo = 'info') {
    let cont = document.getElementById('ds-toasts')
    if (!cont) {
        cont = document.createElement('div')
        cont.id = 'ds-toasts'
        cont.className = 'ds-toasts'
        document.body.appendChild(cont)
    }
    const icones = {
        ok:    '<polyline points="20 6 9 17 4 12"/>',
        erro:  '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
        aviso: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
        info:  '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
    }
    const el = document.createElement('div')
    el.className = `ds-toast is-${tipo}`
    el.innerHTML = `
        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             style="flex:0 0 auto;color:var(--${tipo === 'ok' ? 'ok' : tipo === 'erro' ? 'danger' : tipo === 'aviso' ? 'warn' : 'info'})">${icones[tipo] || icones.info}</svg>
        <span>${String(mensagem).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))}</span>`
    cont.appendChild(el)
    setTimeout(() => {
        el.style.transition = 'opacity .25s, transform .25s'
        el.style.opacity = '0'
        el.style.transform = 'translateX(16px)'
        setTimeout(() => el.remove(), 260)
    }, 3200)
}

// ═══════════════════════════════════════════════════════════════
// PÁGINA
// ═══════════════════════════════════════════════════════════════
async function carregarListas() {
    setActive('btn-listas')

    setConteudo(`
        <div class="ds-page-head fade-in">
            <div>
                <div class="ds-page-eyebrow">Panfleto de ofertas</div>
                <h1 class="ds-page-title">Listas de preço</h1>
                <p class="ds-page-sub">Monte a lista de produtos do cartaz e envie o Excel para o designer.</p>
            </div>
            <button id="btn-nova-lista" class="ds-btn ds-btn-primary">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Nova lista
            </button>
        </div>

        <div class="ds-grid" style="grid-template-columns:300px minmax(0,1fr); align-items:start" id="listas-grid">
            <!-- Coluna: listas -->
            <div class="ds-card" style="overflow:hidden">
                <div class="ds-card-head">
                    <div class="ds-card-title">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Minhas listas
                    </div>
                    <span class="ds-chip" id="lista-contagem">—</span>
                </div>
                <div style="padding:12px 14px; border-bottom:1px solid var(--border)">
                    <input id="filtro-listas" type="text" class="ds-input" placeholder="Filtrar por nome..." style="height:32px; font-size:12px;">
                </div>
                <div id="historico-listas" style="max-height:560px; overflow-y:auto"></div>
            </div>

            <!-- Coluna: lista ativa -->
            <div id="area-lista-ativa">
                <div class="ds-card ds-card-pad" style="text-align:center; padding:56px 24px;">
                    <div class="ds-empty" style="padding:0">
                        <svg width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.4" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                        <div class="ds-empty-title">Nenhuma lista aberta</div>
                        <div class="ds-empty-text">Selecione uma lista na coluna ao lado ou crie uma nova para começar a montar o panfleto.</div>
                    </div>
                </div>
            </div>
        </div>
    `, 'Listas de Preços')

    document.getElementById('btn-nova-lista').onclick = abrirModalNovaLista
    document.getElementById('filtro-listas').addEventListener('input', e => {
        renderHistoricoListas(e.target.value.trim().toLowerCase())
    })

    // em telas estreitas as colunas se empilham
    const ajustarGrid = () => {
        const grid = document.getElementById('listas-grid')
        if (!grid) return
        grid.style.gridTemplateColumns = window.innerWidth < 1000 ? 'minmax(0,1fr)' : '300px minmax(0,1fr)'
    }
    ajustarGrid()
    window.addEventListener('resize', ajustarGrid)

    await atualizarHistorico()
}

// ── HISTÓRICO ───────────────────────────────────────────
let todasListas = []

async function atualizarHistorico() {
    const el = document.getElementById('historico-listas')
    if (!el) return
    try {
        const res = await fetch(API + '/listas', { headers: authHeaders() })
        const listas = await res.json()
        if (!Array.isArray(listas)) throw new Error('resposta inválida')
        todasListas = listas
        const filtro = document.getElementById('filtro-listas')?.value.trim().toLowerCase() || ''
        renderHistoricoListas(filtro)
    } catch {
        el.innerHTML = `<div class="ds-empty" style="padding:28px 12px"><div class="ds-empty-title" style="color:var(--danger)">Erro ao carregar as listas</div></div>`
    }
}

function renderHistoricoListas(filtro = '') {
    const el = document.getElementById('historico-listas')
    if (!el) return

    const listas = todasListas.filter(l => !filtro || String(l.nome).toLowerCase().includes(filtro))
    const chip = document.getElementById('lista-contagem')
    if (chip) chip.textContent = `${listas.length}`

    if (!listas.length) {
        el.innerHTML = `<div class="ds-empty" style="padding:28px 12px">
            <div class="ds-empty-text">${filtro ? 'Nenhuma lista com esse nome.' : 'Nenhuma lista criada ainda.'}</div>
        </div>`
        return
    }

    el.innerHTML = listas.map(l => {
        const dt = new Date(l.criado_em)
        const data = isNaN(dt.getTime()) ? '' : dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
        const hora = isNaN(dt.getTime()) ? '' : dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        const ativo = listaAtiva?.id === l.id
        const itens = Number(l.total_itens || 0)
        const valor = Number(l.valor_total || 0)

        return `
        <div class="ds-lista-item ${ativo ? 'is-ativa' : ''}" data-id="${l.id}">
            <div style="min-width:0; flex:1">
                <div style="display:flex; align-items:center; gap:6px">
                    <p class="ds-lista-nome">${String(l.nome).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))}</p>
                    ${l.finalizada ? '<span class="ds-chip ds-chip-ok">Finalizada</span>' : '<span class="ds-chip ds-chip-warn">Rascunho</span>'}
                </div>
                <p class="ds-lista-meta">
                    ${data} às ${hora} · ${itens} item(ns) · R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                ${l.data_oferta ? `<p class="ds-lista-meta">Oferta em: ${new Date(l.data_oferta).toLocaleDateString('pt-BR')}</p>` : ''}
            </div>
            <button class="ds-icon-btn btn-excluir-lista" data-id="${l.id}" title="Excluir lista">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
        </div>`
    }).join('')

    el.querySelectorAll('.ds-lista-item').forEach(item => {
        item.onclick = (e) => {
            if (e.target.closest('.btn-excluir-lista')) return
            const l = todasListas.find(x => x.id === parseInt(item.getAttribute('data-id')))
            if (l) abrirLista({ ...l, pai_id: l.lista_pai_id })
        }
    })

    el.querySelectorAll('.btn-excluir-lista').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation()
            const okExcluir = await avisoConfirmacao('Excluir esta lista e todos os seus itens?', { titulo: 'Excluir lista?', tipo: 'aviso', okText: 'Excluir', cancelText: 'Cancelar' })
            if (!okExcluir) return
            const res = await fetch(API + `/listas/${btn.getAttribute('data-id')}`, { method: 'DELETE', headers: authHeaders() })
            if (res.ok) {
                if (listaAtiva?.id === parseInt(btn.getAttribute('data-id'))) {
                    listaAtiva = null
                    document.getElementById('area-lista-ativa').innerHTML = `
                        <div class="ds-card ds-card-pad" style="text-align:center; padding:56px 24px;">
                            <div class="ds-empty" style="padding:0">
                                <div class="ds-empty-title">Nenhuma lista aberta</div>
                                <div class="ds-empty-text">Selecione uma lista ou crie uma nova.</div>
                            </div>
                        </div>`
                }
                toast('Lista excluída', 'ok')
                await atualizarHistorico()
            } else {
                toast('Erro ao excluir a lista', 'erro')
            }
        }
    })
}

// ── NOVA LISTA ──────────────────────────────────────────
function abrirModalNovaLista() {
    const modal = document.createElement('div')
    modal.className = 'ds-modal-overlay'
    modal.innerHTML = `
        <div class="ds-modal" style="width:420px">
            <div class="ds-modal-head">
                <h3>Nova lista de ofertas</h3>
                <button class="ds-icon-btn" data-fechar>
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            <div class="ds-modal-body">
                <div class="ds-field">
                    <label class="ds-label" for="novo-nome">Nome da lista</label>
                    <input id="novo-nome" type="text" class="ds-input" placeholder="Ex: Ofertas Semana 42 -保湿" autocomplete="off">
                </div>
                <div class="ds-field">
                    <label class="ds-label" for="novo-data">Data da oferta</label>
                    <input id="novo-data" type="date" class="ds-input">
                </div>
            </div>
            <div class="ds-modal-foot">
                <button class="ds-btn" data-fechar style="flex:1">Cancelar</button>
                <button class="ds-btn ds-btn-primary" id="novo-criar" style="flex:1">Criar lista</button>
            </div>
        </div>`
    document.body.appendChild(modal)

    const hoje = new Date()
    const offset = hoje.getTimezoneOffset()
    modal.querySelector('#novo-data').value = new Date(hoje.getTime() - offset * 60000).toISOString().slice(0, 10)

    const fechar = () => modal.remove()
    modal.querySelectorAll('[data-fechar]').forEach(b => b.onclick = fechar)
    modal.onclick = e => { if (e.target === modal) fechar() }

    const criar = async () => {
        const nome = modal.querySelector('#novo-nome').value.trim()
        if (!nome) { toast('Informe o nome da lista', 'aviso'); return }
        const data = modal.querySelector('#novo-data').value
        const res = await fetch(API + '/listas', {
            method: 'POST', headers: authHeaders(),
            body: JSON.stringify({ nome, data_oferta: data || null })
        })
        if (!res.ok) { toast('Erro ao criar a lista', 'erro'); return }
        const lista = await res.json()
        fechar()
        toast('Lista criada', 'ok')
        await atualizarHistorico()
        abrirLista({ ...lista, finalizada: false })
    }
    modal.querySelector('#novo-criar').onclick = criar
    modal.querySelector('#novo-nome').onkeydown = e => { if (e.key === 'Enter') criar() }
    modal.querySelector('#novo-nome').focus()
}

// ═══════════════════════════════════════════════════════════════
// LISTA ATIVA
// ═══════════════════════════════════════════════════════════════
async function abrirLista(lista) {
    listaAtiva = lista
    selecaoProduto = null
    await atualizarHistorico()

    const area = document.getElementById('area-lista-ativa')
    const finalizada = !!lista.finalizada

    area.innerHTML = `
        <div class="ds-card" style="overflow:hidden">
            <div class="ds-card-head" style="flex-wrap:wrap; gap:12px">
                <div style="min-width:0">
                    <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap">
                        <h2 style="font-size:16px; font-weight:800; letter-spacing:-.02em; color:var(--text-1)">${String(lista.nome).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))}</h2>
                        ${finalizada ? '<span class="ds-chip ds-chip-ok">Finalizada</span>' : '<span class="ds-chip ds-chip-warn">Rascunho</span>'}
                    </div>
                    <p class="ds-lista-meta" id="lista-subtitulo">carregando…</p>
                </div>
                <div style="display:flex; gap:7px; flex-wrap:wrap">
                    ${!finalizada ? `
                        <button id="btn-finalizar-lista" class="ds-btn ds-btn-sm">
                            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                            Finalizar
                        </button>` : `
                        <button id="btn-duplicar-lista" class="ds-btn ds-btn-sm">
                            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                            Nova versão
                        </button>`}
                    <button id="btn-imprimir-lista" class="ds-btn ds-btn-sm">
                        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Imprimir
                    </button>
                    <button id="btn-exportar-excel" class="ds-btn ds-btn-sm ds-btn-primary">
                        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
                        Enviar ao designer
                    </button>
                </div>
            </div>

            ${!finalizada ? `
            <!-- Adicionar produtos -->
            <div style="padding:14px 18px; border-bottom:1px solid var(--border); background:var(--surface-2); position:relative; z-index:5">
                <div style="display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap">
                    <div class="ds-field" style="flex:1; min-width:240px; position:relative">
                        <label class="ds-label" for="lista-input-busca">Produto — código, EAN, nome ou marca</label>
                        <input id="lista-input-busca" type="text" class="ds-input" placeholder="Digite ou bipe o produto..." autocomplete="off">
                        <div id="lista-sugestoes" class="ds-sugestoes"></div>
                    </div>
                    <div class="ds-field" style="width:110px">
                        <label class="ds-label" for="lista-input-preco">Preço (R$)</label>
                        <input id="lista-input-preco" type="number" step="0.01" class="ds-input" placeholder="0,00">
                    </div>
                    <button id="btn-add-item-lista" class="ds-btn ds-btn-primary" style="height:36px">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Adicionar
                    </button>
                </div>

                <!-- Marcação de família -->
                <div style="display:flex; align-items:center; gap:12px; margin-top:12px; flex-wrap:wrap">
                    <label class="ds-switch" for="lista-marcar-familia">
                        <input type="checkbox" id="lista-marcar-familia">
                        <span class="ds-switch-track"><span class="ds-switch-thumb"></span></span>
                        <span class="ds-switch-label">
                            Marcar como <strong>Família</strong>
                        </span>
                    </label>
                    <span id="hint-familia" style="font-size:11.5px; color:var(--text-3)"></span>
                </div>
            </div>` : ''}

            <!-- Itens -->
            <div id="itens-lista"></div>
        </div>

        <div id="area-diff"></div>
    `

    document.getElementById('btn-imprimir-lista')?.addEventListener('click', () => imprimirLista(lista))
    document.getElementById('btn-exportar-excel')?.addEventListener('click', () => exportarListaExcel(lista))

    if (!finalizada) {
        document.getElementById('btn-finalizar-lista')?.addEventListener('click', async () => {
            const itens = await carregarItensDaLista(lista.id)
            if (!itens.length) { toast('Adicione produtos antes de finalizar', 'aviso'); return }
            const okFinalizar = await avisoConfirmacao(`Finalizar a lista com ${itens.length} item(ns)? Ela ficará somente leitura.`, { titulo: 'Finalizar lista?', tipo: 'pergunta', okText: 'Finalizar', cancelText: 'Cancelar' })
            if (!okFinalizar) return
            await fetch(API + `/listas/${lista.id}/finalizar`, { method: 'POST', headers: authHeaders() })
            toast('Lista finalizada', 'ok')
            lista.finalizada = true
            await atualizarHistorico()
            abrirLista({ ...lista, finalizada: true })
        })

        document.getElementById('lista-marcar-familia')?.addEventListener('change', atualizarHintFamilia)

        vincularEventosItemLista(lista)
    } else {
        document.getElementById('btn-duplicar-lista')?.addEventListener('click', () => abrirModalDuplicar(lista))
    }

    await carregarItensLista(lista.id, finalizada)

    if (lista.pai_id) await mostrarDiff(lista.pai_id, lista.id)
}

/** Texto de ajuda da marcação de família */
function atualizarHintFamilia() {
    const hint = document.getElementById('hint-familia')
    if (!hint) return

    const marcar = document.getElementById('lista-marcar-familia')?.checked

    if (!marcar) {
        hint.innerHTML = 'O item entra normalmente, sem etiqueta de família.'
        return
    }
    if (!selecaoProduto) {
        hint.innerHTML = 'Escolha um produto para ver a qual família ele pertence.'
        return
    }
    if (!selecaoProduto.familia) {
        hint.innerHTML = '<span style="color:var(--warn)">Este produto não tem família cadastrada — não será marcado.</span>'
        return
    }
    const qtd = selecaoProduto.familia_qtd
    hint.innerHTML = `Família <strong style="color:var(--text-2)">${selecaoProduto.familia}</strong>`
        + (qtd ? ` · ${qtd} produto(s) nesta família` : '')
        + ' — o item recebe a etiqueta FAMÍLIA.'
}

// ── ITENS ───────────────────────────────────────────────
async function carregarItensDaLista(listaId) {
    try {
        const res = await fetch(API + `/listas/${listaId}/itens`, { headers: authHeaders() })
        const itens = await res.json()
        return Array.isArray(itens) ? itens : []
    } catch { return [] }
}

async function carregarItensLista(listaId, somenteLeitura = false) {
    const el = document.getElementById('itens-lista')
    if (!el) return
    const itens = await carregarItensDaLista(listaId)

    // cabeçalho com resumo
    const sub = document.getElementById('lista-subtitulo')
    if (sub) {
        const total = itens.reduce((s, i) => s + Number(i.preco || 0), 0)
        const familias = new Set(itens.map(i => i.familia).filter(Boolean)).size
        const deFamilia = itens.filter(i => i.inclusao === 'familia').length
        sub.textContent = `${itens.length} item(ns) · R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            + (familias ? ` · ${familias} família(s)` : '')
            + (deFamilia ? ` · ${deFamilia} vindos de família` : '')
    }

    if (!itens.length) {
        el.innerHTML = `<div class="ds-empty" style="padding:52px 20px">
            <svg width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.4" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <div class="ds-empty-title">Nenhum produto na lista</div>
            <div class="ds-empty-text">Busque acima e adicione os produtos do panfleto.</div>
        </div>`
        return
    }

    const total = itens.reduce((s, i) => s + Number(i.preco || 0), 0)

    el.innerHTML = `
        <div style="overflow-x:auto">
        <table class="ds-table-prod" style="min-width:620px">
            <thead>
                <tr>
                    <th style="width:38px;">#</th>
                    <th>Descrição</th>
                    <th style="width:92px;">Código</th>
                    <th style="width:118px;">EAN</th>
                    <th style="width:120px;">Família</th>
                    <th style="width:92px; text-align:right;">Preço</th>
                    ${somenteLeitura ? '' : '<th style="width:72px;"></th>'}
                </tr>
            </thead>
            <tbody>
                ${itens.map((item, i) => `
                    <tr data-item-id="${item.id}">
                        <td class="muted" style="font-size:11px;">${i + 1}</td>
                        <td>
                            <div class="d3-prod-name" style="font-weight:600; cursor:${somenteLeitura ? 'default' : 'pointer'};" ${somenteLeitura ? '' : 'data-field="descricao"'}">${item.descricao}</div>
                            ${item.inclusao === 'familia'
                                ? '<span class="ds-badge" style="margin-top:4px; background:var(--brand-soft); color:var(--brand-text)">FAMÍLIA</span>'
                                : (item.marca ? `<div class="muted" style="font-size:10.5px; margin-top:2px;">${item.marca}</div>` : '')}
                        </td>
                        <td class="mono muted">${item.codigo || '—'}</td>
                        <td class="mono muted">${item.ean || '—'}</td>
                        <td class="muted" style="font-size:11.5px; max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${item.familia || ''}">${item.familia || '—'}</td>
                        <td class="preco" style="cursor:${somenteLeitura ? 'default' : 'pointer'};" ${somenteLeitura ? '' : 'data-field="preco"'}>
                            ${Number(item.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' })}
                        </td>
                        ${somenteLeitura ? '' : `
                        <td style="text-align:right; white-space:nowrap">
                            <button class="ds-icon-btn btn-remover-item" data-id="${item.id}" title="Remover da lista">
                                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                            </button>
                        </td>`}
                    </tr>`).join('')}
            </tbody>
            <tfoot>
                <tr style="background:var(--surface-2)">
                    <td colspan="${somenteLeitura ? 5 : 6}" style="padding:12px 14px; font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--text-3)">
                        Total — ${itens.length} item(ns)
                    </td>
                    <td class="preco" style="padding:12px 14px; text-align:right; font-weight:800; font-size:15px; color:var(--text-1)">
                        R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    ${somenteLeitura ? '' : '<td></td>'}
                </tr>
            </tfoot>
        </table>
        </div>`

    if (!somenteLeitura) {
        // edição inline
        el.querySelectorAll('[data-field]').forEach(span => {
            span.onclick = () => {
                const tr = span.closest('tr')
                const itemId = parseInt(tr.getAttribute('data-item-id'))
                const field = span.getAttribute('data-field')
                const item = itens.find(i => i.id === itemId)
                if (!item) return

                const input = document.createElement('input')
                const valor = field === 'preco'
                    ? Number(item.preco || 0).toFixed(2)
                    : item.descricao
                input.value = valor
                input.type = field === 'preco' ? 'number' : 'text'
                input.step = '0.01'
                input.className = 'ds-input'
                input.style.height = '30px'
                input.style.fontSize = '13px'
                span.replaceWith(input)
                input.focus()
                input.select()

                const salvar = async () => {
                    const v = input.value.trim()
                    if (!v) { await carregarItensLista(listaId); return }
                    await fetch(API + `/listas/${listaId}/itens/${itemId}`, {
                        method: 'PUT', headers: authHeaders(),
                        body: JSON.stringify({
                            descricao: field === 'descricao' ? v : item.descricao,
                            preco: field === 'preco' ? parseFloat(v) : item.preco
                        })
                    })
                    await carregarItensLista(listaId)
                    if (listaAtiva?.pai_id) await mostrarDiff(listaAtiva.pai_id, listaId)
                }
                input.onblur = salvar
                input.onkeydown = (e) => {
                    if (e.key === 'Enter') { e.preventDefault(); salvar() }
                    if (e.key === 'Escape') { input.replaceWith(span); span.style.color = '' }
                }
            }
        })

        // remover
        el.querySelectorAll('.btn-remover-item').forEach(btn => {
            btn.onclick = async () => {
                await fetch(API + `/listas/${listaId}/itens/${btn.getAttribute('data-id')}`, { method: 'DELETE', headers: authHeaders() })
                await carregarItensLista(listaId)
                if (listaAtiva?.pai_id) await mostrarDiff(listaAtiva.pai_id, listaId)
            }
        })
    }
}

// ═══════════════════════════════════════════════════════════════
// BUSCA E ADIÇÃO
// ═══════════════════════════════════════════════════════════════
function vincularEventosItemLista(lista) {
    const inputBusca = document.getElementById('lista-input-busca')
    const inputPreco = document.getElementById('lista-input-preco')
    if (!inputBusca) return

    let debounce = null

    inputBusca.oninput = () => {
        clearTimeout(debounce)
        sugestaoIndex = -1
        sugestoesAtuais = []
        // limpa a seleção anterior — evita arrastrar código/EAN do produto errado
        selecaoProduto = null
        atualizarHintFamilia()
        debounce = setTimeout(async () => {
            await mostrarSugestoesLista(inputBusca.value.trim())
            sugestoesAtuais = Array.from(document.querySelectorAll('.ds-sugestao'))
            if (sugestoesAtuais.length) {
                sugestaoIndex = 0
                sugerirAtiva()
            }
        }, 220)
    }

    inputBusca.onkeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (sugestaoIndex >= 0 && sugestoesAtuais[sugestaoIndex]) {
                sugestoesAtuais[sugestaoIndex].click()
            } else {
                inputPreco.focus()
                inputPreco.select()
            }
        }
        if (e.key === 'Escape') {
            document.getElementById('lista-sugestoes').innerHTML = ''
            sugestoesAtuais = []
            sugestaoIndex = -1
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            if (!sugestoesAtuais.length) return
            sugestaoIndex = (sugestaoIndex + 1) % sugestoesAtuais.length
            sugerirAtiva()
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault()
            if (!sugestoesAtuais.length) return
            sugestaoIndex = (sugestaoIndex - 1 + sugestoesAtuais.length) % sugestoesAtuais.length
            sugerirAtiva()
        }
    }

    inputPreco.onkeydown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); adicionarItemLista(lista.id) }
    }
    document.getElementById('btn-add-item-lista').onclick = () => adicionarItemLista(lista.id)
}

function sugerirAtiva() {
    sugestoesAtuais.forEach((s, i) => {
        s.classList.toggle('is-ativa', i === sugestaoIndex)
    })
    if (sugestoesAtuais[sugestaoIndex]) {
        sugestoesAtuais[sugestaoIndex].scrollIntoView({ block: 'nearest' })
    }
}

async function mostrarSugestoesLista(termo) {
    const el = document.getElementById('lista-sugestoes')
    if (!el) return
    if (!termo || termo.length < 2) { el.innerHTML = ''; sugestoesAtuais = []; return }

    let resultados = []
    try {
        const res = await fetch(API + `/produtos/busca?q=${encodeURIComponent(termo)}`, { headers: authHeaders() })
        if (res.ok) {
            const r = await res.json()
            if (Array.isArray(r)) resultados = r
        }
    } catch { /* offline: segue sem sugestão */ }

    if (!resultados.length) { el.innerHTML = ''; return }

    el.innerHTML = resultados.map((p, i) => {
        const fam = p.familia
            ? `<span class="ds-badge" style="background:var(--brand-soft); color:var(--brand-text); margin-left:6px">${p.familia}</span>`
            : ''
        const preco = p.preco_venda != null
            ? 'R$ ' + Number(p.preco_venda).toFixed(2).replace('.', ',')
            : ''
        return `
        <div class="ds-sugestao" data-index="${i}">
            <div class="ds-sugestao-nome">${p.descricao || ''}${fam}</div>
            <div class="ds-sugestao-meta">
                ${p.codigo || ''}${p.ean ? ' · ' + p.ean : ''}${preco ? ' · ' + preco : ''}${p.marca ? ' · ' + p.marca : ''}
            </div>
        </div>`
    }).join('')

    el.querySelectorAll('.ds-sugestao').forEach(item => {
        item.onmouseover = () => item.classList.add('is-ativa')
        item.onmouseout = () => item.classList.remove('is-ativa')
        item.onclick = () => {
            const p = resultados[parseInt(item.getAttribute('data-index'))]
            selecionarProduto(p)
        }
    })
}

function selecionarProduto(p) {
    selecaoProduto = p
    const inputBusca = document.getElementById('lista-input-busca')
    const inputPreco = document.getElementById('lista-input-preco')
    const el = document.getElementById('lista-sugestoes')

    inputBusca.value = p.descricao || ''
    inputPreco.value = p.preco_venda != null ? Number(p.preco_venda).toFixed(2) : ''
    if (el) el.innerHTML = ''
    sugestoesAtuais = []
    sugestaoIndex = -1

    atualizarHintFamilia()
    inputPreco.focus()
    inputPreco.select()
}

async function adicionarItemLista(listaId) {
    const inputBusca = document.getElementById('lista-input-busca')
    const inputPreco = document.getElementById('lista-input-preco')
    const descricao = inputBusca.value.trim()

    if (!descricao) { inputBusca.focus(); return }

    const preco = inputPreco.value !== '' ? Number(inputPreco.value) : (selecaoProduto?.preco_venda ?? 0)

    // ── marcado como família? o item recebe a etiqueta ──
    const marcarFamilia = !!document.getElementById('lista-marcar-familia')?.checked
    const familia = marcarFamilia ? (selecaoProduto?.familia || null) : null

    if (marcarFamilia && !familia) {
        toast('Este produto não tem família cadastrada — incluído sem etiqueta', 'aviso')
    }

    const res = await fetch(API + `/listas/${listaId}/itens`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({
            descricao,
            preco,
            codigo: selecaoProduto?.codigo || null,
            ean: selecaoProduto?.ean || null,
            familia: familia,
            marca: selecaoProduto?.marca || null,
            departamento: selecaoProduto?.descricao_departamento || null,
            inclusao: familia ? 'familia' : 'individual'
        })
    })
    if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        toast(d.error || 'Erro ao adicionar o produto', 'erro')
        return
    }

    if (familia) {
        toast(`Item marcado como família "${familia}"`, 'ok')
    }

    limparCamposAdicao()
    await carregarItensLista(listaId)
    if (listaAtiva?.pai_id) await mostrarDiff(listaAtiva.pai_id, listaId)
}

function limparCamposAdicao() {
    const inputBusca = document.getElementById('lista-input-busca')
    const inputPreco = document.getElementById('lista-input-preco')
    const el = document.getElementById('lista-sugestoes')
    const switchFamilia = document.getElementById('lista-marcar-familia')
    if (inputBusca) { inputBusca.value = ''; inputBusca.focus() }
    if (inputPreco) inputPreco.value = ''
    if (el) el.innerHTML = ''
    if (switchFamilia) switchFamilia.checked = false
    selecaoProduto = null
    sugestoesAtuais = []
    sugestaoIndex = -1
    atualizarHintFamilia()
}

// ═══════════════════════════════════════════════════════════════
// DIFF COM A VERSÃO ANTERIOR
// ═══════════════════════════════════════════════════════════════
async function mostrarDiff(paiId, filhoId) {
    const el = document.getElementById('area-diff')
    if (!el) return

    const [resPai, resFilho] = await Promise.all([
        fetch(API + `/listas/${paiId}/itens`, { headers: authHeaders() }),
        fetch(API + `/listas/${filhoId}/itens`, { headers: authHeaders() })
    ])
    const itensPai = await resPai.json()
    const itensFilho = await resFilho.json()
    if (!Array.isArray(itensPai) || !Array.isArray(itensFilho)) return

    const descsPai = new Set(itensPai.map(i => String(i.descricao).toUpperCase()))
    const descsFilho = new Set(itensFilho.map(i => String(i.descricao).toUpperCase()))

    const adicionados = itensFilho.filter(i => !descsPai.has(String(i.descricao).toUpperCase()))
    const removidos = itensPai.filter(i => !descsFilho.has(String(i.descricao).toUpperCase()))
    const mantidos = itensFilho.filter(i => descsPai.has(String(i.descricao).toUpperCase()))

    if (!adicionados.length && !removidos.length) { el.innerHTML = ''; return }

    const linha = (i, tipo) => `
        <tr style="background:${tipo === 'adicionado' ? 'var(--ok-soft)' : tipo === 'removido' ? 'var(--danger-soft)' : 'transparent'};">
            <td style="padding:10px 14px; width:34px; text-align:center; color:${tipo === 'adicionado' ? 'var(--ok)' : tipo === 'removido' ? 'var(--danger)' : 'var(--text-3)'}">
                ${tipo === 'adicionado' ? '+' : tipo === 'removido' ? '−' : '='}
            </td>
            <td style="padding:10px 14px; font-weight:${tipo === 'mantido' ? '400' : '700'}; color:${tipo === 'removido' ? 'var(--danger)' : 'var(--text-1)'};${tipo === 'removido' ? 'text-decoration:line-through' : ''}">${i.descricao}</td>
            <td class="mono muted" style="padding:10px 14px; font-size:11px;">${i.codigo || '—'}</td>
            <td style="padding:10px 14px; text-align:right; font-weight:600; color:var(--text-2)">
                R$ ${Number(i.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </td>
        </tr>`

    el.innerHTML = `
        <div class="ds-card" style="overflow:hidden; margin-top:14px">
            <div class="ds-card-head">
                <div class="ds-card-title">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M12 3v18"/><path d="M5 8l7-5 7 5"/><path d="M5 16l7 5 7-5"/></svg>
                    Alterações em relação à versão anterior
                </div>
                <div style="display:flex; gap:6px">
                    ${adicionados.length ? `<span class="ds-chip ds-chip-ok">+${adicionados.length}</span>` : ''}
                    ${removidos.length ? `<span class="ds-chip ds-chip-danger">−${removidos.length}</span>` : ''}
                    <span class="ds-chip">=${mantidos.length}</span>
                </div>
            </div>
            <table class="ds-table-prod">
                <tbody>
                    ${adicionados.map(i => linha(i, 'adicionado')).join('')}
                    ${mantidos.map(i => linha(i, 'mantido')).join('')}
                    ${removidos.map(i => linha(i, 'removido')).join('')}
                </tbody>
            </table>
        </div>`
}

// ═══════════════════════════════════════════════════════════════
// DUPLICAR (NOVA VERSÃO)
// ═══════════════════════════════════════════════════════════════
function abrirModalDuplicar(lista) {
    const modal = document.createElement('div')
    modal.className = 'ds-modal-overlay'
    modal.innerHTML = `
        <div class="ds-modal" style="width:440px">
            <div class="ds-modal-head">
                <h3>Nova versão da lista</h3>
                <button class="ds-icon-btn" data-fechar>
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            <div class="ds-modal-body">
                <p class="ds-field-hint">Baseada em: <strong style="color:var(--text-1)">${lista.nome}</strong></p>
                <div class="ds-field">
                    <label class="ds-label" for="dup-nome">Nome da nova versão</label>
                    <input id="dup-nome" type="text" class="ds-input">
                </div>
                <div class="ds-field">
                    <label class="ds-label" for="dup-data">Data da oferta</label>
                    <input id="dup-data" type="date" class="ds-input">
                </div>
            </div>
            <div class="ds-modal-foot">
                <button class="ds-btn" data-fechar style="flex:1">Cancelar</button>
                <button class="ds-btn ds-btn-primary" id="dup-criar" style="flex:1">Criar nova versão</button>
            </div>
        </div>`
    document.body.appendChild(modal)

    const hoje = new Date()
    const offset = hoje.getTimezoneOffset()
    modal.querySelector('#dup-data').value = new Date(hoje.getTime() - offset * 60000).toISOString().slice(0, 10)
    modal.querySelector('#dup-nome').value = lista.nome + ' (nova)'

    const fechar = () => modal.remove()
    modal.querySelectorAll('[data-fechar]').forEach(b => b.onclick = fechar)
    modal.onclick = e => { if (e.target === modal) fechar() }

    modal.querySelector('#dup-criar').onclick = async () => {
        const nome = modal.querySelector('#dup-nome').value.trim()
        const data = modal.querySelector('#dup-data').value
        if (!nome) { toast('Informe o nome da nova versão', 'aviso'); return }
        const res = await fetch(API + `/listas/${lista.id}/duplicar`, {
            method: 'POST', headers: authHeaders(),
            body: JSON.stringify({ nome, data_oferta: data || null })
        })
        if (!res.ok) { toast('Erro ao criar a versão', 'erro'); return }
        const nova = await res.json()
        fechar()
        toast('Nova versão criada', 'ok')
        await atualizarHistorico()
        abrirLista({ ...nova, finalizada: false, pai_id: lista.id })
    }
    modal.querySelector('#dup-nome').focus()
    modal.querySelector('#dup-nome').select()
}

// ═══════════════════════════════════════════════════════════════
// IMPRIMIR
// ═══════════════════════════════════════════════════════════════
async function imprimirLista(lista) {
    const itens = await carregarItensDaLista(lista.id)
    if (!itens.length) { toast('A lista está vazia', 'aviso'); return }

    const total = itens.reduce((s, i) => s + Number(i.preco || 0), 0)
    const dt = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

    const win = window.open('', '_blank')
    if (!win) { toast('Permita os pop-ups para imprimir', 'aviso'); return }

    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${lista.nome}</title>
        <style>
            * { font-family:'Segoe UI',sans-serif; margin:0; padding:0; box-sizing:border-box; }
            body { padding:20px; font-size:13px; color:#111827; }
            .header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:16px; border-bottom:2px solid #b51515; padding-bottom:10px; }
            h2 { font-size:18px; color:#b51515; }
            p.sub { font-size:11px; color:#666; margin-top:2px; }
            .badge { font-size:10px; padding:2px 6px; border-radius:4px; font-weight:600; }
            .finalizada { background:#dcfce7; color:#16a34a; }
            .rascunho { background:#fef3c7; color:#92400e; }
            table { width:100%; border-collapse:collapse; }
            th { background:#b51515; color:#fff; font-weight:600; text-align:left; padding:8px 10px; font-size:11px; text-transform:uppercase; }
            td { padding:7px 10px; border-bottom:1px solid #f0f0f0; }
            td.fam { font-size:10px; color:#888; }
            tfoot td { background:#f3f4f6; font-weight:700; border-top:2px solid #e5e7eb; }
            tr:nth-child(even) td { background:#f9fafb; }
            @page { size:A4; margin:15mm; }
        </style></head><body>
        <div class="header">
            <div>
                <h2>${lista.nome} <span class="badge ${lista.finalizada ? 'finalizada' : 'rascunho'}">${lista.finalizada ? '✓ Finalizada' : 'Rascunho'}</span></h2>
                <p class="sub">Gerado em ${dt} — ${itens.length} produto(s)</p>
            </div>
            <p class="sub">Supermercado Avanzi</p>
        </div>
        <table>
            <thead><tr><th>#</th><th>Descrição</th><th>Código</th><th>EAN</th><th>Preço</th></tr></thead>
            <tbody>${itens.map((item, i) => `
                <tr><td>${i + 1}</td><td><strong>${item.descricao}</strong>${item.familia ? `<div class="fam">${item.familia}</div>` : ''}</td><td>${item.codigo || '—'}</td><td>${item.ean || '—'}</td>
                <td style="text-align:right;font-weight:600;">R$ ${Number(item.preco || 0).toFixed(2).replace('.', ',')}</td></tr>
            `).join('')}</tbody>
            <tfoot><tr><td colspan="4">Total</td><td style="text-align:right;">R$ ${total.toFixed(2).replace('.', ',')}</td></tr></tfoot>
        </table>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body></html>`)
    win.document.close()
}

// ═══════════════════════════════════════════════════════════════
// EXPORTAR EXCEL (vai para o designer)
// ═══════════════════════════════════════════════════════════════
async function exportarListaExcel(lista) {
    try {
        const res = await fetch(API + `/listas/${lista.id}/exportar-xlsx`, { headers: authHeaders() })
        if (!res.ok) {
            const d = await res.json().catch(() => ({}))
            toast(d.error || 'Erro ao gerar o Excel', 'erro')
            return
        }
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        const nome = String(lista.nome).replace(/[^a-zA-Z0-9À-ÿ ]/g, '').trim() || 'ofertas'
        link.download = `${nome}.xlsx`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
        toast('Excel gerado — envie para o designer', 'ok')
    } catch (e) {
        console.error(e)
        toast('Erro ao exportar o Excel', 'erro')
    }
}
