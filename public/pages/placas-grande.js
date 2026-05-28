var plaquesBancoGrande = []
var plaquesSalvasGrande = []
var paginaPlacasGrande = 0
const plaquesPorPaginaGrande = 1
var placaClicadaGrande = null
var _salvandoGrande = false

const CSS_FOLHA_G = `
.folha-grande { display:flex; flex-direction:column; width:100%; height:297mm; margin:0; background:#fff !important; box-sizing:border-box; }
.placa-grande { width:100%; flex:1; border:1px solid #000; background:#fff !important; box-sizing:border-box; }
@media print { @page { size: A4; margin: 0; } .placa-grande > div { padding: 550px 135px 100px 135px !important; } }
`

function carregarEstilos() {
    if (!document.getElementById('placas-main-style')) {
        const link = document.createElement('link')
        link.id = 'placas-main-style'
        link.rel = 'stylesheet'
        link.href = 'style.css'
        document.head.appendChild(link)
    }
}

function atualizarStatusBanco(texto, cor) {
    const el = document.getElementById('pg-status-banco')
    if (el) { el.textContent = texto; if (cor) el.style.color = cor }
}

function quebrarNome(descricao) {
    const palavras = descricao.trim().split(/\s+/)
    if (palavras.length === 1) return { linha1: '', linha2: palavras[0], linha3: '' }
    if (palavras.length === 2) return { linha1: palavras[0], linha2: palavras[1], linha3: '' }
    return {
        linha1: palavras[0],
        linha2: palavras[1],
        linha3: palavras.slice(2).join(' ')
    }
}

