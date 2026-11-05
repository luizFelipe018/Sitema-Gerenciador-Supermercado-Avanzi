let nvDados = []
let nvTodos = []
let nvAba = 'pendentes'
let nvSelecionados = new Set()

function nvSkeleton() {
    return `<tr><td colspan="8" class="p-8"><div class="flex flex-col gap-3 items-center">
        <div class="loading loading-spinner loading-md text-primary"></div>
        <span class="text-xs text-base-content/30">Carregando produtos...</span>
    </div></td></tr>`
}

async function carregarNovidades() {
    setActive('btn-novidades')
    setConteudo(`
        <div class="max-w-7xl mx-auto space-y-7">

            <div class="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 sm:gap-5">
                <div>
                    <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight page-title-glow">Novidades</h1>
                    <p class="text-xs sm:text-sm" style="color:var(--text-muted)">Produtos cadastrados a partir de 2026</p>
                </div>
                <div class="flex items-center gap-2 w-full sm:w-auto">
                    <div class="join w-full sm:w-auto">
                        <input type="text" id="nv-busca" placeholder="Buscar código, descrição ou EAN..."
                            class="input input-bordered input-xs sm:input-sm join-item w-full sm:w-44"
                            style="border-color:var(--border-color);background:var(--bg-input);color:var(--text-primary);">
                        <button id="nv-atualizar" class="btn btn-square btn-xs sm:btn-sm join-item" style="background:var(--glass);border:1px solid var(--border-color);color:var(--text-secondary)">
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                        </button>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5" id="nv-stats">
                <div class="dash-glass p-4 sm:p-5 card-accent-blue statistic-card">
                    <div class="flex items-center justify-between mb-2 sm:mb-3">
                        <span class="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-base-content/50">Total</span>
                        <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style="background:rgba(59,130,246,0.1);">
                            <svg width="14" height="14" fill="none" stroke="#3b82f6" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        </span>
                    </div>
                    <div class="text-xl sm:text-2xl font-extrabold tracking-tight" style="color:var(--text-primary)" id="nv-stat-total">—</div>
                </div>
                <div class="dash-glass p-4 sm:p-5 card-accent-yellow statistic-card">
                    <div class="flex items-center justify-between mb-2 sm:mb-3">
                        <span class="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-base-content/50">Pendentes</span>
                        <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style="background:rgba(234,179,8,0.1);">
                            <svg width="14" height="14" fill="none" stroke="#eab308" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </span>
                    </div>
                    <div class="text-xl sm:text-2xl font-extrabold tracking-tight text-warning" id="nv-stat-pendentes">—</div>
                </div>
                <div class="dash-glass p-4 sm:p-5 card-accent-green statistic-card">
                    <div class="flex items-center justify-between mb-2 sm:mb-3">
                        <span class="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-base-content/50">Classificados</span>
                        <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style="background:rgba(34,197,94,0.1);">
                            <svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </span>
                    </div>
                    <div class="text-xl sm:text-2xl font-extrabold tracking-tight text-success" id="nv-stat-classificados">—</div>
                </div>
                <div class="dash-glass p-4 sm:p-5 card-accent-red statistic-card">
                    <div class="flex items-center justify-between mb-2 sm:mb-3">
                        <span class="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-base-content/50">Sem preço</span>
                        <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style="background:rgba(239,68,68,0.1);">
                            <svg width="14" height="14" fill="none" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        </span>
                    </div>
                    <div class="text-xl sm:text-2xl font-extrabold tracking-tight text-error" id="nv-stat-sem-preco">—</div>
                </div>
            </div>

            <div class="dash-glass">
                <div class="px-3 sm:px-5 pt-4" style="border-bottom:1px solid var(--border-color);">
                    <div role="tablist" class="tabs tabs-bordered">
                        <button role="tab" class="tab tab-active gap-1 sm:gap-2 text-xs sm:text-sm" data-aba="pendentes" style="color:var(--text-primary);">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            Pendentes
                            <span id="nv-badge-pendentes" class="badge badge-warning badge-xs hidden"></span>
                        </button>
                        <button role="tab" class="tab gap-1 sm:gap-2 text-xs sm:text-sm" data-aba="todos" style="color:var(--text-secondary);">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            Todos
                        </button>
                    </div>
                </div>

                <div id="nv-pendentes-actions" class="hidden flex items-center gap-2 sm:gap-3 p-3 sm:p-4 flex-wrap" style="background:rgba(234,179,8,0.03);border-bottom:1px solid var(--border-color);">
                    <label class="flex items-center gap-1.5 text-xs sm:text-sm" style="color:var(--text-secondary)">
                        <input type="checkbox" id="nv-check-all" class="checkbox checkbox-xs sm:checkbox-sm">
                        <span><span id="nv-selecionados-count">0</span> selecionado(s)</span>
                    </label>
                    <div class="w-px h-4" style="background:var(--border-color);"></div>
                    <select id="nv-bulk-status" class="select select-bordered select-xs sm:select-sm text-xs" style="border-color:var(--border-color);background:var(--bg-input);color:var(--text-primary);max-width:130px;">
                        <option value="">Aplicar status...</option>
                        <option value="novidades">Fazer</option>
                        <option value="ja_tem">Já tem</option>
                        <option value="para_chegar">Esperando chegar</option>
                        <option value="nao_fazer">Não fazer</option>
                    </select>
                    <button id="nv-bulk-aplicar" class="btn btn-primary btn-xs sm:btn-sm glow-pulse">Aplicar</button>
                    <button id="nv-bulk-limpar" class="btn btn-ghost btn-xs sm:btn-sm" style="color:var(--text-secondary);">Limpar</button>
                </div>

                <div id="nv-todos-filtro" class="hidden px-3 sm:px-5 py-3" style="background:rgba(59,130,246,0.03);border-bottom:1px solid var(--border-color);">
                    <select id="nv-filtro-status" class="select select-bordered select-xs sm:select-sm text-xs" style="border-color:var(--border-color);background:var(--bg-input);color:var(--text-primary);">
                        <option value="">Todos os status</option>
                        <option value="novidades">Para fazer novidade</option>
                        <option value="ja_tem">Já feito novidade</option>
                        <option value="para_chegar">Esperando chegar</option>
                        <option value="nao_fazer">Não fazer</option>
                    </select>
                </div>

                <div class="overflow-x-auto">
                    <table class="table table-xs sm:table-sm w-full">
                        <thead>
                            <tr>
                                <th id="nv-th-check" class="hidden w-8 sm:w-10 text-center"><input type="checkbox" class="checkbox checkbox-xs sm:checkbox-sm"></th>
                                <th class="text-[10px] sm:text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted);">Código</th>
                                <th class="text-[10px] sm:text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted);">Descrição</th>
                                <th class="text-right text-[10px] sm:text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted);">Preço</th>
                                <th class="text-center text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden sm:table-cell" style="color:var(--text-muted);">Estoque</th>
                                <th class="text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style="color:var(--text-muted);">Depto</th>
                                <th class="text-center text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden lg:table-cell" style="color:var(--text-muted);">Cadastro</th>
                                <th class="text-center text-[10px] sm:text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted);">Status</th>
                            </tr>
                        </thead>
                        <tbody id="nv-tbody">
                            ${nvSkeleton()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <style>
            .statistic-card { transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease; }
            .statistic-card:hover { transform:translateY(-4px) scale(1.02); }
            #conteudo .table tbody tr, #conteudo .table tbody tr:hover { transition:none !important; }
            #conteudo .dash-glass:not(.statistic-card),
            #conteudo .dash-glass:not(.statistic-card):hover,
            #conteudo .dash-glass:not(.statistic-card)::before { transition:none !important; transform:none !important; animation:none !important; }
            #conteudo .glow-pulse { animation:none !important; }
        </style>
    `, 'Novidades')

    nvSelecionados.clear()
    document.getElementById('nv-atualizar').onclick = carregarNovidades
    document.getElementById('nv-busca').onkeydown = (e) => { if (e.key === 'Enter') carregarListaNovidades() }
    document.getElementById('nv-bulk-aplicar').onclick = aplicarBatchNovidades
    document.getElementById('nv-bulk-limpar').onclick = limparSelecaoNovidades
    document.getElementById('nv-check-all').onchange = alternarTodosNovidades

    document.querySelectorAll('[role="tablist"] .tab').forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll('[role="tablist"] .tab').forEach(t => t.classList.remove('tab-active'))
            tab.classList.add('tab-active')
            nvAba = tab.dataset.aba
            nvSelecionados.clear()
            document.getElementById('nv-pendentes-actions').classList.toggle('hidden', nvAba !== 'pendentes')
            document.getElementById('nv-todos-filtro').classList.toggle('hidden', nvAba !== 'todos')
            document.getElementById('nv-th-check').classList.toggle('hidden', nvAba !== 'pendentes')
            carregarListaNovidades()
        }
    })

    document.querySelector('[role="tablist"] .tab[data-aba="pendentes"]').click()
}

