/* ═══════════════════════════════════════════════════════════════
   PÁGINA PLACA Grande
   Mesma arte e mesmas métricas da placa "Placa Pequena", porém ampliada
   para ocupar UMA folha Grande inteira (210mm x 297mm) em vez de 4
   por folha. O conteúdo é o mesmo 561x794px — só a escala muda:

     Placa Pequena : 2x2 por folha  -> escala 0.7068  (105 x 148,5 mm cada)
     Grande       : 1x1  por folha  -> escala 1.4137  (210 x 297 mm)

   O layout interno (posições, margens, preços) é o mesmo do Placa Pequena,
   por isso a arte e as medidas continuam idênticas — apenas maiores.
   ═══════════════════════════════════════════════════════════════ */

var placasBancoGrande = []
var placasSalvasGrande = []
var paginaPlacasGrande = 0
const placasPorPaginaGrande = 1
var placaClicadaGrande = null
var placaClicadaElGrande = null
var _salvandoGrande = false

// Escala de impressão: 561px x 794px -> 210mm x 297mm (Grande retrato)
const K_IMPRESSAO_GRANDE = 1.413
// Escala de visualização na tela (cabe a folha inteira na janela)
const K_TELA_GRANDE = 0.42
const PASSOS_ZOOM_GRANDE = [0.24, 0.32, 0.42, 0.55, 0.7, 0.9, 1.1]
let zoomTelaGrande = K_TELA_GRANDE

// A folha Grande usa o mesmo conteúdo/métricas da Placa Pequena
const CSS_FOLHA_GRANDE = `
@page { size: A4 portrait; margin: 0; }
${typeof CSS_PLACA_PEQUENA !== 'undefined' ? CSS_PLACA_PEQUENA : ''}
.folha-grande { --k:${K_IMPRESSAO_GRANDE}; display:grid; grid-template-columns:1fr; grid-template-rows:1fr; gap:0; width:210mm; height:297mm; margin:0; padding:0; background:#fff !important; box-sizing:border-box; overflow:hidden; page-break-after:always; break-after:page; page-break-inside:avoid; break-inside:avoid; }
.folha-grande .placa-pequena { width:100%; height:100%; }
.placa-selecionada { outline:none !important; box-shadow:none !important; }
@media print {
  @page { size: A4 portrait; margin: 0; }
  html, body { margin:0; padding:0; background:#fff; }
  .folha-grande { box-shadow:none !important; margin:0 !important; border:none !important; }
}
`

function carregarEstilosGrande() {
    // reaproveita o CSS da placa (conteúdo, fonte, guias) da Placa Pequena
    if (typeof carregarEstilosPequena === 'function') carregarEstilosPequena()
    if (!document.getElementById('placas-grande-guide')) {
        const style = document.createElement('style')
        style.id = 'placas-grande-guide'
        style.textContent = `
        #container-placas-grande { display:flex; flex-wrap:wrap; gap:0; justify-content:center; align-items:flex-start; }
        .folha-grande-tela { --k:var(--k-grande-tela, ${K_TELA_GRANDE}); display:grid; grid-template-columns:calc(561px * var(--k)); grid-template-rows:calc(794px * var(--k)); gap:0; margin:0 auto 16px; background:#fff; box-sizing:border-box; box-shadow:0 2px 12px rgba(0,0,0,0.15); }
        .folha-grande-tela .placa-pequena { width:100%; height:100%; }
        `
        document.head.appendChild(style)
    }
}

/** Aplica o zoom de visualização (só na tela). */
function aplicarZoomTelaGrande() {
    const alvo = document.getElementById('container-placas-grande')
    if (alvo) alvo.style.setProperty('--k-grande-tela', zoomTelaGrande)
    const pct = document.getElementById('grande-zoom-pct')
    if (pct) pct.textContent = Math.round((zoomTelaGrande / K_IMPRESSAO_GRANDE) * 100) + '%'
    const fit = document.getElementById('grande-zoom-fit')
    if (fit) fit.classList.toggle('is-on', Math.abs(zoomTelaGrande - K_TELA_GRANDE) < 0.001)
}

function mudarZoomTelaGrande(delta) {
    let i = PASSOS_ZOOM_GRANDE.findIndex(p => p >= zoomTelaGrande - 0.001)
    if (i === -1) i = PASSOS_ZOOM_GRANDE.length - 1
    i = Math.max(0, Math.min(PASSOS_ZOOM_GRANDE.length - 1, i + delta))
    zoomTelaGrande = PASSOS_ZOOM_GRANDE[i]
    aplicarZoomTelaGrande()
}

