var plaquesBancoAmarela = []
var plaquesSalvasAmarela = []
var paginaPlacasAmarela = 0
const plaquesPorPaginaAmarela = 8
var placaClicadaAmarela = null
var imprimindo = false

const CSS_FOLHA_AM = `
.folha-amarela { display:flex; flex-wrap:wrap; align-content:flex-start; width:100%; height:297mm; margin:0; padding:5mm; background:#fff !important; box-sizing:border-box; position:relative; }
.folha-amarela::before { content:""; position:absolute; inset:0; background:#fff !important; z-index:0; }
.folha-amarela > * { position:relative; z-index:1; }
.placa-amarela { width:50%; height:24.3%; border:1px solid #000; padding:5px; background:#ffe400 !important; box-sizing:border-box; display:flex; flex-direction:column; justify-content:space-between; align-items:center; text-align:center; overflow:hidden; }
.placa-amarela, .placa-amarela h1 { font-family:'Segoe UI',sans-serif !important; font-weight:bold !important; }
.placa-amarela h1 { width:100%; margin:0; display:flex; align-items:center; justify-content:center; overflow:hidden; color:#000 !important; }
.placa-amarela h1:first-child { font-size:40px; text-decoration:underline; }
.placa-amarela h1:nth-child(2) { font-size:16px; }
.placa-amarela h1:nth-child(3) { font-size:92px; }
.placa-amarela h1:nth-child(3) span { font-size:18px; position:relative; top:25px; }
.placa-amarela h1:nth-child(4) { font-size:16px; }
.placa-amarela h1:nth-child(5) { font-size:16px; }
`
var _salvandoAmarela = false
var _dragIdxAm = -1

function carregarEstilos() {
    if (!document.getElementById('placas-main-style')) {
        const link = document.createElement('link')
        link.id = 'placas-main-style'
        link.rel = 'stylesheet'
        link.href = 'style.css'
        document.head.appendChild(link)
    }
}

