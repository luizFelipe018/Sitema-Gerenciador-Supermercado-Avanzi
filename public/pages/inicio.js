/* ═══════════════════════════════════════════════════════════════
   PÁGINA INÍCIO — Dashboard com gráficos ApexCharts e animações
   ═══════════════════════════════════════════════════════════════ */

let chartDias = null
let chartDepto = null
let chartTipos = null

function dashInjectStyles() {
    if (document.getElementById('dash-apex-styles')) return
    const st = document.createElement('style')
    st.id = 'dash-apex-styles'
    st.textContent = `
        @keyframes dashFadeUp {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .dash-root .ds-card,
        .dash-root .ds-stat-modern,
        .dash-root .ds-action-modern,
        .dash-root .ds-tile-modern {
            animation: dashFadeUp .55s cubic-bezier(.2,.8,.2,1) both;
        }
        .dash-root .ds-grid > :nth-child(1) { animation-delay: .03s; }
        .dash-root .ds-grid > :nth-child(2) { animation-delay: .09s; }
        .dash-root .ds-grid > :nth-child(3) { animation-delay: .15s; }
        .dash-root .ds-grid > :nth-child(4) { animation-delay: .21s; }
        .dash-root .apexcharts-canvas { max-width: 100%; }
        .dash-root .apexcharts-tooltip {
            border-radius: 10px !important;
            box-shadow: var(--shadow-md) !important;
            font-size: 12px !important;
        }
        @media (prefers-reduced-motion: reduce) {
            .dash-root .ds-card,
            .dash-root .ds-stat-modern,
            .dash-root .ds-action-modern,
            .dash-root .ds-tile-modern { animation: none; }
        }
    `
    document.head.appendChild(st)
}

