function carregarInicio() {
    setActive('btn-inicio')
    setConteudo(`
        <div class="max-w-7xl mx-auto space-y-6 fade-slide-up">

            <div class="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight page-title-glow">Dashboard</h1>
                    <p class="text-xs sm:text-sm" style="color:var(--text-muted)">Visão geral do sistema</p>
                </div>
                <div class="flex items-center gap-2 text-xs" style="color:var(--text-muted)">
                    <span class="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                    <span>Online</span>
                </div>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3" id="dv-stats">
                <div class="dash-glass p-3 sm:p-4 card-accent-blue statistic-card">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-base-content/50">Produtos</span>
                        <span class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:rgba(59,130,246,0.1);">
                            <svg width="16" height="16" fill="none" stroke="#3b82f6" stroke-width="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                        </span>
                    </div>
                    <div class="text-xl sm:text-2xl font-extrabold tracking-tight" style="color:var(--text-primary)" id="dv-total-produtos">—</div>
                    <div class="text-[10px] mt-1" style="color:var(--text-muted)"><span id="dv-sem-ean">—</span> sem EAN</div>
                </div>
                <div class="dash-glass p-3 sm:p-4 card-accent-red statistic-card">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-base-content/50">Placas Mês</span>
                        <span class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:rgba(239,68,68,0.1);">
                            <svg width="16" height="16" fill="none" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        </span>
                    </div>
                    <div class="text-xl sm:text-2xl font-extrabold tracking-tight" style="color:var(--text-primary)" id="dv-placas-total">—</div>
                    <div class="flex gap-2 text-[10px]" style="color:var(--text-muted)">
                        <span>Branca <strong id="dv-placas-branca" style="color:var(--text-secondary)">—</strong></span>
                        <span>Amarela <strong id="dv-placas-amarela" style="color:#ca8a04">—</strong></span>
                        <span>Grande <strong id="dv-placas-grande" style="color:#3b82f6">—</strong></span>
                    </div>
                </div>
                <div class="dash-glass p-3 sm:p-4 card-accent-green statistic-card">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-base-content/50">Listas</span>
                        <span class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:rgba(34,197,94,0.1);">
                            <svg width="16" height="16" fill="none" stroke="#22c55e" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                        </span>
                    </div>
                    <div class="text-xl sm:text-2xl font-extrabold tracking-tight" style="color:var(--text-primary)" id="dv-listas-mes">—</div>
                    <div class="text-[10px] mt-1" style="color:var(--text-muted)">criadas este mês</div>
                </div>
                <div class="dash-glass p-3 sm:p-4 card-accent-yellow statistic-card">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-base-content/50">Impressão</span>
                        <span class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:rgba(234,179,8,0.1);">
                            <svg width="16" height="16" fill="none" stroke="#eab308" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        </span>
                    </div>
                    <div class="text-xl sm:text-2xl font-extrabold tracking-tight" style="color:var(--text-primary)" id="dv-impressas">—</div>
                    <div class="text-[10px] mt-1" style="color:var(--text-muted)">impressas este mês</div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div class="lg:col-span-2 dash-glass p-4 sm:p-5">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-2">
                            <svg width="14" height="14" fill="none" stroke="var(--text-muted)" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                            <span class="text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted)">Placas por Dia (30 dias)</span>
                        </div>
                    </div>
                    <div id="dv-grafico-dias" class="h-48 flex items-end gap-1"></div>
                </div>

                <div class="dash-glass p-4 sm:p-5">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-2">
                            <svg width="14" height="14" fill="none" stroke="var(--text-muted)" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 010-5C7 4 6 9 6 9z"/><path d="M18 9h1.5a2.5 2.5 0 000-5C17 4 18 9 18 9z"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>
                            <span class="text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted)">Top Produtos</span>
                        </div>
                    </div>
                    <div id="dv-top-produtos" class="space-y-2"></div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div class="dash-glass p-4 sm:p-5">
                    <div class="flex items-center gap-2 mb-4">
                        <svg width="14" height="14" fill="none" stroke="var(--text-muted)" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        <span class="text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted)">Departamentos</span>
                    </div>
                    <div id="dv-departamentos" class="space-y-2"></div>
                </div>

                <div class="lg:col-span-2 dash-glass p-4 sm:p-5">
                    <div class="flex items-center gap-2 mb-4">
                        <svg width="14" height="14" fill="none" stroke="var(--text-muted)" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        <span class="text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted)">Resumo do Sistema</span>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div class="flex flex-col items-center gap-1 p-3 rounded-xl" style="background:rgba(59,130,246,0.05);border:1px solid rgba(59,130,246,0.1);">
                            <span class="text-lg font-extrabold tracking-tight" style="color:#3b82f6" id="dv-resumo-produtos">—</span>
                            <span class="text-[10px]" style="color:var(--text-muted)">Produtos</span>
                        </div>
                        <div class="flex flex-col items-center gap-1 p-3 rounded-xl" style="background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.1);">
                            <span class="text-lg font-extrabold tracking-tight" style="color:#ef4444" id="dv-resumo-placas">—</span>
                            <span class="text-[10px]" style="color:var(--text-muted)">Placas mês</span>
                        </div>
                        <div class="flex flex-col items-center gap-1 p-3 rounded-xl" style="background:rgba(168,85,247,0.05);border:1px solid rgba(168,85,247,0.1);">
                            <span class="text-lg font-extrabold tracking-tight" style="color:#a855f7" id="dv-resumo-imagem">—</span>
                            <span class="text-[10px]" style="color:var(--text-muted)">Sem imagem</span>
                        </div>
                        <div class="flex flex-col items-center gap-1 p-3 rounded-xl" style="background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.1);">
                            <span class="text-lg font-extrabold tracking-tight" style="color:#22c55e" id="dv-resumo-listas">—</span>
                            <span class="text-[10px]" style="color:var(--text-muted)">Listas mês</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `, 'Dashboard')

    carregarDadosDashboard()
}

