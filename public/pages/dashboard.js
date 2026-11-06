/* ═══════════════════════════════════════════════════════════════
   DASHBOARD 3D — moderno, responsivo, com dados em tempo real
   ═══════════════════════════════════════════════════════════════ */

const D3_COLORS = {
    grande4:  '#e11d48',
    grande:   '#3b82f6',
    a4:       '#f59e0b',
    azul:     '#3b82f6',
    verde:    '#22c55e',
    roxo:     '#a855f7',
    laranja:  '#f59e0b',
    vermelho: '#ef4444',
    ciano:    '#06b6d4'
}

function dashEsc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]))
}

/* ─────────────────────────────────────────────────────────────
   Estilos 3D (injetados uma única vez)
   ───────────────────────────────────────────────────────────── */
function dashInjectStyles() {
    if (document.getElementById('dash-3d-styles')) return

    const style = document.createElement('style')
    style.id = 'dash-3d-styles'
    style.textContent = `
        .d3-wrap {
            max-width: 1240px;
            margin: 0 auto;
            perspective: 1400px;
            --d3-track: var(--border);
            --d3-border: var(--border);
            --d3-text: var(--text-1);
            --d3-muted: var(--text-3);
            --d3-soft: var(--surface-2);
        }

        /* ── Cabeçalho ─────────────────────────────────────── */
        .d3-hero {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 18px;
            flex-wrap: wrap;
            margin-bottom: 18px;
        }
        .d3-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: #e11d48;
            margin-bottom: 8px;
        }
        .d3-eyebrow::before {
            content: '';
            width: 18px;
            height: 2px;
            border-radius: 2px;
            background: linear-gradient(90deg, #b51515, #e11d48);
            box-shadow: 0 0 10px rgba(225,29,72,0.7);
        }
        .d3-hero-title {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.035em;
            line-height: 1.05;
            color: var(--text-1);
        }
        .d3-hero-sub {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 8px;
            font-size: 12.5px;
            color: var(--d3-muted);
        }
        .d3-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 11px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.01em;
            text-transform: capitalize;
            color: #f87171;
            background: rgba(181,21,21,0.14);
            border: 1px solid rgba(181,21,21,0.28);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
        }
        body.theme-light .d3-chip {
            color: #b51515;
            background: rgba(181,21,21,0.08);
        }
        .d3-actions { display: flex; gap: 8px; flex-wrap: wrap; }

        .d3-btn {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 9px 15px;
            border-radius: 12px;
            cursor: pointer;
            font-size: 12.5px;
            font-weight: 600;
            color: var(--d3-muted);
            background: var(--d3-soft);
            border: 1px solid var(--d3-border);
            transition: transform .22s cubic-bezier(.34,1.56,.64,1), background .22s, color .22s, box-shadow .22s, border-color .22s;
        }
        .d3-btn:hover {
            transform: translateY(-2px);
            color: var(--d3-text);
            background: var(--surface-3);
            border-color: var(--border-strong);
            box-shadow: var(--shadow-md);
        }
        .d3-btn svg { transition: transform .55s cubic-bezier(.34,1.56,.64,1); }
        .d3-btn:hover svg { transform: rotate(180deg); }
        .d3-btn.danger { color: #f87171; border-color: rgba(239,68,68,0.28); }
        .d3-btn.danger:hover { background: rgba(239,68,68,0.14); color: #ef4444; box-shadow: 0 12px 24px -14px rgba(239,68,68,0.8); }
        .d3-btn.danger:hover svg { transform: scale(1.1); }

        /* ── Ações rápidas ─────────────────────────────────── */
        .d3-quick {
            display: flex;
            gap: 9px;
            flex-wrap: wrap;
            margin-bottom: 18px;
        }
        .d3-quick-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 9px 13px;
            border-radius: 11px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            color: var(--d3-muted);
            background: var(--d3-soft);
            border: 1px solid var(--d3-border);
            transition: transform .22s cubic-bezier(.34,1.56,.64,1), color .22s, border-color .22s, background .22s;
        }
        .d3-quick-btn:hover {
            transform: translateY(-2px);
            color: var(--d3-text);
            border-color: rgba(181,21,21,0.35);
            background: rgba(181,21,21,0.09);
        }
        .d3-quick-btn svg { color: #e11d48; }

        /* ── Grids ─────────────────────────────────────────── */
        .d3-kpis {
            display: grid;
            gap: 24px;
            margin-bottom: 24px;
            grid-template-columns: repeat(auto-fit, minmax(215px, 1fr));
        }
        .d3-grid-3 {
            display: grid;
            gap: 24px;
            margin-bottom: 24px;
            grid-template-columns: 1.15fr 1fr 1fr;
        }
        .d3-grid-2 {
            display: grid;
            gap: 24px;
            margin-bottom: 24px;
            grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 1100px) {
            .d3-grid-3 { grid-template-columns: 1fr 1fr; }
            .d3-grid-3 > .d3-card:first-child { grid-column: 1 / -1; }
        }
        @media (max-width: 820px) {
            .d3-grid-3, .d3-grid-2 { grid-template-columns: 1fr; }
            .d3-grid-3 > .d3-card:first-child { grid-column: auto; }
            .d3-hero { align-items: flex-start; }
            .d3-hero-title { font-size: 24px; }
        }
        @media (max-width: 520px) {
            .d3-kpis { grid-template-columns: 1fr; }
            .d3-value { font-size: 1.85rem; }
        }

        /* ── Card 3D ───────────────────────────────────────── */
        .d3-card {
            position: relative;
            border-radius: 18px;
            padding: 22px;
            background: var(--surface-1);
            border: 1px solid var(--d3-border);
            box-shadow: var(--shadow-sm);
            transform-style: preserve-3d;
            transition: transform .38s cubic-bezier(.22,1,.36,1), box-shadow .38s, border-color .38s;
            will-change: transform;
        }
        .d3-card::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            background: linear-gradient(135deg, rgba(255,255,255,0.06), transparent 42%);
            opacity: .5;
        }
        .d3-card:hover {
            border-color: var(--border-strong);
            box-shadow: var(--shadow-lg);
        }

        .d3-glow {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            overflow: hidden;
            pointer-events: none;
        }
        .d3-glow::before {
            content: '';
            position: absolute;
            top: -95px;
            right: -65px;
            width: 190px;
            height: 190px;
            border-radius: 50%;
            background: var(--d3-glow, rgba(181,21,21,0.35));
            filter: blur(46px);
            opacity: .45;
        }

        .d3-card-head {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 14px;
            transform: translateZ(26px);
        }
        .d3-icon {
            width: 44px;
            height: 44px;
            border-radius: 14px;
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 12px 22px -10px var(--d3-icon-shadow, rgba(0,0,0,0.6)), inset 0 1px 0 rgba(255,255,255,0.28);
            transition: transform .38s cubic-bezier(.34,1.56,.64,1);
        }
        .d3-card:hover .d3-icon { transform: scale(1.09) rotate(-4deg) translateZ(16px); }

        .d3-label {
            font-size: 10.5px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--d3-muted);
            line-height: 1.25;
        }
        .d3-sub {
            font-size: 11px;
            font-weight: 500;
            color: var(--d3-muted);
            margin-top: 3px;
            opacity: .9;
        }

        .d3-value {
            font-size: 2.1rem;
            font-weight: 800;
            line-height: 1;
            letter-spacing: -0.04em;
            transform: translateZ(36px);
            font-variant-numeric: tabular-nums;
        }

        .d3-spark {
            margin-top: 13px;
            height: 4px;
            border-radius: 4px;
            background: var(--d3-track);
            overflow: hidden;
            transform: translateZ(20px);
        }
        .d3-spark > i {
            display: block;
            height: 100%;
            width: 0;
            border-radius: 4px;
            transition: width 1.1s cubic-bezier(.22,1,.36,1);
            box-shadow: 0 0 12px currentColor;
        }

        /* ── Cabeçalho de seção ────────────────────────────── */
        .d3-card-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--d3-muted);
            transform: translateZ(20px);
        }
        .d3-card-title svg { color: #e11d48; flex: 0 0 auto; }

        /* ── Donut ─────────────────────────────────────────── */
        .d3-donut {
            position: relative;
            flex: 0 0 auto;
        }
        .d3-donut svg { display: block; }
        .d3-ring-seg { transition: stroke-dasharray 1s cubic-bezier(.22,1,.36,1); }
        .d3-donut-center {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            transform: translateZ(30px);
        }
        .d3-donut-center b {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.04em;
            color: var(--d3-text);
            line-height: 1;
        }
        .d3-donut-center span {
            margin-top: 3px;
            font-size: 9.5px;
            font-weight: 700;
            letter-spacing: 0.09em;
            text-transform: uppercase;
            color: var(--d3-muted);
        }

        .d3-donut-row {
            display: flex;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
            transform: translateZ(18px);
        }
        .d3-legend {
            display: flex;
            flex-direction: column;
            gap: 11px;
            flex: 1;
            min-width: 135px;
        }
        .d3-legend-item {
            display: flex;
            align-items: center;
            gap: 9px;
            font-size: 12.5px;
            color: var(--d3-text);
        }
        .d3-legend-dot {
            width: 9px;
            height: 9px;
            border-radius: 3px;
            flex: 0 0 auto;
            display: inline-block;
            box-shadow: 0 0 10px currentColor;
        }
        .d3-legend-item b { margin-left: auto; font-weight: 800; font-variant-numeric: tabular-nums; }
        .d3-legend-item .d3-pct {
            width: 46px;
            text-align: right;
            font-size: 11px;
            color: var(--d3-muted);
            font-variant-numeric: tabular-nums;
        }

        /* ── Anéis de percentual ───────────────────────────── */
        .d3-rings {
            display: flex;
            justify-content: space-around;
            align-items: flex-start;
            gap: 12px;
            flex-wrap: wrap;
            padding-top: 4px;
            transform: translateZ(18px);
        }
        .d3-ring-box { text-align: center; }
        .d3-ring-label {
            margin-top: 9px;
            font-size: 10.5px;
            font-weight: 800;
            letter-spacing: 0.07em;
            text-transform: uppercase;
        }
        .d3-ring-sub {
            margin-top: 3px;
            font-size: 10.5px;
            color: var(--d3-muted);
        }

        /* ── Alertas ───────────────────────────────────────── */
        .d3-alerts {
            display: flex;
            flex-direction: column;
            gap: 9px;
            transform: translateZ(18px);
        }
        .d3-alert {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 11px 13px;
            border-radius: 13px;
            border: 1px solid transparent;
            transition: transform .25s cubic-bezier(.34,1.56,.64,1), background .25s;
        }
        .d3-alert:hover { transform: translateX(5px); }
        .d3-alert-ico {
            width: 34px;
            height: 34px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 auto;
        }
        .d3-alert-txt { min-width: 0; }
        .d3-alert-txt small {
            display: block;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.07em;
            text-transform: uppercase;
            opacity: .7;
        }
        .d3-alert-txt strong {
            display: block;
            font-size: 12.5px;
            font-weight: 600;
            color: var(--d3-text);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .d3-alert b {
            margin-left: auto;
            font-size: 17px;
            font-weight: 800;
            font-variant-numeric: tabular-nums;
            text-align: right;
            line-height: 1.1;
        }
        .d3-alert b span {
            display: block;
            font-size: 9.5px;
            font-weight: 600;
            opacity: .65;
        }

        /* ── Barras 3D ─────────────────────────────────────── */
        .d3-bars {
            display: flex;
            flex-direction: column;
            gap: 15px;
            transform: translateZ(18px);
        }
        .d3-bar-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 7px;
            font-size: 12.5px;
            color: var(--d3-text);
        }
        .d3-bar-head > span:first-child { display: flex; align-items: center; gap: 8px; }
        .d3-bar-head b { font-weight: 800; font-variant-numeric: tabular-nums; }
        .d3-bar-head em {
            font-style: normal;
            font-size: 11px;
            color: var(--d3-muted);
            margin-left: 3px;
            font-variant-numeric: tabular-nums;
        }
        .d3-bar-track {
            height: 10px;
            border-radius: 7px;
            background: var(--d3-track);
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.35);
            overflow: hidden;
        }
        body.theme-light .d3-bar-track { box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
        .d3-bar-fill {
            height: 100%;
            width: 0;
            border-radius: 7px;
            transition: width 1.15s cubic-bezier(.22,1,.36,1);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 10px -2px currentColor;
            position: relative;
        }

        /* ── Gráficos ──────────────────────────────────────── */
        .d3-chart { position: relative; height: 260px; transform: translateZ(10px); }
        @media (max-width: 520px) { .d3-chart { height: 220px; } }

        /* ── Tabela Top 10 ─────────────────────────────────── */
        .d3-table-wrap {
            border-radius: 14px;
            overflow: hidden;
            border: 1px solid var(--d3-border);
            transform: translateZ(14px);
        }
        .d3-table { width: 100%; border-collapse: collapse; }
        .d3-table thead th {
            padding: 11px 16px;
            text-align: left;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--d3-muted);
            background: var(--d3-soft);
            border-bottom: 1px solid var(--d3-border);
        }
        .d3-table tbody tr {
            border-bottom: 1px solid var(--d3-border);
            transition: background .2s;
        }
        .d3-table tbody tr:last-child { border-bottom: none; }
        .d3-table tbody tr:hover { background: var(--d3-soft); }
        .d3-table td { padding: 11px 16px; font-size: 13px; color: var(--d3-text); }
        .d3-table td.d3-num { text-align: right; font-weight: 800; color: #e11d48; font-variant-numeric: tabular-nums; }
        .d3-prod-name { font-weight: 600; }
        .d3-prod-meta { display: flex; align-items: center; gap: 8px; margin-top: 5px; }
        .d3-prod-track {
            width: 90px;
            height: 4px;
            border-radius: 4px;
            background: var(--d3-track);
            overflow: hidden;
        }
        .d3-prod-track > i {
            display: block;
            height: 100%;
            width: 0;
            border-radius: 4px;
            background: linear-gradient(90deg, #b51515, #e11d48);
            transition: width 1s cubic-bezier(.22,1,.36,1);
        }
        .d3-rank {
            width: 27px;
            height: 27px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11.5px;
            font-weight: 800;
            background: var(--d3-soft);
            color: var(--d3-muted);
            font-variant-numeric: tabular-nums;
        }
        .d3-rank.top1 { background: rgba(234,179,8,0.18); color: #eab308; box-shadow: 0 0 14px -2px rgba(234,179,8,0.7); }
        .d3-rank.top2 { background: rgba(148,163,184,0.2); color: #94a3b8; }
        .d3-rank.top3 { background: rgba(180,83,9,0.2); color: #b45309; }
        .d3-badge {
            display: inline-flex;
            align-items: center;
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.03em;
            text-transform: uppercase;
        }
        .d3-empty {
            padding: 26px 16px;
            text-align: center;
            color: var(--d3-muted);
            font-size: 12.5px;
        }

        /* ── Entrada animada ───────────────────────────────── */
        .d3-animate {
            opacity: 0;
            transform: translateY(18px);
        }
        .d3-animate.d3-in {
            animation: d3fadeup .55s cubic-bezier(.22,1,.36,1) forwards;
        }
        @keyframes d3fadeup {
            to { opacity: 1; transform: translateY(0); }
        }

        /* ── Skeleton ──────────────────────────────────────── */
        @keyframes d3pulse {
            0%, 100% { opacity: .35; }
            50% { opacity: .7; }
        }
        .d3-skel {
            border-radius: 18px;
            background: linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
            border: 1px solid var(--d3-border);
            animation: d3pulse 1.4s ease-in-out infinite;
        }
        .d3-skel-title { height: 64px; margin-bottom: 18px; border-radius: 14px; }
        .d3-skel-card { height: 128px; }

        @media (prefers-reduced-motion: reduce) {
            .d3-animate { opacity: 1; transform: none; }
            .d3-card { transition: none; }
        }
    `
    document.head.appendChild(style)
}

