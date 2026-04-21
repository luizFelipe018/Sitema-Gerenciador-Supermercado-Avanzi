function carregarAdmin() {
    if (!isAdmin()) return

    setActive('btn-admin')
    const cargoUsuario = window.getCargo()
    setConteudo(`
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">

            <!-- Cadastrar usuário -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100">
                    <h3 class="font-semibold text-gray-700">Cadastrar Usuário</h3>
                </div>
                <div class="px-6 py-5 flex flex-col gap-3">
                    <input id="admin-nome" type="text" placeholder="Nome completo"
                        class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
                    <input id="admin-usuario" type="text" placeholder="Usuário (login)"
                        class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
                    <input id="admin-senha" type="password" placeholder="Senha"
                        class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
                    <select id="admin-cargo" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
                        <option value="atendente">Atendente</option>
                        <option value="gerente">Gerente</option>
                        <option value="administrador">Administrador</option>
                    </select>
                    <p id="admin-erro" class="text-xs text-red-500 min-h-[16px]"></p>
                    <p id="admin-ok" class="text-xs text-green-600 min-h-[16px]"></p>
                    <button id="admin-salvar" class="text-white text-sm font-semibold py-2 rounded-lg" style="background:#b51515;">
                        Cadastrar
                    </button>
                </div>
            </div>

            <!-- Info do sistema -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100">
                    <h3 class="font-semibold text-gray-700">Informações do Sistema</h3>
                </div>
                <div class="px-6 py-5 flex flex-col gap-2 text-sm text-gray-500">
                    <p>👤 Usuário logado: <span class="font-semibold text-gray-700">${getUsuario()}</span></p>
                    <p>🔑 Perfil: <span class="font-semibold text-gray-700">${cargoUsuario === 'administrador' ? 'Administrador' : cargoUsuario === 'gerente' ? 'Gerente' : 'Atendente'}</span></p>
                    <p>🗄️ Banco: <span class="font-semibold text-gray-700">supermercado</span></p>
                    <p>🌐 Servidor: <span class="font-semibold text-gray-700">localhost:3000</span></p>
                </div>
            </div>
        </div>

        <!-- Gerenciar Usuários -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 class="font-semibold text-gray-700">Gerenciar Usuários</h3>
                <button id="btn-recargar-usuarios" class="px-4 py-1.5 text-white text-xs font-semibold rounded-lg" style="background:#16a34a;">
                    🔄 Atualizar
                </button>
            </div>
            <div class="px-6 py-5">
                <div id="lista-usuarios"></div>
            </div>
        </div>

        <!-- Configurações do sistema -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
            <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="font-semibold text-gray-700">⚙️ Configurações</h3>
            </div>
            <div class="px-6 py-5 flex flex-col gap-4">

                <!-- Pasta de imagens -->
                <div class="flex flex-col gap-2">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        📁 Pasta de Imagens
                    </label>
                    <p class="text-xs text-gray-400">Caminho da pasta onde ficam as imagens dos produtos. Altere aqui ao trocar de máquina.</p>
                    <div class="flex gap-2">
                        <input id="cfg-pasta-imagens" type="text" placeholder="Ex: E:\Banco de Imagens"
                            class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-red-400" />
                        <button id="cfg-btn-salvar-pasta" class="px-5 py-2 text-white text-sm font-semibold rounded-lg" style="background:#b51515;">
                            Salvar
                        </button>
                    </div>
                    <p id="cfg-pasta-msg" class="text-xs min-h-[16px]"></p>
                </div>

                <!-- Pasta de imagens dos pratos -->
                <div class="flex flex-col gap-2">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        🍽️ Pasta de Imagens dos Pratos
                    </label>
                    <p class="text-xs text-gray-400">Pasta com as fotos dos pratos para o cardápio do restaurante.</p>
                    <div class="flex gap-2">
                        <input id="cfg-pasta-pratos" type="text" placeholder="Ex: E:\Imagens\Pratos"
                            class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-red-400" />
                        <button id="cfg-btn-salvar-pratos" class="px-5 py-2 text-white text-sm font-semibold rounded-lg" style="background:#b51515;">
                            Salvar
                        </button>
                    </div>
                    <p id="cfg-pratos-msg" class="text-xs min-h-[16px]"></p>
                </div>

            </div>
        </div>

        <!-- Produtos incompletos -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 class="font-semibold text-gray-700">Produtos com Informações Faltando</h3>
                <button id="btn-verificar-incompletos" class="px-4 py-1.5 text-white text-xs font-semibold rounded-lg" style="background:#b51515;">
                    🔍 Verificar
                </button>
                <button id="btn-revisao-por-marca" class="px-4 py-1.5 text-white text-xs font-semibold rounded-lg" style="background:#16a34a;">
                    🏷️ Revisar por Marca
                </button>
            </div>
            <div id="incompletos-wrapper" class="px-6 py-5">
                <p class="text-sm text-gray-400">Clique em "Verificar" para analisar o banco.</p>
            </div>
        </div>

        <!-- Edição de produtos -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100">
                <h3 class="font-semibold text-gray-700">Editar Produto</h3>
            </div>
            <div class="px-6 py-5">

                <!-- Busca -->
                <div class="flex gap-3 mb-5">
                    <input id="prod-busca" type="text" placeholder="Digite o código, EAN ou parte do nome..."
                        class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
                    <button id="prod-btn-buscar" class="px-5 py-2 text-white text-sm font-semibold rounded-lg" style="background:#1a1a2e;">
                        🔍 Buscar
                    </button>
                </div>

                <!-- Resultados da busca -->
                <div id="prod-resultados" class="mb-5"></div>

                <!-- Formulário de edição (oculto até selecionar) -->
                <div id="prod-form" style="display:none;">
                    <div class="border-t border-gray-100 pt-5">
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                            Editando: <span id="prod-editando" class="text-gray-700 normal-case font-bold"></span>
                        </p>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="flex flex-col gap-1">
                                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Descrição</label>
                                <input id="pe-descricao" type="text" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Marca</label>
                                <input id="pe-marca" type="text" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">EAN</label>
                                <input id="pe-ean" type="text" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preço de Venda</label>
                                <input id="pe-preco" type="number" step="0.01" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Departamento</label>
                                <input id="pe-departamento" type="text" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Descrição Departamento</label>
                                <input id="pe-descricao-dep" type="text" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Seção</label>
                                <input id="pe-secao" type="text" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Grupo</label>
                                <input id="pe-grupo" type="text" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quantidade KG/L</label>
                                <input id="pe-qtd-kgl" type="number" step="0.001" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Unidade (KG/LT/UN)</label>
                                <input id="pe-kglt" type="text" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
                            </div>
                        </div>

                        <div class="flex gap-3 mt-5 items-center">
                            <button id="prod-btn-salvar" class="px-6 py-2 text-white text-sm font-semibold rounded-lg" style="background:#b51515;">
                                💾 Salvar Alterações
                            </button>
                            <button id="prod-btn-cancelar" class="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                                Cancelar
                            </button>
                            <p id="prod-msg" class="text-xs min-h-[16px] ml-2"></p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `, 'Admin')

    vincularEventosAdmin()
}