async function carregarPlacasAmarela() {
    carregarEstilos()
    setActive('btn-placas-amarela')
    setConteudo(`
        <div style="max-width:1200px; margin:0 auto;">

            <div class="dash-glass dash-animate" style="padding:20px; margin-bottom:20px;">
                <div style="display:flex; gap:12px; align-items:end; flex-wrap:wrap; margin-bottom:16px;">
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Código / EAN</label>
                        <input type="text" id="ean-input-am" autocomplete="off" autofocus
                            style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; width:160px; transition:all 0.3s;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                    </div>
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Preço (R$)</label>
                        <input type="number" id="preco-input-am" step="0.01"
                            style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; width:120px; transition:all 0.3s;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                    </div>
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Qtd</label>
                        <input type="number" id="qtd-input-am" value="1" min="1"
                            style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; width:70px; transition:all 0.3s; text-align:center;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                    </div>
                    <button id="btn-add-placa-am" style="padding:10px 20px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.transform='translateY(-2px) scale(1.03)';this.style.boxShadow='0 8px 24px rgba(181,21,21,0.4)'"
                        onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(181,21,21,0.3)'"
                        onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='translateY(-2px) scale(1.03)'">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Adicionar
                    </button>
                    <button id="btn-abrir-busca-am" style="padding:10px 18px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; font-weight:600; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.04); transition:all 0.3s; display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.background='rgba(255,255,255,0.08)';this.style.color='#fafafa'"
                        onmouseleave="this.style.background='rgba(255,255,255,0.04)';this.style.color='rgba(255,255,255,0.6)'">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        Buscar
                    </button>
                    <button id="btn-abrir-import-am" style="padding:10px 18px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; font-weight:600; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.04); transition:all 0.3s; display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.background='rgba(255,255,255,0.08)';this.style.color='#fafafa'"
                        onmouseleave="this.style.background='rgba(255,255,255,0.04)';this.style.color='rgba(255,255,255,0.6)'">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Importar
                    </button>
                </div>
                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding-top:14px; border-top:1px solid rgba(255,255,255,0.06);">
                    <button id="btn-print-atual-am" style="padding:8px 16px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:12px; font-weight:600; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.04); transition:all 0.3s; display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.background='rgba(34,197,94,0.12)';this.style.borderColor='rgba(34,197,94,0.3)';this.style.color='#22c55e'"
                        onmouseleave="this.style.background='rgba(255,255,255,0.04)';this.style.borderColor='rgba(255,255,255,0.08)';this.style.color='rgba(255,255,255,0.6)'">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Pág. Atual
                    </button>
                    <button id="btn-print-tudo-am" style="padding:8px 16px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:12px; font-weight:600; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.04); transition:all 0.3s; display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.background='rgba(34,197,94,0.12)';this.style.borderColor='rgba(34,197,94,0.3)';this.style.color='#22c55e'"
                        onmouseleave="this.style.background='rgba(255,255,255,0.04)';this.style.borderColor='rgba(255,255,255,0.08)';this.style.color='rgba(255,255,255,0.6)'">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Imprimir Tudo
                    </button>

                    <div style="display:flex; align-items:center; gap:6px; margin-left:8px;">
                        <button id="btn-pag-ant-am" style="padding:8px 12px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:12px; color:rgba(255,255,255,0.4); cursor:pointer; background:transparent; transition:all 0.3s; display:flex; align-items:center; gap:4px;"
                            onmouseenter="this.style.background='rgba(255,255,255,0.06)';this.style.color='rgba(255,255,255,0.7)'"
                            onmouseleave="this.style.background='transparent';this.style.color='rgba(255,255,255,0.4)'">
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                            Ant.
                        </button>
                        <span id="contador-pagina-am" style="font-size:12px; font-weight:600; color:rgba(255,255,255,0.35); min-width:100px; text-align:center;">Página 1 de 1</span>
                        <button id="btn-pag-prox-am" style="padding:8px 12px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:12px; color:rgba(255,255,255,0.4); cursor:pointer; background:transparent; transition:all 0.3s; display:flex; align-items:center; gap:4px;"
                            onmouseenter="this.style.background='rgba(255,255,255,0.06)';this.style.color='rgba(255,255,255,0.7)'"
                            onmouseleave="this.style.background='transparent';this.style.color='rgba(255,255,255,0.4)'">
                            Próx.
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                    </div>

                    <button id="btn-limpar-am" style="padding:8px 16px; border:none; border-radius:10px; font-size:12px; font-weight:700; color:#ef4444; cursor:pointer; background:rgba(239,68,68,0.1); margin-left:auto; transition:all 0.3s; display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.background='rgba(239,68,68,0.2)';this.style.transform='scale(1.03)'"
                        onmouseleave="this.style.background='rgba(239,68,68,0.1)';this.style.transform=''">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        Limpar
                    </button>
                </div>
            </div>

            <div id="container-placas-am" style="padding:10px 0;"></div>

        </div>
    `, 'Placas Amarelas')

    if (plaquesBancoAmarela.length === 0) {
        try {
            const res = await fetch(API+'/produtos?page=1&limit=500', { headers: authHeaders() })
            const json = await res.json()
            if (json.data && Array.isArray(json.data)) {
                plaquesBancoAmarela = json.data.map(p => ({
                    ...p,
                    preco_venda: parseFloat(p.preco_venda),
                    quantidade_kg_l: parseFloat(p.quantidade_kg_l || 0)
                }))
            }
        } catch { console.error('Erro ao carregar banco de placas amarelas') }
    }

    try {
        const res = await fetch(API+'/registros-placas?tipo=amarela', { headers: authHeaders() })
        const data = await res.json()
        if (Array.isArray(data)) {
            plaquesSalvasAmarela = data.map(p => ({
                ...p,
                preco: parseFloat(p.preco),
                quantidade_kg_l: parseFloat(p.quantidade_kg_l || 0),
                id_unico: Date.now() + Math.random()
            }))
        }
    } catch { console.error('Erro ao carregar placas amarelas salvas') }

    renderizarPlacasAmarela()
    vincularEventosPlacasAmarela()
    window._placasAtuais = plaquesSalvasAmarela
}

