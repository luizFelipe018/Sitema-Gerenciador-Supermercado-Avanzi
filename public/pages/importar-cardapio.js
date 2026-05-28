const DIAS_SEMANA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
const TOPICOS = ['tipo_arroz', 'tipo_feijao', 'carnes', 'guarnicoes', 'massas']
const TOPICOS_LABEL = {
    tipo_arroz: 'Tipo de Arroz',
    tipo_feijao: 'Tipo de Feijão',
    carnes: 'Carnes',
    guarnicoes: 'Guarnições',
    massas: 'Massas'
}
const TOPICOS_ICON = {
    tipo_arroz: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`,
    tipo_feijao: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="6" ry="10" transform="rotate(-15 12 12)"/><path d="M8 8c2-2 4-2 6 0"/></svg>`,
    carnes: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 8l-2 2m0 0l-2 2m2-2l2-2m-2 2l-2 2m4 12a9 9 0 100-18 9 9 0 000 18z"/><circle cx="12" cy="12" r="1"/></svg>`,
    guarnicoes: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
    massas: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/></svg>`
}

let icSemanaAtual = new Date()
let icDados = {}
let icDiaAtivo = -1
let icFotoUrl = {}

function carregarImportarCardapio() {
    setActive('btn-importar-cardapio')

    icSemanaAtual = new Date()
    icDados = {}
    icDiaAtivo = -1
    icFotoUrl = {}

    renderizarPagina()
}

function getWeekStart(date) {
    const d = new Date(date)
    const day = d.getDay()
    d.setDate(d.getDate() - day)
    d.setHours(0, 0, 0, 0)
    return d
}

function formatDate(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

function formatDateBR(date) {
    const d = String(date.getDate()).padStart(2, '0')
    const m = String(date.getMonth() + 1).padStart(2, '0')
    return `${d}/${m}`
}

function renderizarPagina() {
    const weekStart = getWeekStart(icSemanaAtual)

    const dias = []
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart)
        d.setDate(d.getDate() + i)
        dias.push({ date: d, diaSemana: i, label: DIAS_SEMANA[i], dataBR: formatDateBR(d) })
    }

    setConteudo(`
        <div class="dash-glass dash-animate" style="padding:20px; margin-bottom:20px;">
            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <span style="font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.4);">Cardápio Semanal</span>
                    <button id="ic-semana-ant" style="padding:8px 12px; border:none; border-radius:8px; font-size:12px; font-weight:600; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.05); transition:all 0.3s; display:flex; align-items:center; gap:4px;"
                        onmouseenter="this.style.background='rgba(255,255,255,0.1)';this.style.color='#fff'"
                        onmouseleave="this.style.background='rgba(255,255,255,0.05)';this.style.color='rgba(255,255,255,0.6)'">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                        Anterior
                    </button>
                    <span id="ic-semana-titulo" style="font-size:14px; font-weight:600; color:rgba(255,255,255,0.8); min-width:180px; text-align:center;">${dias[0].label} ${dias[0].dataBR} - ${dias[6].label} ${dias[6].dataBR}</span>
                    <button id="ic-semana-prox" style="padding:8px 12px; border:none; border-radius:8px; font-size:12px; font-weight:600; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.05); transition:all 0.3s; display:flex; align-items:center; gap:4px;"
                        onmouseenter="this.style.background='rgba(255,255,255,0.1)';this.style.color='#fff'"
                        onmouseleave="this.style.background='rgba(255,255,255,0.05)';this.style.color='rgba(255,255,255,0.6)'">
                        Próximo
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>
                <div style="display:flex; gap:8px;">
                    <button id="ic-btn-hoje" style="padding:8px 16px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:12px; font-weight:600; color:rgba(255,255,255,0.5); cursor:pointer; background:transparent; transition:all 0.3s;"
                        onmouseenter="this.style.background='rgba(255,255,255,0.05)';this.style.color='#fff'"
                        onmouseleave="this.style.background='transparent';this.style.color='rgba(255,255,255,0.5)'">
                        Hoje
                    </button>
                    <button id="ic-btn-carregar" style="padding:8px 16px; border:none; border-radius:8px; font-size:12px; font-weight:600; color:rgba(255,255,255,0.8); cursor:pointer; background:rgba(59,130,246,0.15); transition:all 0.3s; display:flex; align-items:center; gap:4px;"
                        onmouseenter="this.style.background='rgba(59,130,246,0.25)'"
                        onmouseleave="this.style.background='rgba(59,130,246,0.15)'">
                        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                        Carregar
                    </button>
                    <button id="ic-btn-salvar" style="padding:8px 20px; border:none; border-radius:8px; font-size:12px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.transform='translateY(-2px) scale(1.03)';this.style.boxShadow='0 8px 24px rgba(181,21,21,0.4)'"
                        onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(181,21,21,0.3)'"
                        onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='translateY(-2px) scale(1.03)'">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        Salvar
                    </button>
                </div>
            </div>
        </div>

        <div id="ic-calendario" class="dash-table-wrap" style="margin-bottom:20px;"></div>

        <div id="ic-art-section" class="dash-glass dash-animate" style="padding:20px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
                <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Gerar Arte do Cardápio</span>
            </div>
            <div id="ic-dias-arte" style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px;"></div>
            <div style="display:flex; gap:10px; align-items:start; flex-wrap:wrap;">
                <div style="flex:1; min-width:180px;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                        <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <span style="font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:rgba(255,255,255,0.3);">Foto do dia</span>
                    </div>
                    <label for="ic-foto-upload" style="display:flex; align-items:center; justify-content:center; gap:6px; padding:10px; border:2px dashed rgba(255,255,255,0.06); border-radius:8px; cursor:pointer; font-size:12px; color:rgba(255,255,255,0.35); font-weight:600; transition:all 0.3s;"
                        onmouseenter="this.style.borderColor='rgba(181,21,21,0.3)';this.style.color='rgba(255,255,255,0.6)'"
                        onmouseleave="this.style.borderColor='rgba(255,255,255,0.06)';this.style.color='rgba(255,255,255,0.35)'">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Selecionar
                    </label>
                    <input id="ic-foto-upload" type="file" accept="image/*" style="display:none;">
                    <div id="ic-foto-preview" style="margin-top:6px; border-radius:8px; overflow:hidden; height:50px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center;">
                        <p style="font-size:10px; color:rgba(255,255,255,0.2);">Nenhuma</p>
                    </div>
                </div>
                <div style="display:flex; gap:8px; align-items:end;">
                    <button id="ic-btn-gerar-arte" style="padding:10px 20px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.transform='translateY(-2px) scale(1.03)';this.style.boxShadow='0 8px 24px rgba(181,21,21,0.4)'"
                        onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(181,21,21,0.3)'"
                        onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='translateY(-2px) scale(1.03)'">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        Gerar Arte
                    </button>
                    <button id="ic-btn-salvar-png" style="padding:10px 20px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#16a34a,#15803d); box-shadow:0 4px 16px rgba(22,163,74,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; gap:6px; opacity:0.4;"
                        disabled
                        onmouseenter="if(!this.disabled){this.style.transform='translateY(-2px) scale(1.03)';this.style.boxShadow='0 8px 24px rgba(22,163,74,0.4)'}"
                        onmouseleave="if(!this.disabled){this.style.transform='';this.style.boxShadow='0 4px 16px rgba(22,163,74,0.3)'}"
                        onmousedown="if(!this.disabled){this.style.transform='scale(0.97)'}" onmouseup="if(!this.disabled){this.style.transform='translateY(-2px) scale(1.03)'}">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Salvar PNG
                    </button>
                </div>
            </div>
            <div id="ic-arte-preview-wrapper" style="margin-top:14px; border-radius:12px; overflow:hidden; min-height:200px; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05);">
                <p style="color:rgba(255,255,255,0.15); font-size:12px;">Selecione um dia e clique em Gerar Arte</p>
            </div>
            <p id="ic-arte-msg" style="font-size:11px; text-align:center; min-height:16px; color:rgba(255,255,255,0.3); margin-top:8px;"></p>
        </div>

        <div id="ic-status" style="font-size:12px; color:rgba(255,255,255,0.3); margin-top:14px; text-align:center; min-height:18px;"></div>
    `, 'Importar Cardápio')

    document.getElementById('ic-semana-ant').onclick = () => {
        const d = getWeekStart(icSemanaAtual)
        d.setDate(d.getDate() - 7)
        icSemanaAtual = d
        icDados = {}
        icDiaAtivo = -1
        renderizarCalendario()
        icRenderizarSeletorDia()
    }

    document.getElementById('ic-semana-prox').onclick = () => {
        const d = getWeekStart(icSemanaAtual)
        d.setDate(d.getDate() + 7)
        icSemanaAtual = d
        icDados = {}
        icDiaAtivo = -1
        renderizarCalendario()
        icRenderizarSeletorDia()
    }

    document.getElementById('ic-btn-hoje').onclick = () => {
        icSemanaAtual = new Date()
        icDados = {}
        icDiaAtivo = -1
        renderizarCalendario()
        icRenderizarSeletorDia()
    }

    document.getElementById('ic-btn-carregar').onclick = carregarSemana
    document.getElementById('ic-btn-salvar').onclick = salvarSemana
    document.getElementById('ic-btn-gerar-arte').onclick = icGerarArte
    document.getElementById('ic-btn-salvar-png').onclick = icSalvarPNG

    document.getElementById('ic-foto-upload').onchange = (e) => {
        const file = e.target.files[0]
        if (!file || icDiaAtivo < 0) return
        const weekStart = getWeekStart(icSemanaAtual)
        const d = new Date(weekStart)
        d.setDate(d.getDate() + icDiaAtivo)
        const dataStr = formatDate(d)

        if (icFotoUrl[dataStr]) URL.revokeObjectURL(icFotoUrl[dataStr])
        icFotoUrl[dataStr] = URL.createObjectURL(file)

        const preview = document.getElementById('ic-foto-preview')
        preview.innerHTML = `<img src="${icFotoUrl[dataStr]}" style="width:100%; height:50px; object-fit:cover; border-radius:8px;">`
    }

    renderizarCalendario()
    icRenderizarSeletorDia()
}

function renderizarCalendario() {
    const weekStart = getWeekStart(icSemanaAtual)

    const dias = []
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart)
        d.setDate(d.getDate() + i)
        dias.push({ date: d, diaSemana: i, label: DIAS_SEMANA[i], dataBR: formatDateBR(d) })
    }

    document.getElementById('ic-semana-titulo').textContent = `${dias[0].label} ${dias[0].dataBR} - ${dias[6].label} ${dias[6].dataBR}`

    const hoje = new Date()
    const hojeStr = formatDate(hoje)

    const cal = document.getElementById('ic-calendario')

    let html = `<div style="overflow-x:auto;"><div style="display:grid; grid-template-columns:110px repeat(7,1fr); gap:2px; min-width:900px;">`

    html += `<div style="padding:10px; text-align:center; border-radius:8px 0 0 0; background:rgba(0,0,0,0.3);">
        <span style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Tópico</span>
    </div>`

    dias.forEach((d, i) => {
        const isHoje = formatDate(d.date) === hojeStr
        html += `<div style="padding:10px 4px; text-align:center; border-radius:${i === 6 ? '0 8px 0 0' : '0'}; ${isHoje ? 'background:rgba(181,21,21,0.12);' : ''}">
            <div style="font-size:11px; font-weight:600; color:${isHoje ? 'var(--primary)' : 'rgba(255,255,255,0.5)'};">${d.label.slice(0,3)}</div>
            <div style="font-size:12px; font-weight:700; color:${isHoje ? '#fff' : 'rgba(255,255,255,0.7)'};">${d.dataBR}</div>
        </div>`
    })

    TOPICOS.forEach(topico => {
        html += `<div style="padding:6px 8px; display:flex; align-items:center; gap:6px; font-size:11px; font-weight:600; color:rgba(255,255,255,0.5);">
            ${TOPICOS_ICON[topico]}
            ${TOPICOS_LABEL[topico]}
        </div>`

        dias.forEach((d, i) => {
            const key = `${formatDate(d.date)}-${topico}`
            const valor = icDados[key] || ''
            html += `<div style="padding:2px;">
                <textarea data-key="${key}"
                    style="width:100%; min-height:52px; padding:6px 8px; border:1px solid rgba(255,255,255,0.06); border-radius:6px; font-size:11px; line-height:1.4; color:#fafafa; background:#252525; resize:vertical; outline:none; font-family:inherit; box-sizing:border-box;"
                    onfocus="this.style.borderColor='rgba(181,21,21,0.4)'"
                    onblur="this.style.borderColor='rgba(255,255,255,0.06)'">${valor}</textarea>
            </div>`
        })
    })

    html += `</div></div>`

    cal.innerHTML = html

    cal.querySelectorAll('textarea').forEach(ta => {
        ta.oninput = () => {
            icDados[ta.getAttribute('data-key')] = ta.value
        }
    })
}

function icRenderizarSeletorDia() {
    const weekStart = getWeekStart(icSemanaAtual)
    const container = document.getElementById('ic-dias-arte')

    container.innerHTML = ''

    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart)
        d.setDate(d.getDate() + i)
        const ativo = i === icDiaAtivo
        const btn = document.createElement('button')
        btn.style.cssText = `
            padding:8px 14px; border:none; border-radius:8px; font-size:12px; font-weight:600;
            cursor:pointer; background:${ativo ? 'linear-gradient(135deg,#b51515,#8a0f0f)' : 'rgba(255,255,255,0.04)'};
            color:${ativo ? '#fff' : 'rgba(255,255,255,0.5)'};
            border:1px solid ${ativo ? 'transparent' : 'rgba(255,255,255,0.06)'};
            transition:all 0.3s; display:flex; align-items:center; gap:6px;
        `
        btn.onmouseenter = () => {
            if (!ativo) { btn.style.background = 'rgba(255,255,255,0.08)'; btn.style.color = 'rgba(255,255,255,0.8)' }
        }
        btn.onmouseleave = () => {
            if (!ativo) { btn.style.background = 'rgba(255,255,255,0.04)'; btn.style.color = 'rgba(255,255,255,0.5)' }
        }
        btn.innerHTML = `
            ${ativo ? `<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
            ${DIAS_SEMANA[i].slice(0,3)} ${formatDateBR(d)}
        `
        btn.onclick = () => {
            icDiaAtivo = i
            icRenderizarSeletorDia()
            const dataStr = formatDate(d)
            const preview = document.getElementById('ic-foto-preview')
            if (icFotoUrl[dataStr]) {
                preview.innerHTML = `<img src="${icFotoUrl[dataStr]}" style="width:100%; height:50px; object-fit:cover; border-radius:8px;">`
            } else {
                preview.innerHTML = `<p style="font-size:10px; color:rgba(255,255,255,0.2);">Nenhuma</p>`
            }
        }
        container.appendChild(btn)
    }
}

