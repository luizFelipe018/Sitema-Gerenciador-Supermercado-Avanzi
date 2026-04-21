async function carregarMonitorImagens() {
    setActive('btn-monitor-imagens')
    setConteudo(`
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
            <div class="flex gap-3 flex-wrap items-end mb-4">
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</label>
                    <select id="mi-status" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
                        <option value="todos">Todos</option>
                        <option value="pendente">Pendente</option>
                        <option value="verificada">Verificada</option>
                        <option value="corrigir">Corrigir</option>
                        <option value="sem_imagem">Sem Imagem</option>
                    </select>
                </div>
                <button id="mi-btn-filtrar" class="px-5 py-2 text-white text-sm font-semibold rounded-lg" style="background:#b51515;">🔍 Filtrar</button>
                <button id="mi-btn-todos" class="px-5 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200">Ver Todos</button>
            </div>
            <div class="flex gap-2 flex-wrap">
                <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background:#f3f4f6; color:#374151;" id="mi-total">Total: —</span>
                <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background:#dcfce7; color:#16a34a;" id="mi-verificada">Verificada: —</span>
                <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background:#fef3c7; color:#92400e;" id="mi-pendente">Pendente: —</span>
                <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background:#fee2e2; color:#dc2626;" id="mi-sem">Sem Imagem: —</span>
            </div>
        </div>
        <div id="mi-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>
    `, 'Monitor de Imagens')

    let dadosProdutos = []
    let dadosVerificacao = new Map()

    async function carregarDados() {
        const grid = document.getElementById('mi-grid')
        grid.innerHTML = `<p class="col-span-full text-center text-gray-400 py-10">Carregando...</p>`

        try {
            const resProdutos = await fetch('http://localhost:3000/produtos', { headers: authHeaders() })
            dadosProdutos = await resProdutos.json()

            const resVerif = await fetch('http://localhost:3000/imagens/verificacao/todos', { headers: authHeaders() })
            const verifs = resVerif.ok ? await resVerif.json() : []
            dadosVerificacao = new Map(verifs.map(v => [v.codigo, v]))

            renderizarGrid(dadosProdutos)
        } catch {
            grid.innerHTML = `<p class="col-span-full text-center text-red-400 py-10">Erro ao conectar</p>`
        }
    }

    function renderizarGrid(produtos) {
        const statusFiltro = document.getElementById('mi-status').value
        const grid = document.getElementById('mi-grid')

        let filtrados = produtos
        if (statusFiltro !== 'todos') {
            filtrados = produtos.filter(p => {
                const v = dadosVerificacao.get(p.codigo)
                return v?.status === statusFiltro
            })
        }

        const total = filtrados.length
        const verificada = filtrados.filter(p => dadosVerificacao.get(p.codigo)?.status === 'verificada').length
        const pendente = filtrados.filter(p => !dadosVerificacao.get(p.codigo) || dadosVerificacao.get(p.codigo)?.status === 'pendente').length
        const sem = filtrados.filter(p => dadosVerificacao.get(p.codigo)?.status === 'sem_imagem').length

        document.getElementById('mi-total').textContent = `Total: ${total}`
        document.getElementById('mi-verificada').textContent = `Verificada: ${verificada}`
        document.getElementById('mi-pendente').textContent = `Pendente: ${pendente}`
        document.getElementById('mi-sem').textContent = `Sem Imagem: ${sem}`

        if (!filtrados.length) {
            grid.innerHTML = `<p class="col-span-full text-center text-gray-400 py-10">Nenhum produto encontrado</p>`
            return
        }

        grid.innerHTML = filtrados.slice(0, 50).map(p => {
            const v = dadosVerificacao.get(p.codigo) || {}
            const status = v.status || 'pendente'

            const cores = {
                pendente: ['#f3f4f6', '#374151'],
                verificada: ['#dcfce7', '#16a34a'],
                corrigir: ['#fef3c7', '#92400e'],
                sem_imagem: ['#fee2e2', '#dc2626']
            }
            const [bg, color] = cores[status] || cores.pendente

            return `
                <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                    <div class="aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center">
                        <span style="font-size:48px;">📷</span>
                    </div>
                    <h4 class="font-medium text-sm text-gray-800 truncate">${p.descricao}</h4>
                    <p class="text-xs text-gray-400 mt-1">${p.codigo}</p>
                    <div class="mt-3 flex gap-2">
                        <select class="mi-status-select flex-1 text-xs font-semibold rounded px-2 py-1.5 cursor-pointer"
                            data-codigo="${p.codigo}" style="background:${bg}; color:${color}; border:1px solid ${color};">
                            <option value="pendente" ${status === 'pendente' ? 'selected' : ''}>⏳ Pendente</option>
                            <option value="verificada" ${status === 'verificada' ? 'selected' : ''}>✅ Verificada</option>
                            <option value="corrigir" ${status === 'corrigir' ? 'selected' : ''}>⚠️ Corrigir</option>
                            <option value="sem_imagem" ${status === 'sem_imagem' ? 'selected' : ''}>❌ Sem Imagem</option>
                        </select>
                        <button class="mi-ver-img px-2 py-1.5 bg-gray-100 rounded text-xs hover:bg-gray-200" data-codigo="${p.codigo}">👁️</button>
                    </div>
                </div>
            `
        }).join('')

        grid.querySelectorAll('.mi-status-select').forEach(sel => {
            sel.onchange = async () => {
                const codigo = sel.getAttribute('data-codigo')
                await fetch('http://localhost:3000/imagens/verificacao/' + codigo, {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify({ status: sel.value })
                })
                dadosVerificacao.set(codigo, { status: sel.value })
            }
        })

        grid.querySelectorAll('.mi-ver-img').forEach(btn => {
            btn.onclick = async () => {
                const p = produtos.find(x => x.codigo === btn.getAttribute('data-codigo'))
                if (p) {
                    buscarImagemPorNome(p.descricao, p.codigo)
                }
            }
        })
    }

    document.getElementById('mi-btn-filtrar').onclick = () => renderizarGrid(dadosProdutos)
    document.getElementById('mi-btn-todos').onclick = () => {
        document.getElementById('mi-status').value = 'todos'
        renderizarGrid(dadosProdutos)
    }

    carregarDados()
}