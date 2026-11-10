var plaquesBancoPequena = []
var plaquesSalvasPequena = []
var paginaPlacasPequena = 0
const plaquesPorPaginaPequena = 4
var placaClicadaPequena = null
var placaClicadaElPequena = null
var _salvandoPequena = false

// A placa Placa Pequena e a MESMA placa Media original (561x794px), so que reduzida por
// transform para caber na celula de 105mm x 148,5mm (396,85 x 561,26px).
// Manter o layout interno em 561x794 preserva todas as metricas ja calibradas
// (margin-top do texto, preco de 140px, padding-bottom, margem do rodape).
const K_IMPRESSAO_PEQUENA = 0.7068
const K_TELA_PEQUENA = 0.32
// Zoom de visualização (só tela). A impressão usa sempre K_IMPRESSAO_PEQUENA.
const ZOOM_MIN_PEQUENA = 0.32
const ZOOM_MAX_PEQUENA = 1.45
const PASSOS_ZOOM_PEQUENA = [0.32, 0.45, 0.6, 0.8, 1.0, 1.2, 1.45]
// recupera o zoom salvo da última sessão
let zoomTelaPequena = (() => {
    const salvo = Number(localStorage.getItem('zoomPequena'))
    return salvo >= ZOOM_MIN_PEQUENA && salvo <= ZOOM_MAX_PEQUENA ? salvo : K_TELA_PEQUENA
})()

// Margem extra no topo (px no layout 561x794): desce o bloco texto 1/2/3
// para abaixo do fim do banner SUPER OFERTA (o desenho atual termina ~246px)
// e preserva o espaco em branco do topo (ja presente na arte) para a dobra.
// 40px no layout ~ 7,5mm na folha impressa (148,5mm de altura -> 794px).
const MARGEM_TOPO_PEQUENA = 40

// Regra compartilhada entre a tela e a janela de impressao.
const CSS_PLACA_PEQUENA = `
.placa-pequena { position:relative; overflow:hidden; background:transparent; }
/* display:flow-root cria BFC e impede o colapso da margin-top do .pg-texto-wrapper.
   Sem isso os 200px "escapavam" para fora da placa e o texto subia para o topo,
   ficando por cima do banner SUPER OFERTA. */
.placa-pequena .placa-media-conteudo { display:flow-root; width:561px !important; height:794px !important; margin:0 !important; transform:scale(var(--k)); transform-origin:top left; outline:none !important; }
/* Guias de corte: linha preta de 1px passando na metade da folha (vertical e
   horizontal), dividindo as 4 placas pequena para recorte. Nao altera o
   tamanho das placas nem a quantidade de paginas. */
.folha-pequena, .folha-pequena-tela { position:relative; }
.folha-pequena::before, .folha-pequena::after,
.folha-pequena-tela::before, .folha-pequena-tela::after { content:''; position:absolute; background:#000; z-index:5; pointer-events:none; }
.folha-pequena::before, .folha-pequena-tela::before { top:calc(50% - 0.5px); left:0; width:100%; height:1px; }
.folha-pequena::after, .folha-pequena-tela::after { left:calc(50% - 0.5px); top:0; width:1px; height:100%; }
`

const CSS_FOLHA_PEQUENA = `
@page { size: A4 portrait; margin: 0; }
${CSS_PLACA_PEQUENA}
.folha-pequena { --k:${K_IMPRESSAO_PEQUENA}; display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:0; width:210mm; height:297mm; margin:0; padding:0; background:#fff !important; box-sizing:border-box; overflow:hidden; page-break-after:always; break-after:page; page-break-inside:avoid; break-inside:avoid; }
.folha-pequena .placa-pequena { width:100%; height:100%; }
.placa-selecionada { outline:none !important; }
@media print {
  @page { size: A4 portrait; margin: 0; }
  html, body { margin:0; padding:0; background:#fff; }
  .folha-pequena { box-shadow:none !important; margin:0 !important; border:none !important; }
  .pg-toggle-fracao { display:none !important; }
}
`

function carregarEstilos() {
    if (!document.getElementById('placas-main-style')) {
        const link = document.createElement('link')
        link.id = 'placas-main-style'
        link.rel = 'stylesheet'
        link.href = 'style.css'
        document.head.appendChild(link)
    }
    if (!document.getElementById('placas-pequena-guide')) {
        const style = document.createElement('style')
        style.id = 'placas-pequena-guide'
        style.textContent = CSS_PLACA_PEQUENA + `
#container-placas-pequena { display:flex; flex-wrap:wrap; gap:0; justify-content:center; align-items:flex-start; }
.folha-pequena-tela { --k:var(--k-pequena-tela, ${K_TELA_PEQUENA}); display:grid; grid-template-columns:repeat(2, calc(561px * var(--k))); grid-template-rows:repeat(2, calc(794px * var(--k))); gap:0; margin:0 auto 16px; background:#fff; box-sizing:border-box; box-shadow:0 2px 12px rgba(0,0,0,0.15); }
.folha-pequena-tela .placa-pequena { width:100%; height:100%; }
.placa-media-conteudo * { color:#000 !important; }
/* Zoom de visualização: escala a folha inteira na tela, sem afetar a impressão. */
#container-placas-pequena { --k-pequena-tela:${K_TELA_PEQUENA}; }
.folha-pequena-tela { transform-origin: top center; }
.d3-zoom {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 3px;
    border-radius: var(--r-md);
    background: var(--surface-2);
    border: 1px solid var(--border);
}
.d3-zoom button {
    width: 26px;
    height: 26px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--r-sm);
    background: transparent;
    color: var(--text-2);
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    transition: background var(--dur) var(--ease), color var(--dur) var(--ease);
}
.d3-zoom button:hover { background: var(--surface-3); color: var(--text-1); }
.d3-zoom span {
    min-width: 46px;
    text-align: center;
    font-size: 11.5px;
    font-weight: 700;
    color: var(--text-2);
    font-variant-numeric: tabular-nums;
}
.d3-zoom button.is-on { background: var(--brand-soft); color: var(--brand-text); }
`
        document.head.appendChild(style)
    }
}

