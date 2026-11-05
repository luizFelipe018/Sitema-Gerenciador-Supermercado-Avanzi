const CP_KEY      = 'cardapioDados'
const GRILL_FIXO  = ''
let cpSemanaAtual = []
let cpFotoUrl     = null
let cpDiaAtivo    = 0

function carregarCardapio() {
    setActive('btn-cardapio')
    setConteudo(`
        <div style="display:grid; grid-template-columns:1fr 2fr; gap:20px;">

            <!-- Coluna esquerda: controles -->
            <div style="display:flex; flex-direction:column; gap:16px;">

                <!-- Importar docx -->
                <div class="dash-glass dash-animate" style="padding:20px;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                        <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                        <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Importar Cardápio (.docx)</span>
                    </div>
                    <p style="font-size:12px; color:rgba(255,255,255,0.3); margin-bottom:12px;">Selecione o arquivo Word com a tabela semanal do cardápio.</p>
                    <label for="cp-docx-upload" style="display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:14px; border:2px dashed rgba(255,255,255,0.08); border-radius:10px; cursor:pointer; transition:all 0.3s; font-size:13px; color:rgba(255,255,255,0.4); font-weight:600; box-sizing:border-box;"
                        onmouseenter="this.style.borderColor='rgba(181,21,21,0.3)';this.style.background='rgba(181,21,21,0.05)';this.style.color='rgba(255,255,255,0.7)'"
                        onmouseleave="this.style.borderColor='rgba(255,255,255,0.08)';this.style.background='transparent';this.style.color='rgba(255,255,255,0.4)'">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Selecionar arquivo .docx
                    </label>
                    <input id="cp-docx-upload" type="file" accept=".docx" style="display:none;">
                    <p id="cp-docx-status" style="font-size:11px; color:rgba(255,255,255,0.3); text-align:center; min-height:16px; margin-top:8px;"></p>
                </div>

                <!-- Seletor de dia -->
                <div id="cp-seletor-dias" class="dash-glass dash-animate" style="padding:20px; display:none;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                        <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Selecionar Dia</span>
                    </div>
                    <div id="cp-dias-btns" style="display:flex; flex-direction:column; gap:6px;"></div>
                </div>

                <!-- Foto de fundo -->
                <div class="dash-glass dash-animate" style="padding:20px;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                        <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Foto de Fundo</span>
                    </div>
                    <p style="font-size:12px; color:rgba(255,255,255,0.3); margin-bottom:12px;">Selecione a foto do prato principal do dia.</p>
                    <label for="cp-foto-upload" style="display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:14px; border:2px dashed rgba(255,255,255,0.08); border-radius:10px; cursor:pointer; transition:all 0.3s; font-size:13px; color:rgba(255,255,255,0.4); font-weight:600; box-sizing:border-box;"
                        onmouseenter="this.style.borderColor='rgba(181,21,21,0.3)';this.style.background='rgba(181,21,21,0.05)';this.style.color='rgba(255,255,255,0.7)'"
                        onmouseleave="this.style.borderColor='rgba(255,255,255,0.08)';this.style.background='transparent';this.style.color='rgba(255,255,255,0.4)'">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Selecionar imagem
                    </label>
                    <input id="cp-foto-upload" type="file" accept="image/*" style="display:none;">
                    <div id="cp-foto-preview" style="margin-top:10px; border-radius:10px; overflow:hidden; height:80px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:center;">
                        <p style="font-size:11px; color:rgba(255,255,255,0.3);">Nenhuma foto</p>
                    </div>
                </div>

                <!-- Botões -->
                <div style="display:flex; gap:10px;">
                    <button id="cp-btn-gerar" style="flex:1; padding:12px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; justify-content:center; gap:6px;"
                        onmouseenter="this.style.transform='translateY(-2px) scale(1.02)';this.style.boxShadow='0 8px 24px rgba(181,21,21,0.4)'"
                        onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(181,21,21,0.3)'"
                        onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='translateY(-2px) scale(1.02)'">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        Gerar Arte
                    </button>
                    <button id="cp-btn-salvar" style="flex:1; padding:12px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#16a34a,#15803d); box-shadow:0 4px 16px rgba(22,163,74,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; justify-content:center; gap:6px; opacity:0.4;"
                        disabled
                        onmouseenter="if(!this.disabled){this.style.transform='translateY(-2px) scale(1.02)';this.style.boxShadow='0 8px 24px rgba(22,163,74,0.4)'}"
                        onmouseleave="if(!this.disabled){this.style.transform='';this.style.boxShadow='0 4px 16px rgba(22,163,74,0.3)'}"
                        onmousedown="if(!this.disabled){this.style.transform='scale(0.97)'}" onmouseup="if(!this.disabled){this.style.transform='translateY(-2px) scale(1.02)'}">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Salvar PNG
                    </button>
                </div>
                <p id="cp-msg" style="font-size:11px; text-align:center; min-height:16px; color:rgba(255,255,255,0.3);"></p>

            </div>

            <!-- Preview -->
            <div style="display:flex; flex-direction:column; gap:12px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                    <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Preview</span>
                </div>
                <div id="cp-preview-wrapper" class="dash-glass" style="flex:1; min-height:400px; display:flex; align-items:center; justify-content:center; border-radius:16px; overflow:hidden;">
                    <p style="color:rgba(255,255,255,0.25); font-size:13px;">Importe o .docx e selecione o dia</p>
                </div>
            </div>

        </div>
    `, 'Cardápio Restaurante')

    cpFotoUrl = null
    cpDiaAtivo = 0

    document.getElementById('cp-docx-upload').onchange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        const status = document.getElementById('cp-docx-status')
        status.style.color = 'rgba(255,255,255,0.4)'; status.textContent = 'Lendo arquivo...'

        const formData = new FormData()
        formData.append('file', file)

        try {
            const res  = await fetch(API+'/cardapio/importar-docx', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            })
            const data = await res.json()

            if (!res.ok || data.erro) {
                status.style.color = '#ef4444'; status.textContent = data.erro || data.error || 'Erro ao ler arquivo.'
                return
            }

            cpSemanaAtual = data
            status.style.color = '#22c55e'; status.textContent = `✅ ${data.length} dia(s) importado(s)!`
            cpRenderizarDias()

        } catch (e) {
            status.style.color = '#ef4444'; status.textContent = 'Erro ao conectar.'
        }
    }

    document.getElementById('cp-foto-upload').onchange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (cpFotoUrl) URL.revokeObjectURL(cpFotoUrl)
        cpFotoUrl = URL.createObjectURL(file)
        const preview = document.getElementById('cp-foto-preview')
        preview.innerHTML = `<img src="${cpFotoUrl}" style="width:100%; height:80px; object-fit:cover; border-radius:10px;">`
    }

    document.getElementById('cp-btn-gerar').onclick  = cpGerarArte
    document.getElementById('cp-btn-salvar').onclick = cpSalvarPNG
}

