let atlEditandoId = null

const ATL_ICONES = ['📁','📄','🖼️','🎨','📊','📝','🎬','🎵','🔧','⚙️','🌐','📧','💼','🖥️','📱','🗂️','📦','🔗']

function carregarAtalhos() {
    setActive('btn-atalhos')
    setConteudo(`
        <div class="dash-glass dash-animate" style="padding:20px; display:grid; grid-template-columns:1fr 2fr; gap:20px;">

            <!-- Coluna esquerda: formulário -->
            <div style="display:flex; flex-direction:column; gap:16px;">
                <div style="padding:20px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px;">
                    <h3 id="atl-form-titulo" style="font-size:14px; font-weight:700; color:rgba(255,255,255,0.8); margin-bottom:16px; display:flex; align-items:center; gap:8px;">
                        <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                        Novo Atalho
                    </h3>
                    <div style="display:flex; flex-direction:column; gap:12px;">

                        <div class="flex flex-col gap-1">
                            <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Nome</label>
                            <input id="atl-nome" type="text" placeholder="Ex: Template Oferta Semanal"
                                style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; width:100%; box-sizing:border-box;"
                                onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                                onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                        </div>

                        <div class="flex flex-col gap-1">
                            <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Categoria</label>
                            <input id="atl-categoria" type="text" placeholder="Ex: Photoshop, Planilhas, Documentos"
                                style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; width:100%; box-sizing:border-box;"
                                onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                                onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'"
                                list="atl-cat-sugestoes">
                            <datalist id="atl-cat-sugestoes">
                                <option value="Photoshop"><option value="Illustrator"><option value="Word"><option value="Excel"><option value="Planilhas"><option value="Documentos"><option value="Vídeos"><option value="Imagens"><option value="Pastas"><option value="Outros">
                            </datalist>
                        </div>

                        <div class="flex flex-col gap-1">
                            <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Tipo</label>
                            <div class="flex gap-2">
                                ${[['arquivo','Arquivo'],['pasta','Pasta'],['url','URL']].map(([val, label]) => `
                                    <button class="atl-tipo-btn" data-tipo="${val}"
                                        style="flex:1; padding:8px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:11px; font-weight:600; color:rgba(255,255,255,0.5); background:rgba(255,255,255,0.04); cursor:pointer; transition:all 0.2s;">
                                        ${label}
                                    </button>
                                `).join('')}
                            </div>
                            <input id="atl-tipo" type="hidden" value="arquivo">
                        </div>

                        <div class="flex flex-col gap-1">
                            <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Caminho / URL</label>
                            <input id="atl-caminho" type="text" placeholder="Ex: D:\\Arquivos\\template.psd"
                                style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; width:100%; box-sizing:border-box; font-family:monospace;"
                                onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                                onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                            <p style="font-size:10px; color:rgba(255,255,255,0.3);">Cole o caminho completo do arquivo ou pasta</p>
                        </div>

                        <div class="flex flex-col gap-1">
                            <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Ícone</label>
                            <div class="flex flex-wrap gap-1" id="atl-icones-grid">
                                ${ATL_ICONES.map(ic => `
                                    <button class="atl-icone-btn" data-icone="${ic}"
                                        style="width:36px; height:36px; font-size:16px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; background:rgba(255,255,255,0.04); cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center;">${ic}</button>
                                `).join('')}
                            </div>
                            <input id="atl-icone" type="hidden" value="📄">
                        </div>

                        <div class="flex flex-col gap-1">
                            <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Descrição</label>
                            <input id="atl-descricao" type="text" placeholder="Ex: Template de oferta semanal"
                                style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; width:100%; box-sizing:border-box;"
                                onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                                onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                        </div>

                        <p id="atl-msg" style="font-size:11px; min-height:16px; color:rgba(255,255,255,0.3);"></p>

                        <div class="flex gap-2">
                            <button id="atl-btn-salvar" style="flex:1; padding:12px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; justify-content:center; gap:6px;">
                                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                                Salvar
                            </button>
                            <button id="atl-btn-cancelar" style="padding:12px 16px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; font-weight:600; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.04); transition:all 0.3s; display:none;">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Coluna direita: atalhos -->
            <div style="display:flex; flex-direction:column; gap:16px;">

                <!-- Busca -->
                <div style="padding:16px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px;">
                    <div class="flex gap-3 items-end" style="display:flex; gap:12px; align-items:end;">
                        <div class="flex flex-col gap-1 flex-1" style="flex:1;">
                            <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Buscar</label>
                            <input id="atl-busca" type="text" placeholder="Nome, categoria ou caminho..."
                                style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; width:100%; box-sizing:border-box;"
                                onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                                onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                        </div>
                        <button id="atl-btn-buscar" style="padding:10px 20px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; gap:6px;">
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
        if (btn.getAttribute('data-tipo') === 'arquivo') {
            btn.style.borderColor = 'rgba(181,21,21,0.5)'
            btn.style.color = '#b51515'
            btn.style.background = 'rgba(181,21,21,0.1)'
        }
        btn.onclick = () => {
            document.querySelectorAll('.atl-tipo-btn').forEach(b => {
                b.style.borderColor = 'rgba(255,255,255,0.08)'
                b.style.color = 'rgba(255,255,255,0.5)'
                b.style.background = 'rgba(255,255,255,0.04)'
            })
            btn.style.borderColor = 'rgba(181,21,21,0.5)'
            btn.style.color = '#b51515'
            btn.style.background = 'rgba(181,21,21,0.1)'
            document.getElementById('atl-tipo').value = btn.getAttribute('data-tipo')
            const icones = { arquivo: '📄', pasta: '📁', url: '🌐' }
            const tipo = btn.getAttribute('data-tipo')
            atlSelecionarIcone(icones[tipo])
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
        const ativo = btn.getAttribute('data-icone') === icone
        btn.style.borderColor = ativo ? 'rgba(181,21,21,0.5)' : 'rgba(255,255,255,0.08)'
        btn.style.background = ativo ? 'rgba(181,21,21,0.1)' : 'rgba(255,255,255,0.04)'
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

    if (!nome)    { msgEl.style.color = '#ef4444'; msgEl.textContent = 'Preencha o nome.'; return }
    if (!caminho) { msgEl.style.color = '#ef4444'; msgEl.textContent = 'Preencha o caminho.'; return }

    msgEl.style.color = 'rgba(255,255,255,0.4)'; msgEl.textContent = 'Salvando...'

    try {
        const url    = atlEditandoId ? `/atalhos/${atlEditandoId}` : '/atalhos'
        const method = atlEditandoId ? 'PUT' : 'POST'
        const res    = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify({ nome, categoria, caminho, tipo, icone, descricao }) })
        if (res.ok) {
            msgEl.style.color = '#22c55e'; msgEl.textContent = 'Salvo com sucesso!'
            atlCancelar(); atlBuscar()
            setTimeout(() => { if (document.getElementById('atl-msg')) document.getElementById('atl-msg').textContent = '' }, 2000)
        } else {
            const d = await res.json(); msgEl.style.color = '#ef4444'; msgEl.textContent = d.error || 'Erro.'
        }
    } catch { msgEl.style.color = '#ef4444'; msgEl.textContent = 'Erro ao conectar.' }
}

function atlCancelar() {
    atlEditandoId = null
    document.getElementById('atl-form-titulo').innerHTML = '<svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> Novo Atalho'
    document.getElementById('atl-btn-cancelar').style.display   = 'none'
    document.getElementById('atl-btn-salvar').innerHTML       = '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Salvar'
    document.getElementById('atl-nome').value                   = ''
    document.getElementById('atl-categoria').value              = ''
    document.getElementById('atl-caminho').value                = ''
    document.getElementById('atl-descricao').value              = ''
    document.getElementById('atl-msg').textContent              = ''
    document.querySelectorAll('.atl-tipo-btn').forEach(b => {
        b.style.borderColor = 'rgba(255,255,255,0.08)'
        b.style.color = 'rgba(255,255,255,0.5)'
        b.style.background = 'rgba(255,255,255,0.04)'
    })
    document.querySelector('.atl-tipo-btn[data-tipo="arquivo"]').style.borderColor = 'rgba(181,21,21,0.5)'
    document.querySelector('.atl-tipo-btn[data-tipo="arquivo"]').style.color = '#b51515'
    document.querySelector('.atl-tipo-btn[data-tipo="arquivo"]').style.background = 'rgba(181,21,21,0.1)'
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
        if (!res.ok) alert('Erro ao abrir: ' + (data.error || 'desconhecido'))
    } catch (e) {
        alert('Erro ao conectar com o servidor.')
    }
}

async function atlBuscar() {
    const q    = document.getElementById('atl-busca')?.value.trim() || ''
    const lista = document.getElementById('atl-lista')
    if (!lista) return

    lista.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.3); font-size:13px; padding:20px 0;">Carregando...</p>'

    try {
        const params = new URLSearchParams()
        if (q) params.append('q', q)

        const res     = await fetch(API+`/atalhos?${params}`, { headers: authHeaders() })
        const atalhos = await res.json()

        if (!atalhos.length) {
            lista.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.3); font-size:13px; padding:40px 0;">Nenhum atalho cadastrado. Adicione um ao lado!</p>'
            return
        }

        const grupos = {}
        atalhos.forEach(a => {
            const cat = a.categoria || 'Geral'
            if (!grupos[cat]) grupos[cat] = []
            grupos[cat].push(a)
        })

        lista.innerHTML = Object.entries(grupos).map(([cat, itens]) => `
            <div style="margin-bottom:20px;">
                <p style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3); margin-bottom:8px;">${cat}</p>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    ${itens.map(a => {
                        const tipoCor = a.tipo === 'pasta' ? 'rgba(250,204,21,0.15)' : a.tipo === 'url' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)'
                        const tipoClr = a.tipo === 'pasta' ? '#fbbf24' : a.tipo === 'url' ? '#60a5fa' : 'rgba(255,255,255,0.4)'
                        const tipoLabel = a.tipo === 'pasta' ? 'Pasta' : a.tipo === 'url' ? 'URL' : 'Arquivo'
                        return `
                        <div class="dash-glass" style="padding:14px 16px; display:flex; align-items:center; gap:12px; transition:all 0.2s;"
                            onmouseover="this.style.borderColor='rgba(255,255,255,0.1)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'">
                            <button class="atl-btn-abrir" style="flex-shrink:0; width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); cursor:pointer; transition:all 0.2s;"
                                data-caminho="${a.caminho}" data-tipo="${a.tipo}" title="Clique para abrir">
                                ${a.icone || '📄'}
                            </button>
                            <div style="flex:1; min-width:0;">
                                <div class="flex items-center gap-2" style="display:flex; align-items:center; gap:8px;">
                                    <p style="font-weight:600; color:rgba(255,255,255,0.85); font-size:13px;">${a.nome}</p>
                                    <span style="font-size:10px; font-weight:600; padding:2px 8px; border-radius:20px; background:${tipoCor}; color:${tipoClr};">${tipoLabel}</span>
                                </div>
                                <p style="font-size:11px; font-family:monospace; color:rgba(255,255,255,0.3); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:2px;" title="${a.caminho}">${a.caminho}</p>
                                ${a.descricao ? `<p style="font-size:11px; color:rgba(255,255,255,0.3); margin-top:2px;">${a.descricao}</p>` : ''}
                            </div>
                            <button class="atl-btn-abrir" style="flex-shrink:0; padding:8px 16px; border:none; border-radius:8px; font-size:11px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); transition:all 0.2s;"
                                data-caminho="${a.caminho}" data-tipo="${a.tipo}">
                                Abrir
                            </button>
                            <button class="atl-btn-editar" style="flex-shrink:0; padding:6px; border-radius:8px; color:rgba(255,255,255,0.3); background:transparent; cursor:pointer; transition:all 0.2s;" data-id="${a.id}" title="Editar">
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="atl-btn-excluir" style="flex-shrink:0; padding:6px; border-radius:8px; color:rgba(255,255,255,0.3); background:transparent; cursor:pointer; transition:all 0.2s;" data-id="${a.id}" title="Excluir">
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                            </button>
                        </div>`
                    }).join('')}
                </div>
            </div>
        `).join('')

        lista.querySelectorAll('.atl-btn-abrir').forEach(btn => {
            btn.onmouseover = () => { if (btn.textContent.trim() === 'Abrir') { btn.style.transform = 'translateY(-1px)'; btn.style.boxShadow = '0 4px 12px rgba(181,21,21,0.3)' } }
            btn.onmouseout = () => { btn.style.transform = ''; btn.style.boxShadow = '' }
            btn.onclick = () => atlAbrir(btn.getAttribute('data-caminho'), btn.getAttribute('data-tipo'))
        })

        lista.querySelectorAll('.atl-btn-editar').forEach(btn => {
            btn.onmouseover = () => { btn.style.color = '#60a5fa'; btn.style.background = 'rgba(59,130,246,0.1)' }
            btn.onmouseout = () => { btn.style.color = ''; btn.style.background = '' }
            btn.onclick = () => {
                const id = parseInt(btn.getAttribute('data-id'))
                const a  = atalhos.find(x => x.id === id)
                if (!a) return
                atlEditandoId = id
                document.getElementById('atl-form-titulo').innerHTML = '<svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Editando'
                document.getElementById('atl-nome').value                   = a.nome
                document.getElementById('atl-categoria').value              = a.categoria || ''
                document.getElementById('atl-caminho').value                = a.caminho
                document.getElementById('atl-descricao').value              = a.descricao || ''
                document.getElementById('atl-tipo').value                   = a.tipo || 'arquivo'
                document.getElementById('atl-btn-cancelar').style.display   = 'block'
                document.getElementById('atl-btn-salvar').innerHTML       = '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Atualizar'
                document.querySelectorAll('.atl-tipo-btn').forEach(b => {
                    const ativo = b.getAttribute('data-tipo') === a.tipo
                    b.style.borderColor = ativo ? 'rgba(181,21,21,0.5)' : 'rgba(255,255,255,0.08)'
                    b.style.color = ativo ? '#b51515' : 'rgba(255,255,255,0.5)'
                    b.style.background = ativo ? 'rgba(181,21,21,0.1)' : 'rgba(255,255,255,0.04)'
                })
                atlSelecionarIcone(a.icone || '📄')
                document.getElementById('atl-nome').scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        })

        lista.querySelectorAll('.atl-btn-excluir').forEach(btn => {
            btn.onmouseover = () => { btn.style.color = '#ef4444'; btn.style.background = 'rgba(239,68,68,0.1)' }
            btn.onmouseout = () => { btn.style.color = ''; btn.style.background = '' }
            btn.onclick = async () => {
                if (!confirm('Excluir este atalho?')) return
                await fetch(API+`/atalhos/${btn.getAttribute('data-id')}`, { method: 'DELETE', headers: authHeaders() })
                atlBuscar()
            }
        })

    } catch (e) {
        console.error(e)
        lista.innerHTML = '<p style="text-align:center; color:#ef4444; font-size:13px; padding:40px 0;">Erro ao conectar com o servidor.</p>'
    }
}
