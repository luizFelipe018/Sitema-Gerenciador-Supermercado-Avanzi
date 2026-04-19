

let placasBanco = []
let placasSalvas = JSON.parse(localStorage.getItem('placasSalvas')) || []
let paginaPlacas = 0
const placasPorPagina = 10
let placaClicada = null


function carregarEstilos() {
    // Verifica se o link já existe para não duplicar
    if (!document.getElementById('style.css')) {
        const link = document.createElement('link');
        link.id = 'estilo-placas';
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'style.css'; // Certifique-se que o arquivo está na mesma pasta
        document.head.appendChild(link);
    }
}


async function carregarPlacas() {
    carregarEstilos();
    setActive('btn-placas')
    setConteudo(`
        <div class="controls-placas bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
            <div class="flex gap-3 flex-wrap items-end mb-4">
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">EAN / Código</label>
                    <input type="text" id="ean-input" autocomplete="off" autofocus
                        class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:border-red-400">
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preço (R$)</label>
                    <input type="number" id="preco-input" step="0.01"
                        class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:border-red-400">
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Qtd</label>
                    <input type="number" id="qtd-input" value="1" min="1"
                        class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-16 focus:outline-none focus:border-red-400">
                </div>
                <button id="btn-add-placa" class="px-4 py-2 text-white text-sm font-semibold rounded-lg" style="background:#28a745;">➕ Adicionar</button>
                <button id="btn-abrir-import" class="px-4 py-2 text-white text-sm font-semibold rounded-lg" style="background:#6f42c1;">📥 Importar Tabela</button>
                <button id="btn-abrir-busca" class="px-4 py-2 text-white text-sm font-semibold rounded-lg" style="background:#007bff;">🔍 Buscar Nome</button>
            </div>
            <div class="flex gap-3 items-center pt-4 border-t border-gray-100 flex-wrap">
                <button id="btn-print-atual" class="px-4 py-2 text-white text-sm font-semibold rounded-lg" style="background:#4a4a4a;">🖨️ Pág. Atual</button>
                <button id="btn-print-tudo" class="px-4 py-2 text-white text-sm font-semibold rounded-lg" style="background:#2d3436;">🖨️ Imprimir Tudo</button>
                <button id="btn-pag-ant" class="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">◀ Ant.</button>
                <span id="contador-pagina" class="text-sm font-semibold text-gray-500 min-w-[110px] text-center">Página 1 de 1</span>
                <button id="btn-pag-prox" class="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Próx ▶</button>
                <button id="btn-limpar" class="px-4 py-2 text-white text-sm font-semibold rounded-lg ml-auto" style="background:#dc3545;">🗑 Limpar Tudo</button>
            </div>
        </div>
        <div id="container-placas"></div>
    `, 'Placas de Preço')

    // Carrega banco se ainda não carregou
    if (placasBanco.length === 0) {
        try {
            const res = await fetch('http://localhost:3000/produtos', { headers: authHeaders() })
            const data = await res.json()
            if (Array.isArray(data)) {
                placasBanco = data.map(p => ({
                    ...p,
                    preco_venda: parseFloat(p.preco_venda),
                    quantidade_kg_l: parseFloat(p.quantidade_kg_l || 0)
                }))
            }
        } catch { console.error('Erro ao carregar banco de placas') }
    }

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
        window.onafterprint = () => { registrarImpressaoPlacas(); window.onafterprint = null }
        window.print()
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

    // Importação
    document.getElementById('btn-processar-import').onclick = processarImportacao

    // Busca por nome
    document.getElementById('input-busca-nome').addEventListener('keydown', onBuscaNomeKeydown)
}

