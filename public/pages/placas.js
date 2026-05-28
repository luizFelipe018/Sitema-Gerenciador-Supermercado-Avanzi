let placasBanco = []
let placasSalvas = []
let paginaPlacas = 0
const placasPorPagina = 10
let placaClicada = null
let _salvandoPlacas = false

const CSS_FOLHA = `
.folha { display:flex; flex-wrap:wrap; align-content:flex-start; width:100%; height:297mm; margin:0; padding:5mm; background:#fff !important; box-sizing:border-box; }
.placa { width:50%; height:19.9%; border:1px solid #000; padding:5px; background:#fff !important; box-sizing:border-box; display:flex; flex-direction:column; justify-content:space-between; align-items:center; text-align:center; overflow:hidden; }
.placa, .placa h1 { font-family:'Segoe UI',sans-serif !important; font-weight:bold !important; }
.placa h1 { width:100%; margin:0; display:flex; align-items:center; justify-content:center; overflow:hidden; color:#000 !important; }
.placa h1:first-child { font-size:16px; }
.placa h1:nth-child(2) { font-size:92px; }
.placa h1:nth-child(2) span { font-size:18px; position:relative; top:15px; }
.placa h1:nth-child(3) { font-size:16px; }
.placa h1:nth-child(4) { font-size:16px; }
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

async function carregarPlacas() {
    carregarEstilos()
    setActive('btn-placas')
    setConteudo(`
        <div style="max-width:1200px; margin:0 auto;">

            <!-- Toolbar -->
            <div class="dash-glass dash-animate" style="padding:20px; margin-bottom:20px;">
                <div style="display:flex; gap:12px; align-items:end; flex-wrap:wrap; margin-bottom:16px;">
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Código / EAN</label>
                        <input type="text" id="ean-input" autocomplete="off" autofocus
                            style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; width:160px; transition:all 0.3s;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                    </div>
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Preço (R$)</label>
                        <input type="number" id="preco-input" step="0.01"
                            style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; width:120px; transition:all 0.3s;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                    </div>
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Qtd</label>
                        <input type="number" id="qtd-input" value="1" min="1"
                            style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; width:70px; transition:all 0.3s; text-align:center;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                    </div>
                    <button id="btn-add-placa" style="padding:10px 20px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.transform='translateY(-2px) scale(1.03)';this.style.boxShadow='0 8px 24px rgba(181,21,21,0.4)'"
                        onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(181,21,21,0.3)'"
                        onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='translateY(-2px) scale(1.03)'">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Adicionar
                    </button>
                    <button id="btn-abrir-busca" style="padding:10px 18px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; font-weight:600; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.04); transition:all 0.3s; display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.background='rgba(255,255,255,0.08)';this.style.color='#fafafa'"
                        onmouseleave="this.style.background='rgba(255,255,255,0.04)';this.style.color='rgba(255,255,255,0.6)'">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        Buscar
                    </button>
                    <button id="btn-abrir-import" style="padding:10px 18px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; font-weight:600; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.04); transition:all 0.3s; display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.background='rgba(255,255,255,0.08)';this.style.color='#fafafa'"
                        onmouseleave="this.style.background='rgba(255,255,255,0.04)';this.style.color='rgba(255,255,255,0.6)'">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Importar
                    </button>
                </div>
                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding-top:14px; border-top:1px solid rgba(255,255,255,0.06);">
                    <button id="btn-print-atual" style="padding:8px 16px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:12px; font-weight:600; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.04); transition:all 0.3s; display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.background='rgba(34,197,94,0.12)';this.style.borderColor='rgba(34,197,94,0.3)';this.style.color='#22c55e'"
                        onmouseleave="this.style.background='rgba(255,255,255,0.04)';this.style.borderColor='rgba(255,255,255,0.08)';this.style.color='rgba(255,255,255,0.6)'">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Pág. Atual
                    </button>
                    <button id="btn-print-tudo" style="padding:8px 16px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:12px; font-weight:600; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.04); transition:all 0.3s; display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.background='rgba(34,197,94,0.12)';this.style.borderColor='rgba(34,197,94,0.3)';this.style.color='#22c55e'"
                        onmouseleave="this.style.background='rgba(255,255,255,0.04)';this.style.borderColor='rgba(255,255,255,0.08)';this.style.color='rgba(255,255,255,0.6)'">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Imprimir Tudo
                    </button>

                    <div style="display:flex; align-items:center; gap:6px; margin-left:8px;">
                        <button id="btn-pag-ant" style="padding:8px 12px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:12px; color:rgba(255,255,255,0.4); cursor:pointer; background:transparent; transition:all 0.3s; display:flex; align-items:center; gap:4px;"
                            onmouseenter="this.style.background='rgba(255,255,255,0.06)';this.style.color='rgba(255,255,255,0.7)'"
                            onmouseleave="this.style.background='transparent';this.style.color='rgba(255,255,255,0.4)'">
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                            Ant.
                        </button>
                        <span id="contador-pagina" style="font-size:12px; font-weight:600; color:rgba(255,255,255,0.35); min-width:100px; text-align:center;">Página 1 de 1</span>
                        <button id="btn-pag-prox" style="padding:8px 12px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:12px; color:rgba(255,255,255,0.4); cursor:pointer; background:transparent; transition:all 0.3s; display:flex; align-items:center; gap:4px;"
                            onmouseenter="this.style.background='rgba(255,255,255,0.06)';this.style.color='rgba(255,255,255,0.7)'"
                            onmouseleave="this.style.background='transparent';this.style.color='rgba(255,255,255,0.4)'">
                            Próx.
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                    </div>

                    <button id="btn-limpar" style="padding:8px 16px; border:none; border-radius:10px; font-size:12px; font-weight:700; color:#ef4444; cursor:pointer; background:rgba(239,68,68,0.1); margin-left:auto; transition:all 0.3s; display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.background='rgba(239,68,68,0.2)';this.style.transform='scale(1.03)'"
                        onmouseleave="this.style.background='rgba(239,68,68,0.1)';this.style.transform=''">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        Limpar
                    </button>
                </div>
            </div>

            <!-- Plate container -->
            <div id="container-placas" style="padding:10px 0;"></div>

        </div>
    `, 'Placas de Preço')

    if (placasBanco.length === 0) {
        try {
            const res = await fetch(API+'/produtos?page=1&limit=500', { headers: authHeaders() })
            const json = await res.json()
            if (json.data && Array.isArray(json.data)) {
                placasBanco = json.data.map(p => ({
                    ...p,
                    preco_venda: parseFloat(p.preco_venda),
                    quantidade_kg_l: parseFloat(p.quantidade_kg_l || 0)
                }))
            }
        } catch { console.error('Erro ao carregar banco de placas') }
    }

    try {
        const res = await fetch(API+'/registros-placas?tipo=branca', { headers: authHeaders() })
        const data = await res.json()
        if (Array.isArray(data)) {
            placasSalvas = data.map(p => ({
                ...p,
                preco: parseFloat(p.preco),
                quantidade_kg_l: parseFloat(p.quantidade_kg_l || 0),
                id_unico: Date.now() + Math.random()
            }))
        }
    } catch { console.error('Erro ao carregar placas salvas') }

    renderizarPlacas()
    vincularEventosPlacas()
}

function vincularEventosPlacas() {
    const eanInput = document.getElementById('ean-input')
    const precoInput = document.getElementById('preco-input')
    const qtdInput = document.getElementById('qtd-input')
    if (!eanInput) return

    document.getElementById('btn-add-placa').onclick = adicionarPlaca
    document.getElementById('btn-abrir-busca').onclick = abrirBuscaNome
    document.getElementById('btn-abrir-import').onclick = () => {
        document.getElementById('modal-import').style.display = 'block'
        document.getElementById('import-texto').focus()
    }
    document.getElementById('btn-print-atual').onclick = () => {
        const folha = document.querySelector('#container-placas .folha')
        if (!folha) return
        printFolha(folha.outerHTML, CSS_FOLHA)
        setTimeout(registrarImpressaoPlacas, 1000)
    }
    document.getElementById('btn-print-tudo').onclick = imprimirTudo
    document.getElementById('btn-pag-ant').onclick = () => mudarPaginaPlacas(-1)
    document.getElementById('btn-pag-prox').onclick = () => mudarPaginaPlacas(1)
    document.getElementById('btn-limpar').onclick = () => {
        if (confirm('Limpar todas as placas?')) { placasSalvas = []; salvarERenderizar() }
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
        if (e.key === 'Enter') { e.preventDefault(); adicionarPlaca() }
    })

    document.getElementById('btn-processar-import').onclick = processarImportacao
    document.getElementById('input-busca-nome').addEventListener('keydown', onBuscaNomeKeydown)
}

async function adicionarPlaca() {
    const codigo = document.getElementById('ean-input').value.trim()
    const preco = parseFloat(document.getElementById('preco-input').value)
    const quantidade = parseInt(document.getElementById('qtd-input').value) || 1
    if (!codigo || isNaN(preco)) return

    let prod = placasBanco.find(p => String(p.ean) === codigo) || placasBanco.find(p => String(p.codigo) === codigo)

    if (!prod) {
        try {
            const res = await fetch(API+'/produtos/'+encodeURIComponent(codigo), { headers: authHeaders() })
            if (res.ok) {
                const p = await res.json()
                placasBanco.push(p)
                prod = p
            }
        } catch {}
    }
    if (!prod) {
        try {
            const res = await fetch(API+'/produtos/busca/ean/'+encodeURIComponent(codigo), { headers: authHeaders() })
            if (res.ok) {
                const p = await res.json()
                placasBanco.push(p)
                prod = p
            }
        } catch {}
    }

    if (prod) {
        const qtdKgL = parseFloat(prod.quantidade_kg_l)
        const precoUn = qtdKgL > 0 ? (preco / qtdKgL).toFixed(2).replace('.', ',') : prod.preco_venda
        for (let i = 0; i < quantidade; i++) {
            placasSalvas.push({ ...prod, preco, preco_info: precoUn, id_unico: Date.now() + Math.random() })
        }
        await salvarERenderizar()
        const novasPlacas = []
        for (let i = 0; i < quantidade; i++) {
            novasPlacas.push({ descricao: prod.descricao, codigo: prod.codigo, ean: prod.ean, preco, tipo_placa: 'branca' })
        }
        registrarLogPlacas(novasPlacas)
        document.getElementById('ean-input').value = ''
        document.getElementById('preco-input').value = ''
        document.getElementById('qtd-input').value = 1
        document.getElementById('ean-input').focus()
    } else {
        alert('Produto não encontrado. Verifique o código e tente novamente.')
    }
}

function renderizarPlacas() {
    const container = document.getElementById('container-placas')
    if (!container) return
    container.innerHTML = ''

    const totalPaginas = Math.ceil(placasSalvas.length / placasPorPagina) || 1
    if (paginaPlacas >= totalPaginas) paginaPlacas = totalPaginas - 1

    const contadorEl = document.getElementById('contador-pagina')
    if (contadorEl) contadorEl.innerText = `Página ${paginaPlacas + 1} de ${totalPaginas}`

    const lista = placasSalvas.slice(paginaPlacas * placasPorPagina, (paginaPlacas + 1) * placasPorPagina)
    if (!lista.length) {
        container.innerHTML = `
            <div style="text-align:center; padding:60px 20px; border-radius:16px; border:1px dashed rgba(255,255,255,0.08);">
                <svg width="40" height="40" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:12px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                <p style="color:rgba(255,255,255,0.2); font-size:13px;">Nenhuma placa adicionada</p>
                <p style="color:rgba(255,255,255,0.1); font-size:11px; margin-top:4px;">Digite um código e preço acima para começar</p>
            </div>`
        return
    }

    const folha = document.createElement('div')
    folha.className = 'folha'
    folha.style.animation = 'dashFadeUp 0.3s ease'

    lista.forEach(p => {
        const div = document.createElement('div')
        div.className = 'placa'
        const uni = p.descricao_kglt?.toUpperCase() === 'UNIDADE' ? 'UN' : (p.descricao_kglt?.toUpperCase() || '')
        const art = uni === 'UN' ? 'A' : 'O'
        const textoEan = (p.ean && p.ean.toString().trim() !== '') ? `Cód.${p.ean}` : ''

        div.innerHTML = `
            <h1 style="font-size:16px;" data-field="descricao">${p.descricao || ''}</h1>
            <h1 style="font-size:92px;" data-field="preco"><span style="font-size:18px; position:relative; top:25px;color:#000;">R$</span> ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</h1>
            <h1 style="font-size:16px;" data-field="info">${p.preco_info ? `NESTA EMBALAGEM ${art} ${uni} SAI R$ ${p.preco_info}` : ''}</h1>
            <h1 style="font-size:16px;" data-field="ean">${textoEan}</h1>
        `

        div.querySelectorAll('h1').forEach(h => {
            h.ondblclick = () => {
                const field = h.getAttribute('data-field')
                const input = document.createElement('input')
                const valorOriginal = h.innerText.replace('R$', '').replace('Cód.', '').replace(/NESTA EMBALAGEM .* SAI R\$/i, '').trim()
                input.value = valorOriginal
                input.style.cssText = 'width:90%; font-size:' + h.style.fontSize + '; text-align:center; font-weight:bold; border:2px solid #b51515; border-radius:6px; background:#fff; color:#000; outline:none; padding:2px 6px;'
                h.replaceWith(input)
                input.focus()
                input.select()

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
                        await salvarERenderizar()
                    } else {
                        if (field === 'ean') { p.ean = ''; await salvarERenderizar() } else { renderizarPlacas() }
                    }
                }
                input.onkeydown = (ev) => { if (ev.key === 'Enter') fechar(); if (ev.key === 'Escape') renderizarPlacas() }
                input.onblur = fechar
            }
        })

        div.oncontextmenu = (e) => {
            e.preventDefault()
            placaClicada = p
            const menu = document.getElementById('contextMenu')
            menu.style.display = 'block'
            menu.style.top = e.clientY + 'px'
            menu.style.left = e.clientX + 'px'
        }

        folha.appendChild(div)
    })
    container.appendChild(folha)
}

async function onExcluirPlaca() {
    const idx = placasSalvas.indexOf(placaClicada)
    if (idx === -1) return
    placasSalvas.splice(idx, 1)
    await salvarERenderizar()
}

async function salvarERenderizar() {
    if (_salvandoPlacas) return
    _salvandoPlacas = true
    try {
        await fetch(API+'/registros-placas', {
            method: 'POST',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'branca', placas: placasSalvas })
        })
    } catch (e) { console.error('Erro ao salvar placas:', e) }
    _salvandoPlacas = false
    renderizarPlacas()
}

function mudarPaginaPlacas(v) {
    const total = Math.ceil(placasSalvas.length / placasPorPagina)
    paginaPlacas = Math.max(0, Math.min(paginaPlacas + v, total - 1))
    renderizarPlacas()
}

function imprimirTudo() {
    const container = document.getElementById('container-placas');
    const paginaOriginal = paginaPlacas;
    
    container.innerHTML = '';
    
    for (let i = 0; i < placasSalvas.length; i += placasPorPagina) {
        const folha = document.createElement('div');
        folha.className = 'folha';

        placasSalvas.slice(i, i + placasPorPagina).forEach(p => {
            const div = document.createElement('div');
            div.className = 'placa';
            const uni = p.descricao_kglt?.toUpperCase() === 'UNIDADE' ? 'UN' : (p.descricao_kglt?.toUpperCase() || '');
            const art = uni === 'UN' ? 'A' : 'O';
            
            div.innerHTML = `
                <h1 style="font-size:16px;">${p.descricao || ''}</h1>
                <h1 style="font-size:92px;"><span style="font-size:18px; position:relative; top:15px;">R$</span> ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</h1>
                <h1 style="font-size:16px;">${p.preco_info ? `NESTA EMBALAGEM ${art} ${uni} SAI R$ ${p.preco_info}` : ''}</h1>
                <h1 style="font-size:16px;">${p.ean ? `Cód.${p.ean}` : ''}</h1>
            `;
            folha.appendChild(div);
        });
        container.appendChild(folha);
    }

    setTimeout(() => {
        printFolha(container.innerHTML, CSS_FOLHA)
        setTimeout(() => {
            paginaPlacas = paginaOriginal;
            renderizarPlacas();
            registrarImpressaoPlacas()
        }, 1000);
    }, 500);
}

function abrirBuscaNome() {
    document.getElementById('modal-busca').style.display = 'block'
    document.getElementById('input-busca-nome').value = ''
    document.querySelector('#tabela-busca tbody').innerHTML = ''
    document.getElementById('input-busca-nome').focus()
}

async function onBuscaNomeKeydown(e) {
    if (e.key !== 'Enter') return
    const termo = e.target.value.trim()
    if (!termo || termo.length < 2) return

    const tbody = document.querySelector('#tabela-busca tbody')
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
                onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background=''">
                <td style="padding:8px 12px; font-size:12px; color:#666;">${p.codigo}</td>
                <td style="padding:8px 12px; font-size:13px;">${p.descricao}</td>
                <td style="padding:8px 12px; font-size:13px; text-align:right;">R$ ${parseFloat(p.preco_venda || 0).toFixed(2).replace('.', ',')}</td>
            </tr>
        `).join('')

        tbody.querySelectorAll('tr').forEach(tr => {
            tr.onclick = () => {
                const i = parseInt(tr.getAttribute('data-index'))
                document.getElementById('ean-input').value = resultados[i].codigo
                document.getElementById('preco-input').value = resultados[i].preco_venda || ''
                fecharModais()
                document.getElementById('preco-input').focus()
            }
        })
    } catch {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:10px; color:#ef4444;">Erro na busca</td></tr>'
    }
}

