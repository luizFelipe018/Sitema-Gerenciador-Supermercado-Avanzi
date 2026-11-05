var plaquesBancoGrande = []
var plaquesSalvasGrande = []
var paginaPlacasGrande = 0
const plaquesPorPaginaGrande = 2
var placaClicadaGrande = null
var placaClicadaElGrande = null
var _salvandoGrande = false
const CSS_FOLHA_G = `
.folha-grande { position:relative; display:flex; flex-direction:row; width:297mm; height:210mm; margin:0 auto 16px; background:#fff !important; box-sizing:border-box; box-shadow:0 2px 12px rgba(0,0,0,0.15); gap:0; }
.placa-grande { width:50%; height:100%; background:transparent !important; box-sizing:border-box; display:grid; place-items:end center; border:none; }
/* Guia de corte: 1 linha preta vertical (1px) no meio da folha, dividindo as
   2 placas Grande lado a lado para recorte. Nao altera o tamanho das placas
   nem a quantidade de paginas. */
.folha-grande::after { content:''; position:absolute; left:calc(50% - 0.5px); top:0; width:1px; height:100%; background:#000; z-index:5; pointer-events:none; }
.placa-selecionada { outline:none !important; box-shadow:none !important; }
@media print { @page { size: A4 landscape; margin: 0; } .folha-grande { box-shadow:none; margin:0; gap:0; } .placa-grande { padding: 0 !important; border:none; grid-template-rows:100%; overflow:hidden; } .placa-grande .placa-grande-conteudo { margin:0 auto !important; } .pg-rodape-wrapper { padding-bottom:14px; } .pg-toggle-fracao { display:none !important; } }
`

// Margem extra no topo (px no layout 561x794): desce o bloco de descricao
// (texto 1/2/3) para abaixo do fim do banner SUPER OFERTA (~246px com o
// desenho novo), deixando um respiro entre o cabecalho e a descricao.
// 40px no layout ~ 10,6mm na placa Grande original.
const MARGEM_TOPO_G = 40

