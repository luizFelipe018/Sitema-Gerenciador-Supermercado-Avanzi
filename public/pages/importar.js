function carregarImportar() {
    setActive('btn-importar')
    setConteudo(`
        <div class="max-w-2xl mx-auto flex flex-col gap-5">

            <!-- Card principal -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 class="text-base font-bold text-gray-800 mb-1">📥 Importar Produtos do Excel</h2>
                <p class="text-sm text-gray-400 mb-5">
                    Selecione o relatório exportado do sistema (Pesquisa Genérica de Produtos) em formato .xlsx.
                    Os produtos serão inseridos ou atualizados no banco automaticamente.
                </p>

                <label for="imp-xlsx-upload"
                    class="flex flex-col items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-red-300 hover:bg-red-50 transition-all mb-4">
                    <span style="font-size:36px;">📊</span>
                    <span class="text-sm font-semibold text-gray-500 hover:text-red-600">Selecionar arquivo .xlsx</span>
                    <span class="text-xs text-gray-400">Relatório "Pesquisa Genérica de Produtos"</span>
                </label>
                <input id="imp-xlsx-upload" type="file" accept=".xlsx" style="display:none;">

                <div id="imp-arquivo-info" class="hidden mb-4 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                    <span style="font-size:24px;">📄</span>
                    <div>
                        <p id="imp-arquivo-nome" class="text-sm font-semibold text-gray-700"></p>
                        <p id="imp-arquivo-tam" class="text-xs text-gray-400"></p>
                    </div>
                </div>

                <button id="imp-btn-importar"
                    class="w-full py-3 text-white font-semibold rounded-lg text-sm opacity-40 cursor-not-allowed transition-all"
                    style="background:#b51515;" disabled>
                    🚀 Iniciar Importação
                </button>
            </div>

            <!-- Progresso -->
            <div id="imp-progresso" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hidden">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-semibold text-gray-700">Importando...</span>
                    <span id="imp-pct" class="text-sm font-bold text-red-600">0%</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-3 mb-3">
                    <div id="imp-barra" class="h-3 rounded-full transition-all" style="width:0%;background:#b51515;"></div>
                </div>
                <p id="imp-status-txt" class="text-xs text-gray-400">Lendo arquivo...</p>
            </div>

            <!-- Resultado -->
            <div id="imp-resultado" class="hidden"></div>

            <!-- Colunas importadas -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 class="text-sm font-bold text-gray-700 mb-3">📋 Colunas importadas</h3>
                <div class="grid grid-cols-2 gap-1 text-xs text-gray-500">
                    <span>✅ Código</span>
                    <span>✅ Descrição</span>
                    <span>✅ EAN</span>
                    <span>✅ Departamento</span>
                    <span>✅ Seção</span>
                    <span>✅ Grupo</span>
                    <span>✅ Família</span>
                    <span>✅ Status</span>
                    <span>✅ NCM/SH</span>
                    <span>✅ Estoque Atual</span>
                    <span>✅ PMZ</span>
                    <span>✅ Custo</span>
                    <span>✅ Preço Venda</span>
                    <span>✅ Preço Oferta</span>
                    <span>✅ Preço Venda Kg/L</span>
                    <span>✅ Preço Oferta Kg/L</span>
                    <span>✅ Validade</span>
                    <span>✅ Data Cadastro</span>
                    <span>✅ Data Alteração</span>
                    <span>✅ Qtde Vendida Mês</span>
                    <span>✅ Vendas Média</span>
                    <span>✅ Participa Cotação</span>
                    <span>✅ Quantidade KG/L</span>
                    <span>✅ Descrição KG/L</span>
                    <span>✅ Marca</span>
                    <span>✅ Última Alteração Preço</span>
                    <span>✅ Data Última Entrada</span>
                    <span>✅ Aceita Troca</span>
                </div>
            </div>

        </div>
    `, 'Importar Produtos')

    let arquivoSelecionado = null

    document.getElementById('imp-xlsx-upload').onchange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        arquivoSelecionado = file

        const info = document.getElementById('imp-arquivo-info')
        info.classList.remove('hidden')
        document.getElementById('imp-arquivo-nome').textContent = file.name
        document.getElementById('imp-arquivo-tam').textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB'

        const btn = document.getElementById('imp-btn-importar')
        btn.disabled = false
        btn.classList.remove('opacity-40', 'cursor-not-allowed')
    }

    document.getElementById('imp-btn-importar').onclick = async () => {
        if (!arquivoSelecionado) return

        const btn       = document.getElementById('imp-btn-importar')
        const progresso = document.getElementById('imp-progresso')
        const resultado = document.getElementById('imp-resultado')
        const barra     = document.getElementById('imp-barra')
        const pct       = document.getElementById('imp-pct')
        const statusTxt = document.getElementById('imp-status-txt')

        btn.disabled = true
        btn.classList.add('opacity-40', 'cursor-not-allowed')
        btn.textContent = '⏳ Importando...'
        progresso.classList.remove('hidden')
        resultado.classList.add('hidden')

        // Animação de progresso fake enquanto processa
        let progVal = 0
        const progInterval = setInterval(() => {
            if (progVal < 85) {
                progVal += Math.random() * 3
                barra.style.width = progVal + '%'
                pct.textContent   = Math.floor(progVal) + '%'
                if (progVal < 20)       statusTxt.textContent = 'Lendo arquivo...'
                else if (progVal < 50)  statusTxt.textContent = 'Processando produtos...'
                else if (progVal < 80)  statusTxt.textContent = 'Gravando no banco de dados...'
            }
        }, 200)

        try {
            const formData = new FormData()
            formData.append('file', arquivoSelecionado)

            const res  = await fetch('http://localhost:3000/importar/produtos', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            })
            const data = await res.json()

            clearInterval(progInterval)
            barra.style.width = '100%'
            pct.textContent   = '100%'
            statusTxt.textContent = 'Concluído!'

            if (!res.ok || data.error) {
                resultado.classList.remove('hidden')
                resultado.innerHTML = `
                    <div class="bg-red-50 border border-red-200 rounded-xl p-5">
                        <p class="text-sm font-bold text-red-700 mb-1">❌ Erro na importação</p>
                        <p class="text-xs text-red-500">${data.error || 'Erro desconhecido'}</p>
                    </div>`
            } else {
                resultado.classList.remove('hidden')
                resultado.innerHTML = `
                    <div class="bg-green-50 border border-green-200 rounded-xl p-5">
                        <p class="text-base font-bold text-green-700 mb-3">✅ Importação concluída!</p>
                        <div class="grid grid-cols-3 gap-3 text-center">
                            <div class="bg-white rounded-lg p-3 border border-green-100">
                                <p class="text-2xl font-black text-green-600">${data.total.toLocaleString('pt-BR')}</p>
                                <p class="text-xs text-gray-500 mt-1">Total no arquivo</p>
                            </div>
                            <div class="bg-white rounded-lg p-3 border border-green-100">
                                <p class="text-2xl font-black text-blue-600">${data.inseridos.toLocaleString('pt-BR')}</p>
                                <p class="text-xs text-gray-500 mt-1">Inseridos/Atualizados</p>
                            </div>
                            <div class="bg-white rounded-lg p-3 border border-red-100">
                                <p class="text-2xl font-black text-red-500">${data.erros}</p>
                                <p class="text-xs text-gray-500 mt-1">Erros</p>
                            </div>
                        </div>
                    </div>`

                btn.textContent = '🚀 Importar novamente'
                btn.disabled    = false
                btn.classList.remove('opacity-40', 'cursor-not-allowed')
            }
        } catch (e) {
            clearInterval(progInterval)
            console.error(e)
            resultado.classList.remove('hidden')
            resultado.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-xl p-5">
                    <p class="text-sm font-bold text-red-700">❌ Erro ao conectar com o servidor</p>
                </div>`
            btn.textContent = '🚀 Tentar novamente'
            btn.disabled    = false
            btn.classList.remove('opacity-40', 'cursor-not-allowed')
        }
    }
}