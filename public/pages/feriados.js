/* ═══════════════════════════════════════════════════════════════
   FERIADOS NACIONAIS — tela completa
   Destaque do próximo feriado + KPIs + lista agrupada por mês.
   Fonte: brasilapi.com.br (online); se cair, calcula localmente
   (datas móveis = algoritmo de Tondering, validado).
   ═══════════════════════════════════════════════════════════════ */

let ferAno = new Date().getFullYear()
let ferCache = null

// ── fallback 100% local (validado contra dateutil, 2020-2045) ──
function ferPascoa(year) {
    const g = year % 19
    const c = Math.floor(year / 100)
    const h = (c - Math.floor(c / 4) - Math.floor((8 * c + 13) / 25) + 19 * g + 15) % 30
    const i = h - Math.floor(h / 28) * (1 - Math.floor(h / 28) * Math.floor(29 / (h + 1)) * Math.floor((21 - g) / 11))
    const j = (year + Math.floor(year / 4) + i + 2 - c + Math.floor(c / 4)) % 7
    const p = i - j
    const d = 1 + ((p + 27 + Math.floor((p + 6) / 40)) % 31)
    const m = 3 + Math.floor((p + 26) / 30)
    return new Date(year, m - 1, d)
}
function ferPad(n) { return String(n).padStart(2, '0') }
function feriso(d) { return d.getFullYear() + '-' + ferPad(d.getMonth() + 1) + '-' + ferPad(d.getDate()) }
function feriadosNacionaisLocal(ano) {
    const p = ferPascoa(ano)
    const iso = d => feriso(new Date(d.getFullYear(), d.getMonth(), d.getDate()))
    const fixos = [
        ['01-01', 'Confraternização Universal'],
        ['04-21', 'Tiradentes'],
        ['05-01', 'Dia do Trabalho'],
        ['09-07', 'Independência do Brasil'],
        ['10-12', 'Nossa Senhora Aparecida'],
        ['11-02', 'Finados'],
        ['11-15', 'Proclamação da República'],
        ['11-20', 'Dia da Consciência Negra'],
        ['12-25', 'Natal']
    ].map(([md, name]) => ({ date: ano + '-' + md, name, type: 'national' }))
    const moveis = [
        [-48, 'Carnaval (segunda-feira)'],
        [-47, 'Carnaval (terça-feira)'],
        [-2, 'Sexta-feira Santa'],
        [0, 'Páscoa'],
        [60, 'Corpus Christi']
    ].map(([offset, name]) => ({
        date: iso(new Date(p.getFullYear(), p.getMonth(), p.getDate() + offset)),
        name,
        type: 'national'
    }))
    return [...fixos, ...moveis].sort((a, b) => a.date.localeCompare(b.date))
}