// ── EVENTOS ADMIN ─────────────────────────────────────
function vincularEventosAdmin() {

    // Carregar lista de usuários
    carregarListaUsuarios()
    document.getElementById('btn-recargar-usuarios')?.addEventListener('click', carregarListaUsuarios)

    // Cadastrar usuário
    document.getElementById('admin-salvar').onclick = async () => {
        const nome    = document.getElementById('admin-nome').value.trim()
        const usuario = document.getElementById('admin-usuario').value.trim()
        const senha   = document.getElementById('admin-senha').value
        const cargo   = document.getElementById('admin-cargo').value
        const erroEl  = document.getElementById('admin-erro')
        const okEl    = document.getElementById('admin-ok')
        erroEl.textContent = ''; okEl.textContent = ''
        if (!nome || !usuario || !senha) { erroEl.textContent = 'Preencha todos os campos.'; return }
        try {
            const res = await fetch('http://localhost:3000/usuarios', {
                method: 'POST', headers: authHeaders(),
                body: JSON.stringify({ nome, usuario, senha, cargo })
            })
            const data = await res.json()
            if (res.ok) {
                okEl.textContent = `Usuário "${usuario}" cadastrado com sucesso!`
                document.getElementById('admin-nome').value = ''
                document.getElementById('admin-usuario').value = ''
                document.getElementById('admin-senha').value = ''
                document.getElementById('admin-cargo').value = 'atendente'
                carregarListaUsuarios()
            } else { erroEl.textContent = data.error ?? 'Erro ao cadastrar.' }
        } catch { erroEl.textContent = 'Erro ao conectar.' }
    }

    // Configuração — pasta de imagens
    carregarConfigPastaImagens()
    document.getElementById('cfg-btn-salvar-pasta').onclick = salvarConfigPastaImagens
    document.getElementById('cfg-pasta-imagens').onkeydown = (e) => {
        if (e.key === 'Enter') salvarConfigPastaImagens()
    }
    carregarConfigPastaProatos()
    document.getElementById('cfg-btn-salvar-pratos').onclick = salvarConfigPastaPratos
    document.getElementById('cfg-pasta-pratos').onkeydown = (e) => {
        if (e.key === 'Enter') salvarConfigPastaPratos()
    }
    document.getElementById('cfg-pasta-imagens').onkeydown = (e) => {
        if (e.key === 'Enter') salvarConfigPastaImagens()
    }

    // Verificar incompletos — onclick evita acúmulo de listeners
    document.getElementById('btn-verificar-incompletos').onclick = verificarIncompletos
    document.getElementById('btn-revisao-por-marca').onclick = abrirRevisaoPorMarca

    // Buscar produto
    document.getElementById('prod-btn-buscar').onclick = buscarProdutoAdmin
    document.getElementById('prod-busca').onkeydown = (e) => {
        if (e.key === 'Enter') buscarProdutoAdmin()
    }

    // Cancelar edição
    document.getElementById('prod-btn-cancelar').onclick = () => {
        document.getElementById('prod-form').style.display = 'none'
        document.getElementById('prod-resultados').innerHTML = ''
        document.getElementById('prod-busca').value = ''
        document.getElementById('prod-busca').focus()
    }
}