async function carregarDadosDashboard() {
    try {
        const res = await fetch(API+'/dashboard', { headers: authHeaders() })
        const d = await res.json()

        el('dv-total-produtos').textContent = (d.totalProdutos || 0).toLocaleString('pt-BR')
        el('dv-sem-ean').textContent = d.semEan || 0
        el('dv-placas-total').textContent = d.placasMes?.total || 0
        el('dv-placas-branca').textContent = d.placasMes?.branca || 0
        el('dv-placas-amarela').textContent = d.placasMes?.amarela || 0
        el('dv-placas-grande').textContent = d.placasMes?.grande || 0
        el('dv-listas-mes').textContent = d.listasMes || 0
        el('dv-impressas').textContent = d.impressasMes?.impressas || 0

        el('dv-resumo-produtos').textContent = (d.totalProdutos || 0).toLocaleString('pt-BR')
        el('dv-resumo-placas').textContent = d.placasMes?.total || 0
        el('dv-resumo-imagem').textContent = d.semImagem || 0
        el('dv-resumo-listas').textContent = d.listasMes || 0

        renderGraficoDias(d.placasDias || [])
        renderTopProdutos(d.topProdutos || [])
        renderDepartamentos(d.porDepto || [])
    } catch (e) {
        console.error('Erro dashboard:', e)
    }
}

function el(id) { return document.getElementById(id) }

function renderGraficoDias(dados) {
    const container = el('dv-grafico-dias')
    if (!dados.length) {
        container.innerHTML = '<p class="text-xs text-center py-8" style="color:var(--text-muted)">Sem dados</p>'
        return
    }
    const max = Math.max(...dados.map(d => d.total), 1)
    container.innerHTML = dados.map(d => {
        const altura = (d.total / max) * 100
        const data = new Date(d.dia).toLocaleDateString('pt-BR', { day: '2-digit' })
        return `<div class="flex-1 flex flex-col items-center gap-1 justify-end h-full">
            <span class="text-[9px] font-semibold" style="color:var(--text-muted)">${d.total}</span>
            <div class="w-full rounded-t-sm" style="height:${altura}%;min-height:2px;background:linear-gradient(to top,#b51515,var(--primary));border-radius:3px 3px 0 0;"></div>
            <span class="text-[8px]" style="color:rgba(255,255,255,0.15)">${data}</span>
        </div>`
    }).join('')
}

function renderTopProdutos(dados) {
    const container = el('dv-top-produtos')
    if (!dados.length) {
        container.innerHTML = '<p class="text-xs text-center py-6" style="color:var(--text-muted)">Sem dados</p>'
        return
    }
    const max = Math.max(...dados.map(d => d.total), 1)
    container.innerHTML = dados.slice(0, 8).map(d => {
        const pct = (d.total / max) * 100
        const cor = d.tipo_placa === 'branca' ? 'rgba(255,255,255,0.5)' : d.tipo_placa === 'amarela' ? '#ca8a04' : '#3b82f6'
        return `<div>
            <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-medium truncate" style="color:var(--text-secondary);max-width:70%;">${d.descricao}</span>
                <span class="text-xs font-bold" style="color:${cor}">${d.total}</span>
            </div>
            <div class="w-full h-1.5 rounded-full" style="background:rgba(255,255,255,0.05);">
                <div class="h-full rounded-full transition-all" style="width:${pct}%;background:${cor};"></div>
            </div>
        </div>`
    }).join('')
}

function renderDepartamentos(dados) {
    const container = el('dv-departamentos')
    if (!dados.length) {
        container.innerHTML = '<p class="text-xs text-center py-6" style="color:var(--text-muted)">Sem dados</p>'
        return
    }
    const max = Math.max(...dados.map(d => d.total), 1)
    container.innerHTML = dados.map(d => {
        const pct = (d.total / max) * 100
        return `<div class="flex items-center gap-3">
            <span class="text-xs w-2/5 truncate" style="color:var(--text-secondary)">${d.depto}</span>
            <div class="flex-1 h-2 rounded-full" style="background:rgba(255,255,255,0.05);">
                <div class="h-full rounded-full" style="width:${pct}%;background:linear-gradient(90deg,var(--primary),rgba(181,21,21,0.4));"></div>
            </div>
            <span class="text-xs font-semibold w-8 text-right" style="color:var(--text-muted)">${d.total}</span>
        </div>`
    }).join('')
}