function carregarInicio() {
    setActive('btn-inicio')
    dashInjectStyles()

    setConteudo(`
        <div class="dash-root fade-in">
        <div class="ds-page-head">
            <div>
                <div class="ds-page-eyebrow">Painel de controle</div>
                <h1 class="ds-page-title">Visão geral</h1>
                <p class="ds-page-sub">Produtos, placas, listas e estatísticas do sistema em tempo real</p>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
                <span class="ds-chip ds-chip-ok">
                    <span style="width:6px;height:6px;border-radius:50%;background:currentColor;display:inline-block"></span>
                    Sistema online
                </span>
            </div>
        </div>

        <!-- Ações rápidas -->
        <div class="ds-grid ds-grid-4" style="margin-bottom:28px">
            ${acaoInicio('Gerar placas', 'Placa Pequena, Placa Média e Placa Grande', 'btn-placas-menu', '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>')}
            ${acaoInicio('Busca rápida', 'Localizar por EAN ou nome', 'btn-busca-rapida', '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>')}
            ${acaoInicio('Importar produtos', 'Planilha do fornecedor', 'btn-importar', '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>')}
            ${acaoInicio('Listas de preço', 'Gerar e exportar XLSX', 'btn-listas', '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>')}
        </div>

        <!-- KPIs principais com tendência -->
        <div class="ds-grid ds-grid-4" style="margin-bottom:28px">
            ${kpiCard('Produtos cadastrados', 'dv-total-produtos', 'var(--brand)', 'var(--brand-soft)', '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/>', 'dv-trend-produtos')}
            ${kpiCard('Placas este mês', 'dv-placas-total', 'var(--brand-2)', 'var(--brand-soft-2)', '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>', 'dv-trend-placas')}
            ${kpiCard('Sem EAN', 'dv-sem-ean', 'var(--warn)', 'var(--warn-soft)', '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/>', 'dv-trend-ean')}
            ${kpiCard('Listas este mês', 'dv-listas-mes', 'var(--ok)', 'var(--ok-soft)', '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>', 'dv-trend-listas')}
        </div>

        <!-- Linha de gráficos -->
        <div class="ds-grid" style="grid-template-columns: 2fr 1fr; margin-bottom:28px; gap:28px">
            <div class="ds-card">
                <div class="ds-card-head">
                    <div class="ds-card-title">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 18 6 12 2 12"/></svg>
                        Placas por dia
                    </div>
                    <span class="ds-chip ds-chip-info" style="font-size:10px; padding:2px 8px">Últimos 30 dias</span>
                </div>
                <div class="ds-card-pad" style="padding-top:16px">
                    <div id="chart-placas-dias" style="height:260px; width:100%"></div>
                </div>
            </div>

            <div class="ds-card">
                <div class="ds-card-head">
                    <div class="ds-card-title">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Tipos de placa
                    </div>
                </div>
                <div class="ds-card-pad" style="padding-top:16px">
                    <div id="chart-tipos-placa" style="height:225px; width:100%"></div>
                    <div class="ds-grid ds-grid-3" style="margin-top:8px; gap:12px">
                        <div class="ds-tile-item">
                            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#e11d48;margin-right:6px"></span>
                            <span class="ds-tile-label" style="font-size:11px">Pequena</span>
                            <span class="ds-tile-value" id="dv-placas-pequena" style="font-size:11px; font-weight:600">—</span>
                        </div>
                        <div class="ds-tile-item">
                            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;margin-right:6px"></span>
                            <span class="ds-tile-label" style="font-size:11px">Grande</span>
                            <span class="ds-tile-value" id="dv-placas-grande" style="font-size:11px; font-weight:600">—</span>
                        </div>
                        <div class="ds-tile-item">
                            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#3b82f6;margin-right:6px"></span>
                            <span class="ds-tile-label" style="font-size:11px">Média</span>
                            <span class="ds-tile-value" id="dv-placas-media" style="font-size:11px; font-weight:600">—</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Segunda linha: departamentos + top produtos -->
        <div class="ds-grid" style="grid-template-columns: 1fr 2fr; gap:28px; margin-bottom:28px">
            <div class="ds-card">
                <div class="ds-card-head">
                    <div class="ds-card-title">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        Produtos por departamento
                    </div>
                </div>
                <div class="ds-card-pad" style="padding-top:16px">
                    <div id="chart-departamentos" style="height:260px; width:100%"></div>
                </div>
            </div>

            <div class="ds-card">
                <div class="ds-card-head">
                    <div class="ds-card-title">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 010-5C7 4 6 9 6 9z"/><path d="M18 9h1.5a2.5 2.5 0 000-5C17 4 18 9 18 9z"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>
                        Top produtos mais impressos
                    </div>
                </div>
                <div class="ds-card-pad" style="padding-top:16px">
                    <div id="dv-top-produtos" class="ds-list-modern"></div>
                </div>
            </div>
        </div>

        <!-- Resumo rápido -->
        <div class="ds-grid ds-grid-4" style="gap:28px">
            ${tileInicio('Sem imagem', 'dv-resumo-imagem', 'var(--warn)', '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12.01" y2="8"/><line x1="12" y1="12" x2="12.01" y2="12"/>')}
            ${tileInicio('Não verificados', 'dv-resumo-nao-verificados', 'var(--info)', '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>')}
            ${tileInicio('Impressas hoje', 'dv-resumo-impressas', 'var(--ok)', '<polyline points="20 6 9 17 4 12"/>')}
            ${tileInicio('Geradas hoje', 'dv-resumo-geradas', 'var(--brand-2)', '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>')}
        </div>
        </div>
    `, 'Início')

    carregarDadosDashboard()
}

/* ── helpers de markup ─────────────────────────────────────── */

function acaoInicio(titulo, subtitulo, btnId, paths) {
    return `
    <button class="ds-action-modern" onclick="document.getElementById('${btnId}').click()">
        <div class="ds-action-ico-modern">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">${paths}</svg>
        </div>
        <div style="min-width:0">
            <div class="ds-action-title-modern">${titulo}</div>
            <div class="ds-action-sub-modern">${subtitulo}</div>
        </div>
    </button>`
}