function encaixarZoomGrande() {
    zoomTelaGrande = K_TELA_GRANDE
    aplicarZoomTelaGrande()
}

async function carregarPlacasGrande() {
    carregarEstilosGrande()
    setActive('btn-placas-grande')
    setConteudo(`
        <div class="pg-wrapper" style="max-width:1200px; margin:0 auto;">

            <div class="dash-glass dash-animate pg-card" style="padding:20px; margin-bottom:20px;">
                <div class="pg-status" id="pg-status-banco-grande" style="font-size:11px; color:rgba(255,255,255,0.3); margin-bottom:10px; padding:6px 10px; border-radius:6px; background:rgba(255,255,255,0.03);">Carregando produtos do banco...</div>
                <div class="frc mb16" style="align-items:end;">
                    <div class="fcc">
                        <label class="lb">Código / EAN</label>
                        <input type="text" id="ean-input-grande" autocomplete="off" autofocus class="inp inp-w140">
                    </div>
                    <div class="fcc">
                        <label class="lb">Preço (R$)</label>
                        <input type="text" id="preco-input-grande" inputmode="decimal" class="inp inp-w120">
                    </div>
                    <div class="fcc">
                        <label class="lb">Qtd</label>
                        <input type="number" id="qtd-input-grande" value="1" min="1" class="inp inp-w70">
                    </div>
                    <button id="btn-add-placa-grande" class="btn-p">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Adicionar
                    </button>
                    <button id="btn-abrir-busca-grande" class="btn-s">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        Buscar
                    </button>
                    <button id="btn-abrir-import-grande" class="btn-s">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Importar
                    </button>
                </div>
                <div class="bar pg-actions">
                    <div class="d3-zoom" title="Zoom de visualização (não afeta a impressão)">
                        <button id="grande-zoom-out" title="Diminuir">−</button>
                        <span id="grande-zoom-pct">30%</span>
                        <button id="grande-zoom-in" title="Aumentar">+</button>
                        <button id="grande-zoom-fit" title="Enquadrar a folha inteira" style="width:auto; padding:0 8px; font-size:11px; font-weight:600;">Enquadrar</button>
                    </div>
                    <button id="btn-print-atual-grande" class="btn-sm">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Pág. Atual
                    </button>
                    <button id="btn-print-tudo-grande" class="btn-sm">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Imprimir Tudo
                    </button>

                    <div class="frc6" style="margin-left:8px;">
                        <button id="btn-pag-ant-grande" class="btn-g">
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                            Ant.
                        </button>
                        <span id="contador-pagina-grande" class="pg">Página 1 de 1</span>
                        <button id="btn-pag-prox-grande" class="btn-g">
                            Próx.
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                    </div>

                    <button id="btn-limpar-grande" class="btn-d mla">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        Limpar
                    </button>
                </div>
            </div>

            <div class="pg-plaques" id="container-placas-grande" style="padding:10px 0; overflow-x:auto;"></div>

        </div>
    `, 'Placa Grande')

    aplicarZoomTelaGrande()

    if (placasBancoGrande.length === 0) {
        try {
            const res = await fetch(API + '/produtos?page=1&limit=500', { headers: authHeaders() })
            const json = await res.json()
            if (json.data && Array.isArray(json.data)) {
                placasBancoGrande = json.data
                const st = document.getElementById('pg-status-banco-grande')
                if (st) st.textContent = `✓ ${placasBancoGrande.length} produto(s) em memória`
            }
        } catch {}
    }

    const carregadas = await coreCarregarPlacas('grande', p => {
        const prod = placasBancoGrande.find(x => String(x.codigo) === String(p.codigo) || (x.ean && p.ean && String(x.ean) === String(p.ean)))
        return {
            ...p,
            preco: Math.round(parseFloat(p.preco) * 100) / 100,
            quantidade_kg_l: parseFloat(p.quantidade_kg_l || 0),
            id_unico: Date.now() + Math.random(),
            marca: p.marca || prod?.marca || '',
            _fs: coreParseConfig(p.config) || undefined
        }
    })
    placasSalvasGrande = carregadas.placas

    vincularEventosPlacasGrande()
    renderizarPlacasGrande()
}

