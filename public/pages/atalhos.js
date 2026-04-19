let atlEditandoId = null

const ATL_ICONES = ['📁','📄','🖼️','🎨','📊','📝','🎬','🎵','🔧','⚙️','🌐','📧','💼','🖥️','📱','🗂️','📦','🔗']

function carregarAtalhos() {
    setActive('btn-atalhos')
    setConteudo(`
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <!-- Coluna esquerda: formulário -->
            <div class="flex flex-col gap-4">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="px-5 py-4 border-b border-gray-100">
                        <h3 id="atl-form-titulo" class="font-semibold text-gray-700 text-sm">➕ Novo Atalho</h3>
                    </div>
                    <div class="px-5 py-4 flex flex-col gap-3">

                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</label>
                            <input id="atl-nome" type="text" placeholder="Ex: Template Oferta Semanal"
                                class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
                        </div>

                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoria</label>
                            <input id="atl-categoria" type="text" placeholder="Ex: Photoshop, Planilhas, Documentos"
                                class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
                                list="atl-cat-sugestoes">
                            <datalist id="atl-cat-sugestoes">
                                <option value="Photoshop">
                                <option value="Illustrator">
                                <option value="Word">
                                <option value="Excel">
                                <option value="Planilhas">
                                <option value="Documentos">
                                <option value="Vídeos">
                                <option value="Imagens">
                                <option value="Pastas">
                                <option value="Outros">
                            </datalist>
                        </div>

                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</label>
                            <div class="flex gap-2">
                                ${[['arquivo','📄 Arquivo'],['pasta','📁 Pasta'],['url','🌐 URL']].map(([val, label]) => `
                                    <button class="atl-tipo-btn flex-1 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-all" data-tipo="${val}">
                                        ${label}
                                    </button>
                                `).join('')}
                            </div>
                            <input id="atl-tipo" type="hidden" value="arquivo">
                        </div>

                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Caminho / URL</label>
                            <input id="atl-caminho" type="text" placeholder="Ex: D:\\Arquivos\\template.psd"
                                class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 font-mono">
                            <p class="text-xs text-gray-400">Cole o caminho completo do arquivo ou pasta</p>
                        </div>

                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ícone</label>
                            <div class="flex flex-wrap gap-1" id="atl-icones-grid">
                                ${ATL_ICONES.map(ic => `
                                    <button class="atl-icone-btn w-9 h-9 text-lg rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all" data-icone="${ic}">${ic}</button>
                                `).join('')}
                            </div>
                            <input id="atl-icone" type="hidden" value="📄">
                        </div>

                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Descrição</label>
                            <input id="atl-descricao" type="text" placeholder="Ex: Template de oferta semanal"
                                class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
                        </div>

                        <p id="atl-msg" class="text-xs min-h-[16px]"></p>

                        <div class="flex gap-2">
                            <button id="atl-btn-salvar" class="flex-1 py-2.5 text-white text-sm font-semibold rounded-lg" style="background:#b51515;">
                                💾 Salvar
                            </button>
                            <button id="atl-btn-cancelar" class="py-2.5 px-4 text-sm font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50" style="display:none;">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Coluna direita: atalhos -->
            <div class="lg:col-span-2 flex flex-col gap-4">

                <!-- Busca -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div class="flex gap-3 items-end">
                        <div class="flex flex-col gap-1 flex-1">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Buscar</label>
                            <input id="atl-busca" type="text" placeholder="Nome, categoria ou caminho..."
                                class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
                        </div>
                        <button id="atl-btn-buscar" class="px-5 py-2 text-white text-sm font-semibold rounded-lg" style="background:#b51515;">
                            🔍 Buscar
                        </button>
                    </div>
                </div>

                <!-- Lista -->
                <div id="atl-lista"></div>
            </div>
        </div>
    `, 'Atalhos')

    atlEditandoId = null

    // Tipo toggle
    document.querySelectorAll('.atl-tipo-btn').forEach(btn => {
        if (btn.getAttribute('data-tipo') === 'arquivo') {
            btn.classList.add('border-red-400','text-red-600','bg-red-50')
        }
        btn.onclick = () => {
            document.querySelectorAll('.atl-tipo-btn').forEach(b => b.classList.remove('border-red-400','text-red-600','bg-red-50'))
            btn.classList.add('border-red-400','text-red-600','bg-red-50')
            document.getElementById('atl-tipo').value = btn.getAttribute('data-tipo')
            // Ícone padrão por tipo
            const icones = { arquivo: '📄', pasta: '📁', url: '🌐' }
            const tipo = btn.getAttribute('data-tipo')
            atlSelecionarIcone(icones[tipo])
        }
    })

    // Ícone
    atlSelecionarIcone('📄')
    document.querySelectorAll('.atl-icone-btn').forEach(btn => {
        btn.onclick = () => atlSelecionarIcone(btn.getAttribute('data-icone'))
    })

    document.getElementById('atl-btn-salvar').onclick   = atlSalvar
    document.getElementById('atl-btn-cancelar').onclick = atlCancelar
    document.getElementById('atl-btn-buscar').onclick   = atlBuscar
    document.getElementById('atl-busca').onkeydown      = e => { if (e.key === 'Enter') atlBuscar() }

    atlBuscar()
}

