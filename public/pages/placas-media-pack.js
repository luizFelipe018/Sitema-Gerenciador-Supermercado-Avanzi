/* ═══════════════════════════════════════════════════════════════
   PLACAS MEDIA PACK — modelo Média "SUPER OFERTA" + fardo/pack
   Linha 1: descrição · Linha 2: marca (bem media)
   Linha 3: pacote (ex.: "CX 12UN ECONOMICO") — define a quantidade
   Rodapé: preço unitário = preço do fardo ÷ quantidade do pack
   Segunda linha: R$ do LT/KG na mesma embalagem
   ═══════════════════════════════════════════════════════════════ */

var plaquesBancoMP = []
var plaquesSalvasMP = []
var paginaPlacasMP = 0
const plaquesPorPaginaMP = 2
var placaClicadaMP = null
var placaClicadaElMP = null
var _salvandoMP = false

const CSS_FOLHA_MP = `
.folha-media-pack { position:relative; display:flex; flex-direction:row; width:297mm; height:210mm; margin:0 auto 16px; background:#fff !important; box-sizing:border-box; box-shadow:0 2px 12px rgba(0,0,0,0.15); gap:0; }
.placa-media-pack { width:50%; height:100%; background:transparent !important; box-sizing:border-box; display:grid; place-items:end center; border:none; }
.folha-media-pack::after { content:''; position:absolute; left:calc(50% - 0.5px); top:0; width:1px; height:100%; background:#000; z-index:5; pointer-events:none; }
.placa-selecionada { outline:none !important; box-shadow:none !important; }
@media print {
  @page { size: A4 landscape; margin: 0; }
  .folha-media-pack {
    width: 297mm; height: 210mm;
    page-break-after: always; break-after: page;
    overflow: hidden; box-shadow: none; margin: 0;
  }
  .folha-media-pack:last-child { page-break-after: auto; break-after: auto; }
  .placa-media-pack { padding: 0 !important; border: none; grid-template-rows: 100%; overflow: hidden; }
  .placa-media-pack .placa-media-pack-conteudo {
    margin: 0 auto !important;
    transform: none !important; outline: none !important;
    width: 561px !important; height: 794px !important;
  }
  .pg-toggle-fracao { display: none !important; }
}

`

const MARGEM_TOPO_MP = 40

function carregarEstilosMP() {
    if (!document.getElementById('placas-main-style')) {
        const link = document.createElement('link')
        link.id = 'placas-main-style'
        link.rel = 'stylesheet'
        link.href = 'style.css'
        document.head.appendChild(link)
    }
    if (!document.getElementById('placas-media-pack-guide')) {
        const style = document.createElement('style')
        style.id = 'placas-media-pack-guide'
        style.textContent = '#container-placas-mp { display:flex; flex-wrap:wrap; gap:12px; } .placa-media-pack-conteudo { outline:1px dashed rgba(255,0,0,0.25); outline-offset:-1px; transform:scale(1); transform-origin:top center; } .placa-media-pack-conteudo * { color:#000 !important; }'
        document.head.appendChild(style)
    }
    if (!document.getElementById('modal-busca-mp')) injetarModaisMP()
}

function injetarModaisMP() {
    const wrap = document.createElement('div')
    wrap.innerHTML = `
        <div id="modal-busca-mp" class="modal-overlay">
            <div class="modal-box" style="width:600px;">
                <div class="modal-header">
                    <h3 class="font-semibold text-white text-lg">Buscar Produto</h3>
                    <button id="fechar-busca-mp" class="w-9 h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <div class="modal-body" style="padding:20px 24px;">
                    <input type="text" id="input-busca-nome-mp" placeholder="Digite o nome e pressione ENTER" class="input-modern mb-4">
                    <div style="max-height:300px; overflow-y:auto;">
                        <table id="tabela-busca-mp" class="table-modern">
                            <thead><tr><th>Código</th><th>Descrição</th><th style="text-align:right;">Preço</th></tr></thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div id="modal-import-mp" class="modal-overlay">
            <div class="modal-box" style="width:560px;">
                <div class="modal-header">
                    <h3 class="font-semibold text-white text-lg">Importação Rápida (Media Pack)</h3>
                    <button id="fechar-import-mp" class="w-9 h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <div class="modal-body">
                    <p class="text-white/40 text-xs mb-3">Cole as colunas do Excel (Descrição [TAB] Preço <b>do fardo</b>, ex: 37,08):</p>
                    <textarea id="import-texto-mp" rows="7" placeholder="Ex: CERVEJA LT 350ML SKOL CX 12UN&#9;37,08" class="input-modern font-mono text-sm" style="resize:none;"></textarea>
                    <div id="log-erros-mp" class="mt-4 p-4 rounded-xl text-sm" style="background:rgba(248,113,113,0.1); color:#f87171; display:none;">
                        <strong>⚠️ Itens não encontrados:</strong>
                        <ul id="lista-erros-mp" class="mt-2 pl-4"></ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="btn-processar-import-mp" class="btn-3d w-full" style="background: linear-gradient(135deg, #16a34a, #15803d);">Gerar Placas</button>
                </div>
            </div>
        </div>`
    document.body.appendChild(wrap)
}

function atualizarStatusBancoMP(texto, cor) {
    const el = document.getElementById('mp-status-banco')
    if (el) { el.textContent = texto; if (cor) el.style.color = cor }
}

