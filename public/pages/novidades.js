let nvDados = []
let nvTodos = []
let nvAba = 'pendentes'
let nvSelecionados = new Set()

async function carregarNovidades() {
    setActive('btn-novidades')
    setConteudo(`
        <div class="dash-glass dash-animate" style="padding:20px; margin-bottom:20px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
                <h2 style="font-size:18px; font-weight:700; color:#fafafa;">Produtos Cadastrados (2026+)</h2>
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                    <input type="text" id="nv-busca" placeholder="Buscar código, descrição ou EAN..."
                        style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px 12px; font-size:12px; color:#fafafa; outline:none; width:180px; transition:all 0.3s;"
                        onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                        onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                    <span id="nv-contador" style="font-size:12px; color:rgba(255,255,255,0.3); white-space:nowrap;"></span>
                    <button id="nv-atualizar" style="padding:8px 14px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:12px; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.04); display:flex; align-items:center; gap:6px;">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                        Atualizar
                    </button>
                </div>
            </div>

            <div style="display:flex; gap:0; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.08);">
                <button class="nv-tab" data-aba="pendentes" style="padding:10px 20px; font-size:13px; font-weight:600; cursor:pointer; background:none; border:none; color:rgba(255,255,255,0.4); border-bottom:2px solid transparent; transition:all 0.2s;">
                    Pendentes
                </button>
                <button class="nv-tab" data-aba="todos" style="padding:10px 20px; font-size:13px; font-weight:600; cursor:pointer; background:none; border:none; color:rgba(255,255,255,0.4); border-bottom:2px solid transparent; transition:all 0.2s;">
                    Todos
                </button>
            </div>

            <div id="nv-pendentes-actions" style="display:none; align-items:center; gap:10px; margin-bottom:12px; flex-wrap:wrap;">
                <span style="font-size:12px; color:rgba(255,255,255,0.5);"><span id="nv-selecionados-count">0</span> selecionado(s)</span>
                <select id="nv-bulk-status" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px 12px; font-size:12px; color:#fafafa; outline:none;">
                    <option value="">Aplicar status...</option>
                    <option value="novidades">Fazer</option>
                    <option value="ja_tem">Já tem</option>
                    <option value="para_chegar">Esperando chegar</option>
                    <option value="nao_fazer">Não fazer</option>
                </select>
                <button id="nv-bulk-aplicar" style="padding:8px 14px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:12px; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.04);">Aplicar</button>
                <button id="nv-bulk-limpar" style="padding:8px 14px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:12px; color:rgba(255,255,255,0.4); cursor:pointer; background:transparent;">Limpar seleção</button>
            </div>

            <div id="nv-todos-filtro" style="display:none; margin-bottom:12px;">
                <select id="nv-filtro-status" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px 12px; font-size:12px; color:#fafafa; outline:none; max-width:200px;">
                    <option value="">Todos</option>
                    <option value="novidades">Para fazer novidade</option>
                    <option value="ja_tem">Já feito novidade</option>
                    <option value="para_chegar">Esperando chegar</option>
                    <option value="nao_fazer">Não fazer</option>
                </select>
            </div>

            <div style="overflow-x:auto; border-radius:12px; border:1px solid rgba(255,255,255,0.06);">
                <table class="table-modern" style="width:100%; font-size:13px; min-width:750px;">
                    <thead>
                        <tr>
                            <th id="nv-th-check" style="display:none; padding:10px 12px; text-align:center; width:40px;"><input type="checkbox" id="nv-check-all" style="cursor:pointer;"></th>
                            <th style="padding:10px 12px; text-align:left; white-space:nowrap;">Código</th>
                            <th style="padding:10px 12px; text-align:left;">Descrição</th>
                            <th style="padding:10px 12px; text-align:right; white-space:nowrap;">Preço</th>
                            <th style="padding:10px 12px; text-align:center; white-space:nowrap;">Estoque</th>
                            <th style="padding:10px 12px; text-align:left; white-space:nowrap;">Depto</th>
                            <th style="padding:10px 12px; text-align:center; white-space:nowrap;">Cadastro</th>
                            <th style="padding:10px 12px; text-align:center; white-space:nowrap;">Status</th>
                        </tr>
                    </thead>
                    <tbody id="nv-tbody">
                        <tr><td colspan="8" style="text-align:center; padding:30px; color:rgba(255,255,255,0.2);">Carregando...</td></tr>
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

    document.querySelectorAll('.nv-tab').forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll('.nv-tab').forEach(t => { t.style.color = 'rgba(255,255,255,0.4)'; t.style.borderColor = 'transparent' })
            tab.style.color = '#fafafa'
            tab.style.borderColor = '#b51515'
            nvAba = tab.dataset.aba
            nvSelecionados.clear()
            document.getElementById('nv-pendentes-actions').style.display = nvAba === 'pendentes' ? 'flex' : 'none'
            document.getElementById('nv-todos-filtro').style.display = nvAba === 'todos' ? 'block' : 'none'
            document.getElementById('nv-th-check').style.display = nvAba === 'pendentes' ? 'table-cell' : 'none'
            carregarListaNovidades()
        }
    })

    // Activate "Pendentes" tab by default
    document.querySelector('.nv-tab[data-aba="pendentes"]').click()
}

async function carregarListaNovidades() {
    const tbody = document.getElementById('nv-tbody')
    const busca = document.getElementById('nv-busca').value.trim()
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:rgba(255,255,255,0.2);">Carregando...</td></tr>'
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
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:#ef4444;">Erro ao conectar.</td></tr>'
    }
}

function aplicarFiltroNovidades() {
    const tbody = document.getElementById('nv-tbody')
    const contador = document.getElementById('nv-contador')

    if (nvAba === 'pendentes') {
        nvDados = nvTodos
        contador.textContent = `${nvDados.length} pendente(s)`
        renderTabelaPendentes()
    } else {
        const filtro = document.getElementById('nv-filtro-status').value
        nvDados = filtro ? nvTodos.filter(p => (p.novidade_status || '') === filtro) : nvTodos
        contador.textContent = `${nvDados.length} de ${nvTodos.length} produto(s)`
        renderTabelaTodos()
    }
}

function renderTabelaPendentes() {
    const tbody = document.getElementById('nv-tbody')
    if (!nvDados.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:rgba(255,255,255,0.2);">Nenhum produto pendente.</td></tr>'
        return
    }
    tbody.innerHTML = nvDados.map(p => {
        const id = p.ean || p.codigo
        const checked = nvSelecionados.has(id) ? 'checked' : ''
        return `<tr style="border-bottom:1px solid rgba(255,255,255,0.04); transition:background 0.2s;">
            <td style="padding:10px 12px; text-align:center;"><input type="checkbox" class="nv-check-item" data-id="${id}" ${checked} style="cursor:pointer;"></td>
            <td style="padding:10px 12px; color:rgba(255,255,255,0.4); font-size:12px; white-space:nowrap;">${p.codigo || ''}</td>
            <td style="padding:10px 12px; color:#fafafa; font-weight:500; min-width:140px;">${p.descricao || ''}</td>
            <td style="padding:10px 12px; text-align:right; font-weight:600; color:${!p.preco_venda || parseFloat(p.preco_venda) === 0 ? 'rgba(255,255,255,0.25)' : '#22c55e'}; white-space:nowrap;">${!p.preco_venda || parseFloat(p.preco_venda) === 0 ? '0,00' : 'R$ '+parseFloat(p.preco_venda).toFixed(2).replace('.',',')}</td>
            <td style="padding:10px 12px; text-align:center; color:rgba(255,255,255,0.4); font-size:12px;">${p.estoque_atual ? parseFloat(p.estoque_atual).toFixed(3).replace('.',',') : '-'}</td>
            <td style="padding:10px 12px; color:rgba(255,255,255,0.5); font-size:11px;">${p.descricao_departamento ? p.descricao_departamento.substring(0,20) : ''}</td>
            <td style="padding:10px 12px; text-align:center; color:rgba(255,255,255,0.4); font-size:11px; white-space:nowrap;">${p.data_cadastro ? new Date(p.data_cadastro).toLocaleDateString('pt-BR') : ''}</td>
            <td style="padding:10px 12px; text-align:center; color:rgba(255,255,255,0.2); font-size:11px;">—</td>
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
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:rgba(255,255,255,0.2);">Nenhum produto encontrado.</td></tr>'
        return
    }
    tbody.innerHTML = nvDados.map(p => {
        const semPreco = !p.preco_venda || parseFloat(p.preco_venda) === 0
        const semMovimento = !semPreco && (!p.estoque_atual || parseFloat(p.estoque_atual) === 0) && (!p.qtde_vendida_mes || parseFloat(p.qtde_vendida_mes) === 0)
        let bg = ''
        let corPreco = '#22c55e'
        if (semPreco) { bg = 'background:rgba(239,68,68,0.08);'; corPreco = 'rgba(255,255,255,0.25)' }
        else if (semMovimento) bg = 'background:rgba(234,179,8,0.08);'
        return `<tr style="border-bottom:1px solid rgba(255,255,255,0.04); ${bg}transition:background 0.2s;">
            <td style="display:none;"></td>
            <td style="padding:10px 12px; color:rgba(255,255,255,0.4); font-size:12px; white-space:nowrap;">${p.codigo || ''}</td>
            <td style="padding:10px 12px; color:#fafafa; font-weight:500; min-width:140px;">${p.descricao || ''}</td>
            <td style="padding:10px 12px; text-align:right; font-weight:600; color:${corPreco}; white-space:nowrap;">${semPreco ? '0,00' : 'R$ '+parseFloat(p.preco_venda).toFixed(2).replace('.',',')}</td>
            <td style="padding:10px 12px; text-align:center; color:rgba(255,255,255,0.4); font-size:12px;">${p.estoque_atual ? parseFloat(p.estoque_atual).toFixed(3).replace('.',',') : '-'}</td>
            <td style="padding:10px 12px; color:rgba(255,255,255,0.5); font-size:11px;">${p.descricao_departamento ? p.descricao_departamento.substring(0,20) : ''}</td>
            <td style="padding:10px 12px; text-align:center; color:rgba(255,255,255,0.4); font-size:11px; white-space:nowrap;">${p.data_cadastro ? new Date(p.data_cadastro).toLocaleDateString('pt-BR') : ''}</td>
            <td style="padding:10px 12px; text-align:center;">
                <div class="nv-status-group" data-codigo="${p.codigo}" data-ean="${p.ean || ''}" data-descricao="${(p.descricao || '').replace(/"/g, '&quot;')}" data-novidade-id="${p.novidade_id || ''}" style="display:flex; gap:4px; justify-content:center; flex-wrap:wrap;">
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
                grupo.querySelectorAll('.nv-btn-status').forEach(b => { b.style.opacity = '0.4'; b.style.borderColor = 'rgba(255,255,255,0.1)' })
                btn.style.opacity = '1'
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
        { value: 'novidades', label: 'Fazer', cor: '#f59e0b' },
        { value: 'ja_tem', label: 'Já tem', cor: '#22c55e' },
        { value: 'para_chegar', label: 'Esperando', cor: '#3b82f6' },
        { value: 'nao_fazer', label: 'Não fazer', cor: '#6b7280' }
    ]
    return botoes.map(b => `
        <button class="nv-btn-status" data-status="${b.value}"
            style="padding:4px 10px; border:1px solid ${atual === b.value ? b.cor : 'rgba(255,255,255,0.1)'}; border-radius:6px; font-size:11px; font-weight:600; color:${atual === b.value ? '#fff' : 'rgba(255,255,255,0.4)'}; background:${atual === b.value ? b.cor + '22' : 'transparent'}; cursor:pointer; opacity:${atual === b.value ? '1' : '0.6'}; transition:all 0.2s; white-space:nowrap;"
            onmouseenter="this.style.opacity='1';this.style.borderColor='${b.cor}';this.style.color='#fff'"
            onmouseleave="this.style.opacity='${atual === b.value ? '1' : '0.6'}';this.style.borderColor='${atual === b.value ? b.cor : 'rgba(255,255,255,0.1)'}';this.style.color='${atual === b.value ? '#fff' : 'rgba(255,255,255,0.4)'}'">
            ${b.label}
        </button>
    `).join('')
}

function atualizarContadorSelecionados() {
    document.getElementById('nv-selecionados-count').textContent = nvSelecionados.size
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
                body: JSON.stringify({
                    descricao: p.descricao,
                    ean: p.ean || p.codigo,
                    preco: p.preco_venda || 0,
                    status
                })
            })
            ok++
        } catch {}
    }
    alert(`${ok} de ${produtos.length} produto(s) classificados como "${status}".`)
    nvSelecionados.clear()
    await carregarListaNovidades()
}