function atlSelecionarIcone(icone) {
    document.getElementById('atl-icone').value = icone
    document.querySelectorAll('.atl-icone-btn').forEach(btn => {
        const ativo = btn.getAttribute('data-icone') === icone
        btn.classList.toggle('border-red-400', ativo)
        btn.classList.toggle('bg-red-50', ativo)
    })
}

async function atlSalvar() {
    const nome      = document.getElementById('atl-nome').value.trim()
    const categoria = document.getElementById('atl-categoria').value.trim()
    const tipo      = document.getElementById('atl-tipo').value
    const caminho   = document.getElementById('atl-caminho').value.trim()
    const icone     = document.getElementById('atl-icone').value
    const descricao = document.getElementById('atl-descricao').value.trim()
    const msgEl     = document.getElementById('atl-msg')

    if (!nome)    { msgEl.style.color = '#dc2626'; msgEl.textContent = 'Preencha o nome.'; return }
    if (!caminho) { msgEl.style.color = '#dc2626'; msgEl.textContent = 'Preencha o caminho.'; return }

    msgEl.style.color = '#6b7280'; msgEl.textContent = 'Salvando...'

    try {
        const url    = atlEditandoId ? `http://localhost:3000/atalhos/${atlEditandoId}` : 'http://localhost:3000/atalhos'
        const method = atlEditandoId ? 'PUT' : 'POST'
        const res    = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify({ nome, categoria, caminho, tipo, icone, descricao }) })
        if (res.ok) {
            msgEl.style.color = '#16a34a'; msgEl.textContent = '✅ Salvo!'
            atlCancelar(); atlBuscar()
            setTimeout(() => { if (document.getElementById('atl-msg')) document.getElementById('atl-msg').textContent = '' }, 2000)
        } else {
            const d = await res.json(); msgEl.style.color = '#dc2626'; msgEl.textContent = d.error || 'Erro.'
        }
    } catch { msgEl.style.color = '#dc2626'; msgEl.textContent = 'Erro ao conectar.' }
}

function atlCancelar() {
    atlEditandoId = null
    document.getElementById('atl-form-titulo').textContent      = '➕ Novo Atalho'
    document.getElementById('atl-btn-cancelar').style.display   = 'none'
    document.getElementById('atl-btn-salvar').textContent       = '💾 Salvar'
    document.getElementById('atl-nome').value                   = ''
    document.getElementById('atl-categoria').value              = ''
    document.getElementById('atl-caminho').value                = ''
    document.getElementById('atl-descricao').value              = ''
    document.getElementById('atl-msg').textContent              = ''
    // Reset tipo para arquivo
    document.querySelectorAll('.atl-tipo-btn').forEach(b => b.classList.remove('border-red-400','text-red-600','bg-red-50'))
    document.querySelector('.atl-tipo-btn[data-tipo="arquivo"]').classList.add('border-red-400','text-red-600','bg-red-50')
    document.getElementById('atl-tipo').value = 'arquivo'
    atlSelecionarIcone('📄')
}

async function atlAbrir(caminho, tipo) {
    try {
        const res = await fetch('http://localhost:3000/atalhos/abrir', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ caminho, tipo })
        })
        const data = await res.json()
        if (!res.ok) alert('Erro ao abrir: ' + (data.error || 'desconhecido'))
    } catch (e) {
        alert('Erro ao conectar com o servidor.')
    }
}