async function carregarPlacasGrande() {
    carregarEstilos()
    setActive('btn-placas-grande')
    setConteudo(`
        <div style="max-width:1200px; margin:0 auto;">

            <div class="dash-glass dash-animate" style="padding:20px; margin-bottom:20px;">
                <div id="pg-status-banco" style="font-size:11px; color:rgba(255,255,255,0.3); margin-bottom:10px; padding:6px 10px; border-radius:6px; background:rgba(255,255,255,0.03);">Carregando produtos do banco...</div>
                <div style="display:flex; gap:12px; align-items:end; flex-wrap:wrap; margin-bottom:16px;">
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Código / EAN</label>
                        <input type="text" id="ean-input-g" autocomplete="off" autofocus
                            style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; width:160px; transition:all 0.3s;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                    </div>
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Preço (R$)</label>
                        <input type="number" id="preco-input-g" step="0.01"
                            style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; width:120px; transition:all 0.3s;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                    </div>
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Qtd</label>
                        <input type="number" id="qtd-input-g" value="1" min="1"
                            style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; width:70px; transition:all 0.3s; text-align:center;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                    </div>
                    <button id="btn-add-placa-g" style="padding:10px 20px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.transform='translateY(-2px) scale(1.03)';this.style.boxShadow='0 8px 24px rgba(181,21,21,0.4)'"
                        onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(181,21,21,0.3)'"
                        onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='translateY(-2px) scale(1.03)'">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Adicionar
                    </button>
                    <button id="btn-abrir-busca-g" style="padding:10px 18px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; font-weight:600; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.04); transition:all 0.3s; display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.background='rgba(255,255,255,0.08)';this.style.color='#fafafa'"
                        onmouseleave="this.style.background='rgba(255,255,255,0.04)';this.style.color='rgba(255,255,255,0.6)'">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        Buscar
                    </button>
                    <button id="btn-abrir-import-g" style="padding:10px 18px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; font-weight:600; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.04); transition:all 0.3s; display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.background='rgba(255,255,255,0.08)';this.style.color='#fafafa'"
                        onmouseleave="this.style.background='rgba(255,255,255,0.04)';this.style.color='rgba(255,255,255,0.6)'">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Importar
                    </button>
                </div>
                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding-top:14px; border-top:1px solid rgba(255,255,255,0.06);">
                    <button id="btn-print-atual-g" style="padding:8px 16px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:12px; font-weight:600; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.04); transition:all 0.3s; display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.background='rgba(34,197,94,0.12)';this.style.borderColor='rgba(34,197,94,0.3)';this.style.color='#22c55e'"
                        onmouseleave="this.style.background='rgba(255,255,255,0.04)';this.style.borderColor='rgba(255,255,255,0.08)';this.style.color='rgba(255,255,255,0.6)'">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Pág. Atual
                    </button>
                    <button id="btn-print-tudo-g" style="padding:8px 16px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:12px; font-weight:600; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.04); transition:all 0.3s; display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.background='rgba(34,197,94,0.12)';this.style.borderColor='rgba(34,197,94,0.3)';this.style.color='#22c55e'"
                        onmouseleave="this.style.background='rgba(255,255,255,0.04)';this.style.borderColor='rgba(255,255,255,0.08)';this.style.color='rgba(255,255,255,0.6)'">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Imprimir Tudo
                    </button>

                    <div style="display:flex; align-items:center; gap:6px; margin-left:8px;">
                        <button id="btn-pag-ant-g" style="padding:8px 12px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:12px; color:rgba(255,255,255,0.4); cursor:pointer; background:transparent; transition:all 0.3s; display:flex; align-items:center; gap:4px;"
                            onmouseenter="this.style.background='rgba(255,255,255,0.06)';this.style.color='rgba(255,255,255,0.7)'"
                            onmouseleave="this.style.background='transparent';this.style.color='rgba(255,255,255,0.4)'">
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                            Ant.
                        </button>
                        <span id="contador-pagina-g" style="font-size:12px; font-weight:600; color:rgba(255,255,255,0.35); min-width:100px; text-align:center;">Página 1 de 1</span>
                        <button id="btn-pag-prox-g" style="padding:8px 12px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:12px; color:rgba(255,255,255,0.4); cursor:pointer; background:transparent; transition:all 0.3s; display:flex; align-items:center; gap:4px;"
                            onmouseenter="this.style.background='rgba(255,255,255,0.06)';this.style.color='rgba(255,255,255,0.7)'"
                            onmouseleave="this.style.background='transparent';this.style.color='rgba(255,255,255,0.4)'">
                            Próx.
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                    </div>

                    <button id="btn-limpar-g" style="padding:8px 16px; border:none; border-radius:10px; font-size:12px; font-weight:700; color:#ef4444; cursor:pointer; background:rgba(239,68,68,0.1); margin-left:auto; transition:all 0.3s; display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.background='rgba(239,68,68,0.2)';this.style.transform='scale(1.03)'"
                        onmouseleave="this.style.background='rgba(239,68,68,0.1)';this.style.transform=''">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        Limpar
                    </button>
                </div>
            </div>

            <div id="container-placas-g" style="padding:10px 0;"></div>

        </div>
    `, 'Placas Grande')

    if (plaquesBancoGrande.length === 0) {
        try {
            const res = await fetch(API+'/produtos?page=1&limit=500', { headers: authHeaders() })
            const json = await res.json()
            if (json.data && Array.isArray(json.data)) {
                plaquesBancoGrande = json.data.map(p => ({
                    ...p,
                    preco_venda: parseFloat(p.preco_venda),
                    quantidade_kg_l: parseFloat(p.quantidade_kg_l || 0)
                }))
                atualizarStatusBanco(`✓ ${plaquesBancoGrande.length} produto(s) carregado(s)`)
            } else {
                atualizarStatusBanco('✗ Nenhum produto encontrado no banco', '#ef4444')
            }
        } catch {
            atualizarStatusBanco('✗ Erro ao carregar produtos', '#ef4444')
        }
    } else {
        atualizarStatusBanco(`✓ ${plaquesBancoGrande.length} produto(s) em memória`)
    }

    try {
        const res = await fetch(API+'/registros-placas?tipo=grande', { headers: authHeaders() })
        const data = await res.json()
        if (Array.isArray(data)) {
            plaquesSalvasGrande = data.map(p => ({
                ...p,
                preco: parseFloat(p.preco),
                quantidade_kg_l: parseFloat(p.quantidade_kg_l || 0),
                id_unico: Date.now() + Math.random()
            }))
        }
    } catch { console.error('Erro ao carregar placas grandes salvas') }

    renderizarPlacasGrande()
    vincularEventosPlacasGrande()
}

