/* ═══════════════════════════════════════════════════════════════
   ATALHOS — links rápidos para arquivos, pastas e URLs.
   Layout 100% no design system (sem Tailwind CDN).
   ═══════════════════════════════════════════════════════════════ */

let atlEditandoId = null
let atalhosCache = []

const ATL_ICONES = ['📁','📄','🖼️','🎨','📊','📝','🎬','🎵','🔧','⚙️','🌐','📧','💼','🖥️','📱','🗂️','📦','🔗']

function carregarAtalhos() {
    setActive('btn-atalhos')

    if (!document.getElementById('atalhos-style')) {
        const st = document.createElement('style')
        st.id = 'atalhos-style'
        st.textContent = `
            .atl-layout { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,2fr); gap:20px; align-items:start; }
            .atl-col { display:flex; flex-direction:column; gap:16px; min-width:0; }
            .atl-panel { padding:20px; background:var(--surface-1); border:1px solid var(--border); border-radius:var(--r-lg); }
            .atl-panel-sm { padding:16px; }
            .atl-title { display:flex; align-items:center; gap:8px; font-size:14px; font-weight:700; color:var(--text-1); margin:0 0 16px; }
            .atl-field { display:flex; flex-direction:column; gap:5px; }
            .atl-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--text-3); }
            .atl-input {
                width:100%; box-sizing:border-box; padding:10px 14px; border:1px solid var(--border);
                border-radius:10px; font-size:13px; color:var(--text-1); background:var(--surface-2);
                outline:none; transition:border-color .2s, box-shadow .2s;
            }
            .atl-input:focus { border-color:var(--brand); box-shadow:0 0 0 3px var(--brand-soft); }
            .atl-input::placeholder { color:var(--text-3); }
            .atl-mono { font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; }
            .atl-row { display:flex; gap:8px; }
            .atl-tipo-btn {
                flex:1; padding:8px; border:1px solid var(--border); border-radius:8px; font-size:11px;
                font-weight:600; color:var(--text-3); background:var(--surface-2); cursor:pointer; transition:all .2s;
            }
            .atl-tipo-btn:hover { color:var(--text-1); border-color:var(--border-strong); }
            .atl-tipo-btn.ativo { border-color:var(--brand); color:var(--brand-text); background:var(--brand-soft); }
            .atl-icones { display:flex; flex-wrap:wrap; gap:5px; }
            .atl-icone-btn {
                width:36px; height:36px; font-size:16px; border:1px solid var(--border); border-radius:8px;
                background:var(--surface-2); color:var(--text-1); cursor:pointer; display:flex;
                align-items:center; justify-content:center; transition:all .2s;
            }
            .atl-icone-btn:hover { border-color:var(--border-strong); }
            .atl-icone-btn.ativo { border-color:var(--brand); background:var(--brand-soft); }
            .atl-hint { font-size:10px; color:var(--text-3); margin:5px 0 0; }
            .atl-msg { font-size:11px; min-height:16px; color:var(--text-3); }
            .atl-actions { display:flex; gap:8px; }
            .atl-busca-row { display:flex; gap:12px; align-items:flex-end; }
            .atl-grupo { margin-bottom:20px; }
            .atl-grupo-titulo {
                font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em;
                color:var(--text-3); margin:0 0 8px;
            }
            .atl-itens { display:flex; flex-direction:column; gap:8px; }
            .atl-item { padding:14px 16px; display:flex; align-items:center; gap:12px; }
            .atl-item-icone {
                flex-shrink:0; width:48px; height:48px; border-radius:12px; display:flex; align-items:center;
                justify-content:center; font-size:22px; background:var(--surface-2);
                border:1px solid var(--border); cursor:pointer; color:var(--text-1); transition:all .2s;
            }
            .atl-item-icone:hover { border-color:var(--brand); }
            .atl-item-info { flex:1; min-width:0; }
            .atl-item-nome { display:flex; align-items:center; gap:8px; }
            .atl-item-titulo { font-weight:600; color:var(--text-1); font-size:13px; }
            .atl-badge {
                font-size:10px; font-weight:600; padding:2px 8px; border-radius:20px;
                background:var(--surface-3); color:var(--text-3);
            }
            .atl-badge-pasta { background:rgba(250,204,21,.15); color:#fbbf24; }
            .atl-badge-url { background:rgba(59,130,246,.15); color:#60a5fa; }
            .atl-caminho {
                font-size:11px; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
                color:var(--text-3); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:2px;
            }
            .atl-desc { font-size:11px; color:var(--text-3); margin-top:2px; }
            .atl-icon-btn {
                flex-shrink:0; padding:6px; border-radius:8px; color:var(--text-3);
                background:transparent; border:none; cursor:pointer; transition:all .2s;
            }
            @media (max-width: 900px) { .atl-layout { grid-template-columns:1fr; } }
        `
        document.head.appendChild(st)
    }

    setConteudo(`
        <div class="atl-layout fade-in">

            <!-- Coluna esquerda: formulário -->
            <div class="atl-col">
                <div class="atl-panel">
                    <h3 id="atl-form-titulo" class="atl-title">
                        <svg width="16" height="16" fill="none" stroke="var(--text-3)" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                        Novo Atalho
                    </h3>
                    <div style="display:flex; flex-direction:column; gap:14px;">

                        <div class="atl-field">
                            <label class="atl-label" for="atl-nome">Nome</label>
                            <input id="atl-nome" class="atl-input" type="text" placeholder="Ex: Template Oferta Semanal">
                        </div>

                        <div class="atl-field">
                            <label class="atl-label" for="atl-categoria">Categoria</label>
                            <input id="atl-categoria" class="atl-input" type="text" placeholder="Ex: Photoshop, Planilhas, Documentos" list="atl-cat-sugestoes">
                            <datalist id="atl-cat-sugestoes">
                                ${['Photoshop','Illustrator','Word','Excel','Planilhas','Documentos','Vídeos','Imagens','Pastas','Outros'].map(v => `<option value="${v}"></option>`).join('')}
                            </datalist>
                        </div>

                        <div class="atl-field">
                            <span class="atl-label">Tipo</span>
                            <div class="atl-row">
                                ${[['arquivo','Arquivo'],['pasta','Pasta'],['url','URL']].map(([val, label]) => `
                                    <button type="button" class="atl-tipo-btn" data-tipo="${val}">${label}</button>
                                `).join('')}
                            </div>
                            <input id="atl-tipo" type="hidden" value="arquivo">
                        </div>

                        <div class="atl-field">
                            <label class="atl-label" for="atl-caminho">Caminho / URL</label>
                            <input id="atl-caminho" class="atl-input atl-mono" type="text" placeholder="Ex: D:\\Arquivos\\template.psd">
                            <p class="atl-hint">Cole o caminho completo do arquivo ou pasta</p>
                        </div>

                        <div class="atl-field">
                            <span class="atl-label">Ícone</span>
                            <div class="atl-icones" id="atl-icones-grid">
                                ${ATL_ICONES.map(ic => `
                                    <button type="button" class="atl-icone-btn" data-icone="${ic}">${ic}</button>
                                `).join('')}
                            </div>
                            <input id="atl-icone" type="hidden" value="📄">
                        </div>

                        <div class="atl-field">
                            <label class="atl-label" for="atl-descricao">Descrição</label>
                            <input id="atl-descricao" class="atl-input" type="text" placeholder="Ex: Template de oferta semanal">
                        </div>

                        <p id="atl-msg" class="atl-msg"></p>

                        <div class="atl-actions">
                            <button id="atl-btn-salvar" class="ds-btn ds-btn-primary" style="flex:1;" type="button">
                                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                                Salvar
                            </button>
                            <button id="atl-btn-cancelar" class="ds-btn" style="display:none;" type="button">Cancelar</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Coluna direita: atalhos -->
            <div class="atl-col">

                <!-- Busca -->
                <div class="atl-panel atl-panel-sm">
                    <div class="atl-busca-row">
                        <div class="atl-field" style="flex:1;">
                            <label class="atl-label" for="atl-busca">Buscar</label>
                            <input id="atl-busca" class="atl-input" type="text" placeholder="Nome, categoria ou caminho...">
                        </div>
                        <button id="atl-btn-buscar" class="ds-btn ds-btn-primary" type="button">
                            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Buscar
                        </button>
                    </div>
                </div>

                <!-- Lista -->
                <div id="atl-lista"></div>
            </div>
        </div>
    `, 'Atalhos')

    atlEditandoId = null

    document.querySelectorAll('.atl-tipo-btn').forEach(btn => {
        btn.classList.toggle('ativo', btn.getAttribute('data-tipo') === 'arquivo')
        btn.onclick = () => {
            document.querySelectorAll('.atl-tipo-btn').forEach(b => b.classList.remove('ativo'))
            btn.classList.add('ativo')
            document.getElementById('atl-tipo').value = btn.getAttribute('data-tipo')
            const icones = { arquivo: '📄', pasta: '📁', url: '🌐' }
            atlSelecionarIcone(icones[btn.getAttribute('data-tipo')])
        }
    })

    atlSelecionarIcone('📄')
    document.querySelectorAll('.atl-icone-btn').forEach(btn => {
        btn.onclick = () => atlSelecionarIcone(btn.getAttribute('data-icone'))
    })

    document.getElementById('atl-btn-salvar').onclick   = atlSalvar
    document.getElementById('atl-btn-cancelar').onclick = atlCancelar
    document.getElementById('atl-btn-buscar').onclick   = atlBuscar
    document.getElementById('atl-busca').onkeydown      = e => { if (e.key === 'Enter') atlBuscar() }

    atlBuscar()
}