function icMontarArte(dados) {
    const { dia, data, tipo_arroz, tipo_feijao, carnes, guarnicoes, massas } = dados

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

    const dataStr = formatDate(getWeekStart(icSemanaAtual))
    const d = new Date(getWeekStart(icSemanaAtual))
    d.setDate(d.getDate() + icDiaAtivo)
    const fotoKey = formatDate(d)
    const fotoUrl = icFotoUrl[fotoKey]
    if (fotoUrl) {
        const foto = document.createElement('img')
        foto.src = fotoUrl; foto.crossOrigin = 'anonymous'
        foto.style.cssText = 'width:1080px;height:640px;object-fit:cover;position:absolute;top:0;left:0;z-index:1;'
        arte.appendChild(foto)
    }

    const ret = document.createElement('div')
    ret.style.cssText = 'width:490px;height:1350px;background:rgba(0,0,0,0.54);position:absolute;top:0;left:570px;z-index:2;'
    arte.appendChild(ret)

    const imgTexto = document.createElement('img')
    imgTexto.src = '/cardapio-overlay'
    imgTexto.crossOrigin = 'anonymous'
    imgTexto.style.cssText = 'width:1080px;height:1350px;object-fit:fill;position:absolute;top:0;left:0;z-index:3;'
    arte.appendChild(imgTexto)

    const txt = (texto, top, left, fontSize, color, bold, width) => {
        if (!texto) return
        const el = document.createElement('div')
        el.style.cssText = `
            position:absolute;top:${top}px;left:${left}px;
            font-size:${fontSize}px;color:${color};
            font-weight:${bold?'700':'400'};
            line-height:1.35;z-index:4;
            ${width ? 'width:'+width+'px;' : ''}
        `
        el.textContent = texto
        arte.appendChild(el)
    }

    const X = 615
    const W = 440

    txt(`${dia}${data ? ' ('+data+')' : ''}`, 120, X, 35, '#fff', true, W)
    txt(tipo_arroz, 250, X, 26, '#e8952a', true, W)
    txt(tipo_feijao, 370, X, 26, '#e8952a', true, W)
    txt(carnes, 520, X, 26, '#e8952a', true, W)
    txt(guarnicoes, 690, X, 26, '#e8952a', true, W)
    txt(massas, 890, X, 26, '#e8952a', true, W)

    return arte
}

