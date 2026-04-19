const CP_KEY      = 'cardapioDados'
const GRILL_FIXO  = ''
let cpSemanaAtual = [] // array de 7 cardápios importados
let cpFotoUrl     = null
let cpDiaAtivo    = 0

function carregarCardapio() {
    setActive('btn-cardapio')
    setConteudo(`
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <!-- Coluna esquerda: controles -->
            <div class="flex flex-col gap-4">

                <!-- Importar docx -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                        📄 Importar Cardápio (.docx)
                    </label>
                    <p class="text-xs text-gray-400 mb-3">Selecione o arquivo Word com a tabela semanal do cardápio.</p>
                    <label for="cp-docx-upload" class="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-red-300 hover:bg-red-50 transition-all text-sm text-gray-500 hover:text-red-600 font-semibold mb-2">
                        📁 Selecionar arquivo .docx
                    </label>
                    <input id="cp-docx-upload" type="file" accept=".docx" style="display:none;">
                    <p id="cp-docx-status" class="text-xs text-gray-400 text-center min-h-[16px]"></p>
                </div>

                <!-- Seletor de dia -->
                <div id="cp-seletor-dias" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5" style="display:none;">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">Selecionar Dia</label>
                    <div id="cp-dias-btns" class="flex flex-col gap-2"></div>
                </div>

                <!-- Foto de fundo -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">📷 Foto de Fundo</label>
                    <p class="text-xs text-gray-400 mb-3">Selecione a foto do prato principal do dia.</p>
                    <label for="cp-foto-upload" class="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-red-300 hover:bg-red-50 transition-all text-sm text-gray-500 hover:text-red-600 font-semibold mb-2">
                        📁 Selecionar imagem
                    </label>
                    <input id="cp-foto-upload" type="file" accept="image/*" style="display:none;">
                    <div id="cp-foto-preview" class="rounded-lg overflow-hidden" style="height:80px; background:#f3f4f6; display:flex; align-items:center; justify-content:center;">
                        <p class="text-xs text-gray-400">Nenhuma foto</p>
                    </div>
                </div>

                <!-- Botões -->
                <div class="flex gap-3">
                    <button id="cp-btn-gerar" class="flex-1 py-3 text-white font-semibold rounded-lg text-sm" style="background:#b51515;">
                        🎨 Gerar Arte
                    </button>
                    <button id="cp-btn-salvar" class="flex-1 py-3 text-white font-semibold rounded-lg text-sm opacity-40 cursor-not-allowed" style="background:#1a1a2e;" disabled>
                        💾 Salvar PNG
                    </button>
                </div>
                <p id="cp-msg" class="text-xs text-center min-h-[16px]"></p>

            </div>

            <!-- Preview -->
            <div class="lg:col-span-2 flex flex-col gap-3">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preview</p>
                <div id="cp-preview-wrapper" class="relative rounded-xl overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center" style="min-height:400px;">
                    <p class="text-gray-400 text-sm">Importe o .docx e selecione o dia</p>
                </div>
            </div>

        </div>
    `, 'Cardápio Restaurante')

    cpFotoUrl = null
    cpDiaAtivo = 0

    // Upload docx
    document.getElementById('cp-docx-upload').onchange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        const status = document.getElementById('cp-docx-status')
        status.style.color = '#6b7280'; status.textContent = 'Lendo arquivo...'

        const formData = new FormData()
        formData.append('file', file)

        try {
            const res  = await fetch('http://localhost:3000/cardapio/importar-docx', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            })
            const data = await res.json()

            if (!res.ok || data.erro) {
                status.style.color = '#dc2626'; status.textContent = data.erro || data.error || 'Erro ao ler arquivo.'
                return
            }

            cpSemanaAtual = data
            status.style.color = '#16a34a'; status.textContent = `✅ ${data.length} dia(s) importado(s)!`
            cpRenderizarDias()

        } catch (e) {
            status.style.color = '#dc2626'; status.textContent = 'Erro ao conectar.'
            console.error(e)
        }
    }

    // Upload foto
    document.getElementById('cp-foto-upload').onchange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (cpFotoUrl) URL.revokeObjectURL(cpFotoUrl)
        cpFotoUrl = URL.createObjectURL(file)
        const preview = document.getElementById('cp-foto-preview')
        preview.innerHTML = `<img src="${cpFotoUrl}" style="width:100%; height:80px; object-fit:cover;">`
    }

    document.getElementById('cp-btn-gerar').onclick  = cpGerarArte
    document.getElementById('cp-btn-salvar').onclick = cpSalvarPNG
}