// ── BUSCAR PRODUTO ────────────────────────────────────
async function buscarProdutoAdmin() {
    const termo = document.getElementById('prod-busca').value.trim()
    if (!termo) return

    const resultadosEl = document.getElementById('prod-resultados')
    resultadosEl.innerHTML = `<p class="text-sm text-gray-400">Buscando...</p>`
    document.getElementById('prod-form').style.display = 'none'

    try {
        const res  = await fetch('http://localhost:3000/produtos', { headers: authHeaders() })
        const data = await res.json()
        if (!Array.isArray(data)) { resultadosEl.innerHTML = `<p class="text-sm text-red-400">Erro ao buscar.</p>`; return }

        const q = termo.toLowerCase()
        const resultados = data.filter(p =>
            p.codigo?.toLowerCase().includes(q) ||
            p.ean?.toLowerCase().includes(q) ||
            p.descricao?.toLowerCase().includes(q) ||
            p.marca?.toLowerCase().includes(q)
        ).slice(0, 20)

        if (!resultados.length) {
            resultadosEl.innerHTML = `<p class="text-sm text-gray-400">Nenhum produto encontrado.</p>`
            return
        }

        resultadosEl.innerHTML = `
            <p class="text-xs text-gray-400 mb-2">${resultados.length} resultado(s) — clique para editar</p>
            <div class="border border-gray-100 rounded-lg overflow-hidden">
                <table class="w-full text-sm">
                    <thead><tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <th class="px-4 py-2 text-left font-semibold">Código</th>
                        <th class="px-4 py-2 text-left font-semibold">Descrição</th>
                        <th class="px-4 py-2 text-left font-semibold">Marca</th>
                        <th class="px-4 py-2 text-right font-semibold">Preço</th>
                    </tr></thead>
                    <tbody class="divide-y divide-gray-100">
                        ${resultados.map((p, i) => `
                            <tr class="hover:bg-red-50 cursor-pointer transition-colors" data-index="${i}">
                                <td class="px-4 py-2.5 font-mono text-gray-500 text-xs">${p.codigo}</td>
                                <td class="px-4 py-2.5 text-gray-800 font-medium">${p.descricao}</td>
                                <td class="px-4 py-2.5 text-gray-500">${p.marca || '<span class="text-red-300">vazio</span>'}</td>
                                <td class="px-4 py-2.5 text-right text-gray-700">R$ ${parseFloat(p.preco_venda || 0).toFixed(2).replace('.', ',')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `

        // Clique na linha abre o formulário
        resultadosEl.querySelectorAll('tbody tr').forEach(tr => {
            tr.addEventListener('click', () => {
                const i = parseInt(tr.getAttribute('data-index'))
                abrirFormEdicao(resultados[i])
            })
        })

    } catch { resultadosEl.innerHTML = `<p class="text-sm text-red-400">Erro ao conectar com o servidor.</p>` }
}

// ── FORMULÁRIO DE EDIÇÃO ──────────────────────────────
function abrirFormEdicao(p) {
    document.getElementById('prod-editando').textContent = `${p.codigo} — ${p.descricao}`
    document.getElementById('pe-descricao').value    = p.descricao || ''
    document.getElementById('pe-marca').value        = p.marca || ''
    document.getElementById('pe-ean').value          = p.ean || ''
    document.getElementById('pe-preco').value        = p.preco_venda || ''
    document.getElementById('pe-departamento').value = p.departamento || ''
    document.getElementById('pe-descricao-dep').value = p.descricao_departamento || ''
    document.getElementById('pe-secao').value        = p.secao || ''
    document.getElementById('pe-grupo').value        = p.grupo || ''
    document.getElementById('pe-qtd-kgl').value      = p.quantidade_kg_l || ''
    document.getElementById('pe-kglt').value         = p.descricao_kglt || ''
    document.getElementById('prod-msg').textContent  = ''

    document.getElementById('prod-form').style.display = 'block'
    document.getElementById('prod-form').scrollIntoView({ behavior: 'smooth' })

    // Salvar alterações
    const btnSalvar = document.getElementById('prod-btn-salvar')
    const novoBtn   = btnSalvar.cloneNode(true) // remove listeners antigos
    btnSalvar.replaceWith(novoBtn)

    novoBtn.addEventListener('click', async () => {
        const msgEl = document.getElementById('prod-msg')
        msgEl.style.color = '#6b7280'
        msgEl.textContent = 'Salvando...'

        const body = {
            descricao:              document.getElementById('pe-descricao').value.trim(),
            marca:                  document.getElementById('pe-marca').value.trim(),
            ean:                    document.getElementById('pe-ean').value.trim(),
            preco_venda:            parseFloat(document.getElementById('pe-preco').value) || 0,
            departamento:           document.getElementById('pe-departamento').value.trim(),
            descricao_departamento: document.getElementById('pe-descricao-dep').value.trim(),
            secao:                  document.getElementById('pe-secao').value.trim(),
            grupo:                  document.getElementById('pe-grupo').value.trim(),
            quantidade_kg_l:        parseFloat(document.getElementById('pe-qtd-kgl').value) || 0,
            descricao_kglt:         document.getElementById('pe-kglt').value.trim(),
        }

        try {
            const res = await fetch(`http://localhost:3000/produtos/${p.codigo}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify(body)
            })
            const data = await res.json()

            if (res.ok) {
                msgEl.style.color = '#16a34a'
                msgEl.textContent = '✅ Salvo com sucesso!'
                // Atualiza o nome exibido
                document.getElementById('prod-editando').textContent = `${p.codigo} — ${body.descricao}`
                setTimeout(() => { if (msgEl) msgEl.textContent = '' }, 3000)
            } else {
                msgEl.style.color = '#dc2626'
                msgEl.textContent = data.error ?? 'Erro ao salvar.'
            }
        } catch {
            msgEl.style.color = '#dc2626'
            msgEl.textContent = 'Erro ao conectar com o servidor.'
        }
    })
}

// ── PRODUTOS INCOMPLETOS ──────────────────────────────
const CAMPOS_VERIFICAR = [
    { campo: 'marca',                  label: 'Marca' },
    { campo: 'ean',                    label: 'EAN' },
    { campo: 'descricao_departamento', label: 'Desc. Departamento' },
    { campo: 'departamento',           label: 'Departamento' },
    { campo: 'secao',                  label: 'Seção' },
    { campo: 'grupo',                  label: 'Grupo' },
    { campo: 'descricao_kglt',         label: 'Unidade (KG/LT/UN)' },
    { campo: 'quantidade_kg_l',        label: 'Qtd KG/L' },
    { campo: 'preco_venda',            label: 'Preço de Venda' },
]

// Fila de revisão rápida
let filaRevisao = []
let filaIndex   = 0
let modoRevisao = false

function vazio(val) {
    if (val === null || val === undefined) return true
    const s = String(val).trim()
    return s === '' || s === '0' || s === '0.000' || s === '0.00'
}

