var epStock = []
var epMoves = []

function carregarEstoquePlacas() {
    setActive('btn-estoque-placas')
    setConteudo(`
        <style>
            .ep-grid { display:grid; grid-template-columns:340px minmax(0,1fr); gap:20px; }
            @media (max-width:900px) { .ep-grid { grid-template-columns:1fr; } }
            .ep-grid .dash-glass { min-width:0; overflow:hidden; }
            .ep-tab { padding:8px 16px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.2s; background:transparent; color:rgba(255,255,255,0.4); }
            .ep-tab:hover { background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.7); }
            .ep-tab.active { background:rgba(181,21,21,0.12); border-color:rgba(181,21,21,0.25); color:#b51515; }
        </style>
        <div class="ep-grid">

            <div class="dash-glass dash-animate" style="padding:20px;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
                    <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Movimentar Estoque</span>
                </div>
                <div id="ep-tabs" style="display:flex; gap:6px; margin-bottom:14px;">
                    <button class="ep-tab active" data-tab="entrada">+ Entrada</button>
                    <button class="ep-tab" data-tab="saida">- Saída</button>
                    <button class="ep-tab" data-tab="transferir">⇄ Transferir</button>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div style="position:relative;">
                        <label style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.35); display:block; margin-bottom:4px;">Produto</label>
                        <input id="ep-nome" type="text" placeholder="Ex: ARROZ CAMIL 5KG" autocomplete="off"
                            style="width:100%; padding:10px 14px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; color:#fafafa; background:#252525; outline:none; transition:border-color 0.3s; box-sizing:border-box;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.4)'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.08)'">
                        <div id="ep-sugestoes" style="position:absolute; top:100%; left:0; right:0; z-index:50; background:#1a1a1a; border:1px solid rgba(255,255,255,0.08); border-radius:0 0 10px 10px; max-height:200px; overflow-y:auto; display:none; box-shadow:0 8px 32px rgba(0,0,0,0.4);"></div>
                    </div>
                    <div>
                        <label style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.35); display:block; margin-bottom:4px;">Preço (R$)</label>
                        <input id="ep-preco" type="number" step="0.01" min="0" placeholder="0,00"
                            style="width:100%; padding:10px 14px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; color:#fafafa; background:#252525; outline:none; transition:border-color 0.3s; box-sizing:border-box;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.4)'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.08)'">
                    </div>
                    <div>
                        <label style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.35); display:block; margin-bottom:4px;">Quantidade</label>
                        <input id="ep-qtd" type="number" value="1" min="1" max="9999"
                            style="width:100%; padding:10px 14px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; color:#fafafa; background:#252525; outline:none; transition:border-color 0.3s; box-sizing:border-box; text-align:center;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.4)'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.08)'">
                    </div>
                    <div>
                        <label style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.35); display:block; margin-bottom:4px;">Localização</label>
                        <select id="ep-localizacao"
                            style="width:100%; padding:10px 14px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; color:#fafafa; background:#252525; outline:none; cursor:pointer;">
                            <option value="armario">Armário</option>
                            <option value="loja">Loja</option>
                            <option value="extraviada">Extraviada</option>
                        </select>
                    </div>
                    <div id="ep-destino-wrap" style="display:none;">
                        <label style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.35); display:block; margin-bottom:4px;">Destino</label>
                        <select id="ep-destino"
                            style="width:100%; padding:10px 14px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; color:#fafafa; background:#252525; outline:none; cursor:pointer;">
                            <option value="armario">Armário</option>
                            <option value="loja">Loja</option>
                            <option value="extraviada">Extraviada</option>
                        </select>
                    </div>
                    <button id="ep-btn-salvar" style="padding:12px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; justify-content:center; gap:6px;"
                        onmouseenter="this.style.transform='translateY(-2px) scale(1.02)';this.style.boxShadow='0 8px 24px rgba(181,21,21,0.4)'"
                        onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(181,21,21,0.3)'"
                        onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='translateY(-2px) scale(1.02)'">
                        <svg id="ep-btn-icon" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        <span id="ep-btn-text">Adicionar ao Estoque</span>
                    </button>
                    <p id="ep-status" style="font-size:11px; text-align:center; min-height:16px; color:rgba(255,255,255,0.3);"></p>
                </div>
            </div>

            <div class="dash-glass dash-animate" style="padding:20px;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                    <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                    <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Estoque Atual</span>
                    <span id="ep-total-info" style="font-size:11px; color:rgba(255,255,255,0.2); margin-left:auto;"></span>
                </div>
                <div style="display:flex; gap:6px; margin-bottom:10px; flex-wrap:wrap; align-items:center;">
                    <input id="ep-busca" type="text" placeholder="Buscar produto..." autocomplete="off"
                        style="flex:1; min-width:120px; padding:8px 12px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:12px; color:#fafafa; background:#252525; outline:none; transition:border-color 0.3s; box-sizing:border-box;"
                        onfocus="this.style.borderColor='rgba(181,21,21,0.4)'"
                        onblur="this.style.borderColor='rgba(255,255,255,0.08)'">
                    <input id="ep-filtro-inicio" type="date"
                        style="padding:8px 10px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:11px; color:rgba(255,255,255,0.5); background:#252525; outline:none; box-sizing:border-box; max-width:140px;">
                    <span style="font-size:11px; color:rgba(255,255,255,0.2);">até</span>
                    <input id="ep-filtro-fim" type="date"
                        style="padding:8px 10px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:11px; color:rgba(255,255,255,0.5); background:#252525; outline:none; box-sizing:border-box; max-width:140px;">
                    <button id="ep-btn-atualizar" style="padding:8px 12px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:11px; font-weight:600; color:rgba(255,255,255,0.4); cursor:pointer; background:rgba(255,255,255,0.04); transition:all 0.2s; display:flex; align-items:center; gap:4px; white-space:nowrap;"
                        onmouseenter="this.style.background='rgba(255,255,255,0.08)';this.style.color='#fafafa'"
                        onmouseleave="this.style.background='rgba(255,255,255,0.04)';this.style.color='rgba(255,255,255,0.4)'">
                        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                        Atualizar
                    </button>
                </div>
                <div style="display:flex; gap:6px; margin-bottom:12px;">
                    <button class="ep-loc-filtro" data-loc="" style="padding:5px 12px; border:1px solid rgba(255,255,255,0.08); border-radius:6px; font-size:11px; cursor:pointer; background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.5); font-weight:600; transition:all 0.2s;">Todos</button>
                    <button class="ep-loc-filtro" data-loc="armario" style="padding:5px 12px; border:1px solid rgba(255,255,255,0.08); border-radius:6px; font-size:11px; cursor:pointer; background:transparent; color:rgba(255,255,255,0.3); transition:all 0.2s;">Armário</button>
                    <button class="ep-loc-filtro" data-loc="loja" style="padding:5px 12px; border:1px solid rgba(255,255,255,0.08); border-radius:6px; font-size:11px; cursor:pointer; background:transparent; color:rgba(255,255,255,0.3); transition:all 0.2s;">Loja</button>
                    <button class="ep-loc-filtro" data-loc="extraviada" style="padding:5px 12px; border:1px solid rgba(255,255,255,0.08); border-radius:6px; font-size:11px; cursor:pointer; background:transparent; color:rgba(255,255,255,0.3); transition:all 0.2s;">Extraviada</button>
                </div>
                <div id="ep-estoque-container"></div>

                <div style="margin-top:20px; border-top:1px solid rgba(255,255,255,0.06); padding-top:16px;">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
                        <div style="display:flex; align-items:center; gap:6px;">
                            <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.25);">Movimentos Recentes</span>
                        </div>
                    </div>
                    <div id="ep-movimentos-container"></div>
                </div>
            </div>

        </div>
    `, 'Estoque de Placas')

    // Tabs
    document.querySelectorAll('.ep-tab').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.ep-tab').forEach(b => b.classList.remove('active'))
            btn.classList.add('active')
            epAtualizarForm(btn.dataset.tab)
        }
    })
    document.getElementById('ep-btn-salvar').onclick = epSalvar
    document.getElementById('ep-btn-atualizar').onclick = epCarregarDados
    document.getElementById('ep-busca').onkeydown = (e) => { if (e.key === 'Enter') epRenderizarEstoque() }
    document.getElementById('ep-filtro-inicio').onchange = () => epRenderizarMovimentos()
    document.getElementById('ep-filtro-fim').onchange = () => epRenderizarMovimentos()
    document.getElementById('ep-nome').onkeydown = (e) => { if (e.key === 'Enter') document.getElementById('ep-preco').focus() }
    document.getElementById('ep-preco').onkeydown = (e) => { if (e.key === 'Enter') document.getElementById('ep-qtd').focus() }
    document.getElementById('ep-qtd').onkeydown = (e) => { if (e.key === 'Enter') epSalvar() }

    // Location filter buttons
    document.querySelectorAll('.ep-loc-filtro').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.ep-loc-filtro').forEach(b => {
                b.style.background = 'transparent'
                b.style.color = 'rgba(255,255,255,0.3)'
            })
            btn.style.background = 'rgba(255,255,255,0.06)'
            btn.style.color = 'rgba(255,255,255,0.5)'
            epRenderizarEstoque()
        }
    })

    epInitAutoComplete()
    epCarregarDados()
}

