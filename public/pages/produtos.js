let todosProdutos = []
let paginaAtual = 1
const porPagina = 50

async function carregarProdutos() {
    setActive('btn-produtos')
    setConteudo(`
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 gap-4 flex-wrap">
                <h3 class="font-semibold text-gray-700">Lista de Produtos</h3>
                <input id="busca" type="text" placeholder="Buscar por código, descrição, marca..."
                    class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-red-400 w-72" />
            </div>
            <div id="tabela-wrapper" class="overflow-x-auto">
                <p class="text-center text-gray-400 text-sm py-10">Carregando produtos...</p>
            </div>
            <div id="paginacao" class="flex items-center justify-between px-6 py-3 border-t border-gray-100 text-sm text-gray-500"></div>
        </div>
    `, 'Produtos')

    try {
        const res = await fetch('http://localhost:3000/produtos', { headers: authHeaders() })
        const data = await res.json()

        if (!res.ok) {
            document.getElementById('tabela-wrapper').innerHTML =
                `<p class="text-center text-red-400 text-sm py-10">Erro: ${data.error ?? res.status}</p>`
            return
        }

        todosProdutos = Array.isArray(data) ? data : []
        paginaAtual = 1
        renderTabela(todosProdutos)

        document.getElementById('busca').addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase()
            paginaAtual = 1
            renderTabela(todosProdutos.filter(p =>
                p.codigo?.toLowerCase().includes(q) ||
                p.descricao?.toLowerCase().includes(q) ||
                p.marca?.toLowerCase().includes(q) ||
                p.departamento?.toLowerCase().includes(q) ||
                p.ean?.toLowerCase().includes(q)
            ))
        })
    } catch {
        document.getElementById('tabela-wrapper').innerHTML =
            `<p class="text-center text-red-400 text-sm py-10">Erro ao conectar com o servidor.</p>`
    }
}

function renderTabela(produtos) {
    const wrapper = document.getElementById('tabela-wrapper')
    const paginacaoEl = document.getElementById('paginacao')
    if (!wrapper) return

    if (!produtos.length) {
        wrapper.innerHTML = `<p class="text-center text-gray-400 text-sm py-10">Nenhum produto encontrado.</p>`
        if (paginacaoEl) paginacaoEl.innerHTML = ''
        return
    }

    const totalPaginas = Math.ceil(produtos.length / porPagina)
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas
    const inicio = (paginaAtual - 1) * porPagina
    const pagina = produtos.slice(inicio, inicio + porPagina)

    wrapper.innerHTML = `
        <table class="w-full text-sm">
            <thead><tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th class="px-4 py-3 text-left font-semibold">Código</th>
                <th class="px-4 py-3 text-left font-semibold">Descrição</th>
                <th class="px-4 py-3 text-left font-semibold">EAN</th>
                <th class="px-4 py-3 text-left font-semibold">Departamento</th>
                <th class="px-4 py-3 text-left font-semibold">Seção</th>
                <th class="px-4 py-3 text-left font-semibold">Grupo</th>
                <th class="px-4 py-3 text-left font-semibold">Marca</th>
                <th class="px-4 py-3 text-right font-semibold">Preço</th>
            </tr></thead>
            <tbody class="divide-y divide-gray-100">
                ${pagina.map(p => `<tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-2.5 font-mono text-gray-500 text-xs">${p.codigo ?? '—'}</td>
                    <td class="px-4 py-2.5 text-gray-800 font-medium">${p.descricao ?? '—'}</td>
                    <td class="px-4 py-2.5 text-gray-400 text-xs">${p.ean || '—'}</td>
                    <td class="px-4 py-2.5 text-gray-500 text-xs">${p.descricao_departamento ?? '—'}</td>
                    <td class="px-4 py-2.5 text-gray-500 text-xs">${p.secao ?? '—'}</td>
                    <td class="px-4 py-2.5 text-gray-500 text-xs">${p.grupo ?? '—'}</td>
                    <td class="px-4 py-2.5 text-gray-500 text-xs">${p.marca || '—'}</td>
                    <td class="px-4 py-2.5 text-right font-semibold text-gray-800">
                        ${p.preco_venda != null ? 'R$ ' + Number(p.preco_venda).toFixed(2).replace('.', ',') : '—'}
                    </td>
                </tr>`).join('')}
            </tbody>
        </table>`

    if (paginacaoEl) {
        paginacaoEl.innerHTML = `
            <span>${produtos.length.toLocaleString('pt-BR')} produto(s) — página ${paginaAtual} de ${totalPaginas}</span>
            <div class="flex gap-2">
                <button id="btn-prev" class="px-3 py-1 rounded border border-gray-200 text-xs hover:bg-gray-50 disabled:opacity-40" ${paginaAtual === 1 ? 'disabled' : ''}>← Anterior</button>
                <button id="btn-next" class="px-3 py-1 rounded border border-gray-200 text-xs hover:bg-gray-50 disabled:opacity-40" ${paginaAtual === totalPaginas ? 'disabled' : ''}>Próxima →</button>
            </div>`
        document.getElementById('btn-prev')?.addEventListener('click', () => { paginaAtual--; renderTabela(produtos); wrapper.scrollIntoView({ behavior: 'smooth' }) })
        document.getElementById('btn-next')?.addEventListener('click', () => { paginaAtual++; renderTabela(produtos); wrapper.scrollIntoView({ behavior: 'smooth' }) })
    }
}