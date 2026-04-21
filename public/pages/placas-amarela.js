var plaquesBancoAmarela = []
var plaquesSalvasAmarela = JSON.parse(localStorage.getItem(`placasSalvasAmarela_${window.getUsuario()}`)) || []
var paginaPlacasAmarela = 0
const plaquesPorPaginaAmarela = 8  // 4 linhas x 2 colunas = 8
var placaClicadaAmarela = null
var imprimindo = false;

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
        <div class="controls-placas bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
            <div class="flex gap-3 flex-wrap items-end mb-4">
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">EAN / Código</label>
                    <input type="text" id="ean-input-am" autocomplete="off" autofocus
                        class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:border-red-400">
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preço (R$)</label>
                    <input type="number" id="preco-input-am" step="0.01"
                        class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:border-red-400">
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Qtd</label>
                    <input type="number" id="qtd-input-am" value="1" min="1"
                        class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-16 focus:outline-none focus:border-red-400">
                </div>
                <button id="btn-add-placa-am" class="px-4 py-2 text-white text-sm font-semibold rounded-lg" style="background:#28a745;">➕ Adicionar</button>
                <button id="btn-abrir-import-am" class="px-4 py-2 text-white text-sm font-semibold rounded-lg" style="background:#6f42c1;">📥 Importar Tabela</button>
                <button id="btn-abrir-busca-am" class="px-4 py-2 text-white text-sm font-semibold rounded-lg" style="background:#007bff;">🔍 Buscar Nome</button>
            </div>
            <div class="flex gap-3 items-center pt-4 border-t border-gray-100 flex-wrap">
                <button id="btn-print-atual-am" class="px-4 py-2 text-white text-sm font-semibold rounded-lg" style="background:#4a4a4a;">🖨️ Pág. Atual</button>
                <button id="btn-print-tudo-am" class="px-4 py-2 text-white text-sm font-semibold rounded-lg" style="background:#2d3436;">🖨️ Imprimir Tudo</button>
                <button id="btn-pag-ant-am" class="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">◀ Ant.</button>
                <span id="contador-pagina-am" class="text-sm font-semibold text-gray-500 min-w-[110px] text-center">Página 1 de 1</span>
                <button id="btn-pag-prox-am" class="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Próx ▶</button>
                <button id="btn-limpar-am" class="px-4 py-2 text-white text-sm font-semibold rounded-lg ml-auto" style="background:#dc3545;">🗑 Limpar Tudo</button>
            </div>
        </div>
        <div id="container-placas-am"></div>
    `, 'Placas Amarelas')

    if (plaquesBancoAmarela.length === 0) {
        try {
            const res = await fetch('http://localhost:3000/produtos', { headers: authHeaders() })
            const data = await res.json()
            if (Array.isArray(data)) {
                plaquesBancoAmarela = data.map(p => ({
                    ...p,
                    preco_venda: parseFloat(p.preco_venda),
                    quantidade_kg_l: parseFloat(p.quantidade_kg_l || 0)
                }))
            }
        } catch { console.error('Erro ao carregar banco de placas amarelas') }
    }

    renderizarPlacasAmarela()
    vincularEventosPlacasAmarela()
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
    document.getElementById('btn-print-atual-am').onclick = () => { window.print(); setTimeout(() => registrarImpressaoPlacas(), 2000) }
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

function adicionarPlacaAmarela() {
    const ean = document.getElementById('ean-input-am').value.trim()
    const preco = parseFloat(document.getElementById('preco-input-am').value)
    const quantidade = parseInt(document.getElementById('qtd-input-am').value) || 1
    if (!ean || isNaN(preco)) return

    const prod = plaquesBancoAmarela.find(p => p.ean === ean) || plaquesBancoAmarela.find(p => p.codigo === ean)
    if (prod) {
        const qtdKgL = parseFloat(prod.quantidade_kg_l)
        const precoUn = qtdKgL > 0 ? (preco / qtdKgL).toFixed(2).replace('.', ',') : prod.preco_venda
        for (let i = 0; i < quantidade; i++) {
            plaquesSalvasAmarela.push({ ...prod, preco, preco_info: precoUn, id_unico: Date.now() + Math.random() })
        }
        salvarERenderizarAmarela()
        const novasPlacasAm = []
        for (let i = 0; i < quantidade; i++) {
            novasPlacasAm.push({ descricao: prod.descricao, codigo: prod.codigo, ean: prod.ean, preco, tipo_placa: 'amarela' })
        }
        registrarLogPlacas(novasPlacasAm)
        document.getElementById('ean-input-am').value = ''
        document.getElementById('preco-input-am').value = ''
        document.getElementById('qtd-input-am').value = 1
        document.getElementById('ean-input-am').focus()
    } else {
        alert('Produto não encontrado. Use "Buscar Nome" para localizar.')
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
    if (!lista.length) return

    const folha = document.createElement('div')
    folha.className = 'folha-amarela'

    lista.forEach(p => {
        const div = document.createElement('div')
        div.className = 'placa-amarela'
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
                input.style.cssText = `width:90%; font-size:${h.style.fontSize}; text-align:center; font-weight:bold; border:2px solid #b51515; background:#ffe400;`
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
                        salvarERenderizarAmarela()
                    } else {
                        if (field === 'ean') { p.ean = ''; salvarERenderizarAmarela() } else { renderizarPlacasAmarela() }
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

        folha.appendChild(div)
    })
    container.appendChild(folha)
}

