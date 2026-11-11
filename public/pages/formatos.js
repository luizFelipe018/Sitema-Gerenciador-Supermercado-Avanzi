let fmtEditandoId = null

const FMT_CATEGORIAS = ['Instagram','Facebook','YouTube','LinkedIn','WhatsApp','Web','Email','Impresso','Outro']

const FMT_CAT_CORES = {
    'Instagram': ['#fce7f3','#be185d','📸'],
    'Facebook':  ['#dbeafe','#1d4ed8','👥'],
    'YouTube':   ['#fee2e2','#dc2626','▶️'],
    'LinkedIn':  ['#dbeafe','#0369a1','💼'],
    'WhatsApp':  ['#dcfce7','#16a34a','💬'],
    'Web':       ['#f3e8ff','#7c3aed','🌐'],
    'Email':     ['#fef3c7','#92400e','📧'],
    'Impresso':  ['#f3f4f6','#374151','🖨️'],
    'Outro':     ['#f3f4f6','#6b7280','📐'],
}

function carregarFormatos() {
    setActive('btn-formatos')
    setConteudo(`
        <div class="dash-glass dash-animate" style="padding:20px; display:grid; grid-template-columns:1fr 2fr; gap:20px;">

            <!-- Coluna esquerda: formulário -->
            <div style="display:flex; flex-direction:column; gap:16px;">
                <div style="padding:20px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px;">
                    <h3 id="fmt-form-titulo" style="font-size:14px; font-weight:700; color:rgba(255,255,255,0.8); margin-bottom:16px; display:flex; align-items:center; gap:8px;">
                        <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                        Novo Formato
                    </h3>
                    <div style="display:flex; flex-direction:column; gap:12px;">

                        <div class="flex flex-col gap-1">
                            <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Nome</label>
                            <input id="fmt-nome" type="text" placeholder="Ex: Post Stories"
                                style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; width:100%; box-sizing:border-box;"
                                onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                                onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                        </div>

                        <div class="flex flex-col gap-1">
                            <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Categoria</label>
                            <select id="fmt-categoria" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; width:100%; box-sizing:border-box; cursor:pointer;">
                                <option value="" style="background:#1a1a2e;">Selecione...</option>
                                ${FMT_CATEGORIAS.map(c => `<option value="${c}" style="background:#1a1a2e;">${c}</option>`).join('')}
                            </select>
                        </div>

                        <div class="flex gap-2">
                            <div class="flex flex-col gap-1 flex-1">
                                <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Largura</label>
                                <input id="fmt-largura" type="number" placeholder="1080"
                                    style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; width:100%; box-sizing:border-box;"
                                    onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                                    onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                            </div>
                            <div class="flex flex-col gap-1 flex-1">
                                <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Altura</label>
                                <input id="fmt-altura" type="number" placeholder="1080"
                                    style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; width:100%; box-sizing:border-box;"
                                    onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                                    onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                            </div>
                            <div class="flex flex-col gap-1" style="width:70px">
                                <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Unidade</label>
                                <select id="fmt-unidade" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 8px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; cursor:pointer;">
                                    <option value="px" style="background:#1a1a2e;">px</option>
                                    <option value="cm" style="background:#1a1a2e;">cm</option>
                                    <option value="mm" style="background:#1a1a2e;">mm</option>
                                    <option value="in" style="background:#1a1a2e;">pol</option>
                                </select>
                            </div>
                        </div>

                        <div class="flex flex-col gap-1">
                            <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Orientação</label>
                            <div class="flex gap-2">
                                ${['Quadrado','Retrato','Paisagem'].map(o => `
                                    <button class="fmt-orient-btn flex-1 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-all" data-orient="${o}"
                                        style="padding:8px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:11px; font-weight:600; color:rgba(255,255,255,0.5); background:rgba(255,255,255,0.04); cursor:pointer; transition:all 0.2s;">
                                        ${o}
                                    </button>
                                `).join('')}
                            </div>
                            <input id="fmt-orientacao" type="hidden" value="">
                        </div>

                        <div class="flex flex-col gap-1">
                            <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Descrição</label>
                            <textarea id="fmt-descricao" rows="2" placeholder="Ex: Post padrão feed Instagram"
                                style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; width:100%; box-sizing:border-box; resize:none;"
                                onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                                onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'"></textarea>
                        </div>

                        <p id="fmt-msg" style="font-size:11px; min-height:16px; color:rgba(255,255,255,0.3);"></p>

                        <div class="flex gap-2">
                            <button id="fmt-btn-salvar" style="flex:1; padding:12px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; justify-content:center; gap:6px;">
                                <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                                Salvar
                            </button>
                            <button id="fmt-btn-cancelar" style="padding:12px 16px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; font-weight:600; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.04); transition:all 0.3s; display:none;">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Coluna direita: lista -->
            <div style="display:flex; flex-direction:column; gap:16px;">

                <!-- Busca e filtro -->
                <div style="padding:16px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px;">
                    <div class="flex gap-3 flex-wrap items-end" style="display:flex; gap:12px; flex-wrap:wrap; align-items:end;">
                        <div class="flex flex-col gap-1 flex-1" style="flex:1; min-width:160px;">
                            <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Buscar</label>
                            <input id="fmt-busca" type="text" placeholder="Nome ou descrição..."
                                style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; width:100%; box-sizing:border-box;"
                                onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                                onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                        </div>
                        <div class="flex flex-col gap-1">
                            <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Categoria</label>
                            <select id="fmt-filtro-cat" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s; cursor:pointer;">
                                <option value="" style="background:#1a1a2e;">Todas</option>
                                ${FMT_CATEGORIAS.map(c => `<option value="${c}" style="background:#1a1a2e;">${c}</option>`).join('')}
                            </select>
                        </div>
                        <button id="fmt-btn-buscar" style="padding:10px 20px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; gap:6px;">
                            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Buscar
                        </button>
                    </div>
                </div>

                <!-- Lista por categoria -->
                <div id="fmt-lista"></div>
            </div>
        </div>
    `, 'Formatos & Medidas')

    fmtEditandoId = null

    document.querySelectorAll('.fmt-orient-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.fmt-orient-btn').forEach(b => {
                b.style.borderColor = 'rgba(255,255,255,0.08)'
                b.style.color = 'rgba(255,255,255,0.5)'
                b.style.background = 'rgba(255,255,255,0.04)'
            })
            btn.style.borderColor = 'rgba(181,21,21,0.5)'
            btn.style.color = '#b51515'
            btn.style.background = 'rgba(181,21,21,0.1)'
            document.getElementById('fmt-orientacao').value = btn.getAttribute('data-orient')
        }
    })

    const autoOrient = () => {
        const l = parseInt(document.getElementById('fmt-largura').value) || 0
        const a = parseInt(document.getElementById('fmt-altura').value) || 0
        if (!l || !a) return
        const orient = l === a ? 'Quadrado' : l > a ? 'Paisagem' : 'Retrato'
        document.getElementById('fmt-orientacao').value = orient
        document.querySelectorAll('.fmt-orient-btn').forEach(btn => {
            const ativo = btn.getAttribute('data-orient') === orient
            btn.style.borderColor = ativo ? 'rgba(181,21,21,0.5)' : 'rgba(255,255,255,0.08)'
            btn.style.color = ativo ? '#b51515' : 'rgba(255,255,255,0.5)'
            btn.style.background = ativo ? 'rgba(181,21,21,0.1)' : 'rgba(255,255,255,0.04)'
        })
    }
    document.getElementById('fmt-largura').oninput = autoOrient
    document.getElementById('fmt-altura').oninput  = autoOrient

    document.getElementById('fmt-btn-salvar').onclick   = fmtSalvar
    document.getElementById('fmt-btn-cancelar').onclick = fmtCancelar
    document.getElementById('fmt-btn-buscar').onclick   = fmtBuscar
    document.getElementById('fmt-busca').onkeydown      = e => { if (e.key === 'Enter') fmtBuscar() }
    document.getElementById('fmt-filtro-cat').onchange  = fmtBuscar

    fmtBuscar()
}