/* ─────────────────────────────────────────────────────────────
   Carregamento principal
   ───────────────────────────────────────────────────────────── */
async function carregarDashboard() {
    dashInjectStyles()
    setActive('btn-dashboard')

    setConteudo(`
        <div class="d3-wrap">
            <div class="d3-skel d3-skel-title"></div>
            <div class="d3-kpis">
                <div class="d3-skel d3-skel-card"></div>
                <div class="d3-skel d3-skel-card"></div>
                <div class="d3-skel d3-skel-card"></div>
                <div class="d3-skel d3-skel-card"></div>
            </div>
            <div class="d3-grid-3">
                <div class="d3-skel" style="height:230px;"></div>
                <div class="d3-skel" style="height:230px;"></div>
                <div class="d3-skel" style="height:230px;"></div>
            </div>
            <div class="d3-grid-2">
                <div class="d3-skel" style="height:320px;"></div>
                <div class="d3-skel" style="height:320px;"></div>
            </div>
        </div>
    `, 'Dashboard')

    try {
        const res = await fetch(API + '/dashboard', { headers: authHeaders() })
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Erro ao carregar dashboard')

        const el = document.getElementById('conteudo')
        el.innerHTML = dashRenderizar(data)

        dashAnimateCounters()
        dashAnimateRings()
        dashAnimateBars()
        dashInitTilt()
        dashReveal()

        dashGraficoDepto(data.porDepto || [])
        dashGraficoDias(data.placasDias || [])

    } catch (e) {
        console.error(e)
        setConteudo(`
            <div class="d3-wrap" style="display:flex; align-items:center; justify-content:center;">
                <div class="d3-card" style="padding:36px; text-align:center; max-width:420px;">
                    <div class="d3-icon" style="margin:0 auto 16px; background:rgba(239,68,68,0.14); color:#ef4444;">
                        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <p style="font-size:14px; font-weight:700; color:var(--d3-text); margin-bottom:6px;">Não foi possível carregar o dashboard</p>
                    <p style="font-size:12.5px; color:var(--d3-muted); margin-bottom:18px;">${dashEsc(e.message)}</p>
                    <button onclick="carregarDashboard()" class="d3-btn" style="margin:0 auto; color:#f87171; border-color:rgba(239,68,68,0.3);">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                        Tentar novamente
                    </button>
                </div>
            </div>
        `, 'Dashboard')
    }
}