function renderizarPlacasGrande() {
    const container = document.getElementById('container-placas-grande')
    if (!container) return
    container.innerHTML = ''

    const totalPaginas = Math.ceil(placasSalvasGrande.length / placasPorPaginaGrande) || 1
    if (paginaPlacasGrande >= totalPaginas) paginaPlacasGrande = totalPaginas - 1

    const contadorEl = document.getElementById('contador-pagina-grande')
    if (contadorEl) contadorEl.innerText = `Página ${paginaPlacasGrande + 1} de ${totalPaginas}`

    const lista = placasSalvasGrande.slice(
        paginaPlacasGrande * placasPorPaginaGrande,
        (paginaPlacasGrande + 1) * placasPorPaginaGrande
    )
    if (!lista.length) {
        container.innerHTML = `
            <div class="es">
                <svg width="40" height="40" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                <p class="es-p">Nenhuma placa Grande adicionada</p>
                <p class="es-sub">Digite um código e preço acima para começar</p>
            </div>`
        return
    }

    const folha = document.createElement('div')
    folha.className = 'folha-grande-tela'

    lista.forEach(p => {
        const div = document.createElement('div')
        div.className = 'placa-pequena'
        div.innerHTML = montarPlacaPequenaHTML(p)

        // Alternar entre KG e 100g ao clicar no botão
        div.querySelectorAll('.pg-toggle-fracao').forEach(btn => {
            btn.style.cursor = 'pointer'
            btn.onclick = (e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!p._fs) p._fs = {}
                if (!p.unidade || String(p.unidade).toUpperCase() !== 'KG') p.unidade = 'KG'
                p._fs.unidade = p.unidade
                p.fracionar = p.fracionar ? 0 : 1
                if (typeof p._fs.fracionar100g !== 'undefined') delete p._fs.fracionar100g
                salvarPlacasGrande().then(() => renderizarPlacasGrande())
            }
        })

        // clique na placa (fora dos textos) seleciona a placa do menu de contexto
        div.addEventListener('click', (e) => {
            if (e.target.closest('[data-field]')) return
            placaClicadaGrande = p
            placaClicadaElGrande = div
            marcarPlacaSelecionadaGrande(div, true)
        })

        div.oncontextmenu = (e) => {
            e.preventDefault()
            placaClicadaGrande = p
            const menu = document.getElementById('contextMenu')
            const itemPadrao = document.getElementById('ctx-padrao-novas')
            if (itemPadrao) {
                itemPadrao.style.display = (p._fs && Object.keys(p._fs).length) ? 'flex' : 'none'
            }
            menu.style.display = 'block'
            menu.style.top = e.clientY + 'px'
            menu.style.left = e.clientX + 'px'
        }

        // ajuste de fonte/posição no clique no texto (mesma mecânica da Placa Pequena)
        div.querySelectorAll('[data-field]').forEach(el => {
            el.style.cursor = 'pointer'
            const field = el.getAttribute('data-field')

            let clickTimer = null
            el.onclick = (e) => {
                if (field === 'preco' || field === 'ean') return
                if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; return }
                clickTimer = setTimeout(() => {
                    clickTimer = null
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
                    const ajustar = (passo) => {
                        const novo = Math.max(8, (parseInt(el.style.fontSize) || atual) + passo)
                        el.style.fontSize = novo + 'px'
                        p._fs[field] = novo
                        span.textContent = novo
                    }
                    btnMenos.onclick = (ev) => { ev.stopPropagation(); ajustar(-2) }
                    btnMais.onclick = (ev) => { ev.stopPropagation(); ajustar(2) }
                    popup.append(btnMenos, span, btnMais)
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

            // Duplo clique para trocar unidade (igual Placa Pequena)
            if (field === 'unidade') {
                el.ondblclick = async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (clickTimer) { clearTimeout(clickTimer); clickTimer = null }
                    if (!p._fs) p._fs = {}
                    const ciclo = { KG: 'LT', LT: 'UN', UN: 'KG' }
                    const atualUni = (el.innerText || p.unidade || 'KG').trim().toUpperCase()
                    p.unidade = ciclo[atualUni] || 'KG'
                    p._fs.unidade = p.unidade
                    if (p.unidade === 'KG') {
                        p.fracionar = p.fracionar || 0
                    } else {
                        p.fracionar = 0
                        if (typeof p._fs.fracionar100g !== 'undefined') delete p._fs.fracionar100g
                    }
                    await salvarPlacasGrande()
                    renderizarPlacasGrande()
                }
            }
        })

        folha.appendChild(div)
    })

    container.appendChild(folha)
}