function kpiCard(label, idValor, cor, corSoft, paths, idTrend) {
    return `
    <div class="ds-stat-modern">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px">
            <span class="ds-stat-label-modern">${label}</span>
            <div style="width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:${corSoft};color:${cor}">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">${paths}</svg>
            </div>
        </div>
        <div class="ds-stat-value-modern" id="${idValor}" style="color:${cor}">—</div>
        <div class="ds-stat-trend" id="${idTrend}" style="font-size:11px; font-weight:600; display:flex; align-items:center; gap:6px; margin-top:8px">
            <span style="color:var(--ok)">▲</span>
            <span style="color:var(--text-2)">—%</span>
        </div>
    </div>`
}

function tileInicio(label, id, cor, paths) {
    return `
    <div class="ds-tile-modern">
        <div style="display:flex; align-items:center; gap:8px">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">${paths}</svg>
            <span class="ds-tile-label-modern">${label}</span>
        </div>
        <span class="ds-tile-value-modern" style="color:${cor}" id="${id}">—</span>
    </div>`
}

/* ── dados ─────────────────────────────────────────────────── */
async function carregarDadosDashboard() {
    try {
        const res = await fetch(API + '/dashboard', { headers: authHeaders() })
        const d = await res.json()
        if (!res.ok) throw new Error(d.error || 'Erro ao carregar')

        animarNumero('dv-total-produtos', d.totalProdutos || 0)
        animarNumero('dv-sem-ean', d.semEan || 0)
        animarNumero('dv-placas-total', d.placasMes?.total || 0)
        animarNumero('dv-listas-mes', d.listasMes || 0)
        animarNumero('dv-resumo-imagem', d.semImagem || 0)
        animarNumero('dv-resumo-nao-verificados', d.naoVerificados || 0)
        animarNumero('dv-resumo-impressas', d.impressasMes?.impressas || 0)
        animarNumero('dv-resumo-geradas', d.impressasMes?.geradas || 0)

        el('dv-placas-pequena').textContent = (d.placasMes?.pequena || 0).toLocaleString('pt-BR')
        el('dv-placas-grande').textContent = (d.placasMes?.grande || 0).toLocaleString('pt-BR')
        el('dv-placas-media').textContent = (d.placasMes?.media || 0).toLocaleString('pt-BR')

        renderGraficoDias(d.placasDias || [])
        renderGraficoDepartamentos(d.porDepto || [])
        renderGraficoTipos(d.placasMes || {})
        renderTopProdutos(d.topProdutos || [])

    } catch (e) {
        const msg = e && e.name === 'TimeoutError'
            ? 'Sem conexão com o servidor. Verifique se ele está rodando.'
            : (e && e.message) || 'Erro ao carregar'
        console.warn('[Início] ' + msg)
        const top = el('dv-top-produtos')
        if (top) top.innerHTML = `<div style="text-align:center; padding:32px 16px; color:var(--text-3); font-size:12.5px">${msg}<br><button class="ds-btn ds-btn-sm" style="margin-top:12px" onclick="carregarInicio()">Tentar novamente</button></div>`
        ;['dv-total-produtos','dv-placas-total','dv-sem-ean','dv-listas-mes','dv-resumo-imagem','dv-resumo-nao-verificados','dv-resumo-impressas','dv-resumo-geradas','dv-placas-pequena','dv-placas-grande','dv-placas-media'].forEach(id => {
            const node = el(id)
            if (node) node.textContent = '—'
        })
    }
}

function el(id) { return document.getElementById(id) }

/** Contagem crescente suave dos KPIs. */
function animarNumero(id, valorFinal) {
    const node = el(id)
    if (!node) return
    const alvo = Number(valorFinal) || 0
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        node.textContent = alvo.toLocaleString('pt-BR')
        return
    }
    const duracao = 900
    const inicio = performance.now()
    const passo = (agora) => {
        const t = Math.min((agora - inicio) / duracao, 1)
        const ease = 1 - Math.pow(1 - t, 3)
        node.textContent = Math.round(alvo * ease).toLocaleString('pt-BR')
        if (t < 1 && el(id) === node) requestAnimationFrame(passo)
    }
    requestAnimationFrame(passo)
}

