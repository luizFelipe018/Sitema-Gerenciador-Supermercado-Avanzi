let epHistorico = []
let epResultados = []

function carregarEstoquePlacas() {
    setActive('btn-estoque-placas')
    epHistorico = []
    epResultados = []

    setConteudo(`
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">

            <div class="dash-glass dash-animate" style="padding:20px;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
                    <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Cadastrar Placa</span>
                </div>
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div style="position:relative;">
                        <label style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.35); display:block; margin-bottom:4px;">Nome do Produto</label>
                        <input id="ep-nome" type="text" placeholder="Ex: ARROZ CAMIL 5KG | % funciona como coringa" autocomplete="off"
                            style="width:100%; padding:10px 14px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; color:#fafafa; background:#252525; outline:none; transition:border-color 0.3s; box-sizing:border-box;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.4)'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.08)'">
                        <div id="ep-nome-sugestoes" style="position:absolute; top:100%; left:0; right:0; z-index:50; background:#1a1a1a; border:1px solid rgba(255,255,255,0.08); border-radius:0 0 10px 10px; max-height:220px; overflow-y:auto; display:none; box-shadow:0 8px 32px rgba(0,0,0,0.4);"></div>
                    </div>
                    <div>
                        <label style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.35); display:block; margin-bottom:4px;">Preço (R$)</label>
                        <input id="ep-preco" type="number" step="0.01" min="0" placeholder="0,00"
                            style="width:100%; padding:10px 14px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; color:#fafafa; background:#252525; outline:none; transition:border-color 0.3s; box-sizing:border-box;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.4)'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.08)'">
                    </div>
                    <button id="ep-btn-salvar" style="padding:12px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; justify-content:center; gap:6px;"
                        onmouseenter="this.style.transform='translateY(-2px) scale(1.02)';this.style.boxShadow='0 8px 24px rgba(181,21,21,0.4)'"
                        onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(181,21,21,0.3)'"
                        onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='translateY(-2px) scale(1.02)'">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        Salvar no Estoque
                    </button>
                    <p id="ep-status" style="font-size:11px; text-align:center; min-height:16px; color:rgba(255,255,255,0.3);"></p>
                </div>
            </div>

            <div class="dash-glass dash-animate" style="padding:20px;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
                    <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Pesquisar Placa</span>
                </div>
                <div style="display:flex; gap:8px; margin-bottom:12px;">
                    <input id="ep-busca" type="text" placeholder="Digite o nome da placa..." autocomplete="off"
                        style="flex:1; padding:10px 14px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; color:#fafafa; background:#252525; outline:none; transition:border-color 0.3s; box-sizing:border-box;"
                        onfocus="this.style.borderColor='rgba(181,21,21,0.4)'"
                        onblur="this.style.borderColor='rgba(255,255,255,0.08)'">
                    <button id="ep-btn-buscar" style="padding:10px 18px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#2563eb,#1d4ed8); box-shadow:0 4px 16px rgba(37,99,235,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.transform='translateY(-2px) scale(1.03)';this.style.boxShadow='0 8px 24px rgba(37,99,235,0.4)'"
                        onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(37,99,235,0.3)'"
                        onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='translateY(-2px) scale(1.03)'">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        Buscar
                    </button>
                </div>
                <div id="ep-sugestoes" style="margin-bottom:12px; display:flex; flex-wrap:wrap; gap:4px; min-height:20px;"></div>
                <div id="ep-historico" class="dash-table-wrap"></div>
            </div>

        </div>
    `, 'Estoque de Placas')

    document.getElementById('ep-btn-salvar').onclick = epSalvar
    document.getElementById('ep-btn-buscar').onclick = epBuscar
    document.getElementById('ep-busca').onkeydown = (e) => { if (e.key === 'Enter') epBuscar() }
    document.getElementById('ep-nome').onkeydown = (e) => { if (e.key === 'Enter') document.getElementById('ep-preco').focus() }
    document.getElementById('ep-preco').onkeydown = (e) => { if (e.key === 'Enter') epSalvar() }

    epInitAutoComplete()
    epSugestoesLv()
}

// ── Nome autocomplete ──
let epNomeTimer = null
let epNomeFocus = false

function epInitAutoComplete() {
    const input = document.getElementById('ep-nome')
    const dropdown = document.getElementById('ep-nome-sugestoes')

    input.addEventListener('focus', () => { epNomeFocus = true })
    input.addEventListener('blur', () => { setTimeout(() => { epNomeFocus = false; dropdown.style.display = 'none' }, 200) })

    input.addEventListener('input', () => {
        clearTimeout(epNomeTimer)
        const q = input.value.trim()
        if (q.length < 2) { dropdown.style.display = 'none'; return }
        epNomeTimer = setTimeout(() => epBuscarNome(q), 250)
    })

    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            const items = dropdown.querySelectorAll('.ep-nome-item')
            if (items.length) items[0].focus()
        }
    })

    dropdown.addEventListener('keydown', (e) => {
        const items = [...dropdown.querySelectorAll('.ep-nome-item')]
        const idx = items.indexOf(document.activeElement)
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            const next = items[Math.min(idx + 1, items.length - 1)]
            if (next) next.focus()
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            if (idx <= 0) { input.focus(); return }
            items[idx - 1].focus()
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (document.activeElement && document.activeElement.classList.contains('ep-nome-item')) {
                document.activeElement.click()
            }
        }
    })
}

