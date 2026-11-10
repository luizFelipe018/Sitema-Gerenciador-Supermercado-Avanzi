/* ═══════════════════════════════════════════════════════════════
   IMAGENS DO SITE — busca e importa imagens do lojasuperavanzi.com.br
   ═══════════════════════════════════════════════════════════════ */

let isBusy = false
let isLoteAtivo = false

function carregarImagensSite() {
    setActive('btn-imagens-site')
    setConteudo(`
        <div class="ds-page-head fade-in">
            <div>
                <div class="ds-page-eyebrow">Catálogo</div>
                <h1 class="ds-page-title">Imagens do Site</h1>
                <p class="ds-page-sub">Busca as fotos dos produtos no site lojasuperavanzi.com.br e salva na pasta de imagens do ERP</p>
            </div>
            <button id="is-refresh" class="ds-btn ds-btn-sm ds-btn-icon" title="Atualizar índice do site" type="button">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            </button>
        </div>

        <div class="ds-grid ds-grid-4" id="is-stats" style="margin-bottom:24px">
            <div class="ds-stat"><span class="ds-stat-label">Produtos no site</span><div class="ds-stat-value" id="is-total-site">—</div></div>
            <div class="ds-stat"><span class="ds-stat-label">Produtos ERP</span><div class="ds-stat-value" id="is-total-erp">—</div></div>
            <div class="ds-stat"><span class="ds-stat-label">Sem imagem local</span><div class="ds-stat-value" id="is-sem-local" style="color:var(--danger)">—</div></div>
            <div class="ds-stat"><span class="ds-stat-label">Índice do site</span><div class="ds-stat-value" id="is-indice-data" style="color:var(--text-2); font-size:20px">—</div></div>
        </div>

        <!-- Busca individual -->
        <div class="ds-card" style="margin-bottom:24px">
            <div class="ds-card-pad">
                <h3 class="ds-card-title">Buscar produto</h3>
                <p class="ds-card-sub">Digite a descrição ou código — o sistema localiza o produto correspondente no site e mostra a foto dele</p>
                <div style="display:flex; gap:10px; align-items:end; flex-wrap:wrap; position:relative;">
                    <div class="ds-field" style="flex:1; min-width:220px;">
                        <label class="ds-label">Produto do ERP</label>
                        <input id="is-busca" type="text" placeholder="Ex: CERVEJA SKOL LT 350ML CX 12UN" autocomplete="off" style="width:100%">
                    </div>
                    <button id="is-btn-buscar" class="ds-btn ds-btn-primary" type="button">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                        Buscar no site
                    </button>
                </div>
                <div id="is-sugestoes"></div>
            </div>
            <div id="is-resultado"></div>
        </div>

        <!-- Importação em lote -->
        <div class="ds-card">
            <div class="ds-card-pad">
                <h3 class="ds-card-title">Importar em lote</h3>
                <p class="ds-card-sub">Busca no site as fotos de todos os produtos que estão sem imagem local e salva uma por uma na pasta</p>
                <div style="display:flex; gap:10px; align-items:end; flex-wrap:wrap;">
                    <div class="ds-field" style="min-width:180px;">
                        <label class="ds-label">Máximo de imagens: <b id="is-qtd-lbl" style="color:var(--text-1)">50</b></label>
                        <input type="range" id="is-qtd" min="10" max="300" step="10" value="50" style="width:180px; accent-color:var(--brand-2);">
                    </div>
                    <button id="is-btn-lote" class="ds-btn ds-btn-primary" type="button">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Importar fotos que faltam
                    </button>
                    <button id="is-btn-parar" class="ds-btn ds-btn-danger" type="button" style="display:none">Parar</button>
                </div>
                <div id="is-progresso" style="display:none; margin-top:16px;">
                    <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-3); margin-bottom:6px;">
                        <span id="is-prog-txt">Preparando…</span>
                        <span id="is-prog-num">0/0</span>
                    </div>
                    <div style="height:8px; border-radius:99px; background:var(--border-soft); overflow:hidden;">
                        <div id="is-prog-bar" style="height:100%; width:0%; background:linear-gradient(90deg,var(--brand-2),var(--ok)); transition:width .25s;"></div>
                    </div>
                </div>
            </div>
            <div id="is-lote-log"></div>
        </div>
    `, 'Imagens do Site')

    document.getElementById('is-refresh').onclick = () => { carregarStats(true) }
    const input = document.getElementById('is-busca')
    input.focus()

    // sugestões enquanto digita
    let sugTimer = null
    input.oninput = () => {
        clearTimeout(sugTimer)
        const q = input.value.trim()
        if (q.length < 2) { document.getElementById('is-sugestoes').innerHTML = ''; return }
        sugTimer = setTimeout(() => carregarSugestoes(q), 300)
    }
    input.onkeydown = (e) => { if (e.key === 'Enter') buscarNoSite() }

    document.getElementById('is-btn-buscar').onclick = buscarNoSite
    document.getElementById('is-btn-lote').onclick = iniciarLote
    document.getElementById('is-btn-parar').onclick = () => { isLoteAtivo = false }
    document.getElementById('is-qtd').oninput = (e) => {
        document.getElementById('is-qtd-lbl').textContent = e.target.value
    }

    carregarStats(false)
}

