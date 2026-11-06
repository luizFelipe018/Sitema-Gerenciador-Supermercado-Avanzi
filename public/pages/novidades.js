let nvDados = []
let nvTodos = []
let nvAba = 'pendentes'
let nvSelecionados = new Set()

function nvSkeleton() {
    return `<tr><td colspan="8" style="text-align:center; padding:60px 20px; color:var(--text-3); font-size:13px;">Carregando produtos...</td></tr>`
}

async function carregarNovidades() {
    setActive('btn-novidades')
    setConteudo(`
        <div class="ds-page-head fade-in">
            <div>
                <div class="ds-page-eyebrow">Catálogo</div>
                <h1 class="ds-page-title">Novidades</h1>
                <p class="ds-page-sub">Produtos cadastrados a partir de 2026</p>
            </div>
            <div class="frc10" style="width:auto; max-width:380px; width:100%;">
                <input type="text" id="nv-busca" class="ds-input" placeholder="Buscar código, descrição ou EAN..." style="height:36px;">
                <button id="nv-atualizar" class="ds-btn ds-btn-sm ds-btn-icon" title="Atualizar" type="button">
                    <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                </button>
            </div>
        </div>

        <div class="ds-grid ds-grid-4" id="nv-stats" style="margin-bottom:28px">
            <div class="ds-stat">
                <span class="ds-stat-label">Total</span>
                <div class="ds-stat-value" id="nv-stat-total">—</div>
            </div>
            <div class="ds-stat">
                <span class="ds-stat-label">Pendentes</span>
                <div class="ds-stat-value" id="nv-stat-pendentes" style="color:var(--warn)">—</div>
            </div>
            <div class="ds-stat">
                <span class="ds-stat-label">Classificados</span>
                <div class="ds-stat-value" id="nv-stat-classificados" style="color:var(--ok)">—</div>
            </div>
            <div class="ds-stat">
                <span class="ds-stat-label">Sem preço</span>
                <div class="ds-stat-value" id="nv-stat-sem-preco" style="color:var(--danger)">—</div>
            </div>
        </div>

        <div class="ds-card" style="overflow:hidden">
            <div class="ds-card-head" style="justify-content:flex-start; gap:24px;">
                <div class="ds-segmented" role="tablist" style="--x:0">
                    <button role="tab" class="is-active" data-aba="pendentes" type="button">
                        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Pendentes
                        <span id="nv-badge-pendentes" class="ds-badge" style="background:var(--warn-soft); color:var(--warn); margin-left:2px" hidden></span>
                    </button>
                    <button role="tab" data-aba="todos" type="button">
                        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        Todos
                    </button>
                </div>
            </div>

            <div id="nv-pendentes-actions" class="hidden" style="display:none; padding:12px 20px; gap:12px; align-items:center; border-bottom:1px solid var(--border); flex-wrap:wrap; background:rgba(245,158,11,0.03);">
                <label class="flex items-center gap-2" style="color:var(--text-2); font-size:12.5px; cursor:pointer;">
                    <input type="checkbox" id="nv-check-all" class="ds-switch-input" style="width:16px; height:16px; cursor:pointer;">
                    <span><b id="nv-selecionados-count" style="color:var(--text-1)">0</b> selecionado(s)</span>
                </label>
                <div style="width:1px; height:18px; background:var(--border);"></div>
                <select id="nv-bulk-status" class="ds-input" style="height:34px; width:auto; min-width:150px; font-size:12.5px;">
                    <option value="">Aplicar status...</option>
                    <option value="novidades">Fazer</option>
                    <option value="ja_tem">Já tem</option>
                    <option value="para_chegar">Esperando chegar</option>
                    <option value="nao_fazer">Não fazer</option>
                </select>
                <button id="nv-bulk-aplicar" class="ds-btn ds-btn-sm ds-btn-primary" type="button">Aplicar</button>
                <button id="nv-bulk-limpar" class="ds-btn ds-btn-sm" type="button">Limpar</button>
            </div>

            <div id="nv-todos-filtro" style="display:none; padding:12px 20px; border-bottom:1px solid var(--border); background:var(--info-soft);">
                <select id="nv-filtro-status" class="ds-input" style="height:34px; width:auto; min-width:190px; font-size:12.5px;">
                    <option value="">Todos os status</option>
                    <option value="novidades">Para fazer novidade</option>
                    <option value="ja_tem">Já feito novidade</option>
                    <option value="para_chegar">Esperando chegar</option>
                    <option value="nao_fazer">Não fazer</option>
                </select>
            </div>

            <div style="overflow-x:auto">
                <table class="ds-table-prod">
                    <thead>
                        <tr>
                            <th id="nv-th-check" class="hidden" style="width:48px; text-align:center;"><input type="checkbox" id="nv-th-check-all" style="width:16px; height:16px; cursor:pointer;"></th>
                            <th style="width:110px;">Código</th>
                            <th>Descrição</th>
                            <th style="width:130px; text-align:right;">Preço</th>
                            <th class="hidden sm:table-cell" style="width:110px; text-align:center;">Estoque</th>
                            <th class="hidden md:table-cell" style="width:160px;">Depto</th>
                            <th class="hidden lg:table-cell" style="width:120px; text-align:center;">Cadastro</th>
                            <th style="width:130px; text-align:center;">Status</th>
                        </tr>
                    </thead>
                    <tbody id="nv-tbody">
                        ${nvSkeleton()}
                    </tbody>
                </table>
            </div>
        </div>
    `, 'Novidades')

    nvSelecionados.clear()
    document.getElementById('nv-atualizar').onclick = carregarNovidades
    document.getElementById('nv-busca').onkeydown = (e) => { if (e.key === 'Enter') carregarListaNovidades() }
    document.getElementById('nv-bulk-aplicar').onclick = aplicarBatchNovidades
    document.getElementById('nv-bulk-limpar').onclick = limparSelecaoNovidades
    document.getElementById('nv-check-all').onchange = alternarTodosNovidades
    document.getElementById('nv-th-check-all').onchange = () => {
        const cb = document.getElementById('nv-check-all')
        cb.checked = document.getElementById('nv-th-check-all').checked
        alternarTodosNovidades()
    }

    const actions = document.getElementById('nv-pendentes-actions')
    function alternarAba(aba) {
        nvAba = aba
        nvSelecionados.clear()
        actions.style.display = aba === 'pendentes' ? 'flex' : 'none'
        document.getElementById('nv-todos-filtro').style.display = aba === 'todos' ? 'block' : 'none'
        document.getElementById('nv-th-check').classList.toggle('hidden', aba !== 'pendentes')
        carregarListaNovidades()
    }

    document.querySelectorAll('[role="tablist"] [role="tab"]').forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll('[role="tablist"] [role="tab"]').forEach(t => t.classList.remove('is-active'))
            tab.classList.add('is-active')
            alternarAba(tab.dataset.aba)
        }
    })

    document.querySelector('[role="tablist"] [data-aba="pendentes"]').click()
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
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px 20px; color:var(--danger); font-size:13px;">Erro ao conectar.</td></tr>'
    }
}