function quebrarNomeMP(descricao) {
    const palavras = String(descricao || '').trim().split(/\s+/)
    if (palavras.length === 1) return { linha1: '', linha2: palavras[0], linha3: '' }
    if (palavras.length === 2) return { linha1: palavras[0], linha2: palavras[1], linha3: '' }
    return {
        linha1: palavras[0],
        linha2: palavras[1],
        linha3: palavras.slice(2).join(' ')
    }
}

function quebrarPorMarcaMP(descricao, marca) {
    if (!marca || !marca.trim()) return quebrarNomeMP(descricao)
    const idx = String(descricao).toUpperCase().indexOf(marca.trim().toUpperCase())
    if (idx === -1) return quebrarNomeMP(descricao)
    return {
        linha1: String(descricao).slice(0, idx).trim(),
        linha2: String(descricao).slice(idx, idx + marca.trim().length),
        linha3: String(descricao).slice(idx + marca.trim().length).trim()
    }
}

const fmtValor = (v) => (isNaN(v) ? '0,00' : Number(v).toFixed(2).replace('.', ','))

// Extrai a quantidade de unidades do pack a partir da linha 3 (ex.: "CX 12UN ECONOMICO")
function extrairQtdPack(linha3) {
    const t = String(linha3 || '').toUpperCase()
    const m = t.match(/(\d{1,3})\s*(UN|UND|UNID|UNIDADES|KG|LT|L|GR|G)\b/)
    return m ? parseInt(m[1], 10) : 0
}

function parsePrecoEntrada(s) {
    const t = String(s || '').trim()
    if (!t) return NaN
    if (t.includes(',')) {
        return Math.round(parseFloat(t.replace(/\./g, '').replace(',', '.')) * 100) / 100
    }
    return Math.round(parseFloat(t.replace(/,/, '.')) * 100) / 100
}
const parsePrecoBR = parsePrecoEntrada

/* ═══════════════════════════════════════════════════════════════
   CARREGAR PÁGINA
   ═══════════════════════════════════════════════════════════════ */
async function carregarPlacasMediaPack() {
    carregarEstilosMP()
    setActive('btn-placas-media-pack')
    setConteudo(`
        <div class="mp-wrapper" style="max-width:1200px; margin:0 auto;">
            <div class="dash-glass dash-animate mp-card" style="padding:20px; margin-bottom:20px;">
                <div class="mp-status" id="mp-status-banco" style="font-size:11px; color:rgba(255,255,255,0.3); margin-bottom:10px; padding:6px 10px; border-radius:6px; background:rgba(255,255,255,0.03);">Carregando produtos do banco...</div>
                <div class="frc mb16" style="align-items:end;">
                    <div class="fcc">
                        <label class="lb">Código / EAN</label>
                        <input type="text" id="ean-input-mp" autocomplete="off" autofocus class="inp inp-w140">
                    </div>
                    <div class="fcc">
                        <label class="lb">Preço fardo (R$)</label>
                        <input type="text" id="preco-input-mp" inputmode="decimal" class="inp inp-w140" placeholder="Ex: 37,08">
                    </div>
                    <div class="fcc">
                        <label class="lb">Qtd fardo</label>
                        <input type="number" id="qtd-pack-input-mp" value="12" min="1" class="inp inp-w70">
                    </div>
                    <div class="fcc">
                        <label class="lb">Qtd placas</label>
                        <input type="number" id="qtd-input-mp" value="1" min="1" class="inp inp-w70">
                    </div>
                    <button id="btn-add-placa-mp" class="btn-p">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Adicionar
                    </button>
                    <button id="btn-abrir-busca-mp" class="btn-s">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        Buscar
                    </button>
                    <button id="btn-abrir-import-mp" class="btn-s">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Importar
                    </button>
                </div>
                <p style="font-size:11px; color:rgba(255,255,255,0.3); margin:8px 0 0; border-top:1px solid rgba(255,255,255,0.06); padding-top:8px;">Media Pack = placa média + preço do fardo + preço por unidade + valor do fardo + valor do LT/KG no fardo.</p>
                <div class="bar pg-actions" style="margin-top:12px;">
                    <button id="btn-print-atual-mp" class="btn-sm">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Pág. Atual
                    </button>
                    <button id="btn-print-tudo-mp" class="btn-sm">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Imprimir Tudo
                    </button>

                    <div class="frc6" style="margin-left:8px;">
                        <button id="btn-pag-ant-mp" class="btn-g">
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                            Ant.
                        </button>
                        <span id="contador-pagina-mp" class="pg">Página 1 de 1</span>
                        <button id="btn-pag-prox-mp" class="btn-g">
                            Próx.
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                    </div>

                    <button id="btn-limpar-mp" class="btn-d mla">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        Limpar
                    </button>
                </div>
            </div>
            <div class="mp-plaques" id="container-placas-mp" style="padding:10px 0;"></div>
        </div>
    `, 'Media Pack')

    if (plaquesBancoMP.length === 0) {
        try {
            const res = await fetch(API + '/produtos?page=1&limit=500', { headers: authHeaders() })
            const json = await res.json()
            if (json.data && Array.isArray(json.data)) {
                plaquesBancoMP = json.data.map(p => ({ ...p, preco_venda: parseFloat(p.preco_venda), quantidade_kg_l: parseFloat(p.quantidade_kg_l || 0) }))
                atualizarStatusBancoMP(`✓ ${plaquesBancoMP.length} produto(s) carregado(s)`)
            } else {
                atualizarStatusBancoMP('✗ Nenhum produto encontrado no banco', '#ef4444')
            }
        } catch {
            atualizarStatusBancoMP('✗ Erro ao carregar produtos', '#ef4444')
        }
    } else {
        atualizarStatusBancoMP(`✓ ${plaquesBancoMP.length} produto(s) em memória`)
    }

    const carregadas = await coreCarregarPlacas('media-pack', p => {
        const prod = plaquesBancoMP.find(x => String(x.codigo) === String(p.codigo) || (x.ean && p.ean && String(x.ean) === String(p.ean)))
        const _fs = coreParseConfig(p.config) || {}
        const qtdPack = parseInt(p.qtd_pack != null ? p.qtd_pack : (_fs.qtd_pack != null ? _fs.qtd_pack : 12), 10) || 12
        const fardo = parseFloat(p.fardo_preco != null ? p.fardo_preco : (_fs.fardo_preco != null ? _fs.fardo_preco : (parseFloat(p.preco || 0) * qtdPack)))
        return {
            ...p,
            preco: Math.round(parseFloat(p.preco) * 100) / 100,
            quantidade_kg_l: parseFloat(p.quantidade_kg_l || 0),
            id_unico: Date.now() + Math.random(),
            marca: p.marca || prod?.marca || '',
            qtd_pack: qtdPack,
            fardo_preco: Math.round(fardo * 100) / 100,
            _fs
        }
    })
    plaquesSalvasMP = carregadas.placas
    if (carregadas.origem === 'pendente' || carregadas.origem === 'cache-servidor-vazio') {
        atualizarStatusBancoMP(`⚠ Exibindo ${plaquesSalvasMP.length} placa(s) do armazenamento local — o servidor ainda não recebeu o último salvamento. Elas serão reenviadas ao salvar.`, '#facc15')
    } else if (carregadas.origem === 'offline') {
        atualizarStatusBancoMP(`⚠ Servidor fora do ar — exibindo ${plaquesSalvasMP.length} placa(s) salvas neste computador.`, '#facc15')
    }

    renderizarPlacasMediaPack()
    vincularEventosPlacasMediaPack()
    window._placasAtuais = plaquesSalvasMP
}