/* ── estatísticas (índice do site + produtos sem imagem) ── */
async function carregarStats(refresh) {
    const el = (id) => document.getElementById(id)
    try {
        const rIndice = await fetch(API + '/imagens-site/indice' + (refresh ? '?refresh=1' : ''), { headers: authHeaders() })
        const indice = await rIndice.json()
        if (el('is-total-site')) el('is-total-site').textContent = indice.total ?? '—'
        if (el('is-indice-data')) el('is-indice-data').textContent = indice.total ? new Date(indice.atualizado).toLocaleString('pt-BR') : '—'
    } catch (e) {
        if (el('is-total-site')) el('is-total-site').textContent = 'erro'
    }
    try {
        const rSem = await fetch(API + '/imagens-site/sem-imagem?limit=1000', { headers: authHeaders() })
        const sem = await rSem.json()
        if (el('is-total-erp')) el('is-total-erp').textContent = sem.totalProdutos ?? '—'
        if (el('is-sem-local')) el('is-sem-local').textContent = sem.semImagem ?? '—'
        isProdutosSemImagem = sem.produtos || []
    } catch (e) {
        if (el('is-total-erp')) el('is-total-erp').textContent = 'erro'
        if (el('is-sem-local')) el('is-sem-local').textContent = 'erro'
    }
}

let isProdutosSemImagem = []

/* ── sugestões de produto (banco ERP) ── */
async function carregarSugestoes(q) {
    try {
        const res = await fetch(API + `/produtos/busca?q=${encodeURIComponent(q)}`, { headers: authHeaders() })
        const prods = await res.json()
        const el = document.getElementById('is-sugestoes')
        if (!Array.isArray(prods) || !prods.length) { el.innerHTML = ''; return }
        el.innerHTML = `
            <div style="margin-top:10px; border:1px solid var(--border); border-radius:12px; overflow:hidden;">
                ${prods.slice(0, 8).map(p => `
                    <div class="is-sug-item" data-codigo="${p.codigo}"
                        style="padding:9px 14px; cursor:pointer; display:flex; justify-content:space-between; gap:10px; align-items:center; border-bottom:1px solid var(--border-soft);">
                        <span style="font-size:12.5px; font-weight:500; color:var(--text-1); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${p.descricao}</span>
                        <span style="font-size:11px; color:var(--text-3); font-family:monospace; flex:0 0 auto;">${p.codigo}</span>
                    </div>
                `).join('')}
            </div>`
        el.querySelectorAll('.is-sug-item').forEach(item => {
            item.onmouseenter = () => item.style.background = 'rgba(181,21,21,0.08)'
            item.onmouseleave = () => item.style.background = 'transparent'
            item.onclick = () => {
                document.getElementById('is-busca').value = item.getAttribute('data-codigo')
                el.innerHTML = ''
                buscarNoSite()
            }
        })
    } catch {}
}