async function epBuscarNome(q) {
    const dropdown = document.getElementById('ep-nome-sugestoes')
    const termo = q.replace(/%/g, '').trim()

    let items = []

    try {
        const [resProdutos, resEstoque] = await Promise.all([
            fetch(API+`/produtos/busca?q=${encodeURIComponent(termo)}`, { headers: authHeaders() }),
            fetch(API+`/estoque-placas?q=${encodeURIComponent(termo)}`, { headers: authHeaders() })
        ])

        if (resProdutos.ok) {
            const produtos = await resProdutos.json()
            produtos.forEach(p => {
                if (p.descricao && !items.some(i => i.nome === p.descricao)) {
                    items.push({ nome: p.descricao, preco: p.preco_venda, fonte: 'produto' })
                }
            })
        }

        if (resEstoque.ok) {
            const estoque = await resEstoque.json()
            estoque.forEach(e => {
                if (!items.some(i => i.nome === e.nome)) {
                    items.push({ nome: e.nome, preco: null, fonte: 'estoque' })
                }
            })
        }
    } catch {}

    if (!items.length) { dropdown.style.display = 'none'; return }

    dropdown.innerHTML = items.slice(0, 15).map(item => `
        <div class="ep-nome-item" tabindex="0"
            style="padding:8px 14px; cursor:pointer; font-size:12px; color:rgba(255,255,255,0.7); border-bottom:1px solid rgba(255,255,255,0.04); display:flex; align-items:center; justify-content:space-between; gap:8px; transition:background 0.15s;"
            onmouseenter="this.style.background='rgba(181,21,21,0.1)'"
            onmouseleave="this.style.background='transparent'"
            data-nome="${item.nome.replace(/"/g, '&quot;')}" data-preco="${item.preco || ''}">
            <span>${item.nome} ${item.fonte === 'produto' ? '<span style="font-size:9px; color:rgba(59,130,246,0.5);">sistema</span>' : ''}</span>
            ${item.preco ? `<span style="font-weight:700; color:rgba(181,21,21,0.8); font-size:12px;">R$ ${parseFloat(item.preco).toFixed(2).replace('.',',')}</span>` : ''}
        </div>
    `).join('')

    dropdown.style.display = 'block'

    dropdown.querySelectorAll('.ep-nome-item').forEach(el => {
        el.onclick = () => {
            const nome = el.getAttribute('data-nome')
            const preco = el.getAttribute('data-preco')
            document.getElementById('ep-nome').value = nome
            if (preco) document.getElementById('ep-preco').value = preco
            dropdown.style.display = 'none'
            document.getElementById('ep-preco').focus()
        }
    })
}

// ── Busca sugestões (pesquisar) ──
let epTimer = null

function epSugestoesLv() {
    const input = document.getElementById('ep-busca')
    input.addEventListener('input', () => {
        clearTimeout(epTimer)
        const q = input.value.trim()
        if (q.length < 2) { document.getElementById('ep-sugestoes').innerHTML = ''; return }
        epTimer = setTimeout(() => epCarregarSugestoes(q), 300)
    })
}

async function epCarregarSugestoes(q) {
    try {
        const res = await fetch(API+`/estoque-placas?q=${encodeURIComponent(q)}`, { headers: authHeaders() })
        if (!res.ok) return
        epResultados = await res.json()
        const container = document.getElementById('ep-sugestoes')
        if (!epResultados.length) { container.innerHTML = ''; return }
        container.innerHTML = epResultados.map(r =>
            `<button class="ep-sug-btn" style="padding:4px 10px; border:1px solid rgba(255,255,255,0.06); border-radius:6px; font-size:11px; font-weight:500; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.03); transition:all 0.2s;"
                onmouseenter="this.style.background='rgba(181,21,21,0.1)';this.style.color='#fff'"
                onmouseleave="this.style.background='rgba(255,255,255,0.03)';this.style.color='rgba(255,255,255,0.6)'">${r.nome}</button>`
        ).join('')
        container.querySelectorAll('.ep-sug-btn').forEach(btn => {
            btn.onclick = () => {
                document.getElementById('ep-busca').value = btn.textContent
                document.getElementById('ep-sugestoes').innerHTML = ''
                epCarregarHistorico(btn.textContent)
            }
        })
    } catch {}
}

