/* ═══════════════════════════════════════════════════════════════
   PAINEL DE ADMINISTRAÇÃO — abas imersivas (só no canto esquerdo)
   ═══════════════════════════════════════════════════════════════ */

function carregarAdmin() {
    if (!isAdmin()) return

    setActive('btn-admin')
    const cargoUsuario = window.getCargo()

    // estilo do shell
    const styleId = 'admin-style'
    if (!document.getElementById(styleId)) {
        const st = document.createElement('style')
        st.id = styleId
        st.textContent = `
            .adm-shell { display:flex; gap:0; min-height:calc(100vh - 140px); border-radius:var(--r-xl); overflow:hidden; border:1px solid var(--border); background:var(--surface-1); box-shadow:var(--shadow-lg); }
            .adm-side { flex:0 0 220px; background:linear-gradient(180deg, rgba(181,21,21,.11) 0%, rgba(181,21,21,.04) 100%); border-right:1px solid var(--border); padding:18px 14px; display:flex; flex-direction:column; gap:6px; }
            .adm-side-logo { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.12em; color:var(--text-3); padding:0 10px 10px; border-bottom:1px solid var(--border-soft); margin-bottom:8px; }
            .adm-tab { display:flex; align-items:center; gap:10px; padding:11px 12px; border:none; border-radius:var(--r-md); background:transparent; color:var(--text-2); font-size:12.5px; font-weight:600; text-align:left; cursor:pointer; transition:background var(--dur) var(--ease), color var(--dur) var(--ease); }
            .adm-tab:hover { background:var(--surface-2); color:var(--text-1); }
            .adm-tab.is-active { background:var(--brand-soft); color:var(--brand-text); box-shadow:inset 3px 0 0 var(--brand-2); }
            .adm-tab svg { flex:0 0 auto; }
            .adm-main { flex:1; min-width:0; overflow-y:auto; padding:22px 22px 40px; background:var(--surface-0); }
            .adm-pane { display:none; }
            .adm-pane.is-active { display:block; animation: dsToastIn .25s var(--ease-out); }
            .adm-kpi-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; margin-bottom:18px; }
            .adm-kpi { background:linear-gradient(160deg, var(--surface-1), var(--surface-2)); border:1px solid var(--border-soft); border-radius:var(--r-lg); padding:14px 16px; display:flex; flex-direction:column; gap:4px; position:relative; overflow:hidden; }
            .adm-kpi::after { content:''; position:absolute; top:0; right:0; width:48px; height:48px; background:radial-gradient(circle at top right, var(--brand-soft), transparent 65%); }
            .adm-kpi-label { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:var(--text-3); }
            .adm-kpi-value { font-size:22px; font-weight:800; color:var(--text-1); line-height:1.15; }
            .adm-kpi-sub { font-size:10.5px; color:var(--text-3); }
            .adm-section-title { font-size:14px; font-weight:700; color:var(--text-1); margin:6px 0 10px; letter-spacing:.01em; }
            .adm-alert { display:flex; gap:10px; align-items:flex-start; padding:12px 14px; border-radius:var(--r-md); border:1px solid var(--border-soft); border-left:3px solid var(--warn); background:var(--surface-2); margin-bottom:10px; font-size:12px; color:var(--text-2); line-height:1.55; }
            .adm-alert.is-erro { border-left-color:var(--danger); }
            .adm-alert.is-ok { border-left-color:var(--ok); }
            .adm-alert-ok { display:flex; align-items:center; gap:10px; color:var(--ok); font-size:12.5px; font-weight:600; padding:10px 12px; background:var(--ok-soft); border-radius:var(--r-md); }
            .adm-log-row { display:flex; gap:10px; padding:8px 10px; border-bottom:1px solid var(--border-soft); font-size:11.5px; color:var(--text-2); align-items:baseline; }
            .adm-log-row time { color:var(--text-3); font-family:monospace; font-size:10.5px; flex:0 0 auto; }
            .adm-log-row span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            .adm-tools-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:12px; }
            .adm-tool-card { display:flex; gap:12px; align-items:center; background:var(--surface-1); border:1px solid var(--border-soft); border-radius:var(--r-md); padding:14px; cursor:pointer; text-align:left; color:var(--text-1); transition:border-color .15s, transform .15s; }
            .adm-tool-card:hover { border-color:var(--brand-2); transform:translateY(-2px); }
            .adm-tool-icon { flex:0 0 auto; width:42px; height:34px; display:flex; align-items:center; justify-content:center; border-radius:var(--r-sm); background:var(--brand-soft); color:var(--brand-2); }
            .adm-tool-title { font-size:12.5px; font-weight:700; }
            .adm-tool-sub { font-size:10.5px; color:var(--text-3); margin-top:2px; line-height:1.4; }
            .adm-cfg-block { background:var(--surface-1); border:1px solid var(--border-soft); border-radius:var(--r-md); padding:16px; margin-bottom:14px; }
            .adm-field { margin-bottom:12px; }
            .adm-field label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--text-3); display:block; margin-bottom:5px; }
            .adm-field input { width:100%; padding:10px 12px; border-radius:var(--r-sm); border:1px solid var(--border); background:var(--surface-2); color:var(--text-1); font-size:13px; outline:none; box-sizing:border-box; }
            .adm-field input:focus { border-color:var(--brand-2); }
            .adm-field-row { display:flex; gap:10px; align-items:center; }
            .adm-cfg-msg { font-size:12px; margin-top:6px; min-height:16px; }
            .adm-edit-row { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:14px; }
        `
        document.head.appendChild(st)
    }

    setConteudo(`
        <div class="adm-shell fade-in">
            <aside class="adm-side">
                <div class="adm-side-logo">Painel de Admin</div>
                <button class="adm-tab is-active" data-tab="painel" type="button">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    Visão Geral
                </button>
                <button class="adm-tab" data-tab="usuarios" type="button">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                    Usuários
                </button>
                <button class="adm-tab" data-tab="editor" type="button">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4L18.5 2.5z"/></svg>
                    Editar Produtos
                </button>
                <button class="adm-tab" data-tab="config" type="button">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v10M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24M2 12h6m8 0h6M4.22 19.78l4.24-4.24m7.08-7.08l4.24-4.24"/></svg>
                    Configurações
                </button>
                <button class="adm-tab" data-tab="ferramentas" type="button">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94L6 21a3 3 0 01-3-3l4.93-7.93a6 6 0 017.94-7.94l-3.77 3.77a1 1 0 000 1.4z"/></svg>
                    Ferramentas
                </button>
            </aside>
            <main class="adm-main">
                <!-- ABA: VISÃO GERAL -->
                <section class="adm-pane is-active" id="adm-pane-painel">
                    <div class="adm-section-title">Visão geral</div>
                    <div class="adm-kpi-grid" id="adm-kpis"></div>

                    <div class="adm-section-title">Alertas</div>
                    <div id="adm-alertas"></div>

                    <div class="adm-section-title">Últimas ações no sistema</div>
                    <div id="adm-logs"></div>
                </section>

                <!-- ABA: USUÁRIOS -->
                <section class="adm-pane" id="adm-pane-usuarios">
                    <div class="adm-section-title">Cadastro</div>
                    <div class="adm-cfg-block">
                        <div class="adm-edit-row">
                            <div class="adm-field"><label>Nome completo</label><input id="admin-nome" type="text" placeholder="Nome completo" /></div>
                            <div class="adm-field"><label>Usuário (login)</label><input id="admin-usuario" type="text" placeholder="Usuário" /></div>
                            <div class="adm-field"><label>Senha</label><input id="admin-senha" type="password" placeholder="Senha" /></div>
                            <div class="adm-field"><label>Cargo</label><select id="admin-cargo" style="width:100%; padding:10px 12px; border-radius:var(--r-sm); border:1px solid var(--border); background:var(--surface-2); color:var(--text-1); font-size:13px;">
                                <option value="atendente">Atendente</option>
                                <option value="gerente">Gerente</option>
                                <option value="administrador">Administrador</option>
                            </select></div>
                        </div>
                        <p id="admin-erro" class="adm-cfg-msg" style="color:var(--danger);"></p>
                        <p id="admin-ok"    class="adm-cfg-msg" style="color:var(--ok);" ></p>
                        <button id="admin-salvar" class="ds-btn ds-btn-primary" type="button">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                            Cadastrar
                        </button>
                    </div>
                    <div class="adm-section-title" style="display:flex; align-items:center; justify-content:space-between;">Lista de usuários
                        <button id="btn-recargar-usuarios" class="ds-btn ds-btn-sm" type="button">Atualizar</button>
                    </div>
                    <div id="lista-usuarios"></div>
                </section>

                <!-- ABA: EDITOR -->
                <section class="adm-pane" id="adm-pane-editor">
                    <div class="adm-section-title">Buscar e editar produto</div>
                    <div style="display:flex; gap:10px; margin-bottom:16px;">
                        <input id="prod-busca" type="text" placeholder="Código, EAN ou parte do nome..." class="inp" style="flex:1; padding:10px 12px; border-radius:var(--r-sm); border:1px solid var(--border); background:var(--surface-2); color:var(--text-1); font-size:13px; outline:none;" />
                        <button id="prod-btn-buscar" class="ds-btn ds-btn-primary" type="button">Buscar</button>
                    </div>
                    <div id="prod-resultados"></div>
                    <div id="prod-form" style="display:none;">
                        <p style="font-size:11px; color:var(--text-3); margin-bottom:10px;">Editando: <b id="prod-editando" style="color:var(--text-1);"></b></p>
                        <div class="adm-edit-row">
                            <div class="adm-field"><label>Descrição</label><input id="pe-descricao" type="text" class="inp" style="width:100%; padding:10px 12px; border-radius:var(--r-sm); border:1px solid var(--border); background:var(--surface-2); color:var(--text-1); outline:none; box-sizing:border-box;" /></div>
                            <div class="adm-field"><label>Marca</label><input id="pe-marca" type="text" class="inp" style="width:100%; padding:10px 12px; border-radius:var(--r-sm); border:1px solid var(--border); background:var(--surface-2); color:var(--text-1); outline:none; box-sizing:border-box;" /></div>
                            <div class="adm-field"><label>EAN</label><input id="pe-ean" type="text" class="inp" style="width:100%; padding:10px 12px; border-radius:var(--r-sm); border:1px solid var(--border); background:var(--surface-2); color:var(--text-1); outline:none; box-sizing:border-box;" /></div>
                            <div class="adm-field"><label>Preço (R$)</label><input id="pe-preco" type="number" step="0.01" class="inp" style="width:100%; padding:10px 12px; border-radius:var(--r-sm); border:1px solid var(--border); background:var(--surface-2); color:var(--text-1); outline:none; box-sizing:border-box;" /></div>
                            <div class="adm-field"><label>Departamento</label><input id="pe-departamento" type="text" class="inp" style="width:100%; padding:10px 12px; border-radius:var(--r-sm); border:1px solid var(--border); background:var(--surface-2); color:var(--text-1); outline:none; box-sizing:border-box;" /></div>
                            <div class="adm-field"><label>Desp. Departamento</label><input id="pe-descricao-dep" type="text" class="inp" style="width:100%; padding:10px 12px; border-radius:var(--r-sm); border:1px solid var(--border); background:var(--surface-2); color:var(--text-1); outline:none; box-sizing:border-box;" /></div>
                            <div class="adm-field"><label>Seção</label><input id="pe-secao" type="text" class="inp" style="width:100%; padding:10px 12px; border-radius:var(--r-sm); border:1px solid var(--border); background:var(--surface-2); color:var(--text-1); outline:none; box-sizing:border-box;" /></div>
                            <div class="adm-field"><label>Grupo</label><input id="pe-grupo" type="text" class="inp" style="width:100%; padding:10px 12px; border-radius:var(--r-sm); border:1px solid var(--border); background:var(--surface-2); color:var(--text-1); outline:none; box-sizing:border-box;" /></div>
                            <div class="adm-field"><label>Quantidade (KG/LT)</label><input id="pe-qtd-kgl" type="number" step="0.001" class="inp" style="width:100%; padding:10px 12px; border-radius:var(--r-sm); border:1px solid var(--border); background:var(--surface-2); color:var(--text-1); outline:none; box-sizing:border-box;" /></div>
                            <div class="adm-field"><label>Unidade (KG/LT/UN)</label><input id="pe-kglt" type="text" class="inp" style="width:100%; padding:10px 12px; border-radius:var(--r-sm); border:1px solid var(--border); background:var(--surface-2); color:var(--text-1); outline:none; box-sizing:border-box;" /></div>
                        </div>
                        <div style="display:flex; gap:10px; align-items:center; margin-top:10px; flex-wrap:wrap;">
                            <button id="prod-btn-salvar" class="ds-btn ds-btn-primary" type="button">Salvar Alterações</button>
                            <button id="prod-btn-cancelar" class="ds-btn" type="button">Cancelar</button>
                            <p id="prod-msg" class="adm-cfg-msg" style="margin:0; min-height:auto;"></p>
                        </div>
                    </div>
                </section>

                <!-- ABA: CONFIGURAÇÕES -->
                <section class="adm-pane" id="adm-pane-config">
                    <div class="adm-section-title">Pastas de imagens</div>
                    <div class="adm-cfg-block">
                        <div class="adm-field">
                            <label>Pasta de imagens (produtos)</label>
                            <input id="cfg-pasta-imagens" type="text" placeholder="Ex: E:\\Banco de Imagens\\" style="width:100%; padding:10px 12px; border-radius:var(--r-sm); border:1px solid var(--border); background:var(--surface-2); color:var(--text-1); font-size:13px; outline:none; box-sizing:border-box;" />
                            <p style="font-size:11px; color:var(--text-3); margin:6px 0 0;">Caminho da pasta com as fotos dos produtos. Altere ao mudar de máquina.</p>
                        </div>
                        <button id="cfg-btn-salvar-pasta" class="ds-btn ds-btn-primary ds-btn-sm" type="button">Salvar pasta</button>
                        <p id="cfg-pasta-msg" class="adm-cfg-msg"></p>
                    </div>
                    <div class="adm-cfg-block">
                        <div class="adm-field">
                            <label>Pasta de imagens (pratos do restaurante)</label>
                            <input id="cfg-pasta-pratos" type="text" placeholder="Ex: E:\\Imagens\\Pratos\\" style="width:100%; padding:10px 12px; border-radius:var(--r-sm); border:1px solid var(--border); background:var(--surface-2); color:var(--text-1); font-size:13px; outline:none; box-sizing:border-box;" />
                        </div>
                        <button id="cfg-btn-salvar-pratos" class="ds-btn ds-btn-primary ds-btn-sm" type="button">Salvar pasta</button>
                        <p id="cfg-pratos-msg" class="adm-cfg-msg"></p>
                    </div>
                </section>

                <!-- ABA: FERRAMENTAS -->
                <section class="adm-pane" id="adm-pane-ferramentas">
                    <div class="adm-section-title">Ferramentas rápidas</div>
                    <div class="adm-tools-grid">
                        <button id="adm-ferramenta-backup" class="adm-tool-card" type="button">
                            <div class="adm-tool-icon">
                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                            </div>
                            <div>
                                <div class="adm-tool-title">Fazer Backup Agora</div>
                                <div class="adm-tool-sub">Exporta TODAS as tabelas do banco para arquivo .sql em data/backups/</div>
                            </div>
                        </button>
                        <button id="adm-ferramenta-testes" class="adm-tool-card" type="button">
                            <div class="adm-tool-icon">
                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <div>
                                <div class="adm-tool-title">Testar conexão com o banco</div>
                                <div class="adm-tool-sub">SELECT 1 + contagem de produtos para confirmar que o MySQL está respondendo</div>
                            </div>
                        </button>
                        <button id="adm-ferramenta-incompletos" class="adm-tool-card" type="button">
                            <div class="adm-tool-icon">
                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16.01"/></svg>
                            </div>
                            <div>
                                <div class="adm-tool-title">Listar produtos incompletos</div>
                                <div class="adm-tool-sub">Gere a lista de produtos sem marca/preço — ideal para varrer no fim do dia</div>
                            </div>
                        </button>
                        <button id="adm-ferramenta-reiniciar-aviso" class="adm-tool-card" type="button">
                            <div class="adm-tool-icon">
                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94L6 21a3 3 0 01-3-3l4.93-7.93a6 6 0 017.94-7.94l-3.77 3.77a1 1 0 000 1.4z"/></svg>
                            </div>
                            <div>
                                <div class="adm-tool-title">Fechar e abrir o ERP</div>
                                <div class="adm-tool-sub">Todas as mudanças de código só valem após reiniciar. O botão fechando o ERP limpa qualquer memória presa.</div>
                            </div>
                        </button>
                    </div>
                    <div id="adm-ferramenta-resultado" style="display:none; margin-top:14px; font-size:12px; line-height:1.6;"></div>
                </section>
            </main>
        </div>
    `, 'Admin')
    vincularEventosAdmin()
}