function montarPlacaGrandeHTML(p) {
    const { linha1, linha2, linha3 } = quebrarNome(p.descricao || '')
    const preco = parseFloat(p.preco)
    const precoFmt = preco.toFixed(2).replace('.', ',')
    const [reais, cents] = precoFmt.split(',')

    const qtdKgL = parseFloat(p.quantidade_kg_l)
    const uni = p.descricao_kglt?.toUpperCase() === 'UNIDADE' ? 'UN'
              : p.descricao_kglt?.toUpperCase() === 'QUILO'   ? 'KG'
              : p.descricao_kglt?.toUpperCase() === 'LITRO'   ? 'LT'
              : p.descricao_kglt?.toUpperCase() || ''
    const art = uni === 'UN' ? 'A' : 'O'
    const precoUn = (qtdKgL > 0) ? (preco / qtdKgL).toFixed(2).replace('.', ',') : null

    const rodape = precoUn
        ? `NESTA EMBALAGEM ${art} ${uni} SAI A R$ ${precoUn}`
        : ''

    return `
        <div style="
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 8mm 10mm;
            box-sizing: border-box;
            font-family: 'Segoe UI', sans-serif;
            font-weight: bold;
            text-align: center;
            overflow: hidden;
        ">
            <div style="width:100%; text-align:center;">
                <div data-field="linha1" style="font-size:22px; font-weight:bold; text-transform:uppercase; letter-spacing:2px; white-space:nowrap; overflow:hidden;">${linha1}</div>
            </div>

            <div style="width:100%; text-align:center; flex:1; display:flex; align-items:center; justify-content:center;">
                <div data-field="linha2" style="font-size:520px; font-weight:900; text-transform:uppercase; line-height:1; letter-spacing:2px; white-space:nowrap; overflow:hidden;">${linha2}</div>
            </div>

            <div style="width:100%; text-align:center;">
                <div data-field="linha3" style="font-size:16px; font-weight:bold; text-transform:uppercase; white-space:nowrap; overflow:hidden;">${linha3}</div>
            </div>

            <div style="width:100%; display:flex; align-items:flex-end; justify-content:center; margin: 4mm 0 2mm;">
                <span style="font-size:20px; font-weight:bold; margin-bottom:12px; margin-right:3px; position:relative; top:25px;">R$</span>
                <span data-field="preco" style="font-size:90px; font-weight:900; line-height:1;">${reais},${cents}</span>
                <span style="font-size:16px; font-weight:bold; margin-bottom:14px; margin-left:4px;">${uni}</span>
            </div>

            <div style="width:100%; text-align:center; border-top:1px solid #000; padding-top:3px;">
                <div data-field="rodape" style="font-size:11px; font-weight:bold;">${rodape}</div>
            </div>
        </div>
    `
}

function renderizarPlacasGrande() {
    const container = document.getElementById('container-placas-g')
    if (!container) return
    container.innerHTML = ''

    const totalPaginas = Math.ceil(plaquesSalvasGrande.length / plaquesPorPaginaGrande) || 1
    if (paginaPlacasGrande >= totalPaginas) paginaPlacasGrande = totalPaginas - 1

    const contadorEl = document.getElementById('contador-pagina-g')
    if (contadorEl) contadorEl.innerText = `Página ${paginaPlacasGrande + 1} de ${totalPaginas}`

    const lista = plaquesSalvasGrande.slice(
        paginaPlacasGrande * plaquesPorPaginaGrande,
        (paginaPlacasGrande + 1) * plaquesPorPaginaGrande
    )
    if (!lista.length) {
        container.innerHTML = `
            <div style="text-align:center; padding:60px 20px; border-radius:16px; border:1px dashed rgba(255,255,255,0.08);">
                <svg width="40" height="40" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:12px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                <p style="color:rgba(255,255,255,0.2); font-size:13px;">Nenhuma placa grande adicionada</p>
                <p style="color:rgba(255,255,255,0.1); font-size:11px; margin-top:4px;">Digite um código e preço acima para começar</p>
            </div>`
        return
    }

    const folha = document.createElement('div')
    folha.className = 'folha-grande'
    folha.style.animation = 'dashFadeUp 0.3s ease'

    lista.forEach(p => {
        const div = document.createElement('div')
        div.className = 'placa-grande'
        div.innerHTML = montarPlacaGrandeHTML(p)

        div.querySelectorAll('[data-field]').forEach(el => {
            el.style.cursor = 'pointer'
            el.ondblclick = () => {
                const field = el.getAttribute('data-field')
                const input = document.createElement('input')
                input.value = el.innerText.trim()
                input.style.cssText = 'width:90%; font-size:' + el.style.fontSize + '; font-weight:bold; text-align:center; border:2px solid #b51515; border-radius:6px; background:#fff; color:#000; outline:none; padding:2px 6px; font-family:\'Segoe UI\',sans-serif;'
                el.replaceWith(input)
                input.focus(); input.select()

                const fechar = async () => {
                    const v = input.value.trim()
                    if (!v) { renderizarPlacasGrande(); return }
                    if (field === 'preco') {
                        p.preco = parseFloat(v.replace(',', '.'))
                        const qtdKgL = parseFloat(p.quantidade_kg_l)
                        p.preco_info = qtdKgL > 0 ? (p.preco / qtdKgL).toFixed(2).replace('.', ',') : p.preco.toFixed(2)
                    } else if (field === 'linha1') {
                        const palavras = p.descricao.trim().split(/\s+/)
                        palavras[0] = v.toUpperCase()
                        p.descricao = palavras.join(' ')
                    } else if (field === 'linha2') {
                        const palavras = p.descricao.trim().split(/\s+/)
                        palavras[1] = v.toUpperCase()
                        p.descricao = palavras.join(' ')
                    } else if (field === 'linha3') {
                        const palavras = p.descricao.trim().split(/\s+/)
                        const novoResto = v.toUpperCase().split(/\s+/)
                        p.descricao = [...palavras.slice(0, 2), ...novoResto].join(' ')
                    }
                    await salvarERenderizarGrande()
                }
                input.onkeydown = (ev) => { if (ev.key === 'Enter') fechar(); if (ev.key === 'Escape') renderizarPlacasGrande() }
                input.onblur = fechar
            }
        })

        div.oncontextmenu = (e) => {
            e.preventDefault()
            placaClicadaGrande = p
            const menu = document.getElementById('contextMenu')
            menu.style.display = 'block'
            menu.style.top = e.clientY + 'px'
            menu.style.left = e.clientX + 'px'
        }

        folha.appendChild(div)
    })

    container.appendChild(folha)
}