async function carregarListaNovidades() {
    const tbody = document.getElementById('nv-tbody')
    const busca = document.getElementById('nv-busca').value.trim()
    tbody.innerHTML = nvSkeleton()
    try {
        let url = API+'/novidades/sem-preco'
        const params = []
        if (busca) params.push('busca='+encodeURIComponent(busca))
        if (nvAba === 'pendentes') params.push('pendentes=true')
        if (params.length) url += '?' + params.join('&')
        const res = await fetch(url, { headers: authHeaders() })
        nvTodos = await res.json()
        aplicarFiltroNovidades()
    } catch {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8"><span class="text-error/80 text-sm">Erro ao conectar.</span></td></tr>'
    }
}

function atualizarStats() {
    const total = nvTodos.length
    const pendentes = nvTodos.filter(p => !p.novidade_status).length
    const classificados = total - pendentes
    const semPreco = nvTodos.filter(p => !p.preco_venda || parseFloat(p.preco_venda) === 0).length
    document.getElementById('nv-stat-total').textContent = total
    document.getElementById('nv-stat-pendentes').textContent = pendentes
    document.getElementById('nv-stat-classificados').textContent = classificados
    document.getElementById('nv-stat-sem-preco').textContent = semPreco
    const badge = document.getElementById('nv-badge-pendentes')
    if (pendentes > 0) { badge.textContent = pendentes; badge.classList.remove('hidden') }
    else badge.classList.add('hidden')
}