// ── Tab switching ────────────────────────────────────────
function epAtualizarForm(tab) {
    const btnText = document.getElementById('ep-btn-text')
    const btnIcon = document.getElementById('ep-btn-icon')
    const destinoWrap = document.getElementById('ep-destino-wrap')

    if (tab === 'transferir') {
        destinoWrap.style.display = 'block'
        btnText.textContent = 'Transferir'
        btnIcon.innerHTML = '<path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>'
        document.getElementById('ep-status').textContent = ''
    } else if (tab === 'saida') {
        destinoWrap.style.display = 'none'
        btnText.textContent = 'Remover do Estoque'
        btnIcon.innerHTML = '<line x1="5" y1="12" x2="19" y2="12"/>'
        document.getElementById('ep-status').textContent = ''
    } else {
        destinoWrap.style.display = 'none'
        btnText.textContent = 'Adicionar ao Estoque'
        btnIcon.innerHTML = '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'
        document.getElementById('ep-status').textContent = ''
    }
}

// ── Autocomplete ─────────────────────────────────────────
function epInitAutoComplete() {
    const input = document.getElementById('ep-nome')
    const dropdown = document.getElementById('ep-sugestoes')
    let timer, focus = false

    input.addEventListener('focus', () => { focus = true })
    input.addEventListener('blur', () => { setTimeout(() => { focus = false; dropdown.style.display = 'none' }, 200) })

    input.addEventListener('input', () => {
        clearTimeout(timer)
        const q = input.value.trim()
        if (q.length < 2) { dropdown.style.display = 'none'; return }
        timer = setTimeout(() => epBuscarNome(q, input, dropdown), 250)
    })
}