function atualizarStatusBancoPequena(texto, cor) {
    const el = document.getElementById('pg-status-banco-4')
    if (el) { el.textContent = texto; if (cor) el.style.color = cor }
}

/** Destaca a placa selecionada (apenas na tela). */
function marcarPlacaSelecionadaPequena(div, selecionada) {
    if (!div) return
    div.classList.toggle('placa-selecionada', !!selecionada)
    document.querySelectorAll('.placa-pequena.placa-selecionada').forEach(el => {
        if (el !== div) el.classList.remove('placa-selecionada')
    })
}

/** Aplica o zoom de visualização na folha da tela (não afeta a impressão). */
function aplicarZoomTelaPequena() {
    const alvo = document.getElementById('container-placas-pequena')
    if (alvo) alvo.style.setProperty('--k-pequena-tela', zoomTelaPequena)
    try { localStorage.setItem('zoomPequena', String(zoomTelaPequena)) } catch {}
    const pct = document.getElementById('pequena-zoom-pct')
    if (pct) {
        // percentual em relação ao tamanho real de impressão (100% = k 0.7068)
        pct.textContent = Math.round((zoomTelaPequena / K_IMPRESSAO_PEQUENA) * 100) + '%'
    }
    const fit = document.getElementById('pequena-zoom-fit')
    if (fit) fit.classList.toggle('is-on', Math.abs(zoomTelaPequena - K_TELA_PEQUENA) < 0.001)
}

function mudarZoomTelaPequena(delta) {
    let i = PASSOS_ZOOM_PEQUENA.findIndex(p => p >= zoomTelaPequena - 0.001)
    if (i === -1) i = PASSOS_ZOOM_PEQUENA.length - 1
    i = Math.max(0, Math.min(PASSOS_ZOOM_PEQUENA.length - 1, i + delta))
    zoomTelaPequena = PASSOS_ZOOM_PEQUENA[i]
    aplicarZoomTelaPequena()
}