function extrairKgLt(desc) {
    const m = desc.match(/(\d+[.,]?\d*)\s*(KG|G|L|ML)/)
    if (!m) return 0
    const val = parseFloat(m[1].replace(',', '.'))
    if (isNaN(val) || val <= 0) return 0
    const unid = m[2]
    if (unid === 'KG' || unid === 'L') return val
    if (unid === 'G' || unid === 'ML') return val / 1000
    return 0
}

async function processarImportacao() {
    const texto = document.getElementById('import-texto').value.trim()
    if (!texto) return
    const qtdGlobal = parseInt(document.getElementById('qtd-input')?.value) || 1
    const logErros = document.getElementById('log-erros')
    const listaErros = document.getElementById('lista-erros')
    listaErros.innerHTML = ''
    logErros.style.display = 'none'
    let contador = 0

    for (const linha of texto.split(/\r?\n/)) {
        const colunas = linha.split(/\t| {2,}/)
        if (colunas.length >= 2) {
            const descProcurada = colunas[0].trim().toUpperCase()
            const precoNovo = parseFloat(colunas[1].replace('R$', '').replace(/\s/g, '').replace(',', '.').trim())
            if (!isNaN(precoNovo)) {
                let prod = placasBanco.find(p => p.descricao?.toUpperCase() === descProcurada) ||
                           placasBanco.find(p => p.descricao?.toUpperCase().includes(descProcurada))
                if (!prod) {
                    try {
                        const res = await fetch(API+'/produtos/busca?q='+encodeURIComponent(descProcurada), { headers: authHeaders() })
                        if (res.ok) {
                            const lista = await res.json()
                            if (lista.length > 0) {
                                const res2 = await fetch(API+'/produtos/'+encodeURIComponent(lista[0].codigo), { headers: authHeaders() })
                                if (res2.ok) {
                                    const p = await res2.json()
                                    placasBanco.push(p)
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
                        placasSalvas.push({ ...prod, preco: precoNovo, preco_info: precoUn, id_unico: Date.now() + Math.random() })
                    }
                    contador++
                } else {
                    const qtdKgL = extrairKgLt(descProcurada)
                    const precoUn = qtdKgL > 0 ? (precoNovo / qtdKgL).toFixed(2).replace('.', ',') : precoNovo.toFixed(2).replace('.', ',')
                    for (let i = 0; i < qtdGlobal; i++) {
                        placasSalvas.push({ descricao: colunas[0].trim(), codigo: '', ean: '', preco: precoNovo, preco_info: precoUn, quantidade_kg_l: qtdKgL, id_unico: Date.now() + Math.random() })
                    }
                    contador++
                }
            }
        }
    }

    fecharModais()
    alert(`${contador} placa(s) gerada(s).`)
    await salvarERenderizar()
    document.getElementById('import-texto').value = ''
}