function aplicarFiltroNovidades() {
    atualizarStats()
    if (nvAba === 'pendentes') {
        nvDados = nvTodos
        renderTabelaPendentes()
    } else {
        const filtro = document.getElementById('nv-filtro-status').value
        nvDados = filtro ? nvTodos.filter(p => (p.novidade_status || '') === filtro) : nvTodos
        renderTabelaTodos()
    }
}

function renderTabelaPendentes() {
    const tbody = document.getElementById('nv-tbody')
    if (!nvDados.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-12"><div class="flex flex-col items-center gap-3"><span class="text-5xl">📦</span><span class="text-sm font-medium" style="color:var(--text-muted)">Nenhum produto pendente</span><span class="text-xs" style="color:var(--text-muted);opacity:0.5">Todos os produtos foram classificados</span></div></td></tr>'
        return
    }
    tbody.innerHTML = nvDados.map((p, i) => {
        const id = p.ean || p.codigo
        const checked = nvSelecionados.has(id) ? 'checked' : ''
        const semPreco = !p.preco_venda || parseFloat(p.preco_venda) === 0
        return `<tr>
            <td class="text-center"><input type="checkbox" class="checkbox checkbox-xs sm:checkbox-sm nv-check-item" data-id="${id}" ${checked}></td>
            <td class="text-[11px] sm:text-xs whitespace-nowrap font-mono" style="color:var(--text-muted)">${p.codigo || '—'}</td>
            <td class="font-medium text-xs sm:text-sm" style="color:var(--text-primary)"><span class="line-clamp-2">${p.descricao || '—'}</span></td>
            <td class="text-right font-semibold text-xs sm:text-sm whitespace-nowrap ${semPreco ? 'text-base-content/20' : 'text-success'}">${semPreco ? '0,00' : 'R$ '+parseFloat(p.preco_venda).toFixed(2).replace('.',',')}</td>
            <td class="text-center text-[11px] sm:text-xs hidden sm:table-cell" style="color:var(--text-muted)">${p.estoque_atual ? parseFloat(p.estoque_atual).toFixed(3).replace('.',',') : '<span class="text-base-content/20">—</span>'}</td>
            <td class="text-[11px] sm:text-xs hidden md:table-cell" style="color:var(--text-secondary)">${p.descricao_departamento ? p.descricao_departamento.substring(0,22) : ''}</td>
            <td class="text-center text-[11px] sm:text-xs whitespace-nowrap hidden lg:table-cell" style="color:var(--text-muted)">${p.data_cadastro ? new Date(p.data_cadastro).toLocaleDateString('pt-BR') : '—'}</td>
            <td class="text-center"><span class="badge badge-ghost badge-xs" style="background:rgba(234,179,8,0.1);color:#eab308;border:1px solid rgba(234,179,8,0.2);">Pendente</span></td>
        </tr>`
    }).join('')

    tbody.querySelectorAll('.nv-check-item').forEach(cb => {
        cb.onchange = () => {
            if (cb.checked) nvSelecionados.add(cb.dataset.id)
            else nvSelecionados.delete(cb.dataset.id)
            atualizarContadorSelecionados()
        }
    })
    atualizarContadorSelecionados()
}