async function zerarDashboard() {
    if (!confirm('Tem certeza? Isso vai apagar TODOS os registros de placas, logs e listas de preços.')) return
    if (!confirm('Última confirmação: essa ação NÃO pode ser desfeita. Continuar?')) return
    try {
        const res = await fetch(API + '/dashboard/zerar', { method: 'DELETE', headers: authHeaders() })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        carregarDashboard()
    } catch (e) {
        alert('Erro ao zerar: ' + e.message)
    }
}

/* ─────────────────────────────────────────────────────────────
   Renderização
   ───────────────────────────────────────────────────────────── */
function dashRenderizar(d) {
    const mes = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
    const num = v => Number(v || 0)
    const pctOf = (v, t) => t > 0 ? (v / t) * 100 : 0

    const placas = {
        grande4: num(d.placasMes?.grande4),
        grande: num(d.placasMes?.grande),
        a4: num(d.placasMes?.a4),
        total: num(d.placasMes?.total)
    }
    const impressas = num(d.impressasMes?.impressas)
    const geradas = num(d.impressasMes?.geradas)
    const totalProdutos = num(d.totalProdutos)
    const semEan = num(d.semEan)
    const semImagem = num(d.semImagem)
    const naoVerificados = num(d.naoVerificados)
    const listas = num(d.listasMes)
    const topProdutos = d.topProdutos || []
    const porDepto = d.porDepto || []

    const pctEan = pctOf(totalProdutos - semEan, totalProdutos)
    const pctImpressas = pctOf(impressas, placas.total)

    return `
    <div class="d3-wrap">

        <!-- Cabeçalho -->
        <div class="d3-hero d3-animate">
            <div>
                <div class="d3-eyebrow">Painel de controle</div>
                <h1 class="d3-hero-title">Visão Geral</h1>
                <div class="d3-hero-sub">
                    Produtos, placas e listas em um só lugar
                    <span class="d3-chip">
                        <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        ${mes}
                    </span>
                </div>
            </div>
            <div class="d3-actions">
                <button onclick="carregarDashboard()" class="d3-btn">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                    Atualizar
                </button>
                <button onclick="zerarDashboard()" class="d3-btn danger">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    Zerar
                </button>
            </div>
        </div>

        <!-- Ações rápidas -->
        <div class="d3-quick d3-animate">
            ${dashQuick('Busca rápida', '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', 'carregarBuscaRapida()')}
            ${dashQuick('Produtos', '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/>', 'carregarProdutos()')}
            ${dashQuick('Gerar placas', '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>', 'carregarPlacasGrande4()')}
            ${dashQuick('Gerenciar placas', '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>', 'carregarGerenciadorPlacas()')}
            ${dashQuick('Listas de preço', '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>', 'carregarListas()')}
        </div>

        <!-- KPIs -->
        <div class="d3-kpis">
            ${dashKpi({
                icon: '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
                label: 'Total de Produtos',
                sub: `${semEan.toLocaleString('pt-BR')} sem EAN`,
                value: totalProdutos,
                percent: pctEan,
                color: D3_COLORS.azul,
                glow: 'rgba(59,130,246,0.35)'
            })}
            ${dashKpi({
                icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
                label: 'Placas no Mês',
                sub: `${impressas.toLocaleString('pt-BR')} impressas`,
                value: placas.total,
                percent: pctImpressas,
                color: D3_COLORS.grande,
                glow: 'rgba(225,29,72,0.4)'
            })}
            ${dashKpi({
                icon: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
                label: 'Impressas no Mês',
                sub: `${pctImpressas.toFixed(0)}% das placas`,
                value: impressas,
                percent: pctImpressas,
                color: D3_COLORS.verde,
                glow: 'rgba(34,197,94,0.35)'
            })}
            ${dashKpi({
                icon: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
                label: 'Listas no Mês',
                sub: 'listas de preços criadas',
                value: listas,
                percent: 100,
                color: D3_COLORS.roxo,
                glow: 'rgba(168,85,247,0.35)'
            })}
        </div>

        <!-- Placas por tipo / Status / Atenção -->
        <div class="d3-grid-3">
            ${dashCardPlacasTipo(placas)}
            ${dashCardStatus(impressas, geradas, placas.total)}
            ${dashCardAtencao(totalProdutos, semEan, semImagem, naoVerificados)}
        </div>

        <!-- Gráficos -->
        <div class="d3-grid-2">
            <div class="d3-card d3-animate">
                <div class="d3-card-title">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>
                    Produtos por Departamento
                </div>
                <div class="d3-chart"><canvas id="chart-depto"></canvas></div>
            </div>
            <div class="d3-card d3-animate">
                <div class="d3-card-title">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    Placas nos Últimos 30 Dias
                </div>
                <div class="d3-chart"><canvas id="chart-dias"></canvas></div>
            </div>
        </div>

        <!-- Top 10 -->
        <div class="d3-card d3-animate">
            <div class="d3-card-title">
                <svg width="14" height="14" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Top 10 Produtos com Mais Placas
            </div>
            ${dashTop10(topProdutos)}
        </div>

    </div>`
}