function carregarFeriados() {
    setActive('btn-feriados')
    ferAno = new Date().getFullYear()

    if (!document.getElementById('feriados-style')) {
        const st = document.createElement('style')
        st.id = 'feriados-style'
        st.textContent = `
            .fer-shell { display:flex; flex-direction:column; gap:16px; }
            .fer-top { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; padding:18px 20px; background:var(--surface-1); border:1px solid var(--border-soft); border-radius:var(--r-lg); }
            .fer-top-left { display:flex; align-items:center; gap:12px; }
            .fer-top-ic { width:44px; height:44px; display:flex; align-items:center; justify-content:center; border-radius:var(--r-md); background:var(--brand-soft); color:var(--brand-2); flex:0 0 auto; }
            .fer-title { font-size:16px; font-weight:800; color:var(--text-1); letter-spacing:.01em; }
            .fer-sub { font-size:11px; color:var(--text-3); margin-top:2px; }
            .fer-ano { display:flex; align-items:center; gap:10px; }
            .fer-ano-btn { width:34px; height:34px; padding:0; border:1px solid var(--border); background:var(--surface-2); color:var(--text-2); border-radius:var(--r-sm); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:color .15s, border-color .15s; }
            .fer-ano-btn:hover { color:var(--text-1); border-color:var(--brand-2); }
            .fer-ano-label { font-size:20px; font-weight:800; color:var(--text-1); min-width:64px; text-align:center; font-variant-numeric:tabular-nums; }

            .fer-hero { position:relative; overflow:hidden; border:1px solid var(--border-soft); border-radius:var(--r-xl); padding:24px; display:flex; gap:26px; align-items:center; background:linear-gradient(150deg, var(--surface-1) 0%, var(--surface-2) 100%); }
            .fer-hero::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 85% 15%, var(--brand-soft), transparent 55%); pointer-events:none; }
            .fer-hero-main { flex:1; min-width:0; position:relative; }
            .fer-hero-badge { display:inline-flex; align-items:center; gap:7px; font-size:10px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; color:var(--brand-2); background:var(--brand-soft); padding:6px 12px; border-radius:999px; margin-bottom:14px; }
            .fer-hero-badge.is-hoje { color:var(--ok); background:var(--ok-soft); }
            .fer-hero-name { font-size:30px; font-weight:800; line-height:1.15; color:var(--text-1); letter-spacing:-.01em; }
            .fer-hero-date { font-size:13px; color:var(--text-2); margin:8px 0 14px; }
            .fer-chips { display:flex; gap:8px; flex-wrap:wrap; }
            .fer-chip { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:var(--text-2); background:var(--surface-1); border:1px solid var(--border-soft); border-radius:999px; padding:5px 11px; }
            .fer-chip.is-util { color:var(--ok); border-color:var(--ok-soft); }
            .fer-chip.is-fds { color:var(--warn); }
            .fer-count { position:relative; flex:0 0 auto; text-align:center; min-width:120px; padding-left:26px; border-left:1px solid var(--border-soft); }
            .fer-count-num { font-size:56px; font-weight:800; line-height:1; color:var(--text-1); font-variant-numeric:tabular-nums; }
            .fer-count-label { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.12em; color:var(--text-3); margin-top:8px; line-height:1.6; }
            .fer-hero.is-passado { opacity:.75; }
            .fer-hero-aviso { font-size:11px; color:var(--text-3); margin-top:14px; }

            .fer-kpis { display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:12px; }
            .fer-kpi { background:linear-gradient(160deg, var(--surface-1), var(--surface-2)); border:1px solid var(--border-soft); border-radius:var(--r-lg); padding:14px 16px; }
            .fer-kpi-label { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.09em; color:var(--text-3); }
            .fer-kpi-value { font-size:24px; font-weight:800; color:var(--text-1); margin-top:6px; font-variant-numeric:tabular-nums; }
            .fer-kpi-sub { font-size:10.5px; color:var(--text-3); margin-top:2px; }

            .fer-list { background:var(--surface-1); border:1px solid var(--border-soft); border-radius:var(--r-lg); overflow:hidden; }
            .fer-mes { padding:16px 20px 10px; border-bottom:1px solid var(--border-soft); display:flex; align-items:center; justify-content:space-between; }
            .fer-mes-nome { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.1em; color:var(--text-3); }
            .fer-mes-qtd { font-size:10px; font-weight:700; color:var(--text-3); background:var(--surface-2); border-radius:999px; padding:3px 9px; }
            .fer-item { display:flex; align-items:center; gap:14px; padding:11px 20px; border-bottom:1px solid var(--border-soft); transition:background .2s; }
            .fer-item:last-child { border-bottom:none; }
            .fer-item:hover { background:var(--surface-2); }
            .fer-item.is-passado { opacity:.42; }
            .fer-item.is-passado .fer-item-nome { text-decoration:line-through; text-decoration-thickness:1px; }
            .fer-item.is-hoje { background:var(--ok-soft); box-shadow:inset 3px 0 0 var(--ok); }
            .fer-item.is-proximo { box-shadow:inset 3px 0 0 var(--brand-2); }
            .fer-item-dia { min-width:42px; text-align:center; flex:0 0 auto; }
            .fer-item-dia b { display:block; font-size:19px; font-weight:800; color:var(--text-1); line-height:1.05; font-variant-numeric:tabular-nums; }
            .fer-item-dia span { display:block; font-size:9px; font-weight:700; color:var(--text-3); text-transform:uppercase; letter-spacing:.08em; }
            .fer-item-main { flex:1; min-width:0; }
            .fer-item-nome { font-size:13px; font-weight:600; color:var(--text-1); }
            .fer-item-sem { font-size:10.5px; color:var(--text-3); margin-top:2px; }
            .fer-badge { font-size:9px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; padding:4px 9px; border-radius:999px; white-space:nowrap; }
            .fer-badge.hoje { color:var(--ok); background:var(--ok-soft); }
            .fer-badge.proximo { color:var(--brand-2); background:var(--brand-soft); }
        `
        document.head.appendChild(st)
    }

    setConteudo(`
        <div class="fer-shell fade-in">
            <div class="fer-top">
                <div class="fer-top-left">
                    <div class="fer-top-ic">
                        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <div>
                        <div class="fer-title">Feriados Nacionais</div>
                        <div class="fer-sub">Dias em que a loja costuma fechar ou alterar o horário</div>
                    </div>
                </div>
                <div class="fer-ano">
                    <button id="fer-ano-ant" class="fer-ano-btn" type="button" aria-label="Ano anterior">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <span id="fer-ano-label" class="fer-ano-label">${ferAno}</span>
                    <button id="fer-ano-prox" class="fer-ano-btn" type="button" aria-label="Próximo ano">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>
            </div>

            <div id="fer-hero"></div>
            <div class="fer-kpis" id="fer-kpis"></div>
            <div class="fer-list" id="fer-content">
                <p style="text-align:center; color:var(--text-3); font-size:13px; padding:50px 0;">Carregando feriados...</p>
            </div>
        </div>
    `, 'Feriados')

    document.getElementById('fer-ano-ant').onclick = () => { ferAno--; ferBuscar() }
    document.getElementById('fer-ano-prox').onclick = () => { ferAno++; ferBuscar() }

    ferBuscar()
}