function atlSelecionarIcone(icone) {
    document.getElementById('atl-icone').value = icone
    document.querySelectorAll('.atl-icone-btn').forEach(btn => {
        btn.classList.toggle('ativo', btn.getAttribute('data-icone') === icone)
    })
}

async function atlSalvar() {
    const nome      = document.getElementById('atl-nome').value.trim()
    const categoria = document.getElementById('atl-categoria').value.trim()
    const tipo      = document.getElementById('atl-tipo').value
    const caminho   = document.getElementById('atl-caminho').value.trim()
    const icone     = document.getElementById('atl-icone').value
    const descricao = document.getElementById('atl-descricao').value.trim()
    const msgEl     = document.getElementById('atl-msg')

    if (!nome)    { msgEl.style.color = 'var(--danger)'; msgEl.textContent = 'Preencha o nome.'; return }
    if (!caminho) { msgEl.style.color = 'var(--danger)'; msgEl.textContent = 'Preencha o caminho.'; return }

    msgEl.style.color = 'var(--text-2)'; msgEl.textContent = 'Salvando...'

    try {
        const url    = API + (atlEditandoId ? `/atalhos/${atlEditandoId}` : '/atalhos')
        const method = atlEditandoId ? 'PUT' : 'POST'
        const res    = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify({ nome, categoria, caminho, tipo, icone, descricao }) })
        if (res.ok) {
            msgEl.style.color = 'var(--ok)'; msgEl.textContent = 'Salvo com sucesso!'
            atlCancelar(); atlBuscar()
            setTimeout(() => { const el = document.getElementById('atl-msg'); if (el) el.textContent = '' }, 2000)
        } else {
            const d = await res.json(); msgEl.style.color = 'var(--danger)'; msgEl.textContent = d.error || 'Erro.'
        }
    } catch { msgEl.style.color = 'var(--danger)'; msgEl.textContent = 'Erro ao conectar.' }
}