/* ── helpers de markup ──────────────────────────────────────── */
function dashQuick(label, paths, fn) {
    return `<button onclick="${fn}" class="d3-quick-btn">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">${paths}</svg>
        ${label}
    </button>`
}

function dashKpi({ icon, label, sub, value, percent, color, glow }) {
    const safePct = Math.max(3, Math.min(100, Number(percent) || 0))
    return `
    <div class="d3-card d3-tilt d3-animate" style="--d3-glow:${glow};">
        <span class="d3-glow"></span>
        <div class="d3-card-head">
            <div class="d3-icon" style="background:${color}20; color:${color}; --d3-icon-shadow:${color}66;">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">${icon}</svg>
            </div>
            <div>
                <div class="d3-label">${label}</div>
                <div class="d3-sub">${sub}</div>
            </div>
        </div>
        <div class="d3-value" style="color:${color};" data-target="${value}">0</div>
        <div class="d3-spark"><i data-w="${safePct.toFixed(1)}" style="background:linear-gradient(90deg, ${color}, ${color}55); color:${color};"></i></div>
    </div>`
}

function dashCardPlacasTipo(placas) {
    const total = placas.total
    const segs = [
        { label: 'Grande 4', value: placas.grande4, color: D3_COLORS.grande4 },
        { label: 'A4', value: placas.a4, color: D3_COLORS.a4 },
        { label: 'Grande', value: placas.grande, color: D3_COLORS.grande }
    ]
    const pct = v => total > 0 ? (v / total) * 100 : 0

    return `
    <div class="d3-card d3-animate">
        <div class="d3-card-title">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            Placas por Tipo
        </div>
        <div class="d3-donut-row">
            ${dashDonut(segs, { size: 164, thickness: 16, label: 'placas' })}
            <div class="d3-legend">
                ${segs.map(s => `
                    <div class="d3-legend-item">
                        <i class="d3-legend-dot" style="background:${s.color}; color:${s.color};"></i>
                        ${s.label}
                        <b>${s.value.toLocaleString('pt-BR')}</b>
                        <span class="d3-pct">${pct(s.value).toFixed(1)}%</span>
                    </div>`).join('')}
            </div>
        </div>
    </div>`
}

