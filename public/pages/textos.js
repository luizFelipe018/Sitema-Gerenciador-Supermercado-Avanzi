let txtEditandoId = null

async function carregarTextos() {
    setActive('btn-textos')
    setConteudo(`
        <div class="dash-glass dash-animate" style="padding:20px; display:grid; grid-template-columns:1fr 2fr; gap:20px;">

            <!-- Coluna esquerda: formulário -->
            <div style="display:flex; flex-direction:column; gap:16px;">
                <div style="padding:20px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px;">
                    <h3 id="txt-form-titulo" style="font-size:14px; font-weight:700; color:rgba(255,255,255,0.8); margin-bottom:16px; display:flex; align-items:center; gap:8px;">
                        <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                        Novo Texto
                    </h3>
                    <div style="display:flex; flex-direction:column; gap:12px;">

                        <div class="flex flex-col gap-1">
                            <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Título</label>
                            <input id="txt-titulo" type="text" placeholder="Ex: Oferta de Frango"
                                style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; width:100%; box-sizing:border-box;"
                                onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                                onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                        </div>

                        <div class="flex flex-col gap-1">
                            <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Categoria</label>
                            <select id="txt-categoria" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; width:100%; box-sizing:border-box; cursor:pointer;">
                                <option value="" style="background:#1a1a2e;">Sem categoria</option>
                                <option value="Rádio" style="background:#1a1a2e;">Rádio</option>
                                <option value="Post" style="background:#1a1a2e;">Post</option>
                                <option value="Legenda" style="background:#1a1a2e;">Legenda</option>
                                <option value="Promoção" style="background:#1a1a2e;">Promoção</option>
                                <option value="Outro" style="background:#1a1a2e;">Outro</option>
                            </select>
                        </div>

                        <div class="flex flex-col gap-1">
                            <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Conteúdo</label>
                            <textarea id="txt-conteudo" rows="7" placeholder="Digite o texto aqui..."
                                style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; width:100%; box-sizing:border-box; resize:none;"
                                onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                                onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'"></textarea>
                        </div>

                        <div class="flex flex-col gap-1">
                            <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Tags</label>
                            <input id="txt-tags" type="text" placeholder="Ex: frango, oferta, promoção"
                                style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; width:100%; box-sizing:border-box;"
                                onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                                onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                            <p style="font-size:10px; color:rgba(255,255,255,0.3);">Separe por vírgula para facilitar a busca</p>
                        </div>

                        <p id="txt-msg" style="font-size:11px; min-height:16px; color:rgba(255,255,255,0.3);"></p>

                        <div class="flex gap-2">
                            <button id="txt-btn-salvar" style="flex:1; padding:12px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; justify-content:center; gap:6px;">
                                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                                Salvar
                            </button>
                            <button id="txt-btn-cancelar" style="padding:12px 16px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; font-weight:600; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.04); transition:all 0.3s; display:none;">
                                Cancelar
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            <!-- Coluna direita: lista e busca -->
            <div style="display:flex; flex-direction:column; gap:16px;">

                <!-- Busca e filtros -->
                <div style="padding:16px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px;">
                    <div class="flex gap-3 flex-wrap items-end" style="display:flex; gap:12px; flex-wrap:wrap; align-items:end;">
                        <div class="flex flex-col gap-1 flex-1" style="flex:1; min-width:180px;">
                            <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Buscar</label>
                            <input id="txt-busca" type="text" placeholder="Título, conteúdo ou tag..."
                                style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; width:100%; box-sizing:border-box;"
                                onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                                onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                        </div>
                        <div class="flex flex-col gap-1">
                            <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Categoria</label>
                            <select id="txt-filtro-cat" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; cursor:pointer;">
                                <option value="" style="background:#1a1a2e;">Todas</option>
                                <option value="Rádio" style="background:#1a1a2e;">Rádio</option>
                                <option value="Post" style="background:#1a1a2e;">Post</option>
                                <option value="Legenda" style="background:#1a1a2e;">Legenda</option>
                                <option value="Promoção" style="background:#1a1a2e;">Promoção</option>
                                <option value="Outro" style="background:#1a1a2e;">Outro</option>
                            </select>
                        </div>
                        <button id="txt-btn-buscar" style="padding:10px 20px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; gap:6px;">
                            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Buscar
                        </button>
                    </div>
                </div>

                <!-- Resultados -->
                <div id="txt-lista"></div>

            </div>
        </div>
    `, 'Textos & Roteiros')

    txtEditandoId = null

    document.getElementById('txt-btn-salvar').onclick  = txtSalvar
    document.getElementById('txt-btn-cancelar').onclick = txtCancelarEdicao
    document.getElementById('txt-btn-buscar').onclick  = txtBuscar
    document.getElementById('txt-busca').onkeydown     = (e) => { if (e.key === 'Enter') txtBuscar() }
    document.getElementById('txt-filtro-cat').onchange = txtBuscar
    document.getElementById('txt-titulo').onkeydown    = (e) => { if (e.key === 'Enter') document.getElementById('txt-conteudo').focus() }

    await txtBuscar()
}

