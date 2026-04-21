let buscaRapidaTimer = null

async function carregarBuscaRapida() {
    setActive('btn-busca-rapida')
    setConteudo(`
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-5">
            <div class="flex gap-3 mb-4">
                <input id="br-input" type="text" autofocus placeholder="Digite código, EAN ou descrição..."
                    class="border-2 border-gray-200 rounded-xl px-4 py-3 text-lg w-full focus:outline-none focus:border-red-400">
                <button id="br-btn" class="px-6 py-3 text-white text-sm font-bold rounded-xl" style="background:#b51515;">🔍 Buscar</button>
            </div>
            <div id="br-sugestoes" class="mb-3"></div>
        </div>
        <div id="br-resultado"></div>
    `, 'Busca Rápida')

    const input = document.getElementById('br-input')
    input.focus()

    input.oninput = () => {
        clearTimeout(buscaRapidaTimer)
        if (input.value.length < 2) {
            document.getElementById('br-sugestoes').innerHTML = ''
            return
        }
        buscaRapidaTimer = setTimeout(() => buscarSugestoesBR(input.value.trim()), 250)
    }

    input.onkeydown = (e) => {
        if (e.key === 'Enter') {
            clearTimeout(buscaRapidaTimer)
            document.getElementById('br-sugestoes').innerHTML = ''
            executarBuscaRapida(input.value.trim())
        }
    }

    document.getElementById('br-btn').onclick = () => {
        clearTimeout(buscaRapidaTimer)
        document.getElementById('br-sugestoes').innerHTML = ''
        executarBuscaRapida(input.value.trim())
    }
}

async function buscarSugestoesBR(termo) {
    const el = document.getElementById('br-sugestoes')
    if (!termo || termo.length < 2) { el.innerHTML = ''; return }

    const banco = typeof todosProdutos !== 'undefined' && todosProdutos.length > 0 ? todosProdutos : []
    if (!banco.length) {
        try {
            const res = await fetch('http://localhost:3000/produtos', { headers: authHeaders() })
            const data = await res.json()
            if (Array.isArray(data)) {
                window.todosProdutos = data
            }
        } catch { return }
    }

    const q = termo.toUpperCase()
    const resultados = (window.todosProdutos || banco).filter(p =>
        p.descricao?.toUpperCase().includes(q) ||
        p.codigo?.includes(q) ||
        p.ean?.includes(q)
    ).slice(0, 8)

    if (!resultados.length) { el.innerHTML = ''; return }

    el.innerHTML = `
        <div class="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
            ${resultados.map(p => `
                <div class="br-sugestao px-4 py-2.5 hover:bg-red-50 cursor-pointer flex items-center justify-between border-b border-gray-50 last:border-0 transition-colors"
                    data-codigo="${p.codigo}" data-desc="${p.descricao}" data-ean="${p.ean || ''}" data-preco="${p.preco_venda || ''}">
                    <span class="text-sm font-medium text-gray-800">${p.descricao}</span>
                    <div class="flex items-center gap-3">
                        <span class="text-xs text-gray-400 font-mono">${p.codigo}</span>
                        <span class="text-sm font-semibold text-gray-600">R$ ${parseFloat(p.preco_venda || 0).toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `

    el.querySelectorAll('.br-sugestao').forEach(item => {
        item.onclick = () => {
            const codigo = item.getAttribute('data-codigo')
            document.getElementById('br-sugestoes').innerHTML = ''
            executarBuscaRapida(codigo)
        }
    })
}

async function executarBuscaRapida(termo) {
    if (!termo) return
    const resultado = document.getElementById('br-resultado')
    resultado.innerHTML = `<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center"><p class="text-gray-400 text-sm">Buscando...</p></div>`

    try {
        const res = await fetch(`http://localhost:3000/produtos/${encodeURIComponent(termo)}`, { headers: authHeaders() })
        if (!res.ok) {
            resultado.innerHTML = `<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center"><p class="text-red-400 text-sm">Produto não encontrado: <strong>${termo}</strong></p></div>`
            return
        }
        const prod = await res.json()
        resultado.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h3 class="font-bold text-xl text-gray-800">${prod.descricao}</h3>
                        <p class="text-xs text-gray-400 mt-1">Código: ${prod.codigo} | EAN: ${prod.ean || '—'}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-3xl font-bold" style="color:#b51515;">R$ ${parseFloat(prod.preco_venda || 0).toFixed(2).replace('.', ',')}</p>
                        ${prod.preco_oferta ? `<p class="text-sm text-green-600 font-semibold">Oferta: R$ ${parseFloat(prod.preco_oferta).toFixed(2).replace('.', ',')}</p>` : ''}
                    </div>
                </div>
                <div class="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><p class="text-xs text-gray-400">Departamento</p><p class="font-medium">${prod.descricao_departamento || '—'}</p></div>
                    <div><p class="text-xs text-gray-400">Seção</p><p class="font-medium">${prod.secao || '—'}</p></div>
                    <div><p class="text-xs text-gray-400">Grupo</p><p class="font-medium">${prod.grupo || '—'}</p></div>
                    <div><p class="text-xs text-gray-400">Marca</p><p class="font-medium">${prod.marca || '—'}</p></div>
                </div>
                <div class="px-6 py-4 border-t border-gray-100 flex gap-3 flex-wrap">
                    <button id="br-btn-imagem" class="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors">📷 Ver Imagem</button>
                    <button id="br-btn-placa" class="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors">🏷️ Gerar Placa</button>
                    <button onclick="buscarImagemPorNome('${prod.descricao}', '${prod.codigo}')" class="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors">🖼️ Cardápio</button>
                </div>
                <div id="br-acao-resultado" class="px-6 py-4 border-t border-gray-100"></div>
            </div>
        `

        document.getElementById('br-btn-imagem').onclick = async () => {
            document.getElementById('br-acao-resultado').innerHTML = `<div class="p-4 text-center text-gray-400">Carregando imagem...</div>`
            try {
                const res = await fetch(`http://localhost:3000/imagem?nome=${encodeURIComponent(prod.descricao)}`, { headers: authHeaders() })
                if (res.ok) {
                    const blob = await res.blob()
                    const url = URL.createObjectURL(blob)
                    document.getElementById('br-acao-resultado').innerHTML = `
                        <div class="p-4 bg-gray-50 rounded-lg flex justify-center">
                            <img src="${url}" style="max-height:300px; object-fit:contain;" class="rounded-lg shadow">
                        </div>`
                } else {
                    document.getElementById('br-acao-resultado').innerHTML = `<div class="p-4 text-center text-red-400">Imagem não encontrada</div>`
                }
            } catch { document.getElementById('br-acao-resultado').innerHTML = `<div class="p-4 text-center text-red-400">Erro ao carregar imagem</div>` }
        }

        document.getElementById('br-btn-placa').onclick = () => {
            setActive('btn-placas')
            abrirSubmenuPlacas()
            carregarPlacas()
            setTimeout(() => {
                document.getElementById('ean-input').value = prod.codigo
                document.getElementById('preco-input').value = prod.preco_venda || ''
                document.getElementById('preco-input').focus()
            }, 100)
        }
    } catch {
        resultado.innerHTML = `<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center"><p class="text-red-400 text-sm">Erro ao conectar com o servidor</p></div>`
    }
}