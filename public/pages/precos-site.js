/* ═══════════════════════════════════════════════════════════════
   PREÇOS DO SITE — compara ERP × site (SKU = código do ERP) e
   cria placas com o preço atual da loja, sem digitar nada na placa.
   ═══════════════════════════════════════════════════════════════ */

let psState = { resultados: [], selecionados: new Set(), usarPromo: true }

function carregarPrecosSite() {
    setActive('btn-precos-site')
    setConteudo(`
        <div class="ds-page-head fade-in">
            <div>
                <div class="ds-page-eyebrow">Catálogo</div>
                <h1 class="ds-page-title">Preços do Site</h1>
                <p class="ds-page-sub">Compara o preço do ERP com o preço atual do site (SKU = código) e cria placas já com o valor certo</p>
            </div>
        </div>

        <!-- Busca -->
        <div class="ds-card" style="margin-bottom:24px">
            <div class="ds-card-pad">
                <h3 class="ds-card-title">Buscar produto</h3>
                <p class="ds-card-sub">Digite a descrição, o código ERP ou o EAN — o site é consultado na hora (o SKU da loja é o mesmo código do ERP)</p>
                <div style="display:flex; gap:10px; align-items:end; flex-wrap:wrap;">
                    <div class="ds-field" style="flex:1; min-width:220px;">
                        <label class="ds-label">Produto</label>
                        <input id="ps-busca" type="text" placeholder="Ex: CERVEJA SKOL ou 1081143" autocomplete="off" style="width:100%">
                    </div>
                    <button id="ps-btn-buscar" class="ds-btn ds-btn-primary" type="button">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                        Buscar
                    </button>
                </div>
                <div id="ps-sugestoes"></div>
            </div>
        </div>

        <!-- Resultados -->
        <div id="ps-resultados"></div>

        <!-- Em lote -->
        <div class="ds-card" style="margin-top:24px">
            <div class="ds-card-pad">
                <h3 class="ds-card-title">Em lote</h3>
                <p class="ds-card-sub">Cole códigos, SKUs ou EANs (um por linha) — o sistema descobre o código ERP de cada um e cria as placas com o preço do site</p>
                <textarea id="ps-lote" rows="4" placeholder="1081143&#10;1935&#10;7896275983949&#10;..." style="width:100%; resize:vertical; background:var(--surface-2); border:1px solid var(--border); border-radius:12px; padding:12px; font-family:monospace; font-size:12.5px; color:var(--text-1); box-sizing:border-box;"></textarea>
                <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-top:12px;">
                    <label class="ds-label" style="display:flex; align-items:center; gap:6px; margin:0; cursor:pointer;">
                        <input type="checkbox" id="ps-promo" checked style="accent-color:var(--brand-2)"> usar preço promocional quando houver
                    </label>
                    <span style="flex:1"></span>
                    <button id="ps-btn-lote" class="ds-btn ds-btn-primary" type="button">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Adicionar como placas
                    </button>
                </div>
            </div>
            <div id="ps-lote-log"></div>
        </div>
    `, 'Preços do Site')

    const input = document.getElementById('ps-busca')
    input.focus()

    let sugTimer = null
    input.oninput = () => {
        clearTimeout(sugTimer)
        const q = input.value.trim()
        if (q.length < 2) { document.getElementById('ps-sugestoes').innerHTML = ''; return }
        sugTimer = setTimeout(() => carregarSugestoesPs(q), 300)
    }
    input.onkeydown = (e) => { if (e.key === 'Enter') buscarPs() }
    document.getElementById('ps-btn-buscar').onclick = buscarPs
    document.getElementById('ps-btn-lote').onclick = adicionarLotePs
}

const psMoney = (v) => Number(v || 0).toFixed(2).replace('.', ',')