function vincularEventosPlacasAmarela() {
    const eanInput = document.getElementById('ean-input-am')
    const precoInput = document.getElementById('preco-input-am')
    const qtdInput = document.getElementById('qtd-input-am')
    if (!eanInput) return

    document.getElementById('btn-add-placa-am').onclick = adicionarPlacaAmarela
    document.getElementById('btn-abrir-busca-am').onclick = abrirBuscaNomeAmarela
    document.getElementById('btn-abrir-import-am').onclick = () => {
        document.getElementById('modal-import-am').style.display = 'block'
        document.getElementById('import-texto-am').focus()
    }
    document.getElementById('btn-print-atual-am').onclick = () => {
        const folha = document.querySelector('#container-placas-am .folha-amarela')
        if (!folha) return
        printFolha(folha.outerHTML, CSS_FOLHA_AM)
        setTimeout(registrarImpressaoPlacas, 1000)
    }
    document.getElementById('btn-print-tudo-am').onclick = imprimirTudoAmarela;
    document.getElementById('btn-pag-ant-am').onclick = () => mudarPaginaPlacasAmarela(-1)
    document.getElementById('btn-pag-prox-am').onclick = () => mudarPaginaPlacasAmarela(1)
    document.getElementById('btn-limpar-am').onclick = () => {
        if (confirm('Limpar todas as placas amarelas?')) { plaquesSalvasAmarela = []; salvarERenderizarAmarela() }
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
        if (e.key === 'Enter') { e.preventDefault(); adicionarPlacaAmarela() }
    })

    document.getElementById('btn-processar-import-am').onclick = processarImportacaoAmarela
    document.getElementById('input-busca-nome-am').addEventListener('keydown', onBuscaNomeKeydownAmarela)
}

async function adicionarPlacaAmarela() {
    const codigo = document.getElementById('ean-input-am').value.trim()
    const preco = parseFloat(document.getElementById('preco-input-am').value)
    const quantidade = parseInt(document.getElementById('qtd-input-am').value) || 1
    if (!codigo || isNaN(preco)) return

    let prod = plaquesBancoAmarela.find(p => String(p.ean) === codigo) || plaquesBancoAmarela.find(p => String(p.codigo) === codigo)

    if (!prod) {
        try {
            const res = await fetch(API+'/produtos/busca/ean/'+encodeURIComponent(codigo), { headers: authHeaders() })
            if (res.ok) {
                const p = await res.json()
                plaquesBancoAmarela.push(p)
                prod = p
            }
        } catch {}
    }
    if (!prod) {
        try {
            const res = await fetch(API+'/produtos/'+encodeURIComponent(codigo), { headers: authHeaders() })
            if (res.ok) {
                const p = await res.json()
                plaquesBancoAmarela.push(p)
                prod = p
            }
        } catch {}
    }

    if (prod) {
        const qtdKgL = parseFloat(prod.quantidade_kg_l)
        const precoUn = qtdKgL > 0 ? (preco / qtdKgL).toFixed(2).replace('.', ',') : prod.preco_venda
        for (let i = 0; i < quantidade; i++) {
            plaquesSalvasAmarela.push({ ...prod, preco, preco_info: precoUn, id_unico: Date.now() + Math.random() })
        }
        await salvarERenderizarAmarela()
        document.getElementById('ean-input-am').value = ''
        document.getElementById('preco-input-am').value = ''
        document.getElementById('qtd-input-am').value = 1
        document.getElementById('ean-input-am').focus()
    } else {
        alert('Produto não encontrado. Verifique o código e tente novamente.')
    }
}