function dashCardStatus(impressas, geradas, total) {
    return `
    <div class="d3-card d3-animate">
        <div class="d3-card-title">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Status de Impressão
        </div>
        <div class="d3-rings">
            ${dashRing(impressas, total, D3_COLORS.verde, 'Impressas')}
            ${dashRing(geradas, total, D3_COLORS.azul, 'Só geradas')}
        </div>
    </div>`
}

function dashCardAtencao(total, semEan, semImagem, naoVerificados) {
    const pct = v => total > 0 ? ((v / total) * 100).toFixed(1) + '% do total' : '—'
    return `
    <div class="d3-card d3-animate">
        <div class="d3-card-title">
            <svg width="14" height="14" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Pontos de Atenção
        </div>
        <div class="d3-alerts">
            ${dashAlert(
                '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
                'Sem EAN', pct(semEan), semEan, '#f59e0b', 'rgba(245,158,11,0.1)'
            )}
            ${dashAlert(
                '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
                'Sem imagem (confirmado)', pct(semImagem), semImagem, '#ef4444', 'rgba(239,68,68,0.1)'
            )}
            ${dashAlert(
                '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
                'Imagens não verificadas', pct(naoVerificados), naoVerificados, '#a855f7', 'rgba(168,85,247,0.1)'
            )}
            ${dashAlert(
                '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>',
                'Produtos no catálogo', 'base completa', total, '#3b82f6', 'rgba(59,130,246,0.1)'
            )}
        </div>
    </div>`
}

