const TP_STORAGE_KEY = 'tercaPizzaDados'

function carregarTercaPizza() {
    setActive('btn-terca-pizza')
    setConteudo(`
        <div style="display:grid; grid-template-columns:1fr 1.5fr; gap:20px;">

            <!-- Painel esquerdo: controles -->
            <div style="display:flex; flex-direction:column; gap:16px;">

                <!-- Data -->
                <div class="dash-glass dash-animate" style="padding:20px;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                        <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Data da Oferta</span>
                    </div>
                    <input id="tp-data" type="date"
                        style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; width:100%; transition:all 0.3s; box-sizing:border-box; color-scheme:dark;"
                        onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                        onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                </div>

                <!-- Lista de pizzas -->
                <div class="dash-glass dash-animate" style="padding:20px;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                        <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Lista de Pizzas</span>
                    </div>
                    <p style="font-size:12px; color:rgba(255,255,255,0.3); margin-bottom:10px;">Cole do Excel no formato: <code style="background:rgba(255,255,255,0.04); padding:2px 6px; border-radius:4px; font-size:11px; color:rgba(255,255,255,0.5);">Nome [TAB] Preço</code></p>
                    <textarea id="tp-lista" rows="10" placeholder="Mortadela 872G&#9;16,90&#10;Frango C.Requeijão 975G&#9;28,90&#10;Moda da Casa 1142G&#9;36,90"
                        style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; width:100%; transition:all 0.3s; box-sizing:border-box; font-family:monospace; resize:none;"
                        onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                        onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'"></textarea>
                </div>

                <!-- Botões -->
                <div style="display:flex; gap:8px;">
                    <button id="tp-btn-gerar" style="flex:1; padding:12px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; justify-content:center; gap:6px;"
                        onmouseenter="this.style.transform='translateY(-2px) scale(1.02)';this.style.boxShadow='0 8px 24px rgba(181,21,21,0.4)'"
                        onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(181,21,21,0.3)'"
                        onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='translateY(-2px) scale(1.02)'">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        Gerar Arte
                    </button>
                    <button id="tp-btn-salvar" style="flex:1; padding:12px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#16a34a,#15803d); box-shadow:0 4px 16px rgba(22,163,74,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; justify-content:center; gap:6px; opacity:0.4;"
                        disabled
                        onmouseenter="if(!this.disabled){this.style.transform='translateY(-2px) scale(1.02)';this.style.boxShadow='0 8px 24px rgba(22,163,74,0.4)'}"
                        onmouseleave="if(!this.disabled){this.style.transform='';this.style.boxShadow='0 4px 16px rgba(22,163,74,0.3)'}"
                        onmousedown="if(!this.disabled){this.style.transform='scale(0.97)'}" onmouseup="if(!this.disabled){this.style.transform='translateY(-2px) scale(1.02)'}">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Salvar PNG
                    </button>
                    <button id="tp-btn-limpar" style="padding:12px 16px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; font-weight:600; color:rgba(255,255,255,0.5); cursor:pointer; background:rgba(255,255,255,0.04); transition:all 0.3s; display:flex; align-items:center; gap:4px;"
                        onmouseenter="this.style.background='rgba(239,68,68,0.1)';this.style.color='#ef4444';this.style.borderColor='rgba(239,68,68,0.2)'"
                        onmouseleave="this.style.background='rgba(255,255,255,0.04)';this.style.color='rgba(255,255,255,0.5)';this.style.borderColor='rgba(255,255,255,0.08)'">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        Limpar
                    </button>
                </div>
                <p id="tp-msg" style="font-size:11px; text-align:center; min-height:16px; color:rgba(255,255,255,0.3);"></p>

            </div>

            <!-- Painel direito: preview da arte -->
            <div style="display:flex; flex-direction:column; gap:12px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                    <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Preview</span>
                </div>
                <div id="tp-preview-wrapper" class="dash-glass" style="flex:1; min-height:400px; display:flex; align-items:center; justify-content:center; border-radius:16px; overflow:hidden;">
                    <p style="color:rgba(255,255,255,0.25); font-size:13px;" id="tp-placeholder">Clique em "Gerar Arte" para visualizar</p>
                </div>
            </div>

        </div>
    `, 'Terça da Pizza')

    const salvo = carregarDadosSalvos()
    if (salvo) {
        if (salvo.data)  document.getElementById('tp-data').value  = salvo.data
        if (salvo.lista) document.getElementById('tp-lista').value = salvo.lista
        if (salvo.data && salvo.lista) {
            gerarArtePizza(true)
        }
    }

    document.getElementById('tp-data').onchange  = salvarDados
    document.getElementById('tp-lista').oninput  = salvarDados

    document.getElementById('tp-btn-gerar').onclick  = () => gerarArtePizza(false)
    document.getElementById('tp-btn-salvar').onclick  = salvarArtePizza
    document.getElementById('tp-btn-limpar').onclick  = limparTercaPizza
}

