let txtEditandoId = null

async function carregarTextos() {
    setActive('btn-textos')
    setConteudo(`
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <!-- Coluna esquerda: formulário -->
            <div class="flex flex-col gap-4">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="px-5 py-4 border-b border-gray-100">
                        <h3 id="txt-form-titulo" class="font-semibold text-gray-700 text-sm">➕ Novo Texto</h3>
                    </div>
                    <div class="px-5 py-4 flex flex-col gap-3">

                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Título</label>
                            <input id="txt-titulo" type="text" placeholder="Ex: Oferta de Frango"
                                class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
                        </div>

                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoria</label>
                            <div class="flex gap-2">
                                <select id="txt-categoria" class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white">
                                    <option value="">Sem categoria</option>
                                    <option value="Rádio">📻 Rádio</option>
                                    <option value="Post">📱 Post</option>
                                    <option value="Legenda">💬 Legenda</option>
                                    <option value="Promoção">🏷️ Promoção</option>
                                    <option value="Outro">📝 Outro</option>
                                </select>
                            </div>
                        </div>

                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Conteúdo</label>
                            <textarea id="txt-conteudo" rows="7" placeholder="Digite o texto aqui..."
                                class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none"></textarea>
                        </div>

                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tags</label>
                            <input id="txt-tags" type="text" placeholder="Ex: frango, oferta, promoção"
                                class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
                            <p class="text-xs text-gray-400">Separe por vírgula para facilitar a busca</p>
                        </div>

                        <p id="txt-msg" class="text-xs min-h-[16px]"></p>

                        <div class="flex gap-2">
                            <button id="txt-btn-salvar" class="flex-1 py-2.5 text-white text-sm font-semibold rounded-lg" style="background:#b51515;">
                                💾 Salvar
                            </button>
                            <button id="txt-btn-cancelar" class="py-2.5 px-4 text-sm font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50" style="display:none;">
                                Cancelar
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            <!-- Coluna direita: lista e busca -->
            <div class="lg:col-span-2 flex flex-col gap-4">

                <!-- Busca e filtros -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div class="flex gap-3 flex-wrap items-end">
                        <div class="flex flex-col gap-1 flex-1" style="min-width:180px;">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Buscar</label>
                            <input id="txt-busca" type="text" placeholder="Título, conteúdo ou tag..."
                                class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoria</label>
                            <select id="txt-filtro-cat" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white">
                                <option value="">Todas</option>
                                <option value="Rádio">📻 Rádio</option>
                                <option value="Post">📱 Post</option>
                                <option value="Legenda">💬 Legenda</option>
                                <option value="Promoção">🏷️ Promoção</option>
                                <option value="Outro">📝 Outro</option>
                            </select>
                        </div>
                        <button id="txt-btn-buscar" class="px-5 py-2 text-white text-sm font-semibold rounded-lg" style="background:#b51515;">
                            🔍 Buscar
                        </button>
                    </div>
                </div>

                <!-- Resultados -->
                <div id="txt-lista"></div>

            </div>
        </div>
    `, 'Textos & Roteiros')

    txtEditandoId = null

    document.getElementById('txt-btn-salvar').onclick  = txtSalvar
    document.getElementById('txt-btn-cancelar').onclick = txtCancelarEdicao
    document.getElementById('txt-btn-buscar').onclick  = txtBuscar
    document.getElementById('txt-busca').onkeydown     = (e) => { if (e.key === 'Enter') txtBuscar() }
    document.getElementById('txt-filtro-cat').onchange = txtBuscar
    document.getElementById('txt-titulo').onkeydown    = (e) => { if (e.key === 'Enter') document.getElementById('txt-conteudo').focus() }

    await txtBuscar()
}