/* ── tema / cores ──────────────────────────────────────────── */
const CHART_PALETTE = [
    '#e11d48', '#f97316', '#f59e0b', '#eab308', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
    '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#fb7185',
    '#fbbf24', '#34d399', '#38bdf8', '#818cf8', '#c084fc'
]
const chartColor = (i) => CHART_PALETTE[i % CHART_PALETTE.length]

function dashTema() {
    const light = document.body.classList.contains('theme-light')
    const css = getComputedStyle(document.documentElement)
    return {
        light,
        texto: light ? '#64748b' : '#6f6f7b',
        grid: light ? '#e2e8f0' : '#24242c',
        superficie: light ? '#ffffff' : '#141418'
    }
}

function dashBaseOptions(tema, altura) {
    return {
        chart: {
            height: altura,
            width: '100%',
            fontFamily: 'Inter, Arial, sans-serif',
            background: 'transparent',
            foreColor: tema.texto,
            toolbar: { show: false },
            zoom: { enabled: false },
            parentHeightOffset: 0,
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 900,
                animateGradually: { enabled: true, delay: 90 },
                dynamicAnimation: { enabled: true, speed: 400 }
            }
        },
        theme: { mode: tema.light ? 'light' : 'dark' },
        grid: { borderColor: tema.grid, strokeDashArray: 4, padding: { left: 0, right: 8, top: -8, bottom: 0 } },
        legend: { show: false },
        dataLabels: { enabled: false },
        tooltip: { theme: tema.light ? 'light' : 'dark' }
    }
}

/* ── gráfico de área: placas por dia ──────────────────────── */
function renderGraficoDias(dados) {
    const node = document.getElementById('chart-placas-dias')
    if (!node || !window.ApexCharts) return
    if (chartDias) { chartDias.destroy(); chartDias = null }

    const tema = dashTema()
    const labels = dados.map(d => {
        const s = String(d.dia || '')
        const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
        return m ? `${m[3]}/${m[2]}` : s
    })
    const values = dados.map(d => Number(d.total) || 0)

    const opcoes = {
        ...dashBaseOptions(tema, 260),
        chart: { ...dashBaseOptions(tema, 260).chart, type: 'area', sparkline: { enabled: false } },
        series: [{ name: 'Placas', data: values }],
        colors: ['#e11d48'],
        stroke: { curve: 'smooth', width: 3 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.42,
                opacityTo: 0.03,
                stops: [0, 70, 100],
                colorStops: [{
                    offset: 0, color: '#e11d48', opacity: 0.4
                }, {
                    offset: 60, color: '#a855f7', opacity: 0.16
                }, {
                    offset: 100, color: '#3b82f6', opacity: 0.02
                }]
            }
        },
        markers: {
            size: values.map(v => v > 0 ? 4 : 0),
            colors: values.map((_, i) => chartColor(i)),
            strokeColors: tema.superficie,
            strokeWidth: 2,
            hover: { size: 7 }
        },
        xaxis: {
            categories: labels,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { rotate: 0, trim: true, hideOverlappingLabels: true, style: { fontSize: '10px', colors: tema.texto } },
            tooltip: { enabled: false }
        },
        yaxis: {
            min: 0,
            forceNiceScale: true,
            labels: { formatter: v => Math.round(v).toLocaleString('pt-BR'), style: { fontSize: '10px', colors: tema.texto } }
        },
        tooltip: {
            theme: tema.light ? 'light' : 'dark',
            x: { show: true },
            y: { formatter: v => `${v} placa(s)` }
        }
    }

    chartDias = new ApexCharts(node, opcoes)
    chartDias.render()
}