/* ── busca individual no site ── */
async function buscarNoSite() {
    if (isBusy) return
    const termo = document.getElementById('is-busca').value.trim()
    const el = document.getElementById('is-resultado')
    if (!termo) { alert('Digite a descrição ou código do produto.') ; return }

    isBusy = true
    el.innerHTML = `<div style="padding:24px; text-align:center; color:var(--text-3); font-size:13px; border-top:1px solid var(--border);">Procurando no site…</div>`

    try {
        // resolve código do produto
        let codigo = null
        if (/^\d+$/.test(termo)) {
            codigo = termo
        } else {
            const rProd = await fetch(API + `/produtos/busca?q=${encodeURIComponent(termo)}`, { headers: authHeaders() })
            const prods = await rProd.json()
            const prod = Array.isArray(prods) ? prods.find(p => p.descricao.toUpperCase().includes(termo.toUpperCase())) || prods[0] : null
            if (prod) codigo = prod.codigo
        }
        if (!codigo) {
            el.innerHTML = `<div class="ds-empty" style="border-top:1px solid var(--border)"><div class="ds-empty-text">Produto não encontrado no ERP.</div></div>`
            return
        }

        const res = await fetch(API + `/imagens-site/buscar?codigo=${encodeURIComponent(codigo)}`, { headers: authHeaders() })
        const info = await res.json()

        if (!info.ok) {
            el.innerHTML = `
                <div class="ds-empty" style="border-top:1px solid var(--border)">
                    <div class="ds-empty-text">
                        <b style="color:var(--text-1)">${info.descricao || termo}</b><br>
                        ${info.motivo || 'não encontrado no site'}${info.match ? ` (correspondência mais próxima: "${info.match}")` : ''}
                    </div>
                </div>`
            return
        }

        el.innerHTML = `
            <div style="display:flex; gap:20px; padding:20px; border-top:1px solid var(--border); flex-wrap:wrap;">
                <img src="${API}${info.proxy}" alt="" onerror="this.style.display='none'"
                    style="width:150px; height:150px; object-fit:contain; border-radius:12px; background:#fff; padding:8px; flex:0 0 auto;">
                <div style="flex:1; min-width:220px;">
                    <div style="font-size:14px; font-weight:700; color:var(--text-1);">${info.descricao}</div>
                    <div style="font-size:12px; color:var(--text-3); margin-top:8px; line-height:1.7;">
                        Código: <b style="color:var(--text-2)">${info.codigo}</b><br>
                        No site: <b style="color:var(--text-2)">${info.match}</b> <span class="ds-badge" style="margin-left:4px">${Math.round(info.score * 100)}% de compatibilidade</span><br>
                        <a href="${info.url_site}" target="_blank" rel="noopener" style="color:var(--brand-2); text-decoration:none;">ver produto no site ↗</a>
                    </div>
                    <div style="margin-top:14px; display:flex; gap:8px; flex-wrap:wrap;">
                        <button id="is-btn-salvar" class="ds-btn ds-btn-primary" type="button">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Salvar na pasta de imagens
                        </button>
                    </div>
                    <div id="is-salvar-status" style="margin-top:10px; font-size:12px;"></div>
                </div>
            </div>`
        document.getElementById('is-btn-salvar').onclick = () => salvarImagem(info.codigo)
    } catch (e) {
        el.innerHTML = `<div class="ds-empty" style="border-top:1px solid var(--border)"><div class="ds-empty-text">Erro: ${e.message}</div></div>`
    } finally {
        isBusy = false
    }
}

async function salvarImagem(codigo) {
    const status = document.getElementById('is-salvar-status')
    const btn = document.getElementById('is-btn-salvar')
    btn.disabled = true
    btn.style.opacity = 0.6
    status.innerHTML = '<span style="color:var(--text-3)">Baixando…</span>'
    try {
        const res = await fetch(API + '/imagens-site/salvar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ codigo })
        })
        const r = await res.json()
        if (r.salvo) {
            status.innerHTML = `<span style="color:var(--ok)">✓ Salvo como <b>${r.arquivo.split('\\\\').pop().split('/').pop()}</b> (${(r.bytes / 1024).toFixed(0)} KB)</span>`
        } else {
            status.innerHTML = `<span style="color:var(--danger)">✕ ${r.motivo || 'falha ao salvar'}</span>`
            btn.disabled = false
            btn.style.opacity = 1
        }
    } catch (e) {
        status.innerHTML = `<span style="color:var(--danger)">✕ ${e.message}</span>`
        btn.disabled = false
        btn.style.opacity = 1
    }
}

