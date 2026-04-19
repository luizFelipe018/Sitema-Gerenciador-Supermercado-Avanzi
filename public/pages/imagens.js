function carregarImagens() {
    setActive('btn-imagens')
    setConteudo(`
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">

            <!-- Tipo de busca -->
            <div class="flex gap-2 mb-4">
                <button class="img-tipo-btn px-4 py-1.5 rounded-full text-xs font-semibold border-2 transition-all active-tipo"
                    data-tipo="descricao" style="background:#1a1a2e; color:#fff; border-color:#1a1a2e;">
                    Descrição
                </button>
                <button class="img-tipo-btn px-4 py-1.5 rounded-full text-xs font-semibold border-2 border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
                    data-tipo="codigo">
                    Código
                </button>
                <button class="img-tipo-btn px-4 py-1.5 rounded-full text-xs font-semibold border-2 border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
                    data-tipo="ean">
                    EAN
                </button>
            </div>

            <!-- Busca -->
            <div class="flex gap-3 mb-4">
                <div class="flex flex-col gap-1 flex-1">
                    <label id="img-label" class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Descrição do Produto</label>
                    <input id="img-busca" type="text" placeholder="Ex: FRUTA AMEIXA KG"
                        class="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-400"
                        autocomplete="off">
                </div>
                <div class="flex items-end">
                    <button id="img-btn-buscar" class="px-6 py-2.5 text-white text-sm font-semibold rounded-lg" style="background:#b51515;">
                        🔍 Buscar
                    </button>
                </div>
            </div>

            <!-- Sugestões da busca -->
            <div id="img-sugestoes" class="mb-2"></div>

        </div>

        <!-- Resultado da imagem -->
        <div id="img-resultado"></div>
    `, 'Consulta de Imagens')

    const inputBusca = document.getElementById('img-busca')
    inputBusca.focus()
    let tipoAtivo = 'descricao'

    // Troca de tipo
    document.querySelectorAll('.img-tipo-btn').forEach(btn => {
        btn.onclick = () => {
            tipoAtivo = btn.getAttribute('data-tipo')
            document.querySelectorAll('.img-tipo-btn').forEach(b => {
                b.style.background = ''; b.style.color = '#6b7280'; b.style.borderColor = '#e5e7eb'
            })
            btn.style.background = '#1a1a2e'; btn.style.color = '#fff'; btn.style.borderColor = '#1a1a2e'

            const labels = { descricao: 'Descrição do Produto', codigo: 'Código do Produto', ean: 'EAN (Código de Barras)' }
            const placeholders = { descricao: 'Ex: FRUTA AMEIXA KG', codigo: 'Ex: 1000001', ean: 'Ex: 7896839921219' }
            document.getElementById('img-label').textContent = labels[tipoAtivo]
            inputBusca.placeholder = placeholders[tipoAtivo]
            inputBusca.value = ''
            document.getElementById('img-sugestoes').innerHTML = ''
            document.getElementById('img-resultado').innerHTML = ''
            inputBusca.focus()
        }
    })

    // Debounce para sugestões (só na busca por descrição)
    let debounceTimer = null
    inputBusca.oninput = () => {
        if (tipoAtivo !== 'descricao') return
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => mostrarSugestoes(inputBusca.value.trim()), 300)
    }

    inputBusca.onkeydown = (e) => {
        if (e.key === 'Enter') {
            clearTimeout(debounceTimer)
            document.getElementById('img-sugestoes').innerHTML = ''
            executarBuscaImagem(inputBusca.value.trim(), tipoAtivo)
        }
    }

    document.getElementById('img-btn-buscar').onclick = () => {
        clearTimeout(debounceTimer)
        document.getElementById('img-sugestoes').innerHTML = ''
        executarBuscaImagem(inputBusca.value.trim(), tipoAtivo)
    }
}

