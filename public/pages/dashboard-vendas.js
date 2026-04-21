async function carregarDashboardVendas() {
    setActive('btn-dashboard-vendas')
    setConteudo(`
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
            <div class="flex gap-3 flex-wrap items-end">
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Período</label>
                    <select id="dv-periodo" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
                        <option value="30">Últimos 30 dias</option>
                        <option value="7">Últimos 7 dias</option>
                        <option value="hoje">Hoje</option>
                    </select>
                </div>
                <button id="dv-btn-atualizar" class="px-5 py-2 text-white text-sm font-semibold rounded-lg" style="background:#b51515;">🔄 Atualizar</button>
            </div>
        </div>
        <div id="dv-cartoes" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5"></div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 class="font-semibold text-gray-700 mb-4">Placas por Dia</h3>
                <div id="dv-grafico-dias" class="h-64 flex items-end gap-1"></div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 class="font-semibold text-gray-700 mb-4">Top 10 Produtos</h3>
                <div id="dv-grafico-top" class="h-64 overflow-y-auto"></div>
            </div>
        </div>
    `, 'Dashboard de Vendas')

    async function carregarDados() {
        try {
            const res = await fetch('http://localhost:3000/dashboard', { headers: authHeaders() })
            const dados = await res.json()

            const total = dados.placasMes?.total || 0
            const branca = dados.placasMes?.branca || 0
            const amarela = dados.placasMes?.amarela || 0
            const grande = dados.placasMes?.grandes || 0

            document.getElementById('dv-cartoes').innerHTML = `
                <div class="bg-white rounded-lg border border-gray-100 p-4">
                    <h4 class="text-xs text-gray-400 uppercase">Placas Mês</h4>
                    <p class="text-2xl font-bold" style="color:#b51515;">${total}</p>
                </div>
                <div class="bg-white rounded-lg border border-gray-100 p-4">
                    <h4 class="text-xs text-gray-400 uppercase">Brancas</h4>
                    <p class="text-2xl font-bold text-gray-600">${branca}</p>
                </div>
                <div class="bg-white rounded-lg border border-gray-100 p-4">
                    <h4 class="text-xs text-gray-400 uppercase">Amarelas</h4>
                    <p class="text-2xl font-bold" style="color:#ca8a04;">${amarela}</p>
                </div>
                <div class="bg-white rounded-lg border border-gray-100 p-4">
                    <h4 class="text-xs text-gray-400 uppercase">Grandes</h4>
                    <p class="text-2xl font-bold text-blue-600">${grande}</p>
                </div>
            `

            renderizarGraficoDias(dados.placasDias || [])
            renderizarTop(dados.topProdutos || [])
        } catch (e) {
            console.error('Erro dashboard:', e)
        }
    }

    function renderizarGraficoDias(dados) {
        const container = document.getElementById('dv-grafico-dias')
        if (!dados.length) {
            container.innerHTML = `<p class="text-gray-400 text-sm">Sem dados</p>`
            return
        }

        const max = Math.max(...dados.map(d => d.total))
        container.innerHTML = dados.map(d => {
            const altura = max > 0 ? (d.total / max) * 100 : 0
            const data = new Date(d.dia).toLocaleDateString('pt-BR', { day: '2-digit' })
            return `
                <div class="flex-1 flex flex-col items-center gap-1">
                    <div class="w-full bg-red-400 rounded-t" style="height: ${altura}%; min-height: 4px;"></div>
                    <span class="text-xs text-gray-400">${data}</span>
                    <span class="text-xs font-semibold">${d.total}</span>
                </div>
            `
        }).join('')
    }

    function renderizarTop(dados) {
        const container = document.getElementById('dv-grafico-top')
        if (!dados.length) {
            container.innerHTML = `<p class="text-gray-400 text-sm">Sem dados</p>`
            return
        }

        container.innerHTML = dados.map(d => `
            <div class="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">${d.descricao}</p>
                    <p class="text-xs text-gray-400">${d.tipo_placa}</p>
                </div>
                <span class="text-lg font-bold" style="color:#b51515;">${d.total}</span>
            </div>
        `).join('')
    }

    document.getElementById('dv-btn-atualizar').onclick = carregarDados
    carregarDados()
}