function calcBrandFontSizeMP(texto) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const availableWidth = 472
    let fontSize = 400
    ctx.font = `900 ${fontSize}px 'Arial Black', Arial, sans-serif`
    let textWidth = ctx.measureText(String(texto || '').toUpperCase()).width
    while (textWidth > availableWidth && fontSize > 8) {
        fontSize -= 2
        ctx.font = `900 ${fontSize}px 'Arial Black', Arial, sans-serif`
        textWidth = ctx.measureText(String(texto || '').toUpperCase()).width
    }
    return fontSize
}

/* ═══════════════════════════════════════════════════════════════
   MONTAR HTML DA PLACA
   ═══════════════════════════════════════════════════════════════ */
function montarPlacaMediaPackHTML(p) {
    const descricaoLimpa = (p.descricao || '').replace(/\s+(KG|LT|LITRO|LITROS|KILO|KILOS|QUILO|QUILOS)$/i, '')
    const partes = quebrarPorMarcaMP(descricaoLimpa, p.marca)

    const qtdPack = parseInt(p.qtd_pack, 10) || extrairQtdPack(partes.linha3) || 12
    const precoUnit = p.preco || 0
    const fardoPreco = p.fardo_preco != null && !isNaN(p.fardo_preco)
        ? p.fardo_preco
        : Math.round(precoUnit * qtdPack * 100) / 100

    // Unidade: UN/KG/LT detectada da descrição do pack/produto
    const desc = (p.descricao || '').toUpperCase()
    const semEan = !p.ean || String(p.ean).trim() === ''
    let uni = p._fs?.unidade || (semEan ? 'KG' : 'UN')
    if (/\b(LT|LITRO|ML|CM3|CM³)\b/.test(desc)) uni = 'LT'
    else if (/\b(KG|GR|G|QUILO|KILO)\b/.test(desc)) uni = 'KG'

    const qtdKgL = parseFloat(p.quantidade_kg_l) || 0
    const uniValorQtd = qtdKgL > 0 ? qtdKgL : 1
    const valorEmbalagem = (fardoPreco / (qtdPack * uniValorQtd)).toFixed(2).replace('.', ',')
    const precoUn = fardoPreco / qtdPack

    const precoTrunc = Math.round(precoUn * 100) / 100
    const precoFmt = precoTrunc.toFixed(2).replace('.', ',')
    const [reaisExib, centsExib] = precoFmt.split(',')

    const brandFontSize = calcBrandFontSizeMP(partes.linha2)
    const linha1FontSize = p._fs?.linha1 || Math.max(Math.round(brandFontSize * 0.4), 12)
    const linha3FontSize = p._fs?.linha3 || Math.max(Math.round(brandFontSize * 0.4), 12)
    const brandSz = p._fs?.linha2 || brandFontSize
    const gapLinha3 = p._fs?.gap3 ?? Math.max(Math.round(linha3FontSize * 0.6), 4)
    const precoFontSize = p._fs?.preco || (reaisExib.length <= 2 ? 140 : 130)
    const uniDisplay = /100G/i.test(p._fs?.unidade || '') ? '100G' : uni

    return `
        <div id="placa-media-pack-conteudo" class="placa-media-pack-conteudo" style="width:561px; height:794px; margin:0 auto 88px; position:relative; box-sizing:border-box; font-family:'Arial Black',Arial,sans-serif; font-weight:900; background-image:url('assets/MODELOS PLACAS 2026.png'); background-size:100% 100%; background-position:center; background-repeat:no-repeat;">
            <div class="mp-texto-wrapper" style="width:100%; display:flex; flex-direction:column; align-items:center; gap:2mm; line-height:1.7; padding-bottom:170px; margin-top:${200 + MARGEM_TOPO_MP}px;">
                <div class="mp-linha1-wrapper" style="width:100%; text-align:center; margin-top:30px;">
                    <div class="mp-linha1" data-field="linha1" style="font-size:${linha1FontSize}px; font-weight:bold; text-transform:uppercase; white-space:nowrap; overflow:hidden; transform:scaleY(1.3);">${partes.linha1}</div>
                </div>
                <div class="mp-linha2-wrapper" style="width:90%; text-align:center; display:flex; align-items:center; justify-content:center;">
                    <div class="mp-linha2" data-field="linha2" style="font-size:${brandSz}px; font-weight:900; text-transform:uppercase; line-height:0.66; letter-spacing:2px; white-space:nowrap; width:100%; transform:scaleY(1.3);">${partes.linha2}</div>
                </div>
                <div class="mp-linha3-wrapper" style="width:100%; text-align:center; margin-top:${gapLinha3}px;">
                    <div class="mp-linha3" data-field="linha3" style="font-size:${linha3FontSize}px; font-weight:bold; text-transform:uppercase; transform:scaleY(1.3);">${partes.linha3 || ''}</div>
                </div>
                <div class="mp-subtitulo" style="margin-top:4px; font-size:14px; font-weight:bold; text-transform:uppercase; letter-spacing:0.4px; line-height:1.15; transform:scaleY(1.2); white-space:nowrap;">O valor que sai a unidade comprando o fardo é de:</div>
            </div>

            <div class="mp-rodape-wrapper" style="width:100%; display:flex; flex-direction:column; align-items:center; gap:1mm; position:absolute; bottom:0; left:0;">
                <div class="mp-preco-wrapper" style="width:100%; display:flex; align-items:flex-end; justify-content:center; transform:scaleY(1.5); margin-top:120px;">
                    <span class="mp-preco-simbolo" style="font-size:20px; font-weight:bold; margin-right:2px; margin-bottom:20px; line-height:1;">R$</span>
                    <span class="mp-preco-valor" data-field="preco" style="font-size:140px; font-weight:900; line-height:1; cursor:pointer; margin-top:200px;">${reaisExib},${centsExib}</span>
                    <span class="mp-preco-unidade" data-field="unidade" style="font-size:20px; font-weight:bold; margin-left:3px; margin-bottom:20px; line-height:1;">${uniDisplay}</span>
                </div>
                <div class="mp-fardo-wrapper" style="width:100%; text-align:center; padding-top:2px; margin-top:110px;">
                    <div class="mp-fardo-linha1" data-field="fardoTitulo" style="font-size:14px; font-weight:bold; line-height:0.66; transform:scaleY(1.3); text-transform:uppercase;">${p._fs?.fardoTitulo || `O fardo com ${qtdPack} unidades sai R$ ${fmtValor(fardoPreco)}`}</div>
                    <div class="mp-fardo-linha2" data-field="fardoInfo" style="font-size:14px; font-weight:bold; line-height:0.66; transform:scaleY(1.3); text-transform:uppercase; margin-top:8px;">${p._fs?.fardoInfo || `Nessa embalagem o ${uni} sai R$ ${valorEmbalagem}`}</div>
                </div>
            </div>
        </div>
    `
}