/** Destaca a placa selecionada (apenas na tela). */
function marcarPlacaSelecionadaGrande(div, selecionada) {
    if (!div) return
    div.classList.toggle('placa-selecionada', !!selecionada)
    document.querySelectorAll('.placa-pequena.placa-selecionada').forEach(el => {
        if (el !== div) el.classList.remove('placa-selecionada')
    })
}

async function salvarPlacasGrande() {
    if (_salvandoGrande) return
    _salvandoGrande = true
    try {
        const placas = placasSalvasGrande.map(p => ({
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
        const res = await fetch(API + '/registros-placas', {
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
        const stEl = document.getElementById('pg-status-banco-grande')
        if (stEl && /armazenamento local|Servidor fora do ar/i.test(stEl.innerText)) {
            stEl.textContent = `✓ ${placasSalvasGrande.length} placa(s) salva(s) no servidor`
        }
    } catch (e) {
        console.error('Erro ao salvar placas Grande:', e)
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
    paginaPlacasGrande = coreMudarPagina({ salvas: placasSalvasGrande, porPagina: placasPorPaginaGrande, pagina: paginaPlacasGrande }, v)
    renderizarPlacasGrande()
}

function imprimirTudoGrande() {
    if (!placasSalvasGrande.length) {
        alert('Nenhuma placa para imprimir.')
        return
    }

    const container = document.getElementById('container-placas-grande')
    const paginaOriginal = paginaPlacasGrande
    container.innerHTML = ''

    for (let i = 0; i < placasSalvasGrande.length; i += placasPorPaginaGrande) {
        const folha = document.createElement('div')
        folha.className = 'folha-grande'
        const placasNaFolha = placasSalvasGrande.slice(i, i + placasPorPaginaGrande)
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
        printFolha(container.innerHTML, CSS_FOLHA_GRANDE)
        setTimeout(() => {
            paginaPlacasGrande = paginaOriginal
            renderizarPlacasGrande()
            registrarImpressaoPlacas()
        }, 1000)
    }, 500)
}

async function adicionarPlacaGrande() {
    const codigo = document.getElementById('ean-input-grande').value.trim()
    const precoRaw = document.getElementById('preco-input-grande').value
    const preco = Math.round(parseFloat(precoRaw.replace(',', '.')) * 100) / 100
    const quantidade = parseInt(document.getElementById('qtd-input-grande').value) || 1
    if (!codigo || isNaN(preco)) return

    let prod = placasBancoGrande.find(p => String(p.ean) === codigo) || placasBancoGrande.find(p => String(p.codigo) === codigo)

    if (!prod) {
        try {
            const url = API + '/produtos/busca/ean/' + encodeURIComponent(codigo)
            const res = await fetch(url, { headers: authHeaders() })
            if (res.ok) {
                const p = await res.json()
                placasBancoGrande.push(p)
                prod = p
            }
        } catch {}
    }
    if (!prod) {
        try {
            const url = API + '/produtos/' + encodeURIComponent(codigo)
            const res = await fetch(url, { headers: authHeaders() })
            if (res.ok) {
                const p = await res.json()
                placasBancoGrande.push(p)
                prod = p
            }
        } catch {}
    }

    if (prod) {
        const qtdKgL = parseFloat(prod.quantidade_kg_l) || 0
        const precoUn = qtdKgL > 0 ? (preco / qtdKgL).toFixed(2).replace('.', ',') : (prod.preco_info || (prod.preco_venda ? parseFloat(prod.preco_venda).toFixed(2).replace('.', ',') : preco.toFixed(2).replace('.', ',')))
        const unidade = qtdKgL > 0 ? 'KG' : ((prod.unidade || prod.tipo_unidade || 'UN') + '').toUpperCase()
        for (let i = 0; i < quantidade; i++) {
            placasSalvasGrande.push(coreAplicarPresetPadrao({
                ...prod,
                preco: Math.round(preco * 100) / 100,
                preco_info: precoUn,
                quantidade_kg_l: qtdKgL,
                unidade: unidade,
                fracionar: prod.fracionar || 0,
                id_unico: Date.now() + Math.random() + i
            }, 'grande'))
        }
        await salvarERenderizarGrande()
        document.getElementById('ean-input-grande').value = ''
        document.getElementById('preco-input-grande').value = ''
        document.getElementById('qtd-input-grande').value = 1
        document.getElementById('ean-input-grande').focus()
    } else {
        alert('Produto não encontrado. Verifique o código e tente novamente.')
    }
}

function abrirBuscaNomeGrande() {
    coreAbrirBuscaNome('-grande')
}

function abrirImportacaoGrande() {
    const modal = document.getElementById('modal-import-grande')
    if (modal) modal.style.display = 'block'
    const input = document.getElementById('import-texto-grande')
    if (input) { input.value = ''; input.focus() }
}

async function onBuscaNomeKeydownGrande(e) {
    if (e.key !== 'Enter') return
    const termo = e.target.value.trim()
    if (!termo || termo.length < 2) return

    const tbody = document.querySelector('#tabela-busca-grande tbody')
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:10px;color:#999;">Buscando...</td></tr>'

    try {
        const res = await fetch(API + `/produtos/busca?q=${encodeURIComponent(termo)}`, { headers: authHeaders() })
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
                document.getElementById('ean-input-grande').value = resultados[i].codigo
                document.getElementById('preco-input-grande').value = resultados[i].preco_venda != null ? resultados[i].preco_venda : ''
                fecharModaisGrande()
                document.getElementById('preco-input-grande').focus()
            }
        })
    } catch {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:10px;color:#ef4444;">Erro na busca</td></tr>'
    }
}

function fecharModaisGrande() {
    document.getElementById('modal-busca-grande').style.display = 'none'
    document.getElementById('modal-import-grande').style.display = 'none'
    document.getElementById('log-erros-grande').style.display = 'none'
}

async function processarImportacaoGrande() {
    const texto = document.getElementById('import-texto-grande').value.trim()
    if (!texto) return
    const qtdGlobal = parseInt(document.getElementById('qtd-input-grande')?.value) || 1
    const logErros = document.getElementById('log-erros-grande')
    const listaErros = document.getElementById('lista-erros-grande')
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
                        const res = await fetch(API + '/produtos/busca?q=' + encodeURIComponent(descProcurada), { headers: authHeaders() })
                        if (res.ok) {
                            const achados = await res.json()
                            prod = achados.find(p => p.descricao?.toUpperCase() === descProcurada) || achados[0]
                            if (prod) placasBancoGrande.push(prod)
                        }
                    } catch {}
                }
                if (prod) {
                    const qtdKgL = parseFloat(prod.quantidade_kg_l) || 0
                    const precoUn = qtdKgL > 0 ? (precoNovo / qtdKgL).toFixed(2).replace('.', ',') : precoNovo.toFixed(2).replace('.', ',')
                    const unidade = qtdKgL > 0 ? 'KG' : ((prod.unidade || prod.tipo_unidade || 'UN') + '').toUpperCase()
                    for (let i = 0; i < qtdGlobal; i++) {
                        placasSalvasGrande.push(coreAplicarPresetPadrao({
                            ...prod,
                            preco: Math.round(precoNovo * 100) / 100,
                            preco_info: precoUn,
                            quantidade_kg_l: qtdKgL,
                            unidade: unidade,
                            fracionar: 0,
                            id_unico: Date.now() + Math.random() + i
                        }, 'grande'))
                    }
                    contador++
                } else {
                    const li = document.createElement('li')
                    li.textContent = descProcurada
                    listaErros.appendChild(li)
                }
            }
        }
    }

    if (contador === 0) {
        logErros.style.display = 'block'
    }

    await salvarERenderizarGrande()
    document.getElementById('import-texto-grande').value = ''


    if (contador === 0) {
        logErros.style.display = 'block'
    }

    await salvarERenderizarGrande()
    document.getElementById('import-texto-grande').value = ''

    if (destino === 'pequena') {
        document.getElementById('modal-import-grande').style.display = 'none'
        if (document.getElementById('btn-placas-pequena')) document.getElementById('btn-placas-pequena').click()
        else if (typeof carregarPlacasPequena === 'function') carregarPlacasPequena()
        if (typeof salvarERenderizarPequena === 'function') await salvarERenderizarPequena()
        alert(`${resImp.contador} placa(s) gerada(s).`)
        document.getElementById('import-texto-grande').value = ''
        return
    }
    if (destino === 'media') {
        document.getElementById('modal-import-grande').style.display = 'none'
        if (document.getElementById('btn-placas-media')) document.getElementById('btn-placas-media').click()
        else if (typeof carregarPlacasMedia === 'function') carregarPlacasMedia()
        if (typeof salvarERenderizarMedia === 'function') await salvarERenderizarMedia()
        alert(`${resImp.contador} placa(s) gerada(s).`)
        document.getElementById('import-texto-grande').value = ''
        return
    }

    document.getElementById('modal-import-grande').style.display = 'none'
    alert(`${resImp.contador} placa(s) gerada(s).`)
    await salvarERenderizarGrande()
    document.getElementById('import-texto-grande').value = ''
}