function atlCancelar() {
    atlEditandoId = null
    document.getElementById('atl-form-titulo').innerHTML = '<svg width="16" height="16" fill="none" stroke="var(--text-3)" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> Novo Atalho'
    document.getElementById('atl-btn-cancelar').style.display = 'none'
    document.getElementById('atl-btn-salvar').innerHTML = '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Salvar'
    document.getElementById('atl-nome').value        = ''
    document.getElementById('atl-categoria').value   = ''
    document.getElementById('atl-caminho').value     = ''
    document.getElementById('atl-descricao').value   = ''
    document.getElementById('atl-msg').textContent   = ''
    document.querySelectorAll('.atl-tipo-btn').forEach(b => b.classList.remove('ativo'))
    document.querySelector('.atl-tipo-btn[data-tipo="arquivo"]').classList.add('ativo')
    document.getElementById('atl-tipo').value = 'arquivo'
    atlSelecionarIcone('📄')
}

async function atlAbrir(caminho, tipo) {
    try {
        const res = await fetch(API+'/atalhos/abrir', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ caminho, tipo })
        })
        const data = await res.json()
        if (!res.ok) window.aviso('Erro ao abrir: ' + (data.error || 'desconhecido'), { titulo: 'Atalho' })
    } catch (e) {
        window.aviso('Erro ao conectar com o servidor.', { titulo: 'Atalho' })
    }
}