async function verificarIncompletos() {
    const wrapper = document.getElementById('incompletos-wrapper')
    wrapper.innerHTML = `<p class="text-sm text-gray-400">Carregando...</p>`

    try {
        const res  = await fetch('http://localhost:3000/produtos', { headers: authHeaders() })
        const data = await res.json()
        if (!Array.isArray(data)) { wrapper.innerHTML = `<p class="text-sm text-red-400">Erro ao carregar.</p>`; return }

        // Para cada campo, conta e lista os produtos com aquele campo vazio
        const grupos = CAMPOS_VERIFICAR.map(({ campo, label }) => {
            const produtos = data.filter(p => vazio(p[campo]))
            return { campo, label, produtos, total: produtos.length }
        }).filter(g => g.total > 0)

        if (!grupos.length) {
            wrapper.innerHTML = `<p class="text-sm text-green-600 font-semibold">✅ Todos os produtos estão completos!</p>`
            return
        }

        // Resumo com badges clicáveis
        const totalUnico = new Set(grupos.flatMap(g => g.produtos.map(p => p.codigo))).size

        wrapper.innerHTML = `
            <p class="text-xs text-gray-400 mb-4">${totalUnico} produto(s) com alguma informação faltando</p>

            <!-- Badges de filtro por campo -->
            <div class="flex flex-wrap gap-2 mb-5" id="badges-incompletos">
                <button class="badge-campo px-3 py-1.5 rounded-full text-xs font-semibold border-2 active-badge" data-campo="todos"
                    style="background:#1a1a2e; color:#fff; border-color:#1a1a2e;">
                    Todos (${totalUnico})
                </button>
                ${grupos.map(g => `
                    <button class="badge-campo px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50" data-campo="${g.campo}">
                        ${g.label} (${g.total})
                    </button>
                `).join('')}
            </div>

            <!-- Tabela de resultados -->
            <div id="tabela-incompletos"></div>
        `

        // Renderiza tabela inicial com todos
        renderTabelaIncompletos(grupos, 'todos')

        // Eventos dos badges
        wrapper.querySelectorAll('.badge-campo').forEach(btn => {
            btn.addEventListener('click', () => {
                wrapper.querySelectorAll('.badge-campo').forEach(b => {
                    b.style.background = ''; b.style.color = '#4b5563'; b.style.borderColor = '#e5e7eb'
                })
                btn.style.background = '#1a1a2e'; btn.style.color = '#fff'; btn.style.borderColor = '#1a1a2e'
                renderTabelaIncompletos(grupos, btn.getAttribute('data-campo'))
            })
        })

    } catch { wrapper.innerHTML = `<p class="text-sm text-red-400">Erro ao conectar com o servidor.</p>` }
}

function renderTabelaIncompletos(grupos, campoFiltro) {
    const el = document.getElementById('tabela-incompletos')
    if (!el) return

    let produtos = []

    if (campoFiltro === 'todos') {
        // Todos os produtos únicos com qualquer campo vazio
        const mapa = {}
        grupos.forEach(g => {
            g.produtos.forEach(p => {
                if (!mapa[p.codigo]) mapa[p.codigo] = { ...p, campos_faltando: [] }
                mapa[p.codigo].campos_faltando.push(g.label)
            })
        })
        produtos = Object.values(mapa)
    } else {
        const grupo = grupos.find(g => g.campo === campoFiltro)
        if (!grupo) return
        produtos = grupo.produtos.map(p => ({ ...p, campos_faltando: [grupo.label] }))
    }

    if (!produtos.length) { el.innerHTML = `<p class="text-sm text-gray-400">Nenhum produto nesta categoria.</p>`; return }

    el.innerHTML = `
        <div class="border border-gray-100 rounded-lg overflow-hidden">
            <table class="w-full text-sm">
                <thead><tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th class="px-4 py-2 text-left font-semibold">Código</th>
                    <th class="px-4 py-2 text-left font-semibold">Descrição</th>
                    <th class="px-4 py-2 text-left font-semibold">Campos faltando</th>
                    <th class="px-4 py-2 text-center font-semibold">Ação</th>
                </tr></thead>
                <tbody class="divide-y divide-gray-100">
                    ${produtos.slice(0, 200).map(p => `
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-4 py-2.5 font-mono text-gray-500 text-xs">${p.codigo}</td>
                            <td class="px-4 py-2.5 text-gray-800 font-medium">${p.descricao}</td>
                            <td class="px-4 py-2.5">
                                <div class="flex flex-wrap gap-1">
                                    ${p.campos_faltando.map(c =>
                                        `<span class="px-2 py-0.5 rounded-full text-xs font-semibold" style="background:#fee2e2;color:#b91c1c;">${c}</span>`
                                    ).join('')}
                                </div>
                            </td>
                            <td class="px-4 py-2.5 text-center">
                                <button class="btn-editar-incompleto text-xs font-semibold text-white px-3 py-1 rounded-lg" 
                                    style="background:#b51515;" data-codigo="${p.codigo}">
                                    Editar
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ${produtos.length > 200 ? `<p class="text-xs text-gray-300 px-4 py-2">Exibindo 200 de ${produtos.length} — use o filtro por campo para refinar</p>` : ''}
        </div>
        <div class="mt-4">
            <button id="btn-revisao-rapida" class="px-5 py-2 text-white text-sm font-semibold rounded-lg" style="background:#b51515;">
                ⚡ Iniciar Revisão Rápida (${produtos.length} produtos)
            </button>
        </div>
    `

    // Botão revisão rápida
    el.querySelector('#btn-revisao-rapida')?.addEventListener('click', () => {
        iniciarRevisaoRapida(produtos)
    })

    // Botão editar abre direto o formulário de edição
    el.querySelectorAll('.btn-editar-incompleto').forEach(btn => {
        btn.addEventListener('click', async () => {
            const codigo = btn.getAttribute('data-codigo')
            try {
                const res  = await fetch(`http://localhost:3000/produtos/${codigo}`, { headers: authHeaders() })
                const prod = await res.json()
                if (res.ok) {
                    abrirFormEdicao(prod)
                    document.getElementById('prod-form').scrollIntoView({ behavior: 'smooth' })
                }
            } catch { alert('Erro ao carregar produto.') }
        })
    })
}