async function epBuscarNome(q, input, dropdown) {
    const termo = q.replace(/%/g, '').trim()
    let itens = []
    try {
        const [resProd, resEst] = await Promise.all([
            fetch(API+'/produtos/busca?q='+encodeURIComponent(termo), { headers: authHeaders() }),
            fetch(API+'/estoque-placas?q='+encodeURIComponent(termo), { headers: authHeaders() })
        ])
        if (resProd.ok) {
            (await resProd.json()).forEach(p => {
                if (p.descricao && !itens.some(i => i.nome === p.descricao))
                    itens.push({ nome: p.descricao, preco: p.preco_venda })
            })
        }
        if (resEst.ok) {
            ;(await resEst.json()).forEach(n => {
                if (typeof n === 'string' && !itens.some(i => i.nome === n))
                    itens.push({ nome: n, preco: null })
            })
        }
    } catch {}

    if (!itens.length) { dropdown.style.display = 'none'; return }

    dropdown.innerHTML = itens.slice(0, 12).map(item => `
        <div style="padding:8px 14px; cursor:pointer; font-size:12px; color:rgba(255,255,255,0.7); border-bottom:1px solid rgba(255,255,255,0.04); display:flex; align-items:center; justify-content:space-between;"
            onmouseenter="this.style.background='rgba(181,21,21,0.1)'"
            onmouseleave="this.style.background='transparent'"
            data-nome="${item.nome.replace(/"/g, '&quot;')}" data-preco="${item.preco || ''}">
            <span>${item.nome}</span>
            ${item.preco ? '<span style="font-weight:700; color:rgba(181,21,21,0.8); font-size:11px;">R$ '+parseFloat(item.preco).toFixed(2).replace('.',',')+'</span>' : ''}
        </div>
    `).join('')
    dropdown.style.display = 'block'

    dropdown.querySelectorAll('div[data-nome]').forEach(el => {
        el.onclick = () => {
            input.value = el.getAttribute('data-nome')
            const p = el.getAttribute('data-preco')
            if (p) document.getElementById('ep-preco').value = p
            dropdown.style.display = 'none'
            document.getElementById('ep-preco').focus()
        }
    })
}