async function fmtSalvar() {
    const nome       = document.getElementById('fmt-nome').value.trim()
    const categoria  = document.getElementById('fmt-categoria').value
    const largura    = document.getElementById('fmt-largura').value
    const altura     = document.getElementById('fmt-altura').value
    const unidade    = document.getElementById('fmt-unidade').value
    const orientacao = document.getElementById('fmt-orientacao').value
    const descricao  = document.getElementById('fmt-descricao').value.trim()
    const msgEl      = document.getElementById('fmt-msg')

    if (!nome) { msgEl.style.color = '#ef4444'; msgEl.textContent = 'Preencha o nome.'; return }

    msgEl.style.color = 'rgba(255,255,255,0.4)'; msgEl.textContent = 'Salvando...'

    try {
        const url    = fmtEditandoId ? `/formatos/${fmtEditandoId}` : '/formatos'
        const method = fmtEditandoId ? 'PUT' : 'POST'
        const res    = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify({ nome, categoria, largura: largura||null, altura: altura||null, unidade, orientacao, descricao }) })
        if (res.ok) {
            msgEl.style.color = '#22c55e'; msgEl.textContent = 'Salvo com sucesso!'
            fmtCancelar()
            fmtBuscar()
            setTimeout(() => { if (document.getElementById('fmt-msg')) document.getElementById('fmt-msg').textContent = '' }, 2000)
        } else {
            const d = await res.json(); msgEl.style.color = '#ef4444'; msgEl.textContent = d.error || 'Erro.'
        }
    } catch { msgEl.style.color = '#ef4444'; msgEl.textContent = 'Erro ao conectar.' }
}