async function onExcluirPlacaGrande() {
    const idx = plaquesSalvasGrande.indexOf(placaClicadaGrande)
    if (idx === -1) return
    plaquesSalvasGrande.splice(idx, 1)
    await salvarERenderizarGrande()
}

async function salvarERenderizarGrande() {
    if (_salvandoGrande) return
    _salvandoGrande = true
    try {
        await fetch(API+'/registros-placas', {
            method: 'POST',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'grande', placas: plaquesSalvasGrande })
        })
    } catch (e) { console.error('Erro ao salvar placas grandes:', e) }
    _salvandoGrande = false
    renderizarPlacasGrande()
}

function mudarPaginaPlacasGrande(v) {
    const total = Math.ceil(plaquesSalvasGrande.length / plaquesPorPaginaGrande)
    paginaPlacasGrande = Math.max(0, Math.min(paginaPlacasGrande + v, total - 1))
    renderizarPlacasGrande()
}

function imprimirTudoGrande() {
    if (!plaquesSalvasGrande.length) {
        alert('Nenhuma placa para imprimir.')
        return
    }
    
    const container = document.getElementById('container-placas-g')
    const paginaOriginal = paginaPlacasGrande
    container.innerHTML = ''
    
    for (let i = 0; i < plaquesSalvasGrande.length; i += plaquesPorPaginaGrande) {
        const folha = document.createElement('div')
        folha.className = 'folha-grande'
        const placasNaFolha = plaquesSalvasGrande.slice(i, i + plaquesPorPaginaGrande)
        
        if (!placasNaFolha.length) continue
        
        placasNaFolha.forEach(p => {
            const div = document.createElement('div')
            div.className = 'placa-grande'
            div.innerHTML = montarPlacaGrandeHTML(p)
            folha.appendChild(div)
        })
        container.appendChild(folha)
    }
    
    setTimeout(() => {
        printFolha(container.innerHTML, CSS_FOLHA_G)
        setTimeout(() => {
            paginaPlacasGrande = paginaOriginal
            renderizarPlacasGrande()
            registrarImpressaoPlacas()
        }, 1000)
    }, 500)
}

