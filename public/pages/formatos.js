let fmtEditandoId = null

const FMT_CATEGORIAS = ['Instagram','Facebook','YouTube','LinkedIn','WhatsApp','Web','Email','Impresso','Outro']

const FMT_CAT_CORES = {
    'Instagram': ['#fce7f3','#be185d','📸'],
    'Facebook':  ['#dbeafe','#1d4ed8','👥'],
    'YouTube':   ['#fee2e2','#dc2626','▶️'],
    'LinkedIn':  ['#dbeafe','#0369a1','💼'],
    'WhatsApp':  ['#dcfce7','#16a34a','💬'],
    'Web':       ['#f3e8ff','#7c3aed','🌐'],
    'Email':     ['#fef3c7','#92400e','📧'],
    'Impresso':  ['#f3f4f6','#374151','🖨️'],
    'Outro':     ['#f3f4f6','#6b7280','📐'],
}

function carregarFormatos() {
    setActive('btn-formatos')
    setConteudo(`
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <!-- Coluna esquerda: formulário -->
            <div class="flex flex-col gap-4">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="px-5 py-4 border-b border-gray-100">
                        <h3 id="fmt-form-titulo" class="font-semibold text-gray-700 text-sm">➕ Novo Formato</h3>
                    </div>
                    <div class="px-5 py-4 flex flex-col gap-3">

                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</label>
                            <input id="fmt-nome" type="text" placeholder="Ex: Post Stories"
                                class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
                        </div>

                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoria</label>
                            <select id="fmt-categoria" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-red-400">
                                <option value="">Selecione...</option>
                                ${FMT_CATEGORIAS.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>

                        <div class="flex gap-2">
                            <div class="flex flex-col gap-1 flex-1">
                                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Largura</label>
                                <input id="fmt-largura" type="number" placeholder="1080"
                                    class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
                            </div>
                            <div class="flex flex-col gap-1 flex-1">
                                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Altura</label>
                                <input id="fmt-altura" type="number" placeholder="1080"
                                    class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
                            </div>
                            <div class="flex flex-col gap-1" style="width:70px">
                                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Unidade</label>
                                <select id="fmt-unidade" class="border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:border-red-400">
                                    <option value="px">px</option>
                                    <option value="cm">cm</option>
                                    <option value="mm">mm</option>
                                    <option value="in">pol</option>
                                </select>
                            </div>
                        </div>

                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Orientação</label>
                            <div class="flex gap-2">
                                ${['Quadrado','Retrato','Paisagem'].map(o => `
                                    <button class="fmt-orient-btn flex-1 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-all" data-orient="${o}">
                                        ${o === 'Quadrado' ? '⬜' : o === 'Retrato' ? '📱' : '🖥️'} ${o}
                                    </button>
                                `).join('')}
                            </div>
                            <input id="fmt-orientacao" type="hidden" value="">
                        </div>

                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Descrição</label>
                            <textarea id="fmt-descricao" rows="2" placeholder="Ex: Post padrão feed Instagram"
                                class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none"></textarea>
                        </div>

                        <p id="fmt-msg" class="text-xs min-h-[16px]"></p>

                        <div class="flex gap-2">
                            <button id="fmt-btn-salvar" class="flex-1 py-2.5 text-white text-sm font-semibold rounded-lg" style="background:#b51515;">
                                💾 Salvar
                            </button>
                            <button id="fmt-btn-cancelar" class="py-2.5 px-4 text-sm font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50" style="display:none;">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Coluna direita: lista -->
            <div class="lg:col-span-2 flex flex-col gap-4">

                <!-- Busca e filtro -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div class="flex gap-3 flex-wrap items-end">
                        <div class="flex flex-col gap-1 flex-1" style="min-width:160px;">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Buscar</label>
                            <input id="fmt-busca" type="text" placeholder="Nome ou descrição..."
                                class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoria</label>
                            <select id="fmt-filtro-cat" class="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-red-400">
                                <option value="">Todas</option>
                                ${FMT_CATEGORIAS.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                        <button id="fmt-btn-buscar" class="px-5 py-2 text-white text-sm font-semibold rounded-lg" style="background:#b51515;">
                            🔍 Buscar
                        </button>
                    </div>
                </div>

                <!-- Lista por categoria -->
                <div id="fmt-lista"></div>
            </div>
        </div>
    `, 'Formatos & Medidas')

    fmtEditandoId = null

    // Orientação toggle
    document.querySelectorAll('.fmt-orient-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.fmt-orient-btn').forEach(b => {
                b.classList.remove('border-red-400', 'text-red-600', 'bg-red-50')
            })
            btn.classList.add('border-red-400', 'text-red-600', 'bg-red-50')
            document.getElementById('fmt-orientacao').value = btn.getAttribute('data-orient')
        }
    })

    // Auto detecta orientação ao preencher dimensões
    const autoOrient = () => {
        const l = parseInt(document.getElementById('fmt-largura').value) || 0
        const a = parseInt(document.getElementById('fmt-altura').value) || 0
        if (!l || !a) return
        const orient = l === a ? 'Quadrado' : l > a ? 'Paisagem' : 'Retrato'
        document.getElementById('fmt-orientacao').value = orient
        document.querySelectorAll('.fmt-orient-btn').forEach(btn => {
            btn.classList.toggle('border-red-400', btn.getAttribute('data-orient') === orient)
            btn.classList.toggle('text-red-600',   btn.getAttribute('data-orient') === orient)
            btn.classList.toggle('bg-red-50',      btn.getAttribute('data-orient') === orient)
        })
    }
    document.getElementById('fmt-largura').oninput = autoOrient
    document.getElementById('fmt-altura').oninput  = autoOrient

    document.getElementById('fmt-btn-salvar').onclick   = fmtSalvar
    document.getElementById('fmt-btn-cancelar').onclick = fmtCancelar
    document.getElementById('fmt-btn-buscar').onclick   = fmtBuscar
    document.getElementById('fmt-busca').onkeydown      = e => { if (e.key === 'Enter') fmtBuscar() }
    document.getElementById('fmt-filtro-cat').onchange  = fmtBuscar

    fmtBuscar()
}