async function onExcluirPlacaGrande() {
    coreExcluirPlaca({ salvas: placasSalvasGrande, clicada: placaClicadaGrande })
    await salvarPlacasGrande()
    renderizarPlacasGrande()
}

async function onDuplicarPlacaGrande() {
    coreDuplicarPlaca({ salvas: placasSalvasGrande, clicada: placaClicadaGrande })
    await salvarPlacasGrande()
    renderizarPlacasGrande()
}

/** Salva a predefinição de texto da placa selecionada (menu de contexto). */
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

/** Usa a predefinição da placa como padrão das novas placas Grande. */
async function onSalvarPredefPadraoGrande() {
    const p = placaClicadaGrande
    if (!p) { toast('Selecione uma placa primeiro', 'aviso'); return }
    if (!p._fs || !Object.keys(p._fs).length) {
        toast('Esta placa não tem ajustes para salvar', 'info')
        return
    }
    coreSalvarPresetPadrao('grande', JSON.parse(JSON.stringify(p._fs)))
    toast('As novas placas Grande já vão nascer com esta predefinição', 'ok')
}

function vincularEventosPlacasGrande() {
    const eanInput = document.getElementById('ean-input-grande')
    if (!eanInput) return

    document.getElementById('btn-add-placa-grande').onclick = adicionarPlacaGrande
    document.getElementById('btn-abrir-busca-grande').onclick = abrirBuscaNomeGrande
    document.getElementById('btn-abrir-import-grande').onclick = abrirImportacaoGrande

    // Zoom de visualização (só na tela)
    document.getElementById('grande-zoom-in')?.addEventListener('click', () => mudarZoomTelaGrande(1))
    document.getElementById('grande-zoom-out')?.addEventListener('click', () => mudarZoomTelaGrande(-1))
    document.getElementById('grande-zoom-fit')?.addEventListener('click', encaixarZoomGrande)

    document.getElementById('btn-print-atual-grande').onclick = () => {
        const folha = document.createElement('div')
        folha.className = 'folha-grande'
        const len = placasSalvasGrande.length
        const start = paginaPlacasGrande * placasPorPaginaGrande
        const page = placasSalvasGrande.slice(start, Math.min(start + placasPorPaginaGrande, len))
        page.forEach(p => {
            const div = document.createElement('div')
            div.className = 'placa-pequena'
            div.innerHTML = montarPlacaPequenaHTML(p)
            folha.appendChild(div)
        })
        printFolha(folha.outerHTML, CSS_FOLHA_GRANDE)
        setTimeout(registrarImpressaoPlacas, 1000)
    }

    document.getElementById('btn-print-tudo-grande').onclick = imprimirTudoGrande
    document.getElementById('btn-pag-ant-grande').onclick = () => mudarPaginaPlacasGrande(-1)
    document.getElementById('btn-pag-prox-grande').onclick = () => mudarPaginaPlacasGrande(1)
    document.getElementById('btn-limpar-grande').onclick = () => {
        if (!placasSalvasGrande.length) return
        if (!confirm('Limpar todas as placas Grande?')) return
        placasSalvasGrande = []
        salvarERenderizarGrande()
    }

    document.getElementById('fechar-busca-grande').onclick = () => { document.getElementById('modal-busca-grande').style.display = 'none' }
    document.getElementById('fechar-import-grande').onclick = () => { document.getElementById('modal-import-grande').style.display = 'none' }
    document.getElementById('btn-processar-import-grande').onclick = processarImportacaoGrande

    const inputBusca = document.getElementById('input-busca-nome-grande')
    if (inputBusca) inputBusca.onkeydown = onBuscaNomeKeydownGrande
}
