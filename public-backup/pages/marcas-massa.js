/* ═══════════════════════════════════════════════════════════════
   ATRIBUIR MARCAS EM MASSA
   ═══════════════════════════════════════════════════════════════ */

function carregarMarcasMassa() {
    setActive('btn-marcas-massa')
    setConteudo(`
        <div class="ds-page-head fade-in">
            <div>
                <div class="ds-page-eyebrow">Produtos</div>
                <h1 class="ds-page-title">Atribuir Marcas em Massa</h1>
                <p class="ds-page-sub">Coloque o termo que aparece na descrição e o sistema atribui a marca para todos os produtos encontrados</p>
            </div>
        </div>

        <div class="ds-grid" style="grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div class="ds-card">
                <div class="ds-card-head">
                    <div class="ds-card-title">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                        Configuração
                    </div>
                </div>
                <div class="ds-card-pad" style="display:flex; flex-direction:column; gap:14px;">
                    <div class="fcc">
                        <label class="lb">Termo a buscar na descrição</label>
                        <input type="text" id="mm-termo" class="inp" placeholder="Ex: NESTLE, COCA COLA, BOMBRIL" autocomplete="off">
                        <small style="color:var(--text-3); font-size:11px; margin-top:4px;">O sistema vai procurar esse termo na descrição dos produtos</small>
                    </div>

                    <div class="fcc">
                        <label class="lb">Nome da marca a atribuir</label>
                        <input type="text" id="mm-marca" class="inp" placeholder="Ex: NESTLÉ" autocomplete="off">
                    </div>

                    <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                        <input type="checkbox" id="mm-apenas-vazios" checked style="width:16px; height:16px;">
                        <span style="color:var(--text-1); font-size:13px;">Atribuir apenas para produtos sem marca</span>
                    </label>

                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        <button id="btn-mm-simular" class="btn-s">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            Simular
                        </button>
                        <button id="btn-mm-aplicar" class="btn-p">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                            Aplicar em massa
                        </button>
                    </div>
                </div>
            </div>

            <div class="ds-card">
                <div class="ds-card-head">
                    <div class="ds-card-title">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        Dica
                    </div>
                </div>
                <div class="ds-card-pad" style="display:flex; flex-direction:column; gap:10px;">
                    <div style="padding:10px 12px; background:rgba(245,158,11,0.08); border-radius:8px; border:1px solid rgba(245,158,11,0.4);">
                        <div style="color:#f59e0b; font-weight:600; font-size:13px; margin-bottom:4px;">Sempre simule primeiro</div>
                        <div style="color:var(--text-2); font-size:12px;">Clique em <b>Simular</b> para conferir quais produtos vão ser alterados antes de aplicar.</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="ds-card">
            <div class="ds-card-head">
                <div class="ds-card-title">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Pré-visualização <span id="mm-contador" style="margin-left:6px; color:var(--text-3); font-weight:500;"></span>
                </div>
            </div>
            <div class="ds-card-pad" style="padding:0;">
                <div style="overflow:auto; max-height:520px;">
                    <table style="width:100%; border-collapse:collapse;">
                        <thead>
                            <tr style="background:var(--surface-2); border-bottom:1px solid var(--border);">
                                <th style="text-align:left; padding:10px 16px; font-size:11px; color:var(--text-3); text-transform:uppercase; letter-spacing:.5px;">CÓDIGO</th>
                                <th style="text-align:left; padding:10px 16px; font-size:11px; color:var(--text-3); text-transform:uppercase; letter-spacing:.5px;">DESCRIÇÃO</th>
                                <th style="text-align:left; padding:10px 16px; font-size:11px; color:var(--text-3); text-transform:uppercase; letter-spacing:.5px;">MARCA ATUAL</th>
                            </tr>
                        </thead>
                        <tbody id="mm-tbody"></tbody>
                    </table>
                    <div id="mm-vazio" style="text-align:center; padding:40px; color:var(--text-3); display:none;">Nenhum produto encontrado</div>
                </div>
            </div>
        </div>
    `, 'Atribuir Marcas em Massa')

    document.getElementById('btn-mm-simular').onclick = simularMarcasMassa
    document.getElementById('btn-mm-aplicar').onclick = aplicarMarcasMassa
    document.getElementById('mm-termo').onkeydown = (e) => { if(e.key === 'Enter') simularMarcasMassa() }
    document.getElementById('mm-marca').onkeydown = (e) => { if(e.key === 'Enter') simularMarcasMassa() }
}

