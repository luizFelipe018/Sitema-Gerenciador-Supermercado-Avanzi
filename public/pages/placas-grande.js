var plaquesBancoGrande = []
var plaquesSalvasGrande = []
var paginaPlacasGrande = 0
const plaquesPorPaginaGrande = 1
var placaClicadaGrande = null
var _salvandoGrande = false
const CSS_FOLHA_G = `
.folha-grande { display:flex; flex-direction:column; width:210mm; height:297mm; margin:0 auto 16px; background:#fff !important; box-sizing:border-box; box-shadow:0 2px 12px rgba(0,0,0,0.15); }
.placa-grande { width:100%; height:100%; background:#fff !important; box-sizing:border-box; display:grid; place-items:end center; }
@media print { @page { size: A4; margin: 0; } .folha-grande { box-shadow:none; margin:0; } .placa-grande { padding: 0 !important; } .pg-toggle-fracao { display:none !important; } }
`

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
                <div class="pg-input-row" style="display:flex; gap:12px; align-items:end; flex-wrap:wrap; margin-bottom:16px;">
                    <div class="pg-field-group" style="display:flex; flex-direction:column; gap:4px;">
                        <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Código / EAN</label>
                        <input type="text" id="ean-input-g" autocomplete="off" autofocus
                            style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; width:140px; transition:all 0.3s;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                    </div>
                    <div class="pg-field-group" style="display:flex; flex-direction:column; gap:4px;">
                        <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Preço (R$)</label>
                        <input type="number" id="preco-input-g" step="0.01"
                            style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; width:120px; transition:all 0.3s;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                            onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                    </div>
                    <div class="pg-field-group" style="display:flex; flex-direction:column; gap:4px;">
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
                <div class="pg-actions" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding-top:14px; border-top:1px solid rgba(255,255,255,0.06);">
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

                    <div class="pg-pagination" style="display:flex; align-items:center; gap:6px; margin-left:8px;">
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

    try {
        const res = await fetch(API+'/registros-placas?tipo=grande', { headers: authHeaders() })
        const data = await res.json()
        if (Array.isArray(data)) {
            plaquesSalvasGrande = data.map(p => {
                const prod = plaquesBancoGrande.find(x => String(x.codigo) === String(p.codigo) || (x.ean && p.ean && String(x.ean) === String(p.ean)))
                const fs = p.config ? JSON.parse(p.config) : null
                return {
                    ...p,
                    preco: parseFloat(p.preco),
                    quantidade_kg_l: parseFloat(p.quantidade_kg_l || 0),
                    id_unico: Date.now() + Math.random(),
                    marca: p.marca || prod?.marca || '',
                    _fs: fs || undefined
                }
            })
        }
    } catch { console.error('Erro ao carregar placas grandes salvas') }

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
    const dkglt = (p.descricao_kglt || '').toUpperCase()
    const ehPesoExato = qtdKgL > 0 && Math.abs(qtdKgL - 1) < 0.001
    const uni = ehPesoExato
        ? 'KG'
        : (dkglt.includes('LITRO') || dkglt === 'LT')
            ? 'LT'
            : 'UN'

    const fracionar = p._fs?.fracionar100g && uni === 'KG'
    const uniDisplay = fracionar ? '100G' : uni
    const precoExibir = fracionar ? preco / 10 : preco
    const precoTrunc = Math.floor(precoExibir * 100) / 100
    const precoFmtExib = precoTrunc.toFixed(2).replace('.', ',')
    const [reaisExib, centsExib] = precoFmtExib.split(',')
    const precoFontSize = p._fs?.preco || (reaisExib.length <= 2 ? 140 : 130)

    const uniRodape = qtdKgL > 0
        ? (dkglt.includes('LITRO') || dkglt === 'LT'
            ? 'LT'
            : dkglt.includes('KILO') || dkglt.includes('QUILO') || dkglt === 'KG'
                ? 'KG'
                : 'KG')
        : null
    const artRodape = uniRodape === 'UN' ? 'A' : 'O'
    const precoUn = (qtdKgL > 0) ? (preco / qtdKgL).toFixed(2).replace('.', ',') : null
    const rodape = precoUn && uniRodape
        ? `${semEan ? '' : 'NESTA EMBALAGEM '}${artRodape} ${uniRodape} SAI A R$ ${precoUn}`
        : ''

    const brandFontSize = calcBrandFontSize(linha2)
    const linha1FontSize = p._fs?.linha1 || Math.max(Math.round(brandFontSize * 0.4), 12)
    const linha3FontSize = p._fs?.linha3 || Math.max(Math.round(brandFontSize * 0.4), 12)
    const brandSz = p._fs?.linha2 || brandFontSize
    const gapLinha3 = p._fs?.gap3 ?? Math.max(Math.round(linha3FontSize * 0.6), 4)

    return `
        <div id="placa-grande-conteudo" class="placa-grande-conteudo" style="width:525px; height:544px; margin:0 auto 88px; position:relative; box-sizing:border-box; font-family:'Arial Black',Arial,sans-serif; font-weight:900;">
            <div class="pg-texto-wrapper" style="width:100%; display:flex; flex-direction:column; align-items:center; gap:2mm; line-height:1.7; padding-bottom:110px;">
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
                <div class="pg-preco-wrapper" style="width:100%; display:flex; align-items:flex-end;${uniDisplay !== 'UN' ? " justify-content:space-between;" : " justify-content:center;"} transform:scaleY(1.3);">
                    <span class="pg-preco-simbolo" style="font-size:20px; font-weight:bold; margin-right:2px; margin-bottom:20px; line-height:1;">R$</span>
                    <span class="pg-preco-valor" style="font-size:${precoFontSize}px; font-weight:900; line-height:1;">${reaisExib},${centsExib}</span>
                    ${fracionar
                        ? `<span class="pg-preco-unidade" style="font-size:16px; font-weight:bold; display:flex; flex-direction:column; align-items:center; line-height:1.15; margin-bottom:16px; margin-left:0;">
                            <span>A CADA</span>
                            <span>100G</span>
                        </span>`
                        : `<span class="pg-preco-unidade" style="font-size:20px; font-weight:bold;${uniDisplay !== 'UN' ? " margin-left:0;" : " margin-left:3px;"} margin-bottom:20px; line-height:1;">${uniDisplay}</span>`}
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

    lista.forEach(p => {
        const div = document.createElement('div')
        div.style.cssText = 'background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.15); display:inline-flex;'
        div.innerHTML = montarPlacaGrandeHTML(p)

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

            el.ondblclick = () => {
                if (clickTimer) { clearTimeout(clickTimer); clickTimer = null }
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
                        const partes = quebrarPorMarca(p.descricao, p.marca)
                        p.descricao = v.toUpperCase() + (partes.linha2 ? ' ' + partes.linha2 + (partes.linha3 ? ' ' + partes.linha3 : '') : '')
                    } else if (field === 'linha2') {
                        const partes = quebrarPorMarca(p.descricao, p.marca)
                        p.descricao = (partes.linha1 ? partes.linha1 + ' ' : '') + v.toUpperCase() + (partes.linha3 ? ' ' + partes.linha3 : '')
                        p.marca = v.toUpperCase()
                    } else if (field === 'linha3') {
                        const partes = quebrarPorMarca(p.descricao, p.marca)
                        p.descricao = (partes.linha1 ? partes.linha1 + ' ' : '') + (partes.linha2 ? partes.linha2 + ' ' : '') + v.toUpperCase()
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
    const idx = plaquesSalvasGrande.indexOf(placaClicadaGrande)
    if (idx === -1) return
    plaquesSalvasGrande.splice(idx, 1)
    await salvarERenderizarGrande()
}

async function onDuplicarPlacaGrande() {
    const idx = plaquesSalvasGrande.indexOf(placaClicadaGrande)
    if (idx === -1) return
    const clone = { ...placaClicadaGrande, id_unico: Date.now() + Math.random() }
    plaquesSalvasGrande.splice(idx + 1, 0, clone)
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
        const res = await fetch(API+'/registros-placas', {
            method: 'POST',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'grande', placas })
        })
        const data = await res.json()
        if (data.logIds && data.logIds.length) {
            window._ultimasPlacasGeradas.push(...data.logIds)
        }
    } catch (e) { console.error('Erro ao salvar placas grandes:', e) }
    _salvandoGrande = false
}

async function salvarERenderizarGrande() {
    await salvarPlacasGrande()
    renderizarPlacasGrande()
}

async function mudarPaginaPlacasGrande(v) {
    await salvarPlacasGrande()
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
            plaquesSalvasGrande.push({ ...prod, preco, preco_info: precoUn, id_unico: Date.now() + Math.random() })
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
