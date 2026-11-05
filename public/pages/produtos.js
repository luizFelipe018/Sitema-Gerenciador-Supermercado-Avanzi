/* ═══════════════════════════════════════════════════════════════
   PÁGINA PRODUTOS — listagem, busca e paginação
   Design system v2 (public/design.css)
   ═══════════════════════════════════════════════════════════════ */

let paginaAtual = 1
const porPagina = 50
let buscaAtual = ''
let totalProdutos = 0

function carregarProdutos() {
    setActive('btn-produtos')

    setConteudo(`
        <div class="ds-page-head fade-in">
            <div>
                <div class="ds-page-eyebrow">Catálogo</div>
                <h1 class="ds-page-title">Produtos</h1>
                <p class="ds-page-sub" id="produtos-count">Carregando…</p>
            </div>
            <div style="position:relative; min-width:240px; max-width:360px; width:100%;">
                <svg width="15" height="15" fill="none" stroke="var(--text-3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="position:absolute; left:11px; top:50%; transform:translateY(-50%); pointer-events:none;">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input id="busca" type="text" class="ds-input" placeholder="Buscar código, descrição, marca..."
                    style="padding-left:34px;" autocomplete="off">
            </div>
        </div>

        <div class="ds-card" style="overflow:hidden;">
            <div id="tabela-wrapper">
                <div class="ds-empty" style="padding:48px 20px">
                    <div class="ds-empty-text">Carregando produtos…</div>
                </div>
            </div>
            <div id="paginacao" style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; padding:12px 16px; border-top:1px solid var(--border); font-size:12px; color:var(--text-3);"></div>
        </div>
    `, 'Produtos')

    const buscaInput = document.getElementById('busca')
    let debounceTimer
    buscaInput?.addEventListener('input', e => {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
            buscaAtual = e.target.value.trim()
            paginaAtual = 1
            fetchProdutos()
        }, 300)
    })

    fetchProdutos()
}

async function fetchProdutos() {
    const wrapper = document.getElementById('tabela-wrapper')
    const paginacaoEl = document.getElementById('paginacao')
    const countEl = document.getElementById('produtos-count')

    if (!wrapper) return
    wrapper.innerHTML = `<div class="ds-empty" style="padding:48px 20px"><div class="ds-empty-text">Buscando…</div></div>`

    try {
        const params = new URLSearchParams({ page: paginaAtual, limit: porPagina })
        if (buscaAtual) params.set('busca', buscaAtual)

        const res = await fetch(API + `/produtos?${params}`, { headers: authHeaders() })
        const json = await res.json()

        if (!res.ok) {
            wrapper.innerHTML = `<div class="ds-empty" style="padding:48px 20px">
                <div class="ds-empty-title" style="color:var(--danger)">Erro ao carregar</div>
                <div class="ds-empty-text">${String(json.error ?? res.status)}</div>
            </div>`
            return
        }

        const { data: produtos, total } = json
        totalProdutos = total

        if (countEl) {
            countEl.textContent = buscaAtual
                ? `${total.toLocaleString('pt-BR')} produto(s) para "${buscaAtual}"`
                : `${total.toLocaleString('pt-BR')} produto(s) cadastrados`
        }

        if (!produtos.length) {
            wrapper.innerHTML = `<div class="ds-empty" style="padding:56px 20px">
                <svg width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                </svg>
                <div class="ds-empty-title">Nenhum produto encontrado</div>
                <div class="ds-empty-text">Ajuste a busca ou importe produtos pela planilha do fornecedor.</div>
            </div>`
            if (paginacaoEl) paginacaoEl.innerHTML = ''
            return
        }

        const totalPaginas = Math.max(1, Math.ceil(total / porPagina))

        wrapper.innerHTML = `
            <div style="overflow-x:auto">
            <table class="ds-table-prod">
                <thead>
                    <tr>
                        <th style="width:96px;">Código</th>
                        <th>Descrição</th>
                        <th style="width:130px;">EAN</th>
                        <th style="width:150px;">Departamento</th>
                        <th style="width:80px;">Seção</th>
                        <th style="width:80px;">Grupo</th>
                        <th style="width:130px;">Marca</th>
                        <th style="width:100px; text-align:right;">Preço</th>
                    </tr>
                </thead>
                <tbody>
                    ${produtos.map(p => `<tr>
                        <td class="mono muted">${p.codigo ?? '—'}</td>
                        <td class="strong">${p.descricao ?? '—'}</td>
                        <td class="mono muted">${p.ean || '—'}</td>
                        <td>${p.descricao_departamento || p.departamento || '—'}</td>
                        <td class="muted">${p.secao ?? '—'}</td>
                        <td class="muted">${p.grupo ?? '—'}</td>
                        <td class="muted">${p.marca || '—'}</td>
                        <td class="preco">${p.preco_venda != null
                            ? 'R$ ' + Number(p.preco_venda).toFixed(2).replace('.', ',')
                            : '—'}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
            </div>`

        if (paginacaoEl) {
            paginacaoEl.innerHTML = `
                <span>${total.toLocaleString('pt-BR')} produto(s) — página ${paginaAtual} de ${totalPaginas}</span>
                <div style="display:flex; gap:6px;">
                    <button id="btn-prev" class="ds-btn ds-btn-sm" ${paginaAtual === 1 ? 'disabled style="opacity:.4;cursor:not-allowed;"' : ''}>
                        <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                        Anterior
                    </button>
                    <button id="btn-next" class="ds-btn ds-btn-sm" ${paginaAtual === totalPaginas ? 'disabled style="opacity:.4;cursor:not-allowed;"' : ''}>
                        Próxima
                        <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>`

            document.getElementById('btn-prev')?.addEventListener('click', () => {
                if (paginaAtual > 1) { paginaAtual--; fetchProdutos(); window.scrollTo({ top: 0, behavior: 'smooth' }) }
            })
            document.getElementById('btn-next')?.addEventListener('click', () => {
                if (paginaAtual < totalPaginas) { paginaAtual++; fetchProdutos(); window.scrollTo({ top: 0, behavior: 'smooth' }) }
            })
        }
    } catch {
        wrapper.innerHTML = `<div class="ds-empty" style="padding:48px 20px">
            <div class="ds-empty-title" style="color:var(--danger)">Erro ao conectar com o servidor</div>
        </div>`
    }
}