function adicionarPlaca() {
    const ean = document.getElementById('ean-input').value.trim()
    const preco = parseFloat(document.getElementById('preco-input').value)
    const quantidade = parseInt(document.getElementById('qtd-input').value) || 1
    if (!ean || isNaN(preco)) return

    const prod = placasBanco.find(p => p.ean === ean) || placasBanco.find(p => p.codigo === ean)
    if (prod) {
        const qtdKgL = parseFloat(prod.quantidade_kg_l)
        const precoUn = qtdKgL > 0 ? (preco / qtdKgL).toFixed(2).replace('.', ',') : prod.preco_venda
        for (let i = 0; i < quantidade; i++) {
            placasSalvas.push({ ...prod, preco, preco_info: precoUn, id_unico: Date.now() + Math.random() })
        }
        salvarERenderizar()
        // Registra no log
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
        alert('Produto não encontrado. Use "Buscar Nome" para localizar.')
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
    if (!lista.length) return

    const folha = document.createElement('div')
    folha.className = 'folha'

    lista.forEach(p => {
        const div = document.createElement('div')
        div.className = 'placa'
        const uni = p.descricao_kglt?.toUpperCase() === 'UNIDADE' ? 'UN' : (p.descricao_kglt?.toUpperCase() || '')
        const art = uni === 'UN' ? 'A' : 'O'
        const textoEan = (p.ean && p.ean.toString().trim() !== '') ? `Cód.${p.ean}` : ''

        div.innerHTML = `
            <h1 style="font-size:16px;" data-field="descricao">${p.descricao || ''}</h1>
            <h1 style="font-size:92px;" data-field="preco"><span style="font-size:18px;">R$</span> ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</h1>
            <h1 style="font-size:16px;" data-field="info">${p.preco_info ? `NESTA EMBALAGEM ${art} ${uni} SAI R$ ${p.preco_info}` : ''}</h1>
            <h1 style="font-size:16px;" data-field="ean">${textoEan}</h1>
        `

        div.querySelectorAll('h1').forEach(h => {
            h.ondblclick = () => {
                const field = h.getAttribute('data-field')
                const input = document.createElement('input')
                const valorOriginal = h.innerText.replace('R$', '').replace('Cód.', '').replace(/NESTA EMBALAGEM .* SAI R\$/i, '').trim()
                input.value = valorOriginal
                input.style.cssText = `width:90%; font-size:${h.style.fontSize}; text-align:center; font-weight:bold; border:2px solid #b51515;`
                h.replaceWith(input)
                input.focus()

                const fechar = () => {
                    const v = input.value.trim()
                    if (v !== '') {
                        if (field === 'preco') {
                            p.preco = parseFloat(v.replace(',', '.'))
                            const qtdKgL = parseFloat(p.quantidade_kg_l)
                            p.preco_info = qtdKgL > 0 ? (p.preco / qtdKgL).toFixed(2).replace('.', ',') : p.preco.toFixed(2)
                        } else if (field === 'ean') { p.ean = v }
                        else if (field === 'info') { p.preco_info = v }
                        else if (field === 'descricao') { p.descricao = v.toUpperCase() }
                        salvarERenderizar()
                    } else {
                        if (field === 'ean') { p.ean = ''; salvarERenderizar() } else { renderizarPlacas() }
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

function onExcluirPlaca() {
    placasSalvas = placasSalvas.filter(p => p !== placaClicada)
    salvarERenderizar()
}

function salvarERenderizar() {
    localStorage.setItem('placasSalvas', JSON.stringify(placasSalvas))
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
    
    // Limpa e reconstrói todas as folhas para a impressora
    container.innerHTML = '';
    
    for (let i = 0; i < placasSalvas.length; i += placasPorPagina) {
        const folha = document.createElement('div');
        folha.className = 'folha'; // O CSS injetado acima cuidará da quebra de página aqui

        placasSalvas.slice(i, i + placasPorPagina).forEach(p => {
            const div = document.createElement('div');
            div.className = 'placa';
            const uni = p.descricao_kglt?.toUpperCase() === 'UNIDADE' ? 'UN' : (p.descricao_kglt?.toUpperCase() || '');
            const art = uni === 'UN' ? 'A' : 'O';
            
            div.innerHTML = `
                <h1 style="font-size:16px;">${p.descricao || ''}</h1>
                <h1 style="font-size:92px;"><span style="font-size:18px;">R$</span> ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</h1>
                <h1 style="font-size:16px;">${p.preco_info ? `NESTA EMBALAGEM ${art} ${uni} SAI R$ ${p.preco_info}` : ''}</h1>
                <h1 style="font-size:16px;">${p.ean ? `Cód.${p.ean}` : ''}</h1>
            `;
            folha.appendChild(div);
        });
        container.appendChild(folha);
    }

    // O pulo do gato: Esperar o Electron renderizar os elementos antes de imprimir
    setTimeout(() => {
        window.print();
        // Volta ao normal após imprimir
        paginaPlacas = paginaOriginal;
        renderizarPlacas();
    }, 500);
}

function abrirBuscaNome() {
    document.getElementById('modal-busca').style.display = 'block'
    document.getElementById('input-busca-nome').value = ''
    document.querySelector('#tabela-busca tbody').innerHTML = ''
    document.getElementById('input-busca-nome').focus()
}

function onBuscaNomeKeydown(e) {
    if (e.key !== 'Enter') return
    const termo = e.target.value.trim().toUpperCase()
    if (!termo) return
    const resultados = placasBanco.filter(p =>
        p.descricao?.toUpperCase().includes(termo) ||
        p.codigo?.includes(termo) ||
        p.ean?.includes(termo)
    ).slice(0, 50)

    const tbody = document.querySelector('#tabela-busca tbody')
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
}

function processarImportacao() {
    const texto = document.getElementById('import-texto').value.trim()
    if (!texto) return
    const qtdGlobal = parseInt(document.getElementById('qtd-input')?.value) || 1
    const logErros = document.getElementById('log-erros')
    const listaErros = document.getElementById('lista-erros')
    listaErros.innerHTML = ''
    let itensErros = [], contador = 0

    texto.split(/\r?\n/).forEach(linha => {
        const colunas = linha.split(/\t| {2,}/)
        if (colunas.length >= 2) {
            const descProcurada = colunas[0].trim().toUpperCase()
            const precoNovo = parseFloat(colunas[1].replace('R$', '').replace(/\s/g, '').replace(',', '.').trim())
            if (!isNaN(precoNovo)) {
                const prod = placasBanco.find(p => p.descricao?.toUpperCase() === descProcurada) ||
                             placasBanco.find(p => p.descricao?.toUpperCase().includes(descProcurada))
                if (prod) {
                    const qtdKgL = parseFloat(prod.quantidade_kg_l)
                    const precoUn = qtdKgL > 0 ? (precoNovo / qtdKgL).toFixed(2).replace('.', ',') : prod.preco_venda
                    for (let i = 0; i < qtdGlobal; i++) {
                        placasSalvas.push({ ...prod, preco: precoNovo, preco_info: precoUn, id_unico: Date.now() + Math.random() })
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
    } else {
        fecharModais()
    }
    salvarERenderizar()
    document.getElementById('import-texto').value = ''
}



const style = document.createElement('style');
style.innerHTML = `
  /* Estilos para a tela (visualização) */
  #container-placas {
    background: #f0f0f0;
    padding: 20px;
  }

  .folha {
    background: white;
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto 20px auto;
    padding: 5mm;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    
    /* ORGANIZAÇÃO EM DUAS COLUNAS */
    display: flex !important;
    flex-wrap: wrap !important;
    align-content: flex-start;
    justify-content: flex-start;
    gap: 0; /* Ajuste se quiser espaço entre elas */
  }

  /* CADA PLACA OCUPA 50% DA LARGURA */
  .placa {
    width: 50% !important;
    box-sizing: border-box;
    border: 1px solid #000; /* Borda para visualização/corte */
    padding: 10px;
  }

  /* CONFIGURAÇÃO DE IMPRESSÃO */
  @media print {
    /* Oculta interface do sistema */
    .sidebar, .controls-placas, .context-menu, .modal-overlay, 
    #popupProdutos, #modalImport, .btn-limpar, nav, header { 
        display: none !important; 
    }

    @page { 
        size: A4; 
        margin: 0; 
    }

    html, body, .main, #container-placas {
        background: #fff !important;
        height: auto !important;
        overflow: visible !important;
        margin: 0 !important;
        padding: 0 !important;
        display: block !important;
    }

    folha {
    background: white;
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto 20px auto;
    padding: 5mm;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    
    /* ORGANIZAÇÃO EM DUAS COLUNAS */
    display: flex !important;
    flex-wrap: wrap !important;
    align-content: flex-start;
    justify-content: flex-start;
    gap: 0; /* Ajuste se quiser espaço entre elas */
  }

    placa {
    width: 4% !important;
    box-sizing: border-box;
    border: 1px solid #000; /* Borda para visualização/corte */
    padding: 10px;
  }
  }
`;
document.head.appendChild(style);