function encaixarZoomPequena() {
    zoomTelaPequena = K_TELA_PEQUENA
    aplicarZoomTelaPequena()
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

async function carregarPlacasPequena() {
    carregarEstilos()
    setActive('btn-placas-pequena')
    setConteudo(`
        <div class="pg-wrapper" style="max-width:1200px; margin:0 auto;">

            <div class="dash-glass dash-animate pg-card" style="padding:20px; margin-bottom:20px;">
                <div class="pg-status" id="pg-status-banco-4" style="font-size:11px; color:rgba(255,255,255,0.3); margin-bottom:10px; padding:6px 10px; border-radius:6px; background:rgba(255,255,255,0.03);">Carregando produtos do banco...</div>
                <div class="frc mb16" style="align-items:end;">
                    <div class="fcc">
                        <label class="lb">Código / EAN</label>
                        <input type="text" id="ean-input-pequena" autocomplete="off" autofocus class="inp inp-w140">
                    </div>
                    <div class="fcc">
                        <label class="lb">Preço (R$)</label>
                        <input type="text" id="preco-input-pequena" inputmode="decimal" class="inp inp-w120">
                    </div>
                    <div class="fcc">
                        <label class="lb">Qtd</label>
                        <input type="number" id="qtd-input-pequena" value="1" min="1" class="inp inp-w70">
                    </div>
                    <button id="btn-add-placa-pequena" class="btn-p">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Adicionar
                    </button>
                    <button id="btn-abrir-busca-pequena" class="btn-s">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        Buscar
                    </button>
                    <button id="btn-abrir-import-pequena" class="btn-s">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Importar
                    </button>
                </div>
                <div class="bar pg-actions">
                    <div class="d3-zoom" title="Zoom de visualização (não afeta a impressão)">
                        <button id="pequena-zoom-out" title="Diminuir">−</button>
                        <span id="pequena-zoom-pct">45%</span>
                        <button id="pequena-zoom-in" title="Aumentar">+</button>
                        <button id="pequena-zoom-fit" title="Enquadrar a folha inteira" style="width:auto; padding:0 8px; font-size:11px; font-weight:600;">Enquadrar</button>
                    </div>
                    <button id="btn-print-atual-pequena" class="btn-sm">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Pág. Atual
                    </button>
                    <button id="btn-print-tudo-pequena" class="btn-sm">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Imprimir Tudo
                    </button>

                    <div class="frc6" style="margin-left:8px;">
                        <button id="btn-pag-ant-pequena" class="btn-g">
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                            Ant.
                        </button>
                        <span id="contador-pagina-pequena" class="pg">Página 1 de 1</span>
                        <button id="btn-pag-prox-pequena" class="btn-g">
                            Próx.
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                    </div>

                    <button id="btn-limpar-pequena" class="btn-d mla">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        Limpar
                    </button>
                </div>
            </div>

            <div class="pg-plaques" id="container-placas-pequena" style="padding:10px 0; overflow-x:auto;"></div>

        </div>
    `, 'Placa Pequena')

    aplicarZoomTelaPequena()

    if (plaquesBancoPequena.length === 0) {
        try {
            const res = await fetch(API+'/produtos?page=1&limit=500', { headers: authHeaders() })
            const json = await res.json()
            if (json.data && Array.isArray(json.data)) {
                plaquesBancoPequena = json.data.map(p => ({
                    ...p,
                    preco_venda: parseFloat(p.preco_venda),
                    quantidade_kg_l: parseFloat(p.quantidade_kg_l || 0)
                }))
                atualizarStatusBancoPequena(`✓ ${plaquesBancoPequena.length} produto(s) carregado(s)`)
            } else {
                atualizarStatusBancoPequena('✗ Nenhum produto encontrado no banco', '#ef4444')
            }
        } catch {
            atualizarStatusBancoPequena('✗ Erro ao carregar produtos', '#ef4444')
        }
    } else {
        atualizarStatusBancoPequena(`✓ ${plaquesBancoPequena.length} produto(s) em memória`)
    }

    const carregadas = await coreCarregarPlacas('pequena', p => {
        const prod = plaquesBancoPequena.find(x => String(x.codigo) === String(p.codigo) || (x.ean && p.ean && String(x.ean) === String(p.ean)))
        return {
            ...p,
            preco: Math.round(parseFloat(p.preco) * 100) / 100,
            quantidade_kg_l: parseFloat(p.quantidade_kg_l || 0),
            id_unico: Date.now() + Math.random(),
            marca: p.marca || prod?.marca || '',
            _fs: coreParseConfig(p.config) || undefined
        }
    })
    plaquesSalvasPequena = carregadas.placas
    if (carregadas.origem === 'pendente' || carregadas.origem === 'cache-servidor-vazio') {
        atualizarStatusBancoPequena(`⚠ Exibindo ${plaquesSalvasPequena.length} placa(s) do armazenamento local — o servidor ainda não recebeu o último salvamento. Elas serão reenviadas ao salvar.`, '#facc15')
    } else if (carregadas.origem === 'offline') {
        atualizarStatusBancoPequena(`⚠ Servidor fora do ar — exibindo ${plaquesSalvasPequena.length} placa(s) salvas neste computador.`, '#facc15')
    }

    renderizarPlacasPequena()
    vincularEventosPlacasPequena()
    window._placasAtuais = plaquesSalvasPequena
}

const _ctxLargura = { ctx: null }
function _ctxWidth() {
    if (!_ctxLargura.ctx) _ctxLargura.ctx = document.createElement('canvas').getContext('2d')
    return _ctxLargura.ctx
}

// Ajusta a fonte para o texto caber na largura. Sem isso as linhas 1 e 3
// (que podem ser bem mais longas que a marca) estouravam a placa e o
// overflow:hidden cortava as letras.
function fitFontSize(texto, maxFontSize, availableWidth, fontWeight = '900') {
    if (!texto) return maxFontSize
    const ctx = _ctxWidth()
    ctx.font = `${fontWeight} ${maxFontSize}px 'Arial Black', Arial, sans-serif`
    let width = ctx.measureText(String(texto).toUpperCase()).width
    if (width <= availableWidth) return maxFontSize
    const fator = availableWidth / width
    return Math.max(8, Math.floor(maxFontSize * fator))
}

function calcBrandFontSize(texto) {
    if (!texto) return 100
    const ctx = _ctxWidth()
    const availableWidth = 472
    // Teto: sem isso uma palavra curta (ex.: "DE") vira 314px e o texto
    // transborda a placa inteira. O bloco de texto precisa caber entre o
    // banner (termina em ~202px) e o preco (comeca em ~549px).
    const maxFontSize = 130
    let fontSize = maxFontSize
    ctx.font = `900 ${fontSize}px 'Arial Black', Arial, sans-serif`
    let textWidth = ctx.measureText(texto.toUpperCase()).width
    while (textWidth > availableWidth && fontSize > 8) {
        fontSize -= 2
        ctx.font = `900 ${fontSize}px 'Arial Black', Arial, sans-serif`
        textWidth = ctx.measureText(texto.toUpperCase()).width
    }
    return fontSize
}

const ESCALA_Y_PEQUENA = 1.3
const FONTE_PLACA_PEQUENA = "'Arial Black', Arial, sans-serif"
let _ctxPequena = null

// Cada linha recebe uma caixa com a altura EXATA da sua propria tinta e um
// deslocamento (`position:relative; top`) que faz a tinta comecar no topo da
// caixa. Assim o espaco entre duas linhas e so a margem entre as caixas e
// sobreposicao fica estruturalmente impossivel.
//
// Sem isso, a linha 2 (line-height:0.66) tinha caixa de 0.66*F e tinta de
// ~0.93*F: a tinta transbordava da caixa e invadia as linhas vizinhas.
function metricasLinhaPequena(texto, fontSize, fontWeight, lineHeight) {
    const limpo = String(texto || '').trim()
    if (!limpo) return { altura: 0, deslocamento: 0 }
    if (!_ctxPequena) _ctxPequena = document.createElement('canvas').getContext('2d')
    _ctxPequena.font = `${fontWeight} ${fontSize}px ${FONTE_PLACA_PEQUENA}`
    const m = _ctxPequena.measureText(limpo.toUpperCase())
    const asc = m.actualBoundingBoxAscent || fontSize * 0.72
    const desc = m.actualBoundingBoxDescent || 0
    const fAsc = m.fontBoundingBoxAscent || fontSize
    const fDesc = m.fontBoundingBoxDescent || 0
    const box = fontSize * lineHeight
    // base da linha dentro da caixa (half-leading + ascent da fonte)
    const base = (box - (fAsc + fDesc)) / 2 + fAsc
    const yTopoTinta = base - asc
    // scaleY(1.3) atua sobre o centro da caixa
    const deslocamento = (box / 2) * (ESCALA_Y_PEQUENA - 1) - ESCALA_Y_PEQUENA * yTopoTinta
    return {
        altura: Math.max(1, Math.round((asc + desc) * ESCALA_Y_PEQUENA)),
        deslocamento: Math.round(deslocamento)
    }
}

function montarPlacaPequenaHTML(p) {
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
    // Largura util: a placa tem 561px e as linhas 1/3 sao white-space:nowrap,
    // entao qualquer excesso seria cortado pelo overflow:hidden.
    const LARGURA_PEQUENA = 540
    let linha1FontSize = p._fs?.linha1 || fitFontSize(linha1, Math.max(Math.round(brandFontSize * 0.4), 12), LARGURA_PEQUENA, 'bold')
    let linha3FontSize = p._fs?.linha3 || fitFontSize(linha3, Math.max(Math.round(brandFontSize * 0.4), 12), LARGURA_PEQUENA, 'bold')
    let brandSz = p._fs?.linha2 || fitFontSize(linha2, brandFontSize, 472, '900')

    // Espacamento medido entre as TINTAS. Cada linha tem caixa com a altura
    // exata da sua tinta, entao a margem entre as caixas E o espaco visual.
    const FOLGA_PEQUENA = 6
    const gapLinha3 = Math.max(0, p._fs?.gap3 ?? FOLGA_PEQUENA)
    const LH_L1 = 1.7, LH_L2 = 0.66, LH_L3 = 1.7

    const medirBloco = () => {
        const m1 = metricasLinhaPequena(linha1, linha1FontSize, 'bold', LH_L1)
        const m2 = metricasLinhaPequena(linha2, brandSz, '900', LH_L2)
        const m3 = metricasLinhaPequena(linha3, linha3FontSize, 'bold', LH_L3)
        const entre12 = m1.altura ? FOLGA_PEQUENA : 0
        const entre23 = m2.altura ? gapLinha3 : 0
        return { m1, m2, m3, total: m1.altura + entre12 + m2.altura + entre23 + m3.altura }
    }

    // Encaixe automatico: o bloco precisa caber abaixo do fim do banner SUPER
    // OFERTA (o desenho atual termina ~246px) e acima do inicio do preco
    // (~549px). Reduzimos as 3 fontes na mesma proporcao ate caber.
    const TOPO_BLOCO_PEQUENA = 242 + MARGEM_TOPO_PEQUENA
    const BASE_BLOCO_PEQUENA = 534
    for (let i = 0; i < 5; i++) {
        const b = medirBloco()
        if (TOPO_BLOCO_PEQUENA + b.total <= BASE_BLOCO_PEQUENA) break
        const k = (BASE_BLOCO_PEQUENA - TOPO_BLOCO_PEQUENA) / b.total
        linha1FontSize = Math.max(12, Math.floor(linha1FontSize * k))
        brandSz = Math.max(14, Math.floor(brandSz * k))
        linha3FontSize = Math.max(12, Math.floor(linha3FontSize * k))
    }
    const M = medirBloco()

    // Rodape: a linha "NESTA EMBALAGEM..." tem line-height:0.66 com scaleY(1.3),
    // entao a tinta transbordava da caixa e era cortada pelo fundo da placa.
    // Mesma solucao das linhas do texto: caixa com a altura exata da tinta.
    const mrRodape = metricasLinhaPequena(rodape, 15, 'bold', 0.66)
    // Codigo de barras, no mesmo formato da placa Branca ("Cod.<ean>")
    const textoCod = !semEan ? `Cód.${p.ean}` : ''
    const mrCod = metricasLinhaPequena(textoCod, 13, 'bold', 0.66)
    const MARGEM_RODAPE_PEQUENA = 80
    const GAP_COD_PEQUENA = 6
    const FOOTER_PAD_PEQUENA = 16

    return `
        <div id="placa-pequena-conteudo" class="placa-pequena-conteudo" style="width:561px; height:794px; margin:0; position:relative; box-sizing:border-box; font-family:'Arial Black',Arial,sans-serif; font-weight:900; background-image:url('assets/MODELOS PLACAS 2026.png'); background-size:100% 100%; background-position:center; background-repeat:no-repeat;">
            <div class="pg-texto-wrapper" style="width:100%; display:flex; flex-direction:column; align-items:center; padding-bottom:110px; margin-top:${212 + MARGEM_TOPO_PEQUENA}px;">
                <div class="pg-linha1-wrapper" style="width:100%; text-align:center; margin-top:30px; height:${M.m1.altura}px;">
                    <div class="pg-linha1" data-field="linha1" style="font-size:${linha1FontSize}px; font-weight:bold; line-height:${LH_L1}; text-transform:uppercase; white-space:nowrap; overflow:hidden; position:relative; top:${M.m1.deslocamento}px; transform:scaleY(${ESCALA_Y_PEQUENA});">${linha1}</div>
                </div>

                <div class="pg-linha2-wrapper" style="width:90%; text-align:center; margin-top:${FOLGA_PEQUENA}px; height:${M.m2.altura}px;">
                    <div class="pg-linha2" data-field="linha2" style="font-size:${brandSz}px; font-weight:900; line-height:${LH_L2}; letter-spacing:2px; text-transform:uppercase; white-space:nowrap; width:100%; position:relative; top:${M.m2.deslocamento}px; transform:scaleY(${ESCALA_Y_PEQUENA});">${linha2}</div>
                </div>

                <div class="pg-linha3-wrapper" style="width:100%; text-align:center; margin-top:${gapLinha3}px; height:${M.m3.altura}px;">
                    <div class="pg-linha3" data-field="linha3" style="font-size:${linha3FontSize}px; font-weight:bold; line-height:${LH_L3}; text-transform:uppercase; white-space:nowrap; position:relative; top:${M.m3.deslocamento}px; transform:scaleY(${ESCALA_Y_PEQUENA});">${linha3}</div>
                </div>
            </div>

            <div class="pg-rodape-wrapper" style="width:100%; display:flex; flex-direction:column; align-items:center; gap:1mm; position:absolute; bottom:0; left:0; padding-bottom:${FOOTER_PAD_PEQUENA}px;">
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
                <div class="pg-rodape-texto-wrapper" style="width:100%; text-align:center; margin-top:${MARGEM_RODAPE_PEQUENA}px; height:${mrRodape.altura}px;">
                    <div class="pg-rodape-texto" data-field="rodape" style="font-size:15px; font-weight:bold; line-height:0.66; position:relative; top:${mrRodape.deslocamento}px; transform:scaleY(${ESCALA_Y_PEQUENA});">${rodape}</div>
                </div>
                ${textoCod ? `
                <div class="pg-cod-wrapper" style="width:100%; text-align:center; margin-top:${GAP_COD_PEQUENA}px; height:${mrCod.altura}px;">
                    <div class="pg-cod-texto" data-field="ean" style="font-size:13px; font-weight:bold; line-height:0.66; letter-spacing:0.5px; position:relative; top:${mrCod.deslocamento}px; transform:scaleY(${ESCALA_Y_PEQUENA});">${textoCod}</div>
                </div>` : ''}
                ${uni === 'KG' ? `
                <span class="pg-toggle-fracao" data-fracao="${fracionar ? '1' : '0'}" style="position:absolute;bottom:4px;right:6px;cursor:pointer;font-size:10px;color:rgba(0,0,0,0.25);background:rgba(0,0,0,0.04);border-radius:4px;padding:2px 5px;letter-spacing:0.3px;user-select:none;white-space:nowrap;">
                    ${fracionar ? 'KG' : '100g'}
                </span>` : ''}
            </div>
        </div>
    `
}

/**
 * Salva a predefinição de texto (tamanhos/posições) da placa selecionada.
 * Chamado pelo menu de contexto (junto de Duplicar e Excluir).
 */
async function onSalvarPredefPequena() {
    const p = placaClicadaPequena
    if (!p) { toast('Selecione uma placa primeiro', 'aviso'); return }
    if (!p._fs || !Object.keys(p._fs).length) {
        toast('Esta placa não tem ajustes para salvar', 'info')
        return
    }
    await salvarPlacasPequena()
    toast('Predefinição da placa salva', 'ok')
}

/** Usa a predefinição da placa como padrão das novas placas do modelo. */
async function onSalvarPredefPadraoPequena() {
    const p = placaClicadaPequena
    if (!p) { toast('Selecione uma placa primeiro', 'aviso'); return }
    if (!p._fs || !Object.keys(p._fs).length) {
        toast('Esta placa não tem ajustes para salvar', 'info')
        return
    }
    coreSalvarPresetPadrao('pequena', JSON.parse(JSON.stringify(p._fs)))
    toast('As novas placas já vão nascer com esta predefinição', 'ok')
}

function renderizarPlacasPequena() {
    const container = document.getElementById('container-placas-pequena')
    if (!container) return
    container.innerHTML = ''

    const totalPaginas = Math.ceil(plaquesSalvasPequena.length / plaquesPorPaginaPequena) || 1
    if (paginaPlacasPequena >= totalPaginas) paginaPlacasPequena = totalPaginas - 1

    const contadorEl = document.getElementById('contador-pagina-pequena')
    if (contadorEl) contadorEl.innerText = `Página ${paginaPlacasPequena + 1} de ${totalPaginas}`

    const lista = plaquesSalvasPequena.slice(
        paginaPlacasPequena * plaquesPorPaginaPequena,
        (paginaPlacasPequena + 1) * plaquesPorPaginaPequena
    )
    if (!lista.length) {
        container.innerHTML = `
            <div class="es">
                <svg width="40" height="40" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:12px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                <p class="es-p">Nenhuma placa pequena adicionada</p>
                <p class="es-sub">Digite um código e preço acima para começar</p>
            </div>`
        return
    }

    const folha = document.createElement('div')
    folha.className = 'folha-pequena-tela'

    lista.forEach(p => {
        const div = document.createElement('div')
        div.className = 'placa-pequena'
        div.innerHTML = montarPlacaPequenaHTML(p)

        // clique na placa (fora dos textos) seleciona a placa do menu de contexto
        div.addEventListener('click', (e) => {
            if (e.target.closest('[data-field]')) return
            placaClicadaPequena = p
            placaClicadaElPequena = div
            marcarPlacaSelecionadaPequena(div, true)
        })

        div.querySelectorAll('[data-field]').forEach(el => {
            el.style.cursor = 'pointer'
            const field = el.getAttribute('data-field')

            let clickTimer = null
            el.onclick = (e) => {
                if (field === 'preco' || field === 'ean') return
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
                                salvarERenderizarPequena()
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
                            salvarERenderizarPequena()
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
                    await salvarERenderizarPequena()
                    return
                }

                const input = document.createElement('input')
                input.value = field === 'ean' ? el.innerText.replace(/^Cód\.?\s*/i, '').trim() : el.innerText.trim()
                // Guarda o que a placa EXIBE no rodape antes de trocar o elemento pelo
                // input (o el sai do DOM): usado para, ao remover o codigo (EAN), manter
                // unidade e linha "NESTA EMBALAGEM..." iguais — mudar SOMENTE o codigo.
                const rodapePai = el.closest('.pg-rodape-wrapper')
                const txtUniAtual = (rodapePai && rodapePai.querySelector('.pg-preco-unidade')
                    ? rodapePai.querySelector('.pg-preco-unidade').textContent : '').trim()
                const txtRodapeAtual = (rodapePai && rodapePai.querySelector('.pg-rodape-texto')
                    ? rodapePai.querySelector('.pg-rodape-texto').textContent : '').trim()
                input.style.cssText = 'width:90%; font-size:' + el.style.fontSize + '; font-weight:bold; text-align:center; border:2px solid #b51515; border-radius:6px; background:#fff; color:#000; outline:none; padding:2px 6px; font-family:\'Segoe UI\',sans-serif;'
                el.replaceWith(input)
                input.focus(); input.select()

                const fechar = async () => {
                    const v = input.value.trim()
                    if (field === 'ean') {
                        const novoEan = v.replace(/^Cód\.?\s*/i, '')
                        // Remover o codigo NAO pode mudar o resto da placa: congela a
                        // unidade e o rodape exibidos antes de apagar o EAN (senao a
                        // placa viraria KG e a linha "NESTA EMBALAGEM..." trocaria).
                        if (!novoEan && p.ean && String(p.ean).trim() !== '') {
                            if (!p._fs) p._fs = {}
                            const uniReal = /100G|A CADA/i.test(txtUniAtual) ? 'KG' : txtUniAtual
                            if (!p._fs.unidade && uniReal) p._fs.unidade = uniReal
                            if (!p._fs.rodape && txtRodapeAtual) p._fs.rodape = txtRodapeAtual
                        }
                        p.ean = novoEan
                        await salvarERenderizarPequena()
                        return
                    }
                    if (!v) { renderizarPlacasPequena(); return }
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
                    await salvarERenderizarPequena()
                }
                input.onkeydown = (ev) => { if (ev.key === 'Enter') fechar(); if (ev.key === 'Escape') renderizarPlacasPequena() }
                input.onblur = fechar
            }
        })

        div.oncontextmenu = (e) => {
            e.preventDefault()
            placaClicadaPequena = p
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
                salvarERenderizarPequena()
            }
        }

        folha.appendChild(div)
    })

    container.appendChild(folha)
}