/* ═══════════════════════════════════════════════════════════════
   RENDERIZAR NA TELA
   ═══════════════════════════════════════════════════════════════ */
function renderizarPlacasMediaPack() {
    const container = document.getElementById('container-placas-mp')
    if (!container) return
    container.innerHTML = ''

    const totalPaginas = Math.ceil(plaquesSalvasMP.length / plaquesPorPaginaMP) || 1
    if (paginaPlacasMP >= totalPaginas) paginaPlacasMP = totalPaginas - 1
    const contadorEl = document.getElementById('contador-pagina-mp')
    if (contadorEl) contadorEl.innerText = `Página ${paginaPlacasMP + 1} de ${totalPaginas}`

    const lista = plaquesSalvasMP.slice(paginaPlacasMP * plaquesPorPaginaMP, (paginaPlacasMP + 1) * plaquesPorPaginaMP)
    if (!lista.length) {
        container.innerHTML = `
            <div class="es">
                <svg width="40" height="40" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:12px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                <p class="es-p">Nenhuma placa Media Pack adicionada</p>
                <p class="es-sub">Digite um código e preço do fardo para começar</p>
            </div>`
        return
    }

    lista.forEach(p => {
        const div = document.createElement('div')
        div.style.cssText = 'background:#fff; overflow:hidden; display:inline-flex; flex:1; justify-content:center; align-items:flex-start; min-width:561px;'
        div.innerHTML = montarPlacaMediaPackHTML(p)

        div.addEventListener('click', (e) => {
            if (e.target.closest('[data-field]')) return
            placaClicadaMP = p
            placaClicadaElMP = div
            marcarPlacaSelecionadaMP(div, true)
        })

        div.querySelectorAll('[data-field]').forEach(el => {
            el.style.cursor = 'pointer'
            const field = el.getAttribute('data-field')
            let clickTimer = null

            // ── click (1x): abre popup de ajuste de tamanho / arrasto ──
            if (field !== 'preco' && field !== 'unidade') {
                el.onclick = (e) => {
                    if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; return }
                    clickTimer = setTimeout(() => {
                        clickTimer = null
                        if (!p._fs) p._fs = {}
                        if (!p._fs.linha2 && p._fs.linha2 !== 0) p._fs = { ...p._fs }
                        const atual = parseInt(el.style.fontSize) || 20
                        const popup = document.createElement('div')
                        popup.style.cssText = 'position:fixed;z-index:9999;display:flex;align-items:center;gap:6px;background:var(--surface-2);border:1px solid var(--border-strong);border-radius:8px;padding:4px 8px;box-shadow:var(--shadow-lg);user-select:none;'
                        popup.style.top = (e.clientY - 40) + 'px'
                        popup.style.left = (e.clientX - 60) + 'px'
                        const span = document.createElement('span')
                        span.style.cssText = 'color:var(--text-1);font-size:13px;min-width:32px;text-align:center;'
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
                            gapSpan.style.cssText = 'color:var(--text-3);font-size:11px;margin:0 2px;'
                            gapSpan.textContent = '↕'
                            const dragHandle = document.createElement('div')
                            dragHandle.style.cssText = 'width:20px;height:20px;background:var(--surface-3);border:1px solid var(--border-strong);border-radius:4px;cursor:ns-resize;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--text-2);'
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
                                const onUp = () => {
                                    document.removeEventListener('mousemove', onMove)
                                    document.removeEventListener('mouseup', onUp)
                                    const wrapper = el.parentElement
                                    p._fs.gap3 = parseInt(wrapper.style.marginTop) || 0
                                    salvarERenderizarMediaPack()
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
                                salvarERenderizarMediaPack()
                            }
                        }
                        setTimeout(() => document.addEventListener('mousedown', fecharPopup), 100)
                    }, 300)
                }
            }

            // ── dblclick: edição inline do texto / unidade ──
            el.ondblclick = async () => {
                if (clickTimer) { clearTimeout(clickTimer); clickTimer = null }
                if (field === 'unidade') {
                    if (!p._fs) p._fs = {}
                    const ciclo = { KG: 'LT', LT: 'UN', UN: 'KG' }
                    p._fs.unidade = ciclo[el.innerText.trim()] || 'UN'
                    delete p._fs.fracionar100g
                    await salvarERenderizarMediaPack()
                    return
                }
                const input = document.createElement('input')
                input.value = el.innerText.trim()
                input.style.cssText = 'width:90%; font-size:' + el.style.fontSize + '; font-weight:bold; text-align:center; border:2px solid #b51515; border-radius:6px; background:#fff; color:#000; outline:none; padding:2px 6px; font-family:\'Segoe UI\',sans-serif;'
                el.replaceWith(input)
                input.focus(); input.select()

                const fechar = async () => {
                    const v = input.value.trim()
                    if (!v) { renderizarPlacasMediaPack(); return }
                    if (field === 'preco') {
                        const qtdPack = parseInt(p.qtd_pack, 10) || 12
                        let novo = parsePrecoEntrada(v)
                        if (isNaN(novo)) novo = parsePrecoEntrada(v.replace(/\./g, '').replace(',', '.'))
                        p.fardo_preco = Math.round(novo * qtdPack * 100) / 100
                        p.preco = Math.round((p.fardo_preco / qtdPack) * 100) / 100
                        p.preco_info = p.preco.toFixed(2).replace('.', ',')
                    } else if (field === 'linha1' || field === 'linha2' || field === 'linha3'
                        || field === 'fardoTitulo' || field === 'fardoInfo') {
                        const partes = quebrarPorMarcaMP(p.descricao || '', p.marca || '')
                        const marca = partes.linha2
                        if (field === 'linha1') {
                            p.descricao = (v.toUpperCase() + ' ' + (marca ? marca + ' ' : '') + partes.linha3).replace(/\s+/g, ' ').trim()
                        } else if (field === 'linha2') {
                            p.marca = v.toUpperCase()
                            p.descricao = (partes.linha1 + ' ' + p.marca + ' ' + partes.linha3).replace(/\s+/g, ' ').trim()
                        } else if (field === 'linha3') {
                            p.descricao = (partes.linha1 + ' ' + (marca ? marca + ' ' : '') + v.toUpperCase()).replace(/\s+/g, ' ').trim()
                            const qtd = extrairQtdPack(v.toUpperCase())
                            if (qtd > 0) {
                                p.qtd_pack = qtd
                                if (p.fardo_preco == null || isNaN(p.fardo_preco)) p.fardo_preco = Math.round((parseFloat(p.preco || 0) * p.qtd_pack) * 100) / 100
                            }
                        } else if (field === 'fardoTitulo' || field === 'fardoInfo') {
                            if (!p._fs) p._fs = {}
                            p._fs[field] = v
                        }
                    }
                    await salvarERenderizarMediaPack()
                }
                input.onkeydown = (ev) => { if (ev.key === 'Enter') fechar(); if (ev.key === 'Escape') renderizarPlacasMediaPack() }
                input.onblur = fechar
            }
        })

        div.oncontextmenu = (e) => {
            e.preventDefault()
            placaClicadaMP = p
            const menu = document.getElementById('contextMenu')
            const itemPadrao = document.getElementById('ctx-padrao-novas')
            if (itemPadrao) itemPadrao.style.display = (p._fs && Object.keys(p._fs).length) ? 'flex' : 'none'
            menu.style.display = 'block'
            menu.style.top = e.clientY + 'px'
            menu.style.left = e.clientX + 'px'
        }

        container.appendChild(div)
    })
}

