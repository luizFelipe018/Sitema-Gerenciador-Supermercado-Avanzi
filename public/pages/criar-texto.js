let linhasGeradas = []
let autoBuscaTimer = null

async function carregarCriarTexto() {
    setActive('btn-criar-texto')
    setConteudo(`
        <div class="dash-glass dash-animate" style="padding:20px; margin-bottom:20px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
                <h2 style="font-size:18px; font-weight:700; color:#fff; margin:0; display:flex; align-items:center; gap:8px;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    Criar Texto
                </h2>
            </div>

            <div style="display:grid; grid-template-columns:1fr 2fr 1fr; gap:20px; margin-bottom:24px;">
                <div style="min-width:0;">
                    <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3); display:block; margin-bottom:6px;">Código / EAN</label>
                    <div style="display:flex; gap:6px;">
                        <input type="text" id="ct-codigo" autocomplete="off"
                            style="flex:1; min-width:0; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; box-sizing:border-box;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'"
                            oninput="buscarProdutoAuto()"
                            onkeydown="if(event.key==='Enter')buscarProduto()">
                        <button id="ct-btn-buscar" style="padding:10px 12px; border:none; border-radius:10px; font-size:12px; font-weight:700; color:#fff; cursor:pointer; background:rgba(255,255,255,0.08); transition:all 0.2s; display:flex; align-items:center;"
                            onmouseenter="this.style.background='rgba(255,255,255,0.15)'" onmouseleave="this.style.background='rgba(255,255,255,0.08)'"
                            onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform=''">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </button>
                    </div>
                </div>
                <div style="min-width:0;">
                    <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3); display:block; margin-bottom:6px;">Descrição</label>
                    <input type="text" id="ct-descricao" autocomplete="off"
                        style="width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; box-sizing:border-box;"
                        onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                        onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                </div>
                <div style="min-width:0;">
                    <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3); display:block; margin-bottom:6px;">Preço (R$)</label>
                    <input type="text" id="ct-preco" autocomplete="off" placeholder="0,00"
                        style="width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; box-sizing:border-box;"
                        onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                        onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'"
                        onkeydown="if(event.key==='Enter')adicionarLinha()">
                </div>
            </div>

            <div style="display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; align-items:center;">
                <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Opções:</label>
                ${['app','somente loja 1','somente loja 2','fazer arte'].map(opt => `
                    <button class="ct-opcao" data-opt="${opt}" style="padding:7px 14px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:11px; font-weight:600; cursor:pointer; background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.4); transition:all 0.2s; text-transform:uppercase; letter-spacing:0.03em; white-space:nowrap;"
                        onmouseenter="if(!this.classList.contains('active')){this.style.borderColor='rgba(181,21,21,0.3)';this.style.color='#fff'}"
                        onmouseleave="if(!this.classList.contains('active')){this.style.borderColor='rgba(255,255,255,0.08)';this.style.color='rgba(255,255,255,0.4)'}"
                        onclick="toggleOpcao(this)">
                        ${opt === 'app' ? 'APP' : opt === 'fazer arte' ? 'FAZER ARTE' : opt === 'somente loja 1' ? 'LOJA 1' : 'LOJA 2'}
                    </button>
                `).join('')}
                <button id="ct-btn-add" style="padding:7px 20px; border:none; border-radius:8px; font-size:12px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#16a34a,#15803d); box-shadow:0 4px 16px rgba(22,163,74,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; gap:6px; white-space:nowrap;"
                    onmouseenter="this.style.transform='translateY(-2px) scale(1.03)';this.style.boxShadow='0 8px 24px rgba(22,163,74,0.4)'"
                    onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(22,163,74,0.3)'"
                    onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='translateY(-2px) scale(1.03)'">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Adicionar
                </button>
            </div>

            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-wrap:wrap; gap:8px;">
                    <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Linhas geradas <span id="ct-contagem" style="color:rgba(255,255,255,0.15);">(0)</span></label>
                    <div style="display:flex; gap:8px;">
                        <button id="ct-btn-copiar" style="padding:6px 14px; border:none; border-radius:8px; font-size:11px; font-weight:700; color:#fff; cursor:pointer; background:rgba(37,99,235,0.3); transition:all 0.2s; display:flex; align-items:center; gap:4px;"
                            onmouseenter="this.style.background='rgba(37,99,235,0.5)'" onmouseleave="this.style.background='rgba(37,99,235,0.3)'">
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                            Copiar
                        </button>
                        <button id="ct-btn-limpar" style="padding:6px 14px; border:none; border-radius:8px; font-size:11px; font-weight:700; color:#ef4444; cursor:pointer; background:rgba(239,68,68,0.1); transition:all 0.2s; display:flex; align-items:center; gap:4px;"
                            onmouseenter="this.style.background='rgba(239,68,68,0.2)'" onmouseleave="this.style.background='rgba(239,68,68,0.1)'">
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                            Limpar
                        </button>
                    </div>
                </div>
                <textarea id="ct-resultado" rows="8" readonly
                    style="width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:12px 14px; font-size:13px; font-family:monospace; color:rgba(255,255,255,0.7); outline:none; resize:vertical; box-sizing:border-box;"
                    placeholder="As linhas aparecerão aqui..."></textarea>
            </div>
        </div>
    `)

    document.getElementById('ct-btn-buscar').addEventListener('click', buscarProduto)
    document.getElementById('ct-btn-add').addEventListener('click', adicionarLinha)
    document.getElementById('ct-btn-copiar').addEventListener('click', copiarTexto)
    document.getElementById('ct-btn-limpar').addEventListener('click', limparLinhas)
}