/* ── gráfico de barras: departamentos ─────────────────────── */
function renderGraficoDepartamentos(dados) {
    const node = document.getElementById('chart-departamentos')
    if (!node || !window.ApexCharts) return
    if (chartDepto) { chartDepto.destroy(); chartDepto = null }

    const tema = dashTema()
    const labels = dados.map(d => d.depto || 'Sem depto')
    const values = dados.map(d => Number(d.total) || 0)

    const opcoes = {
        ...dashBaseOptions(tema, 260),
        chart: { ...dashBaseOptions(tema, 260).chart, type: 'bar' },
        series: [{ name: 'Produtos', data: values }],
        colors: labels.map((_, i) => chartColor(i)),
        plotOptions: {
            bar: {
                distributed: true,
                borderRadius: 6,
                borderRadiusApplication: 'end',
                columnWidth: '55%',
                dataLabels: { position: 'top' }
            }
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: labels,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { rotate: -45, trim: true, hideOverlappingLabels: false, style: { fontSize: '10px', colors: tema.texto } }
        },
        yaxis: {
            min: 0,
            forceNiceScale: true,
            labels: { formatter: v => Math.round(v).toLocaleString('pt-BR'), style: { fontSize: '10px', colors: tema.texto } }
        },
        tooltip: { theme: tema.light ? 'light' : 'dark', y: { formatter: v => `${v} produto(s)` } }
    }

    chartDepto = new ApexCharts(node, opcoes)
    chartDepto.render()
}

/* ── gráfico de rosca: tipos de placa ─────────────────────── */
function renderGraficoTipos(dados) {
    const node = document.getElementById('chart-tipos-placa')
    if (!node || !window.ApexCharts) return
    if (chartTipos) { chartTipos.destroy(); chartTipos = null }

    const tema = dashTema()
    const valores = [Number(dados.pequena) || 0, Number(dados.grande) || 0, Number(dados.media) || 0]
    const total = valores.reduce((a, b) => a + b, 0)

    const opcoes = {
        ...dashBaseOptions(tema, 225),
        chart: { ...dashBaseOptions(tema, 225).chart, type: 'donut' },
        series: valores,
        labels: ['Pequena', 'Grande', 'Média'],
        colors: ['#e11d48', '#f59e0b', '#3b82f6'],
        stroke: { colors: [tema.superficie], width: 3 },
        dataLabels: {
            enabled: true,
            formatter: (val) => total ? `${Math.round(val)}%` : '0%',
            style: { fontSize: '10px', fontWeight: 700 },
            dropShadow: { enabled: false }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '72%',
                    labels: {
                        show: true,
                        name: { show: true, fontSize: '11px', color: tema.texto },
                        value: { show: true, fontSize: '20px', fontWeight: 800, color: tema.light ? '#0f172a' : '#f4f4f6', formatter: v => Math.round(v).toLocaleString('pt-BR') },
                        total: {
                            show: true,
                            label: 'Total',
                            fontSize: '11px',
                            color: tema.texto,
                            formatter: () => total.toLocaleString('pt-BR')
                        }
                    }
                }
            }
        },
        tooltip: { theme: tema.light ? 'light' : 'dark', y: { formatter: v => `${v} placa(s)` } }
    }

    chartTipos = new ApexCharts(node, opcoes)
    chartTipos.render()
}

/* ── top produtos ──────────────────────────────────────────── */
function renderTopProdutos(dados) {
    const container = el('dv-top-produtos')
    if (!container) return

    if (!dados || dados.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px 20px; color:var(--text-3)"><p>Sem dados no período</p></div>'
        return
    }

    container.innerHTML = dados.map((d, i) => {
        const medalha = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
        const cor = i === 0 ? 'var(--warn)' : i === 1 ? 'var(--text-2)' : i === 2 ? 'var(--brand-2)' : 'var(--text-3)'
        return `
        <div class="ds-top-item" style="display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:8px; margin-bottom:6px; background:var(--surface-1); border:1px solid var(--border); ${i < 3 ? 'border-left:3px solid ' + cor : ''}">
            <span style="font-size:16px; color:${cor}; font-weight:700; width:24px">${medalha}</span>
            <div style="flex:1; min-width:0">
                <div style="font-size:12.5px; font-weight:600; color:var(--text-1); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${dashEscInicio(d.descricao || 'Sem nome')}</div>
                <div style="font-size:10.5px; color:var(--text-3)">${dashEscInicio(d.tipo_placa || '')} • ${d.total || 0} placa(s)</div>
            </div>
            <span style="font-size:12px; font-weight:700; color:var(--text-1)">${d.total || 0}</span>
        </div>`
    }).join('')
}

function dashEscInicio(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]))
}