function marcarPlacaSelecionadaMP(div, selecionada) {
    if (!div) return
    div.classList.toggle('placa-selecionada', !!selecionada)
    document.querySelectorAll('.placa-selecionada').forEach(el => {
        if (el !== div) el.classList.remove('placa-selecionada')
    })
}

/* ═══════════════════════════════════════════════════════════════
   PREDEFINIÇÃO
   ═══════════════════════════════════════════════════════════════ */
async function onSalvarPredefMediaPack() {
    const p = placaClicadaMP
    if (!p) { toast('Selecione uma placa primeiro', 'aviso'); return }
    if (!p._fs || !Object.keys(p._fs).length) { toast('Esta placa não tem ajustes para salvar', 'info'); return }
    await salvarPlacasMediaPack()
    toast('Predefinição da placa salva', 'ok')
}

async function onSalvarPredefPadraoMediaPack() {
    const p = placaClicadaMP
    if (!p) { toast('Selecione uma placa primeiro', 'aviso'); return }
    if (!p._fs || !Object.keys(p._fs).length) { toast('Esta placa não tem ajustes para salvar', 'info'); return }
    coreSalvarPresetPadrao('media-pack', JSON.parse(JSON.stringify(p._fs)))
    toast('As novas placas já vão nascer com esta predefinição', 'ok')
}