async function simularMarcasMassa() {
    const termo = document.getElementById('mm-termo').value.trim()
    const marca = document.getElementById('mm-marca').value.trim()
    const apenasVazios = document.getElementById('mm-apenas-vazios').checked
    const tbody = document.getElementById('mm-tbody')
    const vazio = document.getElementById('mm-vazio')
    const contador = document.getElementById('mm-contador')

    if (!termo) {
        toast('Informe o termo para buscar na descrição', 'aviso')
        document.getElementById('mm-termo').focus()
        return
    }

    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:var(--text-3);">Buscando...</td></tr>'
    vazio.style.display = 'none'
    contador.textContent = ''

    try {
        const res = await fetch(API + '/marcas/prever', {
            method: 'POST',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ marca, termo, apenasVazios })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Erro ao simular')

        if (!data.itens || data.itens.length === 0) {
            tbody.innerHTML = ''
            vazio.style.display = 'block'
            contador.textContent = '(0 produtos)'
            toast('Nenhum produto encontrado com esse filtro', 'aviso')
            return
        }

        contador.textContent = `(${data.total} produto(s) encontrados${data.total >= 300 ? ' - mostrando até 300' : ''})`
        tbody.innerHTML = data.itens.map(p => `
            <tr style="border-bottom:1px solid var(--border);">
                <td style="padding:9px 16px; font-size:12px; color:var(--text-3);">${p.codigo || '-'}</td>
                <td style="padding:9px 16px; font-size:13px; color:var(--text-1);">${p.descricao || '-'}</td>
                <td style="padding:9px 16px; font-size:12px; color:${p.marca ? 'var(--text-2)' : 'var(--text-3)'};">${p.marca && p.marca.trim() ? p.marca : '<span style="opacity:.5;">SEM MARCA</span>'}</td>
            </tr>
        `).join('')

        if (marca) {
            toast(`Simulação pronta. Serão atribuídos ${data.total >= 300 ? 'até ' : ''}${data.total} produto(s) para marca ${marca.toUpperCase()}`, 'info')
        }
    } catch (e) {
        tbody.innerHTML = ''
        toast('Erro ao simular: ' + e.message, 'erro')
    }
}

async function aplicarMarcasMassa() {
    const termo = document.getElementById('mm-termo').value.trim()
    const marca = document.getElementById('mm-marca').value.trim()
    const apenasVazios = document.getElementById('mm-apenas-vazios').checked

    if (!termo) {
        toast('Informe o termo para buscar na descrição', 'aviso')
        document.getElementById('mm-termo').focus()
        return
    }
    if (!marca) {
        toast('Informe o nome da marca a atribuir', 'aviso')
        document.getElementById('mm-marca').focus()
        return
    }

    const msg = apenasVazios 
        ? `Tem certeza que deseja atribuir a marca "${marca.toUpperCase()}" para TODOS os produtos SEM MARCA que contenham "${termo.toUpperCase()}" na descrição?\n\nEssa ação não pode ser desfeita facilmente.`
        : `Tem certeza que deseja ATRIBUIR/SUBSTITUIR a marca "${marca.toUpperCase()}" para TODOS os produtos que contenham "${termo.toUpperCase()}" na descrição (inclusive os que já possuem marca)?\n\nEssa ação irá SOBRESCREVER as marcas existentes.`

    if (!confirm(msg)) return

    const btn = document.getElementById('btn-mm-aplicar')
    const antigo = btn.innerHTML
    btn.disabled = true
    btn.innerHTML = 'Aplicando...'

    try {
        const res = await fetch(API + '/marcas/atribuir-massa', {
            method: 'POST',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ marca, termo, apenasVazios })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Erro ao aplicar')

        toast(`${data.afetados} produto(s) foram atualizados com a marca ${data.marca}`, 'ok')
        simularMarcasMassa()
    } catch (e) {
        toast('Erro ao aplicar: ' + e.message, 'erro')
    } finally {
        btn.disabled = false
        btn.innerHTML = antigo
    }
}

function toast(msg, tipo = 'ok') {
    if (typeof window.toastApp === 'function') { window.toastApp(msg, tipo); return }
    const el = document.createElement('div')
    el.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;padding:10px 16px;border-radius:8px;color:#fff;font-weight:600;font-size:13px;background:' + (tipo === 'erro' ? '#ef4444' : tipo === 'aviso' ? '#f59e0b' : tipo === 'info' ? '#3b82f6' : '#22c55e')
    el.textContent = msg
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 2800)
}

window.carregarMarcasMassa = carregarMarcasMassa