function ferHojeMeiaNoite() {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
}
function ferDataLocal(dateStr) {
    return new Date(dateStr + 'T12:00:00')
}
function ferDiasAte(dateStr) {
    const alvo = ferDataLocal(dateStr)
    alvo.setHours(0, 0, 0, 0)
    return Math.round((alvo - ferHojeMeiaNoite()) / 86400000)
}
function ferEscape(s) {
    return String(s ?? '').replace(/[<>&"']/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c] })
}

async function ferBuscar() {
    document.getElementById('fer-ano-label').textContent = ferAno
    const container = document.getElementById('fer-content')
    const hero = document.getElementById('fer-hero')
    const kpis = document.getElementById('fer-kpis')
    container.innerHTML = '<p style="text-align:center; color:var(--text-3); font-size:13px; padding:50px 0;">Carregando feriados...</p>'
    hero.innerHTML = ''
    kpis.innerHTML = ''

    let feriados = []
    let offline = false
    try {
        const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ferAno}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('HTTP ' + res.status)
        feriados = await res.json()
        if (!Array.isArray(feriados)) throw new Error('resposta inválida')
    } catch (e) {
        feriados = feriadosNacionaisLocal(ferAno)
        offline = true
    }

    // normaliza (garante ordenado por data)
    feriados = feriados.slice().sort((a, b) => a.date.localeCompare(b.date))
    ferCache = { feriados, offline }
    ferRenderizar(feriados, offline)
}

function ferRenderizar(feriados, offline) {
    const hero = document.getElementById('fer-hero')
    const kpis = document.getElementById('fer-kpis')
    const container = document.getElementById('fer-content')
    const hoje = ferHojeMeiaNoite()
    const anoAtual = hoje.getFullYear()

    const info = feriados.map(f => ({ ...f, dataObj: ferDataLocal(f.date), diff: ferDiasAte(f.date) }))
    const total = info.length
    const passados = info.filter(f => f.diff < 0).length
    const restantes = total - passados
    const uteis = info.filter(f => { const wd = f.dataObj.getDay(); return wd >= 1 && wd <= 5 }).length

    // ── hero (só faz sentido para hoje em diante) ─────────────
    const futuro = info.filter(f => f.diff >= 0)
    if (futuro.length) {
        const hojeFeriado = futuro.find(f => f.diff === 0)
        const prox = hojeFeriado || futuro[0]
        const dataLonga = prox.dataObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        const wd = prox.dataObj.getDay()
        const isUtil = wd >= 1 && wd <= 5
        const isSegSex = wd === 1 || wd === 5
        const badge = hojeFeriado
            ? '<span class="fer-hero-badge is-hoje"><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Hoje é feriado</span>'
            : '<span class="fer-hero-badge"><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 14.5 13.5"/></svg>Próximo feriado</span>'
        hero.innerHTML = `
            <div class="fer-hero${hojeFeriado ? ' is-passado' : ''}">
                <div class="fer-hero-main">
                    ${badge}
                    <div class="fer-hero-name">${ferEscape(prox.name)}</div>
                    <div class="fer-hero-date">${ferEscape(dataLonga)}</div>
                    <div class="fer-chips">
                        <span class="fer-chip ${isUtil ? 'is-util' : 'is-fds'}">${isUtil ? 'Dia útil' : 'Fim de semana'}</span>
                        ${isSegSex ? '<span class="fer-chip">Emenda possível</span>' : ''}
                        ${wd === 0 || wd === 6 ? '' : ''}
                    </div>
                    ${offline ? '<div class="fer-hero-aviso">Sem internet — feriados calculados localmente.</div>' : ''}
                </div>
                <div class="fer-count">
                    <div class="fer-count-num">${hojeFeriado ? '0' : prox.diff}</div>
                    <div class="fer-count-label">${hojeFeriado ? 'é hoje!' : (prox.diff === 1 ? 'dia<br>para lá' : 'dias<br>para lá')}</div>
                </div>
            </div>`
    } else {
        hero.innerHTML = `
            <div class="fer-hero is-passado">
                <div class="fer-hero-main">
                    <span class="fer-hero-badge"><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Ano encerrado</span>
                    <div class="fer-hero-name">Todos os feriados de ${ferAno} já passaram</div>
                    <div class="fer-hero-date">Veja a lista completa abaixo, ou navegue para o próximo ano</div>
                </div>
            </div>`
    }

    // ── KPIs ─────────────────────────────────────────────────
    kpis.innerHTML = [
        ['No ano', total, 'feriados nacionais'],
        ['Já passaram', passados, ferAno === anoAtual ? 'desde 1º de janeiro' : 'neste ano'],
        ['Ainda faltam', ferAno === anoAtual ? restantes : (ferAno > anoAtual ? total : 0), 'neste ano'],
        ['Em dia útil', uteis, 'segunda a sexta']
    ].map(([label, value, sub]) => `
        <div class="fer-kpi">
            <div class="fer-kpi-label">${ferEscape(label)}</div>
            <div class="fer-kpi-value">${value}</div>
            <div class="fer-kpi-sub">${ferEscape(sub)}</div>
        </div>`).join('')

    // ── lista agrupada por mês ────────────────────────────────
    if (!total) {
        container.innerHTML = `<p style="text-align:center; color:var(--text-3); font-size:13px; padding:50px 0;">Nenhum feriado encontrado para ${ferAno}</p>`
        return
    }

    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    const agrupados = {}
    info.forEach(f => {
        const mes = f.dataObj.getMonth()
        if (!agrupados[mes]) agrupados[mes] = []
        agrupados[mes].push(f)
    })

    const proximoIdx = info.findIndex(f => f.diff >= 0)

    container.innerHTML = Object.keys(agrupados).map(mesKey => {
        const mes = Number(mesKey)
        const itens = agrupados[mes]
        return `
            <div>
                <div class="fer-mes">
                    <span class="fer-mes-nome">${meses[mes]}</span>
                    <span class="fer-mes-qtd">${itens.length} ${itens.length === 1 ? 'feriado' : 'feriados'}</span>
                </div>
                ${itens.map(f => {
                    const idx = info.indexOf(f)
                    const isHoje = f.diff === 0
                    const isPassado = f.diff < 0
                    const isProximo = !isHoje && idx === proximoIdx
                    const diaSemana = f.dataObj.toLocaleDateString('pt-BR', { weekday: 'long' })
                    return `
                        <div class="fer-item${isPassado ? ' is-passado' : ''}${isHoje ? ' is-hoje' : ''}${isProximo ? ' is-proximo' : ''}">
                            <div class="fer-item-dia">
                                <b>${ ferPad(f.dataObj.getDate()) }</b>
                                <span>${meses[mes].slice(0, 3)}</span>
                            </div>
                            <div class="fer-item-main">
                                <div class="fer-item-nome">${ferEscape(f.name)}</div>
                                <div class="fer-item-sem">${ferEscape(diaSemana)}</div>
                            </div>
                            ${isHoje ? '<span class="fer-badge hoje">Hoje</span>' : ''}
                            ${isProximo ? '<span class="fer-badge proximo">Próximo</span>' : ''}
                        </div>
                    `
                }).join('')}
            </div>`
    }).join('')
}