async function atlBuscar() {
    const q    = document.getElementById('atl-busca')?.value.trim() || ''
    const lista = document.getElementById('atl-lista')
    if (!lista) return

    lista.innerHTML = '<p class="text-sm text-gray-400 py-4 text-center">Carregando...</p>'

    try {
        const params = new URLSearchParams()
        if (q) params.append('q', q)

        const res     = await fetch(`http://localhost:3000/atalhos?${params}`, { headers: authHeaders() })
        const atalhos = await res.json()

        if (!atalhos.length) {
            lista.innerHTML = '<p class="text-sm text-gray-400 py-6 text-center">Nenhum atalho cadastrado. Adicione um ao lado!</p>'
            return
        }

        // Agrupa por categoria
        const grupos = {}
        atalhos.forEach(a => {
            const cat = a.categoria || 'Geral'
            if (!grupos[cat]) grupos[cat] = []
            grupos[cat].push(a)
        })

        lista.innerHTML = Object.entries(grupos).map(([cat, itens]) => `
            <div class="mb-5">
                <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">${cat}</p>
                <div class="grid grid-cols-1 gap-2">
                    ${itens.map(a => {
                        const tipoCor = a.tipo === 'pasta' ? '#fef3c7' : a.tipo === 'url' ? '#dbeafe' : '#f3f4f6'
                        const tipoClr = a.tipo === 'pasta' ? '#92400e' : a.tipo === 'url' ? '#1d4ed8' : '#374151'
                        const tipoLabel = a.tipo === 'pasta' ? 'Pasta' : a.tipo === 'url' ? 'URL' : 'Arquivo'
                        return `
                        <div class="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 hover:shadow-sm transition-all group">
                            <!-- Ícone grande clicável -->
                            <button class="atl-btn-abrir flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl hover:scale-110 transition-transform"
                                style="background:#f9fafb;"
                                data-caminho="${a.caminho}" data-tipo="${a.tipo}" title="Clique para abrir">
                                ${a.icone || '📄'}
                            </button>
                            <!-- Info -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2">
                                    <p class="font-semibold text-gray-800 text-sm">${a.nome}</p>
                                    <span class="text-xs px-1.5 py-0.5 rounded-full font-semibold" style="background:${tipoCor};color:${tipoClr};">${tipoLabel}</span>
                                </div>
                                <p class="text-xs font-mono text-gray-400 truncate mt-0.5" title="${a.caminho}">${a.caminho}</p>
                                ${a.descricao ? `<p class="text-xs text-gray-400 mt-0.5">${a.descricao}</p>` : ''}
                            </div>
                            <!-- Abrir -->
                            <button class="atl-btn-abrir flex-shrink-0 px-4 py-2 text-xs font-bold rounded-lg text-white transition-all"
                                style="background:#b51515;"
                                data-caminho="${a.caminho}" data-tipo="${a.tipo}">
                                ▶ Abrir
                            </button>
                            <!-- Editar / Excluir -->
                            <button class="atl-btn-editar opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-400 hover:text-blue-500 p-1.5 rounded-lg hover:bg-blue-50 transition-all" data-id="${a.id}" title="Editar">✏️</button>
                            <button class="atl-btn-excluir opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all" data-id="${a.id}" title="Excluir">🗑️</button>
                        </div>`
                    }).join('')}
                </div>
            </div>
        `).join('')

        // Abrir
        lista.querySelectorAll('.atl-btn-abrir').forEach(btn => {
            btn.onclick = () => atlAbrir(btn.getAttribute('data-caminho'), btn.getAttribute('data-tipo'))
        })

        // Editar
        lista.querySelectorAll('.atl-btn-editar').forEach(btn => {
            btn.onclick = () => {
                const id = parseInt(btn.getAttribute('data-id'))
                const a  = atalhos.find(x => x.id === id)
                if (!a) return
                atlEditandoId = id
                document.getElementById('atl-form-titulo').textContent      = '✏️ Editando'
                document.getElementById('atl-nome').value                   = a.nome
                document.getElementById('atl-categoria').value              = a.categoria || ''
                document.getElementById('atl-caminho').value                = a.caminho
                document.getElementById('atl-descricao').value              = a.descricao || ''
                document.getElementById('atl-tipo').value                   = a.tipo || 'arquivo'
                document.getElementById('atl-btn-cancelar').style.display   = 'block'
                document.getElementById('atl-btn-salvar').textContent       = '💾 Atualizar'
                // Marca tipo
                document.querySelectorAll('.atl-tipo-btn').forEach(b => {
                    b.classList.toggle('border-red-400', b.getAttribute('data-tipo') === a.tipo)
                    b.classList.toggle('text-red-600',   b.getAttribute('data-tipo') === a.tipo)
                    b.classList.toggle('bg-red-50',      b.getAttribute('data-tipo') === a.tipo)
                })
                atlSelecionarIcone(a.icone || '📄')
                document.getElementById('atl-nome').scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        })

        // Excluir
        lista.querySelectorAll('.atl-btn-excluir').forEach(btn => {
            btn.onclick = async () => {
                if (!confirm('Excluir este atalho?')) return
                await fetch(`http://localhost:3000/atalhos/${btn.getAttribute('data-id')}`, { method: 'DELETE', headers: authHeaders() })
                atlBuscar()
            }
        })

    } catch (e) {
        console.error(e)
        lista.innerHTML = '<p class="text-sm text-red-400 py-6 text-center">Erro ao conectar com o servidor.</p>'
    }
}