async function adicionarPlacaGrande() {
    const codigo = document.getElementById('ean-input-g').value.trim()
    const precoRaw = document.getElementById('preco-input-g').value
    const preco = parseFloat(precoRaw.replace(',', '.'))
    const quantidade = parseInt(document.getElementById('qtd-input-g').value) || 1
    if (!codigo || isNaN(preco)) return

    let prod = plaquesBancoGrande.find(p => String(p.ean) === codigo) || plaquesBancoGrande.find(p => String(p.codigo) === codigo)

    if (!prod) {
        try {
            const url = API+'/produtos/'+encodeURIComponent(codigo)
            const res = await fetch(url, { headers: authHeaders() })
            if (res.ok) {
                const p = await res.json()
                plaquesBancoGrande.push(p)
                prod = p
            }
        } catch {}
    }
    if (!prod) {
        try {
            const url = API+'/produtos/busca/ean/'+encodeURIComponent(codigo)
            const res = await fetch(url, { headers: authHeaders() })
            if (res.ok) {
                const p = await res.json()
                plaquesBancoGrande.push(p)
                prod = p
            }
        } catch {}
    }

    if (prod) {
        const qtdKgL = parseFloat(prod.quantidade_kg_l)
        const precoUn = qtdKgL > 0 ? (preco / qtdKgL).toFixed(2).replace('.', ',') : prod.preco_venda
        for (let i = 0; i < quantidade; i++) {
            plaquesSalvasGrande.push({ ...prod, preco, preco_info: precoUn, id_unico: Date.now() + Math.random() })
        }
        await salvarERenderizarGrande()
        const novasPlacasG = []
        for (let i = 0; i < quantidade; i++) {
            novasPlacasG.push({ descricao: prod.descricao, codigo: prod.codigo, ean: prod.ean, preco, tipo_placa: 'grande' })
        }
        registrarLogPlacas(novasPlacasG)
        document.getElementById('ean-input-g').value = ''
        document.getElementById('preco-input-g').value = ''
        document.getElementById('qtd-input-g').value = 1
        document.getElementById('ean-input-g').focus()
    } else {
        alert('Produto não encontrado. Verifique o código e tente novamente.')
    }
}

function abrirBuscaNomeGrande() {
    document.getElementById('modal-busca-g').style.display = 'block'
    document.getElementById('input-busca-nome-g').value = ''
    document.querySelector('#tabela-busca-g tbody').innerHTML = ''
    document.getElementById('input-busca-nome-g').focus()
}

async function onBuscaNomeKeydownGrande(e) {
    if (e.key !== 'Enter') return
    const termo = e.target.value.trim()
    if (!termo || termo.length < 2) return

    const tbody = document.querySelector('#tabela-busca-g tbody')
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:10px;color:#999;">Buscando...</td></tr>'

    try {
        const res = await fetch(API+`/produtos/busca?q=${encodeURIComponent(termo)}`, { headers: authHeaders() })
        const resultados = await res.json()

        if (!resultados.length) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:10px;color:#999;">Nenhum produto encontrado</td></tr>'
            return
        }

        tbody.innerHTML = resultados.map((p, i) => `
            <tr data-index="${i}" style="cursor:pointer; border-bottom:1px solid #f0f0f0;"
                onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background=''">
                <td style="padding:8px 12px; font-size:12px; color:#666;">${p.codigo}</td>
                <td style="padding:8px 12px; font-size:13px;">${p.descricao}</td>
                <td style="padding:8px 12px; font-size:13px; text-align:right;">R$ ${parseFloat(p.preco_venda || 0).toFixed(2).replace('.', ',')}</td>
            </tr>
        `).join('')

        tbody.querySelectorAll('tr').forEach(tr => {
            tr.onclick = () => {
                const i = parseInt(tr.getAttribute('data-index'))
                document.getElementById('ean-input-g').value = resultados[i].codigo
                document.getElementById('preco-input-g').value = resultados[i].preco_venda != null ? resultados[i].preco_venda : ''
                fecharModaisGrande()
                document.getElementById('preco-input-g').focus()
            }
        })
    } catch {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:10px;color:#ef4444;">Erro na busca</td></tr>'
    }
}

function extrairKgLtG(desc) {
    const m = desc.match(/(\d+[.,]?\d*)\s*(KG|G|L|ML)/)
    if (!m) return 0
    const val = parseFloat(m[1].replace(',', '.'))
    if (isNaN(val) || val <= 0) return 0
    const unid = m[2]
    if (unid === 'KG' || unid === 'L') return val
    if (unid === 'G' || unid === 'ML') return val / 1000
    return 0
}