// ── REVISÃO RÁPIDA ────────────────────────────────────
function iniciarRevisaoRapida(produtos) {
    filaRevisao = produtos
    filaIndex   = 0
    modoRevisao = true
    carregarProximoRevisao()
}

function carregarProximoRevisao() {
    if (filaIndex >= filaRevisao.length) {
        // Fim da fila
        document.getElementById('prod-form').style.display = 'none'
        const wrapper = document.getElementById('incompletos-wrapper')
        if (wrapper) {
            wrapper.innerHTML = `
                <div class="flex items-center gap-3 text-green-600">
                    <span class="text-2xl">✅</span>
                    <div>
                        <p class="font-semibold">Revisão concluída!</p>
                        <p class="text-xs text-gray-400 mt-0.5">${filaRevisao.length} produto(s) revisado(s).</p>
                    </div>
                    <button id="btn-nova-verificacao" class="ml-auto px-4 py-1.5 text-white text-xs font-semibold rounded-lg" style="background:#b51515;">
                        Nova Verificação
                    </button>
                </div>
            `
            document.getElementById('btn-nova-verificacao')?.addEventListener('click', verificarIncompletos)
        }
        modoRevisao = false
        return
    }

    const p = filaRevisao[filaIndex]
    abrirFormEdicaoRevisao(p)
}

function abrirFormEdicaoRevisao(p) {
    // Preenche o form igual ao normal
    abrirFormEdicao(p)

    // Troca o header do form para mostrar progresso
    document.getElementById('prod-editando').innerHTML = `
        <span>${p.codigo} — ${p.descricao}</span>
        <span class="ml-3 text-xs font-normal text-gray-400">${filaIndex + 1} de ${filaRevisao.length}</span>
    `

    // Adiciona barra de progresso e botão Pular se ainda não existir
    const form = document.getElementById('prod-form')
    let barra = document.getElementById('revisao-barra')
    if (!barra) {
        const div = document.createElement('div')
        div.id = 'revisao-barra'
        div.style.cssText = 'margin-bottom:12px;'
        div.innerHTML = `
            <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-gray-400">Progresso da revisão</span>
                <span id="revisao-progresso-txt" class="text-xs font-semibold text-gray-600"></span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
                <div id="revisao-barra-fill" class="h-2 rounded-full transition-all" style="background:#b51515;"></div>
            </div>
        `
        form.querySelector('.border-t').prepend(div)
    }

    // Atualiza progresso
    const pct = Math.round((filaIndex / filaRevisao.length) * 100)
    document.getElementById('revisao-barra-fill').style.width = pct + '%'
    document.getElementById('revisao-progresso-txt').textContent = `${filaIndex + 1} / ${filaRevisao.length}`

    // Adiciona botão Pular se ainda não existir
    let btnPular = document.getElementById('btn-pular-revisao')
    if (!btnPular) {
        btnPular = document.createElement('button')
        btnPular.id = 'btn-pular-revisao'
        btnPular.textContent = 'Pular →'
        btnPular.className = 'px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50'
        document.getElementById('prod-btn-cancelar').after(btnPular)
    }
    // Recria listener do pular para evitar duplicação
    const novoPular = btnPular.cloneNode(true)
    btnPular.replaceWith(novoPular)
    novoPular.addEventListener('click', () => {
        filaIndex++
        carregarProximoRevisao()
    })

    // Sobrescreve o salvar para avançar automaticamente
    const btnSalvar = document.getElementById('prod-btn-salvar')
    const novoSalvar = btnSalvar.cloneNode(true)
    novoSalvar.textContent = `💾 Salvar e Próximo`
    btnSalvar.replaceWith(novoSalvar)

    novoSalvar.addEventListener('click', async () => {
        const msgEl = document.getElementById('prod-msg')
        msgEl.style.color = '#6b7280'
        msgEl.textContent = 'Salvando...'

        const body = {
            descricao:              document.getElementById('pe-descricao').value.trim(),
            marca:                  document.getElementById('pe-marca').value.trim(),
            ean:                    document.getElementById('pe-ean').value.trim(),
            preco_venda:            parseFloat(document.getElementById('pe-preco').value) || 0,
            departamento:           document.getElementById('pe-departamento').value.trim(),
            descricao_departamento: document.getElementById('pe-descricao-dep').value.trim(),
            secao:                  document.getElementById('pe-secao').value.trim(),
            grupo:                  document.getElementById('pe-grupo').value.trim(),
            quantidade_kg_l:        parseFloat(document.getElementById('pe-qtd-kgl').value) || 0,
            descricao_kglt:         document.getElementById('pe-kglt').value.trim(),
        }

        try {
            const res = await fetch(`http://localhost:3000/produtos/${p.codigo}`, {
                method: 'PUT', headers: authHeaders(), body: JSON.stringify(body)
            })
            if (res.ok) {
                filaIndex++
                carregarProximoRevisao()
            } else {
                const data = await res.json()
                msgEl.style.color = '#dc2626'
                msgEl.textContent = data.error ?? 'Erro ao salvar.'
            }
        } catch {
            msgEl.style.color = '#dc2626'
            msgEl.textContent = 'Erro ao conectar.'
        }
    })

    // Cancelar revisão
    const btnCancelar = document.getElementById('prod-btn-cancelar')
    const novoCancelar = btnCancelar.cloneNode(true)
    novoCancelar.textContent = 'Cancelar Revisão'
    btnCancelar.replaceWith(novoCancelar)
    novoCancelar.addEventListener('click', () => {
        modoRevisao = false
        filaRevisao = []
        document.getElementById('prod-form').style.display = 'none'
        const barra = document.getElementById('revisao-barra')
        if (barra) barra.remove()
    })

    form.scrollIntoView({ behavior: 'smooth' })
}