// ── SALVAR / EDITAR ───────────────────────────────────
async function txtSalvar() {
    const titulo    = document.getElementById('txt-titulo').value.trim()
    const categoria = document.getElementById('txt-categoria').value
    const conteudo  = document.getElementById('txt-conteudo').value.trim()
    const tags      = document.getElementById('txt-tags').value.trim()
    const msgEl     = document.getElementById('txt-msg')

    if (!titulo)   { msgEl.style.color = '#dc2626'; msgEl.textContent = 'Preencha o título.'; return }
    if (!conteudo) { msgEl.style.color = '#dc2626'; msgEl.textContent = 'Preencha o conteúdo.'; return }

    msgEl.style.color = '#6b7280'; msgEl.textContent = 'Salvando...'

    try {
        const url    = txtEditandoId ? `http://localhost:3000/textos/${txtEditandoId}` : 'http://localhost:3000/textos'
        const method = txtEditandoId ? 'PUT' : 'POST'
        const res    = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify({ titulo, categoria, conteudo, tags }) })

        if (res.ok) {
            msgEl.style.color = '#16a34a'
            msgEl.textContent = txtEditandoId ? '✅ Atualizado!' : '✅ Salvo com sucesso!'
            txtLimparForm()
            await txtBuscar()
            setTimeout(() => { if (document.getElementById('txt-msg')) document.getElementById('txt-msg').textContent = '' }, 3000)
        } else {
            const data = await res.json()
            msgEl.style.color = '#dc2626'; msgEl.textContent = data.error || 'Erro ao salvar.'
        }
    } catch { msgEl.style.color = '#dc2626'; msgEl.textContent = 'Erro ao conectar.' }
}

function txtLimparForm() {
    document.getElementById('txt-titulo').value    = ''
    document.getElementById('txt-categoria').value = ''
    document.getElementById('txt-conteudo').value  = ''
    document.getElementById('txt-tags').value      = ''
    txtCancelarEdicao()
}

function txtCancelarEdicao() {
    txtEditandoId = null
    document.getElementById('txt-form-titulo').textContent = '➕ Novo Texto'
    document.getElementById('txt-btn-cancelar').style.display = 'none'
    document.getElementById('txt-btn-salvar').textContent = '💾 Salvar'
    document.getElementById('txt-titulo').value    = ''
    document.getElementById('txt-categoria').value = ''
    document.getElementById('txt-conteudo').value  = ''
    document.getElementById('txt-tags').value      = ''
    document.getElementById('txt-msg').textContent = ''
}