async function onExcluirPlacaPequena() {
    coreExcluirPlaca({ salvas: plaquesSalvasPequena, clicada: placaClicadaPequena })
    await salvarERenderizarPequena()
}

async function onDuplicarPlacaPequena() {
    coreDuplicarPlaca({ salvas: plaquesSalvasPequena, clicada: placaClicadaPequena })
    await salvarERenderizarPequena()
}

async function salvarPlacasPequena() {
    if (_salvandoPequena) return
    _salvandoPequena = true
    try {
        const placas = plaquesSalvasPequena.map(p => ({
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
        coreCacheSalvar('pequena', placas)
        const res = await fetch(API+'/registros-placas', {
            method: 'POST',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'pequena', placas })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status))
        coreCachePendente('pequena', false)
        if (data.logIds && data.logIds.length) {
            window._ultimasPlacasGeradas.push(...data.logIds)
        }
        // se havia aviso de copia local/offline, volta ao normal apos sincronizar
        const stEl = document.getElementById('pg-status-banco-4')
        if (stEl && /armazenamento local|Servidor fora do ar/i.test(stEl.innerText)) {
            atualizarStatusBancoPequena(`✓ ${plaquesSalvasPequena.length} placa(s) salva(s) no servidor`)
        }
    } catch (e) {
        console.error('Erro ao salvar placas pequenas:', e)
        coreCachePendente('pequena', true)
        alert('Erro ao salvar no servidor: ' + e.message +
            '\n\nSuas placas continuam salvas neste computador e serão reenviadas quando o servidor voltar.')
    } finally {
        _salvandoPequena = false
    }
}

async function salvarERenderizarPequena() {
    await salvarPlacasPequena()
    renderizarPlacasPequena()
}

async function mudarPaginaPlacasPequena(v) {
    await salvarPlacasPequena()
    paginaPlacasPequena = coreMudarPagina({ salvas: plaquesSalvasPequena, porPagina: plaquesPorPaginaPequena, pagina: paginaPlacasPequena }, v)
    renderizarPlacasPequena()
}

function imprimirTudoPequena() {
    if (!plaquesSalvasPequena.length) {
        alert('Nenhuma placa para imprimir.')
        return
    }
    
    const container = document.getElementById('container-placas-pequena')
    const paginaOriginal = paginaPlacasPequena
    container.innerHTML = ''
    
    for (let i = 0; i < plaquesSalvasPequena.length; i += plaquesPorPaginaPequena) {
        const folha = document.createElement('div')
        folha.className = 'folha-pequena'
        const placasNaFolha = plaquesSalvasPequena.slice(i, i + plaquesPorPaginaPequena)
        
        if (!placasNaFolha.length) continue
        
        placasNaFolha.forEach(p => {
            const div = document.createElement('div')
            div.className = 'placa-pequena'
            div.innerHTML = montarPlacaPequenaHTML(p)
            folha.appendChild(div)
        })
        container.appendChild(folha)
    }
    
    setTimeout(() => {
        printFolha(container.innerHTML, CSS_FOLHA_PEQUENA)
        setTimeout(() => {
            paginaPlacasPequena = paginaOriginal
            renderizarPlacasPequena()
            registrarImpressaoPlacas()
        }, 1000)
    }, 500)
}

async function adicionarPlacaPequena() {
    const codigo = document.getElementById('ean-input-pequena').value.trim()
    const precoRaw = document.getElementById('preco-input-pequena').value
    const preco = Math.round(parseFloat(precoRaw.replace(',', '.')) * 100) / 100
    const quantidade = parseInt(document.getElementById('qtd-input-pequena').value) || 1
    if (!codigo || isNaN(preco)) return

    let prod = plaquesBancoPequena.find(p => String(p.ean) === codigo) || plaquesBancoPequena.find(p => String(p.codigo) === codigo)

    if (!prod) {
        try {
            const url = API+'/produtos/busca/ean/'+encodeURIComponent(codigo)
            const res = await fetch(url, { headers: authHeaders() })
            if (res.ok) {
                const p = await res.json()
                plaquesBancoPequena.push(p)
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
                plaquesBancoPequena.push(p)
                prod = p
            }
        } catch {}
    }

    if (prod) {
        const qtdKgL = parseFloat(prod.quantidade_kg_l)
        const precoUn = qtdKgL > 0 ? (preco / qtdKgL).toFixed(2).replace('.', ',') : prod.preco_venda
        for (let i = 0; i < quantidade; i++) {
            plaquesSalvasPequena.push(coreAplicarPresetPadrao({ ...prod, preco, preco_info: precoUn, id_unico: Date.now() + Math.random() }, 'pequena'))
        }
        await salvarERenderizarPequena()
        document.getElementById('ean-input-pequena').value = ''
        document.getElementById('preco-input-pequena').value = ''
        document.getElementById('qtd-input-pequena').value = 1
        document.getElementById('ean-input-pequena').focus()
    } else {
        alert('Produto não encontrado. Verifique o código e tente novamente.')
    }
}

function abrirBuscaNomePequena() {
    coreAbrirBuscaNome('-pequena')
}

function abrirImportacaoPequena() {
    const modal = document.getElementById('modal-import-pequena')
    if (modal) modal.style.display = 'block'
    const input = document.getElementById('import-texto-pequena')
    if (input) { input.value = ''; input.focus() }
}

async function onBuscaNomeKeydownPequena(e) {
    if (e.key !== 'Enter') return
    const termo = e.target.value.trim()
    if (!termo || termo.length < 2) return

    const tbody = document.querySelector('#tabela-busca-pequena tbody')
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
                document.getElementById('ean-input-pequena').value = resultados[i].codigo
                document.getElementById('preco-input-pequena').value = resultados[i].preco_venda != null ? resultados[i].preco_venda : ''
                fecharModaisPequena()
                document.getElementById('preco-input-pequena').focus()
            }
        })
    } catch {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:10px;color:#ef4444;">Erro na busca</td></tr>'
    }
}

