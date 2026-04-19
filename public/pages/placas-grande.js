let placasBancoGrande = []
let placasSalvasGrande = JSON.parse(localStorage.getItem('placasSalvasGrande')) || []
let paginaPlacasGrande = 0
const placasPorPaginaGrande = 4 // 1 coluna, 4 por página A4
let placaClicadaGrande = null

// Quebra o nome em 3 linhas:
// linha1 = primeira palavra
// linha2 = segunda palavra (marca em destaque)
// linha3 = resto
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
    setActive('btn-placas-grande')
    setConteudo(`
        <div class="controls-placas bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
            <div class="flex gap-3 flex-wrap items-end mb-4">
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">EAN / Código</label>
                    <input type="text" id="ean-input-g" autocomplete="off" autofocus
                        class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:border-red-400">
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preço (R$)</label>
                    <input type="number" id="preco-input-g" step="0.01"
                        class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:border-red-400">
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Qtd</label>
                    <input type="number" id="qtd-input-g" value="1" min="1"
                        class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-16 focus:outline-none focus:border-red-400">
                </div>
                <button id="btn-add-placa-g" class="px-4 py-2 text-white text-sm font-semibold rounded-lg" style="background:#28a745;">➕ Adicionar</button>
                <button id="btn-abrir-import-g" class="px-4 py-2 text-white text-sm font-semibold rounded-lg" style="background:#6f42c1;">📥 Importar Tabela</button>
                <button id="btn-abrir-busca-g" class="px-4 py-2 text-white text-sm font-semibold rounded-lg" style="background:#007bff;">🔍 Buscar Nome</button>
            </div>
            <div class="flex gap-3 items-center pt-4 border-t border-gray-100 flex-wrap">
                <button id="btn-print-atual-g" class="px-4 py-2 text-white text-sm font-semibold rounded-lg" style="background:#4a4a4a;">🖨️ Pág. Atual</button>
                <button id="btn-print-tudo-g" class="px-4 py-2 text-white text-sm font-semibold rounded-lg" style="background:#2d3436;">🖨️ Imprimir Tudo</button>
                <button id="btn-pag-ant-g" class="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">◀ Ant.</button>
                <span id="contador-pagina-g" class="text-sm font-semibold text-gray-500 min-w-[110px] text-center">Página 1 de 1</span>
                <button id="btn-pag-prox-g" class="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Próx ▶</button>
                <button id="btn-limpar-g" class="px-4 py-2 text-white text-sm font-semibold rounded-lg ml-auto" style="background:#dc3545;">🗑 Limpar Tudo</button>
            </div>
        </div>
        <div id="container-placas-g"></div>
    `, 'Placas Grande')

    if (placasBancoGrande.length === 0) {
        try {
            const res = await fetch('http://localhost:3000/produtos', { headers: authHeaders() })
            const data = await res.json()
            if (Array.isArray(data)) {
                placasBancoGrande = data.map(p => ({
                    ...p,
                    preco_venda: parseFloat(p.preco_venda),
                    quantidade_kg_l: parseFloat(p.quantidade_kg_l || 0)
                }))
            }
        } catch { console.error('Erro ao carregar banco') }
    }

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
            <!-- Topo: tipo do produto -->
            <div style="width:100%; text-align:center;">
                <div data-field="linha1" style="font-size:22px; font-weight:bold; text-transform:uppercase; letter-spacing:2px; white-space:nowrap; overflow:hidden;">${linha1}</div>
            </div>

            <!-- Marca em destaque -->
            <div style="width:100%; text-align:center; flex:1; display:flex; align-items:center; justify-content:center;">
                <div data-field="linha2" style="font-size:52px; font-weight:900; text-transform:uppercase; line-height:1; letter-spacing:2px; white-space:nowrap; overflow:hidden;">${linha2}</div>
            </div>

            <!-- Complemento -->
            <div style="width:100%; text-align:center;">
                <div data-field="linha3" style="font-size:16px; font-weight:bold; text-transform:uppercase; white-space:nowrap; overflow:hidden;">${linha3}</div>
            </div>

            <!-- Preço -->
            <div style="width:100%; display:flex; align-items:flex-end; justify-content:center; margin: 4mm 0 2mm;">
                <span style="font-size:20px; font-weight:bold; margin-bottom:12px; margin-right:3px;">R$</span>
                <span data-field="preco" style="font-size:90px; font-weight:900; line-height:1;">${reais},${cents}</span>
                <span style="font-size:16px; font-weight:bold; margin-bottom:14px; margin-left:4px;">${uni}</span>
            </div>

            <!-- Rodapé -->
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

    const totalPaginas = Math.ceil(placasSalvasGrande.length / placasPorPaginaGrande) || 1
    if (paginaPlacasGrande >= totalPaginas) paginaPlacasGrande = totalPaginas - 1

    const contadorEl = document.getElementById('contador-pagina-g')
    if (contadorEl) contadorEl.innerText = `Página ${paginaPlacasGrande + 1} de ${totalPaginas}`

    const lista = placasSalvasGrande.slice(
        paginaPlacasGrande * placasPorPaginaGrande,
        (paginaPlacasGrande + 1) * placasPorPaginaGrande
    )
    if (!lista.length) return

    const folha = document.createElement('div')
    folha.className = 'folha-grande'

    lista.forEach(p => {
        const div = document.createElement('div')
        div.className = 'placa-grande'
        div.innerHTML = montarPlacaGrandeHTML(p)

        // Duplo clique para editar campos
        div.querySelectorAll('[data-field]').forEach(el => {
            el.style.cursor = 'pointer'
            el.ondblclick = () => {
                const field = el.getAttribute('data-field')
                const input = document.createElement('input')
                input.value = el.innerText.trim()
                input.style.cssText = `width:90%; font-size:${el.style.fontSize}; font-weight:bold; text-align:center; border:2px solid #b51515; font-family:'Segoe UI',sans-serif;`
                el.replaceWith(input)
                input.focus(); input.select()

                const fechar = () => {
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
                    salvarERenderizarGrande()
                }
                input.onkeydown = (ev) => { if (ev.key === 'Enter') fechar(); if (ev.key === 'Escape') renderizarPlacasGrande() }
                input.onblur = fechar
            }
        })

        // Clique direito para excluir
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

function onExcluirPlacaGrande() {
    placasSalvasGrande = placasSalvasGrande.filter(p => p !== placaClicadaGrande)
    salvarERenderizarGrande()
}

function salvarERenderizarGrande() {
    localStorage.setItem('placasSalvasGrande', JSON.stringify(placasSalvasGrande))
    renderizarPlacasGrande()
}

function mudarPaginaPlacasGrande(v) {
    const total = Math.ceil(placasSalvasGrande.length / placasPorPaginaGrande)
    paginaPlacasGrande = Math.max(0, Math.min(paginaPlacasGrande + v, total - 1))
    renderizarPlacasGrande()
}

function imprimirTudoGrande() {
    const container = document.getElementById('container-placas-g')
    const paginaOriginal = paginaPlacasGrande
    container.innerHTML = ''
    for (let i = 0; i < placasSalvasGrande.length; i += placasPorPaginaGrande) {
        const folha = document.createElement('div')
        folha.className = 'folha-grande'
        placasSalvasGrande.slice(i, i + placasPorPaginaGrande).forEach(p => {
            const div = document.createElement('div')
            div.className = 'placa-grande'
            div.innerHTML = montarPlacaGrandeHTML(p)
            folha.appendChild(div)
        })
        container.appendChild(folha)
    }
    setTimeout(() => {
        window.onafterprint = () => { registrarImpressaoPlacas(); window.onafterprint = null }
        window.print()
        paginaPlacasGrande = paginaOriginal
        renderizarPlacasGrande()
    }, 500)
}

function adicionarPlacaGrande() {
    const ean = document.getElementById('ean-input-g').value.trim()
    const preco = parseFloat(document.getElementById('preco-input-g').value)
    const quantidade = parseInt(document.getElementById('qtd-input-g').value) || 1
    if (!ean || isNaN(preco)) return

    const prod = placasBancoGrande.find(p => p.ean === ean) || placasBancoGrande.find(p => p.codigo === ean)
    if (prod) {
        const qtdKgL = parseFloat(prod.quantidade_kg_l)
        const precoUn = qtdKgL > 0 ? (preco / qtdKgL).toFixed(2).replace('.', ',') : prod.preco_venda
        for (let i = 0; i < quantidade; i++) {
            placasSalvasGrande.push({ ...prod, preco, preco_info: precoUn, id_unico: Date.now() + Math.random() })
        }
        salvarERenderizarGrande()
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
        alert('Produto não encontrado. Use "Buscar Nome" para localizar.')
    }
}

function abrirBuscaNomeGrande() {
    document.getElementById('modal-busca-g').style.display = 'block'
    document.getElementById('input-busca-nome-g').value = ''
    document.querySelector('#tabela-busca-g tbody').innerHTML = ''
    document.getElementById('input-busca-nome-g').focus()
}

function onBuscaNomeKeydownGrande(e) {
    if (e.key !== 'Enter') return
    const termo = e.target.value.trim().toUpperCase()
    if (!termo) return
    const resultados = placasBancoGrande.filter(p =>
        p.descricao?.toUpperCase().includes(termo) ||
        p.codigo?.includes(termo) || p.ean?.includes(termo)
    ).slice(0, 50)

    const tbody = document.querySelector('#tabela-busca-g tbody')
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
            document.getElementById('preco-input-g').value = resultados[i].preco_venda || ''
            fecharModaisGrande()
            document.getElementById('preco-input-g').focus()
        }
    })
}

