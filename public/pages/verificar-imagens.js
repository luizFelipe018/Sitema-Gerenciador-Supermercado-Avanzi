/* ═══════════════════════════════════════════════════════════════
   VERIFICAR IMAGENS — quais produtos têm/falta foto
   ═══════════════════════════════════════════════════════════════ */

let viState = { page: 1, limit: 50, status: 'todas', busca: '', data: null }

function carregarVerificarImagens() {
    setActive('btn-verificar-imagens')
    setConteudo(`
        <div class="ds-page-head fade-in">
            <div>
                <div class="ds-page-eyebrow">Catálogo</div>
                <h1 class="ds-page-title">Verificar Imagens</h1>
                <p class="ds-page-sub">Cruza todos os produtos com a pasta de imagens e mostra o que falta e o que já foi verificado</p>
            </div>
            <button id="vi-atualizar" class="ds-btn ds-btn-sm ds-btn-icon" title="Atualizar" type="button">
                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            </button>
        </div>

        <div class="ds-grid ds-grid-4" id="vi-stats" style="margin-bottom:24px">
            <div class="ds-stat"><span class="ds-stat-label">Total de produtos</span><div class="ds-stat-value" id="vi-total">—</div></div>
            <div class="ds-stat"><span class="ds-stat-label">Com imagem</span><div class="ds-stat-value" id="vi-existe" style="color:var(--ok)">—</div></div>
            <div class="ds-stat"><span class="ds-stat-label">Sem imagem</span><div class="ds-stat-value" id="vi-sem" style="color:var(--danger)">—</div></div>
            <div class="ds-stat"><span class="ds-stat-label">Verificadas</span><div class="ds-stat-value" id="vi-verificadas" style="color:var(--info)">—</div></div>
        </div>

        <div class="ds-card" style="overflow:hidden; margin-bottom:24px">
            <div class="ds-card-head" style="justify-content:flex-start; gap:20px; flex-wrap:wrap">
                <div class="ds-segmented" id="vi-filtros">
                    <button data-status="todas" class="is-active" type="button">Todas</button>
                    <button data-status="existe" type="button">Com imagem</button>
                    <button data-status="sem" type="button">Sem imagem</button>
                    <button data-status="verificada" type="button">Verificadas</button>
                    <button data-status="pendente" type="button">Pendentes</button>
                    <button data-status="corrigir" type="button">Corrigir</button>
                    <button data-status="sem_imagem" type="button">Sem imagem (banco)</button>
                </div>
                <div class="frc10" style="flex:1; min-width:220px; max-width:380px; margin-left:auto;">
                    <input type="text" id="vi-busca" class="ds-input" placeholder="Buscar código ou descrição..." style="height:36px;">
                    <button id="vi-buscar" class="ds-btn ds-btn-sm" type="button">Buscar</button>
                </div>
            </div>
            <div style="overflow-x:auto">
                <table class="ds-table-prod">
                    <thead>
                        <tr>
                            <th style="width:90px">Imagem</th>
                            <th style="width:110px">Código</th>
                            <th>Descrição</th>
                            <th style="width:110px; text-align:center">Na pasta</th>
                            <th style="width:140px; text-align:center">Status</th>
                            <th style="width:110px; text-align:center">Ação</th>
                        </tr>
                    </thead>
                    <tbody id="vi-tbody"><tr><td colspan="6" style="text-align:center; padding:60px 20px; color:var(--text-3)">Carregando...</td></tr></tbody>
                </table>
            </div>
            <div id="vi-paginacao" style="display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 18px; border-top:1px solid var(--border); font-size:12px; color:var(--text-3)"></div>
        </div>
    `, 'Verificar Imagens')

    document.getElementById('vi-atualizar').onclick = () => viCarregar()
    document.getElementById('vi-buscar').onclick = () => { viState.busca = document.getElementById('vi-busca').value.trim(); viState.page = 1; viCarregar() }
    document.getElementById('vi-busca').onkeydown = (e) => { if (e.key === 'Enter') { viState.busca = e.target.value.trim(); viState.page = 1; viCarregar() } }

    document.querySelectorAll('#vi-filtros [data-status]').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('#vi-filtros [data-status]').forEach(b => b.classList.remove('is-active'))
            btn.classList.add('is-active')
            viState.status = btn.dataset.status
            viState.page = 1
            viCarregar()
        }
    })

    viCarregar()
}

