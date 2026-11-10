/* ═══════════════════════════════════════════════════════════════
   PÁGINA INÍCIO — Dashboard estatístico moderno
   ═══════════════════════════════════════════════════════════════ */

let chartDias = null
let chartDepto = null
let chartTipos = null

function carregarInicio() {
    setActive('btn-inicio')

    setConteudo(`
        <div class="ds-page-head fade-in">
            <div>
                <div class="ds-page-eyebrow">Painel de controle</div>
                <h1 class="ds-page-title">Visão geral</h1>
                <p class="ds-page-sub">Produtos, placas, listas e estatísticas do sistema em tempo real</p>
            </div>
            <div class="flex items-center gap-2">
                <span class="ds-chip ds-chip-ok">
                    <span style="width:6px;height:6px;border-radius:50%;background:currentColor;display:inline-block"></span>
                    Sistema online
                </span>
            </div>
        </div>

        <!-- Ações rápidas -->
        <div class="ds-grid ds-grid-4" style="margin-bottom:28px">
            ${acaoInicio('Gerar placas', 'Placa Pequena, grande e A4', 'btn-placas-menu', '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>')}
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
            <!-- Gráfico de linha: placas por dia -->
            <div class="ds-card">
                <div class="ds-card-head">
                    <div class="ds-card-title">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 18 6 12 2 12"/></svg>
                        Placas por dia
                    </div>
                    <span class="ds-chip ds-chip-info" style="font-size:10px; padding:2px 8px">Últimos 30 dias</span>
                </div>
                <div class="ds-card-pad" style="padding-top:16px">
                    <div style="height:260px; position:relative">
                        <canvas id="chart-placas-dias"></canvas>
                    </div>
                </div>
            </div>

            <!-- Gráfico de rosca: tipos de placa -->
            <div class="ds-card">
                <div class="ds-card-head">
                    <div class="ds-card-title">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Tipos de placa
                    </div>
                </div>
                <div class="ds-card-pad" style="padding-top:16px">
                    <div style="height:225px; position:relative">
                        <canvas id="chart-tipos-placa"></canvas>
                    </div>
                    <div class="ds-grid ds-grid-3" style="margin-top:16px; gap:12px">
                        <div class="ds-tile-item">
                            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--brand);margin-right:6px"></span>
                            <span class="ds-tile-label" style="font-size:11px">Placa Pequena</span>
                            <span class="ds-tile-value" id="dv-placas-pequena" style="font-size:11px; font-weight:600">—</span>
                        </div>
                        <div class="ds-tile-item">
                            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--warn);margin-right:6px"></span>
                            <span class="ds-tile-label" style="font-size:11px">A4</span>
                            <span class="ds-tile-value" id="dv-placas-a4" style="font-size:11px; font-weight:600">—</span>
                        </div>
                        <div class="ds-tile-item">
                            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--info);margin-right:6px"></span>
                            <span class="ds-tile-label" style="font-size:11px">Grande</span>
                            <span class="ds-tile-value" id="dv-placas-grande" style="font-size:11px; font-weight:600">—</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Segunda linha: departamentos + top produtos -->
        <div class="ds-grid" style="grid-template-columns: 1fr 2fr; gap:28px; margin-bottom:28px">
            <!-- Gráfico de barras: departamentos -->
            <div class="ds-card">
                <div class="ds-card-head">
                    <div class="ds-card-title">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        Produtos por departamento
                    </div>
                </div>
                <div class="ds-card-pad" style="padding-top:16px">
                    <div style="height:260px; position:relative">
                        <canvas id="chart-departamentos"></canvas>
                    </div>
                </div>
            </div>

            <!-- Top produtos -->
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
        <div class="flex items-center justify-between" style="margin-bottom:14px">
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

        // KPIs
        el('dv-total-produtos').textContent = (d.totalProdutos || 0).toLocaleString('pt-BR')
        el('dv-sem-ean').textContent = (d.semEan || 0).toLocaleString('pt-BR')
        el('dv-placas-total').textContent = (d.placasMes?.total || 0).toLocaleString('pt-BR')
        el('dv-listas-mes').textContent = (d.listasMes || 0).toLocaleString('pt-BR')
        el('dv-resumo-imagem').textContent = (d.semImagem || 0).toLocaleString('pt-BR')
        el('dv-resumo-nao-verificados').textContent = (d.naoVerificados || 0).toLocaleString('pt-BR')
        el('dv-resumo-impressas').textContent = (d.impressasMes?.impressas || 0).toLocaleString('pt-BR')
        el('dv-resumo-geradas').textContent = (d.impressasMes?.geradas || 0).toLocaleString('pt-BR')

        // Tipos de placa
        el('dv-placas-pequena').textContent = (d.placasMes?.pequena || 0).toLocaleString('pt-BR')
        el('dv-placas-a4').textContent = (d.placasMes?.a4 || 0).toLocaleString('pt-BR')
        el('dv-placas-grande').textContent = (d.placasMes?.grande || 0).toLocaleString('pt-BR')

        // Gráficos
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
        ;['dv-total-produtos','dv-placas-total','dv-sem-ean','dv-listas-mes','dv-resumo-imagem','dv-resumo-nao-verificados','dv-resumo-impressas','dv-resumo-geradas','dv-placas-pequena','dv-placas-a4','dv-placas-grande'].forEach(id => {
            const node = el(id)
            if (node) node.textContent = '—'
        })
    }
}

function el(id) { return document.getElementById(id) }

/* ── cores ──────────────────────────────────────────────────── */
const CHART_PALETTE = [
    '#e11d48', '#f97316', '#f59e0b', '#eab308', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
    '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#fb7185',
    '#fbbf24', '#34d399', '#38bdf8', '#818cf8', '#c084fc'
]
const chartColor = (i) => CHART_PALETTE[i % CHART_PALETTE.length]

/* ── gráfico de linha: placas por dia ──────────────────────── */
function renderGraficoDias(dados) {
    const ctx = document.getElementById('chart-placas-dias')
    if (!ctx) return
    if (chartDias) chartDias.destroy()

    const labels = dados.map(d => d.dia)
    const values = dados.map(d => d.total)

    const canvas = ctx.getContext('2d')
    const grad = canvas.createLinearGradient(0, 0, canvas.canvas.width, 0)
    grad.addColorStop(0, '#e11d48')
    grad.addColorStop(0.25, '#f97316')
    grad.addColorStop(0.5, '#f59e0b')
    grad.addColorStop(0.75, '#22c55e')
    grad.addColorStop(1, '#3b82f6')
    const fillGrad = canvas.createLinearGradient(0, 0, 0, canvas.canvas.height)
    fillGrad.addColorStop(0, 'rgba(59,130,246,0.25)')
    fillGrad.addColorStop(0.5, 'rgba(168,85,247,0.12)')
    fillGrad.addColorStop(1, 'rgba(225,29,72,0.02)')

    chartDias = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Placas',
                data: values,
                borderColor: grad,
                backgroundColor: fillGrad,
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: ctx => (ctx.raw > 0 ? 4 : 0),
                pointHoverRadius: 7,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointBackgroundColor: ctx => chartColor(ctx.dataIndex),
                pointRotation: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: 'var(--text-3)', font: { size: 10 } } },
                y: { grid: { color: 'var(--border)' }, beginAtZero: true, ticks: { color: 'var(--text-3)', font: { size: 10 } } }
            }
        }
    })
}

/* ── gráfico de barras: departamentos ──────────────────────── */
function renderGraficoDepartamentos(dados) {
    const ctx = document.getElementById('chart-departamentos')
    if (!ctx) return
    if (chartDepto) chartDepto.destroy()

    chartDepto = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: dados.map(d => d.depto || 'Sem depto'),
            datasets: [{
                label: 'Produtos',
                data: dados.map(d => d.total),
                backgroundColor: dados.map((_, i) => chartColor(i)),
                borderRadius: 6,
                barThickness: 20,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: 'var(--text-3)', font: { size: 10 }, maxRotation: 45, minRotation: 45 } },
                y: { grid: { color: 'var(--border)' }, beginAtZero: true, ticks: { color: 'var(--text-3)', font: { size: 10 } } }
            }
        }
    })
}

/* ── gráfico de rosca: tipos de placa ──────────────────────── */
function renderGraficoTipos(dados) {
    const ctx = document.getElementById('chart-tipos-placa')
    if (!ctx) return
    if (chartTipos) chartTipos.destroy()

    chartTipos = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Placa Pequena', 'Grande', 'A4'],
            datasets: [{
                data: [dados.pequena || 0, dados.grande || 0, dados.a4 || 0],
                backgroundColor: ['#e11d48', '#3b82f6', '#f59e0b'],
                hoverBackgroundColor: ['#f43f5e', '#60a5fa', '#fbbf24'],
                borderWidth: 2,
                borderColor: 'var(--surface-1)',
                hoverOffset: 18
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => ctx.label + ': ' + ctx.parsed + ' placa(s)' } }
            }
        }
    })
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
                <div style="font-size:12.5px; font-weight:600; color:var(--text-1); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${d.descricao || 'Sem nome'}</div>
                <div style="font-size:10.5px; color:var(--text-3)">${d.tipo_placa || ''} • ${d.total || 0} placa(s)</div>
            </div>
            <span style="font-size:12px; font-weight:700; color:var(--text-1)">${d.total || 0}</span>
        </div>`
    }).join('')
}