/* ═══════════════════════════════════════════════════════════════
   SALVAR / APAGAR / DUPLICAR
   ═══════════════════════════════════════════════════════════════ */
async function onExcluirPlacaMediaPack() {
    coreExcluirPlaca({ salvas: plaquesSalvasMP, clicada: placaClicadaMP })
    await salvarERenderizarMediaPack()
}
async function onDuplicarPlacaMediaPack() {
    coreDuplicarPlaca({ salvas: plaquesSalvasMP, clicada: placaClicadaMP })
    await salvarERenderizarMediaPack()
}

async function salvarPlacasMediaPack() {
    if (_salvandoMP) return
    _salvandoMP = true
    try {
        const placas = plaquesSalvasMP.map(p => {
            const _fs = { ...(p._fs || {}), qtd_pack: parseInt(p.qtd_pack, 10) || 12, fardo_preco: p.fardo_preco != null && !isNaN(p.fardo_preco) ? p.fardo_preco : null }
            return {
                descricao: p.descricao,
                codigo: p.codigo,
                ean: p.ean,
                preco: p.preco,
                preco_info: (p.fardo_preco != null ? p.fardo_preco : (parseFloat(p.preco || 0) * (parseInt(p.qtd_pack, 10) || 12))).toFixed(2).replace('.', ','),
                quantidade_kg_l: p.quantidade_kg_l,
                descricao_kglt: p.descricao_kglt,
                marca: p.marca || null,
                config: JSON.stringify(_fs)
            }
        })
        coreCacheSalvar('media-pack', placas)
        const res = await fetch(API + '/registros-placas', {
            method: 'POST',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'media-pack', placas })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status))
        coreCachePendente('media-pack', false)
        if (data.logIds && data.logIds.length) window._ultimasPlacasGeradas = (window._ultimasPlacasGeradas || []).concat(data.logIds)
        const stEl = document.getElementById('mp-status-banco')
        if (stEl && /armazenamento local|Servidor fora do ar/i.test(stEl.innerText)) {
            atualizarStatusBancoMP(`✓ ${plaquesSalvasMP.length} placa(s) salva(s) no servidor`)
        }
    } catch (e) {
        console.error('Erro ao salvar Media Pack:', e)
        coreCachePendente('media-pack', true)
        alert('Erro ao salvar no servidor: ' + e.message + '\n\nSuas placas continuam salvas neste computador e serão reenviadas quando o servidor voltar.')
    } finally {
        _salvandoMP = false
    }
}

async function salvarERenderizarMediaPack() {
    await salvarPlacasMediaPack()
    renderizarPlacasMediaPack()
}

async function mudarPaginaPlacasMediaPack(v) {
    await salvarPlacasMediaPack()
    paginaPlacasMP = coreMudarPagina({ salvas: plaquesSalvasMP, porPagina: plaquesPorPaginaMP, pagina: paginaPlacasMP }, v)
    renderizarPlacasMediaPack()
}

function imprimirTudoMediaPack() {
    if (!plaquesSalvasMP.length) { alert('Nenhuma placa Media Pack para imprimir.'); return }
    const container = document.getElementById('container-placas-mp')
    const paginaOriginal = paginaPlacasMP
    container.innerHTML = ''
    for (let i = 0; i < plaquesSalvasMP.length; i += plaquesPorPaginaMP) {
        const folha = document.createElement('div')
        folha.className = 'folha-media-pack'
        plaquesSalvasMP.slice(i, i + plaquesPorPaginaMP).forEach(p => {
            const div = document.createElement('div')
            div.className = 'placa-media-pack'
            div.innerHTML = montarPlacaMediaPackHTML(p)
            folha.appendChild(div)
        })
        container.appendChild(folha)
    }
    setTimeout(() => {
        printFolha(container.innerHTML, CSS_FOLHA_MP)
        setTimeout(() => {
            paginaPlacasMP = paginaOriginal
            renderizarPlacasMediaPack()
            registrarImpressaoPlacas()
        }, 1000)
    }, 500)
}