async function carregarSugestoesPs(q) {
    try {
        const res = await fetch(API + `/produtos/busca?q=${encodeURIComponent(q)}`, { headers: authHeaders() })
        const prods = await res.json()
        const el = document.getElementById('ps-sugestoes')
        if (!Array.isArray(prods) || !prods.length) { el.innerHTML = ''; return }
        el.innerHTML = `
            <div style="margin-top:10px; border:1px solid var(--border); border-radius:12px; overflow:hidden;">
                ${prods.slice(0, 8).map(p => `
                    <div class="ps-sug-item" data-codigo="${p.codigo}"
                        style="padding:9px 14px; cursor:pointer; display:flex; justify-content:space-between; gap:10px; align-items:center; border-bottom:1px solid var(--border-soft);">
                        <span style="font-size:12.5px; font-weight:500; color:var(--text-1); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${p.descricao}</span>
                        <span style="font-size:11px; color:var(--text-3); font-family:monospace; flex:0 0 auto;">${p.codigo}</span>
                    </div>
                `).join('')}
            </div>`
        el.querySelectorAll('.ps-sug-item').forEach(item => {
            item.onmouseenter = () => item.style.background = 'rgba(181,21,21,0.08)'
            item.onmouseleave = () => item.style.background = 'transparent'
            item.onclick = () => {
                document.getElementById('ps-busca').value = item.getAttribute('data-codigo')
                el.innerHTML = ''
                buscarPs()
            }
        })
    } catch {}
}

async function buscarPs() {
    const q = document.getElementById('ps-busca').value.trim()
    const el = document.getElementById('ps-resultados')
    if (q.length < 2) { alert('Digite pelo menos 2 caracteres.'); return }
    psState.selecionados.clear()
    el.innerHTML = `<div class="ds-card"><div class="ds-card-pad" style="text-align:center; color:var(--text-3); font-size:13px;">Consultando ERP e site…</div></div>`

    try {
        const res = await fetch(API + `/precos-site/comparar?q=${encodeURIComponent(q)}`, { headers: authHeaders() })
        const d = await res.json()
        if (!res.ok) throw new Error(d.error || 'Erro na consulta')
        psState.resultados = d.itens || []
        renderizarResultadosPs()
    } catch (e) {
        el.innerHTML = `<div class="ds-card"><div class="ds-empty"><div class="ds-empty-text">Erro: ${e.message}</div></div></div>`
    }
}