function admTrocarTab(nome) {
    document.querySelectorAll('.adm-tab').forEach(b => b.classList.toggle('is-active', b.dataset.tab === nome))
    document.querySelectorAll('.adm-pane').forEach(p => p.classList.toggle('is-active', p.id === 'adm-pane-' + nome))
}

function admEscape(s) {
    return String(s ?? '').replace(/[<>&"\x27]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "\x27": '&#39;' }[c] || c))
}

function formatMB(bytes) {
    const mb = bytes / (1024 * 1024)
    return mb >= 1024 ? (mb / 1024).toFixed(1) + ' GB' : Math.round(mb) + ' MB'
}
function formatUptime(seg) {
    const h = Math.floor(seg / 3600); const min = Math.floor((seg % 3600) / 60); const s = Math.floor(seg % 60)
    return `${h}h ${min}min ${s}s`
}

async function carregarVisaoGeral() {
    const kpis = document.getElementById('adm-kpis')
    const alertas = document.getElementById('adm-alertas')
    const logsEl = document.getElementById('adm-logs')
    if (kpis) kpis.innerHTML = '<div style="color:var(--text-3); font-size:12px; grid-column:1/-1;">carregando…</div>'
    if (alertas) alertas.innerHTML = ''
    if (logsEl) logsEl.innerHTML = ''

    const kpi = (label, value, sub, cor) => `<div class="adm-kpi"><div class="adm-kpi-label">${label}</div><div class="adm-kpi-value" style="color:${cor || 'var(--text-1)'}">${admEscape(value)}</div>${sub ? `<div class="adm-kpi-sub">${admEscape(sub)}</div>` : ''}</div>`

    try {
        const r = await fetch(API + '/saude', { headers: authHeaders(), cache: 'no-store' })
        const d = await r.json()
        if (!r.ok) throw new Error(d.error || 'Falha ao ler /saude')

        const bancoOk = d.banco && d.banco.conectado
        const memoriaLivreMB = d.memoriaLivreMB || 0
        const memoriaTotalMB = Math.max(1, d.memoriaTotalMB || 1)
        const memoriaPct = Math.round((1 - memoriaLivreMB / memoriaTotalMB) * 100)

        kpis.innerHTML = [
            kpi('Versão ERP', 'v' + (d.versao || '?'), 'supermercado Avanzi'),
            kpi('Banco de dados', bancoOk ? 'conectado' : 'offline', bancoOk ? 'MySQL' : (d.banco && d.banco.erro ? d.banco.erro : ''), bancoOk ? 'var(--ok)' : 'var(--danger)'),
            kpi('Produtos', typeof d.produtos === 'number' ? d.produtos.toLocaleString('pt-BR') : '—', 'cadastrados'),
            kpi('Pasta imagens', (d.pastaImagens && d.pastaImagens.existe) ? 'OK' : 'offline', (d.pastaImagens && d.pastaImagens.existe) ? `${(d.pastaImagens.arquivos||0).toLocaleString()} arquivos · ${formatMB(d.pastaImagens.bytesTotal||0)}` : 'caminho inválido', (d.pastaImagens && d.pastaImagens.existe) ? 'var(--ok)' : 'var(--danger)'),
            kpi('RAM em uso', memoriaPct + '%', memoriaLivreMB.toLocaleString('pt-BR') + ' MB livres'),
            kpi('Tempo ativo', formatUptime(d.uptimeSeg || 0), (d.plataforma || '').replace('win32', 'Windows'))
        ].join('')

        // Alertas (server-side)
        try {
            const rA = await fetch(API + '/alertas', { headers: authHeaders(), cache: 'no-store' })
            const a = await rA.json()
            if (rA.ok && Array.isArray(a.alertas) && a.alertas.length) {
                alertas.innerHTML = a.alertas.map(al => {
                    const tipo = al.tipo === 'erro' ? 'is-erro' : (al.tipo === 'ok' ? 'is-ok' : '')
                    return `<div class="adm-alert ${tipo}"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="flex:0 0 auto; color:${al.tipo === 'erro' ? 'var(--danger)' : (al.tipo === 'ok' ? 'var(--ok)' : 'var(--warn)')}; margin-top:1px;">${al.tipo === 'erro' ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' : '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'}</svg><span><b style="color:var(--text-1)">${admEscape(al.titulo)}</b><br><span style="color:var(--text-3)">${admEscape(al.detalhe || '')}</span></span></div>`
                }).join('')
            } else {
                alertas.innerHTML = `<div class="adm-alert-ok"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg><span>Tudo certo por aqui — nenhum alerta pendente</span></div>`
            }
        } catch (e) {
            alertas.innerHTML = `<div class="adm-alert is-erro">Não foi possível ler alertas: ${admEscape(e.message || String(e))}</div>`
        }

        if (Array.isArray(d.logs) && d.logs.length) {
            logsEl.innerHTML = `<div class="adm-log-row" style="font-weight:700; color:var(--text-3); text-transform:uppercase; font-size:10px; letter-spacing:.06em;"><span>Quando</span><span>Usuário / Ação</span></div>` + d.logs.map(l => `<div class="adm-log-row"><time>${admEscape((l.quando || '').toString().replace('T', ' ').slice(0, 16))}</time><span><b style="color:var(--text-1)">${admEscape(l.usuario || 'sistema')}</b> — ${admEscape(l.descricao || l.acao || '—')}</span></div>`).join('')
        } else {
            logsEl.innerHTML = '<div class="adm-log-row" style="color:var(--text-3);">Nenhum log registrado ainda.</div>'
        }
    } catch (e) {
        kpis.innerHTML = `<div style="color:var(--danger); font-size:13px; grid-column:1/-1;">Não foi possível carregar o sistema: ${admEscape(e.message || String(e))}</div>`
    }
}

// ── USUÁRIOS ───────────────────────────────────────────────────
async function carregarListaUsuarios() {
    const el = document.getElementById('lista-usuarios')
    if (!el) return
    el.innerHTML = '<div style="color:var(--text-3); font-size:12px; padding:8px 4px;">carregando…</div>'
    try {
        const res = await fetch(API + '/usuarios', { headers: authHeaders() })
        const users = await res.json()
        if (!Array.isArray(users)) throw new Error((users && users.error) || 'Resposta inválida')
        if (!users.length) { el.innerHTML = '<div style="color:var(--text-3); font-size:12px; padding:8px 4px;">Nenhum usuário cadastrado.</div>'; return }
        el.innerHTML = `<table style="width:100%; border-collapse:collapse;">
            <thead><tr style="text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:.06em; color:var(--text-3);">
                <th style="padding:8px 10px; border-bottom:1px solid var(--border);">Nome</th>
                <th style="padding:8px 10px; border-bottom:1px solid var(--border);">Usuário</th>
                <th style="padding:8px 10px; border-bottom:1px solid var(--border);">Cargo</th>
                <th style="padding:8px 10px; border-bottom:1px solid var(--border);">Ativo</th>
                <th style="padding:8px 10px; border-bottom:1px solid var(--border); text-align:right;">Ações</th>
            </tr></thead>
            <tbody>${users.map(u => `<tr style="border-bottom:1px solid var(--border-soft); font-size:12.5px;">
                <td style="padding:10px 10px; color:var(--text-1); font-weight:600;">${admEscape(u.nome || '—')}</td>
                <td style="padding:10px 10px; color:var(--text-2); font-family:monospace; font-size:11.5px;">${admEscape(u.usuario || '')}</td>
                <td style="padding:10px 10px;"><select class="adm-cargo-select" data-id="${u.id}" style="padding:5px 8px; border-radius:var(--r-sm); border:1px solid var(--border); background:var(--surface-2); color:var(--text-1); font-size:11px;">
                    <option value="atendente" ${(u.cargo || 'atendente') === 'atendente' ? 'selected' : ''}>Atendente</option>
                    <option value="gerente" ${u.cargo === 'gerente' ? 'selected' : ''}>Gerente</option>
                    <option value="administrador" ${u.cargo === 'administrador' ? 'selected' : ''}>Administrador</option>
                </select></td>
                <td style="padding:10px 10px;"><button class="ds-btn ds-btn-sm" data-acao="ativo" data-id="${u.id}" data-valor="${u.ativo ? 1 : 0}" type="button">${u.ativo ? '<span style="color:var(--ok)">● ativo</span>' : '<span style="color:var(--danger)">✕ inativo</span>'}</button></td>
                <td style="padding:10px 10px; text-align:right; white-space:nowrap;">
                    <button class="ds-btn ds-btn-sm" data-acao="senha" data-id="${u.id}" data-usuario="${admEscape(u.usuario)}" type="button">Senha</button>
                    <button class="ds-btn ds-btn-sm ds-btn-danger" data-acao="excluir" data-id="${u.id}" data-usuario="${admEscape(u.usuario)}" type="button">Excluir</button>
                </td>
            </tr>`).join('')}</tbody></table>`
        el.querySelectorAll('.adm-cargo-select').forEach(sel => {
            sel.onchange = async () => {
                const id = sel.dataset.id
                const res = await fetch(API + '/usuarios/' + id + '/cargo', { method: 'PUT', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ cargo: sel.value }) })
                if (!res.ok) { const e = await res.json().catch(() => ({})); alert(e.error || 'Falha ao mudar cargo.') }
            }
        })
        el.querySelectorAll('[data-acao="ativo"]').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.id
                const novo = btn.dataset.valor !== '1' // toggle
                const res = await fetch(API + '/usuarios/' + id + '/ativo', { method: 'PUT', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ ativo: novo }) })
                const j = await res.json().catch(() => ({}))
                if (res.ok) carregarListaUsuarios()
                else alert(j.error || 'Falha ao mudar status.')
            }
        })
        el.querySelectorAll('[data-acao="senha"]').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.id, usuario = btn.dataset.usuario
                const senha = await avisoPrompt('Nova senha para ' + usuario, { titulo: 'Nova senha', tipo: 'pergunta', okText: 'Salvar', cancelText: 'Cancelar', placeholder: 'mínimo 4 caracteres' })
                if (senha === null || senha === undefined) return
                if (String(senha).length < 4) return alert('A senha precisa ter pelo menos 4 caracteres.')
                const res = await fetch(API + '/usuarios/' + id + '/senha', { method: 'PUT', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ senha }) })
                const j = await res.json().catch(() => ({}))
                if (res.ok) { /* opcional: toast */ }
                else alert(j.error || 'Falha ao redefinir senha.')
            }
        })
        el.querySelectorAll('[data-acao="excluir"]').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.id, usuario = btn.dataset.usuario
                const okExcluir = await avisoConfirmacao('Excluir o usuário "' + usuario + '" definitivamente?', { titulo: 'Excluir usuário?', tipo: 'aviso', okText: 'Excluir', cancelText: 'Cancelar' })
                if (!okExcluir) return
                const res = await fetch(API + '/usuarios/' + id, { method: 'DELETE', headers: authHeaders() })
                const j = await res.json().catch(() => ({}))
                if (res.ok) carregarListaUsuarios()
                else alert(j.error || 'Falha ao excluir.')
            }
        })
    } catch (e) {
        el.innerHTML = `<div style="color:var(--danger); font-size:12px; padding:8px 4px;">Erro ao listar usuários: ${admEscape(e.message || String(e))}</div>`
    }
}