/* ═══════════════════════════════════════════════════════════════
   ADICIONAR / IMPORTAR / BUSCA
   ═══════════════════════════════════════════════════════════════ */
async function adicionarPlacaMediaPack() {
    const codigo = document.getElementById('ean-input-mp').value.trim()
    const precoRaw = document.getElementById('preco-input-mp').value
    const qtdPackInput = parseInt(document.getElementById('qtd-pack-input-mp').value) || 12
    const qtd = parseInt(document.getElementById('qtd-input-mp').value) || 1

    const precoFardo = parsePrecoEntrada(precoRaw)
    if (!codigo || isNaN(precoFardo)) return

    let prod = plaquesBancoMP.find(p => String(p.ean) === codigo) || plaquesBancoMP.find(p => String(p.codigo) === codigo)
    if (!prod) {
        try {
            const r = await fetch(API + '/produtos/' + encodeURIComponent(codigo), { headers: authHeaders() })
            if (r.ok) { prod = await r.json(); plaquesBancoMP.push(prod) }
        } catch {}
    }
    if (!prod) { alert('Produto não encontrado. Verifique o código.'); return }

    for (let i = 0; i < qtd; i++) {
        const precoUn = Math.round((precoFardo / qtdPackInput) * 100) / 100
        plaquesSalvasMP.push(coreAplicarPresetPadrao({
            ...prod,
            preco: precoUn,
            preco_info: precoUn.toFixed(2).replace('.', ','),
            quantidade_kg_l: parseFloat(prod.quantidade_kg_l || 0),
            qtd_pack: qtdPackInput,
            fardo_preco: precoFardo,
            id_unico: Date.now() + Math.random() + i
        }, 'media-pack'))
    }
    await salvarERenderizarMediaPack()
    document.getElementById('ean-input-mp').value = ''
    document.getElementById('preco-input-mp').value = ''
    document.getElementById('qtd-input-mp').value = 1
    document.getElementById('qtd-pack-input-mp').value = qtdPackInput
    document.getElementById('ean-input-mp').focus()
}

function abrirBuscaNomeMediaPack() {
    const modal = document.getElementById('modal-busca-mp')
    if (!modal) return
    modal.style.display = 'block'
    document.getElementById('input-busca-nome-mp').focus()
}

async function onBuscaNomeKeydownMediaPack(e) {
    if (e.key !== 'Enter') return
    const termo = e.target.value.trim()
    if (!termo || termo.length < 2) return

    const tbody = document.querySelector('#tabela-busca-mp tbody')
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:10px;color:#999;">Buscando...</td></tr>'

    try {
        const res = await fetch(API + `/produtos/busca?q=${encodeURIComponent(termo)}`, { headers: authHeaders() })
        const resultados = await res.json()
        if (!resultados.length) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:10px;color:#999;">Nenhum produto encontrado</td></tr>'
            return
        }
        tbody.innerHTML = resultados.map((p, i) => `
            <tr data-index="${i}" style="cursor:pointer; border-bottom:1px solid #f0f0f0;">
                <td style="padding:8px 12px; font-size:12px; color:#666;">${p.codigo}</td>
                <td style="padding:8px 12px; font-size:13px;">${p.descricao}</td>
                <td style="padding:8px 12px; font-size:13px; text-align:right;">R$ ${parseFloat(p.preco_venda || 0).toFixed(2).replace('.', ',')}</td>
            </tr>`).join('')
        tbody.querySelectorAll('tr').forEach(tr => {
            tr.onclick = () => {
                const i = parseInt(tr.getAttribute('data-index'))
                document.getElementById('ean-input-mp').value = resultados[i].codigo
                document.getElementById('preco-input-mp').value = resultados[i].preco_venda != null ? resultados[i].preco_venda : ''
                fecharModaisMediaPack()
                document.getElementById('preco-input-mp').focus()
            }
        })
    } catch {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:10px;color:#ef4444;">Erro na busca</td></tr>'
    }
}