function dashAlert(icon, label, sub, value, color, bg) {
    return `
    <div class="d3-alert" style="background:${bg}; border-color:${color}22;">
        <div class="d3-alert-ico" style="background:${color}1f; color:${color};">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">${icon}</svg>
        </div>
        <div class="d3-alert-txt">
            <small>${label}</small>
            <strong>${sub}</strong>
        </div>
        <b style="color:${color};">${Number(value).toLocaleString('pt-BR')}</b>
    </div>`
}

function dashDonut(segments, opts = {}) {
    const size = opts.size || 164
    const thickness = opts.thickness || 16
    const total = segments.reduce((s, x) => s + Number(x.value || 0), 0)
    const r = (size - thickness) / 2
    const c = 2 * Math.PI * r
    const cx = size / 2

    let offset = 0
    const segs = total > 0
        ? segments.filter(s => Number(s.value) > 0).map(s => {
            const dash = (Number(s.value) / total) * c
            const el = `<circle class="d3-ring-seg" cx="${cx}" cy="${cx}" r="${r}"
                fill="none" stroke="${s.color}" stroke-width="${thickness}"
                stroke-dasharray="0 ${c.toFixed(2)}"
                stroke-dashoffset="${(-offset).toFixed(2)}"
                data-dash="${dash.toFixed(2)} ${(c - dash).toFixed(2)}"
                transform="rotate(-90 ${cx} ${cx})"
                style="filter: drop-shadow(0 0 5px ${s.color}66);"></circle>`
            offset += dash
            return el
        }).join('')
        : `<circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="var(--d3-track)" stroke-width="${thickness}"></circle>`

    return `
    <div class="d3-donut" style="width:${size}px; height:${size}px;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${segs}</svg>
        <div class="d3-donut-center">
            <b>${total.toLocaleString('pt-BR')}</b>
            <span>${opts.label || 'total'}</span>
        </div>
    </div>`
}

function dashRing(value, total, color, label) {
    const size = 96
    const thickness = 9
    const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0
    const r = (size - thickness) / 2
    const c = 2 * Math.PI * r
    const dash = (pct / 100) * c

    return `
    <div class="d3-ring-box">
        <div class="d3-donut" style="width:${size}px; height:${size}px; margin:0 auto;">
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--d3-track)" stroke-width="${thickness}"></circle>
                <circle class="d3-ring-seg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}"
                    stroke-width="${thickness}" stroke-linecap="round"
                    stroke-dasharray="0 ${c.toFixed(2)}"
                    data-dash="${dash.toFixed(2)} ${(c - dash).toFixed(2)}"
                    transform="rotate(-90 ${size / 2} ${size / 2})"
                    style="filter: drop-shadow(0 0 5px ${color}77);"></circle>
            </svg>
            <div class="d3-donut-center">
                <b style="font-size:18px;">${pct.toFixed(0)}<span style="font-size:9px; margin:0 0 0 1px;">%</span></b>
            </div>
        </div>
        <div class="d3-ring-label" style="color:${color};">${label}</div>
        <div class="d3-ring-sub">${Number(value).toLocaleString('pt-BR')} de ${Number(total).toLocaleString('pt-BR')}</div>
    </div>`
}