function salvarDados() {
    const dados = {
        data:  document.getElementById('tp-data')?.value  || '',
        lista: document.getElementById('tp-lista')?.value || ''
    }
    localStorage.setItem(TP_STORAGE_KEY, JSON.stringify(dados))
}

function carregarDadosSalvos() {
    try {
        const raw = localStorage.getItem(TP_STORAGE_KEY)
        return raw ? JSON.parse(raw) : null
    } catch { return null }
}

function limparTercaPizza() {
    if (!confirm('Limpar data, lista e preview da arte?')) return
    localStorage.removeItem(TP_STORAGE_KEY)
    document.getElementById('tp-data').value  = ''
    document.getElementById('tp-lista').value = ''
    document.getElementById('tp-preview-wrapper').innerHTML =
        `<p style="color:rgba(255,255,255,0.25); font-size:13px;">Clique em "Gerar Arte" para visualizar</p>`
    const btnSalvar = document.getElementById('tp-btn-salvar')
    btnSalvar.disabled = true
    btnSalvar.style.opacity = '0.4'
    document.getElementById('tp-msg').textContent = ''
}

function parsePizzas(texto) {
    return texto.trim().split(/\r?\n/).map(linha => {
        const cols = linha.split(/\t/)
        if (cols.length < 2) return null
        const nome = cols[0].trim()
            .replace(/\bAVANZI\b/gi, '')
            .replace(/\bPIZZA\b/gi, '')
            .replace(/\s{2,}/g, ' ')
            .trim()
            .toLowerCase()
            .replace(/\b\w/g, c => c.toUpperCase())
        const preco = cols[1].replace('R$', '').trim()
        return { nome, preco }
    }).filter(Boolean)
}

function formatarData(dateStr) {
    if (!dateStr) return ''
    const [ano, mes, dia] = dateStr.split('-')
    return `${dia}/${mes}/${ano.slice(2)}`
}

function montarArte(pizzas, dataFormatada) {
    const arte = document.createElement('div')
    arte.style.cssText = `
        width: 1080px;
        height: 1350px;
        position: relative;
        font-family: 'Impact', sans-serif;
        overflow: hidden;
    `

    const fundo = document.createElement('img')
    fundo.src = '/terca-pizza-fundo'
    fundo.crossOrigin = 'anonymous'
    fundo.style.cssText = `position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover;`
    arte.appendChild(fundo)

    const areaTexto = document.createElement('div')
    areaTexto.style.cssText = `
        position: absolute;
        top: 600px;
        left: 160px;
        width: 820px;
        display: flex;
        flex-direction: column;
        gap: 0px;
    `
    pizzas.forEach(p => {
        const linha = document.createElement('div')
        linha.style.cssText = `
            font-size: 40px;
            font-weight: 400;
            font-family: 'Impact', sans-serif;
            color: #ffffff;
            line-height: 1.25;
            white-space: nowrap;
        `
        linha.innerHTML = `${p.nome} <span style="color:#f9c775 !important;">| R$ ${p.preco} UN</span>`
        areaTexto.appendChild(linha)
    })
    arte.appendChild(areaTexto)

    const rodape = document.createElement('div')
    rodape.style.cssText = `
        position: absolute;
        bottom: 45px;
        left: 160px;
        font-size: 35px;
        font-weight: 400;
        font-family: 'Impact', sans-serif;
        color: #f9c775;
        line-height: 1.2;
        text-transform: uppercase;
    `
    rodape.innerHTML = `OFERTAS VÁLIDAS<br>PARA O DIA ${dataFormatada}`
    arte.appendChild(rodape)

    return arte
}