function renderizarPlacasAmarela() {
    const container = document.getElementById('container-placas-am')
    if (!container) return
    container.innerHTML = ''

    const totalPaginas = Math.ceil(plaquesSalvasAmarela.length / plaquesPorPaginaAmarela) || 1
    if (paginaPlacasAmarela >= totalPaginas) paginaPlacasAmarela = totalPaginas - 1

    const contadorEl = document.getElementById('contador-pagina-am')
    if (contadorEl) contadorEl.innerText = `Página ${paginaPlacasAmarela + 1} de ${totalPaginas}`

    const lista = plaquesSalvasAmarela.slice(paginaPlacasAmarela * plaquesPorPaginaAmarela, (paginaPlacasAmarela + 1) * plaquesPorPaginaAmarela)
    if (!lista.length) {
        container.innerHTML = `
            <div style="text-align:center; padding:60px 20px; border-radius:16px; border:1px dashed rgba(255,255,255,0.08);">
                <svg width="40" height="40" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:12px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                <p style="color:rgba(255,255,255,0.2); font-size:13px;">Nenhuma placa amarela adicionada</p>
                <p style="color:rgba(255,255,255,0.1); font-size:11px; margin-top:4px;">Digite um código e preço acima para começar</p>
            </div>`
        return
    }

    const folha = document.createElement('div')
    folha.className = 'folha-amarela'
    folha.style.animation = 'dashFadeUp 0.3s ease'

    lista.forEach((p, i) => {
        const div = document.createElement('div')
        div.className = 'placa-amarela'
        div.draggable = true
        div.dataset.idx = paginaPlacasAmarela * plaquesPorPaginaAmarela + i
        const uni = p.descricao_kglt?.toUpperCase() === 'UNIDADE' ? 'UN' : (p.descricao_kglt?.toUpperCase() || '')
        const art = uni === 'UN' ? 'A' : 'O'
        const textoEan = (p.ean && p.ean.toString().trim() !== '') ? `Cód.${p.ean}` : ''

        div.innerHTML = `
            <h1 style="font-size:40px;  text-decoration: underline;">OFERTA</h1>
            <h1 style="font-size:16px;" data-field="descricao">${p.descricao || ''}</h1>
            <h1 style="font-size:92px;" data-field="preco"><span style="font-size:18px; position:relative; top:25px;">R$</span> ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</h1>
            <h1 style="font-size:16px;" data-field="info">${p.preco_info ? `NESTA EMBALAGEM ${art} ${uni} SAI R$ ${p.preco_info}` : ''}</h1>
            <h1 style="font-size:16px;" data-field="ean">${textoEan}</h1>
        `

        div.querySelectorAll('h1').forEach(h => {
            h.ondblclick = () => {
                const field = h.getAttribute('data-field')
                const input = document.createElement('input')
                const valorOriginal = h.innerText.replace('R$', '').replace('Cód.', '').replace(/NESTA EMBALAGEM .* SAI R\$/i, '').trim()
                input.value = valorOriginal
                input.style.cssText = 'width:90%; font-size:' + h.style.fontSize + '; text-align:center; font-weight:bold; border:2px solid #b51515; border-radius:6px; background:#ffe400; color:#000; outline:none; padding:2px 6px;'
                h.replaceWith(input)
                input.focus()

                const fechar = async () => {
                    const v = input.value.trim()
                    if (v !== '') {
                        if (field === 'preco') {
                            p.preco = parseFloat(v.replace(',', '.'))
                            const qtdKgL = parseFloat(p.quantidade_kg_l)
                            p.preco_info = qtdKgL > 0 ? (p.preco / qtdKgL).toFixed(2).replace('.', ',') : p.preco.toFixed(2)
                        } else if (field === 'ean') { p.ean = v }
                        else if (field === 'info') { p.preco_info = v }
                        else if (field === 'descricao') { p.descricao = v.toUpperCase() }
                        await salvarERenderizarAmarela()
                    } else {
                        if (field === 'ean') { p.ean = ''; await salvarERenderizarAmarela() } else { renderizarPlacasAmarela() }
                    }
                }
                input.onkeydown = (ev) => { if (ev.key === 'Enter') fechar(); if (ev.key === 'Escape') renderizarPlacasAmarela() }
                input.onblur = fechar
            }
        })

        div.oncontextmenu = (e) => {
            e.preventDefault()
            placaClicadaAmarela = p
            const menu = document.getElementById('contextMenu')
            menu.style.display = 'block'
            menu.style.top = e.clientY + 'px'
            menu.style.left = e.clientX + 'px'
        }

        div.ondragstart = (e) => {
            _dragIdxAm = parseInt(div.dataset.idx)
            e.dataTransfer.effectAllowed = 'move'
            div.style.opacity = '0.4'
        }
        div.ondragover = (e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
            div.classList.add('drag-over')
        }
        div.ondragleave = () => {
            div.classList.remove('drag-over')
        }
        div.ondrop = (e) => {
            e.preventDefault()
            div.classList.remove('drag-over')
            const destino = parseInt(div.dataset.idx)
            if (_dragIdxAm !== -1 && _dragIdxAm !== destino) {
                const [item] = plaquesSalvasAmarela.splice(_dragIdxAm, 1)
                plaquesSalvasAmarela.splice(destino, 0, item)
                salvarERenderizarAmarela()
            }
            _dragIdxAm = -1
        }
        div.ondragend = () => {
            div.style.opacity = ''
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
        }

        folha.appendChild(div)
    })
    container.appendChild(folha)
}

