function carregarInicio() {
    setActive('btn-inicio')
    setConteudo(`
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Produtos</p>
                <p id="count-produtos" class="text-3xl font-bold text-gray-800">—</p>
            </div>
            <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Usuários</p>
                <p class="text-3xl font-bold text-gray-800">—</p>
            </div>
            <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</p>
                <p class="text-sm font-semibold text-green-600 mt-1">● Online</p>
            </div>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 class="font-semibold text-gray-700 mb-1">Bem-vindo ao ERP Avanzi 👋</h3>
            <p class="text-sm text-gray-400">Use o menu lateral para navegar entre os módulos.</p>
        </div>
    `, 'Dashboard')

    fetch('http://localhost:3000/produtos', { headers: authHeaders() })
        .then(r => r.json())
        .then(data => {
            const el = document.getElementById('count-produtos')
            if (el && Array.isArray(data)) el.textContent = data.length.toLocaleString('pt-BR')
        }).catch(() => {})
}