function renderTabelaTodos() {
    const tbody = document.getElementById('nv-tbody')
    if (!nvDados.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-12"><div class="flex flex-col items-center gap-3"><span class="text-5xl">🔍</span><span class="text-sm font-medium" style="color:var(--text-muted)">Nenhum produto encontrado</span><span class="text-xs" style="color:var(--text-muted);opacity:0.5">Tente alterar os filtros ou busca</span></div></td></tr>'
        return
    }
    tbody.innerHTML = nvDados.map((p, i) => {
        const semPreco = !p.preco_venda || parseFloat(p.preco_venda) === 0
        const semMovimento = !semPreco && (!p.estoque_atual || parseFloat(p.estoque_atual) === 0) && (!p.qtde_vendida_mes || parseFloat(p.qtde_vendida_mes) === 0)
        const rowBg = semPreco ? 'rgba(239,68,68,0.04)' : semMovimento ? 'rgba(234,179,8,0.04)' : ''
        const precoCor = semPreco ? 'text-base-content/20' : 'text-success'
        const badge = semPreco
            ? '<span class="badge badge-xs gap-1" style="background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.2);"><span class="w-1.5 h-1.5 rounded-full bg-current"></span>Sem preço</span>'
            : semMovimento
                ? '<span class="badge badge-xs gap-1" style="background:rgba(234,179,8,0.1);color:#eab308;border:1px solid rgba(234,179,8,0.2);"><span class="w-1.5 h-1.5 rounded-full bg-current"></span>Sem movimento</span>'
                : '<span class="badge badge-xs gap-1" style="background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.2);"><span class="w-1.5 h-1.5 rounded-full bg-current"></span>Ativo</span>'
        return `<tr style="background:${rowBg};">
            <td class="hidden"></td>
            <td class="text-[11px] sm:text-xs whitespace-nowrap font-mono" style="color:var(--text-muted)">${p.codigo || '—'}</td>
            <td class="font-medium text-xs sm:text-sm" style="color:var(--text-primary)"><span class="line-clamp-2">${p.descricao || '—'}</span></td>
            <td class="text-right font-semibold text-xs sm:text-sm whitespace-nowrap ${precoCor}">${semPreco ? '0,00' : 'R$ '+parseFloat(p.preco_venda).toFixed(2).replace('.',',')}</td>
            <td class="text-center text-[11px] sm:text-xs hidden sm:table-cell" style="color:var(--text-muted)">${p.estoque_atual ? parseFloat(p.estoque_atual).toFixed(3).replace('.',',') : '<span class="text-base-content/20">—</span>'}</td>
            <td class="text-[11px] sm:text-xs hidden md:table-cell" style="color:var(--text-secondary)">${p.descricao_departamento ? p.descricao_departamento.substring(0,22) : ''}</td>
            <td class="text-center text-[11px] sm:text-xs whitespace-nowrap hidden lg:table-cell" style="color:var(--text-muted)">${p.data_cadastro ? new Date(p.data_cadastro).toLocaleDateString('pt-BR') : '—'}</td>
            <td class="text-center">
                <div class="flex gap-0.5 sm:gap-1 justify-center flex-wrap nv-status-group" data-codigo="${p.codigo}" data-ean="${p.ean || ''}" data-descricao="${(p.descricao || '').replace(/"/g, '&quot;')}" data-novidade-id="${p.novidade_id || ''}">
                    ${botoesStatus(p)}
                </div>
            </td>
        </tr>`
    }).join('')

    tbody.querySelectorAll('.nv-status-group').forEach(grupo => {
        const codigo = grupo.dataset.codigo
        const ean = grupo.dataset.ean
        const descricao = grupo.dataset.descricao
        const novidadeId = grupo.dataset.novidadeId
        grupo.querySelectorAll('.nv-btn-status').forEach(btn => {
            btn.onclick = async () => {
                const status = btn.dataset.status
                grupo.querySelectorAll('.nv-btn-status').forEach(b => { b.classList.remove('btn-active'); b.style.opacity = '0.5' })
                btn.classList.add('btn-active'); btn.style.opacity = '1'
                try {
                    if (novidadeId) {
                        await fetch(API+'/novidades/'+novidadeId, {
                            method: 'PUT',
                            headers: authHeaders(),
                            body: JSON.stringify({ descricao, ean: ean || codigo, preco: 0, status })
                        })
                    } else {
                        await fetch(API+'/novidades', {
                            method: 'POST',
                            headers: authHeaders(),
                            body: JSON.stringify({ descricao, ean: ean || codigo, preco: 0, status })
                        })
                    }
                    await carregarListaNovidades()
                } catch { alert('Erro ao salvar status.') }
            }
        })
    })
}

