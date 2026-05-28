let paginaAtual = 1
const porPagina = 50
let buscaAtual = ''
let totalProdutos = 0

async function carregarProdutos() {
    setActive('btn-produtos')
    setConteudo(`
        <div class="dash-glass dash-animate" style="padding:20px; margin-bottom:20px;">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div class="dash-card-icon" style="background:rgba(59,130,246,0.12); color:#3b82f6;">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                    </div>
                    <div>
                        <h3 style="font-size:14px; font-weight:700; color:rgba(255,255,255,0.9);">Lista de Produtos</h3>
                        <p id="produtos-count" style="font-size:11px; color:rgba(255,255,255,0.3); margin-top:1px;">Carregando...</p>
                    </div>
                </div>
                <div style="position:relative; min-width:200px; max-width:320px; width:100%;">
                    <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); pointer-events:none;"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    <input id="busca" type="text" placeholder="Buscar código, descrição, marca..."
                        style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px 10px 36px; font-size:13px; color:#fafafa; outline:none; width:100%; transition:all 0.3s; box-sizing:border-box;"
                        onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                        onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                </div>
            </div>
        </div>
        <div class="dash-table-wrap">
            <div id="tabela-wrapper">
                <p style="text-align:center; color:rgba(255,255,255,0.4); font-size:13px; padding:40px 0;">Carregando produtos...</p>
            </div>
            <div id="paginacao" style="display:flex; align-items:center; justify-content:space-between; padding:12px 20px; border-top:1px solid rgba(255,255,255,0.06); font-size:12px; color:rgba(255,255,255,0.4);"></div>
        </div>
    `, 'Produtos')

    const buscaInput = document.getElementById('busca')
    let debounceTimer
    buscaInput.addEventListener('input', (e) => {
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
    wrapper.innerHTML = `<p style="text-align:center; color:rgba(255,255,255,0.4); font-size:13px; padding:40px 0;">Buscando...</p>`

    try {
        const params = new URLSearchParams({ page: paginaAtual, limit: porPagina })
        if (buscaAtual) params.set('busca', buscaAtual)

        const res = await fetch(API+`/produtos?${params}`, { headers: authHeaders() })
        const json = await res.json()

        if (!res.ok) {
            wrapper.innerHTML = `<p style="text-align:center; color:#ef4444; font-size:13px; padding:40px 0;">Erro: ${json.error ?? res.status}</p>`
            return
        }

        const { data: produtos, total } = json
        totalProdutos = total

        if (countEl) countEl.textContent = `${total.toLocaleString('pt-BR')} produto(s) cadastrados`

        if (!produtos.length) {
            wrapper.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; gap:12px;">
                <svg width="40" height="40" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                <span style="color:rgba(255,255,255,0.25); font-size:13px; font-weight:500;">Nenhum produto encontrado</span>
            </div>`
            if (paginacaoEl) paginacaoEl.innerHTML = ''
            return
        }

        const totalPaginas = Math.ceil(total / porPagina)

        wrapper.innerHTML = `
            <table class="dash-table">
                <thead>
                    <tr>
                        <th style="padding:14px 16px; text-align:left;">Código</th>
                        <th style="padding:14px 16px; text-align:left;">Descrição</th>
                        <th style="padding:14px 16px; text-align:left;">EAN</th>
                        <th style="padding:14px 16px; text-align:left;">Departamento</th>
                        <th style="padding:14px 16px; text-align:left;">Seção</th>
                        <th style="padding:14px 16px; text-align:left;">Grupo</th>
                        <th style="padding:14px 16px; text-align:left;">Marca</th>
                        <th style="padding:14px 16px; text-align:right;">Preço</th>
                    </tr>
                </thead>
                <tbody>
                    ${produtos.map(p => `<tr style="border-bottom:1px solid rgba(255,255,255,0.04); transition:all 0.2s;">
                        <td style="padding:10px 16px; font-family:monospace; color:rgba(255,255,255,0.4); font-size:11px;">${p.codigo ?? '—'}</td>
                        <td style="padding:10px 16px; font-weight:500; color:rgba(255,255,255,0.85); font-size:13px;">${p.descricao ?? '—'}</td>
                        <td style="padding:10px 16px; color:rgba(255,255,255,0.3); font-size:11px; font-family:monospace;">${p.ean || '—'}</td>
                        <td style="padding:10px 16px; color:rgba(255,255,255,0.5); font-size:12px;">${p.descricao_departamento ?? '—'}</td>
                        <td style="padding:10px 16px; color:rgba(255,255,255,0.5); font-size:12px;">${p.secao ?? '—'}</td>
                        <td style="padding:10px 16px; color:rgba(255,255,255,0.5); font-size:12px;">${p.grupo ?? '—'}</td>
                        <td style="padding:10px 16px; color:rgba(255,255,255,0.5); font-size:12px;">${p.marca || '—'}</td>
                        <td style="padding:10px 16px; text-align:right; font-weight:700; color:rgba(181,21,21,0.9); font-size:13px;">
                            ${p.preco_venda != null ? 'R$ ' + Number(p.preco_venda).toFixed(2).replace('.', ',') : '<span style="color:rgba(255,255,255,0.15);">—</span>'}
                        </td>
                    </tr>`).join('')}
                </tbody>
            </table>`

        if (paginacaoEl) {
            paginacaoEl.innerHTML = `
                <span>${total.toLocaleString('pt-BR')} produto(s) — página ${paginaAtual} de ${totalPaginas}</span>
                <div style="display:flex; gap:6px;">
                    <button id="btn-prev" style="padding:6px 14px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:11px; color:rgba(255,255,255,0.5); background:rgba(255,255,255,0.04); cursor:pointer; transition:all 0.3s; display:flex; align-items:center; gap:4px;${paginaAtual === 1 ? 'opacity:0.35;cursor:not-allowed;' : ''}" ${paginaAtual === 1 ? 'disabled' : ''}>
                        <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg> Anterior
                    </button>
                    <button id="btn-next" style="padding:6px 14px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:11px; color:rgba(255,255,255,0.5); background:rgba(255,255,255,0.04); cursor:pointer; transition:all 0.3s; display:flex; align-items:center; gap:4px;${paginaAtual === totalPaginas ? 'opacity:0.35;cursor:not-allowed;' : ''}" ${paginaAtual === totalPaginas ? 'disabled' : ''}>
                        Próxima <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>`
            document.getElementById('btn-prev')?.addEventListener('click', () => { if (paginaAtual > 1) { paginaAtual--; fetchProdutos(); wrapper.scrollIntoView({ behavior: 'smooth' }) } })
            document.getElementById('btn-next')?.addEventListener('click', () => { if (paginaAtual < totalPaginas) { paginaAtual++; fetchProdutos(); wrapper.scrollIntoView({ behavior: 'smooth' }) } })
        }
    } catch {
        wrapper.innerHTML = `<p style="text-align:center; color:#ef4444; font-size:13px; padding:40px 0;">Erro ao conectar com o servidor.</p>`
    }
}