// ── Load data ────────────────────────────────────────────
async function epCarregarDados() {
    const container = document.getElementById('ep-estoque-container')
    if (!container) return
    container.innerHTML = '<div style="text-align:center; padding:40px; color:rgba(255,255,255,0.15); font-size:12px;">Carregando...</div>'
    try {
        const res = await fetch(API+'/estoque-placas/todos', { headers: authHeaders() })
        if (res.ok) epStock = await res.json()
        else epStock = []
        epRenderizarEstoque()
        epCarregarMovimentos()
    } catch { epStock = []; epRenderizarEstoque() }
}

async function epCarregarMovimentos() {
    const inicio = document.getElementById('ep-filtro-inicio').value
    const fim = document.getElementById('ep-filtro-fim').value
    let url = API+'/estoque-placas/movimentos?limit=50'
    if (inicio) url += '&data_inicio='+inicio
    if (fim) url += '&data_fim='+fim
    try {
        const res = await fetch(url, { headers: authHeaders() })
        if (res.ok) epMoves = await res.json()
        else epMoves = []
    } catch { epMoves = [] }
    epRenderizarMovimentos()
}

// ── Render stock table ───────────────────────────────────
function epRenderizarEstoque() {
    const container = document.getElementById('ep-estoque-container')
    if (!container) return

    const busca = (document.getElementById('ep-busca').value || '').trim().toUpperCase()
    const locFiltro = (document.querySelector('.ep-loc-filtro[style*="rgba(255,255,255,0.06)"]') ||
                       document.querySelector('.ep-loc-filtro'))?.dataset?.loc || ''

    let data = epStock.filter(r => {
        if (locFiltro && r.localizacao !== locFiltro) return false
        if (busca && !r.nome.toUpperCase().includes(busca)) return false
        return true
    })

    data.sort((a, b) => a.nome.localeCompare(b.nome))

    const total = data.reduce((s, r) => s + r.quantidade, 0)
    document.getElementById('ep-total-info').textContent = data.length + ' itens · ' + total + ' placas'

    if (!data.length) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:rgba(255,255,255,0.15); font-size:12px;">' +
            (busca ? 'Nenhum item encontrado.' : 'Nenhum item no estoque.') + '</div>'
        return
    }

    let html = '<div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse; font-size:13px;"><thead><tr style="border-bottom:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.02);">'
    html += '<th style="padding:8px 12px; text-align:left; color:rgba(255,255,255,0.3); font-weight:600; font-size:10px; text-transform:uppercase; letter-spacing:0.05em;">Produto</th>'
    html += '<th style="padding:8px 12px; text-align:center; color:rgba(255,255,255,0.3); font-weight:600; font-size:10px; text-transform:uppercase; letter-spacing:0.05em; width:60px;">Qtd</th>'
    html += '<th style="padding:8px 12px; text-align:center; color:rgba(255,255,255,0.3); font-weight:600; font-size:10px; text-transform:uppercase; letter-spacing:0.05em; width:80px;">Preço</th>'
    html += '<th style="padding:8px 12px; text-align:center; color:rgba(255,255,255,0.3); font-weight:600; font-size:10px; text-transform:uppercase; letter-spacing:0.05em; width:90px;">Local</th>'
    html += '<th style="padding:8px 12px; text-align:right; color:rgba(255,255,255,0.3); font-weight:600; font-size:10px; text-transform:uppercase; letter-spacing:0.05em; width:70px;">Ações</th>'
    html += '</tr></thead><tbody>'

    data.forEach(r => {
        const precoFmt = parseFloat(r.preco).toFixed(2).replace('.', ',')
        const locCores = { armario: '#22c55e', loja: '#3b82f6', extraviada: '#ef4444' }
        const locLabels = { armario: 'Armário', loja: 'Loja', extraviada: 'Extraviada' }
        const cor = locCores[r.localizacao] || 'rgba(255,255,255,0.3)'

        html += '<tr style="border-bottom:1px solid rgba(255,255,255,0.04); transition:background 0.15s;"'
        html += ' onmouseenter="this.style.background=\'rgba(255,255,255,0.03)\'"'
        html += ' onmouseleave="this.style.background=\'transparent\'">'
        html += '<td style="padding:8px 12px; font-weight:500; color:rgba(255,255,255,0.8);">'+r.nome+'</td>'
        html += '<td style="padding:8px 12px; text-align:center; font-weight:700; color:#fafafa; font-size:15px;">'+r.quantidade+'</td>'
        html += '<td style="padding:8px 12px; text-align:center; color:rgba(255,255,255,0.6);">R$ '+precoFmt+'</td>'
        html += '<td style="padding:8px 12px; text-align:center;"><span style="display:inline-block; padding:2px 10px; border-radius:10px; font-size:10px; font-weight:600; background:'+cor+'18; color:'+cor+';">'+locLabels[r.localizacao]+'</span></td>'
        html += '<td style="padding:8px 12px; text-align:right; white-space:nowrap;">'
        html += '<button class="ep-action-in" data-id="'+r.id+'" style="padding:4px 8px;border:none;border-radius:5px;font-size:10px;font-weight:600;color:#22c55e;cursor:pointer;background:rgba(34,197,94,0.1);margin-right:4px;transition:all 0.15s;"'
        html += ' onmouseenter="this.style.background=\'rgba(34,197,94,0.2)\'" onmouseleave="this.style.background=\'rgba(34,197,94,0.1)\'" title="Adicionar quantidade">+</button>'
        html += '<button class="ep-action-out" data-id="'+r.id+'" style="padding:4px 8px;border:none;border-radius:5px;font-size:10px;font-weight:600;color:#ef4444;cursor:pointer;background:rgba(239,68,68,0.1);margin-right:4px;transition:all 0.15s;"'
        html += ' onmouseenter="this.style.background=\'rgba(239,68,68,0.2)\'" onmouseleave="this.style.background=\'rgba(239,68,68,0.1)\'" title="Remover quantidade">&minus;</button>'
        html += '<button class="ep-action-del" data-id="'+r.id+'" data-nome="'+r.nome.replace(/"/g,'&quot;')+'" style="padding:4px 8px;border:none;border-radius:5px;font-size:10px;font-weight:600;color:rgba(255,255,255,0.2);cursor:pointer;background:rgba(255,255,255,0.04);transition:all 0.15s;"'
        html += ' onmouseenter="this.style.background=\'rgba(239,68,68,0.15)\';this.style.color=\'#ef4444\'" onmouseleave="this.style.background=\'rgba(255,255,255,0.04)\';this.style.color=\'rgba(255,255,255,0.2)\'" title="Excluir item">✕</button>'
        html += '</td>'
        html += '</tr>'
    })

    html += '</tbody></table></div>'
    container.innerHTML = html

    // Action buttons
    container.querySelectorAll('.ep-action-in').forEach(btn => {
        btn.onclick = () => {
            const qtd = prompt('Quantidade a adicionar:', '1')
            if (qtd && parseInt(qtd) > 0) epAcaoRapida(btn.dataset.id, 'entrada', parseInt(qtd))
        }
    })
    container.querySelectorAll('.ep-action-out').forEach(btn => {
        btn.onclick = () => {
            const qtd = prompt('Quantidade a remover:', '1')
            if (qtd && parseInt(qtd) > 0) epAcaoRapida(btn.dataset.id, 'saida', parseInt(qtd))
        }
    })
    container.querySelectorAll('.ep-action-del').forEach(btn => {
        btn.onclick = () => {
            if (confirm('Excluir "'+btn.dataset.nome+'" do estoque?'))
                epAcaoRapida(btn.dataset.id, 'excluir')
        }
    })
}

