// Chave do localStorage para persistir os dados
const TP_STORAGE_KEY = 'tercaPizzaDados'

function carregarTercaPizza() {
    setActive('btn-terca-pizza')
    setConteudo(`
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <!-- Painel esquerdo: controles -->
            <div class="flex flex-col gap-5">

                <!-- Data -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Data da Oferta</label>
                    <input id="tp-data" type="date"
                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
                </div>

                <!-- Lista de pizzas -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                        Lista de Pizzas
                    </label>
                    <p class="text-xs text-gray-400 mb-3">Cole do Excel no formato: <code class="bg-gray-100 px-1 rounded">Nome [TAB] Preço</code></p>
                    <textarea id="tp-lista" rows="10" placeholder="Mortadela 872G&#9;16,90&#10;Frango C.Requeijão 975G&#9;28,90&#10;Moda da Casa 1142G&#9;36,90"
                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-red-400 resize-none"></textarea>
                </div>

                <!-- Botões -->
                <div class="flex gap-3">
                    <button id="tp-btn-gerar" class="flex-1 py-3 text-white font-semibold rounded-lg text-sm" style="background:#b51515;">
                        🎨 Gerar Arte
                    </button>
                    <button id="tp-btn-salvar" class="flex-1 py-3 text-white font-semibold rounded-lg text-sm opacity-40 cursor-not-allowed" style="background:#1a1a2e;" disabled>
                        💾 Salvar PNG
                    </button>
                    <button id="tp-btn-limpar" class="py-3 px-4 font-semibold rounded-lg text-sm border border-gray-200 text-gray-500 hover:bg-gray-50">
                        🗑 Limpar
                    </button>
                </div>
                <p id="tp-msg" class="text-xs text-center min-h-[16px]"></p>

            </div>

            <!-- Painel direito: preview da arte -->
            <div class="flex flex-col gap-3">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preview</p>
                <div id="tp-preview-wrapper" class="relative rounded-xl overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center" style="min-height:400px;">
                    <p class="text-gray-400 text-sm" id="tp-placeholder">Clique em "Gerar Arte" para visualizar</p>
                </div>
            </div>

        </div>
    `, 'Terça da Pizza')

    // Restaura dados salvos
    const salvo = carregarDadosSalvos()
    if (salvo) {
        if (salvo.data)  document.getElementById('tp-data').value  = salvo.data
        if (salvo.lista) document.getElementById('tp-lista').value = salvo.lista
        // Se tinha arte gerada, regera automaticamente
        if (salvo.data && salvo.lista) {
            gerarArtePizza(true) // true = silencioso (não mostra msg)
        }
    }

    // Salva automaticamente enquanto digita
    document.getElementById('tp-data').onchange  = salvarDados
    document.getElementById('tp-lista').oninput  = salvarDados

    document.getElementById('tp-btn-gerar').onclick  = () => gerarArtePizza(false)
    document.getElementById('tp-btn-salvar').onclick  = salvarArtePizza
    document.getElementById('tp-btn-limpar').onclick  = limparTercaPizza
}

// ── PERSISTÊNCIA ──────────────────────────────────────
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
        `<p class="text-gray-400 text-sm">Clique em "Gerar Arte" para visualizar</p>`
    const btnSalvar = document.getElementById('tp-btn-salvar')
    btnSalvar.disabled = true
    btnSalvar.classList.add('opacity-40', 'cursor-not-allowed')
    document.getElementById('tp-msg').textContent = ''
}

// ── PARSE ─────────────────────────────────────────────
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

// Formata a data do input type=date (YYYY-MM-DD) para DD/MM/AA
function formatarData(dateStr) {
    if (!dateStr) return ''
    const [ano, mes, dia] = dateStr.split('-')
    return `${dia}/${mes}/${ano.slice(2)}`
}

// ── MONTAR ARTE ───────────────────────────────────────
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
    fundo.src = 'http://localhost:3000/terca-pizza-fundo'
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

// ── GERAR PREVIEW ─────────────────────────────────────
function gerarArtePizza(silencioso = false) {
    const lista  = document.getElementById('tp-lista')?.value || ''
    const data   = document.getElementById('tp-data')?.value  || ''
    const msgEl  = document.getElementById('tp-msg')
    const pizzas = parsePizzas(lista)
    const dataFmt = formatarData(data)

    if (!pizzas.length) {
        if (!silencioso) { msgEl.style.color = '#dc2626'; msgEl.textContent = 'Cole a lista de pizzas primeiro.' }
        return
    }
    if (!dataFmt) {
        if (!silencioso) { msgEl.style.color = '#dc2626'; msgEl.textContent = 'Selecione a data da oferta.' }
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
        btnSalvar.classList.remove('opacity-40', 'cursor-not-allowed')
    }

    if (!silencioso && msgEl) {
        msgEl.style.color = '#16a34a'
        msgEl.textContent = '✅ Arte gerada! Clique em Salvar PNG para exportar em 1080×1350.'
    }

    salvarDados()
}

// ── EXPORTAR PNG ──────────────────────────────────────
async function salvarArtePizza() {
    const msgEl  = document.getElementById('tp-msg')
    const data   = document.getElementById('tp-data')?.value  || ''
    const lista  = document.getElementById('tp-lista')?.value || ''
    const pizzas = parsePizzas(lista)
    const dataFmt = formatarData(data)

    if (!pizzas.length || !dataFmt) {
        msgEl.style.color = '#dc2626'; msgEl.textContent = 'Gere a arte primeiro.'
        return
    }

    msgEl.style.color = '#6b7280'; msgEl.textContent = 'Gerando imagem em 1080×1350...'

    if (!window.html2canvas) {
        await new Promise((resolve, reject) => {
            const s = document.createElement('script')
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
            s.onload = resolve; s.onerror = reject
            document.head.appendChild(s)
        })
    }

    // Cria elemento nas dimensões reais fora da tela
    const arteReal = montarArte(pizzas, dataFmt)
    arteReal.style.position  = 'fixed'
    arteReal.style.top       = '-9999px'
    arteReal.style.left      = '-9999px'
    arteReal.style.transform = 'none'
    document.body.appendChild(arteReal)

    // Aguarda imagem de fundo carregar
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

        msgEl.style.color = '#16a34a'; msgEl.textContent = '✅ Imagem salva em 1080×1350!'
    } catch (e) {
        console.error(e)
        msgEl.style.color = '#dc2626'; msgEl.textContent = 'Erro ao gerar imagem.'
    } finally {
        document.body.removeChild(arteReal)
    }
}