async function executarBuscaImagem(termo, tipo) {
    if (!termo) return
    const resultado = document.getElementById('img-resultado')
    resultado.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
            <p class="text-gray-400 text-sm">Buscando...</p>
        </div>
    `

    if (tipo === 'descricao') {
        await buscarImagemPorNome(termo, null)

    } else if (tipo === 'codigo') {
        // Busca produto pelo código → pega descrição → busca imagem
        try {
            const res = await fetch(`http://localhost:3000/produtos/${encodeURIComponent(termo)}`, { headers: authHeaders() })
            if (res.ok) {
                const prod = await res.json()
                document.getElementById('img-busca').value = prod.descricao
                await buscarImagemPorNome(prod.descricao, termo)
            } else {
                resultado.innerHTML = `
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                        <p class="text-red-400 text-sm">Produto com código <strong>${termo}</strong> não encontrado no banco.</p>
                    </div>`
            }
        } catch { exibirErroImagem('Erro ao conectar com o servidor.') }

    } else if (tipo === 'ean') {
        // Busca produto pelo EAN → pega descrição → busca imagem
        try {
            const res  = await fetch('http://localhost:3000/produtos', { headers: authHeaders() })
            const data = await res.json()
            const prod = Array.isArray(data) ? data.find(p => p.ean === termo) : null
            if (prod) {
                document.getElementById('img-busca').value = prod.descricao
                await buscarImagemPorNome(prod.descricao, termo)
            } else {
                resultado.innerHTML = `
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                        <p class="text-red-400 text-sm">Produto com EAN <strong>${termo}</strong> não encontrado no banco.</p>
                    </div>`
            }
        } catch { exibirErroImagem('Erro ao conectar com o servidor.') }
    }
}

// Sugestões usando o banco já carregado
function mostrarSugestoes(termo) {
    const el = document.getElementById('img-sugestoes')
    if (!termo || termo.length < 2) { el.innerHTML = ''; return }

    // Usa o banco de produtos se já estiver em memória (reutiliza de outros módulos)
    const banco = typeof todosProdutos !== 'undefined' && todosProdutos.length > 0
        ? todosProdutos
        : (typeof placasBanco !== 'undefined' && placasBanco.length > 0 ? placasBanco : [])

    if (!banco.length) return // banco ainda não carregado, sem sugestões

    const q = termo.toUpperCase()
    const resultados = banco.filter(p =>
        p.descricao?.toUpperCase().includes(q) || p.codigo?.includes(q)
    ).slice(0, 8)

    if (!resultados.length) { el.innerHTML = ''; return }

    el.innerHTML = `
        <div class="border border-gray-100 rounded-lg overflow-hidden">
            ${resultados.map(p => `
                <div class="sugestao-item px-4 py-2.5 hover:bg-red-50 cursor-pointer flex items-center justify-between border-b border-gray-50 last:border-0 transition-colors"
                    data-nome="${p.descricao}" data-codigo="${p.codigo}">
                    <span class="text-sm text-gray-800">${p.descricao}</span>
                    <span class="text-xs text-gray-400 font-mono">${p.codigo}</span>
                </div>
            `).join('')}
        </div>
    `

    el.querySelectorAll('.sugestao-item').forEach(item => {
        item.onclick = () => {
            const nome   = item.getAttribute('data-nome')
            const codigo = item.getAttribute('data-codigo')
            document.getElementById('img-busca').value = nome
            el.innerHTML = ''
            buscarImagemPorNome(nome, codigo)
        }
    })
}



async function buscarImagemPorCodigo(codigo) {
    try {
        const res = await fetch(`http://localhost:3000/imagem?codigo=${encodeURIComponent(codigo)}`, {
            headers: authHeaders()
        })
        await exibirResultadoImagem(res, `Código: ${codigo}`)
    } catch { exibirErroImagem('Erro ao conectar com o servidor.') }
}

async function buscarImagemPorNome(nome, codigo) {
    try {
        // Se não tem código, tenta buscar pelo nome no banco para obter o código
        if (!codigo) {
            try {
                const pRes = await fetch(`http://localhost:3000/produtos?descricao=${encodeURIComponent(nome)}&limit=1`, { headers: authHeaders() })
                if (pRes.ok) {
                    const pData = await pRes.json()
                    const prod  = Array.isArray(pData) ? pData[0] : null
                    if (prod && prod.codigo) codigo = prod.codigo
                }
            } catch {}
        }
        const res = await fetch(`http://localhost:3000/imagem?nome=${encodeURIComponent(nome)}`, {
            headers: authHeaders()
        })
        await exibirResultadoImagem(res, nome, codigo)
    } catch { exibirErroImagem('Erro ao conectar com o servidor.') }
}