function gerarArtePizza(silencioso = false) {
    const lista  = document.getElementById('tp-lista')?.value || ''
    const data   = document.getElementById('tp-data')?.value  || ''
    const msgEl  = document.getElementById('tp-msg')
    const pizzas = parsePizzas(lista)
    const dataFmt = formatarData(data)

    if (!pizzas.length) {
        if (!silencioso) { msgEl.style.color = '#ef4444'; msgEl.textContent = 'Cole a lista de pizzas primeiro.' }
        return
    }
    if (!dataFmt) {
        if (!silencioso) { msgEl.style.color = '#ef4444'; msgEl.textContent = 'Selecione a data da oferta.' }
        return
    }

    if (msgEl) msgEl.textContent = ''

    const ORIG_W = 1080
    const ORIG_H = 1350
    const wrapper = document.getElementById('tp-preview-wrapper')
    const scale   = wrapper.offsetWidth / ORIG_W

    wrapper.innerHTML = ''
    wrapper.style.height       = (ORIG_H * scale) + 'px'
    wrapper.style.position     = 'relative'
    wrapper.style.overflow     = 'hidden'

    const preview = montarArte(pizzas, dataFmt)
    preview.id = 'tp-arte-preview'
    preview.style.position       = 'absolute'
    preview.style.top            = '0'
    preview.style.left           = '0'
    preview.style.transformOrigin = 'top left'
    preview.style.transform      = `scale(${scale})`
    wrapper.appendChild(preview)

    const btnSalvar = document.getElementById('tp-btn-salvar')
    if (btnSalvar) {
        btnSalvar.disabled = false
        btnSalvar.style.opacity = '1'
    }

    if (!silencioso && msgEl) {
        msgEl.style.color = '#22c55e'
        msgEl.textContent = '✅ Arte gerada! Clique em Salvar PNG para exportar em 1080×1350.'
    }

    salvarDados()
}

async function salvarArtePizza() {
    const msgEl  = document.getElementById('tp-msg')
    const data   = document.getElementById('tp-data')?.value  || ''
    const lista  = document.getElementById('tp-lista')?.value || ''
    const pizzas = parsePizzas(lista)
    const dataFmt = formatarData(data)

    if (!pizzas.length || !dataFmt) {
        msgEl.style.color = '#ef4444'; msgEl.textContent = 'Gere a arte primeiro.'
        return
    }

    msgEl.style.color = 'rgba(255,255,255,0.4)'; msgEl.textContent = 'Gerando imagem em 1080×1350...'

    if (!window.html2canvas) {
        await new Promise((resolve, reject) => {
            const s = document.createElement('script')
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
            s.onload = resolve; s.onerror = reject
            document.head.appendChild(s)
        })
    }

    const arteReal = montarArte(pizzas, dataFmt)
    arteReal.style.position  = 'fixed'
    arteReal.style.top       = '-9999px'
    arteReal.style.left      = '-9999px'
    arteReal.style.transform = 'none'
    document.body.appendChild(arteReal)

    const img = arteReal.querySelector('img')
    await new Promise(resolve => {
        if (img.complete) resolve()
        else { img.onload = resolve; img.onerror = resolve }
    })

    try {
        const canvas = await html2canvas(arteReal, {
            width:           1080,
            height:          1350,
            scale:           1,
            useCORS:         true,
            allowTaint:      true,
            backgroundColor: null,
            logging:         false
        })

        const link = document.createElement('a')
        link.download = `terca-pizza-${dataFmt.replace(/\//g, '-')}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()

        msgEl.style.color = '#22c55e'; msgEl.textContent = '✅ Imagem salva em 1080×1350!'
    } catch (e) {
        console.error(e)
        msgEl.style.color = '#ef4444'; msgEl.textContent = 'Erro ao gerar imagem.'
    } finally {
        document.body.removeChild(arteReal)
    }
}