function botoesStatus(p) {
    const atual = p.novidade_status || ''
    const botoes = [
        { value: 'novidades', label: 'Fazer', cor: 'btn-warning' },
        { value: 'ja_tem', label: 'Já tem', cor: 'btn-success' },
        { value: 'para_chegar', label: 'Esperando', cor: 'btn-info' },
        { value: 'nao_fazer', label: 'Não fazer', cor: 'btn-ghost' }
    ]
    return botoes.map(b => {
        const ativo = atual === b.value
        const classe = ativo ? b.cor : (b.cor === 'btn-ghost' ? '' : b.cor + ' btn-outline')
        return `<button class="nv-btn-status btn btn-xs sm:btn-xs ${classe} gap-0.5 sm:gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2"
            data-status="${b.value}"
            style="opacity:${ativo ? '1' : '0.55'};">
            ${b.label}
        </button>`
    }).join('')
}

function atualizarContadorSelecionados() {
    const el = document.getElementById('nv-selecionados-count')
    el.textContent = nvSelecionados.size
    document.getElementById('nv-check-all').checked = nvSelecionados.size === nvDados.length && nvDados.length > 0
}

function alternarTodosNovidades() {
    const checked = document.getElementById('nv-check-all').checked
    document.querySelectorAll('.nv-check-item').forEach(cb => {
        cb.checked = checked
        if (checked) nvSelecionados.add(cb.dataset.id)
        else nvSelecionados.delete(cb.dataset.id)
    })
    atualizarContadorSelecionados()
}

function limparSelecaoNovidades() {
    nvSelecionados.clear()
    document.querySelectorAll('.nv-check-item').forEach(cb => { cb.checked = false })
    document.getElementById('nv-check-all').checked = false
    atualizarContadorSelecionados()
}

async function aplicarBatchNovidades() {
    const status = document.getElementById('nv-bulk-status').value
    if (!status) return alert('Selecione um status para aplicar.')
    if (!nvSelecionados.size) return alert('Selecione pelo menos um produto.')
    const produtos = nvDados.filter(p => nvSelecionados.has(p.ean || p.codigo))
    let ok = 0
    for (const p of produtos) {
        try {
            await fetch(API+'/novidades', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ descricao: p.descricao, ean: p.ean || p.codigo, preco: p.preco_venda || 0, status })
            })
            ok++
        } catch {}
    }
    alert(`${ok} de ${produtos.length} produto(s) classificados como "${status}".`)
    nvSelecionados.clear()
    await carregarListaNovidades()
}