function processarImportacaoGrande() {
    const texto = document.getElementById('import-texto-g').value.trim()
    if (!texto) return
    const qtdGlobal = parseInt(document.getElementById('qtd-input-g')?.value) || 1
    const logErros = document.getElementById('log-erros-g')
    const listaErros = document.getElementById('lista-erros-g')
    listaErros.innerHTML = ''
    let itensErros = [], contador = 0

    texto.split(/\r?\n/).forEach(linha => {
        const colunas = linha.split(/\t| {2,}/)
        if (colunas.length >= 2) {
            const descProcurada = colunas[0].trim().toUpperCase()
            const precoNovo = parseFloat(colunas[1].replace('R$', '').replace(/\s/g, '').replace(',', '.').trim())
            if (!isNaN(precoNovo)) {
                const prod = placasBancoGrande.find(p => p.descricao?.toUpperCase() === descProcurada) ||
                             placasBancoGrande.find(p => p.descricao?.toUpperCase().includes(descProcurada))
                if (prod) {
                    const qtdKgL = parseFloat(prod.quantidade_kg_l)
                    const precoUn = qtdKgL > 0 ? (precoNovo / qtdKgL).toFixed(2).replace('.', ',') : prod.preco_venda
                    for (let i = 0; i < qtdGlobal; i++) {
                        placasSalvasGrande.push({ ...prod, preco: precoNovo, preco_info: precoUn, id_unico: Date.now() + Math.random() })
                    }
                    contador++
                } else { itensErros.push(descProcurada) }
            }
        }
    })

    if (itensErros.length > 0) {
        logErros.style.display = 'block'
        itensErros.forEach(item => { const li = document.createElement('li'); li.textContent = item; listaErros.appendChild(li) })
        alert(`${contador} placas geradas. ${itensErros.length} item(ns) não encontrado(s).`)
    } else { fecharModaisGrande() }
    salvarERenderizarGrande()
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
    document.getElementById('btn-print-atual-g').onclick  = () => { window.print(); setTimeout(() => registrarImpressaoPlacas(), 2000) }
    document.getElementById('btn-print-tudo-g').onclick   = imprimirTudoGrande
    document.getElementById('btn-pag-ant-g').onclick      = () => mudarPaginaPlacasGrande(-1)
    document.getElementById('btn-pag-prox-g').onclick     = () => mudarPaginaPlacasGrande(1)
    document.getElementById('btn-limpar-g').onclick       = () => {
        if (confirm('Limpar todas as placas grandes?')) { placasSalvasGrande = []; salvarERenderizarGrande() }
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