function extrairKgLtPequena(desc) {
    return coreExtrairKgLt(desc)
}

async function processarImportacaoPequena() {
    const texto = document.getElementById('import-texto-pequena').value.trim()
    if (!texto) return
    const qtdGlobal = parseInt(document.getElementById('qtd-input-pequena')?.value) || 1
    const logErros = document.getElementById('log-erros-pequena')
    const listaErros = document.getElementById('lista-erros-pequena')
    listaErros.innerHTML = ''
    logErros.style.display = 'none'
    let contador = 0

    for (const linha of texto.split(/\r?\n/)) {
        const colunas = linha.split(/\t| {2,}/)
        if (colunas.length >= 2) {
            const descProcurada = colunas[0].trim().toUpperCase()
            const precoNovo = parseFloat(colunas[1].replace('R$', '').replace(/\s/g, '').replace(',', '.').trim())
            if (!isNaN(precoNovo)) {
                let prod = plaquesBancoPequena.find(p => p.descricao?.toUpperCase() === descProcurada) ||
                           plaquesBancoPequena.find(p => p.descricao?.toUpperCase().includes(descProcurada))
                if (!prod) {
                    try {
                        const res = await fetch(API+'/produtos/busca?q='+encodeURIComponent(descProcurada), { headers: authHeaders() })
                        if (res.ok) {
                            const lista = await res.json()
                            if (lista.length > 0) {
                                const res2 = await fetch(API+'/produtos/'+encodeURIComponent(lista[0].codigo), { headers: authHeaders() })
                                if (res2.ok) {
                                    const p = await res2.json()
                                    plaquesBancoPequena.push(p)
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
                        plaquesSalvasPequena.push(coreAplicarPresetPadrao({ ...prod, preco: precoNovo, preco_info: precoUn, id_unico: Date.now() + Math.random() }, 'pequena'))
                    }
                    contador++
                } else {
                    const qtdKgL = extrairKgLtPequena(descProcurada)
                    const precoUn = qtdKgL > 0 ? (precoNovo / qtdKgL).toFixed(2).replace('.', ',') : precoNovo.toFixed(2).replace('.', ',')
                    for (let i = 0; i < qtdGlobal; i++) {
                        plaquesSalvasPequena.push(coreAplicarPresetPadrao({ descricao: colunas[0].trim(), codigo: '', ean: '', preco: precoNovo, preco_info: precoUn, quantidade_kg_l: qtdKgL, id_unico: Date.now() + Math.random() }, 'pequena'))
                    }
                    contador++
                }
            }
        }
    }

    fecharModaisPequena()
    alert(contador + ' placa(s) gerada(s).')
    await salvarERenderizarPequena()
    document.getElementById('import-texto-pequena').value = ''
}


function fecharModaisPequena() {
    document.getElementById('modal-busca-pequena').style.display = 'none'
    document.getElementById('modal-import-pequena').style.display = 'none'
    if (document.getElementById('log-erros-pequena')) document.getElementById('log-erros-pequena').style.display = 'none'
}

function vincularEventosPlacasPequena() {
    const eanInput   = document.getElementById('ean-input-pequena')
    const precoInput = document.getElementById('preco-input-pequena')
    const qtdInput   = document.getElementById('qtd-input-pequena')
    if (!eanInput) return

    document.getElementById('btn-add-placa-pequena').onclick    = adicionarPlacaPequena
    document.getElementById('btn-abrir-busca-pequena').onclick  = abrirBuscaNomePequena
    document.getElementById('btn-abrir-import-pequena').onclick = abrirImportacaoPequena

    // Zoom de visualização (só na tela)
    document.getElementById('pequena-zoom-in')?.addEventListener('click', () => mudarZoomTelaPequena(1))
    document.getElementById('pequena-zoom-out')?.addEventListener('click', () => mudarZoomTelaPequena(-1))
    document.getElementById('pequena-zoom-fit')?.addEventListener('click', encaixarZoomPequena)
    document.getElementById('btn-print-atual-pequena').onclick  = () => {
        const folha = document.createElement('div')
        folha.className = 'folha-pequena'
        const len = plaquesSalvasPequena.length
        const start = paginaPlacasPequena * plaquesPorPaginaPequena
        const page = plaquesSalvasPequena.slice(start, Math.min(start + plaquesPorPaginaPequena, len))
        page.forEach(p => {
            const div = document.createElement('div')
            div.className = 'placa-pequena'
            div.innerHTML = montarPlacaPequenaHTML(p)
            folha.appendChild(div)
        })
        printFolha(folha.outerHTML, CSS_FOLHA_PEQUENA)
        setTimeout(registrarImpressaoPlacas, 1000)
    }
    document.getElementById('btn-print-tudo-pequena').onclick   = imprimirTudoPequena
    document.getElementById('btn-pag-ant-pequena').onclick      = () => mudarPaginaPlacasPequena(-1)
    document.getElementById('btn-pag-prox-pequena').onclick     = () => mudarPaginaPlacasPequena(1)
    document.getElementById('btn-limpar-pequena').onclick       = () => {
        if (confirm('Limpar todas as placas pequenas?')) { plaquesSalvasPequena = []; salvarERenderizarPequena() }
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
        if (e.key === 'Enter') { e.preventDefault(); adicionarPlacaPequena() }
    })

    const btnProcessar = document.getElementById('btn-processar-import-pequena')
    if (btnProcessar) btnProcessar.onclick = processarImportacaoPequena
    const inputBusca = document.getElementById('input-busca-nome-pequena')
    if (inputBusca) inputBusca.addEventListener('keydown', onBuscaNomeKeydownPequena)
    const fecharBusca = document.getElementById('fechar-busca-pequena')
    if (fecharBusca) fecharBusca.onclick = fecharModaisPequena
    const fecharImport = document.getElementById('fechar-import-pequena')
    if (fecharImport) fecharImport.onclick = fecharModaisPequena
}
