async function carregarDashboard() {
    setActive('btn-dashboard')

    setConteudo(`
        <div id="dash-loading" class="flex items-center justify-center py-20">
            <div class="text-center">
                <svg class="animate-spin mx-auto mb-4" width="32" height="32" fill="none" stroke="rgba(181,21,21,0.6)" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                <p class="text-sm" style="color:rgba(255,255,255,0.3);">Carregando dados...</p>
            </div>
        </div>
        <div id="dash-conteudo" style="display:none;"></div>
    `, 'Dashboard')

    try {
        const res  = await fetch(API+'/dashboard', { headers: authHeaders() })
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Erro ao carregar dashboard')

        document.getElementById('dash-loading').style.display = 'none'
        const el = document.getElementById('dash-conteudo')
        el.style.display = 'block'
        el.innerHTML = dashRenderizar(data)

        dashGraficoDepto(data.porDepto)
        dashGraficoDias(data.placasDias)
        dashAnimateCounters()

    } catch (e) {
        console.error(e)
        document.getElementById('dash-loading').innerHTML = `
            <div class="text-center py-20">
                <div style="color:rgba(248,113,113,0.8); font-size:14px;">Erro: ${e.message}</div>
                <button onclick="carregarDashboard()" class="mt-4 px-5 py-2 text-sm font-semibold rounded-lg text-white" style="background:#b51515;">Tentar novamente</button>
            </div>`
    }
}

function dashRenderizar(d) {
    const mes = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
    const pct = (v, t) => t > 0 ? ((v / t) * 100).toFixed(1) : 0

    return `
        <div style="max-width:1200px; margin:0 auto;">

            <!-- Cabeçalho -->
            <div class="dash-animate" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px;">
                <div>
                    <p style="font-size:14px; font-weight:600; color:rgba(255,255,255,0.9); text-transform:capitalize;">${mes}</p>
                    <p style="font-size:12px; color:rgba(255,255,255,0.25); margin-top:2px;">Visão geral do sistema</p>
                </div>
                <button onclick="carregarDashboard()" class="dash-refresh-btn">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                    Atualizar
                </button>
            </div>

            <!-- Cards principais -->
            <div class="dash-grid-cards" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; margin-bottom:20px;">
                ${dashCard(
                    '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
                    'Total de Produtos', Number(d.totalProdutos).toLocaleString('pt-BR'),
                    '#3b82f6', 'rgba(59,130,246,0.12)', '#3b82f680'
                )}
                ${dashCard(
                    '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
                    'Placas no Mês', Number(d.placasMes?.total || 0).toLocaleString('pt-BR'),
                    '#b51515', 'rgba(181,21,21,0.12)', '#b5151580'
                )}
                ${dashCard(
                    '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
                    'Impressas no Mês', Number(d.impressasMes?.impressas || 0).toLocaleString('pt-BR'),
                    '#22c55e', 'rgba(34,197,94,0.12)', '#22c55e80'
                )}
                ${dashCard(
                    '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
                    'Listas no Mês', Number(d.listasMes || 0).toLocaleString('pt-BR'),
                    '#a855f7', 'rgba(168,85,247,0.12)', '#a855f780'
                )}
            </div>

            <!-- Placas por Tipo + Status de Impressão + Atenção -->
            <div class="dash-grid-3" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:20px;">
                ${dashCardPlacasTipo(d)}
                ${dashCardStatusImpressao(d)}
                ${dashCardAtencao(d)}
            </div>

            <!-- Gráficos -->
            <div class="dash-grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
                <div class="dash-glass dash-animate">
                    <p class="dash-section-title" style="margin-bottom:16px; padding:20px 20px 0 20px;">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="display:inline; vertical-align:middle; margin-right:6px;"><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>
                        Produtos por Departamento
                    </p>
                    <div style="padding:0 20px 20px 20px;">
                        <canvas id="chart-depto" height="260"></canvas>
                    </div>
                </div>
                <div class="dash-glass dash-animate">
                    <p class="dash-section-title" style="margin-bottom:16px; padding:20px 20px 0 20px;">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="display:inline; vertical-align:middle; margin-right:6px;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                        Placas — Últimos 30 Dias
                    </p>
                    <div style="padding:0 20px 20px 20px;">
                        <canvas id="chart-dias" height="260"></canvas>
                    </div>
                </div>
            </div>

            <!-- Top 10 -->
            <div class="dash-glass dash-animate">
                <p class="dash-section-title" style="padding:20px 20px 0 20px;">
                    <svg width="14" height="14" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="display:inline; vertical-align:middle; margin-right:6px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Top 10 Produtos com Mais Placas
                </p>
                <div style="padding:0 20px 20px 20px;">
                    <div class="dash-table-wrap">
                        <table class="dash-table">
                            <thead>
                                <tr>
                                    <th style="width:48px;">#</th>
                                    <th>Produto</th>
                                    <th style="width:100px;">Tipo</th>
                                    <th style="width:80px; text-align:right;">Qtd</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${d.topProdutos.map((p, i) => `
                                    <tr>
                                        <td><div class="dash-rank ${i < 3 ? 'top' + (i+1) : ''}">${i + 1}</div></td>
                                        <td style="font-weight:600; color:rgba(255,255,255,0.85);">${p.descricao}</td>
                                        <td>${dashTipoBadge(p.tipo_placa)}</td>
                                        <td style="text-align:right; font-weight:800; color:#b51515;">${p.total}</td>
                                    </tr>
                                `).join('')}
                                ${!d.topProdutos.length ? `<tr><td colspan="4" style="text-align:center; padding:24px; color:rgba(255,255,255,0.25); font-size:13px;">Nenhuma placa gerada este mês.</td></tr>` : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    `
}

