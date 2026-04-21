async function carregarCotacao() {
    setActive('btn-cotacao')
    setConteudo(`
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
            <div class="flex gap-3 flex-wrap items-end mb-4">
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Selecione a Lista</label>
                    <select id="cot-lista" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 w-64">
                        <option value="">Carregando...</option>
                    </select>
                </div>
                <button id="cot-btn-carregar" class="px-5 py-2 text-white text-sm font-semibold rounded-lg" style="background:#b51515;">📊 Carregar Dados</button>
                <button id="cot-btn-nova" class="px-5 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 ml-auto">➕ Nova Cotação</button>
            </div>
        </div>
        <div id="cot-graficos" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5"></div>
        <div id="cot-tabela" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <p class="text-center text-gray-400 text-sm py-10">Selecione uma lista para comparar</p>
        </div>
    `, 'Cotação / Comparativo')

    let listas = []
    let itensLista = new Map()

    async function carregarListas() {
        try {
            const res = await fetch('http://localhost:3000/listas', { headers: authHeaders() })
            listas = await res.json()
            const sel = document.getElementById('cot-lista')
            sel.innerHTML = listas.map(l => `<option value="${l.id}">${l.nome}</option>`).join('')
        } catch { alert('Erro ao carregar listas') }
    }

    async function carregarDados() {
        const id = document.getElementById('cot-lista').value
        if (!id) return

        const wrapper = document.getElementById('cot-tabela')
        wrapper.innerHTML = `<p class="text-center text-gray-400 py-10">Carregando...</p>`

        try {
            const res = await fetch('http://localhost:3000/listas/' + id + '/itens', { headers: authHeaders() })
            const itens = await res.json()

            const total = itens.length
            const comPreco = itens.filter(i => i.preco != null && i.preco > 0).length
            const semPreco = total - comPreco

            const valores = itens.map(i => parseFloat(i.preco) || 0).filter(p => p > 0)
            const menor = valores.length ? Math.min(...valores) : 0
            const maior = valores.length ? Math.max(...valores) : 0
            const medio = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0

            document.getElementById('cot-graficos').innerHTML = `
                <div class="bg-white rounded-lg border border-gray-100 p-4">
                    <h4 class="text-xs text-gray-400 uppercase mb-2">Total de Itens</h4>
                    <p class="text-3xl font-bold" style="color:#b51515;">${total}</p>
                    <p class="text-xs text-gray-400 mt-1">${comPreco} com preço | ${semPreco} sem preço</p>
                </div>
                <div class="bg-white rounded-lg border border-gray-100 p-4">
                    <h4 class="text-xs text-gray-400 uppercase mb-2">Faixa de Preços</h4>
                    <p class="text-xl font-bold">R$ ${menor.toFixed(2).replace('.', ',')} — R$ ${maior.toFixed(2).replace('.', ',')}</p>
                    <p class="text-xs text-gray-400 mt-1">Média: R$ ${medio.toFixed(2).replace('.', ',')}</p>
                </div>
            `

            wrapper.innerHTML = `
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead><tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                            <th class="px-4 py-3 text-left">#</th>
                            <th class="px-4 py-3 text-left">Código</th>
                            <th class="px-4 py-3 text-left">Descrição</th>
                            <th class="px-4 py-3 text-right">EAN</th>
                            <th class="px-4 py-3 text-right">Preço</th>
                        </tr></thead>
                        <tbody class="divide-y divide-gray-100">
                            ${itens.map((p, i) => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-4 py-2.5 text-gray-400 text-xs">${i + 1}</td>
                                    <td class="px-4 py-2.5 text-gray-500 font-mono text-xs">${p.codigo || '—'}</td>
                                    <td class="px-4 py-2.5 font-medium">${p.descricao || ''}</td>
                                    <td class="px-4 py-2.5 text-right text-gray-400 text-xs font-mono">${p.ean || '—'}</td>
                                    <td class="px-4 py-2.5 text-right font-semibold ${p.preco ? '' : 'text-orange-500'}">
                                        ${p.preco ? 'R$ ' + parseFloat(p.preco).toFixed(2).replace('.', ',') : '—'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `
        } catch {
            wrapper.innerHTML = `<p class="text-center text-red-400 py-10">Erro ao carregar dados</p>`
        }
    }

    document.getElementById('cot-btn-carregar').onclick = carregarDados
    document.getElementById('cot-btn-nova').onclick = () => {
        const nome = prompt('Nome da nova lista de preços:')
        if (!nome) return
        fetch('http://localhost:3000/listas', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ nome })
        }).then(() => carregarListas())
    }

    carregarListas()
}