function atualizarStats() {
    const total = nvTodos.length
    const pendentes = nvTodos.filter(p => !p.novidade_status).length
    const classificados = total - pendentes
    const semPreco = nvTodos.filter(p => !p.preco_venda || parseFloat(p.preco_venda) === 0).length
    document.getElementById('nv-stat-total').textContent = total.toLocaleString('pt-BR')
    document.getElementById('nv-stat-pendentes').textContent = pendentes.toLocaleString('pt-BR')
    document.getElementById('nv-stat-classificados').textContent = classificados.toLocaleString('pt-BR')
    document.getElementById('nv-stat-sem-preco').textContent = semPreco.toLocaleString('pt-BR')
    const badge = document.getElementById('nv-badge-pendentes')
    if (pendentes > 0) { badge.textContent = pendentes; badge.hidden = false }
    else badge.hidden = true
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
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:60px 20px; color:var(--text-3); font-size:13px;">Nenhum produto pendente — todos foram classificados.</td></tr>'
        return
    }
    tbody.innerHTML = nvDados.map((p, i) => {
        const id = p.ean || p.codigo
        const checked = nvSelecionados.has(id) ? 'checked' : ''
        const semPreco = !p.preco_venda || parseFloat(p.preco_venda) === 0
        return `<tr>
            <td class="nv-th-check text-center"><input type="checkbox" class="nv-check-item" data-id="${id}" ${checked} style="width:16px; height:16px; cursor:pointer;"></td>
            <td class="mono" style="color:var(--text-3)">${p.codigo || '—'}</td>
            <td class="strong">${p.descricao || '—'}</td>
            <td class="preco" style="color:${semPreco ? 'var(--text-3)' : 'var(--ok)'}">${semPreco ? '0,00' : 'R$ '+parseFloat(p.preco_venda).toFixed(2).replace('.',',')}</td>
            <td class="text-center muted hidden sm:table-cell">${p.estoque_atual ? parseFloat(p.estoque_atual).toFixed(3).replace('.',',') : '—'}</td>
            <td class="muted hidden md:table-cell">${p.descricao_departamento ? p.descricao_departamento.substring(0,22) : ''}</td>
            <td class="text-center muted hidden lg:table-cell" style="white-space:nowrap">${p.data_cadastro ? new Date(p.data_cadastro).toLocaleDateString('pt-BR') : '—'}</td>
            <td class="text-center"><span class="ds-badge" style="background:var(--warn-soft); color:var(--warn);">Pendente</span></td>
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
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:60px 20px; color:var(--text-3); font-size:13px;">Nenhum produto encontrado. Tente alterar os filtros ou a busca.</td></tr>'
        return
    }
    tbody.innerHTML = nvDados.map((p, i) => {
        const semPreco = !p.preco_venda || parseFloat(p.preco_venda) === 0
        const semMovimento = !semPreco && (!p.estoque_atual || parseFloat(p.estoque_atual) === 0) && (!p.qtde_vendida_mes || parseFloat(p.qtde_vendida_mes) === 0)
        const rowBg = semPreco ? 'rgba(239,68,68,0.05)' : semMovimento ? 'rgba(245,158,11,0.05)' : ''
        const chip = semPreco
            ? '<span class="ds-badge" style="background:var(--danger-soft); color:var(--danger);">Sem preço</span>'
            : semMovimento
                ? '<span class="ds-badge" style="background:var(--warn-soft); color:var(--warn);">Sem movimento</span>'
                : '<span class="ds-badge" style="background:var(--ok-soft); color:var(--ok);">Ativo</span>'
        return `<tr style="background:${rowBg};">
            <td class="hidden"></td>
            <td class="mono" style="color:var(--text-3)">${p.codigo || '—'}</td>
            <td class="strong">${p.descricao || '—'}</td>
            <td class="preco" style="color:${semPreco ? 'var(--text-3)' : 'var(--ok)'}">${semPreco ? '0,00' : 'R$ '+parseFloat(p.preco_venda).toFixed(2).replace('.',',')}</td>
            <td class="text-center muted hidden sm:table-cell">${p.estoque_atual ? parseFloat(p.estoque_atual).toFixed(3).replace('.',',') : '—'}</td>
            <td class="muted hidden md:table-cell">${p.descricao_departamento ? p.descricao_departamento.substring(0,22) : ''}</td>
            <td class="text-center muted hidden lg:table-cell" style="white-space:nowrap">${p.data_cadastro ? new Date(p.data_cadastro).toLocaleDateString('pt-BR') : '—'}</td>
            <td class="text-center">
                <div class="flex gap-1 justify-center flex-wrap nv-status-group" data-codigo="${p.codigo}" data-ean="${p.ean || ''}" data-descricao="${(p.descricao || '').replace(/"/g, '&quot;')}" data-novidade-id="${p.novidade_id || ''}">
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
                grupo.querySelectorAll('.nv-btn-status').forEach(b => { b.classList.remove('ds-btn-primary'); b.style.opacity = '0.55' })
                btn.classList.add('ds-btn-primary'); btn.style.opacity = '1'
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
        { value: 'novidades', label: 'Fazer' },
        { value: 'ja_tem', label: 'Já tem' },
        { value: 'para_chegar', label: 'Esperando' },
        { value: 'nao_fazer', label: 'Não fazer' }
    ]
    return botoes.map(b => {
        const ativo = atual === b.value
        const classe = ativo ? ' ds-btn-primary' : ''
        return `<button class="nv-btn-status ds-btn ds-btn-sm${classe}"
            data-status="${b.value}"
            style="opacity:${ativo ? '1' : '0.55'}; padding:0 10px;">
            ${b.label}
        </button>`
    }).join('')
}

function atualizarContadorSelecionados() {
    const el = document.getElementById('nv-selecionados-count')
    if (el) el.textContent = nvSelecionados.size
    const ca = document.getElementById('nv-check-all')
    if (ca) ca.checked = nvSelecionados.size === nvDados.length && nvDados.length > 0
    const th = document.getElementById('nv-th-check-all')
    if (th) th.checked = nvSelecionados.size === nvDados.length && nvDados.length > 0
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
    const th = document.getElementById('nv-th-check-all')
    if (th) th.checked = false
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