function icGerarArte() {
    const msg = document.getElementById('ic-arte-msg')

    if (icDiaAtivo < 0) {
        msg.style.color = '#ef4444'
        msg.textContent = 'Selecione um dia da semana primeiro.'
        return
    }

    const weekStart = getWeekStart(icSemanaAtual)
    const d = new Date(weekStart)
    d.setDate(d.getDate() + icDiaAtivo)
    const dataStr = formatDate(d)

    const dados = {
        dia: DIAS_SEMANA[icDiaAtivo],
        data: formatDateBR(d),
        tipo_arroz: icDados[`${dataStr}-tipo_arroz`] || '',
        tipo_feijao: icDados[`${dataStr}-tipo_feijao`] || '',
        carnes: icDados[`${dataStr}-carnes`] || '',
        guarnicoes: icDados[`${dataStr}-guarnicoes`] || '',
        massas: icDados[`${dataStr}-massas`] || ''
    }

    const ORIG_W = 1080
    const ORIG_H = 1350
    const wrapper = document.getElementById('ic-arte-preview-wrapper')
    const scale = wrapper.offsetWidth / ORIG_W

    wrapper.innerHTML = ''
    wrapper.style.height = (ORIG_H * scale) + 'px'
    wrapper.style.position = 'relative'
    wrapper.style.overflow = 'hidden'

    const preview = icMontarArte(dados)
    preview.id = 'ic-arte-preview'
    preview.style.position = 'absolute'
    preview.style.top = '0'
    preview.style.left = '0'
    preview.style.transformOrigin = 'top left'
    preview.style.transform = `scale(${scale})`
    wrapper.appendChild(preview)

    const btnSalvar = document.getElementById('ic-btn-salvar-png')
    btnSalvar.disabled = false
    btnSalvar.style.opacity = '1'

    msg.style.color = '#22c55e'
    msg.textContent = `✅ Arte de ${dados.dia} gerada!`
}