function fmtCancelar() {
    fmtEditandoId = null
    document.getElementById('fmt-form-titulo').innerHTML = '<svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> Novo Formato'
    document.getElementById('fmt-btn-cancelar').style.display = 'none'
    document.getElementById('fmt-btn-salvar').innerHTML = '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Salvar'
    document.getElementById('fmt-nome').value = ''
    document.getElementById('fmt-categoria').value = ''
    document.getElementById('fmt-largura').value = ''
    document.getElementById('fmt-altura').value = ''
    document.getElementById('fmt-unidade').value = 'px'
    document.getElementById('fmt-orientacao').value = ''
    document.getElementById('fmt-descricao').value = ''
    document.getElementById('fmt-msg').textContent = ''
    document.querySelectorAll('.fmt-orient-btn').forEach(b => {
        b.style.borderColor = 'rgba(255,255,255,0.08)'
        b.style.color = 'rgba(255,255,255,0.5)'
        b.style.background = 'rgba(255,255,255,0.04)'
    })
}

async function fmtBuscar() {
    const q      = document.getElementById('fmt-busca')?.value.trim() || ''
    const cat    = document.getElementById('fmt-filtro-cat')?.value || ''
    const lista  = document.getElementById('fmt-lista')
    if (!lista) return

    lista.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.3); font-size:13px; padding:20px 0;">Carregando...</p>'

    try {
        const params = new URLSearchParams()
        if (q)   params.append('q', q)
        if (cat) params.append('categoria', cat)

        const res      = await fetch(API+`/formatos?${params}`, { headers: authHeaders() })
        const formatos = await res.json()

        if (!formatos.length) {
            lista.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.3); font-size:13px; padding:40px 0;">Nenhum formato encontrado.</p>'
            return
        }

        const grupos = {}
        formatos.forEach(f => {
            const cat = f.categoria || 'Outro'
            if (!grupos[cat]) grupos[cat] = []
            grupos[cat].push(f)
        })

        lista.innerHTML = Object.entries(grupos).map(([cat, itens]) => {
            const [bg, color, icon] = FMT_CAT_CORES[cat] || ['#f3f4f6','#374151','📐']
            return `
                <div style="margin-bottom:16px;">
                    <div class="flex items-center gap-2 mb-2 px-1" style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                        <span style="font-size:11px; font-weight:700; padding:4px 10px; border-radius:20px; background:${bg}; color:${color};">${icon} ${cat}</span>
                        <span style="font-size:11px; color:rgba(255,255,255,0.3);">${itens.length} formato(s)</span>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        ${itens.map(f => {
                            const dim = (f.largura && f.altura) ? `${f.largura} × ${f.altura} ${f.unidade}` : '—'
                            return `
                                <div class="dash-glass" style="padding:14px 16px; display:flex; align-items:center; gap:12px; transition:all 0.2s;" data-id="${f.id}"
                                    onmouseover="this.style.borderColor='rgba(255,255,255,0.1)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'">
                                    <div style="flex-shrink:0; display:flex; align-items:center; justify-content:center; border-radius:10px; background:${bg}; width:44px; height:44px;">
                                        <span style="font-size:20px;">${icon}</span>
                                    </div>
                                    <div style="flex:1; min-width:0;">
                                        <div class="flex items-center gap-2" style="display:flex; align-items:center; gap:8px;">
                                            <p style="font-weight:600; color:rgba(255,255,255,0.85); font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${f.nome}</p>
                                            ${f.orientacao ? `<span style="font-size:10px; color:rgba(255,255,255,0.4);">${f.orientacao}</span>` : ''}
                                        </div>
                                        <p style="font-size:12px; font-family:monospace; font-weight:700; color:${color};">${dim}</p>
                                        ${f.descricao ? `<p style="font-size:11px; color:rgba(255,255,255,0.3); margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${f.descricao}</p>` : ''}
                                    </div>
                                    <button class="fmt-btn-copiar" style="flex-shrink:0; font-size:11px; font-weight:600; padding:6px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); color:rgba(255,255,255,0.4); background:rgba(255,255,255,0.04); cursor:pointer; transition:all 0.2s;"
                                        data-dim="${dim}" title="Copiar dimensões">
                                        Copiar
                                    </button>
                                    <button class="fmt-btn-editar" style="flex-shrink:0; padding:6px; border-radius:8px; color:rgba(255,255,255,0.3); background:transparent; cursor:pointer; transition:all 0.2s;" data-id="${f.id}" title="Editar">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </button>
                                    <button class="fmt-btn-excluir" style="flex-shrink:0; padding:6px; border-radius:8px; color:rgba(255,255,255,0.3); background:transparent; cursor:pointer; transition:all 0.2s;" data-id="${f.id}" title="Excluir">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                                    </button>
                                </div>
                            `
                        }).join('')}
                    </div>
                </div>
            `
        }).join('')

        lista.querySelectorAll('.fmt-btn-copiar').forEach(btn => {
            btn.onclick = () => {
                const ta = document.createElement('textarea')
                ta.value = btn.getAttribute('data-dim')
                document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
                const orig = btn.textContent
                btn.textContent = 'Copiado!'
                btn.style.color = '#22c55e'
                btn.style.borderColor = 'rgba(34,197,94,0.3)'
                setTimeout(() => { btn.textContent = orig; btn.style.color = ''; btn.style.borderColor = '' }, 1200)
            }
        })

        lista.querySelectorAll('.fmt-btn-editar').forEach(btn => {
            btn.onmouseover = () => { btn.style.color = '#60a5fa'; btn.style.background = 'rgba(59,130,246,0.1)' }
            btn.onmouseout = () => { btn.style.color = ''; btn.style.background = '' }
            btn.onclick = () => {
                const id = parseInt(btn.getAttribute('data-id'))
                const f  = formatos.find(x => x.id === id)
                if (!f) return
                fmtEditandoId = id
                document.getElementById('fmt-form-titulo').innerHTML  = '<svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Editando'
                document.getElementById('fmt-nome').value               = f.nome
                document.getElementById('fmt-categoria').value          = f.categoria || ''
                document.getElementById('fmt-largura').value            = f.largura || ''
                document.getElementById('fmt-altura').value             = f.altura || ''
                document.getElementById('fmt-unidade').value            = f.unidade || 'px'
                document.getElementById('fmt-orientacao').value         = f.orientacao || ''
                document.getElementById('fmt-descricao').value          = f.descricao || ''
                document.getElementById('fmt-btn-cancelar').style.display = 'block'
                document.getElementById('fmt-btn-salvar').innerHTML   = '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Atualizar'
                document.querySelectorAll('.fmt-orient-btn').forEach(b => {
                    const ativo = b.getAttribute('data-orient') === f.orientacao
                    b.style.borderColor = ativo ? 'rgba(181,21,21,0.5)' : 'rgba(255,255,255,0.08)'
                    b.style.color = ativo ? '#b51515' : 'rgba(255,255,255,0.5)'
                    b.style.background = ativo ? 'rgba(181,21,21,0.1)' : 'rgba(255,255,255,0.04)'
                })
                document.getElementById('fmt-nome').scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        })

        lista.querySelectorAll('.fmt-btn-excluir').forEach(btn => {
            btn.onmouseover = () => { btn.style.color = '#ef4444'; btn.style.background = 'rgba(239,68,68,0.1)' }
            btn.onmouseout = () => { btn.style.color = ''; btn.style.background = '' }
            btn.onclick = async () => {
                const okExcluir = await avisoConfirmacao('Excluir este formato?', { titulo: 'Excluir formato?', tipo: 'aviso', okText: 'Excluir', cancelText: 'Cancelar' })
                if (!okExcluir) return
                await fetch(API+`/formatos/${btn.getAttribute('data-id')}`, { method: 'DELETE', headers: authHeaders() })
                fmtBuscar()
            }
        })

    } catch (e) {
        console.error(e)
        lista.innerHTML = '<p style="text-align:center; color:#ef4444; font-size:13px; padding:40px 0;">Erro ao conectar com o servidor.</p>'
    }
}