async function fmtSalvar() {
    const nome       = document.getElementById('fmt-nome').value.trim()
    const categoria  = document.getElementById('fmt-categoria').value
    const largura    = document.getElementById('fmt-largura').value
    const altura     = document.getElementById('fmt-altura').value
    const unidade    = document.getElementById('fmt-unidade').value
    const orientacao = document.getElementById('fmt-orientacao').value
    const descricao  = document.getElementById('fmt-descricao').value.trim()
    const msgEl      = document.getElementById('fmt-msg')

    if (!nome) { msgEl.style.color = '#dc2626'; msgEl.textContent = 'Preencha o nome.'; return }

    msgEl.style.color = '#6b7280'; msgEl.textContent = 'Salvando...'

    try {
        const url    = fmtEditandoId ? `http://localhost:3000/formatos/${fmtEditandoId}` : 'http://localhost:3000/formatos'
        const method = fmtEditandoId ? 'PUT' : 'POST'
        const res    = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify({ nome, categoria, largura: largura||null, altura: altura||null, unidade, orientacao, descricao }) })
        if (res.ok) {
            msgEl.style.color = '#16a34a'; msgEl.textContent = '✅ Salvo!'
            fmtCancelar()
            fmtBuscar()
            setTimeout(() => { if (document.getElementById('fmt-msg')) document.getElementById('fmt-msg').textContent = '' }, 2000)
        } else {
            const d = await res.json(); msgEl.style.color = '#dc2626'; msgEl.textContent = d.error || 'Erro.'
        }
    } catch { msgEl.style.color = '#dc2626'; msgEl.textContent = 'Erro ao conectar.' }
}

function fmtCancelar() {
    fmtEditandoId = null
    document.getElementById('fmt-form-titulo').textContent = '➕ Novo Formato'
    document.getElementById('fmt-btn-cancelar').style.display = 'none'
    document.getElementById('fmt-btn-salvar').textContent = '💾 Salvar'
    document.getElementById('fmt-nome').value = ''
    document.getElementById('fmt-categoria').value = ''
    document.getElementById('fmt-largura').value = ''
    document.getElementById('fmt-altura').value = ''
    document.getElementById('fmt-unidade').value = 'px'
    document.getElementById('fmt-orientacao').value = ''
    document.getElementById('fmt-descricao').value = ''
    document.getElementById('fmt-msg').textContent = ''
    document.querySelectorAll('.fmt-orient-btn').forEach(b => b.classList.remove('border-red-400','text-red-600','bg-red-50'))
}