function cpRenderizarDias() {
    const seletor = document.getElementById('cp-seletor-dias')
    const btns    = document.getElementById('cp-dias-btns')
    seletor.style.display = 'block'

    btns.innerHTML = cpSemanaAtual.map((d, i) => {
        const ativo = i === cpDiaAtivo
        return `<button class="cp-dia-btn" data-idx="${i}"
            style="width:100%; text-align:left; padding:10px 14px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; border:1px solid ${ativo ? 'var(--primary)' : 'rgba(255,255,255,0.06)'}; background:${ativo ? 'linear-gradient(135deg,var(--primary),var(--primary-dark))' : 'rgba(255,255,255,0.03)'}; color:${ativo ? '#fff' : 'rgba(255,255,255,0.5)'}; transition:all 0.3s; display:flex; align-items:center; gap:8px;"
            onmouseenter="if(!this.disabled&&!${ativo}){this.style.background='rgba(255,255,255,0.06)';this.style.color='rgba(255,255,255,0.8)'}"
            onmouseleave="if(!this.disabled&&!${ativo}){this.style.background='rgba(255,255,255,0.03)';this.style.color='rgba(255,255,255,0.5)'}">
            ${ativo ? `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>` : `<span style="width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,0.2);display:inline-block;"></span>`}
            ${d.dia}${d.data ? ' (' + d.data + ')' : ''}
        </button>`
    }).join('')

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

    const fundo = document.createElement('img')
    fundo.src = '/cardapio-fundo'
    fundo.crossOrigin = 'anonymous'
    fundo.style.cssText = 'width:1080px;height:1350px;object-fit:cover;position:absolute;top:0;left:0;z-index:0;'
    arte.appendChild(fundo)

    if (fotoUrl) {
        const foto = document.createElement('img')
        foto.src = fotoUrl; foto.crossOrigin = 'anonymous'
        foto.style.cssText = 'width:1080px;height:640px;object-fit:cover;position:absolute;top:0;left:0;z-index:1;'
        arte.appendChild(foto)
    }

    const ret = document.createElement('div')
    ret.style.cssText = 'width:490px;height:1350px;background:rgba(0, 0, 0, 0.54);position:absolute;top:0;left:570px;z-index:2;'
    arte.appendChild(ret)

    const imgTexto = document.createElement('img')
    imgTexto.src = '/cardapio-overlay'
    imgTexto.crossOrigin = 'anonymous'
    imgTexto.style.cssText = 'width:1080px;height:1350px;object-fit:fill;position:absolute;top:0;left:0;z-index:3;'
    arte.appendChild(imgTexto)

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

    const X = 615
    const W = 440

    txt(`${dia}${data ? ' ('+data+')' : ''}`, 120, X, 35, '#fff', true, W)

    txt(carnes, 320, X, 30, '#e8952a', true, W)

    txt(guarnicoes, 540, X, 30, '#e8952a', true, W)

    txt(massas, 905, X, 30, '#e8952a', true, W)

    txt(grill || GRILL_FIXO, 1070, X, 13, '#e8952a', true, W)

    return arte
}


function cpGerarArte() {
    const msg = document.getElementById('cp-msg')

    if (!cpSemanaAtual.length) {
        msg.style.color = '#ef4444'; msg.textContent = 'Importe o arquivo .docx primeiro.'
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
    btnSalvar.style.opacity = '1'

    msg.style.color = '#22c55e'
    msg.textContent = `✅ Arte do ${dados.dia} gerada! Clique em Salvar PNG.`
}

async function cpSalvarPNG() {
    const msg  = document.getElementById('cp-msg')
    const dados = cpSemanaAtual[cpDiaAtivo]
    if (!dados) { msg.style.color = '#ef4444'; msg.textContent = 'Gere a arte primeiro.'; return }

    msg.style.color = 'rgba(255,255,255,0.4)'; msg.textContent = 'Gerando imagem 1080×1350...'

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

        msg.style.color = '#22c55e'; msg.textContent = '✅ Salvo em 1080×1350!'
    } catch (e) {
        console.error(e)
        msg.style.color = '#ef4444'; msg.textContent = 'Erro ao gerar imagem.'
    } finally {
        document.body.removeChild(arteReal)
    }
}