// ── Salvar ──
async function epSalvar() {
    const nome = document.getElementById('ep-nome').value.trim()
    const preco = parseFloat(document.getElementById('ep-preco').value)
    const status = document.getElementById('ep-status')

    if (!nome) { status.style.color = '#ef4444'; status.textContent = 'Digite o nome do produto.'; return }
    if (isNaN(preco) || preco <= 0) { status.style.color = '#ef4444'; status.textContent = 'Digite um preço válido.'; return }

    status.style.color = 'rgba(255,255,255,0.4)'; status.textContent = 'Salvando...'

    try {
        const res = await fetch(API+'/estoque-placas', {
            method: 'POST',
            headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
            body: JSON.stringify({ nome, preco })
        })

        if (!res.ok) {
            const err = await res.json()
            status.style.color = '#ef4444'; status.textContent = `Erro: ${err.error}`
            return
        }

        document.getElementById('ep-nome').value = ''
        document.getElementById('ep-preco').value = ''
        document.getElementById('ep-nome').focus()
        status.style.color = '#22c55e'; status.textContent = `✅ "${nome}" salvo com R$ ${preco.toFixed(2).replace('.',',')}!`

        const q = document.getElementById('ep-busca').value.trim()
        if (q) epBuscar()
    } catch (e) {
        status.style.color = '#ef4444'; status.textContent = `Erro ao conectar: ${e.message}`
    }
}

// ── Buscar ──
async function epBuscar() {
    const q = document.getElementById('ep-busca').value.trim()
    if (!q) return
    document.getElementById('ep-sugestoes').innerHTML = ''
    epCarregarHistorico(q)
}

async function epCarregarHistorico(nome) {
    const container = document.getElementById('ep-historico')
    const status = document.getElementById('ep-status')
    status.style.color = 'rgba(255,255,255,0.4)'; status.textContent = 'Carregando...'

    try {
        const res = await fetch(API+`/estoque-placas/historico?nome=${encodeURIComponent(nome)}`, { headers: authHeaders() })
        if (!res.ok) { status.style.color = '#ef4444'; status.textContent = 'Erro ao carregar histórico.'; return }

        const rows = await res.json()

        if (!rows.length) {
            container.innerHTML = `<p style="text-align:center; color:rgba(255,255,255,0.2); font-size:12px; padding:30px 0;">Nenhum registro encontrado para "${nome}"</p>`
            status.textContent = ''
            return
        }

        container.innerHTML = `
            <div style="overflow-x:auto;">
                <table class="dash-table" style="min-width:500px;">
                    <thead>
                        <tr>
                            <th style="padding:12px 16px; text-align:left;">#</th>
                            <th style="padding:12px 16px; text-align:left;">Nome</th>
                            <th style="padding:12px 16px; text-align:right;">Preço</th>
                            <th style="padding:12px 16px; text-align:center;">Data</th>
                            <th style="padding:12px 16px; text-align:center;">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map((r, i) => `
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <td style="padding:10px 16px; color:rgba(255,255,255,0.3); font-size:12px;">${rows.length - i}</td>
                                <td style="padding:10px 16px; font-weight:500; color:rgba(255,255,255,0.85); font-size:13px;">${r.nome}</td>
                                <td style="padding:10px 16px; text-align:right; font-weight:700; color:rgba(181,21,21,0.9); font-size:13px;">R$ ${parseFloat(r.preco).toFixed(2).replace('.',',')}</td>
                                <td style="padding:10px 16px; text-align:center; color:rgba(255,255,255,0.4); font-size:11px;">${new Date(r.created_at).toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}</td>
                                <td style="padding:10px 16px; text-align:center;">
                                    <button class="ep-excluir-btn" data-id="${r.id}"
                                        style="padding:4px 10px; border:1px solid rgba(239,68,68,0.2); border-radius:6px; font-size:10px; font-weight:600; color:#ef4444; cursor:pointer; background:rgba(239,68,68,0.06); transition:all 0.3s;"
                                        onmouseenter="this.style.background='rgba(239,68,68,0.15)'"
                                        onmouseleave="this.style.background='rgba(239,68,68,0.06)'">
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `

        container.querySelectorAll('.ep-excluir-btn').forEach(btn => {
            btn.onclick = async () => {
                if (!confirm('Excluir este registro?')) return
                try {
                    const res = await fetch(API+`/estoque-placas/${btn.getAttribute('data-id')}`, {
                        method: 'DELETE',
                        headers: authHeaders()
                    })
                    if (res.ok) {
                        epCarregarHistorico(nome)
                        status.style.color = '#22c55e'; status.textContent = '✅ Registro excluído!'
                    }
                } catch {}
            }
        })

        status.textContent = ''
    } catch (e) {
        status.style.color = '#ef4444'; status.textContent = `Erro: ${e.message}`
    }
}