function renderizarResultadosPs() {
    const el = document.getElementById('ps-resultados')
    if (!psState.resultados.length) {
        el.innerHTML = `<div class="ds-card"><div class="ds-empty"><div class="ds-empty-text">Nenhum produto encontrado no ERP.</div></div></div>`
        return
    }
    psState.selecionados.clear()
    psState.itens = psState.resultados.map(item => ({ ...item, _selecionado: false }))

    const rows = psState.itens.map((item, idx) => {
        const s = item.site && !item.site.erro ? item.site : null
        const temPromo = !!(s && s.promotionalPrice != null && s.promotionalPrice < s.price)
        const precoSite = s ? (temPromo ? s.promotionalPrice : s.price) : null
        const economia = s && item.precoErp != null && precoSite != null ? item.precoErp - precoSite : null
        return `
            <tr class="ps-row" data-idx="${idx}" style="border-bottom:1px solid var(--border-soft); ${idx % 2 ? 'background:rgba(255,255,255,0.015)' : ''}">
                <td style="padding:10px 12px; text-align:center;">
                    <input type="checkbox" class="ps-check" data-idx="${idx}" style="accent-color:var(--brand-2); width:16px; height:16px;">
                </td>
                <td style="padding:10px 12px;">
                    <div style="font-size:12.5px; font-weight:600; color:var(--text-1); max-width:340px;">${item.descricao}</div>
                    <div style="font-size:11px; color:var(--text-3); font-family:monospace; margin-top:2px;">${item.codigo}${item.ean ? ' · EAN ' + item.ean : ''}</div>
                </td>
                <td style="padding:10px 12px; text-align:right;">
                    <div style="font-size:13px; font-weight:700; color:var(--text-1);">${item.precoErp != null ? 'R$ ' + psMoney(item.precoErp) : '—'}</div>
                    <div style="font-size:10px; color:var(--text-3);">ERP</div>
                </td>
                <td style="padding:10px 12px; text-align:right;">
                    ${s ? `
                        <div style="font-size:13px; font-weight:700; color:${temPromo ? 'var(--ok)' : 'var(--text-1)'};">R$ ${psMoney(precoSite)}</div>
                        ${temPromo ? `<div style="font-size:10px; color:var(--text-3); text-decoration:line-through;">R$ ${psMoney(s.price)}</div>` : ''}
                        <div style="font-size:10px; color:var(--text-3);">${s.inStock > 0 ? s.inStock + ' un no site' : 'sem estoque'}</div>
                    ` : `<div style="font-size:12px; color:var(--danger);">não está no site</div><div style="font-size:10px; color:var(--text-3);">${item.site?.erro || ''}</div>`}
                </td>
                <td style="padding:10px 12px; text-align:right;">
                    ${economia != null && Math.abs(economia) >= 0.01 ? `
                        <span style="font-size:12px; font-weight:700; color:${economia > 0 ? 'var(--ok)' : 'var(--danger)'};">${economia > 0 ? '−' : '+'}R$ ${psMoney(Math.abs(economia))}</span>
                        <div style="font-size:10px; color:var(--text-3);">${economia > 0 ? 'ERP mais caro' : 'ERP mais barato'}</div>
                    ` : '<span style="color:var(--text-3); font-size:12px;">igual</span>'}
                </td>
            </tr>
        `}).join('')

    el.innerHTML = `
        <div class="ds-card" style="overflow:hidden;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 18px; border-bottom:1px solid var(--border); flex-wrap:wrap; gap:10px;">
                <div style="font-size:13px; font-weight:600; color:var(--text-1);">${psState.itens.length} produto(s) encontrado(s)</div>
                <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
                    <label class="ds-label" style="display:flex; align-items:center; gap:6px; margin:0; cursor:pointer; font-size:11px;">
                        <input type="checkbox" id="ps-check-all" style="accent-color:var(--brand-2);"> selecionar todos
                    </label>
                    <button id="ps-btn-atualizar-erp" class="ds-btn ds-btn-sm" type="button" title="Atualiza o preco_venda no ERP com o preço do site">Atualizar preço no ERP</button>
                    <button id="ps-btn-criar-placas" class="ds-btn ds-btn-sm ds-btn-primary" type="button" title="Adiciona os selecionados como placas modelo Média">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2"/><line x1="12" y1="7" x2="12" y2="17"/><line x1="7" y1="10.5" x2="17" y2="10.5"/></svg>
                        Criar placas
                    </button>
                </div>
            </div>
            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; min-width:720px;">
                    <thead>
                        <tr style="border-bottom:2px solid var(--border);">
                            <th style="padding:10px 12px; width:36px;"></th>
                            <th style="padding:10px 12px; text-align:left; font-size:11px; color:var(--text-3); text-transform:uppercase; letter-spacing:0.05em;">Produto</th>
                            <th style="padding:10px 12px; text-align:right; font-size:11px; color:var(--text-3); text-transform:uppercase; letter-spacing:0.05em;">Preço ERP</th>
                            <th style="padding:10px 12px; text-align:right; font-size:11px; color:var(--text-3); text-transform:uppercase; letter-spacing:0.05em;">Preço no site</th>
                            <th style="padding:10px 12px; text-align:right; font-size:11px; color:var(--text-3); text-transform:uppercase; letter-spacing:0.05em;">Δ Prev.</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>`

    document.getElementById('ps-check-all').onchange = (e) => {
        el.querySelectorAll('.ps-check').forEach(c => { c.checked = e.target.checked })
    }
    el.querySelectorAll('.ps-check').forEach(c => {
        c.onchange = () => {}
    })
    document.getElementById('ps-btn-atualizar-erp').onclick = atualizarPrecosErpPs
    document.getElementById('ps-btn-criar-placas').onclick = criarPlacasPs
}

/* ── selecionados na tabela ── */
function psSelecionados() {
    const checks = [...document.querySelectorAll('.ps-check')]
    return checks.filter(c => c.checked).map(c => psState.itens[parseInt(c.getAttribute('data-idx'))]).filter(Boolean)
}