/* ── importação em lote ── */
async function iniciarLote() {
    if (isLoteAtivo) return
    if (!isProdutosSemImagem.length) {
        try {
            const r = await fetch(API + '/imagens-site/sem-imagem?limit=1000', { headers: authHeaders() })
            const d = await r.json()
            isProdutosSemImagem = d.produtos || []
            document.getElementById('is-sem-local').textContent = d.semImagem ?? '—'
            document.getElementById('is-total-erp').textContent = d.totalProdutos ?? '—'
        } catch (e) { alert('Erro ao listar produtos sem imagem: ' + e.message); return }
    }
    if (!isProdutosSemImagem.length) { alert('Todos os produtos já têm imagem local! 🎉'); return }

    const max = parseInt(document.getElementById('is-qtd').value) || 50
    const fila = isProdutosSemImagem.slice(0, max)
    isLoteAtivo = true

    const elProg = document.getElementById('is-progresso')
    const elBar = document.getElementById('is-prog-bar')
    const elTxt = document.getElementById('is-prog-txt')
    const elNum = document.getElementById('is-prog-num')
    const elLog = document.getElementById('is-lote-log')
    const btnLote = document.getElementById('is-btn-lote')
    const btnParar = document.getElementById('is-btn-parar')
    btnLote.disabled = true
    btnLote.style.opacity = 0.6
    btnParar.style.display = ''
    elProg.style.display = ''
    elLog.innerHTML = ''

    let salvos = 0, falhas = 0, semMatch = 0, i = 0
    const CHUNK = 40
    while (i < fila.length && isLoteAtivo) {
        const lote = fila.slice(i, i + CHUNK)
        elTxt.textContent = `Buscando no site (lote ${Math.floor(i / CHUNK) + 1} de ${Math.ceil(fila.length / CHUNK)})…`
        try {
            const res = await fetch(API + '/imagens-site/salvar-lote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ codigos: lote.map(p => p.codigo) })
            })
            const d = await res.json()
            for (const r of (d.resultados || [])) {
                if (r.salvo) { salvos++ }
                else if (r.motivo && /correspondência|sem imagem no site/i.test(r.motivo)) { semMatch++ }
                else { falhas++ }
                elLog.insertAdjacentHTML('afterbegin', `
                    <div style="display:flex; gap:10px; align-items:center; padding:8px 18px; border-bottom:1px solid var(--border-soft); font-size:12px;">
                        <span style="width:18px; text-align:center;">${r.salvo ? '<span style="color:var(--ok)">✓</span>' : '<span style="color:var(--danger)">✕</span>'}</span>
                        <span style="color:var(--text-1); flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${r.descricao || r.codigo}</span>
                        <span style="color:var(--text-3); flex:0 0 auto;">${r.motivo || `${(r.bytes / 1024).toFixed(0)} KB`}</span>
                    </div>`)
            }
        } catch (e) {
            falhas += lote.length
        }
        i += CHUNK
        elBar.style.width = Math.round((i / fila.length) * 100) + '%'
        elNum.textContent = `${i}/${fila.length}`
    }

    elTxt.textContent = isLoteAtivo ? 'Concluído!' : 'Interrompido.'
    elNum.textContent = `${salvos} salvas · ${semMatch} sem foto no site · ${falhas} falhas`
    elBar.style.width = '100%'
    btnLote.disabled = false
    btnLote.style.opacity = 1
    btnParar.style.display = 'none'
    isLoteAtivo = false

    // atualiza contadores
    isProdutosSemImagem = isProdutosSemImagem.filter(p => !fila.slice(0, i).some(f => String(f.codigo) === String(p.codigo)))
    carregarStats(false)
}