async function exibirResultadoImagem(res, titulo, codigo) {
    const resultado = document.getElementById('img-resultado')

    if (res.ok) {
        // Converte a resposta em blob para exibir
        const blob = await res.blob()
        const url  = URL.createObjectURL(blob)

        resultado.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h3 class="font-semibold text-gray-700">${titulo}</h3>
                        ${codigo ? `<p class="text-xs text-gray-400 mt-0.5">Código: ${codigo}</p>` : ''}
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background:#dcfce7; color:#16a34a;">✅ Imagem encontrada</span>
                        ${codigo ? `<select id="img-status-select" class="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold bg-white focus:outline-none focus:border-red-400 cursor-pointer">
                            <option value="pendente">⏳ Pendente</option>
                            <option value="verificada">✅ Verificada</option>
                            <option value="corrigir">⚠️ Corrigir</option>
                            <option value="sem_imagem">❌ Sem Imagem</option>
                        </select>` : ''}
                    </div>
                </div>
                <div class="p-6 flex justify-center bg-gray-50">
                    <img id="img-exibida" src="${url}" alt="${titulo}"
                        style="max-width:100%; max-height:500px; object-fit:contain; border-radius:8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                </div>
            </div>
        `
        // Revoga URL do blob após carregar imagem
        const imgEl = document.getElementById('img-exibida')
        if (imgEl) imgEl.onload = () => URL.revokeObjectURL(imgEl.src)

        // Carrega status salvo e vincula evento
        if (codigo) {
            try {
                const vRes  = await fetch('http://localhost:3000/imagens/verificacao/' + codigo, { headers: authHeaders() })
                const vData = await vRes.json()
                const sel   = document.getElementById('img-status-select')
                if (sel) {
                    sel.value = vData.status || 'pendente'
                    imgAplicarCorStatus(sel)
                    sel.onchange = async () => {
                        imgAplicarCorStatus(sel)
                        await fetch('http://localhost:3000/imagens/verificacao/' + codigo, {
                            method: 'POST', headers: authHeaders(),
                            body: JSON.stringify({ status: sel.value })
                        })
                    }
                }
            } catch (e) { console.warn('Erro ao carregar verificação:', e) }
        }
    } else {
        // Tenta ler o nome do arquivo que não foi encontrado
        let nomeArquivo = titulo
        try {
            const data = await res.json()
            if (data.nome) nomeArquivo = data.nome
        } catch {}

        resultado.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h3 class="font-semibold text-gray-700">${titulo}</h3>
                        ${codigo ? `<p class="text-xs text-gray-400 mt-0.5">Código: ${codigo}</p>` : ''}
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background:#fee2e2; color:#b91c1c;">❌ Imagem não encontrada</span>
                        ${codigo ? `<select id="img-status-select" class="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold bg-white focus:outline-none focus:border-red-400 cursor-pointer">
                            <option value="pendente">⏳ Pendente</option>
                            <option value="verificada">✅ Verificada</option>
                            <option value="corrigir">⚠️ Corrigir</option>
                            <option value="sem_imagem">❌ Sem Imagem</option>
                        </select>` : ''}
                    </div>
                </div>
                <div class="p-10 flex flex-col items-center justify-center bg-gray-50 gap-3">
                    <div style="width:120px; height:120px; background:#f3f4f6; border-radius:12px; display:flex; align-items:center; justify-content:center;">
                        <span style="font-size:48px;">📷</span>
                    </div>
                    <p class="text-sm text-gray-400">Arquivo esperado: <code class="bg-gray-100 px-2 py-0.5 rounded text-xs">${nomeArquivo}</code></p>
                    <p class="text-xs text-gray-300">Verifique se o arquivo existe em <code class="bg-gray-100 px-1 rounded">E:\Banco de Imagens\</code></p>
                </div>
            </div>
        `
        // Revoga URL do blob após carregar imagem
        const imgEl = document.getElementById('img-exibida')
        if (imgEl) imgEl.onload = () => URL.revokeObjectURL(imgEl.src)

        // Carrega status salvo e vincula evento
        if (codigo) {
            try {
                const vRes  = await fetch('http://localhost:3000/imagens/verificacao/' + codigo, { headers: authHeaders() })
                const vData = await vRes.json()
                const sel   = document.getElementById('img-status-select')
                if (sel) {
                    sel.value = vData.status || 'pendente'
                    imgAplicarCorStatus(sel)
                    sel.onchange = async () => {
                        imgAplicarCorStatus(sel)
                        await fetch('http://localhost:3000/imagens/verificacao/' + codigo, {
                            method: 'POST', headers: authHeaders(),
                            body: JSON.stringify({ status: sel.value })
                        })
                    }
                }
            } catch (e) { console.warn('Erro ao carregar verificação:', e) }
        }
    }
}

function exibirErroImagem(msg) {
    document.getElementById('img-resultado').innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p class="text-red-400 text-sm">${msg}</p>
        </div>
    `
}

function imgAplicarCorStatus(sel) {
    const cores = {
        pendente:   ['#f3f4f6','#374151'],
        verificada: ['#dcfce7','#16a34a'],
        corrigir:   ['#fef3c7','#92400e'],
        sem_imagem: ['#fee2e2','#dc2626'],
    }
    const [bg, color] = cores[sel.value] || cores.pendente
    sel.style.background   = bg
    sel.style.color        = color
    sel.style.borderColor  = color
}