/* ── atualizar preco_venda no ERP com o preço do site ── */
async function atualizarPrecosErpPs() {
    const sel = psSelecionados()
    if (!sel.length) return alert('Selecione pelo menos um produto.')
    const usarPromo = document.getElementById('ps-promo')?.checked ?? true
    const atualizavel = sel.filter(i => i.site && !i.site.erro)
    if (!atualizavel.length) return alert('Nenhum dos selecionados tem preço no site.')
    const okAtualizar = await avisoConfirmacao(`Atualizar o preço no ERP de ${atualizavel.length} produto(s) com o preço do site?`, { titulo: 'Atualizar preços no ERP?', tipo: 'pergunta', okText: 'Atualizar', cancelText: 'Cancelar' })
    if (!okAtualizar) return

    let ok = 0, falhas = 0
    for (const item of atualizavel) {
        const s = item.site
        const preco = usarPromo && s.promotionalPrice != null && s.promotionalPrice < s.price ? s.promotionalPrice : s.price
        try {
            const res = await fetch(API + '/precos-site/atualizar-preco', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ codigo: item.codigo, preco })
            })
            if (res.ok) ok++; else falhas++
        } catch { falhas++ }
        await new Promise(r => setTimeout(r, 100))
    }
    alert(`Atualizado no ERP: ${ok} ok${falhas ? `, ${falhas} falha(s)` : ''}`)
    buscarPs()
}

/* ── criar placas (modelo Média) com o preço do site ── */
async function criarPlacasPs() {
    const sel = psSelecionados()
    if (!sel.length) return alert('Selecione pelo menos um produto.')
    const usarPromo = document.getElementById('ps-promo')?.checked ?? true
    const itens = sel.filter(i => i.site && !i.site.erro)
    if (!itens.length) return alert('Nenhum dos selecionados tem preço lido do site.')

    // carrega placas atuais do servidor (registros-placas) e adiciona as novas
    try {
        let atuais = []
        try {
            const rAtual = await fetch(API + '/registros-placas?tipo=media', { headers: authHeaders() })
            atuais = await rAtual.json()
            if (!Array.isArray(atuais)) atuais = []
        } catch { atuais = [] }

        const dbPlacas = []
        for (const item of itens) {
            const s = item.site
            const preco = usarPromo && s.promotionalPrice != null && s.promotionalPrice < s.price ? s.promotionalPrice : s.price
            let qtdKgL = parseFloat(item.quantidade_kg_l) || 0
            const precoInfo = qtdKgL > 0 ? (preco / qtdKgL).toFixed(2).replace('.', ',') : preco.toFixed(2).replace('.', ',')
            dbPlacas.push({
                descricao: item.descricao,
                codigo: item.codigo,
                ean: item.ean || null,
                preco: Math.round(preco * 100) / 100,
                preco_info: precoInfo,
                quantidade_kg_l: qtdKgL,
                descricao_kglt: '',
                marca: item.marca || null,
                config: null
            })
        }

        const todas = atuais.map(p => ({
            descricao: p.descricao, codigo: p.codigo, ean: p.ean, preco: p.preco,
            preco_info: p.preco_info, quantidade_kg_l: p.quantidade_kg_l,
            descricao_kglt: p.descricao_kglt, marca: p.marca, config: p.config
        })).concat(dbPlacas)

        const res = await fetch(API + '/registros-placas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ tipo: 'media', placas: todas })
        })
        const d = await res.json()
        if (!res.ok) throw new Error(d.error || 'Erro ao salvar placas')
        alert(`✓ ${dbPlacas.length} placa(s) criada(s) com o preço do site! Abra a aba Placa Média para ver, revisar e imprimir.`)
    } catch (e) {
        alert('Erro ao criar placas: ' + e.message)
    }
}