function buscarProdutoAuto() {
    clearTimeout(autoBuscaTimer)
    autoBuscaTimer = setTimeout(buscarProduto, 400)
}

function toggleOpcao(el) {
    el.classList.toggle('active')
    if (el.classList.contains('active')) {
        el.style.background = 'rgba(181,21,21,0.2)'
        el.style.borderColor = 'rgba(181,21,21,0.5)'
        el.style.color = '#fff'
    } else {
        el.style.background = 'rgba(255,255,255,0.04)'
        el.style.borderColor = 'rgba(255,255,255,0.08)'
        el.style.color = 'rgba(255,255,255,0.4)'
    }
}

function getOpcoesAtivas() {
    return [...document.querySelectorAll('.ct-opcao.active')].map(b => b.getAttribute('data-opt'))
}

async function buscarProduto() {
    const codigo = document.getElementById('ct-codigo').value.trim()
    if (!codigo) return

    const descInput = document.getElementById('ct-descricao')
    descInput.value = 'Buscando...'
    descInput.style.color = 'rgba(255,255,255,0.3)'

    try {
        const res = await fetch(`${API}/novidades/buscar-produto`, {
            method: 'POST',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ ean: codigo })
        })
        const data = await res.json()
        if (data.encontrado) {
            descInput.value = data.produto.descricao
            descInput.style.color = '#fff'
        } else {
            descInput.value = 'Produto não encontrado'
            descInput.style.color = 'rgba(239,68,68,0.6)'
        }
    } catch {
        descInput.value = 'Erro na busca'
        descInput.style.color = 'rgba(239,68,68,0.6)'
    }
}

function adicionarLinha() {
    const codigo = document.getElementById('ct-codigo').value.trim()
    const descricao = document.getElementById('ct-descricao').value.trim()
    const precoStr = document.getElementById('ct-preco').value.trim()

    if (!codigo || !descricao || !precoStr) return

    const preco = precoStr.replace(',', '.').replace('R$', '').trim()
    if (!preco || isNaN(parseFloat(preco))) return

    const opcoes = getOpcoesAtivas()
    const mapa = { app: 'APP', 'somente loja 1': 'SOMENTE LOJA 1', 'somente loja 2': 'SOMENTE LOJA 2', 'fazer arte': 'FAZER ARTE' }
    const sufixo = opcoes.length ? ' - ' + opcoes.map(o => mapa[o] || o.toUpperCase()).join(' - ') : ''

    const linha = `${codigo} - ${descricao} - ${preco.replace('.', ',')}${sufixo}`
    linhasGeradas.push(linha)
    atualizarResultado()

    document.getElementById('ct-codigo').value = ''
    document.getElementById('ct-descricao').value = ''
    document.getElementById('ct-preco').value = ''
    document.getElementById('ct-codigo').focus()
}

function atualizarResultado() {
    document.getElementById('ct-resultado').value = linhasGeradas.join('\n')
    document.getElementById('ct-contagem').textContent = `(${linhasGeradas.length})`
}

function copiarTexto() {
    const texto = document.getElementById('ct-resultado').value
    if (!texto) return
    navigator.clipboard.writeText(texto).then(() => {
        const btn = document.getElementById('ct-btn-copiar')
        const original = btn.innerHTML
        btn.innerHTML = '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Copiado!'
        btn.style.background = 'rgba(22,163,74,0.3)'
        setTimeout(() => {
            btn.innerHTML = original
            btn.style.background = 'rgba(37,99,235,0.3)'
        }, 2000)
    })
}

function limparLinhas() {
    if (!linhasGeradas.length) return
    linhasGeradas = []
    atualizarResultado()
}