function dashCard(icon, label, valorFormatado, color, bg, glow) {
    const raw = valorFormatado.replace(/\./g, '').replace(/,/g, '')
    return `
        <div class="dash-glass dash-animate" style="padding:20px; position:relative; overflow:hidden;">
            <div style="position:absolute; top:-40px; right:-40px; width:120px; height:120px; border-radius:50%; background:${glow}; filter:blur(40px); pointer-events:none;"></div>
            <div style="display:flex; align-items:center; gap:14px; margin-bottom:12px;">
                <div class="dash-card-icon" style="background:${bg}; color:${color};">${icon}</div>
                <span style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:rgba(255,255,255,0.35);">${label}</span>
            </div>
            <div class="dash-stat-value" style="color:${color};" data-target="${raw}">${valorFormatado}</div>
        </div>
    `
}

function dashCardPlacasTipo(d) {
    const total = d.placasMes?.total || 0
    const pct = (v) => total > 0 ? ((v / total) * 100).toFixed(1) : 0
    return `
        <div class="dash-glass dash-animate" style="padding:20px;">
            <p class="dash-section-title">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="display:inline; vertical-align:middle; margin-right:6px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                Placas por Tipo
            </p>
            <div style="display:flex; flex-direction:column; gap:14px;">
                ${dashBarraModerno('Branca', d.placasMes?.branca || 0, total, '#6b7280', 'rgba(107,114,128,0.15)')}
                ${dashBarraModerno('Amarela', d.placasMes?.amarela || 0, total, '#eab308', 'rgba(234,179,8,0.15)')}
                ${dashBarraModerno('Grande', d.placasMes?.grande || 0, total, '#b51515', 'rgba(181,21,21,0.15)')}
            </div>
        </div>
    `
}