/* ── lote: cola códigos/EANs ── */
async function adicionarLotePs() {
    const raw = document.getElementById('ps-lote').value.trim()
    if (!raw) return alert('Cole pelo menos um código por linha.')
    const codigos = [...new Set(raw.split(/[\n,;\s]+/).map(s => s.trim()).filter(Boolean))]
    if (!codigos.length) return alert('Nenhum código reconhecido.')

    const elLog = document.getElementById('ps-lote-log')
    const btn = document.getElementById('ps-btn-lote')
    const usarPromo = document.getElementById('ps-promo')?.checked ?? true
    btn.disabled = true
    btn.style.opacity = 0.6
    elLog.innerHTML = `<div style="padding:14px 18px; font-size:12px; color:var(--text-3);">Consultando o site… 0/${codigos.length}</div>`

    const encontrados = []
    const naoAchou = []
    for (let i = 0; i < codigos.length; i++) {
        const termo = codigos[i]
        try {
            // uma chamada já resolve EAN/SKU → código ERP e busca preço no site
            const r = await fetch(API + `/precos-site/buscar?q=${encodeURIComponent(termo)}`, { headers: authHeaders() })
            const s = await r.json()
            if (r.ok && s && !s.erro) {
                const erp = s.erp || {}
                encontrados.push({
                    codigo: erp.codigo || s.codigoERP || termo,
                    descricao: erp.descricao || s.name,
                    ean: erp.ean || '',
                    marca: erp.marca || '',
                    quantidade_kg_l: erp.quantidade_kg_l ?? 0,
                    site: s
                })
            } else {
                naoAchou.push(termo)
            }
        } catch {
            naoAchou.push(termo)
        }
        elLog.innerHTML = `<div style="padding:14px 18px; font-size:12px; color:var(--text-3);">Consultando o site… ${i + 1}/${codigos.length}</div>`
        await new Promise(r => setTimeout(r, 130))
    }

    if (naoAchou.length) {
        elLog.insertAdjacentHTML('beforeend', `<div style="padding:10px 18px; font-size:12px; color:var(--danger); border-top:1px solid var(--border-soft);">Sem preço no site (${naoAchou.length}): ${naoAchou.join(', ')}</div>`)
    }

    if (!encontrados.length) {
        elLog.insertAdjacentHTML('beforeend', `<div style="padding:12px 18px; font-size:12.5px; color:var(--danger); border-top:1px solid var(--border-soft);">Nenhum produto foi encontrado no site.</div>`)
        btn.disabled = false
        btn.style.opacity = 1
        return
    }

    try {
        let atuais = []
        try {
            const rAtual = await fetch(API + '/registros-placas?tipo=media', { headers: authHeaders() })
            atuais = await rAtual.json()
            if (!Array.isArray(atuais)) atuais = []
        } catch { atuais = [] }

        const dbPlacas = encontrados.map(item => {
            const s = item.site
            const preco = usarPromo && s.promotionalPrice != null && s.promotionalPrice < s.price ? s.promotionalPrice : s.price
            const qtdKgL = parseFloat(item.quantidade_kg_l) || 0
            const precoInfo = qtdKgL > 0 ? (preco / qtdKgL).toFixed(2).replace('.', ',') : preco.toFixed(2).replace('.', ',')
            return {
                descricao: item.descricao, codigo: item.codigo, ean: item.ean || null,
                preco: Math.round(preco * 100) / 100, preco_info: precoInfo,
                quantidade_kg_l: qtdKgL, descricao_kglt: '', marca: item.marca || null, config: null
            }
        })

        const todas = atuais.map(p => ({
            descricao: p.descricao, codigo: p.codigo, ean: p.ean, preco: p.preco,
            preco_info: p.preco_info, quantidade_kg_l: p.quantidade_kg_l,
            descricao_kglt: p.descricao_kglt, marca: p.marca, config: p.config
        })).concat(dbPlacas)

        const res = await fetch(API + '/registros-placas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ tipo: 'media', placas: todas })
        })
        const d = await res.json()
        if (!res.ok) throw new Error(d.error || 'Erro ao salvar placas')

        elLog.insertAdjacentHTML('beforeend', `<div style="padding:12px 18px; font-size:12.5px; color:var(--ok); border-top:1px solid var(--border-soft);">✓ ${dbPlacas.length} placa(s) criada(s) com preço do site${naoAchou.length ? ` (${naoAchou.length} sem preço no site)` : ''}. Abra a aba Placa Média para ver e imprimir.</div>`)
        document.getElementById('ps-lote').value = ''
    } catch (e) {
        elLog.insertAdjacentHTML('beforeend', `<div style="padding:12px 18px; font-size:12.5px; color:var(--danger); border-top:1px solid var(--border-soft);">Erro ao salvar placas: ${e.message}</div>`)
    } finally {
        btn.disabled = false
        btn.style.opacity = 1
    }
}