function cpRenderizarDias() {
    const seletor = document.getElementById('cp-seletor-dias')
    const btns    = document.getElementById('cp-dias-btns')
    seletor.style.display = 'block'

    btns.innerHTML = cpSemanaAtual.map((d, i) => `
        <button class="cp-dia-btn w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all ${i === cpDiaAtivo ? 'text-white border-red-700' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}"
            style="${i === cpDiaAtivo ? 'background:#b51515;' : ''}"
            data-idx="${i}">
            ${d.dia} ${d.data ? '(' + d.data + ')' : ''}
        </button>
    `).join('')

    btns.querySelectorAll('.cp-dia-btn').forEach(btn => {
        btn.onclick = () => {
            cpDiaAtivo = parseInt(btn.getAttribute('data-idx'))
            cpRenderizarDias()
        }
    })
}

function cpMontarArte(dados, fotoUrl) {
    const { dia, data, carnes, guarnicoes, massas, grill } = dados

    const arte = document.createElement('div')
    arte.style.cssText = `
        width:1080px; height:1350px; position:relative;
        overflow:hidden; font-family:'Segoe UI',Arial,sans-serif;
    `

    // 1. Fundo (Cardápio OK1.png)
    const fundo = document.createElement('img')
    fundo.src = 'http://localhost:3000/cardapio-fundo'
    fundo.crossOrigin = 'anonymous'
    fundo.style.cssText = 'width:1080px;height:1350px;object-fit:cover;position:absolute;top:0;left:0;z-index:0;'
    arte.appendChild(fundo)

    // 2. Foto do prato (img-card) — topo, largura total, 640px de altura
    if (fotoUrl) {
        const foto = document.createElement('img')
        foto.src = fotoUrl; foto.crossOrigin = 'anonymous'
        foto.style.cssText = 'width:1080px;height:640px;object-fit:cover;position:absolute;top:0;left:0;z-index:1;'
        arte.appendChild(foto)
    }

    // 3. Overlay lateral escuro (ret) — coluna direita
    const ret = document.createElement('div')
    ret.style.cssText = 'width:490px;height:1350px;background:rgba(0, 0, 0, 0.54);position:absolute;top:0;left:570px;z-index:2;'
    arte.appendChild(ret)

    // 4. Imagem de texto (Cardápio texto.png / overlay)
    const imgTexto = document.createElement('img')
    imgTexto.src = 'http://localhost:3000/cardapio-overlay'
    imgTexto.crossOrigin = 'anonymous'
    imgTexto.style.cssText = 'width:1080px;height:1350px;object-fit:fill;position:absolute;top:0;left:0;z-index:3;'
    arte.appendChild(imgTexto)

    // 5. Textos do cardápio — em cima de tudo (z-index:4)
    const txt = (texto, top, left, fontSize, color, bold, width) => {
        if (!texto || (Array.isArray(texto) && !texto.length)) return
        const el = document.createElement('div')
        el.style.cssText = `
            position:absolute;top:${top}px;left:${left}px;
            font-size:${fontSize}px;color:${color};
            font-weight:${bold?'700':'400'};
            line-height:1.35;z-index:4;
            ${width ? 'width:'+width+'px;' : ''}
        `
        el.innerHTML = Array.isArray(texto) ? texto.join('<br>') : texto
        arte.appendChild(el)
    }

    // Posições baseadas na medição dos títulos no overlay (468px wide, começa em left:612)
    // Títulos encontrados em: Cardápio=39-113, Carnes=217-266, Guarnicoes=452-501, Massa=829-877, Grill=1014-1064
    const X = 615   // início dos textos (980 - 468 + 50px margem)
    const W = 440   // largura máxima dos textos

    // Dia + Data — abaixo do título "Cardápio" (termina em y=113)
    txt(`${dia}${data ? ' ('+data+')' : ''}`, 120, X, 35, '#fff', true, W)

    // Carnes — abaixo do título "Carnes" (termina em y=266)
    txt(carnes, 320, X, 30, '#e8952a', true, W)

    // Guarnições — abaixo do título "Guarnições" (termina em y=501)
    txt(guarnicoes, 540, X, 30, '#e8952a', true, W)

    // Massa — abaixo do título "Massa" (termina em y=877)
    txt(massas, 905, X, 30, '#e8952a', true, W)

    // Grill — abaixo do título "Grill" (termina em y=1064)
    txt(grill || GRILL_FIXO, 1070, X, 13, '#e8952a', true, W)

    return arte
}