function carregarEstilos() {
    if (!document.getElementById('placas-main-style')) {
        const link = document.createElement('link')
        link.id = 'placas-main-style'
        link.rel = 'stylesheet'
        link.href = 'style.css'
        document.head.appendChild(link)
    }
    if (!document.getElementById('placas-grande-guide')) {
        const style = document.createElement('style')
        style.id = 'placas-grande-guide'
        style.textContent = '#container-placas-g { display:flex; flex-wrap:wrap; gap:12px; } .placa-grande-conteudo { outline:1px dashed rgba(255,0,0,0.25); outline-offset:-1px; transform:scale(0.45); transform-origin:top left; } .placa-grande-conteudo * { color:#000 !important; }'
        document.head.appendChild(style)
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

function quebrarPorMarca(descricao, marca) {
    if (!marca || !marca.trim()) return quebrarNome(descricao)
    const idx = descricao.toUpperCase().indexOf(marca.trim().toUpperCase())
    if (idx === -1) return quebrarNome(descricao)
    return {
        linha1: descricao.slice(0, idx).trim(),
        linha2: descricao.slice(idx, idx + marca.trim().length),
        linha3: descricao.slice(idx + marca.trim().length).trim()
    }
}

async function carregarPlacasGrande() {
    carregarEstilos()
    setActive('btn-placas-grande')
    setConteudo(`
        <div class="pg-wrapper" style="max-width:1200px; margin:0 auto;">

            <div class="dash-glass dash-animate pg-card" style="padding:20px; margin-bottom:20px;">
                <div class="pg-status" id="pg-status-banco" style="font-size:11px; color:rgba(255,255,255,0.3); margin-bottom:10px; padding:6px 10px; border-radius:6px; background:rgba(255,255,255,0.03);">Carregando produtos do banco...</div>
                <div class="frc mb16" style="align-items:end;">
                    <div class="fcc">
                        <label class="lb">Código / EAN</label>
                        <input type="text" id="ean-input-g" autocomplete="off" autofocus class="inp inp-w140">
                    </div>
                    <div class="fcc">
                        <label class="lb">Preço (R$)</label>
                        <input type="text" id="preco-input-g" inputmode="decimal" class="inp inp-w120">
                    </div>
                    <div class="fcc">
                        <label class="lb">Qtd</label>
                        <input type="number" id="qtd-input-g" value="1" min="1" class="inp inp-w70">
                    </div>
                    <button id="btn-add-placa-g" class="btn-p">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Adicionar
                    </button>
                    <button id="btn-abrir-busca-g" class="btn-s">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        Buscar
                    </button>
                    <button id="btn-abrir-import-g" class="btn-s">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Importar
                    </button>
                </div>
                <div class="bar pg-actions">
                    <button id="btn-print-atual-g" class="btn-sm">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Pág. Atual
                    </button>
                    <button id="btn-print-tudo-g" class="btn-sm">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Imprimir Tudo
                    </button>

                    <div class="frc6" style="margin-left:8px;">
                        <button id="btn-pag-ant-g" class="btn-g">
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                            Ant.
                        </button>
                        <span id="contador-pagina-g" class="pg">Página 1 de 1</span>
                        <button id="btn-pag-prox-g" class="btn-g">
                            Próx.
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                    </div>

                    <button id="btn-limpar-g" class="btn-d mla">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        Limpar
                    </button>
                </div>
            </div>

            <div class="pg-plaques" id="container-placas-g" style="padding:10px 0;"></div>

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

    const carregadas = await coreCarregarPlacas('grande', p => {
        const prod = plaquesBancoGrande.find(x => String(x.codigo) === String(p.codigo) || (x.ean && p.ean && String(x.ean) === String(p.ean)))
        return {
            ...p,
            preco: Math.round(parseFloat(p.preco) * 100) / 100,
            quantidade_kg_l: parseFloat(p.quantidade_kg_l || 0),
            id_unico: Date.now() + Math.random(),
            marca: p.marca || prod?.marca || '',
            _fs: coreParseConfig(p.config) || undefined
        }
    })
    plaquesSalvasGrande = carregadas.placas
    if (carregadas.origem === 'pendente' || carregadas.origem === 'cache-servidor-vazio') {
        atualizarStatusBanco(`⚠ Exibindo ${plaquesSalvasGrande.length} placa(s) do armazenamento local — o servidor ainda não recebeu o último salvamento. Elas serão reenviadas ao salvar.`, '#facc15')
    } else if (carregadas.origem === 'offline') {
        atualizarStatusBanco(`⚠ Servidor fora do ar — exibindo ${plaquesSalvasGrande.length} placa(s) salvas neste computador.`, '#facc15')
    }

    renderizarPlacasGrande()
    vincularEventosPlacasGrande()
    window._placasAtuais = plaquesSalvasGrande
}

function calcBrandFontSize(texto) {
    if (!texto) return 100
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const availableWidth = 472
    let fontSize = 400
    ctx.font = `900 ${fontSize}px 'Arial Black', Arial, sans-serif`
    let textWidth = ctx.measureText(texto.toUpperCase()).width
    while (textWidth > availableWidth && fontSize > 8) {
        fontSize -= 2
        ctx.font = `900 ${fontSize}px 'Arial Black', Arial, sans-serif`
        textWidth = ctx.measureText(texto.toUpperCase()).width
    }
    return fontSize
}

function montarPlacaGrandeHTML(p) {
    const descricaoLimpa = (p.descricao || '').replace(/\s+(KG|LT|LITRO|LITROS|KILO|KILOS|QUILO|QUILOS)$/i, '')
    const { linha1, linha2, linha3 } = quebrarPorMarca(descricaoLimpa, p.marca)
    const preco = parseFloat(p.preco)

    const semEan = !p.ean || String(p.ean).trim() === ''
    const qtdKgL = (p.quantidade_kg_l !== null && p.quantidade_kg_l !== undefined && p.quantidade_kg_l !== '')
        ? parseFloat(p.quantidade_kg_l)
        : (semEan ? 1 : 0)
    const uniBase = semEan ? 'KG' : 'UN'
    const uni = p._fs?.unidade || uniBase

    const fracionar = p._fs?.fracionar100g && uni === 'KG'
    const uniDisplay = fracionar ? '100G' : uni
    const precoExibir = fracionar ? preco / 10 : preco
    const precoTrunc = Math.round(precoExibir * 100) / 100
    const precoFmtExib = precoTrunc.toFixed(2).replace('.', ',')
    const [reaisExib, centsExib] = precoFmtExib.split(',')
    const precoFontSize = p._fs?.preco || (reaisExib.length <= 2 ? 140 : 130)

    const mUniRod = (p.descricao || '').match(/(\d+[.,]?\d*)\s*(L|ML|KG|G)\b|\b(KG|L)\b/i)
    const mUnit = mUniRod && (mUniRod[2] || mUniRod[3])
    const uniRodape = p._fs?.unidade || (mUnit ? ((mUnit === 'L' || mUnit === 'ML') ? 'LT' : 'KG') : (!semEan ? 'UN' : 'KG'))
    const artRodape = uniRodape === 'UN' ? 'A' : 'O'
    const precoKgL = qtdKgL > 0 ? qtdKgL : 1
    const precoUn = (preco / precoKgL).toFixed(2).replace('.', ',')
    const rodape = p._fs?.rodape || `${semEan ? '' : 'NESTA EMBALAGEM '}${artRodape} ${uniRodape} SAI A R$ ${precoUn}`

    const brandFontSize = calcBrandFontSize(linha2)
    const linha1FontSize = p._fs?.linha1 || Math.max(Math.round(brandFontSize * 0.4), 12)
    const linha3FontSize = p._fs?.linha3 || Math.max(Math.round(brandFontSize * 0.4), 12)
    const brandSz = p._fs?.linha2 || brandFontSize
    const gapLinha3 = p._fs?.gap3 ?? Math.max(Math.round(linha3FontSize * 0.6), 4)

    return `
        <div id="placa-grande-conteudo" class="placa-grande-conteudo" style="width:561px; height:794px; margin:0 auto 88px; position:relative; box-sizing:border-box; font-family:'Arial Black',Arial,sans-serif; font-weight:900; background-image:url('assets/MODELOS PLACAS 2026.png'); background-size:100% 100%; background-position:center; background-repeat:no-repeat;">
            <div class="pg-texto-wrapper" style="width:100%; display:flex; flex-direction:column; align-items:center; gap:2mm; line-height:1.7; padding-bottom:110px; margin-top:${200 + MARGEM_TOPO_G}px;">
                <div class="pg-linha1-wrapper" style="width:100%; text-align:center; margin-top:30px;">
                    <div class="pg-linha1" data-field="linha1" style="font-size:${linha1FontSize}px; font-weight:bold; text-transform:uppercase; white-space:nowrap; overflow:hidden; transform:scaleY(1.3);">${linha1}</div>
                </div>

                <div class="pg-linha2-wrapper" style="width:90%; text-align:center; display:flex; align-items:center; justify-content:center;">
                    <div class="pg-linha2" data-field="linha2" style="font-size:${brandSz}px; font-weight:900; text-transform:uppercase; line-height:0.66; letter-spacing:2px; white-space:nowrap; width:100%; transform:scaleY(1.3);">${linha2}</div>
                </div>

                <div class="pg-linha3-wrapper" style="width:100%; text-align:center; margin-top:${gapLinha3}px;">
                    <div class="pg-linha3" data-field="linha3" style="font-size:${linha3FontSize}px; font-weight:bold; text-transform:uppercase; transform:scaleY(1.3);">${linha3}</div>
                </div>
            </div>

            <div class="pg-rodape-wrapper" style="width:100%; display:flex; flex-direction:column; align-items:center; gap:1mm; position:absolute; bottom:0; left:0;">
                <div class="pg-preco-wrapper" style="width:100%; display:flex; align-items:flex-end; justify-content:center; transform:scaleY(1.3);">
                    <span class="pg-preco-simbolo" style="font-size:20px; font-weight:bold; margin-right:2px; margin-bottom:20px; line-height:1;">R$</span>
                    <span class="pg-preco-valor" data-ajuste="preco" style="font-size:${precoFontSize}px; font-weight:900; line-height:1;">${reaisExib},${centsExib}</span>
                    ${fracionar
                        ? `<span class="pg-preco-unidade" style="font-size:16px; font-weight:bold; display:flex; flex-direction:column; align-items:center; line-height:1.15; margin-bottom:16px; margin-left:3px;">
                            <span>A CADA</span>
                            <span>100G</span>
                        </span>`
                        : `<span class="pg-preco-unidade" data-field="unidade" style="font-size:20px; font-weight:bold; margin-left:3px; margin-bottom:20px; line-height:1;">${uniDisplay}</span>`}
                </div>
                <div class="pg-rodape-texto-wrapper" style="width:100%; text-align:center; padding-top:2px; margin-top:90px;">
                    <div class="pg-rodape-texto" data-field="rodape" style="font-size:14px; font-weight:bold; line-height:0.66; transform:scaleY(1.3);">${rodape}</div>
                </div>
                ${uni === 'KG' ? `
                <span class="pg-toggle-fracao" data-fracao="${fracionar ? '1' : '0'}" style="position:absolute;bottom:4px;right:6px;cursor:pointer;font-size:10px;color:rgba(0,0,0,0.25);background:rgba(0,0,0,0.04);border-radius:4px;padding:2px 5px;letter-spacing:0.3px;user-select:none;white-space:nowrap;">
                    ${fracionar ? 'KG' : '100g'}
                </span>` : ''}
            </div>
        </div>
    `
}

/** Destaca a placa selecionada (apenas na tela). */
function marcarPlacaSelecionadaG(div, selecionada) {
    if (!div) return
    div.classList.toggle('placa-selecionada', !!selecionada)
    document.querySelectorAll('.placa-selecionada').forEach(el => {
        if (el !== div) el.classList.remove('placa-selecionada')
    })
}

/**
 * Salva a predefinição de texto (tamanhos/posições) da placa selecionada.
 * Chamado pelo menu de contexto (junto de Duplicar e Excluir).
 */
async function onSalvarPredefGrande() {
    const p = placaClicadaGrande
    if (!p) { toast('Selecione uma placa primeiro', 'aviso'); return }
    if (!p._fs || !Object.keys(p._fs).length) {
        toast('Esta placa não tem ajustes para salvar', 'info')
        return
    }
    await salvarPlacasGrande()
    toast('Predefinição da placa salva', 'ok')
}

/** Usa a predefinição da placa como padrão das novas placas do modelo. */
async function onSalvarPredefPadraoGrande() {
    const p = placaClicadaGrande
    if (!p) { toast('Selecione uma placa primeiro', 'aviso'); return }
    if (!p._fs || !Object.keys(p._fs).length) {
        toast('Esta placa não tem ajustes para salvar', 'info')
        return
    }
    coreSalvarPresetPadrao('grande', JSON.parse(JSON.stringify(p._fs)))
    toast('As novas placas já vão nascer com esta predefinição', 'ok')
}

function renderizarPlacasGrande() {    const container = document.getElementById('container-placas-g')
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
            <div class="es">
                <svg width="40" height="40" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:12px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                <p class="es-p">Nenhuma placa grande adicionada</p>
                <p class="es-sub">Digite um código e preço acima para começar</p>
            </div>`
        return
    }

    lista.forEach(p => {
        const div = document.createElement('div')
        div.style.cssText = 'background:#fff; overflow:hidden; display:inline-flex; flex:1;'
        div.innerHTML = montarPlacaGrandeHTML(p)

        // clique na placa (fora dos textos) seleciona a placa do menu de contexto
        div.addEventListener('click', (e) => {
            if (e.target.closest('[data-field]')) return
            placaClicadaGrande = p
            placaClicadaElGrande = div
            marcarPlacaSelecionadaG(div, true)
        })

        div.querySelectorAll('[data-field]').forEach(el => {
            el.style.cursor = 'pointer'
            const field = el.getAttribute('data-field')

            let clickTimer = null
            el.onclick = (e) => {
                if (field === 'preco') return
                if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; return }
                clickTimer = setTimeout(() => {
                    clickTimer = null
                    const field = el.getAttribute('data-field')
                    if (!p._fs) p._fs = {}
                    const atual = parseInt(el.style.fontSize) || 20
                    const popup = document.createElement('div')
                    popup.style.cssText = 'position:fixed;z-index:9999;display:flex;align-items:center;gap:6px;background:#1a1a1a;border:1px solid #444;border-radius:8px;padding:4px 8px;box-shadow:0 4px 20px rgba(0,0,0,0.6);user-select:none;'
                    popup.style.top = (e.clientY - 40) + 'px'
                    popup.style.left = (e.clientX - 60) + 'px'
                    const span = document.createElement('span')
                    span.style.cssText = 'color:#fff;font-size:13px;min-width:32px;text-align:center;'
                    span.textContent = atual
                    const btnMenos = document.createElement('button')
                    btnMenos.textContent = '−'
                    btnMenos.style.cssText = 'width:30px;height:30px;border:none;border-radius:6px;background:#b51515;color:#fff;font-size:18px;font-weight:bold;cursor:pointer;line-height:1;'
                    const btnMais = document.createElement('button')
                    btnMais.textContent = '+'
                    btnMais.style.cssText = 'width:30px;height:30px;border:none;border-radius:6px;background:#22c55e;color:#fff;font-size:18px;font-weight:bold;cursor:pointer;line-height:1;'
                    const ajustar = (delta) => {
                        const fs = parseInt(el.style.fontSize) || atual
                        const novo = Math.max(8, fs + delta)
                        el.style.fontSize = novo + 'px'
                        p._fs[field] = novo
                        span.textContent = novo
                    }
                    btnMenos.onclick = (ev) => { ev.stopPropagation(); ajustar(-2) }
                    btnMais.onclick = (ev) => { ev.stopPropagation(); ajustar(2) }
                    popup.append(btnMenos, span, btnMais)

                    if (field === 'linha3') {
                        const gapSpan = document.createElement('span')
                        gapSpan.style.cssText = 'color:#888;font-size:11px;margin:0 2px;'
                        gapSpan.textContent = '↕'
                        const dragHandle = document.createElement('div')
                        dragHandle.style.cssText = 'width:20px;height:20px;background:rgba(255,255,255,0.1);border-radius:4px;cursor:ns-resize;display:flex;align-items:center;justify-content:center;font-size:12px;color:#aaa;'
                        dragHandle.textContent = '⡇'
                        let dragStart = null, gapIni = null
                        dragHandle.onmousedown = (ev) => {
                            ev.stopPropagation(); ev.preventDefault()
                            const wrapper = el.parentElement
                            gapIni = parseInt(wrapper.style.marginTop) || parseInt(getComputedStyle(wrapper).marginTop) || 20
                            dragStart = ev.clientY
                            const onMove = (me) => {
                                const deltaGap = Math.round((me.clientY - dragStart) * 0.5)
                                const novo = Math.max(0, gapIni + deltaGap)
                                wrapper.style.marginTop = novo + 'px'
                            }
                            const onUp = (ue) => {
                                document.removeEventListener('mousemove', onMove)
                                document.removeEventListener('mouseup', onUp)
                                const wrapper = el.parentElement
                                const val = parseInt(wrapper.style.marginTop) || 0
                                p._fs.gap3 = val
                                salvarERenderizarGrande()
                            }
                            document.addEventListener('mousemove', onMove)
                            document.addEventListener('mouseup', onUp)
                        }
                        popup.append(gapSpan, dragHandle)
                    }
                    document.body.appendChild(popup)
                    const fecharPopup = (ev2) => {
                        if (!popup.contains(ev2.target)) {
                            popup.remove()
                            document.removeEventListener('mousedown', fecharPopup)
                            salvarERenderizarGrande()
                        }
                    }
                    setTimeout(() => document.addEventListener('mousedown', fecharPopup), 100)
                }, 300)
            }

            el.ondblclick = async () => {
                if (clickTimer) { clearTimeout(clickTimer); clickTimer = null }
                const field = el.getAttribute('data-field')

                if (field === 'unidade') {
                    if (!p._fs) p._fs = {}
                    const ciclo = { KG: 'LT', LT: 'UN', UN: 'KG' }
                    p._fs.unidade = ciclo[el.innerText.trim()] || 'KG'
                    delete p._fs.fracionar100g
                    await salvarERenderizarGrande()
                    return
                }

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
                        const partes = quebrarPorMarca(p.descricao, p.marca)
                        p.descricao = v.toUpperCase() + (partes.linha2 ? ' ' + partes.linha2 + (partes.linha3 ? ' ' + partes.linha3 : '') : '')
                    } else if (field === 'linha2') {
                        const partes = quebrarPorMarca(p.descricao, p.marca)
                        p.descricao = (partes.linha1 ? partes.linha1 + ' ' : '') + v.toUpperCase() + (partes.linha3 ? ' ' + partes.linha3 : '')
                        p.marca = v.toUpperCase()
                    } else if (field === 'linha3') {
                        const partes = quebrarPorMarca(p.descricao, p.marca)
                        p.descricao = (partes.linha1 ? partes.linha1 + ' ' : '') + (partes.linha2 ? partes.linha2 + ' ' : '') + v.toUpperCase()
                    } else if (field === 'rodape') {
                        if (!p._fs) p._fs = {}
                        p._fs.rodape = v
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
            // "Usar como padrão" só aparece se a placa tem ajustes salvos
            const itemPadrao = document.getElementById('ctx-padrao-novas')
            if (itemPadrao) {
                itemPadrao.style.display = (p._fs && Object.keys(p._fs).length) ? 'flex' : 'none'
            }
            menu.style.display = 'block'
            menu.style.top = e.clientY + 'px'
            menu.style.left = e.clientX + 'px'
        }

        const toggleFracao = div.querySelector('.pg-toggle-fracao')
        if (toggleFracao) {
            toggleFracao.onclick = (e) => {
                e.stopPropagation()
                if (!p._fs) p._fs = {}
                p._fs.fracionar100g = !p._fs.fracionar100g
                salvarERenderizarGrande()
            }
        }

        container.appendChild(div)
    })

}

async function onExcluirPlacaGrande() {
    coreExcluirPlaca({ salvas: plaquesSalvasGrande, clicada: placaClicadaGrande })
    await salvarERenderizarGrande()
}

async function onDuplicarPlacaGrande() {
    coreDuplicarPlaca({ salvas: plaquesSalvasGrande, clicada: placaClicadaGrande })
    await salvarERenderizarGrande()
}

async function salvarPlacasGrande() {
    if (_salvandoGrande) return
    _salvandoGrande = true
    try {
        const placas = plaquesSalvasGrande.map(p => ({
            descricao: p.descricao,
            codigo: p.codigo,
            ean: p.ean,
            preco: p.preco,
            preco_info: p.preco_info,
            quantidade_kg_l: p.quantidade_kg_l,
            descricao_kglt: p.descricao_kglt,
            marca: p.marca || null,
            config: p._fs ? JSON.stringify(p._fs) : null
        }))
        coreCacheSalvar('grande', placas)
        const res = await fetch(API+'/registros-placas', {
            method: 'POST',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'grande', placas })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status))
        coreCachePendente('grande', false)
        if (data.logIds && data.logIds.length) {
            window._ultimasPlacasGeradas.push(...data.logIds)
        }
        // se havia aviso de copia local/offline, volta ao normal apos sincronizar
        const stEl = document.getElementById('pg-status-banco')
        if (stEl && /armazenamento local|Servidor fora do ar/i.test(stEl.innerText)) {
            atualizarStatusBanco(`✓ ${plaquesSalvasGrande.length} placa(s) salva(s) no servidor`)
        }
    } catch (e) {
        console.error('Erro ao salvar placas grandes:', e)
        coreCachePendente('grande', true)
        alert('Erro ao salvar no servidor: ' + e.message +
            '\n\nSuas placas continuam salvas neste computador e serão reenviadas quando o servidor voltar.')
    } finally {
        _salvandoGrande = false
    }
}

async function salvarERenderizarGrande() {
    await salvarPlacasGrande()
    renderizarPlacasGrande()
}

async function mudarPaginaPlacasGrande(v) {
    await salvarPlacasGrande()
    paginaPlacasGrande = coreMudarPagina({ salvas: plaquesSalvasGrande, porPagina: plaquesPorPaginaGrande, pagina: paginaPlacasGrande }, v)
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
    const preco = Math.round(parseFloat(precoRaw.replace(',', '.')) * 100) / 100
    const quantidade = parseInt(document.getElementById('qtd-input-g').value) || 1
    if (!codigo || isNaN(preco)) return

    let prod = plaquesBancoGrande.find(p => String(p.ean) === codigo) || plaquesBancoGrande.find(p => String(p.codigo) === codigo)

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

    if (prod) {
        const qtdKgL = parseFloat(prod.quantidade_kg_l)
        const precoUn = qtdKgL > 0 ? (preco / qtdKgL).toFixed(2).replace('.', ',') : prod.preco_venda
        for (let i = 0; i < quantidade; i++) {
            plaquesSalvasGrande.push(coreAplicarPresetPadrao({ ...prod, preco, preco_info: precoUn, id_unico: Date.now() + Math.random() }, 'grande'))
        }
        await salvarERenderizarGrande()
        document.getElementById('ean-input-g').value = ''
        document.getElementById('preco-input-g').value = ''
        document.getElementById('qtd-input-g').value = 1
        document.getElementById('ean-input-g').focus()
    } else {
        alert('Produto não encontrado. Verifique o código e tente novamente.')
    }
}

function abrirBuscaNomeGrande() {
    coreAbrirBuscaNome('-g')
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
    return coreExtrairKgLt(desc)
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
                let prod = placasBancoGrande.find(p => p.descricao?.toUpperCase() === descProcurada) ||
                           placasBancoGrande.find(p => p.descricao?.toUpperCase().includes(descProcurada))
                if (!prod) {
                    try {
                        const res = await fetch(API+'/produtos/busca?q='+encodeURIComponent(descProcurada), { headers: authHeaders() })
                        if (res.ok) {
                            const lista = await res.json()
                            if (lista.length > 0) {
                                const res2 = await fetch(API+'/produtos/'+encodeURIComponent(lista[0].codigo), { headers: authHeaders() })
                                if (res2.ok) {
                                    const p = await res2.json()
                                    placasBancoGrande.push(p)
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
                        placasSalvasGrande.push(coreAplicarPresetPadrao({ ...prod, preco: precoNovo, preco_info: precoUn, id_unico: Date.now() + Math.random() }, 'grande'))
                    }
                    contador++
                } else {
                    const qtdKgL = extrairKgLtG(descProcurada)
                    const precoUn = qtdKgL > 0 ? (precoNovo / qtdKgL).toFixed(2).replace('.', ',') : precoNovo.toFixed(2).replace('.', ',')
                    for (let i = 0; i < qtdGlobal; i++) {
                        placasSalvasGrande.push(coreAplicarPresetPadrao({ descricao: colunas[0].trim(), codigo: '', ean: '', preco: precoNovo, preco_info: precoUn, quantidade_kg_l: qtdKgL, id_unico: Date.now() + Math.random() }, 'grande'))
                    }
                    contador++
                }
            }
        }
    }

    fecharModaisGrande()
    alert(contador + ' placa(s) gerada(s).')
    await salvarERenderizarGrande()
    document.getElementById('import-texto-g').value = ''


    fecharModaisGrande()
    alert(contador + ' placa(s) gerada(s).')
    await salvarERenderizarGrande()
    document.getElementById('import-texto-g').value = ''

    if (destino === 'grande4') {
        if (document.getElementById('btn-placas-grande-4')) document.getElementById('btn-placas-grande-4').click()
        else if (typeof carregarPlacasGrande4 === 'function') carregarPlacasGrande4()
        if (typeof salvarERenderizarGrande4 === 'function') await salvarERenderizarGrande4()
        document.getElementById('import-texto-g').value=''; return
    }
    if (destino === 'a4') {
        if (document.getElementById('btn-placas-a4')) document.getElementById('btn-placas-a4').click()
        else if (typeof carregarPlacasA4 === 'function') carregarPlacasA4()
        if (typeof salvarERenderizarA4 === 'function') await salvarERenderizarA4()
        document.getElementById('import-texto-g').value=''; return
    }

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
        const folha = document.createElement('div')
        folha.className = 'folha-grande'
        const len = plaquesSalvasGrande.length
        const start = paginaPlacasGrande * plaquesPorPaginaGrande
        const page = plaquesSalvasGrande.slice(start, Math.min(start + plaquesPorPaginaGrande, len))
        page.forEach(p => {
            const div = document.createElement('div')
            div.className = 'placa-grande'
            div.innerHTML = montarPlacaGrandeHTML(p)
            folha.appendChild(div)
        })
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