// ── EVENTOS ADMIN ─────────────────────────────────────────────
function vincularEventosAdmin() {
    // troca de abas
    document.querySelectorAll('.adm-tab').forEach(btn => {
        btn.addEventListener('click', () => admTrocarTab(btn.dataset.tab))
    })

    // carrega dados iniciais das abas
    carregarVisaoGeral()
    carregarListaUsuarios()
    carregarPastaConfig()

    document.getElementById('btn-recargar-usuarios')?.addEventListener('click', carregarListaUsuarios)

    // Cadastrar usuário
    document.getElementById('admin-salvar').onclick = async () => {
        const nome    = document.getElementById('admin-nome').value.trim()
        const usuario = document.getElementById('admin-usuario').value.trim()
        const senha   = document.getElementById('admin-senha').value
        const cargo   = document.getElementById('admin-cargo').value
        const erroEl  = document.getElementById('admin-erro')
        const okEl    = document.getElementById('admin-ok')
        erroEl.textContent = ''; okEl.textContent = ''
        if (!nome || !usuario || !senha) { erroEl.textContent = 'Preencha todos os campos.'; return }
        try {
            const res = await fetch(API + '/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ nome, usuario, senha, cargo })
            })
            const data = await res.json()
            if (res.ok) {
                okEl.textContent = 'Usuário cadastrado!'
                document.getElementById('admin-nome').value = ''
                document.getElementById('admin-usuario').value = ''
                document.getElementById('admin-senha').value = ''
                carregarListaUsuarios()
            } else {
                erroEl.textContent = data.error || 'Erro ao cadastrar'
            }
        } catch { erroEl.textContent = 'Erro ao conectar' }
    }

    // Editor de produtos
    document.getElementById('prod-btn-buscar')?.addEventListener('click', buscarProdutosAdmin)
    document.getElementById('prod-busca')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); buscarProdutosAdmin() } })
    document.getElementById('prod-btn-salvar')?.addEventListener('click', salvarEdicaoAdmin)
    document.getElementById('prod-btn-cancelar')?.addEventListener('click', cancelarEdicaoAdmin)

    // Configurações de pasta
    document.getElementById('cfg-btn-salvar-pasta')?.addEventListener('click', () => salvarPastaConfig('pasta_imagens', 'cfg-pasta-imagens', 'cfg-pasta-msg'))
    document.getElementById('cfg-btn-salvar-pratos')?.addEventListener('click', () => salvarPastaConfig('pasta_pratos', 'cfg-pasta-pratos', 'cfg-pratos-msg'))

    // Ferramentas
    document.getElementById('adm-ferramenta-backup')?.addEventListener('click', admExecutarBackup)
    document.getElementById('adm-ferramenta-testes')?.addEventListener('click', admTestarBanco)
    document.getElementById('adm-ferramenta-incompletos')?.addEventListener('click', admListarIncompletos)
    document.getElementById('adm-ferramenta-reiniciar-aviso')?.addEventListener('click', () => {
        alert('Para que o ERP carregue o código novo você precisa FECHAR completamente e abrir de novo — não há botão de reinicialização porque isso derruba o app com usuários dentro.\n\nUse o X da janela ou Ctrl+Q, e depois reabra o ícone.')
    })
}