async function onExcluirPlacaAmarela() {
    const idx = plaquesSalvasAmarela.indexOf(placaClicadaAmarela)
    if (idx === -1) return
    plaquesSalvasAmarela.splice(idx, 1)
    await salvarERenderizarAmarela()
}

async function onDuplicarPlacaAmarela() {
    const idx = plaquesSalvasAmarela.indexOf(placaClicadaAmarela)
    if (idx === -1) return
    const clone = { ...placaClicadaAmarela, id_unico: Date.now() + Math.random() }
    plaquesSalvasAmarela.splice(idx + 1, 0, clone)
    await salvarERenderizarAmarela()
}

async function salvarERenderizarAmarela() {
    if (_salvandoAmarela) return
    _salvandoAmarela = true
    try {
        const res = await fetch(API+'/registros-placas', {
            method: 'POST',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'amarela', placas: plaquesSalvasAmarela })
        })
        const data = await res.json()
        if (data.logIds && data.logIds.length) {
            window._ultimasPlacasGeradas.push(...data.logIds)
        }
    } catch (e) { console.error('Erro ao salvar placas amarelas:', e) }
    _salvandoAmarela = false
    renderizarPlacasAmarela()
}

function mudarPaginaPlacasAmarela(v) {
    const total = Math.ceil(plaquesSalvasAmarela.length / plaquesPorPaginaAmarela)
    paginaPlacasAmarela = Math.max(0, Math.min(paginaPlacasAmarela + v, total - 1))
    renderizarPlacasAmarela()
}

function imprimirTudoAmarela() {
    if (imprimindo) return;
    imprimindo = true;

    const container = document.getElementById('container-placas-am');
    if (!container) return;

    const paginaOriginal = paginaPlacasAmarela;
    container.innerHTML = '';

    for (let i = 0; i < plaquesSalvasAmarela.length; i += plaquesPorPaginaAmarela) {
        const folha = document.createElement('div');
        folha.className = 'folha-amarela';

        plaquesSalvasAmarela.slice(i, i + plaquesPorPaginaAmarela).forEach(p => {
            const div = document.createElement('div');
            div.className = 'placa-amarela';

            const uni = p.descricao_kglt?.toUpperCase() === 'UNIDADE' ? 'UN' : (p.descricao_kglt?.toUpperCase() || '');
            const art = uni === 'UN' ? 'A' : 'O';
            const textoEan = p.ean ? `Cód.${p.ean}` : '';

            div.innerHTML = `
                <h1 style="font-size:40px; text-decoration: underline; margin:0;">OFERTA</h1>
                <h1 style="font-size:16px;">${p.descricao || ''}</h1>
                <h1 style="font-size:92px;">
                    <span style="font-size:18px; position:relative; top:25px;">R$</span> ${parseFloat(p.preco).toFixed(2).replace('.', ',')}
                </h1>
                <h1 style="font-size:16px;">
                    ${p.preco_info ? `NESTA EMBALAGEM ${art} ${uni} SAI R$ ${p.preco_info}` : ''}
                </h1>
                <h1 style="font-size:16px;">${textoEan}</h1>
            `;
            folha.appendChild(div);
        });

        container.appendChild(folha);
    }

    setTimeout(() => {
        printFolha(container.innerHTML, CSS_FOLHA_AM)
    }, 500);

    setTimeout(() => {
        imprimindo = false;
        renderizarPlacasAmarela();
        registrarImpressaoPlacas()
    }, 1000);
}

function abrirBuscaNomeAmarela() {
    document.getElementById('modal-busca-am').style.display = 'block'
    document.getElementById('input-busca-nome-am').value = ''
    document.querySelector('#tabela-busca-am tbody').innerHTML = ''
    document.getElementById('input-busca-nome-am').focus()
}