async function txtSalvar() {
    const titulo    = document.getElementById('txt-titulo').value.trim()
    const categoria = document.getElementById('txt-categoria').value
    const conteudo  = document.getElementById('txt-conteudo').value.trim()
    const tags      = document.getElementById('txt-tags').value.trim()
    const msgEl     = document.getElementById('txt-msg')

    if (!titulo)   { msgEl.style.color = '#ef4444'; msgEl.textContent = 'Preencha o título.'; return }
    if (!conteudo) { msgEl.style.color = '#ef4444'; msgEl.textContent = 'Preencha o conteúdo.'; return }

    msgEl.style.color = 'rgba(255,255,255,0.4)'; msgEl.textContent = 'Salvando...'

    try {
        const url    = txtEditandoId ? `${API}/textos/${txtEditandoId}` : `${API}/textos`
        const method = txtEditandoId ? 'PUT' : 'POST'
        const res    = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify({ titulo, categoria, conteudo, tags }) })

        if (res.ok) {
            msgEl.style.color = '#22c55e'
            msgEl.textContent = txtEditandoId ? 'Atualizado com sucesso!' : 'Salvo com sucesso!'
            txtLimparForm()
            await txtBuscar()
            setTimeout(() => { if (document.getElementById('txt-msg')) document.getElementById('txt-msg').textContent = '' }, 3000)
        } else {
            const data = await res.json()
            msgEl.style.color = '#ef4444'; msgEl.textContent = data.error || 'Erro ao salvar.'
        }
    } catch { msgEl.style.color = '#ef4444'; msgEl.textContent = 'Erro ao conectar.' }
}

function txtLimparForm() {
    document.getElementById('txt-titulo').value    = ''
    document.getElementById('txt-categoria').value = ''
    document.getElementById('txt-conteudo').value  = ''
    document.getElementById('txt-tags').value      = ''
    txtCancelarEdicao()
}

function txtCancelarEdicao() {
    txtEditandoId = null
    document.getElementById('txt-form-titulo').innerHTML = '<svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> Novo Texto'
    document.getElementById('txt-btn-cancelar').style.display = 'none'
    document.getElementById('txt-btn-salvar').innerHTML = '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Salvar'
    document.getElementById('txt-titulo').value    = ''
    document.getElementById('txt-categoria').value = ''
    document.getElementById('txt-conteudo').value  = ''
    document.getElementById('txt-tags').value      = ''
    document.getElementById('txt-msg').textContent = ''
}