// ── BUSCAR ────────────────────────────────────────────
async function txtBuscar() {
    const q        = document.getElementById('txt-busca')?.value.trim() || ''
    const cat      = document.getElementById('txt-filtro-cat')?.value || ''
    const listaEl  = document.getElementById('txt-lista')
    if (!listaEl) return

    listaEl.innerHTML = `<p class="text-sm text-gray-400 py-4 text-center">Carregando...</p>`

    try {
        const params = new URLSearchParams()
        if (q)   params.append('q', q)
        if (cat) params.append('categoria', cat)

        const res    = await fetch(`http://localhost:3000/textos?${params}`, { headers: authHeaders() })
        const textos = await res.json()

        if (!textos.length) {
            listaEl.innerHTML = `<p class="text-sm text-gray-400 py-6 text-center">Nenhum texto encontrado.</p>`
            return
        }

        const catCores = {
            'Rádio':    ['#fef3c7','#92400e','📻'],
            'Post':     ['#dbeafe','#1d4ed8','📱'],
            'Legenda':  ['#f3e8ff','#7c3aed','💬'],
            'Promoção': ['#dcfce7','#16a34a','🏷️'],
            'Outro':    ['#f3f4f6','#374151','📝'],
        }

        listaEl.innerHTML = textos.map(t => {
            const [bg, color, icon] = catCores[t.categoria] || ['#f3f4f6','#374151','📝']
            const tags = t.tags ? t.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
            const dt   = new Date(t.atualizado_em).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit' })

            return `
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-3" data-id="${t.id}">
                    <div class="px-5 py-3 border-b border-gray-50 flex items-start justify-between gap-3">
                        <div class="flex items-center gap-2 flex-1 min-w-0">
                            ${t.categoria ? `<span class="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style="background:${bg};color:${color};">${icon} ${t.categoria}</span>` : ''}
                            <h4 class="font-bold text-gray-800 text-sm truncate">${t.titulo}</h4>
                        </div>
                        <div class="flex items-center gap-1 flex-shrink-0">
                            <span class="text-xs text-gray-400">${dt}</span>
                            <button class="txt-btn-editar text-gray-400 hover:text-blue-500 p-1.5 rounded-lg hover:bg-blue-50 transition-all text-xs font-bold" data-id="${t.id}" title="Editar">✏️</button>
                            <button class="txt-btn-excluir text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all text-xs font-bold" data-id="${t.id}" title="Excluir">🗑️</button>
                        </div>
                    </div>
                    <div class="px-5 py-3">
                        <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">${t.conteudo}</p>
                    </div>
                    ${tags.length ? `
                    <div class="px-5 pb-3 flex flex-wrap gap-1">
                        ${tags.map(tag => `<span class="text-xs px-2 py-0.5 rounded-full" style="background:#f3f4f6;color:#6b7280;">#${tag}</span>`).join('')}
                    </div>` : ''}
                    <div class="px-5 pb-3">
                        <button class="txt-btn-copiar w-full py-2 text-xs font-bold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-1.5"
                            data-conteudo="${encodeURIComponent(t.conteudo)}">
                            📋 Copiar texto
                        </button>
                    </div>
                </div>
            `
        }).join('')

        // Eventos
        listaEl.querySelectorAll('.txt-btn-copiar').forEach(btn => {
            btn.onclick = () => {
                const texto = decodeURIComponent(btn.getAttribute('data-conteudo'))
                const ta = document.createElement('textarea')
                ta.value = texto
                document.body.appendChild(ta)
                ta.select()
                document.execCommand('copy')
                document.body.removeChild(ta)
                const orig = btn.textContent
                btn.textContent = '✅ Copiado!'
                btn.style.background = '#dcfce7'
                btn.style.color = '#16a34a'
                btn.style.borderColor = '#16a34a'
                setTimeout(() => {
                    btn.textContent = orig
                    btn.style.background = ''
                    btn.style.color = ''
                    btn.style.borderColor = ''
                }, 1500)
            }
        })

        listaEl.querySelectorAll('.txt-btn-editar').forEach(btn => {
            btn.onclick = () => {
                const id    = parseInt(btn.getAttribute('data-id'))
                const texto = textos.find(t => t.id === id)
                if (!texto) return
                txtEditandoId = id
                document.getElementById('txt-form-titulo').textContent = '✏️ Editando'
                document.getElementById('txt-titulo').value    = texto.titulo
                document.getElementById('txt-categoria').value = texto.categoria || ''
                document.getElementById('txt-conteudo').value  = texto.conteudo
                document.getElementById('txt-tags').value      = texto.tags || ''
                document.getElementById('txt-btn-cancelar').style.display = 'block'
                document.getElementById('txt-btn-salvar').textContent = '💾 Atualizar'
                document.getElementById('txt-titulo').focus()
                // Scroll para o formulário
                document.getElementById('txt-titulo').scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        })

        listaEl.querySelectorAll('.txt-btn-excluir').forEach(btn => {
            btn.onclick = async () => {
                if (!confirm('Excluir este texto?')) return
                const id = btn.getAttribute('data-id')
                await fetch(`http://localhost:3000/textos/${id}`, { method:'DELETE', headers: authHeaders() })
                await txtBuscar()
            }
        })

    } catch (e) {
        console.error(e)
        listaEl.innerHTML = `<p class="text-sm text-red-400 py-6 text-center">Erro ao conectar com o servidor.</p>`
    }
}