async function onBuscaNomeKeydownAmarela(e) {
    if (e.key !== 'Enter') return
    const termo = e.target.value.trim()
    if (!termo || termo.length < 2) return

    const tbody = document.querySelector('#tabela-busca-am tbody')
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:10px; color:#999;">Buscando...</td></tr>'

    try {
        const res = await fetch(API+`/produtos/busca?q=${encodeURIComponent(termo)}`, { headers: authHeaders() })
        const resultados = await res.json()

        if (!resultados.length) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:10px; color:#999;">Nenhum produto encontrado</td></tr>'
            return
        }

        tbody.innerHTML = resultados.map((p, i) => `
            <tr data-index="${i}" style="cursor:pointer; border-bottom:1px solid #f0f0f0;"
                onmouseover="this.style.background='#fffde0'" onmouseout="this.style.background=''">
                <td style="padding:8px 12px; font-size:12px; color:#666;">${p.codigo}</td>
                <td style="padding:8px 12px; font-size:13px;">${p.descricao}</td>
                <td style="padding:8px 12px; font-size:13px; text-align:right;">R$ ${parseFloat(p.preco_venda || 0).toFixed(2).replace('.', ',')}</td>
            </tr>
        `).join('')

        tbody.querySelectorAll('tr').forEach(tr => {
            tr.onclick = () => {
                const i = parseInt(tr.getAttribute('data-index'))
                document.getElementById('ean-input-am').value = resultados[i].codigo
                document.getElementById('preco-input-am').value = resultados[i].preco_venda || ''
                fecharModaisAmarela()
                document.getElementById('preco-input-am').focus()
            }
        })
    } catch {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:10px; color:#ef4444;">Erro na busca</td></tr>'
    }
}

function extrairKgLtAm(desc) {
    const m = desc.match(/(\d+[.,]?\d*)\s*(KG|G|L|ML)/)
    if (!m) return 0
    const val = parseFloat(m[1].replace(',', '.'))
    if (isNaN(val) || val <= 0) return 0
    const unid = m[2]
    if (unid === 'KG' || unid === 'L') return val
    if (unid === 'G' || unid === 'ML') return val / 1000
    return 0
}

async function processarImportacaoAmarela() {
    const texto = document.getElementById('import-texto-am').value.trim()
    if (!texto) return
    const qtdGlobal = parseInt(document.getElementById('qtd-input-am')?.value) || 1
    const logErros = document.getElementById('log-erros-am')
    const listaErros = document.getElementById('lista-erros-am')
    listaErros.innerHTML = ''
    logErros.style.display = 'none'
    let contador = 0

    for (const linha of texto.split(/\r?\n/)) {
        const colunas = linha.split(/\t| {2,}/)
        if (colunas.length >= 2) {
            const descProcurada = colunas[0].trim().toUpperCase()
            const precoNovo = parseFloat(colunas[1].replace('R$', '').replace(/\s/g, '').replace(',', '.').trim())
            if (!isNaN(precoNovo)) {
                let prod = plaquesBancoAmarela.find(p => p.descricao?.toUpperCase() === descProcurada) ||
                           plaquesBancoAmarela.find(p => p.descricao?.toUpperCase().includes(descProcurada))
                if (!prod) {
                    try {
                        const res = await fetch(API+'/produtos/busca?q='+encodeURIComponent(descProcurada), { headers: authHeaders() })
                        if (res.ok) {
                            const lista = await res.json()
                            if (lista.length > 0) {
                                const res2 = await fetch(API+'/produtos/'+encodeURIComponent(lista[0].codigo), { headers: authHeaders() })
                                if (res2.ok) {
                                    const p = await res2.json()
                                    plaquesBancoAmarela.push(p)
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
                        plaquesSalvasAmarela.push({ ...prod, preco: precoNovo, preco_info: precoUn, id_unico: Date.now() + Math.random() })
                    }
                    contador++
                } else {
                    const qtdKgL = extrairKgLtAm(descProcurada)
                    const precoUn = qtdKgL > 0 ? (precoNovo / qtdKgL).toFixed(2).replace('.', ',') : precoNovo.toFixed(2).replace('.', ',')
                    for (let i = 0; i < qtdGlobal; i++) {
                        plaquesSalvasAmarela.push({ descricao: colunas[0].trim(), codigo: '', ean: '', preco: precoNovo, preco_info: precoUn, quantidade_kg_l: qtdKgL, id_unico: Date.now() + Math.random() })
                    }
                    contador++
                }
            }
        }
    }

    fecharModaisAmarela()
    alert(`${contador} placa(s) gerada(s).`)
    await salvarERenderizarAmarela()
    document.getElementById('import-texto-am').value = ''
}

function fecharModaisAmarela() {
    document.getElementById('modal-busca-am').style.display = 'none'
    document.getElementById('modal-import-am').style.display = 'none'
    document.getElementById('log-erros-am').style.display = 'none'
}