function dashTop10(produtos) {
    if (!produtos.length) {
        return `<div class="d3-empty">Nenhuma placa gerada este mês.</div>`
    }

    const max = Math.max(...produtos.map(p => Number(p.total) || 0), 1)
    const tipoMap = {
        grande4: [D3_COLORS.grande4, 'rgba(225,29,72,0.15)', 'Grande 4'],
        a4:      [D3_COLORS.a4, 'rgba(245,158,11,0.15)', 'A4'],
        grande:  [D3_COLORS.grande, 'rgba(59,130,246,0.15)', 'Grande']
    }

    const rows = produtos.map((p, i) => {
        const [cor, bg, label] = tipoMap[p.tipo_placa] || ['#94a3b8', 'rgba(148,163,184,0.15)', dashEsc(p.tipo_placa || '—')]
        const w = Math.max(8, (Number(p.total) / max) * 100)
        return `
        <tr>
            <td style="width:52px;"><div class="d3-rank ${i < 3 ? 'top' + (i + 1) : ''}">${i + 1}</div></td>
            <td>
                <div class="d3-prod-name">${dashEsc(p.descricao)}</div>
                <div class="d3-prod-meta">
                    <div class="d3-prod-track"><i data-w="${w.toFixed(1)}"></i></div>
                </div>
            </td>
            <td style="width:110px;">
                <span class="d3-badge" style="background:${bg}; color:${cor};">${label}</span>
            </td>
            <td class="d3-num" style="width:80px;">${Number(p.total).toLocaleString('pt-BR')}</td>
        </tr>`
    }).join('')

    return `
    <div class="d3-table-wrap">
        <table class="d3-table">
            <thead>
                <tr>
                    <th style="width:52px;">#</th>
                    <th>Produto</th>
                    <th style="width:110px;">Tipo</th>
                    <th style="text-align:right; width:80px;">Qtd</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    </div>`
}

/* ─────────────────────────────────────────────────────────────
   Animações
   ───────────────────────────────────────────────────────────── */
function dashReveal() {
    document.querySelectorAll('.d3-animate').forEach((el, i) => {
        setTimeout(() => el.classList.add('d3-in'), i * 55)
    })
}

function dashAnimateCounters() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.querySelectorAll('.d3-value[data-target]').forEach(el => {
        const target = Number(el.dataset.target || 0)
        if (reduce || !isFinite(target)) {
            el.textContent = target.toLocaleString('pt-BR')
            return
        }
        const dur = 900
        const start = performance.now()
        function tick(now) {
            const t = Math.min((now - start) / dur, 1)
            const eased = 1 - Math.pow(1 - t, 3)
            el.textContent = Math.floor(eased * target).toLocaleString('pt-BR')
            if (t < 1) requestAnimationFrame(tick)
            else el.textContent = target.toLocaleString('pt-BR')
        }
        requestAnimationFrame(tick)
    })
}

function dashAnimateRings() {
    document.querySelectorAll('.d3-ring-seg').forEach((el, i) => {
        const target = el.dataset.dash
        if (!target) return
        setTimeout(() => { el.style.strokeDasharray = target }, 160 + i * 70)
    })
}

function dashAnimateBars() {
    document.querySelectorAll('.d3-bar-fill[data-w], .d3-spark > i[data-w], .d3-prod-track > i[data-w]').forEach((el, i) => {
        const w = Number(el.dataset.w) || 0
        setTimeout(() => { el.style.width = w + '%' }, 160 + i * 60)
    })
}

function dashInitTilt() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    document.querySelectorAll('.d3-tilt').forEach(card => {
        let raf = 0
        card.addEventListener('mousemove', ev => {
            const rect = card.getBoundingClientRect()
            const px = (ev.clientX - rect.left) / rect.width - 0.5
            const py = (ev.clientY - rect.top) / rect.height - 0.5
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => {
                card.style.transform =
                    `perspective(900px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg) translateY(-4px)`
            })
        })
        card.addEventListener('mouseleave', () => {
            cancelAnimationFrame(raf)
            card.style.transform = ''
        })
    })
}

/* ─────────────────────────────────────────────────────────────
   Gráficos (Chart.js)
   ───────────────────────────────────────────────────────────── */
async function dashCarregarChartJS() {
    if (window.Chart) return
    await new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
        s.onload = resolve
        s.onerror = reject
        document.head.appendChild(s)
    })
}