async function processarImportacaoGrande() {
    const texto = document.getElementById('import-texto-g').value.trim()
    if (!texto) return
    const qtdGlobal = parseInt(document.getElementById('qtd-input-g')?.value) || 1
    const logErros = document.getElementById('log-erros-g')
    const listaErros = document.getElementById('lista-erros-g')
    listaErros.innerHTML = ''
    logErros.style.display = 'none'
    let contador = 0

    for (const linha of texto.split(/\r?\n/)) {
        const colunas = linha.split(/\t| {2,}/)
        if (colunas.length >= 2) {
            const descProcurada = colunas[0].trim().toUpperCase()
            const precoNovo = parseFloat(colunas[1].replace('R$', '').replace(/\s/g, '').replace(',', '.').trim())
            if (!isNaN(precoNovo)) {
                let prod = plaquesBancoGrande.find(p => p.descricao?.toUpperCase() === descProcurada) ||
                           plaquesBancoGrande.find(p => p.descricao?.toUpperCase().includes(descProcurada))
                if (!prod) {
                    try {
                        const res = await fetch(API+'/produtos/busca?q='+encodeURIComponent(descProcurada), { headers: authHeaders() })
                        if (res.ok) {
                            const lista = await res.json()
                            if (lista.length > 0) {
                                const res2 = await fetch(API+'/produtos/'+encodeURIComponent(lista[0].codigo), { headers: authHeaders() })
                                if (res2.ok) {
                                    const p = await res2.json()
                                    plaquesBancoGrande.push(p)
                                    prod = p
                                }
                            }
                        }
                    } catch {}
                }
                if (prod) {
                    const qtdKgL = parseFloat(prod.quantidade_kg_l)
                    const precoUn = qtdKgL > 0 ? (precoNovo / qtdKgL).toFixed(2).replace('.', ',') : prod.preco_venda
                    for (let i = 0; i < qtdGlobal; i++) {
                        plaquesSalvasGrande.push({ ...prod, preco: precoNovo, preco_info: precoUn, id_unico: Date.now() + Math.random() })
                    }
                    contador++
                } else {
                    const qtdKgL = extrairKgLtG(descProcurada)
                    const precoUn = qtdKgL > 0 ? (precoNovo / qtdKgL).toFixed(2).replace('.', ',') : precoNovo.toFixed(2).replace('.', ',')
                    for (let i = 0; i < qtdGlobal; i++) {
                        plaquesSalvasGrande.push({ descricao: colunas[0].trim(), codigo: '', ean: '', preco: precoNovo, preco_info: precoUn, quantidade_kg_l: qtdKgL, id_unico: Date.now() + Math.random() })
                    }
                    contador++
                }
            }
        }
    }

    fecharModaisGrande()
    alert(`${contador} placa(s) gerada(s).`)
    await salvarERenderizarGrande()
    document.getElementById('import-texto-g').value = ''
}

function fecharModaisGrande() {
    document.getElementById('modal-busca-g').style.display = 'none'
    document.getElementById('modal-import-g').style.display = 'none'
    if (document.getElementById('log-erros-g')) document.getElementById('log-erros-g').style.display = 'none'
}

function vincularEventosPlacasGrande() {
    const eanInput   = document.getElementById('ean-input-g')
    const precoInput = document.getElementById('preco-input-g')
    const qtdInput   = document.getElementById('qtd-input-g')
    if (!eanInput) return

    document.getElementById('btn-add-placa-g').onclick    = adicionarPlacaGrande
    document.getElementById('btn-abrir-busca-g').onclick  = abrirBuscaNomeGrande
    document.getElementById('btn-abrir-import-g').onclick = () => {
        document.getElementById('modal-import-g').style.display = 'block'
        document.getElementById('import-texto-g').focus()
    }
    document.getElementById('btn-print-atual-g').onclick  = () => {
        const folha = document.querySelector('#container-placas-g .folha-grande')
        if (!folha) return
        printFolha(folha.outerHTML, CSS_FOLHA_G)
        setTimeout(registrarImpressaoPlacas, 1000)
    }
    document.getElementById('btn-print-tudo-g').onclick   = imprimirTudoGrande
    document.getElementById('btn-pag-ant-g').onclick      = () => mudarPaginaPlacasGrande(-1)
    document.getElementById('btn-pag-prox-g').onclick     = () => mudarPaginaPlacasGrande(1)
    document.getElementById('btn-limpar-g').onclick       = () => {
        if (confirm('Limpar todas as placas grandes?')) { plaquesSalvasGrande = []; salvarERenderizarGrande() }
    }

    eanInput.addEventListener('keyup', (e) => {
        if (eanInput.value.length >= 13 || e.key === 'Enter') {
            e.preventDefault(); precoInput.focus(); precoInput.select()
        }
    })
    precoInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); qtdInput.focus(); qtdInput.select() }
    })
    qtdInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); adicionarPlacaGrande() }
    })

    document.getElementById('btn-processar-import-g').onclick = processarImportacaoGrande
    document.getElementById('input-busca-nome-g').addEventListener('keydown', onBuscaNomeKeydownGrande)
    document.getElementById('fechar-busca-g').onclick  = fecharModaisGrande
    document.getElementById('fechar-import-g').onclick = fecharModaisGrande
}