async function viCarregar() {
    try {
        const params = new URLSearchParams({ page: viState.page, limit: viState.limit, status: viState.status })
        if (viState.busca) params.set('busca', viState.busca)
        const res = await fetch(API + '/imagens/auditar?' + params, { headers: authHeaders() })
        const d = await res.json()
        if (!res.ok) throw new Error(d.error || 'Erro')
        viState.data = d

        document.getElementById('vi-total').textContent = d.resumo.total.toLocaleString('pt-BR')
        document.getElementById('vi-existe').textContent = d.resumo.totalExiste.toLocaleString('pt-BR')
        document.getElementById('vi-sem').textContent = d.resumo.totalSem.toLocaleString('pt-BR')
        document.getElementById('vi-verificadas').textContent = d.resumo.verificadas.toLocaleString('pt-BR')

        const tbody = document.getElementById('vi-tbody')
        if (!d.itens.length) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:48px 20px; color:var(--text-3)">Nenhum produto neste filtro.</td></tr>'
        } else {
            tbody.innerHTML = d.itens.map(p => {
                const existeTag = p.existe
                    ? '<span class="ds-badge" style="background:var(--ok-soft); color:var(--ok);">Na pasta</span>'
                    : '<span class="ds-badge" style="background:var(--danger-soft); color:var(--danger);">Faltando</span>'
                const chip = {
                    verificada: '<span class="ds-badge" style="background:var(--ok-soft); color:var(--ok);">Verificada</span>',
                    sem_imagem: '<span class="ds-badge" style="background:var(--danger-soft); color:var(--danger);">Sem imagem</span>',
                    corrigir:   '<span class="ds-badge" style="background:var(--warn-soft); color:var(--warn);">Corrigir</span>',
                    pendente:   '<span class="ds-badge" style="background:var(--surface-3); color:var(--text-2);">Pendente</span>'
                }[p.status] || '<span class="ds-badge" style="background:var(--surface-3); color:var(--text-2);">Pendente</span>'

                return `<tr>
                    <td><img loading="lazy" src="/imagem?codigo=${encodeURIComponent(p.codigo)}" alt="" onerror="this.style.visibility='hidden'; this.parentNode.innerHTML='<span class=&quot;ds-badge&quot; style=&quot;background:var(--danger-soft); color:var(--danger);&quot;>Faltando</span>';" style="width:64px; height:48px; object-fit:contain; border-radius:6px; background:#fff;"></td>
                    <td class="mono" style="color:var(--text-3)">${p.codigo || '—'}</td>
                    <td class="strong">${p.descricao || '—'}</td>
                    <td class="text-center">${existeTag}</td>
                    <td class="text-center">${chip}</td>
                    <td class="text-center"><button class="ds-btn ds-btn-sm vi-ver" data-codigo="${p.codigo}" type="button">Buscar</button></td>
                </tr>`
            }).join('')
            tbody.querySelectorAll('.vi-ver').forEach(btn => {
                btn.onclick = () => {
                    document.getElementById('btn-imagens').click()
                    const input = document.getElementById('img-busca')
                    if (input) { input.value = btn.dataset.codigo; const b = document.getElementById('img-btn-buscar'); if (b) b.click() }
                }
            })
        }

        const pag = document.getElementById('vi-paginacao')
        pag.innerHTML = `
            <span>${d.total.toLocaleString('pt-BR')} produto(s) — página ${d.pagina} de ${d.paginas}</span>
            <div style="display:flex; gap:6px;">
                <button id="vi-prev" class="ds-btn ds-btn-sm" ${d.pagina <= 1 ? 'disabled style="opacity:.4;cursor:not-allowed;"' : ''}><svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg> Anterior</button>
                <button id="vi-next" class="ds-btn ds-btn-sm" ${d.pagina >= d.paginas ? 'disabled style="opacity:.4;cursor:not-allowed;"' : ''}>Próxima <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></button>
            </div>`
        document.getElementById('vi-prev')?.addEventListener('click', () => { if (viState.page > 1) { viState.page--; viCarregar() } })
        document.getElementById('vi-next')?.addEventListener('click', () => { if (viState.page < d.paginas) { viState.page++; viCarregar() } })
    } catch (e) {
        document.getElementById('vi-tbody').innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px 20px; color:var(--danger)">Erro: ${e.message}</td></tr>`
    }
}