// ── REVISÃO POR MARCA ─────────────────────────────────
let _todosProdutosMarca = [] // cache para não rebuscar toda vez

function abrirRevisaoPorMarca() {
    const wrapper = document.getElementById('incompletos-wrapper')
    document.getElementById('prod-form').style.display = 'none'

    wrapper.innerHTML = `
        <p class="text-xs text-gray-400 mb-3">
            Digite a marca, veja os produtos encontrados e aplique em todos de uma vez.
        </p>
        <div class="flex gap-2 mb-5">
            <input id="input-marca-busca" type="text" placeholder="Ex: marlux, seara, sadia..."
                class="flex-1 border-2 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none"
                style="border-color:#16a34a;">
            <button id="btn-buscar-marca" class="px-5 py-2 text-white text-sm font-semibold rounded-lg" style="background:#16a34a;">
                Buscar
            </button>
            <button id="btn-voltar-incompletos" class="px-4 py-2 text-xs text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50">
                ← Voltar
            </button>
        </div>
        <div id="resultado-marca"></div>
    `

    document.getElementById('input-marca-busca').focus()

    // Usa onclick para evitar duplicação de listeners ao reutilizar a tela
    document.getElementById('btn-voltar-incompletos').onclick = verificarIncompletos
    document.getElementById('btn-buscar-marca').onclick = () => {
        const marca = document.getElementById('input-marca-busca').value.trim()
        if (marca) renderResultadoMarca(marca)
    }
    document.getElementById('input-marca-busca').onkeydown = (e) => {
        if (e.key === 'Enter') document.getElementById('btn-buscar-marca').click()
    }
}

async function carregarTodosProdutos() {
    if (_todosProdutosMarca.length > 0) return _todosProdutosMarca
    const res  = await fetch('http://localhost:3000/produtos', { headers: authHeaders() })
    const data = await res.json()
    if (Array.isArray(data)) _todosProdutosMarca = data
    return _todosProdutosMarca
}

async function renderResultadoMarca(marca) {
    const resultEl = document.getElementById('resultado-marca')
    resultEl.innerHTML = `<p class="text-sm text-gray-400">Buscando...</p>`

    try {
        const data    = await carregarTodosProdutos()
        const termo   = marca.trim().toUpperCase()
        const produtos = data.filter(p => p.descricao?.toUpperCase().includes(termo))

        if (!produtos.length) {
            resultEl.innerHTML = `<p class="text-sm text-gray-400">Nenhum produto com "<strong>${marca}</strong>" na descrição.</p>`
            return
        }

        const semMarca = produtos.filter(p => vazio(p.marca))
        const marcaDif = produtos.filter(p => !vazio(p.marca) && p.marca.toUpperCase() !== termo)
        const marcaOk  = produtos.filter(p => p.marca?.toUpperCase() === termo)

        // Monta HTML — sem nenhum event listener inline
        resultEl.innerHTML = `
            <div class="flex gap-3 mb-4 flex-wrap">
                <span class="px-3 py-1.5 rounded-full text-xs font-semibold" style="background:#fee2e2;color:#b91c1c;">Sem marca: ${semMarca.length}</span>
                <span class="px-3 py-1.5 rounded-full text-xs font-semibold" style="background:#fef3c7;color:#92400e;">Marca diferente: ${marcaDif.length}</span>
                <span class="px-3 py-1.5 rounded-full text-xs font-semibold" style="background:#dcfce7;color:#16a34a;">Já correto: ${marcaOk.length}</span>
                <span class="px-3 py-1.5 rounded-full text-xs font-semibold" style="background:#f3f4f6;color:#374151;">Total: ${produtos.length}</span>
            </div>

            <div class="flex items-end gap-3 mb-4 p-4 rounded-xl border-2" style="background:#f0fdf4; border-color:#16a34a;">
                <div class="flex flex-col gap-1 flex-1">
                    <label class="text-xs font-semibold text-green-700 uppercase tracking-wider">Marca a aplicar</label>
                    <input id="input-marca-aplicar" type="text" value="${termo}"
                        class="border-2 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none"
                        style="border-color:#16a34a; background:#fff;">
                </div>
                <div class="flex flex-col gap-2">
                    <button id="btn-aplicar-sem-marca" class="px-5 py-2 text-white text-sm font-semibold rounded-lg ${semMarca.length === 0 ? 'opacity-40 cursor-not-allowed' : ''}" style="background:#b51515;">
                        Aplicar nos ${semMarca.length} sem marca
                    </button>
                    <button id="btn-aplicar-todos" class="px-5 py-2 text-white text-sm font-semibold rounded-lg" style="background:#1a1a2e;">
                        Aplicar em todos os ${produtos.length}
                    </button>
                </div>
            </div>

            <p id="msg-aplicar" class="text-sm font-semibold min-h-[20px] mb-4"></p>

            <div class="border border-gray-100 rounded-lg overflow-hidden">
                <table class="w-full text-sm">
                    <thead><tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <th class="px-4 py-2 text-left font-semibold">Código</th>
                        <th class="px-4 py-2 text-left font-semibold">Descrição</th>
                        <th class="px-4 py-2 text-left font-semibold">Marca atual</th>
                    </tr></thead>
                    <tbody class="divide-y divide-gray-100">
                        ${produtos.slice(0, 200).map(p => {
                            const cor = vazio(p.marca) ? '#b91c1c' : p.marca.toUpperCase() === termo ? '#16a34a' : '#b45309'
                            const bg  = vazio(p.marca) ? '#fee2e2' : p.marca.toUpperCase() === termo ? '#dcfce7' : '#fef3c7'
                            return `<tr class="hover:bg-gray-50">
                                <td class="px-4 py-2 font-mono text-gray-500 text-xs">${p.codigo}</td>
                                <td class="px-4 py-2 text-gray-800">${p.descricao}</td>
                                <td class="px-4 py-2">
                                    <span class="px-2 py-0.5 rounded-full text-xs font-semibold" style="background:${bg};color:${cor};">
                                        ${vazio(p.marca) ? 'vazio' : p.marca}
                                    </span>
                                </td>
                            </tr>`
                        }).join('')}
                    </tbody>
                </table>
                ${produtos.length > 200 ? `<p class="text-xs text-gray-300 px-4 py-2">Mostrando 200 de ${produtos.length}</p>` : ''}
            </div>
        `

        // Usa onclick para garantir que não acumula listeners
        document.getElementById('btn-aplicar-sem-marca').onclick = semMarca.length > 0
            ? () => aplicarMarca(semMarca, marca)
            : null

        document.getElementById('btn-aplicar-todos').onclick = () => aplicarMarca(produtos, marca)

    } catch (e) {
        resultEl.innerHTML = `<p class="text-sm text-red-400">Erro ao conectar.</p>`
        console.error(e)
    }
}

