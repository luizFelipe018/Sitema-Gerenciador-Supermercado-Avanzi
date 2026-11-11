/* ═══════════════════════════════════════════════════════════════
   ATRIBUIR MARCAS EM MASSA — lote (varias regras de uma vez)
   ═══════════════════════════════════════════════════════════════ */

function carregarMarcasMassa() {
    setActive('btn-marcas-massa')
    setConteudo(`
        <div class="ds-page-head fade-in">
            <div>
                <div class="ds-page-eyebrow">Produtos</div>
                <h1 class="ds-page-title">Atribuir Marcas em Massa</h1>
                <p class="ds-page-sub">Adicione várias marcas de uma vez: termo na descrição → marca a gravar. Simule antes de aplicar.</p>
            </div>
        </div>

        <div class="ds-grid" style="grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
            <div class="ds-card">
                <div class="ds-card-head">
                    <div class="ds-card-title">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                        Marcas (lote)
                    </div>
                    <button id="btn-mm-adicionar" class="ds-btn ds-btn-sm" type="button">+ Adicionar marca</button>
                </div>
                <div class="ds-card-pad" style="display:flex; flex-direction:column; gap:14px;">
                    <p class="ds-field-hint" style="margin:0">Cada linha é uma regra: <b>termo na descrição → marca</b>. Ex.: <b>NESTLE → NESTLE</b>, <b>COCA COLA → COCA COLA</b>.</p>

                    <div id="mm-regras" style="display:flex; flex-direction:column; gap:10px;"></div>

                    <div id="mm-colar-wrap" style="display:none; flex-direction:column; gap:8px; border:1px dashed var(--border); border-radius:12px; padding:14px;">
                        <label class="lb">Colar lista (uma regra por linha: TERMO = MARCA)</label>
                        <textarea id="mm-colar-texto" rows="6" class="inp" placeholder="NESTLE = NESTLE&#10;COCA COLA = COCA COLA&#10;CERTANO = CERTANO&#10;TILIN = TILIN"></textarea>
                        <small style="color:var(--text-3); font-size:11px;">Vale <b>=</b>, <b>;</b>, <b>|</b> ou <b>:</b> entre termo e marca. Se deixar a marca em branco numa linha, ela é preenchida com o termo.</small>
                        <div style="display:flex; gap:8px;">
                            <button id="btn-mm-importar-lista" class="ds-btn ds-btn-sm ds-btn-primary" type="button">Importar lista</button>
                            <button id="btn-mm-cancelar-lista" class="ds-btn ds-btn-sm" type="button">Cancelar</button>
                        </div>
                    </div>

                    <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                        <input type="checkbox" id="mm-apenas-vazios" checked style="width:16px; height:16px;">
                        <span style="color:var(--text-1); font-size:13px;">Atribuir apenas para produtos sem marca (recomendado)</span>
                    </label>

                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        <button id="btn-mm-colar" class="btn-s" type="button">Colar lista</button>
                        <button id="btn-mm-simular" class="btn-s" type="button">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            Simular todas
                        </button>
                        <button id="btn-mm-aplicar" class="btn-p" type="button">
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
                        Como fazer (30 segundos)
                    </div>
                </div>
                <div class="ds-card-pad" style="display:flex; flex-direction:column; gap:10px;">
                    <div style="padding:10px 12px; background:rgba(59,130,246,0.08); border-radius:8px; border:1px solid rgba(59,130,246,0.35); font-size:12px; color:var(--text-2); line-height:1.55;">
                        <b style="color:var(--text-1)">1.</b> Digite o <b>termo</b> (parte do nome, ex.: <b>NESTLE</b>) e a <b>marca</b> a gravar.<br>
                        <b style="color:var(--text-1)">2.</b> Clique em <b>+ Adicionar marca</b> para a próxima, ou use <b>Colar lista</b> para colar várias de uma vez.<br>
                        <b style="color:var(--text-1)">3.</b> <b>Simule</b> para conferir, depois <b>Aplicar em massa</b>.<br>
                        <b style="color:var(--text-1)">Dica:</b> se a marca é igual ao termo, clique em <b>=</b> na linha para copiar o termo para a marca.
                    </div>
                    <div style="padding:10px 12px; background:rgba(245,158,11,0.08); border-radius:8px; border:1px solid rgba(245,158,11,0.4);">
                        <div style="color:#f59e0b; font-weight:600; font-size:13px; margin-bottom:4px;">Termo sobreposto?</div>
                        <div style="color:var(--text-2); font-size:12px;">Com <b>"apenas sem marca"</b> marcado, a primeira regra que casar preenche e as demais não sobrescrevem. Evite termos genéricos (<b>ARROZ</b>, <b>BISCOITO</b>) — use a marca junto, ex.: <b>ARROZ TIO JOAO</b>.</div>
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

    mmAdicionarRegra()
    document.getElementById('btn-mm-adicionar').onclick = () => mmAdicionarRegra()
    document.getElementById('btn-mm-colar').onclick = () => {
        const w = document.getElementById('mm-colar-wrap')
        w.style.display = w.style.display === 'none' ? 'flex' : 'none'
        if (w.style.display === 'flex') document.getElementById('mm-colar-texto').focus()
    }
    document.getElementById('btn-mm-cancelar-lista').onclick = () => { document.getElementById('mm-colar-wrap').style.display = 'none' }
    document.getElementById('btn-mm-importar-lista').onclick = mmImportarLista
    document.getElementById('btn-mm-simular').onclick = simularMarcasMassa
    document.getElementById('btn-mm-aplicar').onclick = aplicarMarcasMassa
    document.getElementById('mm-regras').addEventListener('keydown', (e) => { if (e.key === 'Enter') simularMarcasMassa() })
}

function mmAdicionarRegra(termo = '', marca = '') {
    const wrap = document.getElementById('mm-regras')
    if (!wrap) return
    const row = document.createElement('div')
    row.className = 'mm-regra'
    row.style.cssText = 'display:grid; grid-template-columns:1fr 1fr auto auto; gap:8px; align-items:center;'
    row.innerHTML = `
        <input type="text" class="inp mm-termo" placeholder="Termo na descrição (ex: NESTLE)" autocomplete="off" value="${termo.replace(/"/g, '&quot;')}">
        <input type="text" class="inp mm-marca" placeholder="Marca (ex: NESTLÉ)" autocomplete="off" value="${marca.replace(/"/g, '&quot;')}">
        <button type="button" class="ds-btn ds-btn-sm mm-igual" title="Copiar termo para a marca"> = </button>
        <button type="button" class="ds-btn ds-btn-sm mm-remover" title="Remover regra">✕</button>
    `
    row.querySelector('.mm-igual').onclick = () => {
        row.querySelector('.mm-marca').value = row.querySelector('.mm-termo').value.trim().toUpperCase()
        row.querySelector('.mm-marca').focus()
    }
    row.querySelector('.mm-remover').onclick = () => row.remove()
    wrap.appendChild(row)
    row.querySelector('.mm-termo').focus()
}

function mmLerRegras() {
    const rows = [...document.querySelectorAll('#mm-regras .mm-regra')]
    if (!rows.length) return []
    return rows.map(r => ({
        termo: r.querySelector('.mm-termo').value,
        marca: r.querySelector('.mm-marca').value
    })).filter(r => r.termo.trim() || r.marca.trim())
}

function mmImportarLista() {
    const texto = document.getElementById('mm-colar-texto').value
    if (!texto.trim()) { toast('Cole ao menos uma linha TERMO = MARCA', 'aviso'); return }
    const linhas = texto.split('\n').map(l => l.trim()).filter(Boolean)
    const novas = []
    for (const linha of linhas) {
        const m = linha.match(/^(.+?)\s*(?:=|;|\||:)\s*(.*)?$/)
        if (!m) { novas.push({ termo: linha, marca: linha }); continue }
        const termo = m[1].trim()
        const marca = (m[2] || '').trim() || termo
        if (termo) novas.push({ termo, marca })
    }
    if (!novas.length) { toast('Nenhuma regra válida na lista', 'aviso'); return }
    novas.forEach(r => mmAdicionarRegra(r.termo, r.marca))
    document.getElementById('mm-colar-wrap').style.display = 'none'
    document.getElementById('mm-colar-texto').value = ''
    toast(`${novas.length} regra(s) importada(s). Confira e simule.`, 'info')
}

async function simularMarcasMassa() {
    const regras = mmLerRegras()
    const apenasVazios = document.getElementById('mm-apenas-vazios').checked
    const tbody = document.getElementById('mm-tbody')
    const vazio = document.getElementById('mm-vazio')
    const contador = document.getElementById('mm-contador')

    if (!regras.length) {
        toast('Adicione ao menos uma regra (termo e marca)', 'aviso')
        return
    }
    if (regras.some(r => !r.termo.trim() || !r.marca.trim())) {
        toast('Preencha termo e marca em todas as linhas (linhas vazias são ignoradas)', 'aviso')
        return
    }

    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:var(--text-3);">Simulando todas as regras...</td></tr>'
    vazio.style.display = 'none'
    contador.textContent = ''

    try {
        const res = await fetch(API + '/marcas/prever-multi', {
            method: 'POST',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ regras, apenasVazios })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Erro ao simular')

        const totalGeral = data.regras.reduce((s, r) => s + (r.total || 0), 0)
        contador.textContent = `(${totalGeral} produto(s) no total, ${data.regras.length} regra(s))`

        const html = data.regras.map((r) => {
            const cab = `<tr style="background:var(--surface-2); border-bottom:1px solid var(--border);">
                <td colspan="3" style="padding:10px 16px; font-size:12px; font-weight:700; color:var(--text-1);">
                    ${r.termo.toUpperCase()} → ${r.marca.toUpperCase()} &nbsp;<span style="font-weight:500; color:var(--text-3)">(${r.total} encontrado(s)${r.amostra?.length < r.total ? ', mostrando até 10' : ''})</span>
                </td></tr>`
            const linhas = (r.amostra || []).map(p => `
                <tr style="border-bottom:1px solid var(--border);">
                    <td style="padding:9px 16px; font-size:12px; color:var(--text-3);">${p.codigo || '-'}</td>
                    <td style="padding:9px 16px; font-size:13px; color:var(--text-1);">${p.descricao || '-'}</td>
                    <td style="padding:9px 16px; font-size:12px; color:${p.marca ? 'var(--text-2)' : 'var(--text-3)'};">${p.marca && p.marca.trim() ? p.marca : '<span style="opacity:.5;">SEM MARCA</span>'}</td>
                </tr>`).join('')
            return cab + linhas
        }).join('')

        tbody.innerHTML = html || ''
        if (!data.regras.some(r => r.total > 0)) {
            vazio.style.display = 'block'
            toast('Nenhum produto encontrado com essas regras', 'aviso')
        } else {
            toast(`Simulação pronta. Total: ${totalGeral} produto(s).`, 'info')
        }
    } catch (e) {
        tbody.innerHTML = ''
        toast('Erro ao simular: ' + e.message, 'erro')
    }
}

async function aplicarMarcasMassa() {
    const regras = mmLerRegras()
    const apenasVazios = document.getElementById('mm-apenas-vazios').checked

    if (!regras.length) {
        toast('Adicione ao menos uma regra (termo e marca)', 'aviso')
        return
    }
    if (regras.some(r => !r.termo.trim() || !r.marca.trim())) {
        toast('Preencha termo e marca em todas as linhas', 'aviso')
        return
    }

    const lista = regras.map(r => `• ${r.termo.trim().toUpperCase()} → ${r.marca.trim().toUpperCase()}`).join('\n')
    const msg = `Aplicar ${regras.length} regra(s) em massa?\n\n${lista}\n\n${apenasVazios ? 'Somente produtos SEM MARCA serão alterados.' : 'ATENÇÃO: marcas existentes serão SOBRESCRITAS.'}\n\nEssa ação não pode ser desfeita facilmente.`
    const okAplicar = await avisoConfirmacao(msg, { titulo: 'Aplicar marcas?', tipo: 'pergunta', okText: 'Aplicar', cancelText: 'Cancelar' })
    if (!okAplicar) return

    const btn = document.getElementById('btn-mm-aplicar')
    const antigo = btn.innerHTML
    btn.disabled = true
    btn.innerHTML = 'Aplicando...'

    try {
        const res = await fetch(API + '/marcas/atribuir-massa-multi', {
            method: 'POST',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ regras, apenasVazios })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Erro ao aplicar')

        toast(`${data.afetados} produto(s) foram atualizados.`, 'ok')
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