async function fmtBuscar() {
    const q      = document.getElementById('fmt-busca')?.value.trim() || ''
    const cat    = document.getElementById('fmt-filtro-cat')?.value || ''
    const lista  = document.getElementById('fmt-lista')
    if (!lista) return

    lista.innerHTML = '<p class="text-sm text-gray-400 py-4 text-center">Carregando...</p>'

    try {
        const params = new URLSearchParams()
        if (q)   params.append('q', q)
        if (cat) params.append('categoria', cat)

        const res      = await fetch(`http://localhost:3000/formatos?${params}`, { headers: authHeaders() })
        const formatos = await res.json()

        if (!formatos.length) {
            lista.innerHTML = '<p class="text-sm text-gray-400 py-6 text-center">Nenhum formato encontrado.</p>'
            return
        }

        // Agrupa por categoria
        const grupos = {}
        formatos.forEach(f => {
            const cat = f.categoria || 'Outro'
            if (!grupos[cat]) grupos[cat] = []
            grupos[cat].push(f)
        })

        lista.innerHTML = Object.entries(grupos).map(([cat, itens]) => {
            const [bg, color, icon] = FMT_CAT_CORES[cat] || ['#f3f4f6','#374151','📐']
            return `
                <div class="mb-4">
                    <div class="flex items-center gap-2 mb-2 px-1">
                        <span class="text-xs font-bold px-2 py-0.5 rounded-full" style="background:${bg};color:${color};">${icon} ${cat}</span>
                        <span class="text-xs text-gray-400">${itens.length} formato(s)</span>
                    </div>
                    <div class="grid grid-cols-1 gap-2">
                        ${itens.map(f => {
                            const dim = (f.largura && f.altura) ? `${f.largura} × ${f.altura} ${f.unidade}` : '—'
                            const razao = (f.largura && f.altura) ? (f.largura / f.altura).toFixed(2) : null
                            return `
                                <div class="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-4 hover:shadow-sm transition-all" data-id="${f.id}">
                                    <!-- Miniatura visual -->
                                    <div class="flex-shrink-0 flex items-center justify-center rounded" style="background:${bg};width:44px;height:44px;">
                                        <span style="font-size:20px;">${icon}</span>
                                    </div>
                                    <!-- Info -->
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-2">
                                            <p class="font-semibold text-gray-800 text-sm truncate">${f.nome}</p>
                                            ${f.orientacao ? `<span class="text-xs text-gray-400">${f.orientacao === 'Retrato' ? '📱' : f.orientacao === 'Paisagem' ? '🖥️' : '⬜'}</span>` : ''}
                                        </div>
                                        <p class="text-xs font-mono font-bold" style="color:${color};">${dim}</p>
                                        ${f.descricao ? `<p class="text-xs text-gray-400 truncate mt-0.5">${f.descricao}</p>` : ''}
                                    </div>
                                    <!-- Botão copiar dimensões -->
                                    <button class="fmt-btn-copiar flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition-all"
                                        data-dim="${dim}" title="Copiar dimensões">
                                        📋
                                    </button>
                                    <!-- Editar / Excluir -->
                                    <button class="fmt-btn-editar flex-shrink-0 text-gray-400 hover:text-blue-500 p-1.5 rounded-lg hover:bg-blue-50 transition-all" data-id="${f.id}" title="Editar">✏️</button>
                                    <button class="fmt-btn-excluir flex-shrink-0 text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all" data-id="${f.id}" title="Excluir">🗑️</button>
                                </div>
                            `
                        }).join('')}
                    </div>
                </div>
            `
        }).join('')

        // Copiar dimensões
        lista.querySelectorAll('.fmt-btn-copiar').forEach(btn => {
            btn.onclick = () => {
                const ta = document.createElement('textarea')
                ta.value = btn.getAttribute('data-dim')
                document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
                const orig = btn.textContent
                btn.textContent = '✅'; btn.style.color = '#16a34a'; btn.style.borderColor = '#16a34a'
                setTimeout(() => { btn.textContent = orig; btn.style.color = ''; btn.style.borderColor = '' }, 1200)
            }
        })

        // Editar
        lista.querySelectorAll('.fmt-btn-editar').forEach(btn => {
            btn.onclick = () => {
                const id = parseInt(btn.getAttribute('data-id'))
                const f  = formatos.find(x => x.id === id)
                if (!f) return
                fmtEditandoId = id
                document.getElementById('fmt-form-titulo').textContent  = '✏️ Editando'
                document.getElementById('fmt-nome').value               = f.nome
                document.getElementById('fmt-categoria').value          = f.categoria || ''
                document.getElementById('fmt-largura').value            = f.largura || ''
                document.getElementById('fmt-altura').value             = f.altura || ''
                document.getElementById('fmt-unidade').value            = f.unidade || 'px'
                document.getElementById('fmt-orientacao').value         = f.orientacao || ''
                document.getElementById('fmt-descricao').value          = f.descricao || ''
                document.getElementById('fmt-btn-cancelar').style.display = 'block'
                document.getElementById('fmt-btn-salvar').textContent   = '💾 Atualizar'
                // Marca orientação
                document.querySelectorAll('.fmt-orient-btn').forEach(b => {
                    const ativo = b.getAttribute('data-orient') === f.orientacao
                    b.classList.toggle('border-red-400', ativo)
                    b.classList.toggle('text-red-600',   ativo)
                    b.classList.toggle('bg-red-50',      ativo)
                })
                document.getElementById('fmt-nome').scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        })

        // Excluir
        lista.querySelectorAll('.fmt-btn-excluir').forEach(btn => {
            btn.onclick = async () => {
                if (!confirm('Excluir este formato?')) return
                await fetch(`http://localhost:3000/formatos/${btn.getAttribute('data-id')}`, { method: 'DELETE', headers: authHeaders() })
                fmtBuscar()
            }
        })

    } catch (e) {
        console.error(e)
        lista.innerHTML = '<p class="text-sm text-red-400 py-6 text-center">Erro ao conectar com o servidor.</p>'
    }
}