async function icSalvarPNG() {
    const msg = document.getElementById('ic-arte-msg')

    const weekStart = getWeekStart(icSemanaAtual)
    const d = new Date(weekStart)
    d.setDate(d.getDate() + icDiaAtivo)
    const dataStr = formatDate(d)

    const dados = {
        dia: DIAS_SEMANA[icDiaAtivo],
        data: formatDateBR(d),
        tipo_arroz: icDados[`${dataStr}-tipo_arroz`] || '',
        tipo_feijao: icDados[`${dataStr}-tipo_feijao`] || '',
        carnes: icDados[`${dataStr}-carnes`] || '',
        guarnicoes: icDados[`${dataStr}-guarnicoes`] || '',
        massas: icDados[`${dataStr}-massas`] || ''
    }

    if (!dados.tipo_arroz && !dados.carnes) {
        msg.style.color = '#ef4444'
        msg.textContent = 'Gere a arte primeiro.'
        return
    }

    msg.style.color = 'rgba(255,255,255,0.4)'
    msg.textContent = 'Gerando imagem 1080×1350...'

    if (!window.html2canvas) {
        await new Promise((resolve, reject) => {
            const s = document.createElement('script')
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
            s.onload = resolve; s.onerror = reject
            document.head.appendChild(s)
        })
    }

    const arteReal = icMontarArte(dados)
    arteReal.style.position = 'fixed'
    arteReal.style.top = '-9999px'
    arteReal.style.left = '-9999px'
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

        const link = document.createElement('a')
        const nome = dados.dia.replace(/[^a-z0-9]/gi, '-').toLowerCase()
        link.download = `cardapio-${nome}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()

        msg.style.color = '#22c55e'
        msg.textContent = '✅ Salvo em 1080×1350!'
    } catch (e) {
        console.error(e)
        msg.style.color = '#ef4444'
        msg.textContent = 'Erro ao gerar imagem.'
    } finally {
        document.body.removeChild(arteReal)
    }
}

async function carregarSemana() {
    const weekStart = getWeekStart(icSemanaAtual)
    const semanaISO = formatDate(weekStart)
    const status = document.getElementById('ic-status')
    status.style.color = 'rgba(255,255,255,0.4)'
    status.textContent = 'Carregando...'

    try {
        const res = await fetch(API+`/cardapio-semanal?data_inicio=${semanaISO}`, {
            headers: authHeaders()
        })

        if (!res.ok) {
            const err = await res.json()
            status.style.color = '#ef4444'
            status.textContent = `Erro: ${err.error}`
            return
        }

        const rows = await res.json()

        if (!rows.length) {
            status.style.color = 'rgba(255,255,255,0.3)'
            status.textContent = 'Nenhum cardápio encontrado para esta semana.'
            return
        }

        icDados = {}
        for (const row of rows) {
            const d = new Date(weekStart)
            d.setDate(d.getDate() + row.dia_semana)
            const dataStr = formatDate(d)

            for (const topico of TOPICOS) {
                if (row[topico]) {
                    icDados[`${dataStr}-${topico}`] = row[topico]
                }
            }
        }

        renderizarCalendario()

        status.style.color = '#22c55e'
        status.textContent = `✅ Cardápio carregado (${rows.length} dia(s))!`
    } catch (e) {
        status.style.color = '#ef4444'
        status.textContent = `Erro ao conectar: ${e.message}`
    }
}

async function salvarSemana() {
    const weekStart = getWeekStart(icSemanaAtual)
    const semanaISO = formatDate(weekStart)
    const status = document.getElementById('ic-status')
    status.style.color = 'rgba(255,255,255,0.4)'
    status.textContent = 'Salvando...'

    const dias = []
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart)
        d.setDate(d.getDate() + i)
        const dataStr = formatDate(d)

        dias.push({
            dia_semana: i,
            tipo_arroz: icDados[`${dataStr}-tipo_arroz`] || '',
            tipo_feijao: icDados[`${dataStr}-tipo_feijao`] || '',
            carnes: icDados[`${dataStr}-carnes`] || '',
            guarnicoes: icDados[`${dataStr}-guarnicoes`] || '',
            massas: icDados[`${dataStr}-massas`] || ''
        })
    }

    try {
        const res = await fetch(API+'/cardapio-semanal', {
            method: 'POST',
            headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
            body: JSON.stringify({ data_inicio: semanaISO, dias })
        })

        if (!res.ok) {
            const err = await res.json()
            status.style.color = '#ef4444'
            status.textContent = `Erro: ${err.error}`
            return
        }

        status.style.color = '#22c55e'
        status.textContent = '✅ Cardápio salvo com sucesso!'
    } catch (e) {
        status.style.color = '#ef4444'
        status.textContent = `Erro ao conectar: ${e.message}`
    }
}
