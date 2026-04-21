async function carregarDashboard() {
    setActive('btn-dashboard')

    setConteudo(`
        <div id="dash-loading" class="flex items-center justify-center py-20">
            <div class="text-center">
                <div class="text-4xl mb-3">⏳</div>
                <p class="text-sm text-gray-400">Carregando dados...</p>
            </div>
        </div>
        <div id="dash-conteudo" style="display:none;"></div>
    `, 'Dashboard')

    try {
        const res  = await fetch('http://localhost:3000/dashboard', { headers: authHeaders() })
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Erro ao carregar dashboard')

        document.getElementById('dash-loading').style.display = 'none'
        const el = document.getElementById('dash-conteudo')
        el.style.display = 'block'
        el.innerHTML = dashRenderizar(data)

        // Renderiza gráficos após o HTML estar no DOM
        dashGraficoDepto(data.porDepto)
        dashGraficoDias(data.placasDias)

    } catch (e) {
        console.error(e)
        document.getElementById('dash-loading').innerHTML = `
            <div class="text-center py-20">
                <p class="text-red-400 text-sm">Erro ao carregar dashboard: ${e.message}</p>
                <button onclick="carregarDashboard()" class="mt-4 px-4 py-2 text-white text-sm rounded-lg" style="background:#b51515;">🔄 Tentar novamente</button>
            </div>`
    }
}

function dashRenderizar(d) {
    const mes = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
    const pct = (v, t) => t > 0 ? ((v / t) * 100).toFixed(1) : 0

    return `
        <!-- Cabeçalho -->
        <div class="flex items-center justify-between mb-5">
            <p class="text-sm text-gray-400">📅 ${mes.charAt(0).toUpperCase() + mes.slice(1)}</p>
            <button onclick="carregarDashboard()" class="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">🔄 Atualizar</button>
        </div>

        <!-- Cards principais -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            ${dashCard('📦', 'Total de Produtos', Number(d.totalProdutos).toLocaleString('pt-BR'), '#1d4ed8', '#dbeafe')}
            ${dashCard('🏷️', 'Placas no Mês', Number(d.placasMes?.total || 0).toLocaleString('pt-BR'), '#b51515', '#fee2e2')}
            ${dashCard('🖨️', 'Impressas no Mês', Number(d.impressasMes?.impressas || 0).toLocaleString('pt-BR'), '#16a34a', '#dcfce7')}
            ${dashCard('📋', 'Listas no Mês', Number(d.listasMes || 0).toLocaleString('pt-BR'), '#7c3aed', '#f3e8ff')}
        </div>

        <!-- Cards de alertas -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">📊 Placas por Tipo — Mês Atual</p>
                <div class="flex flex-col gap-2">
                    ${dashBarra('Branca', d.placasMes?.branca || 0, d.placasMes?.total || 0, '#6b7280')}
                    ${dashBarra('Amarela', d.placasMes?.amarela || 0, d.placasMes?.total || 0, '#d97706')}
                    ${dashBarra('Grande', d.placasMes?.grande || 0, d.placasMes?.total || 0, '#b51515')}
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">🖨️ Status de Impressão — Mês Atual</p>
                <div class="flex flex-col gap-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600">✅ Impressas</span>
                        <span class="font-bold text-green-600">${Number(d.impressasMes?.impressas || 0).toLocaleString('pt-BR')}</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                        <div class="h-2 rounded-full" style="width:${pct(d.impressasMes?.impressas, d.placasMes?.total)}%;background:#16a34a;"></div>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600">💾 Só Geradas</span>
                        <span class="font-bold text-blue-600">${Number(d.impressasMes?.geradas || 0).toLocaleString('pt-BR')}</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                        <div class="h-2 rounded-full" style="width:${pct(d.impressasMes?.geradas, d.placasMes?.total)}%;background:#1d4ed8;"></div>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">⚠️ Atenção</p>
                <div class="flex flex-col gap-3">
                    <div class="flex items-center justify-between p-3 rounded-lg" style="background:#fef3c7;">
                        <span class="text-sm font-semibold text-yellow-800">📷 Sem EAN</span>
                        <span class="font-bold text-yellow-700">${Number(d.semEan).toLocaleString('pt-BR')}</span>
                    </div>
                    <div class="flex items-center justify-between p-3 rounded-lg" style="background:#fee2e2;">
                        <span class="text-sm font-semibold text-red-800">🖼️ Sem Imagem</span>
                        <span class="font-bold text-red-700">${Number(d.semImagem).toLocaleString('pt-BR')}</span>
                    </div>
                    <div class="flex items-center justify-between p-3 rounded-lg" style="background:#dbeafe;">
                        <span class="text-sm font-semibold text-blue-800">📦 Total Produtos</span>
                        <span class="font-bold text-blue-700">${Number(d.totalProdutos).toLocaleString('pt-BR')}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Gráficos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">📦 Produtos por Departamento</p>
                <canvas id="chart-depto" height="280"></canvas>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">🏷️ Placas Geradas — Últimos 30 Dias</p>
                <canvas id="chart-dias" height="280"></canvas>
            </div>
        </div>

        <!-- Top produtos -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">🏆 Top 10 Produtos com Mais Placas no Mês</p>
            </div>
            <table class="w-full text-sm">
                <thead>
                    <tr style="border-bottom:2px solid #f3f4f6;">
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">#</th>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Produto</th>
                        <th class="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Tipo</th>
                        <th class="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Qtd</th>
                    </tr>
                </thead>
                <tbody>
                    ${d.topProdutos.map((p, i) => `
                        <tr style="border-bottom:1px solid #f9fafb; background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
                            <td class="px-5 py-3 font-bold text-gray-400">${i + 1}</td>
                            <td class="px-5 py-3 font-semibold text-gray-800">${p.descricao}</td>
                            <td class="px-5 py-3">${dashTipoBadge(p.tipo_placa)}</td>
                            <td class="px-5 py-3 text-right font-bold text-gray-700">${p.total}</td>
                        </tr>
                    `).join('')}
                    ${!d.topProdutos.length ? `<tr><td colspan="4" class="px-5 py-6 text-center text-gray-400 text-sm">Nenhuma placa gerada este mês.</td></tr>` : ''}
                </tbody>
            </table>
        </div>
    `
}