async function processarImportacaoMediaPack() {
    const texto = document.getElementById('import-texto-mp').value.trim()
    if (!texto) return
    const qtdGlobal = parseInt(document.getElementById('qtd-input-mp')?.value) || 1
    const qtdPackInput = parseInt(document.getElementById('qtd-pack-input-mp')?.value) || 12
    const logErros = document.getElementById('log-erros-mp')
    const listaErros = document.getElementById('lista-erros-mp')
    listaErros.innerHTML = ''
    logErros.style.display = 'none'
    let contador = 0

    for (const linha of texto.split(/\r?\n/)) {
        const colunas = linha.split(/\t| {2,}/)
        if (colunas.length >= 2) {
            const descProcurada = colunas[0].trim().toUpperCase()
            const precoFardo = parsePrecoEntrada(colunas[1])
            if (!isNaN(precoFardo) && precoFardo >= 0) {
                let prod = plaquesBancoMP.find(p => p.descricao?.toUpperCase() === descProcurada) ||
                           plaquesBancoMP.find(p => p.descricao?.toUpperCase().includes(descProcurada))
                if (!prod) {
                    try {
                        const res = await fetch(API + '/produtos/busca?q=' + encodeURIComponent(descProcurada), { headers: authHeaders() })
                        if (res.ok) {
                            const lista = await res.json()
                            if (lista.length > 0) {
                                const res2 = await fetch(API + '/produtos/' + encodeURIComponent(lista[0].codigo), { headers: authHeaders() })
                                if (res2.ok) { const p = await res2.json(); plaquesBancoMP.push(p); prod = p }
                            }
                        }
                    } catch {}
                }
                // quantidade do pack: tenta pela linha 3 da descrição, depois pelo campo padrão
                const qtdPack = extrairQtdPack(descProcurada) || qtdPackInput
                const precoUn = Math.round((precoFardo / qtdPack) * 100) / 100
                if (prod) {
                    for (let i = 0; i < qtdGlobal; i++) {
                        plaquesSalvasMP.push(coreAplicarPresetPadrao({ ...prod, preco: precoUn, preco_info: precoUn.toFixed(2).replace('.', ','), quantidade_kg_l: parseFloat(prod.quantidade_kg_l || 0), qtd_pack: qtdPack, fardo_preco: precoFardo, id_unico: Date.now() + Math.random() + i + contador }, 'media-pack'))
                    }
                    contador++
                } else {
                    // produto não encontrado — gera a placa mesmo assim (como no Média)
                    for (let i = 0; i < qtdGlobal; i++) {
                        plaquesSalvasMP.push(coreAplicarPresetPadrao({ descricao: colunas[0].trim(), codigo: '', ean: '', preco: precoUn, preco_info: precoUn.toFixed(2).replace('.', ','), quantidade_kg_l: 0, qtd_pack: qtdPack, fardo_preco: precoFardo, id_unico: Date.now() + Math.random() + i + contador }, 'media-pack'))
                    }
                    contador++
                }
            } else {
                const li = document.createElement('li')
                li.textContent = colunas[0].trim() + ' (preço inválido)'
                listaErros.appendChild(li)
                logErros.style.display = 'block'
            }
        }
    }

    fecharModaisMediaPack()
    alert(contador + ' placa(s) Media Pack gerada(s).')
    await salvarERenderizarMediaPack()
    document.getElementById('import-texto-mp').value = ''
}

function fecharModaisMediaPack() {
    const m1 = document.getElementById('modal-busca-mp')
    const m2 = document.getElementById('modal-import-mp')
    if (m1) m1.style.display = 'none'
    if (m2) m2.style.display = 'none'
    const log = document.getElementById('log-erros-mp')
    if (log) log.style.display = 'none'
}

function vincularEventosPlacasMediaPack() {
    if (!document.getElementById('btn-add-placa-mp')) return
    document.getElementById('btn-add-placa-mp').onclick = adicionarPlacaMediaPack
    document.getElementById('btn-abrir-busca-mp').onclick = abrirBuscaNomeMediaPack
    document.getElementById('btn-abrir-import-mp').onclick = () => {
        if (!document.getElementById('modal-import-mp')) injetarModaisMP()
        const m = document.getElementById('modal-import-mp')
        if (m) { m.style.display = 'block'; document.getElementById('import-texto-mp').focus() }
    }
    document.getElementById('btn-print-atual-mp').onclick = () => {
        const folha = document.createElement('div')
        folha.className = 'folha-media-pack'
        const len = plaquesSalvasMP.length
        const start = paginaPlacasMP * plaquesPorPaginaMP
        plaquesSalvasMP.slice(start, Math.min(start + plaquesPorPaginaMP, len)).forEach(p => {
            const div = document.createElement('div')
            div.className = 'placa-media-pack'
            div.innerHTML = montarPlacaMediaPackHTML(p)
            folha.appendChild(div)
        })
        printFolha(folha.outerHTML, CSS_FOLHA_MP)
        setTimeout(registrarImpressaoPlacas, 1000)
    }
    document.getElementById('btn-print-tudo-mp').onclick = imprimirTudoMediaPack
    document.getElementById('btn-pag-ant-mp').onclick = () => mudarPaginaPlacasMediaPack(-1)
    document.getElementById('btn-pag-prox-mp').onclick = () => mudarPaginaPlacasMediaPack(1)
    document.getElementById('btn-limpar-mp').onclick = () => {
        if (confirm('Limpar todas as placas Media Pack?')) { plaquesSalvasMP = []; salvarERenderizarMediaPack() }
    }

    const eanInput = document.getElementById('ean-input-mp')
    const precoInput = document.getElementById('preco-input-mp')
    const qtdPackInput = document.getElementById('qtd-pack-input-mp')
    const qtdInput = document.getElementById('qtd-input-mp')
    eanInput.addEventListener('keyup', (e) => { if (eanInput.value.length >= 13 || e.key === 'Enter') { e.preventDefault(); precoInput.focus(); precoInput.select() } })
    precoInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); qtdPackInput.focus(); qtdPackInput.select() } })
    qtdPackInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); qtdInput.focus(); qtdInput.select() } })
    qtdInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarPlacaMediaPack() } })

    if (!document.getElementById('modal-busca-mp')) injetarModaisMP()
    document.getElementById('btn-processar-import-mp').onclick = processarImportacaoMediaPack
    document.getElementById('input-busca-nome-mp').addEventListener('keydown', onBuscaNomeKeydownMediaPack)
    document.getElementById('fechar-busca-mp').onclick = fecharModaisMediaPack
    document.getElementById('fechar-import-mp').onclick = fecharModaisMediaPack
}

window.carregarPlacasMediaPack = carregarPlacasMediaPack
window.onExcluirPlacaMediaPack = onExcluirPlacaMediaPack
window.onDuplicarPlacaMediaPack = onDuplicarPlacaMediaPack
window.onSalvarPredefMediaPack = onSalvarPredefMediaPack
window.onSalvarPredefPadraoMediaPack = onSalvarPredefPadraoMediaPack