function onExcluirPlacaAmarela() {
    plaquesSalvasAmarela = plaquesSalvasAmarela.filter(p => p !== placaClicadaAmarela)
    salvarERenderizarAmarela()
}

function salvarERenderizarAmarela() {
    localStorage.setItem(`placasSalvasAmarela_${getUsuario()}`, JSON.stringify(plaquesSalvasAmarela))
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
        window.print();
    }, 500);

    setTimeout(() => {
        imprimindo = false;
        renderizarPlacasAmarela();
    }, 1000);
}

function abrirBuscaNomeAmarela() {
    document.getElementById('modal-busca-am').style.display = 'block'
    document.getElementById('input-busca-nome-am').value = ''
    document.querySelector('#tabela-busca-am tbody').innerHTML = ''
    document.getElementById('input-busca-nome-am').focus()
}

function onBuscaNomeKeydownAmarela(e) {
    if (e.key !== 'Enter') return
    const termo = e.target.value.trim().toUpperCase()
    if (!termo) return
    const resultados = plaquesBancoAmarela.filter(p =>
        p.descricao?.toUpperCase().includes(termo) ||
        p.codigo?.includes(termo) ||
        p.ean?.includes(termo)
    ).slice(0, 50)

    const tbody = document.querySelector('#tabela-busca-am tbody')
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
}

function processarImportacaoAmarela() {
    const texto = document.getElementById('import-texto-am').value.trim()
    if (!texto) return
    const qtdGlobal = parseInt(document.getElementById('qtd-input-am')?.value) || 1
    const logErros = document.getElementById('log-erros-am')
    const listaErros = document.getElementById('lista-erros-am')
    listaErros.innerHTML = ''
    let itensErros = [], contador = 0

    texto.split(/\r?\n/).forEach(linha => {
        const colunas = linha.split(/\t| {2,}/)
        if (colunas.length >= 2) {
            const descProcurada = colunas[0].trim().toUpperCase()
            const precoNovo = parseFloat(colunas[1].replace('R$', '').replace(/\s/g, '').replace(',', '.').trim())
            if (!isNaN(precoNovo)) {
                const prod = plaquesBancoAmarela.find(p => p.descricao?.toUpperCase() === descProcurada) ||
                             plaquesBancoAmarela.find(p => p.descricao?.toUpperCase().includes(descProcurada))
                if (prod) {
                    const qtdKgL = parseFloat(prod.quantidade_kg_l)
                    const precoUn = qtdKgL > 0 ? (precoNovo / qtdKgL).toFixed(2).replace('.', ',') : prod.preco_venda
                    for (let i = 0; i < qtdGlobal; i++) {
                        plaquesSalvasAmarela.push({ ...prod, preco: precoNovo, preco_info: precoUn, id_unico: Date.now() + Math.random() })
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
        fecharModaisAmarela()
    }
    salvarERenderizarAmarela()
    document.getElementById('import-texto-am').value = ''
}

function fecharModaisAmarela() {
    document.getElementById('modal-busca-am').style.display = 'none'
    document.getElementById('modal-import-am').style.display = 'none'
    document.getElementById('log-erros-am').style.display = 'none'
}