function dashCardStatusImpressao(d) {
    const total = d.placasMes?.total || 0
    const pct = (v, t) => t > 0 ? ((v / t) * 100).toFixed(1) : 0
    const impressas = d.impressasMes?.impressas || 0
    const geradas = d.impressasMes?.geradas || 0
    return `
        <div class="dash-glass dash-animate" style="padding:20px;">
            <p class="dash-section-title">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="display:inline; vertical-align:middle; margin-right:6px;"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Status de Impressão
            </p>
            <div style="display:flex; flex-direction:column; gap:16px;">
                <div>
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
                        <div style="font-size:13px; font-weight:600; color:rgba(255,255,255,0.6);">Impressas</div>
                        <div style="font-size:14px; font-weight:800; color:#22c55e;">${impressas.toLocaleString('pt-BR')} <span style="font-weight:400; font-size:12px; color:rgba(255,255,255,0.25);">(${pct(impressas, total)}%)</span></div>
                    </div>
                    <div class="dash-progress-track">
                        <div class="dash-progress-fill" style="width:${pct(impressas, total)}%;background:linear-gradient(90deg,#22c55e,#16a34a);"></div>
                    </div>
                </div>
                <div>
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
                        <div style="font-size:13px; font-weight:600; color:rgba(255,255,255,0.6);">Só Geradas</div>
                        <div style="font-size:14px; font-weight:800; color:#3b82f6;">${geradas.toLocaleString('pt-BR')} <span style="font-weight:400; font-size:12px; color:rgba(255,255,255,0.25);">(${pct(geradas, total)}%)</span></div>
                    </div>
                    <div class="dash-progress-track">
                        <div class="dash-progress-fill" style="width:${pct(geradas, total)}%;background:linear-gradient(90deg,#3b82f6,#2563eb);"></div>
                    </div>
                </div>
            </div>
        </div>
    `
}

function dashCardAtencao(d) {
    return `
        <div class="dash-glass dash-animate" style="padding:20px;">
            <p class="dash-section-title">
                <svg width="14" height="14" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="display:inline; vertical-align:middle; margin-right:6px;"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Atenção
            </p>
            <div style="display:flex; flex-direction:column; gap:8px;">
                <div class="dash-alert-box" style="background:rgba(234,179,8,0.1);">
                    <div style="font-size:13px; font-weight:600; color:#eab308;">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="display:inline; vertical-align:middle; margin-right:6px;"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                        Sem EAN
                    </div>
                    <div style="font-size:16px; font-weight:800; color:#eab308;">${Number(d.semEan).toLocaleString('pt-BR')}</div>
                </div>
                <div class="dash-alert-box" style="background:rgba(239,68,68,0.1);">
                    <div style="font-size:13px; font-weight:600; color:#ef4444;">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="display:inline; vertical-align:middle; margin-right:6px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        Sem Imagem
                    </div>
                    <div style="font-size:16px; font-weight:800; color:#ef4444;">${Number(d.semImagem).toLocaleString('pt-BR')}</div>
                </div>
                <div class="dash-alert-box" style="background:rgba(59,130,246,0.1);">
                    <div style="font-size:13px; font-weight:600; color:#3b82f6;">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="display:inline; vertical-align:middle; margin-right:6px;"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                        Total Produtos
                    </div>
                    <div style="font-size:16px; font-weight:800; color:#3b82f6;">${Number(d.totalProdutos).toLocaleString('pt-BR')}</div>
                </div>
            </div>
        </div>
    `
}

function dashBarraModerno(label, valor, total, cor, bg) {
    const pct = total > 0 ? ((valor / total) * 100).toFixed(1) : 0
    return `
        <div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="width:8px; height:8px; border-radius:50%; background:${cor};"></span>
                    <div style="font-size:13px; font-weight:600; color:rgba(255,255,255,0.6);">${label}</div>
                </div>
                <div style="font-size:13px; font-weight:700; color:rgba(255,255,255,0.8);">${Number(valor).toLocaleString('pt-BR')} <span style="font-weight:400; color:rgba(255,255,255,0.25);">(${pct}%)</span></div>
            </div>
            <div class="dash-progress-track">
                <div class="dash-progress-fill" style="width:${pct}%;background:linear-gradient(90deg,${cor},${cor}cc);"></div>
            </div>
        </div>
    `
}