function dashChartTheme() {
    const light = document.body.classList.contains('theme-light')
    return {
        tick: light ? 'rgba(17,24,39,0.45)' : 'rgba(255,255,255,0.35)',
        grid: light ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
        tooltipBg: light ? 'rgba(255,255,255,0.98)' : 'rgba(12,12,14,0.94)',
        tooltipTitle: light ? '#111827' : '#fafafa',
        tooltipBody: light ? '#4b5563' : '#a1a1aa',
        tooltipBorder: light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'
    }
}

async function dashGraficoDepto(porDepto) {
    await dashCarregarChartJS()
    const canvas = document.getElementById('chart-depto')
    if (!canvas || !window.Chart) return

    if (window._chartDepto) window._chartDepto.destroy()

    const t = dashChartTheme()
    const labels = porDepto.map(d => {
        const nome = String(d.depto || 'Sem Depto')
        return nome.length > 16 ? nome.slice(0, 16) + '…' : nome
    })
    const valores = porDepto.map(d => Number(d.total) || 0)
    const cores = [
        '#e11d48', '#f97316', '#f59e0b', '#eab308', '#22c55e',
        '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
        '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#fb7185',
        '#fbbf24', '#34d399', '#38bdf8', '#818cf8', '#c084fc'
    ]

    window._chartDepto = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Produtos',
                data: valores,
                backgroundColor: ctx => {
                    const { chart } = ctx
                    const area = chart.chartArea
                    const color = cores[ctx.dataIndex % cores.length]
                    if (!area) return color
                    const g = chart.ctx.createLinearGradient(0, area.bottom, 0, area.top)
                    g.addColorStop(0, color + '33')
                    g.addColorStop(1, color)
                    return g
                },
                hoverBackgroundColor: ctx => cores[ctx.dataIndex % cores.length],
                borderRadius: 6,
                borderSkipped: false,
                maxBarThickness: 34
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutQuart' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: t.tooltipBg,
                    titleColor: t.tooltipTitle,
                    bodyColor: t.tooltipBody,
                    borderColor: t.tooltipBorder,
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 10,
                    displayColors: false,
                    callbacks: {
                        label: ctx => `${ctx.parsed.y.toLocaleString('pt-BR')} produtos`
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: t.tick, font: { size: 10 }, maxRotation: 42, autoSkip: false },
                    grid: { display: false },
                    border: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: t.tick,
                        font: { size: 10 },
                        callback: v => Number(v).toLocaleString('pt-BR')
                    },
                    grid: { color: t.grid },
                    border: { display: false }
                }
            }
        }
    })
}

async function dashGraficoDias(placasDias) {
    await dashCarregarChartJS()
    const canvas = document.getElementById('chart-dias')
    if (!canvas || !window.Chart) return

    if (window._chartDias) window._chartDias.destroy()

    const t = dashChartTheme()
    const ctx = canvas.getContext('2d')
    const gradLine = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0)
    gradLine.addColorStop(0, '#e11d48')
    gradLine.addColorStop(0.25, '#f97316')
    gradLine.addColorStop(0.5, '#f59e0b')
    gradLine.addColorStop(0.75, '#22c55e')
    gradLine.addColorStop(1, '#3b82f6')
    const gradFill = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height)
    gradFill.addColorStop(0, 'rgba(59,130,246,0.22)')
    gradFill.addColorStop(0.5, 'rgba(168,85,247,0.1)')
    gradFill.addColorStop(1, 'rgba(225,29,72,0.02)')
    const colorAt = (i) => ['#e11d48', '#f97316', '#f59e0b', '#eab308', '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7'][i % 10]

    const hoje = new Date()
    const labels = []
    const valores = []

    for (let i = 29; i >= 0; i--) {
        const d = new Date(hoje)
        d.setDate(hoje.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        labels.push(d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }))
        const found = placasDias.find(p => {
            const raw = p.dia instanceof Date ? p.dia : new Date(String(p.dia).replace(' ', 'T'))
            return !isNaN(raw.getTime()) && raw.toISOString().slice(0, 10) === key
        })
        valores.push(found ? Number(found.total) || 0 : 0)
    }

    window._chartDias = new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Placas',
                data: valores,
                borderColor: gradLine,
                backgroundColor: gradFill,
                borderWidth: 3,
                pointBackgroundColor: ctx => colorAt(ctx.dataIndex),
                pointBorderColor: t.tooltipBg,
                pointBorderWidth: 2,
                pointRadius: ctx => (ctx.raw > 0 ? 4 : 0),
                pointHoverRadius: 6,
                fill: true,
                tension: 0.35
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 900, easing: 'easeOutQuart' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: t.tooltipBg,
                    titleColor: t.tooltipTitle,
                    bodyColor: t.tooltipBody,
                    borderColor: t.tooltipBorder,
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 10,
                    displayColors: false,
                    callbacks: {
                        label: ctx => `${ctx.parsed.y} placa(s)`
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: t.tick, font: { size: 9 }, maxTicksLimit: 10 },
                    grid: { display: false },
                    border: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: t.tick, font: { size: 10 }, precision: 0 },
                    grid: { color: t.grid },
                    border: { display: false }
                }
            }
        }
    })
}