async function aplicarMarca(lista, marcaOriginal) {
    const novaM = document.getElementById('input-marca-aplicar').value.trim().toUpperCase()
    const msgEl = document.getElementById('msg-aplicar')

    if (!novaM) { msgEl.style.color = '#dc2626'; msgEl.textContent = 'Preencha a marca.'; return }
    if (!confirm(`Aplicar a marca "${novaM}" em ${lista.length} produto(s)?`)) return

    // Desabilita botões durante o processo
    document.getElementById('btn-aplicar-sem-marca').onclick = null
    document.getElementById('btn-aplicar-todos').onclick     = null

    let ok = 0, erros = 0
    for (const p of lista) {
        try {
            const r = await fetch(`http://localhost:3000/produtos/${p.codigo}`, {
                method: 'PUT', headers: authHeaders(),
                body: JSON.stringify({
                    descricao: p.descricao, marca: novaM,
                    ean: p.ean || '', preco_venda: p.preco_venda || 0,
                    departamento: p.departamento || '',
                    descricao_departamento: p.descricao_departamento || '',
                    secao: p.secao || '', grupo: p.grupo || '',
                    quantidade_kg_l: p.quantidade_kg_l || 0,
                    descricao_kglt: p.descricao_kglt || ''
                })
            })
            if (r.ok) {
                // Atualiza cache local para evitar rebuscar tudo
                const idx = _todosProdutosMarca.findIndex(x => x.codigo === p.codigo)
                if (idx !== -1) _todosProdutosMarca[idx].marca = novaM
                ok++
            } else { erros++ }
        } catch { erros++ }

        msgEl.style.color = '#6b7280'
        msgEl.textContent = `Salvando... ${ok + erros} de ${lista.length}`
    }

    if (erros === 0) {
        msgEl.style.color = '#16a34a'
        msgEl.textContent = `✅ Marca "${novaM}" aplicada em ${ok} produto(s)!`
    } else {
        msgEl.style.color = '#b45309'
        msgEl.textContent = `⚠️ ${ok} salvos, ${erros} com erro.`
    }

    // Atualiza a tabela usando o cache já atualizado — sem nova requisição
    setTimeout(() => renderResultadoMarca(marcaOriginal), 800)
}

// ── CONFIGURAÇÕES ─────────────────────────────────────
async function carregarConfigPastaImagens() {
    try {
        const res  = await fetch('http://localhost:3000/configuracao/pasta_imagens', { headers: authHeaders() })
        const data = await res.json()
        const input = document.getElementById('cfg-pasta-imagens')
        if (input && res.ok) input.value = data.valor
    } catch {}
}

async function salvarConfigPastaImagens() {
    const input = document.getElementById('cfg-pasta-imagens')
    const msgEl = document.getElementById('cfg-pasta-msg')
    const valor = input?.value.trim()

    if (!valor) { msgEl.style.color = '#dc2626'; msgEl.textContent = 'Preencha o caminho da pasta.'; return }

    msgEl.style.color = '#6b7280'; msgEl.textContent = 'Salvando...'

    try {
        const res = await fetch('http://localhost:3000/configuracao/pasta_imagens', {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ valor })
        })
        if (res.ok) {
            msgEl.style.color = '#16a34a'
            msgEl.textContent = '✅ Pasta salva! A próxima busca de imagem já usará o novo caminho.'
            setTimeout(() => { if (msgEl) msgEl.textContent = '' }, 4000)
        } else {
            const data = await res.json()
            msgEl.style.color = '#dc2626'; msgEl.textContent = data.error ?? 'Erro ao salvar.'
        }
    } catch {
        msgEl.style.color = '#dc2626'; msgEl.textContent = 'Erro ao conectar com o servidor.'
    }
}

async function carregarConfigPastaProatos() {
    try {
        const res  = await fetch('http://localhost:3000/configuracao/pasta_pratos', { headers: authHeaders() })
        const data = await res.json()
        const input = document.getElementById('cfg-pasta-pratos')
        if (input && res.ok) input.value = data.valor
    } catch {}
}