function dashTipoBadge(tipo) {
    const map = {
        branca:  ['rgba(255,255,255,0.06)','rgba(255,255,255,0.4)','Branca'],
        amarela: ['rgba(234,179,8,0.15)','#eab308','Amarela'],
        grande:  ['rgba(181,21,21,0.15)','#b51515','Grande'],
    }
    const [bg, color, label] = map[tipo] || ['rgba(255,255,255,0.06)','rgba(255,255,255,0.4)', tipo]
    return `<div class="dash-badge" style="background:${bg}; color:${color};">${label}</div>`
}

function dashAnimateCounters() {
    document.querySelectorAll('.dash-stat-value[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target)
        if (isNaN(target)) return
        const dur = 800
        const start = performance.now()
        function update(now) {
            const t = Math.min((now - start) / dur, 1)
            const eased = 1 - Math.pow(1 - t, 3)
            el.textContent = Math.floor(eased * target).toLocaleString('pt-BR')
            if (t < 1) requestAnimationFrame(update)
        }
        requestAnimationFrame(update)
    })
}

async function dashCarregarChartJS() {
    if (window.Chart) return
    await new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
        s.onload = resolve; s.onerror = reject
        document.head.appendChild(s)
    })
}

async function dashGraficoDepto(porDepto) {
    await dashCarregarChartJS()
    const canvas = document.getElementById('chart-depto')
    if (!canvas) return

    const labels = porDepto.map(d => d.depto.length > 20 ? d.depto.slice(0, 20) + '\u2026' : d.depto)
    const valores = porDepto.map(d => d.total)
    const cores = [
        '#b51515','#3b82f6','#22c55e','#eab308','#a855f7',
        '#06b6d4','#ec4899','#14b8a6','#f97316','#6366f1',
        '#dc2626','#2563eb','#16a34a','#d97706','#8b5cf6'
    ]

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Produtos',
                data: valores,
                backgroundColor: cores.slice(0, valores.length),
                borderRadius: 4,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    titleColor: '#fafafa',
                    bodyColor: '#a1a1aa',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: ctx => ` ${ctx.parsed.y.toLocaleString('pt-BR')} produtos`
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 }, maxRotation: 40 },
                    grid: { display: false }
                },
                y: {
                    ticks: { color: 'rgba(255,255,255,0.2)', font: { size: 11 } },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                }
            }
        }
    })
}

async function dashGraficoDias(placasDias) {
    await dashCarregarChartJS()
    const canvas = document.getElementById('chart-dias')
    if (!canvas) return

    const hoje = new Date()
    const labels = [], valores = []
    for (let i = 29; i >= 0; i--) {
        const d = new Date(hoje)
        d.setDate(hoje.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        const found = placasDias.find(p => {
            const pDate = new Date(p.dia)
            return pDate.toISOString().slice(0, 10) === key
        })
        labels.push(label)
        valores.push(found ? parseInt(found.total) : 0)
    }

    new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Placas',
                data: valores,
                borderColor: '#b51515',
                backgroundColor: (ctx) => {
                    if (!ctx.chart.chartArea) return 'rgba(181,21,21,0.08)'
                    const g = ctx.chart.ctx.createLinearGradient(0, ctx.chart.chartArea.top, 0, ctx.chart.chartArea.bottom)
                    g.addColorStop(0, 'rgba(181,21,21,0.25)')
                    g.addColorStop(1, 'rgba(181,21,21,0.01)')
                    return g
                },
                borderWidth: 2.5,
                pointBackgroundColor: '#b51515',
                pointBorderColor: 'rgba(255,255,255,0.15)',
                pointBorderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.35,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    titleColor: '#fafafa',
                    bodyColor: '#a1a1aa',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: ctx => ` ${ctx.parsed.y} placa(s)`
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 9 }, maxTicksLimit: 10 },
                    grid: { display: false }
                },
                y: {
                    ticks: { color: 'rgba(255,255,255,0.2)', font: { size: 11 }, stepSize: 1 },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    beginAtZero: true
                }
            }
        }
    })
}
