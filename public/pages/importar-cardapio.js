async function carregarImportarCardapio() {
    setActive('btn-importar-cardapio')
    setConteudo(`
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
            <div class="flex gap-4 items-start mb-4">
                <div class="flex-1">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Arquivo .docx ou .xlsx</label>
                    <input type="file" id="ic-arquivo" accept=".docx,.xlsx" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:text-white file:cursor-pointer" style="file:background:#b51515;">
                </div>
                <div class="flex items-end gap-2">
                    <button id="ic-btn-carregar" class="px-5 py-2.5 text-white text-sm font-semibold rounded-lg" style="background:#6f42c1;">📤 Importar</button>
                </div>
            </div>
            <div id="ic-status" class="text-sm text-gray-500"></div>
        </div>
        <div id="ic-preview" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <p class="text-center text-gray-400 text-sm py-10">Faça o upload de um arquivo para visualizar o conteúdo</p>
        </div>
    `, 'Importar Cardápio')

    let dadosImportados = []

    document.getElementById('ic-btn-carregar').onclick = async () => {
        const input = document.getElementById('ic-arquivo')
        const file = input.files[0]
        if (!file) {
            alert('Selecione um arquivo primeiro')
            return
        }

        const status = document.getElementById('ic-status')
        status.innerHTML = `<p class="text-blue-600">Processando ${file.name}...</p>`

        const formData = new FormData()
        formData.append('arquivo', file)

        try {
            const res = await fetch('http://localhost:3000/cardapio/importar-docx', {
                method: 'POST',
                headers: authHeaders(),
                body: formData
            })

            if (!res.ok) {
                const err = await res.json()
                status.innerHTML = `<p class="text-red-500">Erro: ${err.error}</p>`
                return
            }

            dadosImportados = await res.json()
            status.innerHTML = `<p class="text-green-600">✅ ${dadosImportados.length} itens importados!</p>`

            renderizarPreview(dadosImportados)
        } catch (e) {
            status.innerHTML = `<p class="text-red-500">Erro ao conectar: ${e.message}</p>`
        }
    }

    function renderizarPreview(dados) {
        const preview = document.getElementById('ic-preview')
        if (!dados.length) {
            preview.innerHTML = `<p class="text-center text-gray-400 text-sm py-10">Nenhum item encontrado</p>`
            return
        }

        preview.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead><tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <th class="px-4 py-3 text-left">#</th>
                        <th class="px-4 py-3 text-left">Seção</th>
                        <th class="px-4 py-3 text-left">Produto</th>
                        <th class="px-4 py-3 text-right">Preço</th>
                        <th class="px-4 py-3 text-center">Ação</th>
                    </tr></thead>
                    <tbody class="divide-y divide-gray-100">
                        ${dados.map((p, i) => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-4 py-2.5 text-gray-400 text-xs">${i + 1}</td>
                                <td class="px-4 py-2.5 text-gray-500 text-xs">${p.secao || ''}</td>
                                <td class="px-4 py-2.5 font-medium">${p.descricao || ''}</td>
                                <td class="px-4 py-2.5 text-right font-semibold">${p.preco != null ? 'R$ ' + parseFloat(p.preco).toFixed(2).replace('.', ',') : '—'}</td>
                                <td class="px-4 py-2.5 text-center">
                                    <button class="ic-ver-btn px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100" data-index="${i}">Ver imagem</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `

        preview.querySelectorAll('.ic-ver-btn').forEach(btn => {
            btn.onclick = async () => {
                const i = parseInt(btn.getAttribute('data-index'))
                const item = dados[i]
                btn.textContent = 'Carregando...'
                try {
                    const res = await fetch(`http://localhost:3000/prato-imagem?nome=${encodeURIComponent(item.descricao)}`, { headers: authHeaders() })
                    if (res.ok) {
                        const blob = await res.blob()
                        const url = URL.createObjectURL(blob)
                        const win = window.open('', '_blank')
                        win.document.write('<img src="' + url + '" style="max-width:100%;">')
                    } else {
                        alert('Imagem não encontrada')
                    }
                } catch { alert('Erro ao buscar imagem') }
                btn.textContent = 'Ver imagem'
            }
        })
    }
}