function dashCard(icon, label, valor, color, bg) {
    return `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background:${bg};">${icon}</div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">${label}</p>
            </div>
            <p class="text-3xl font-black" style="color:${color};">${valor}</p>
        </div>
    `
}

function dashBarra(label, valor, total, cor) {
    const pct = total > 0 ? ((valor / total) * 100).toFixed(1) : 0
    return `
        <div>
            <div class="flex justify-between text-xs mb-1">
                <span class="text-gray-600 font-semibold">${label}</span>
                <span class="font-bold text-gray-700">${Number(valor).toLocaleString('pt-BR')} <span class="text-gray-400 font-normal">(${pct}%)</span></span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="h-2 rounded-full transition-all" style="width:${pct}%;background:${cor};"></div>
            </div>
        </div>
    `
}

function dashTipoBadge(tipo) {
    const map = {
        branca:  ['#f3f4f6','#374151','Branca'],
        amarela: ['#fef3c7','#92400e','Amarela'],
        grande:  ['#fee2e2','#b91c1c','Grande'],
    }
    const [bg, color, label] = map[tipo] || ['#f3f4f6','#374151', tipo]
    return `<span class="text-xs font-bold px-2 py-0.5 rounded-full" style="background:${bg};color:${color};">${label}</span>`
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

    const labels = porDepto.map(d => d.depto.length > 20 ? d.depto.slice(0, 20) + '…' : d.depto)
    const valores = porDepto.map(d => d.total)
    const cores   = [
        '#b51515','#1d4ed8','#16a34a','#d97706','#7c3aed',
        '#0891b2','#be123c','#065f46','#92400e','#4338ca',
        '#dc2626','#2563eb','#15803d','#b45309','#6d28d9'
    ]

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Produtos',
                data: valores,
                backgroundColor: cores.slice(0, valores.length),
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.parsed.y.toLocaleString('pt-BR')} produtos`
                    }
                }
            },
            scales: {
                x: { ticks: { font: { size: 10 }, maxRotation: 45 }, grid: { display: false } },
                y: { ticks: { font: { size: 11 } }, grid: { color: '#f3f4f6' } }
            }
        }
    })
}

async function dashGraficoDias(placasDias) {
    await dashCarregarChartJS()
    const canvas = document.getElementById('chart-dias')
    if (!canvas) return

    // Preenche dias sem dados com 0
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
                backgroundColor: 'rgba(181,21,21,0.08)',
                borderWidth: 2,
                pointBackgroundColor: '#b51515',
                pointRadius: 3,
                fill: true,
                tension: 0.3,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.parsed.y} placa(s)`
                    }
                }
            },
            scales: {
                x: { ticks: { font: { size: 9 }, maxTicksLimit: 10 }, grid: { display: false } },
                y: { ticks: { font: { size: 11 }, stepSize: 1 }, grid: { color: '#f3f4f6' }, beginAtZero: true }
            }
        }
    })
}