// ── EDITOR DE PRODUTOS ────────────────────────────────────
let prodEditandoId = null
async function buscarProdutosAdmin() {
    const termo = document.getElementById('prod-busca').value.trim()
    const resultados = document.getElementById('prod-resultados')
    if (!termo) { resultados.innerHTML = ''; return }
    resultados.innerHTML = '<div style="color:var(--text-3); font-size:12px; padding:8px 4px;">Buscando…</div>'
    try {
        const res = await fetch(API + '/produtos/busca?q=' + encodeURIComponent(termo), { headers: authHeaders() })
        const dados = await res.json()
        const prods = Array.isArray(dados) ? dados : (dados.produtos || [])
        if (!prods.length) { resultados.innerHTML = '<div style="color:var(--text-3); font-size:12px; padding:8px 4px;">Nenhum produto encontrado</div>'; return }
        resultados.innerHTML = prods.slice(0, 20).map(p => `
            <div class="adm-cfg-block" style="display:flex; justify-content:space-between; align-items:center; gap:10px; padding:12px 14px; margin-bottom:8px;">
                <div style="min-width:0; flex:1;">
                    <div style="font-size:12.5px; font-weight:700; color:var(--text-1); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${admEscape(p.descricao || '—')}</div>
                    <div style="font-size:11px; color:var(--text-3); margin-top:2px;">cod ${admEscape(p.codigo)} · EAN ${admEscape(p.ean || '—')} · R$ ${(parseFloat(p.preco_venda) || 0).toFixed(2).replace('.', ',')}</div>
                </div>
                <button class="ds-btn ds-btn-sm ds-btn-primary" data-editar="${p.codigo}" type="button">Editar</button>
            </div>
        `).join('')
        resultados.querySelectorAll('[data-editar]').forEach(btn => {
            btn.onclick = async () => {
                const codigo = btn.dataset.editar
                const res = await fetch(API + '/produtos/' + encodeURIComponent(codigo), { headers: authHeaders() })
                const p = await res.json()
                if (!res.ok) return alert('Não consegui carregar o produto.')
                preencherFormularioProdutoEditor(p)
            }
        })
    } catch (e) { resultados.innerHTML = `<div style="color:var(--danger); font-size:12px; padding:8px 4px;">${admEscape(e.message || String(e))}</div>` }
}
function preencherFormularioProdutoEditor(p) {
    prodEditandoId = p.codigo
    document.getElementById('pe-descricao').value = p.descricao || ''
    document.getElementById('pe-marca').value = p.marca || ''
    document.getElementById('pe-ean').value = p.ean || ''
    document.getElementById('pe-preco').value = p.preco_venda || ''
    document.getElementById('pe-departamento').value = p.departamento || ''
    document.getElementById('pe-descricao-dep').value = p.descricao_departamento || ''
    document.getElementById('pe-secao').value = p.secao || ''
    document.getElementById('pe-grupo').value = p.grupo || ''
    document.getElementById('pe-qtd-kgl').value = p.quantidade_kg_l || ''
    document.getElementById('pe-kglt').value = p.unidade_medida || p.descricao_kglt || ''
    document.getElementById('prod-editando').textContent = (p.descricao || p.codigo) || ''
    document.getElementById('prod-form').style.display = ''
    document.getElementById('prod-msg').textContent = ''
}
async function salvarEdicaoAdmin() {
    if (!prodEditandoId) return
    const body = {
        descricao: document.getElementById('pe-descricao').value.trim(),
        marca: document.getElementById('pe-marca').value.trim(),
        ean: document.getElementById('pe-ean').value.trim(),
        preco_venda: parseFloat(document.getElementById('pe-preco').value) || 0,
        departamento: document.getElementById('pe-departamento').value.trim(),
        descricao_departamento: document.getElementById('pe-descricao-dep').value.trim(),
        secao: document.getElementById('pe-secao').value.trim(),
        grupo: document.getElementById('pe-grupo').value.trim(),
        quantidade_kg_l: parseFloat(document.getElementById('pe-qtd-kgl').value) || null,
        unidade_medida: document.getElementById('pe-kglt').value.trim()
    }
    const msg = document.getElementById('prod-msg')
    msg.textContent = 'Salvando…'
    msg.style.color = 'var(--text-3)'
    try {
        const res = await fetch(API + '/produtos/' + encodeURIComponent(prodEditandoId), {
            method: 'PUT',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        const j = await res.json().catch(() => ({}))
        if (res.ok) { msg.textContent = 'Salvo!'; msg.style.color = 'var(--ok)' }
        else { msg.textContent = j.error || 'Erro ao salvar'; msg.style.color = 'var(--danger)' }
    } catch { msg.textContent = 'Erro ao conectar'; msg.style.color = 'var(--danger)' }
}
function cancelarEdicaoAdmin() {
    prodEditandoId = null
    document.getElementById('prod-form').style.display = 'none'
    document.getElementById('prod-resultados').innerHTML = ''
    document.getElementById('prod-busca').value = ''
}

// ── CONFIGURAÇÕES ──────────────────────────────────────────
async function carregarPastaConfig() {
    // carrega os valores atuais dos dois campos de pasta
    try {
        const r = await fetch(API + '/configuracao/pasta_imagens', { headers: authHeaders() })
        const d = await r.json()
        const el = document.getElementById('cfg-pasta-imagens')
        if (el && d && d.valor) el.value = d.valor
    } catch {}
    try {
        const r = await fetch(API + '/configuracao/pasta_pratos', { headers: authHeaders() })
        const d = await r.json()
        const el = document.getElementById('cfg-pasta-pratos')
        if (el && d && d.valor) el.value = d.valor
    } catch {}
}
async function salvarPastaConfig(chave, inputId, msgId) {
    const input = document.getElementById(inputId)
    const msg = document.getElementById(msgId)
    const valor = (input.value || '').trim()
    msg.textContent = 'Salvando…'
    msg.style.color = 'var(--text-3)'
    try {
        const res = await fetch(API + '/configuracao/' + encodeURIComponent(chave), {
            method: 'PUT',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ valor })
        })
        const j = await res.json().catch(() => ({}))
        if (res.ok) { msg.textContent = 'Salvo'; msg.style.color = 'var(--ok)' }
        else { msg.textContent = j.error || 'Erro ao salvar'; msg.style.color = 'var(--danger)' }
    } catch { msg.textContent = 'Erro ao conectar'; msg.style.color = 'var(--danger)' }
}