// ── Quick actions (+/-/delete) ────────────────────────────
async function epAcaoRapida(id, tipo, quantidade) {
    try {
        if (tipo === 'excluir') {
            await fetch(API+'/estoque-placas/'+id, { method: 'DELETE', headers: authHeaders() })
        } else {
            await fetch(API+'/estoque-placas/'+id, {
                method: 'PATCH',
                headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
                body: JSON.stringify({ quantidade, tipo })
            })
        }
        epCarregarDados()
    } catch {}
}

// ── Render movements ─────────────────────────────────────
function epRenderizarMovimentos() {
    const container = document.getElementById('ep-movimentos-container')
    if (!container) return

    if (!epMoves.length) {
        container.innerHTML = '<div style="text-align:center; padding:20px; color:rgba(255,255,255,0.12); font-size:11px;">Nenhum movimento registrado.</div>'
        return
    }

    let html = '<div style="max-height:300px; overflow-y:auto;"><table style="width:100%; border-collapse:collapse; font-size:12px;">'
    html += '<thead><tr style="border-bottom:1px solid rgba(255,255,255,0.04);"><th style="padding:6px 10px; text-align:left; color:rgba(255,255,255,0.2); font-weight:600; font-size:9px; text-transform:uppercase; width:90px;">Data</th>'
    html += '<th style="padding:6px 10px; text-align:left; color:rgba(255,255,255,0.2); font-weight:600; font-size:9px; text-transform:uppercase;">Movimento</th>'
    html += '<th style="padding:6px 10px; text-align:right; color:rgba(255,255,255,0.2); font-weight:600; font-size:9px; text-transform:uppercase; width:40px;">Qtd</th></tr></thead><tbody>'

    epMoves.slice(0, 50).forEach(m => {
        const data = (m.created_at || '').slice(0, 10)
        const hora = (m.created_at || '').slice(11, 16)
        const tipo = m.tipo
        const cor = tipo === 'entrada' ? '#22c55e' : tipo === 'saida' ? '#ef4444' : '#3b82f6'
        const icone = tipo === 'entrada' ? '+' : tipo === 'saida' ? '−' : '⇄'
        const locStr = tipo === 'transferencia'
            ? (m.localizacao_origem || '?') + ' → ' + (m.localizacao_destino || '?')
            : tipo === 'entrada'
                ? '→ ' + (m.localizacao_destino || m.localizacao_origem || '?')
                : (m.localizacao_origem || m.localizacao_destino || '?') + ' →'

        html += '<tr style="border-bottom:1px solid rgba(255,255,255,0.03);">'
        html += '<td style="padding:6px 10px; color:rgba(255,255,255,0.25); font-size:10px; white-space:nowrap;">'+data+' '+hora+'</td>'
        html += '<td style="padding:6px 10px; color:rgba(255,255,255,0.6);"><span style="color:'+cor+';font-weight:700;">'+icone+'</span> '+m.nome+' <span style="color:rgba(255,255,255,0.25);font-size:10px;">'+locStr+'</span></td>'
        html += '<td style="padding:6px 10px; text-align:right; font-weight:700; color:'+cor+';">'+m.quantidade+'</td>'
        html += '</tr>'
    })

    html += '</tbody></table></div>'
    container.innerHTML = html
}