async function atlBuscar() {
    const q    = document.getElementById('atl-busca')?.value.trim() || ''
    const lista = document.getElementById('atl-lista')
    if (!lista) return

    lista.innerHTML = '<p style="text-align:center; color:var(--text-3); font-size:13px; padding:20px 0;">Carregando...</p>'

    try {
        const params = new URLSearchParams()
        if (q) params.append('q', q)

        const res     = await fetch(API+`/atalhos?${params}`, { headers: authHeaders() })
        atalhosCache = await res.json()

        if (!atalhosCache.length) {
            lista.innerHTML = '<p style="text-align:center; color:var(--text-3); font-size:13px; padding:40px 0;">Nenhum atalho cadastrado. Adicione um ao lado!</p>'
            return
        }

        const grupos = {}
        atalhosCache.forEach(a => {
            const cat = a.categoria || 'Geral'
            if (!grupos[cat]) grupos[cat] = []
            grupos[cat].push(a)
        })

        lista.innerHTML = Object.entries(grupos).map(([cat, itens]) => `
            <div class="atl-grupo">
                <p class="atl-grupo-titulo">${cat}</p>
                <div class="atl-itens">
                    ${itens.map(a => {
                        const badgeCls = a.tipo === 'pasta' ? 'atl-badge-pasta' : a.tipo === 'url' ? 'atl-badge-url' : ''
                        const tipoLabel = a.tipo === 'pasta' ? 'Pasta' : a.tipo === 'url' ? 'URL' : 'Arquivo'
                        return `
                        <div class="dash-glass atl-item">
                            <button class="atl-btn-abrir atl-item-icone" data-caminho="${a.caminho}" data-tipo="${a.tipo}" title="Clique para abrir">${a.icone || '📄'}</button>
                            <div class="atl-item-info">
                                <div class="atl-item-nome">
                                    <p class="atl-item-titulo">${a.nome}</p>
                                    <span class="atl-badge ${badgeCls}">${tipoLabel}</span>
                                </div>
                                <p class="atl-caminho" title="${a.caminho}">${a.caminho}</p>
                                ${a.descricao ? `<p class="atl-desc">${a.descricao}</p>` : ''}
                            </div>
                            <button class="atl-btn-abrir ds-btn ds-btn-primary ds-btn-sm" data-caminho="${a.caminho}" data-tipo="${a.tipo}">Abrir</button>
                            <button class="atl-btn-editar atl-icon-btn" data-id="${a.id}" title="Editar">
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="atl-btn-excluir atl-icon-btn" data-id="${a.id}" title="Excluir">
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                            </button>
                        </div>`
                    }).join('')}
                </div>
            </div>
        `).join('')

        lista.querySelectorAll('.atl-btn-abrir').forEach(btn => {
            btn.onclick = () => atlAbrir(btn.getAttribute('data-caminho'), btn.getAttribute('data-tipo'))
        })

        lista.querySelectorAll('.atl-btn-editar').forEach(btn => {
            btn.onmouseover = () => { btn.style.color = '#60a5fa' }
            btn.onmouseout  = () => { btn.style.color = '' }
            btn.onclick = () => {
                const id = parseInt(btn.getAttribute('data-id'))
                const a  = atalhosCache.find(x => x.id === id)
                if (!a) return
                atlEditandoId = id
                document.getElementById('atl-form-titulo').innerHTML = '<svg width="16" height="16" fill="none" stroke="var(--text-3)" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Editando'
                document.getElementById('atl-nome').value        = a.nome
                document.getElementById('atl-categoria').value   = a.categoria || ''
                document.getElementById('atl-caminho').value     = a.caminho
                document.getElementById('atl-descricao').value   = a.descricao || ''
                document.getElementById('atl-tipo').value        = a.tipo || 'arquivo'
                document.getElementById('atl-btn-cancelar').style.display = ''
                document.getElementById('atl-btn-salvar').innerHTML = '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Atualizar'
                document.querySelectorAll('.atl-tipo-btn').forEach(b => b.classList.toggle('ativo', b.getAttribute('data-tipo') === a.tipo))
                atlSelecionarIcone(a.icone || '📄')
                document.getElementById('atl-nome').scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        })

        lista.querySelectorAll('.atl-btn-excluir').forEach(btn => {
            btn.onmouseover = () => { btn.style.color = 'var(--danger)' }
            btn.onmouseout  = () => { btn.style.color = '' }
            btn.onclick = async () => {
                const okExcluir = await avisoConfirmacao('Excluir este atalho?', { titulo: 'Excluir atalho?', tipo: 'aviso', okText: 'Excluir', cancelText: 'Cancelar' })
                if (!okExcluir) return
                await fetch(API+`/atalhos/${btn.getAttribute('data-id')}`, { method: 'DELETE', headers: authHeaders() })
                atlBuscar()
            }
        })

    } catch (e) {
        console.error(e)
        lista.innerHTML = '<p style="text-align:center; color:var(--danger); font-size:13px; padding:40px 0;">Erro ao conectar com o servidor.</p>'
    }
}