async function salvarConfigPastaPratos() {
    const input = document.getElementById('cfg-pasta-pratos')
    const msgEl = document.getElementById('cfg-pratos-msg')
    const valor = input?.value.trim()
    if (!valor) { msgEl.style.color = '#dc2626'; msgEl.textContent = 'Preencha o caminho da pasta.'; return }
    msgEl.style.color = '#6b7280'; msgEl.textContent = 'Salvando...'
    try {
        const res = await fetch('http://localhost:3000/configuracao/pasta_pratos', {
            method: 'PUT', headers: authHeaders(), body: JSON.stringify({ valor })
        })
        if (res.ok) {
            msgEl.style.color = '#16a34a'
            msgEl.textContent = '✅ Pasta dos pratos salva!'
            setTimeout(() => { if (msgEl) msgEl.textContent = '' }, 4000)
        } else {
            const data = await res.json()
            msgEl.style.color = '#dc2626'; msgEl.textContent = data.error ?? 'Erro ao salvar.'
        }
    } catch { msgEl.style.color = '#dc2626'; msgEl.textContent = 'Erro ao conectar.' }
}

// ── GERENCIAR USUÁRIOS ───────────────────────────────
async function carregarListaUsuarios() {
    const lista = document.getElementById('lista-usuarios')
    if (!lista) return

    lista.innerHTML = `<p class="text-sm text-gray-400">Carregando...</p>`

    try {
        const res = await fetch('http://localhost:3000/usuarios', { headers: authHeaders() })
        const usuarios = await res.json()

        if (!Array.isArray(usuarios)) {
            lista.innerHTML = `<p class="text-sm text-red-400">Erro ao carregar.</p>`
            return
        }

        if (usuarios.length === 0) {
            lista.innerHTML = `<p class="text-sm text-gray-400">Nenhum usuário cadastrado.</p>`
            return
        }

        const usuarioLogado = getUsuario()

        lista.innerHTML = `
            <div class="border border-gray-100 rounded-lg overflow-hidden">
                <table class="w-full text-sm">
                    <thead><tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <th class="px-4 py-2 text-left font-semibold">Nome</th>
                        <th class="px-4 py-2 text-left font-semibold">Usuário</th>
                        <th class="px-4 py-2 text-left font-semibold">Cargo</th>
                        <th class="px-4 py-2 text-center font-semibold">Ações</th>
                    </tr></thead>
                    <tbody class="divide-y divide-gray-100">
                        ${usuarios.map(u => {
                            const badgeBg = u.cargo === 'administrador' ? '#fee2e2' : u.cargo === 'gerente' ? '#fef3c7' : '#f3f4f6'
                            const badgeColor = u.cargo === 'administrador' ? '#b91c1c' : u.cargo === 'gerente' ? '#92400e' : '#374151'
                            const isLogado = u.usuario === usuarioLogado
                            return `
                                <tr>
                                    <td class="px-4 py-3 text-gray-800 font-medium">${u.nome}</td>
                                    <td class="px-4 py-3 text-gray-500 font-mono text-xs">${u.usuario}</td>
                                    <td class="px-4 py-3">
                                        <select class="cargo-select text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer"
                                            data-id="${u.id}" data-cargo-atual="${u.cargo}"
                                            style="background:${badgeBg};color:${badgeColor};">
                                            <option value="atendente" ${u.cargo === 'atendente' ? 'selected' : ''}>Atendente</option>
                                            <option value="gerente" ${u.cargo === 'gerente' ? 'selected' : ''}>Gerente</option>
                                            <option value="administrador" ${u.cargo === 'administrador' ? 'selected' : ''}>Administrador</option>
                                        </select>
                                    </td>
                                    <td class="px-4 py-3 text-center">
                                        ${!isLogado ? `<button class="btn-excluir-usuario text-xs font-semibold text-white px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600" data-id="${u.id}" data-nome="${u.nome}">Excluir</button>` : '<span class="text-xs text-gray-400">(você)</span>'}
                                    </td>
                                </tr>
                            `
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `

        // Evento: mudar cargo
        lista.querySelectorAll('.cargo-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const id = e.target.dataset.id
                const novoCargo = e.target.value
                if (!confirm(`Alterar cargo para "${novoCargo}"?`)) {
                    e.target.value = e.target.dataset.cargoAtual
                    return
                }
                try {
                    const res = await fetch(`http://localhost:3000/usuarios/${id}/cargo`, {
                        method: 'PUT',
                        headers: authHeaders(),
                        body: JSON.stringify({ cargo: novoCargo })
                    })
                    if (res.ok) {
                        e.target.dataset.cargoAtual = novoCargo
                        const bg = novoCargo === 'administrador' ? '#fee2e2' : novoCargo === 'gerente' ? '#fef3c7' : '#f3f4f6'
                        const color = novoCargo === 'administrador' ? '#b91c1c' : novoCargo === 'gerente' ? '#92400e' : '#374151'
                        e.target.style.background = bg
                        e.target.style.color = color
                        alert('Cargo atualizado!')
                    } else {
                        const data = await res.json()
                        alert(data.error || 'Erro ao atualizar.')
                        e.target.value = e.target.dataset.cargoAtual
                    }
                } catch { alert('Erro ao conectar.'); e.target.value = e.target.dataset.cargoAtual }
            })
        })

        // Evento: excluir usuário
        lista.querySelectorAll('.btn-excluir-usuario').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id
                const nome = e.target.dataset.nome
                if (!confirm(`Excluir usuário "${nome}"? Esta ação não pode ser desfeita.`)) return
                try {
                    const res = await fetch(`http://localhost:3000/usuarios/${id}`, {
                        method: 'DELETE', headers: authHeaders()
                    })
                    if (res.ok) {
                        carregarListaUsuarios()
                    } else {
                        const data = await res.json()
                        alert(data.error || 'Erro ao excluir.')
                    }
                } catch { alert('Erro ao conectar.') }
            })
        })

    } catch {
        lista.innerHTML = `<p class="text-sm text-red-400">Erro ao conectar.</p>`
    }
}