// ── Main save ────────────────────────────────────────────
async function epSalvar() {
    const nome = (document.getElementById('ep-nome').value || '').trim().toUpperCase()
    const preco = parseFloat(document.getElementById('ep-preco').value)
    const qtd = parseInt(document.getElementById('ep-qtd').value) || 1
    const localizacao = document.getElementById('ep-localizacao').value
    const destino = document.getElementById('ep-destino')?.value
    const tab = document.querySelector('.ep-tab.active')?.dataset?.tab || 'entrada'
    const status = document.getElementById('ep-status')

    if (!nome) { status.style.color = '#ef4444'; status.textContent = 'Digite o nome do produto.'; return }
    if (isNaN(preco) || preco <= 0) { status.style.color = '#ef4444'; status.textContent = 'Digite um preço válido.'; return }

    status.style.color = 'rgba(255,255,255,0.3)'
    status.textContent = 'Salvando...'

    try {
        let res
        if (tab === 'entrada' || tab === 'saida') {
            res = await fetch(API+'/estoque-placas', {
                method: 'POST',
                headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
                body: JSON.stringify({ nome, preco, quantidade: qtd, localizacao, tipo: tab })
            })
        } else if (tab === 'transferir') {
            // Transfer: first find the source record
            const [src] = epStock.filter(r => r.nome === nome && parseFloat(r.preco) === preco && r.localizacao === localizacao)
            if (!src) { status.style.color = '#ef4444'; status.textContent = 'Item não encontrado nesta localização.'; return }
            if (src.quantidade < qtd) { status.style.color = '#ef4444'; status.textContent = 'Quantidade insuficiente em '+localizacao+'. Disponível: '+src.quantidade; return }
            res = await fetch(API+'/estoque-placas/'+src.id, {
                method: 'PATCH',
                headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
                body: JSON.stringify({ localizacao: destino, quantidade: qtd })
            })
        }

        if (res && res.ok) {
            document.getElementById('ep-nome').value = ''
            document.getElementById('ep-preco').value = ''
            document.getElementById('ep-qtd').value = '1'
            document.getElementById('ep-nome').focus()
            status.style.color = '#22c55e'
            status.textContent = 'Operação realizada com sucesso!'
            epCarregarDados()
        } else {
            const err = res ? await res.json().catch(() => ({})) : {}
            status.style.color = '#ef4444'
            status.textContent = err.error || 'Erro ao salvar.'
        }
    } catch (e) {
        status.style.color = '#ef4444'
        status.textContent = 'Erro: ' + e.message
    }
}