async function txtBuscar() {
    const q        = document.getElementById('txt-busca')?.value.trim() || ''
    const cat      = document.getElementById('txt-filtro-cat')?.value || ''
    const listaEl  = document.getElementById('txt-lista')
    if (!listaEl) return

    listaEl.innerHTML = `<p style="text-align:center; color:rgba(255,255,255,0.3); font-size:13px; padding:20px 0;">Carregando...</p>`

    try {
        const params = new URLSearchParams()
        if (q)   params.append('q', q)
        if (cat) params.append('categoria', cat)

        const res    = await fetch(API+`/textos?${params}`, { headers: authHeaders() })
        const textos = await res.json()

        if (!textos.length) {
            listaEl.innerHTML = `<p style="text-align:center; color:rgba(255,255,255,0.3); font-size:13px; padding:40px 0;">Nenhum texto encontrado.</p>`
            return
        }

        const catCores = {
            'Rádio':    ['rgba(250,204,21,0.15)','#fbbf24'],
            'Post':     ['rgba(59,130,246,0.15)','#60a5fa'],
            'Legenda':  ['rgba(139,92,246,0.15)','#a78bfa'],
            'Promoção': ['rgba(34,197,94,0.15)','#4ade80'],
            'Outro':    ['rgba(255,255,255,0.05)','rgba(255,255,255,0.4)'],
        }

        listaEl.innerHTML = textos.map(t => {
            const [bg, color] = catCores[t.categoria] || ['rgba(255,255,255,0.05)','rgba(255,255,255,0.4)']
            const tags = t.tags ? t.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
            const dt   = new Date(t.atualizado_em).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit' })

            return `
                <div class="dash-glass" style="padding:0; margin-bottom:12px; overflow:hidden;" data-id="${t.id}">
                    <div style="padding:14px 16px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:start; justify-content:space-between; gap:12px;">
                        <div class="flex items-center gap-2 flex-1 min-w-0" style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
                            ${t.categoria ? `<span style="font-size:10px; font-weight:700; padding:3px 8px; border-radius:20px; background:${bg}; color:${color}; flex-shrink:0;">${t.categoria}</span>` : ''}
                            <h4 style="font-weight:700; color:rgba(255,255,255,0.85); font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${t.titulo}</h4>
                        </div>
                        <div class="flex items-center gap-1 flex-shrink-0" style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
                            <span style="font-size:10px; color:rgba(255,255,255,0.3);">${dt}</span>
                            <button class="txt-btn-editar" style="padding:4px; border-radius:6px; color:rgba(255,255,255,0.3); background:transparent; cursor:pointer; transition:all 0.2s;" data-id="${t.id}" title="Editar">
                                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="txt-btn-excluir" style="padding:4px; border-radius:6px; color:rgba(255,255,255,0.3); background:transparent; cursor:pointer; transition:all 0.2s;" data-id="${t.id}" title="Excluir">
                                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                            </button>
                        </div>
                    </div>
                    <div style="padding:14px 16px;">
                        <p style="font-size:13px; color:rgba(255,255,255,0.7); line-height:1.6; white-space:pre-wrap;">${t.conteudo}</p>
                    </div>
                    ${tags.length ? `
                    <div style="padding:0 16px 14px; display:flex; flex-wrap:wrap; gap:4px;">
                        ${tags.map(tag => `<span style="font-size:10px; padding:3px 8px; border-radius:20px; background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.4);">#${tag}</span>`).join('')}
                    </div>` : ''}
                    <div style="padding:0 16px 14px;">
                        <button class="txt-btn-copiar" style="width:100%; padding:8px; font-size:11px; font-weight:600; border-radius:8px; border:1px solid rgba(255,255,255,0.08); color:rgba(255,255,255,0.4); background:rgba(255,255,255,0.04); cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:6px;"
                            data-conteudo="${encodeURIComponent(t.conteudo)}">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                            Copiar texto
                        </button>
                    </div>
                </div>
            `
        }).join('')

        listaEl.querySelectorAll('.txt-btn-copiar').forEach(btn => {
            btn.onmouseover = () => { btn.style.borderColor = 'rgba(34,197,94,0.3)'; btn.style.color = '#4ade80' }
            btn.onmouseout = () => { btn.style.borderColor = ''; btn.style.color = '' }
            btn.onclick = () => {
                const texto = decodeURIComponent(btn.getAttribute('data-conteudo'))
                const ta = document.createElement('textarea')
                ta.value = texto
                document.body.appendChild(ta)
                ta.select()
                document.execCommand('copy')
                document.body.removeChild(ta)
                const orig = btn.innerHTML
                btn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Copiado!'
                btn.style.background = 'rgba(34,197,94,0.1)'
                btn.style.color = '#4ade80'
                btn.style.borderColor = 'rgba(34,197,94,0.3)'
                setTimeout(() => {
                    btn.innerHTML = orig
                    btn.style.background = ''
                    btn.style.color = ''
                    btn.style.borderColor = ''
                }, 1500)
            }
        })

        listaEl.querySelectorAll('.txt-btn-editar').forEach(btn => {
            btn.onmouseover = () => { btn.style.color = '#60a5fa'; btn.style.background = 'rgba(59,130,246,0.1)' }
            btn.onmouseout = () => { btn.style.color = ''; btn.style.background = '' }
            btn.onclick = () => {
                const id    = parseInt(btn.getAttribute('data-id'))
                const texto = textos.find(t => t.id === id)
                if (!texto) return
                txtEditandoId = id
                document.getElementById('txt-form-titulo').innerHTML = '<svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Editando'
                document.getElementById('txt-titulo').value    = texto.titulo
                document.getElementById('txt-categoria').value = texto.categoria || ''
                document.getElementById('txt-conteudo').value  = texto.conteudo
                document.getElementById('txt-tags').value      = texto.tags || ''
                document.getElementById('txt-btn-cancelar').style.display = 'block'
                document.getElementById('txt-btn-salvar').innerHTML = '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Atualizar'
                document.getElementById('txt-titulo').focus()
                document.getElementById('txt-titulo').scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        })

        listaEl.querySelectorAll('.txt-btn-excluir').forEach(btn => {
            btn.onmouseover = () => { btn.style.color = '#ef4444'; btn.style.background = 'rgba(239,68,68,0.1)' }
            btn.onmouseout = () => { btn.style.color = ''; btn.style.background = '' }
            btn.onclick = async () => {
                const okExcluir = await avisoConfirmacao('Excluir este texto?', { titulo: 'Excluir texto?', tipo: 'aviso', okText: 'Excluir', cancelText: 'Cancelar' })
                if (!okExcluir) return
                const id = btn.getAttribute('data-id')
                await fetch(API+`/textos/${id}`, { method:'DELETE', headers: authHeaders() })
                await txtBuscar()
            }
        })

    } catch (e) {
        console.error(e)
        listaEl.innerHTML = `<p style="text-align:center; color:#ef4444; font-size:13px; padding:40px 0;">Erro ao conectar com o servidor.</p>`
    }
}