// ── FERRAMENTAS ────────────────────────────────────────
async function admExecutarBackup() {
    const box = document.getElementById('adm-ferramenta-resultado')
    const okBackup = await avisoConfirmacao('Fazer backup AGORA? O arquivo .sql será salvo em data/backups/ desta pasta do projeto (~poucos MB). Pode levar alguns segundos.', { titulo: 'Fazer backup?', tipo: 'pergunta', okText: 'Fazer backup', cancelText: 'Cancelar' })
    if (!okBackup) return
    box.style.display = ''
    box.innerHTML = '<div style="color:var(--text-3);">Fazendo backup…</div>'
    fetch(API + '/backup', { method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: '{}' })
        .then(async r => {
            const j = await r.json()
            if (r.ok && j.ok) {
                box.innerHTML = `<div class="adm-alert is-ok"><b style="color:var(--text-1)">Backup feito!</b><br><span style="color:var(--text-3)">${admEscape(j.arquivo || 'arquivo')} · ${(j.tamanho / 1024).toFixed(0)} KB · ${j.linhas} linhas em ${j.tabelas} tabela(s)</span></div>`
            } else {
                box.innerHTML = `<div class="adm-alert is-erro">Falha: ${admEscape(j.error || 'erro')}</div>`
            }
        })
        .catch(e => { box.innerHTML = `<div class="adm-alert is-erro">Falha: ${admEscape(e.message || String(e))}</div>` })
}
async function admTestarBanco() {
    const box = document.getElementById('adm-ferramenta-resultado')
    box.style.display = ''
    box.innerHTML = '<div style="color:var(--text-3);">Testando banco…</div>'
    try {
        const r = await fetch(API + '/saude', { headers: authHeaders(), cache: 'no-store' })
        const d = await r.json()
        const ok = d && d.banco && d.banco.conectado
        box.innerHTML = `<div class="adm-alert ${ok ? 'is-ok' : 'is-erro'}"><b style="color:var(--text-1)">Banco ${ok ? 'conectado ✓' : 'offline ✕'}</b><br><span style="color:var(--text-3)">${ok ? `Produtos: ${(d.produtos || 0).toLocaleString('pt-BR')} · Pasta: ${admEscape((d.pastaImagens || {}).caminho || '—')}` : admEscape((d.banco || {}).erro || '—')}</span></div>`
    } catch (e) { box.innerHTML = `<div class="adm-alert is-erro">Erro: ${admEscape(e.message || String(e))}</div>` }
}
async function admListarIncompletos() {
    const box = document.getElementById('adm-ferramenta-resultado')
    if (!box) return
    box.style.display = ''
    box.innerHTML = '<div style="color:var(--text-3);">Buscando…</div>'
    try {
        const r = await fetch(API + '/produtos/incompletos', { headers: authHeaders() })
        const j = await r.json().catch(() => null)
        // se a rota não existir, tentamos uma alternativa
        if (!r.ok || !Array.isArray(j)) {
            box.innerHTML = '<div class="adm-alert"><b style="color:var(--text-1)">Listar incompletos</b><br><span style="color:var(--text-3)">Abra a aba "Editar Produto" e busque " " (espaço) para listar — ou volte a pedir para integrar esta função.</span></div>'
            return
        }
        box.innerHTML = `<div style="font-size:12px; color:var(--text-2);">${j.length} produto(s) sem info principal:</div>` + j.slice(0, 30).map(p => `<div class="adm-log-row"><span>cod <b style="color:var(--text-1)">${admEscape(p.codigo)}</b></span><span>${admEscape(p.descricao || '—')}</span></div>`).join('')
    } catch (e) { box.innerHTML = `<div class="adm-alert is-erro">Erro: ${admEscape(e.message || String(e))}</div>` }
}