function cpGerarArte() {
    const msg = document.getElementById('cp-msg')

    if (!cpSemanaAtual.length) {
        msg.style.color = '#dc2626'; msg.textContent = 'Importe o arquivo .docx primeiro.'
        return
    }

    const dados   = cpSemanaAtual[cpDiaAtivo]
    const ORIG_W  = 1080
    const ORIG_H  = 1350
    const wrapper = document.getElementById('cp-preview-wrapper')
    const scale   = wrapper.offsetWidth / ORIG_W

    wrapper.innerHTML = ''
    wrapper.style.height        = (ORIG_H * scale) + 'px'
    wrapper.style.position      = 'relative'
    wrapper.style.overflow      = 'hidden'

    const preview = cpMontarArte(dados, cpFotoUrl)
    preview.id = 'cp-arte-preview'
    preview.style.position       = 'absolute'
    preview.style.top            = '0'
    preview.style.left           = '0'
    preview.style.transformOrigin = 'top left'
    preview.style.transform      = `scale(${scale})`
    wrapper.appendChild(preview)

    const btnSalvar = document.getElementById('cp-btn-salvar')
    btnSalvar.disabled = false
    btnSalvar.classList.remove('opacity-40', 'cursor-not-allowed')

    msg.style.color = '#16a34a'
    msg.textContent = `✅ Arte do ${dados.dia} gerada! Clique em Salvar PNG.`
}

async function cpSalvarPNG() {
    const msg  = document.getElementById('cp-msg')
    const dados = cpSemanaAtual[cpDiaAtivo]
    if (!dados) { msg.style.color = '#dc2626'; msg.textContent = 'Gere a arte primeiro.'; return }

    msg.style.color = '#6b7280'; msg.textContent = 'Gerando imagem 1080×1350...'

    if (!window.html2canvas) {
        await new Promise((resolve, reject) => {
            const s = document.createElement('script')
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
            s.onload = resolve; s.onerror = reject
            document.head.appendChild(s)
        })
    }

    const arteReal = cpMontarArte(dados, cpFotoUrl)

    arteReal.style.position  = 'fixed'
    arteReal.style.top       = '-9999px'
    arteReal.style.left      = '-9999px'
    arteReal.style.transform = 'none'
    document.body.appendChild(arteReal)

    const imgs = arteReal.querySelectorAll('img')
    await Promise.all([...imgs].map(img => new Promise(res => {
        if (img.complete) res(); else { img.onload = res; img.onerror = res }
    })))

    try {
        const canvas = await html2canvas(arteReal, {
            width: 1080, height: 1350, scale: 1,
            useCORS: true, allowTaint: true,
            backgroundColor: '#7a1a0a', logging: false
        })

        const link  = document.createElement('a')
        const nome  = (dados.dia + (dados.data ? '-' + dados.data.replace('/','-') : '')).replace(/\s/g, '-')
        link.download = `cardapio-${nome}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()

        msg.style.color = '#16a34a'; msg.textContent = '✅ Salvo em 1080×1350!'
    } catch (e) {
        console.error(e)
        msg.style.color = '#dc2626'; msg.textContent = 'Erro ao gerar imagem.'
    } finally {
        document.body.removeChild(arteReal)
    }
}