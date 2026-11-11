function carregarAdmin() {
    if (!isAdmin()) return

    setActive('btn-admin')
    const cargoUsuario = window.getCargo()
    setConteudo(`
        <!-- Saúde do Sistema -->
        <div class="dash-glass dash-animate cd" style="margin-bottom:20px;">
            <div class="ch" style="flex-wrap:wrap;gap:10px;">
                <h3 class="h3">
                    <svg style="width:16px; height:16px; vertical-align:middle; margin-right:6px; fill:var(--ok)" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                    Saúde do Sistema
                </h3>
                <button id="saude-btn-atualizar" class="btn-gr">
                    <svg style="width:12px; height:12px; vertical-align:middle; margin-right:4px; fill:currentColor;" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                    Atualizar
                </button>
            </div>
            <div class="cb">
                <div id="saude-kpis" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:10px;"></div>
                <div id="saude-pasta" style="margin-top:12px; font-size:12px; color:var(--text-2); line-height:1.6;"></div>
                <div id="saude-banco" style="margin-top:8px; font-size:12px; color:var(--text-2); line-height:1.6;"></div>
                <div id="saude-logs" style="margin-top:12px;"></div>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">

            <!-- Cadastrar usuário -->
            <div class="dash-glass dash-animate cd">
                <div class="ch">
                    <h3 class="h3">Cadastrar Usuário</h3>
                </div>
                <div class="cb fcc12">
                    <input id="admin-nome" type="text" placeholder="Nome completo" class="inp" />
                    <input id="admin-usuario" type="text" placeholder="Usuário (login)" class="inp" />
                    <input id="admin-senha" type="password" placeholder="Senha" class="inp" />
                    <select id="admin-cargo" class="sel">
                        <option value="atendente">Atendente</option>
                        <option value="gerente">Gerente</option>
                        <option value="administrador">Administrador</option>
                    </select>
                    <p id="admin-erro" class="er"></p>
                    <p id="admin-ok" class="ok"></p>
                    <button id="admin-salvar" class="btn-p">
                        Cadastrar
                    </button>
                </div>
            </div>

            <!-- Info do sistema -->
            <div class="dash-glass dash-animate cd">
                <div class="ch">
                    <h3 class="h3">Informações do Sistema</h3>
                </div>
                <div class="cb fcc8 tm">
                    <p>
                        <svg style="width:14px; height:14px; vertical-align:middle; margin-right:4px; fill:rgba(255,255,255,0.3);" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        Usuário logado: <span class="tb">${getUsuario()}</span>
                    </p>
                    <p>
                        <svg style="width:14px; height:14px; vertical-align:middle; margin-right:4px; fill:rgba(255,255,255,0.3);" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                        Perfil: <span class="tb">${cargoUsuario === 'administrador' ? 'Administrador' : cargoUsuario === 'gerente' ? 'Gerente' : 'Atendente'}</span>
                    </p>
                    <p>
                        <svg style="width:14px; height:14px; vertical-align:middle; margin-right:4px; fill:rgba(255,255,255,0.3);" viewBox="0 0 24 24"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>
                        Banco: <span class="tb">supermercado</span>
                    </p>
                    <p>
                        <svg style="width:14px; height:14px; vertical-align:middle; margin-right:4px; fill:rgba(255,255,255,0.3);" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                        Servidor: <span class="tb">localhost:3000</span>
                    </p>
                </div>
            </div>
        </div>

        <!-- Gerenciar Usuários -->
        <div class="dash-glass dash-animate cd" style="margin-bottom:20px;">
            <div class="ch">
                <h3 class="h3">Gerenciar Usuários</h3>
                <button id="btn-recargar-usuarios" class="btn-gr">
                    <svg style="width:12px; height:12px; vertical-align:middle; margin-right:4px; fill:currentColor;" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                    Atualizar
                </button>
            </div>
            <div class="cb">
                <div id="lista-usuarios"></div>
            </div>
        </div>

        <!-- Configurações do sistema -->
        <div class="dash-glass dash-animate cd" style="margin-bottom:20px;">
            <div class="ch">
                <h3 class="h3">
                    <svg style="width:16px; height:16px; vertical-align:middle; margin-right:6px; fill:rgba(255,255,255,0.4);" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                    Configurações
                </h3>
            </div>
            <div class="cb fcc" style="gap:16px;">

                <!-- Pasta de imagens -->
                <div class="fcc8">
                    <label class="lb">
                        <svg style="width:12px; height:12px; vertical-align:middle; margin-right:4px; fill:rgba(255,255,255,0.3);" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
                        Pasta de Imagens
                    </label>
                    <p class="ts">Caminho da pasta onde ficam as imagens dos produtos. Altere aqui ao trocar de máquina.</p>
                    <div class="frc8">
                        <input id="cfg-pasta-imagens" type="text" placeholder="Ex: E:\Banco de Imagens" class="inp-flex" />
                        <button id="cfg-btn-salvar-pasta" class="btn-p">
                            Salvar
                        </button>
                    </div>
                    <p id="cfg-pasta-msg" class="tsm"></p>
                </div>

                <!-- Pasta de imagens dos pratos -->
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">
                        <svg style="width:12px; height:12px; vertical-align:middle; margin-right:4px; fill:rgba(255,255,255,0.3);" viewBox="0 0 24 24"><path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/></svg>
                        Pasta de Imagens dos Pratos
                    </label>
                    <p style="font-size:12px; color:rgba(255,255,255,0.4);">Pasta com as fotos dos pratos para o cardápio do restaurante.</p>
                    <div class="frc8">
                        <input id="cfg-pasta-pratos" type="text" placeholder="Ex: E:\Imagens\Pratos" class="inp-flex" />
                        <button id="cfg-btn-salvar-pratos" class="btn-p">
                            Salvar
                        </button>
                    </div>
                    <p id="cfg-pratos-msg" class="tsm"></p>
                </div>

            </div>
        </div>

        <!-- Produtos incompletos -->
        <div class="dash-glass dash-animate cd" style="margin-bottom:20px;">
            <div class="ch" style="flex-wrap:wrap;gap:8px;">
                <h3 class="h3">Produtos com Informações Faltando</h3>
                <div class="frc8">
                    <button id="btn-verificar-incompletos" class="btn-p" style="font-size:12px;padding:6px 16px;border-radius:8px;">
                        <svg style="width:12px; height:12px; vertical-align:middle; margin-right:4px; fill:currentColor;" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                        Verificar
                    </button>
                    <button id="btn-revisao-por-marca" class="btn-gr">
                        <svg style="width:12px; height:12px; vertical-align:middle; margin-right:4px; fill:currentColor;" viewBox="0 0 24 24"><path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16zM16 17H5V7h11l3.55 5L16 17z"/></svg>
                        Revisar por Marca
                    </button>
                </div>
            </div>
            <div class="cb">
                <p class="tm">Clique em "Verificar" para analisar o banco.</p>
            </div>
        </div>

        <!-- Edição de produtos -->
        <div class="dash-glass dash-animate cd">
            <div class="ch">
                <h3 class="h3">Editar Produto</h3>
            </div>
            <div class="cb">

                <!-- Busca -->
                <div class="frc" style="margin-bottom:20px;">
                    <input id="prod-busca" type="text" placeholder="Digite o código, EAN ou parte do nome..." class="inp" style="flex:1;" />
                    <button id="prod-btn-buscar" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;padding:10px 20px;border-radius:10px;cursor:pointer;">
                        <svg style="width:14px; height:14px; vertical-align:middle; margin-right:4px; fill:currentColor;" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                        Buscar
                    </button>
                </div>

                <!-- Resultados da busca -->
                <div id="prod-resultados" style="margin-bottom:20px;"></div>

                <!-- Formulário de edição (oculto até selecionar) -->
                <div id="prod-form" style="display:none;">
                    <div style="border-top:1px solid rgba(255,255,255,0.06); padding-top:20px;">
                        <p class="lb" style="margin-bottom:16px;">
                            Editando: <span id="prod-editando" class="tb" style="text-transform:none;"></span>
                        </p>
                        <div style="display:flex; gap:12px; margin-bottom:16px; align-items:center;">
                            <button id="prod-btn-salvar" class="btn-p" style="padding:10px 24px;">
                                <svg style="width:14px; height:14px; vertical-align:middle; margin-right:4px; fill:currentColor;" viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
                                Salvar Alterações
                            </button>
                            <button id="prod-btn-cancelar" class="btn-s">
                                Cancelar
                            </button>
                            <p id="prod-msg" class="tsm" style="margin-left:8px;"></p>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="fcc">
                                <label class="lb">Descrição</label>
                                <input id="pe-descricao" type="text" class="inp" />
                            </div>
                            <div class="fcc">
                                <label class="lb">Marca</label>
                                <input id="pe-marca" type="text" class="inp" />
                            </div>
                            <div class="fcc">
                                <label class="lb">EAN</label>
                                <input id="pe-ean" type="text" class="inp" />
                            </div>
                            <div class="fcc">
                                <label class="lb">Preço de Venda</label>
                                <input id="pe-preco" type="number" step="0.01" class="inp" />
                            </div>
                            <div class="fcc">
                                <label class="lb">Departamento</label>
                                <input id="pe-departamento" type="text" class="inp" />
                            </div>
                            <div class="fcc">
                                <label class="lb">Descrição Departamento</label>
                                <input id="pe-descricao-dep" type="text" class="inp" />
                            </div>
                            <div class="fcc">
                                <label class="lb">Seção</label>
                                <input id="pe-secao" type="text" class="inp" />
                            </div>
                            <div class="fcc">
                                <label class="lb">Grupo</label>
                                <input id="pe-grupo" type="text" class="inp" />
                            </div>
                            <div class="fcc">
                                <label class="lb">Quantidade KG/L</label>
                                <input id="pe-qtd-kgl" type="number" step="0.001" class="inp" />
                            </div>
                            <div class="fcc">
                                <label class="lb">Unidade (KG/LT/UN)</label>
                                <input id="pe-kglt" type="text" class="inp" />
                            </div>
                        </div>


                    </div>
                </div>

            </div>
        </div>
    `, 'Admin')

    vincularEventosAdmin()
}

// ── SAÚDE DO SISTEMA ────────────────────────────────────
function formatMB(bytes) {
    const mb = bytes / (1024 * 1024)
    return mb >= 1024 ? (mb / 1024).toFixed(1) + ' GB' : Math.round(mb) + ' MB'
}
function formatUptime(seg) {
    const h = Math.floor(seg / 3600); const min = Math.floor((seg % 3600) / 60); const s = Math.floor(seg % 60)
    return `${h}h ${min}min ${s}s`
}

async function carregarSaude() {
    const kpis = document.getElementById('saude-kpis')
    const pastaEl = document.getElementById('saude-pasta')
    const bancoEl = document.getElementById('saude-banco')
    const logsEl = document.getElementById('saude-logs')
    const btn = document.getElementById('saude-btn-atualizar')
    if (btn) { btn.disabled = true; btn.textContent = 'Atualizando…' }
    const kpi = (label, value, cor) => `
        <div style="background:var(--surface-2); border:1px solid var(--border-soft); border-radius:var(--r-md); padding:12px 14px;">
            <div style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-3);">${label}</div>
            <div style="font-size:16px; font-weight:700; margin-top:4px; color:${cor || 'var(--text-1)'}">${value}</div>
        </div>`
    try {
        const res = await fetch(API + '/saude', { headers: authHeaders() })
        const d = await res.json()
        if (!res.ok) throw new Error(d.error || 'Falha ao ler dados')

        const bancoOk = d.banco && d.banco.conectado
        kpis.innerHTML =
            kpi('ERP', 'v' + (d.versao || '?')) +
            kpi('Node.js', String(d.node || '').replace(/^v/, 'v')) +
            kpi('Tempo ativo', formatUptime(d.uptimeSeg || 0)) +
            kpi('Plataforma', (d.plataforma || '?').replace('win32', 'Windows')) +
            kpi('Núcleos CPU', d.cpuNucleos || '?') +
            kpi('Memória livre', (d.memoriaLivreMB || 0).toLocaleString('pt-BR') + ' MB')

        const pasta = d.pastaImagens || {}
        const pastaOK = pasta.existe
        pastaEl.innerHTML =
            `<svg style="width:13px; height:13px; vertical-align:middle; margin-right:5px; fill:${pastaOK ? 'var(--ok)' : 'var(--danger)'}" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>` +
            `Pasta de imagens: <b style="color:${pastaOK ? 'var(--text-1)' : 'var(--danger)'}">${pastaOK ? 'OK' : 'não encontrada'}</b>` +
            ` · ${pasta.caminho ? `<code style="color:var(--text-2);">${pasta.caminho}</code>` : ''}` +
            (pastaOK ? ` · ${(pasta.arquivos || 0).toLocaleString('pt-BR')} arquivos${pasta.limitado ? ' (amostra)' : ''} · ${formatMB(pasta.bytesTotal || 0)}` : '')

        const prodOK = typeof d.produtos === 'number'
        bancoEl.innerHTML =
            `<svg style="width:13px; height:13px; vertical-align:middle; margin-right:5px; fill:${bancoOk ? 'var(--ok)' : 'var(--danger)'}" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>` +
            `Banco de dados: <b style="color:${bancoOk ? 'var(--text-1)' : 'var(--danger)'}">${bancoOk ? 'conectado' : 'ERRO' + (d.banco && d.banco.erro ? ' — ' + d.banco.erro : '')}</b>` +
            (prodOK ? ` · <b style="color:var(--text-1)">${d.produtos.toLocaleString('pt-BR')}</b> produtos` : '')

        if (Array.isArray(d.logs) && d.logs.length) {
            logsEl.innerHTML = `
                <div style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-3); margin-bottom:6px;">Últimas ações no sistema</div>
                ${d.logs.map(l => `
                    <div style="display:flex; gap:10px; align-items:baseline; padding:5px 10px; border-bottom:1px solid var(--border-soft); font-size:12px;">
                        <span style="color:var(--text-3); white-space:nowrap; font-family:monospace; font-size:10.5px;">${(l.quando || '').toString().replace('T', ' ').slice(0, 16)}</span>
                        <span style="color:var(--text-1); flex:0 0 auto; font-weight:600; min-width:80px;">${l.usuario || 'sistema'}</span>
                        <span style="color:var(--text-2); flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${l.descricao || l.acao || '—'}</span>
                    </div>`).join('')}`
        } else {
            logsEl.innerHTML = '<div style="font-size:12px; color:var(--text-3);">Nenhum log registrado ainda.</div>'
        }
    } catch (e) {
        kpis.innerHTML = `<div style="color:var(--danger); font-size:13px; grid-column:1/-1;">Erro ao ler dados do sistema: ${e.message || e}</div>`
        pastaEl.innerHTML = ''; bancoEl.innerHTML = ''; logsEl.innerHTML = ''
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = `<svg style="width:12px; height:12px; vertical-align:middle; margin-right:4px; fill:currentColor;" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>Atualizar` }
    }
}

// ── EVENTOS ADMIN ─────────────────────────────────────
function vincularEventosAdmin() {

    // Carregar lista de usuários
    carregarListaUsuarios()
    document.getElementById('btn-recargar-usuarios')?.addEventListener('click', carregarListaUsuarios)

    // Saúde do Sistema
    document.getElementById('saude-btn-atualizar')?.addEventListener('click', carregarSaude)
    carregarSaude()

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
            const res = await fetch(API+'/usuarios', {
                method: 'POST', headers: authHeaders(),
                body: JSON.stringify({ nome, usuario, senha, cargo })
            })
            const data = await res.json()
            if (res.ok) {
                okEl.textContent = `Usuário "${usuario}" cadastrado com sucesso!`
                document.getElementById('admin-nome').value = ''
                document.getElementById('admin-usuario').value = ''
                document.getElementById('admin-senha').value = ''
                document.getElementById('admin-cargo').value = 'atendente'
                carregarListaUsuarios()
            } else { erroEl.textContent = data.error ?? 'Erro ao cadastrar.' }
        } catch { erroEl.textContent = 'Erro ao conectar.' }
    }

    // Configuração — pasta de imagens
    carregarConfigPastaImagens()
    document.getElementById('cfg-btn-salvar-pasta').onclick = salvarConfigPastaImagens
    document.getElementById('cfg-pasta-imagens').onkeydown = (e) => {
        if (e.key === 'Enter') salvarConfigPastaImagens()
    }
    carregarConfigPastaProatos()
    document.getElementById('cfg-btn-salvar-pratos').onclick = salvarConfigPastaPratos
    document.getElementById('cfg-pasta-pratos').onkeydown = (e) => {
        if (e.key === 'Enter') salvarConfigPastaPratos()
    }
    document.getElementById('cfg-pasta-imagens').onkeydown = (e) => {
        if (e.key === 'Enter') salvarConfigPastaImagens()
    }

    // Verificar incompletos — onclick evita acúmulo de listeners
    document.getElementById('btn-verificar-incompletos').onclick = verificarIncompletos
    document.getElementById('btn-revisao-por-marca').onclick = abrirRevisaoPorMarca

    // Buscar produto
    document.getElementById('prod-btn-buscar').onclick = buscarProdutoAdmin
    document.getElementById('prod-busca').onkeydown = (e) => {
        if (e.key === 'Enter') buscarProdutoAdmin()
    }

    // Cancelar edição
    document.getElementById('prod-btn-cancelar').onclick = () => {
        document.getElementById('prod-form').style.display = 'none'
        document.getElementById('prod-resultados').innerHTML = ''
        document.getElementById('prod-busca').value = ''
        document.getElementById('prod-busca').focus()
    }
}

// ── BUSCAR PRODUTO ────────────────────────────────────
async function buscarProdutoAdmin() {
    const termo = document.getElementById('prod-busca').value.trim()
    if (!termo) return

    const resultadosEl = document.getElementById('prod-resultados')
    resultadosEl.innerHTML = `<p class="tm">Buscando...</p>`
    document.getElementById('prod-form').style.display = 'none'

    try {
        const res  = await fetch(API+`/produtos?busca=${encodeURIComponent(termo)}&page=1&limit=50`, { headers: authHeaders() })
        const json = await res.json()
        const data = json.data || []
        if (!Array.isArray(data)) { resultadosEl.innerHTML = `<p class="tm" style="color:#f87171;">Erro ao buscar.</p>`; return }

        const resultados = data.slice(0, 20)

        if (!resultados.length) {
            resultadosEl.innerHTML = `<p class="tm">Nenhum produto encontrado.</p>`
            return
        }

        resultadosEl.innerHTML = `
            <p style="font-size:11px; color:rgba(255,255,255,0.4); margin-bottom:8px;">${resultados.length} resultado(s) — clique para editar</p>
            <div class="dash-table-wrap">
                <table class="dash-table">
                    <thead><tr>
                        <th>Código</th>
                        <th>Descrição</th>
                        <th>Marca</th>
                        <th style="text-align:right;">Preço</th>
                    </tr></thead>
                    <tbody>
                        ${resultados.map((p, i) => `
                            <tr data-index="${i}">
                                <td style="font-family:monospace; font-size:11px; color:rgba(255,255,255,0.4);">${p.codigo}</td>
                                <td style="color:rgba(255,255,255,0.85); font-weight:500;">${p.descricao}</td>
                                <td style="color:rgba(255,255,255,0.4);">${p.marca || '<span style="color:rgba(248,113,113,0.5);">vazio</span>'}</td>
                                <td style="text-align:right; color:rgba(255,255,255,0.7);">R$ ${parseFloat(p.preco_venda || 0).toFixed(2).replace('.', ',')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `

        // Clique na linha abre o formulário
        resultadosEl.querySelectorAll('tbody tr').forEach(tr => {
            tr.addEventListener('click', () => {
                const i = parseInt(tr.getAttribute('data-index'))
                abrirFormEdicao(resultados[i])
            })
        })

    } catch { resultadosEl.innerHTML = `<p class="tm" style="color:#f87171;">Erro ao conectar com o servidor.</p>` }
}

// ── FORMULÁRIO DE EDIÇÃO ──────────────────────────────
function abrirFormEdicao(p) {
    document.getElementById('prod-editando').textContent = `${p.codigo} — ${p.descricao}`
    document.getElementById('pe-descricao').value    = p.descricao || ''
    document.getElementById('pe-marca').value        = p.marca || ''
    document.getElementById('pe-ean').value          = p.ean || ''
    document.getElementById('pe-preco').value        = p.preco_venda || ''
    document.getElementById('pe-departamento').value = p.departamento || ''
    document.getElementById('pe-descricao-dep').value = p.descricao_departamento || ''
    document.getElementById('pe-secao').value        = p.secao || ''
    document.getElementById('pe-grupo').value        = p.grupo || ''
    document.getElementById('pe-qtd-kgl').value      = p.quantidade_kg_l || ''
    document.getElementById('pe-kglt').value         = p.descricao_kglt || ''
    document.getElementById('prod-msg').textContent  = ''

    document.getElementById('prod-form').style.display = 'block'
    document.getElementById('prod-form').scrollIntoView({ behavior: 'smooth' })

    // Salvar alterações
    const btnSalvar = document.getElementById('prod-btn-salvar')
    const novoBtn   = btnSalvar.cloneNode(true) // remove listeners antigos
    btnSalvar.replaceWith(novoBtn)

    novoBtn.addEventListener('click', async () => {
        const msgEl = document.getElementById('prod-msg')
        msgEl.style.color = '#6b7280'
        msgEl.textContent = 'Salvando...'

        const body = {
            descricao:              document.getElementById('pe-descricao').value.trim(),
            marca:                  document.getElementById('pe-marca').value.trim(),
            ean:                    document.getElementById('pe-ean').value.trim(),
            preco_venda:            parseFloat(document.getElementById('pe-preco').value) || 0,
            departamento:           document.getElementById('pe-departamento').value.trim(),
            descricao_departamento: document.getElementById('pe-descricao-dep').value.trim(),
            secao:                  document.getElementById('pe-secao').value.trim(),
            grupo:                  document.getElementById('pe-grupo').value.trim(),
            quantidade_kg_l:        parseFloat(document.getElementById('pe-qtd-kgl').value) || 0,
            descricao_kglt:         document.getElementById('pe-kglt').value.trim(),
        }

        try {
            const res = await fetch(API+`/produtos/${p.codigo}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify(body)
            })
            const data = await res.json()

            if (res.ok) {
                msgEl.style.color = '#4ade80'
                msgEl.textContent = 'Salvo com sucesso!'
                // Atualiza o nome exibido
                document.getElementById('prod-editando').textContent = `${p.codigo} — ${body.descricao}`
                setTimeout(() => { if (msgEl) msgEl.textContent = '' }, 3000)
            } else {
                msgEl.style.color = '#f87171'
                msgEl.textContent = data.error ?? 'Erro ao salvar.'
            }
        } catch {
            msgEl.style.color = '#f87171'
            msgEl.textContent = 'Erro ao conectar com o servidor.'
        }
    })

    // Shift+Enter salva e vai para o próximo campo
    const inputsProd = ['pe-descricao','pe-marca','pe-ean','pe-preco','pe-departamento','pe-descricao-dep','pe-secao','pe-grupo','pe-qtd-kgl','pe-kglt']
    inputsProd.forEach((id, i) => {
        const el = document.getElementById(id)
        if (el) el.onkeydown = (e) => {
            if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault()
                novoBtn.click()
                const prox = inputsProd[i + 1]
                if (prox) document.getElementById(prox)?.focus()
            }
        }
    })
}

// ── PRODUTOS INCOMPLETOS ──────────────────────────────
const CAMPOS_VERIFICAR = [
    { campo: 'marca',                  label: 'Marca' },
    { campo: 'ean',                    label: 'EAN' },
    { campo: 'descricao_departamento', label: 'Desc. Departamento' },
    { campo: 'departamento',           label: 'Departamento' },
    { campo: 'secao',                  label: 'Seção' },
    { campo: 'grupo',                  label: 'Grupo' },
    { campo: 'descricao_kglt',         label: 'Unidade (KG/LT/UN)' },
    { campo: 'quantidade_kg_l',        label: 'Qtd KG/L' },
    { campo: 'preco_venda',            label: 'Preço de Venda' },
]

// Fila de revisão rápida
let filaRevisao = []
let filaIndex   = 0
let modoRevisao = false

function vazio(val) {
    if (val === null || val === undefined) return true
    const s = String(val).trim()
    return s === '' || s === '0' || s === '0.000' || s === '0.00'
}

async function verificarIncompletos() {
    const wrapper = document.getElementById('incompletos-wrapper')
    wrapper.innerHTML = `<p style="font-size:13px; color:rgba(255,255,255,0.4);">Carregando...</p>`

    try {
    const res  = await fetch(API+'/produtos?page=1&limit=5000', { headers: authHeaders() })
        const json = await res.json()
        const data = json.data || []
        if (!Array.isArray(data)) { wrapper.innerHTML = `<p style="font-size:13px; color:#f87171;">Erro ao carregar.</p>`; return }

        // Para cada campo, conta e lista os produtos com aquele campo vazio
        const grupos = CAMPOS_VERIFICAR.map(({ campo, label }) => {
            const produtos = data.filter(p => vazio(p[campo]))
            return { campo, label, produtos, total: produtos.length }
        }).filter(g => g.total > 0)

        if (!grupos.length) {
            wrapper.innerHTML = `<p style="font-size:13px; color:#4ade80; font-weight:600;">Todos os produtos estão completos!</p>`
            return
        }

        // Resumo com badges clicáveis
        const totalUnico = new Set(grupos.flatMap(g => g.produtos.map(p => p.codigo))).size

        wrapper.innerHTML = `
            <p style="font-size:11px; color:rgba(255,255,255,0.4); margin-bottom:16px;">${totalUnico} produto(s) com alguma informação faltando</p>

            <!-- Badges de filtro por campo -->
            <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px;" id="badges-incompletos">
                <button class="badge-campo" data-campo="todos"
                    style="padding:6px 12px; border-radius:9999px; font-size:11px; font-weight:600; border:2px solid; background:rgba(181,21,21,0.15); color:#f87171; border-color:rgba(181,21,21,0.3); cursor:pointer;">
                    Todos (${totalUnico})
                </button>
                ${grupos.map(g => `
                    <button class="badge-campo" data-campo="${g.campo}"
                        style="padding:6px 12px; border-radius:9999px; font-size:11px; font-weight:600; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.5); cursor:pointer;">
                        ${g.label} (${g.total})
                    </button>
                `).join('')}
            </div>

            <!-- Tabela de resultados -->
            <div id="tabela-incompletos"></div>
        `

        // Renderiza tabela inicial com todos
        renderTabelaIncompletos(grupos, 'todos')

        // Eventos dos badges
        wrapper.querySelectorAll('.badge-campo').forEach(btn => {
            btn.addEventListener('click', () => {
                wrapper.querySelectorAll('.badge-campo').forEach(b => {
                    b.style.background = 'rgba(255,255,255,0.04)'; b.style.color = 'rgba(255,255,255,0.5)'; b.style.borderColor = 'rgba(255,255,255,0.08)'
                })
                btn.style.background = 'rgba(181,21,21,0.15)'; btn.style.color = '#f87171'; btn.style.borderColor = 'rgba(181,21,21,0.3)'
                renderTabelaIncompletos(grupos, btn.getAttribute('data-campo'))
            })
        })

    } catch { wrapper.innerHTML = `<p style="font-size:13px; color:#f87171;">Erro ao conectar com o servidor.</p>` }
}

function renderTabelaIncompletos(grupos, campoFiltro) {
    const el = document.getElementById('tabela-incompletos')
    if (!el) return

    let produtos = []

    if (campoFiltro === 'todos') {
        // Todos os produtos únicos com qualquer campo vazio
        const mapa = {}
        grupos.forEach(g => {
            g.produtos.forEach(p => {
                if (!mapa[p.codigo]) mapa[p.codigo] = { ...p, campos_faltando: [] }
                mapa[p.codigo].campos_faltando.push(g.label)
            })
        })
        produtos = Object.values(mapa)
    } else {
        const grupo = grupos.find(g => g.campo === campoFiltro)
        if (!grupo) return
        produtos = grupo.produtos.map(p => ({ ...p, campos_faltando: [grupo.label] }))
    }

    if (!produtos.length) { el.innerHTML = `<p style="font-size:13px; color:rgba(255,255,255,0.4);">Nenhum produto nesta categoria.</p>`; return }

    el.innerHTML = `
        <div class="dash-table-wrap">
            <table class="dash-table">
                <thead><tr>
                    <th>Código</th>
                    <th>Descrição</th>
                    <th>Campos faltando</th>
                    <th style="text-align:center;">Ação</th>
                </tr></thead>
                <tbody>
                    ${produtos.slice(0, 200).map(p => `
                        <tr>
                            <td style="font-family:monospace; font-size:11px; color:rgba(255,255,255,0.4);">${p.codigo}</td>
                            <td style="color:rgba(255,255,255,0.85); font-weight:500;">${p.descricao}</td>
                            <td>
                                <div style="display:flex; flex-wrap:wrap; gap:4px;">
                                    ${p.campos_faltando.map(c =>
                                        `<span style="padding:2px 8px; border-radius:9999px; font-size:10px; font-weight:600; background:rgba(239,68,68,0.15); color:#f87171;">${c}</span>`
                                    ).join('')}
                                </div>
                            </td>
                            <td style="text-align:center;">
                                <button class="btn-editar-incompleto"
                                    style="background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 2px 8px rgba(181,21,21,0.2); color:#fff; font-size:11px; font-weight:600; padding:4px 12px; border-radius:6px; border:none; cursor:pointer;" data-codigo="${p.codigo}">
                                    Editar
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ${produtos.length > 200 ? `<p style="font-size:11px; color:rgba(255,255,255,0.3); padding:8px 16px;">Exibindo 200 de ${produtos.length} — use o filtro por campo para refinar</p>` : ''}
        </div>
        <div style="margin-top:16px;">
            <button id="btn-revisao-rapida" style="background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); color:#fff; font-size:13px; font-weight:600; padding:10px 20px; border-radius:10px; border:none; cursor:pointer;">
                <svg style="width:14px; height:14px; vertical-align:middle; margin-right:4px; fill:currentColor;" viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
                Iniciar Revisão Rápida (${produtos.length} produtos)
            </button>
        </div>
    `

    // Botão revisão rápida
    el.querySelector('#btn-revisao-rapida')?.addEventListener('click', () => {
        iniciarRevisaoRapida(produtos)
    })

    // Botão editar abre direto o formulário de edição
    el.querySelectorAll('.btn-editar-incompleto').forEach(btn => {
        btn.addEventListener('click', async () => {
            const codigo = btn.getAttribute('data-codigo')
            try {
                const res  = await fetch(API+`/produtos/${codigo}`, { headers: authHeaders() })
                const prod = await res.json()
                if (res.ok) {
                    abrirFormEdicao(prod)
                    document.getElementById('prod-form').scrollIntoView({ behavior: 'smooth' })
                }
            } catch { alert('Erro ao carregar produto.') }
        })
    })
}

// ── REVISÃO RÁPIDA ────────────────────────────────────
function iniciarRevisaoRapida(produtos) {
    filaRevisao = produtos
    filaIndex   = 0
    modoRevisao = true
    carregarProximoRevisao()
}

function carregarProximoRevisao() {
    if (filaIndex >= filaRevisao.length) {
        // Fim da fila
        document.getElementById('prod-form').style.display = 'none'
        const wrapper = document.getElementById('incompletos-wrapper')
        if (wrapper) {
            wrapper.innerHTML = `
                <div style="display:flex; align-items:center; gap:12px; color:#4ade80;">
                    <svg style="width:32px; height:32px; fill:#4ade80;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    <div>
                        <p style="font-weight:600;">Revisão concluída!</p>
                        <p style="font-size:11px; color:rgba(255,255,255,0.4); margin-top:2px;">${filaRevisao.length} produto(s) revisado(s).</p>
                    </div>
                    <button id="btn-nova-verificacao" style="background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); color:#fff; font-size:12px; font-weight:600; padding:6px 16px; border-radius:8px; border:none; cursor:pointer; margin-left:auto;">
                        Nova Verificação
                    </button>
                </div>
            `
            document.getElementById('btn-nova-verificacao')?.addEventListener('click', verificarIncompletos)
        }
        modoRevisao = false
        return
    }

    const p = filaRevisao[filaIndex]
    abrirFormEdicaoRevisao(p)
}

function abrirFormEdicaoRevisao(p) {
    // Preenche o form igual ao normal
    abrirFormEdicao(p)

    // Troca o header do form para mostrar progresso
    document.getElementById('prod-editando').innerHTML = `
        <span>${p.codigo} — ${p.descricao}</span>
        <span style="margin-left:12px; font-size:11px; font-weight:400; color:rgba(255,255,255,0.3);">${filaIndex + 1} de ${filaRevisao.length}</span>
    `

    // Adiciona barra de progresso e botão Pular se ainda não existir
    const form = document.getElementById('prod-form')
    let barra = document.getElementById('revisao-barra')
    if (!barra) {
        const div = document.createElement('div')
        div.id = 'revisao-barra'
        div.style.cssText = 'margin-bottom:12px;'
        div.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
                <span style="font-size:11px; color:rgba(255,255,255,0.4);">Progresso da revisão</span>
                <span id="revisao-progresso-txt" style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.5);"></span>
            </div>
            <div style="width:100%; background:rgba(255,255,255,0.06); border-radius:9999px; height:8px;">
                <div id="revisao-barra-fill" style="height:8px; border-radius:9999px; transition:width 0.3s; background:linear-gradient(135deg,#b51515,#8a0f0f);"></div>
            </div>
        `
        form.querySelector('[style*="border-top"]').prepend(div)
    }

    // Atualiza progresso
    const pct = Math.round((filaIndex / filaRevisao.length) * 100)
    document.getElementById('revisao-barra-fill').style.width = pct + '%'
    document.getElementById('revisao-progresso-txt').textContent = `${filaIndex + 1} / ${filaRevisao.length}`

    // Adiciona botão Pular se ainda não existir
    let btnPular = document.getElementById('btn-pular-revisao')
    if (!btnPular) {
        btnPular = document.createElement('button')
        btnPular.id = 'btn-pular-revisao'
        btnPular.textContent = 'Pular →'
        btnPular.style.cssText = 'border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.5); font-size:13px; font-weight:600; padding:10px 16px; border-radius:10px; cursor:pointer;'
        document.getElementById('prod-btn-cancelar').after(btnPular)
    }
    // Recria listener do pular para evitar duplicação
    const novoPular = btnPular.cloneNode(true)
    btnPular.replaceWith(novoPular)
    novoPular.addEventListener('click', () => {
        filaIndex++
        carregarProximoRevisao()
    })

    // Sobrescreve o salvar para avançar automaticamente
    const btnSalvar = document.getElementById('prod-btn-salvar')
    const novoSalvar = btnSalvar.cloneNode(true)
    novoSalvar.innerHTML = `<svg style="width:14px; height:14px; vertical-align:middle; margin-right:4px; fill:currentColor;" viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg> Salvar e Próximo`
    btnSalvar.replaceWith(novoSalvar)

    novoSalvar.addEventListener('click', async () => {
        const msgEl = document.getElementById('prod-msg')
        msgEl.style.color = '#6b7280'
        msgEl.textContent = 'Salvando...'

        const body = {
            descricao:              document.getElementById('pe-descricao').value.trim(),
            marca:                  document.getElementById('pe-marca').value.trim(),
            ean:                    document.getElementById('pe-ean').value.trim(),
            preco_venda:            parseFloat(document.getElementById('pe-preco').value) || 0,
            departamento:           document.getElementById('pe-departamento').value.trim(),
            descricao_departamento: document.getElementById('pe-descricao-dep').value.trim(),
            secao:                  document.getElementById('pe-secao').value.trim(),
            grupo:                  document.getElementById('pe-grupo').value.trim(),
            quantidade_kg_l:        parseFloat(document.getElementById('pe-qtd-kgl').value) || 0,
            descricao_kglt:         document.getElementById('pe-kglt').value.trim(),
        }

        try {
            const res = await fetch(API+`/produtos/${p.codigo}`, {
                method: 'PUT', headers: authHeaders(), body: JSON.stringify(body)
            })
            if (res.ok) {
                filaIndex++
                carregarProximoRevisao()
            } else {
                const data = await res.json()
                msgEl.style.color = '#f87171'
                msgEl.textContent = data.error ?? 'Erro ao salvar.'
            }
        } catch {
            msgEl.style.color = '#f87171'
            msgEl.textContent = 'Erro ao conectar.'
        }
    })

    // Cancelar revisão
    const btnCancelar = document.getElementById('prod-btn-cancelar')
    const novoCancelar = btnCancelar.cloneNode(true)
    novoCancelar.textContent = 'Cancelar Revisão'
    btnCancelar.replaceWith(novoCancelar)
    novoCancelar.addEventListener('click', () => {
        modoRevisao = false
        filaRevisao = []
        document.getElementById('prod-form').style.display = 'none'
        const barra = document.getElementById('revisao-barra')
        if (barra) barra.remove()
    })

    form.scrollIntoView({ behavior: 'smooth' })
}




// ── REVISÃO POR MARCA ─────────────────────────────────
let _todosProdutosMarca = [] // cache para não rebuscar toda vez

function abrirRevisaoPorMarca() {
    const wrapper = document.getElementById('incompletos-wrapper')
    document.getElementById('prod-form').style.display = 'none'

    wrapper.innerHTML = `
        <p style="font-size:11px; color:rgba(255,255,255,0.4); margin-bottom:12px;">
            Digite a marca, veja os produtos encontrados e aplique em todos de uma vez.
        </p>
        <div style="display:flex; gap:8px; margin-bottom:20px;">
            <input id="input-marca-busca" type="text" placeholder="Ex: marlux, seara, sadia..."
                style="flex:1; background:rgba(255,255,255,0.04); border:2px solid rgba(22,163,74,0.4); border-radius:10px; padding:10px 14px; font-size:13px; font-weight:600; color:#fafafa;" />
            <button id="btn-buscar-marca" style="background:linear-gradient(135deg,#16a34a,#0f7b37); box-shadow:0 4px 16px rgba(22,163,74,0.3); color:#fff; font-size:13px; font-weight:600; padding:10px 20px; border-radius:10px; border:none; cursor:pointer;">
                Buscar
            </button>
            <button id="btn-voltar-incompletos" style="border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.4); font-size:12px; padding:10px 16px; border-radius:10px; cursor:pointer;">
                <svg style="width:12px; height:12px; vertical-align:middle; margin-right:4px; fill:currentColor;" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                Voltar
            </button>
        </div>
        <div id="resultado-marca"></div>
    `

    document.getElementById('input-marca-busca').focus()

    // Usa onclick para evitar duplicação de listeners ao reutilizar a tela
    document.getElementById('btn-voltar-incompletos').onclick = verificarIncompletos
    document.getElementById('btn-buscar-marca').onclick = () => {
        const marca = document.getElementById('input-marca-busca').value.trim()
        if (marca) renderResultadoMarca(marca)
    }
    document.getElementById('input-marca-busca').onkeydown = (e) => {
        if (e.key === 'Enter') document.getElementById('btn-buscar-marca').click()
    }
}

async function carregarTodosProdutos() {
    if (_todosProdutosMarca.length > 0) return _todosProdutosMarca
    const res  = await fetch(API+'/produtos?page=1&limit=500', { headers: authHeaders() })
    const json = await res.json()
    const data = json.data || []
    if (Array.isArray(data)) _todosProdutosMarca = data
    return _todosProdutosMarca
}

async function renderResultadoMarca(marca) {
    const resultEl = document.getElementById('resultado-marca')
    resultEl.innerHTML = `<p style="font-size:13px; color:rgba(255,255,255,0.4);">Buscando...</p>`

    try {
        const data    = await carregarTodosProdutos()
        const termo   = marca.trim().toUpperCase()
        const produtos = data.filter(p => p.marca?.toUpperCase().includes(termo))

        if (!produtos.length) {
            resultEl.innerHTML = `<p style="font-size:13px; color:rgba(255,255,255,0.4);">Nenhum produto com "<strong>${marca}</strong>" na descrição.</p>`
            return
        }

        const semMarca = produtos.filter(p => vazio(p.marca))
        const marcaDif = produtos.filter(p => !vazio(p.marca) && p.marca.toUpperCase() !== termo)
        const marcaOk  = produtos.filter(p => p.marca?.toUpperCase() === termo)

        // Monta HTML — sem nenhum event listener inline
        resultEl.innerHTML = `
            <div style="display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap;">
                <span style="padding:6px 12px; border-radius:9999px; font-size:11px; font-weight:600; background:rgba(239,68,68,0.15); color:#f87171;">Sem marca: ${semMarca.length}</span>
                <span style="padding:6px 12px; border-radius:9999px; font-size:11px; font-weight:600; background:rgba(251,191,36,0.15); color:#fbbf24;">Marca diferente: ${marcaDif.length}</span>
                <span style="padding:6px 12px; border-radius:9999px; font-size:11px; font-weight:600; background:rgba(74,222,128,0.15); color:#4ade80;">Já correto: ${marcaOk.length}</span>
                <span style="padding:6px 12px; border-radius:9999px; font-size:11px; font-weight:600; background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.6);">Total: ${produtos.length}</span>
            </div>

            <div style="display:flex; align-items:flex-end; gap:12px; margin-bottom:16px; padding:16px; border-radius:12px; border:1px solid rgba(22,163,74,0.2); background:rgba(22,163,74,0.05);">
                <div style="display:flex; flex-direction:column; gap:4px; flex:1;">
                    <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#4ade80;">Marca a aplicar</label>
                    <input id="input-marca-aplicar" type="text" value="${termo}"
                        style="background:rgba(255,255,255,0.04); border:2px solid rgba(22,163,74,0.4); border-radius:10px; padding:10px 14px; font-size:13px; font-weight:700; color:#fafafa;">
                </div>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <button id="btn-aplicar-sem-marca" class="${semMarca.length === 0 ? 'opacity-40 cursor-not-allowed' : ''}" style="background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); color:#fff; font-size:13px; font-weight:600; padding:10px 20px; border-radius:10px; border:none; cursor:pointer;">
                        Aplicar nos ${semMarca.length} sem marca
                    </button>
                    <button id="btn-aplicar-todos" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.85); font-size:13px; font-weight:600; padding:10px 20px; border-radius:10px; cursor:pointer;">
                        Aplicar em todos os ${produtos.length}
                    </button>
                </div>
            </div>

            <p id="msg-aplicar" style="font-size:13px; font-weight:600; min-height:20px; margin-bottom:16px;"></p>

            <div class="dash-table-wrap">
                <table class="dash-table">
                    <thead><tr>
                        <th>Código</th>
                        <th>Descrição</th>
                        <th>Marca atual</th>
                    </tr></thead>
                    <tbody>
                        ${produtos.slice(0, 200).map(p => {
                            const cor = vazio(p.marca) ? '#f87171' : p.marca.toUpperCase() === termo ? '#4ade80' : '#fbbf24'
                            const bg  = vazio(p.marca) ? 'rgba(239,68,68,0.15)' : p.marca.toUpperCase() === termo ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.15)'
                            return `<tr>
                                <td style="font-family:monospace; font-size:11px; color:rgba(255,255,255,0.4);">${p.codigo}</td>
                                <td style="color:rgba(255,255,255,0.85);">${p.descricao}</td>
                                <td>
                                    <span style="padding:2px 8px; border-radius:9999px; font-size:10px; font-weight:600; background:${bg}; color:${cor};">
                                        ${vazio(p.marca) ? 'vazio' : p.marca}
                                    </span>
                                </td>
                            </tr>`
                        }).join('')}
                    </tbody>
                </table>
                ${produtos.length > 200 ? `<p style="font-size:11px; color:rgba(255,255,255,0.3); padding:8px 16px;">Mostrando 200 de ${produtos.length}</p>` : ''}
            </div>
        `

        // Usa onclick para garantir que não acumula listeners
        document.getElementById('btn-aplicar-sem-marca').onclick = semMarca.length > 0
            ? () => aplicarMarca(semMarca, marca)
            : null

        document.getElementById('btn-aplicar-todos').onclick = () => aplicarMarca(produtos, marca)

    } catch (e) {
        resultEl.innerHTML = `<p style="font-size:13px; color:#f87171;">Erro ao conectar.</p>`
        console.error(e)
    }
}

async function aplicarMarca(lista, marcaOriginal) {
    const novaM = document.getElementById('input-marca-aplicar').value.trim().toUpperCase()
    const msgEl = document.getElementById('msg-aplicar')

    if (!novaM) { msgEl.style.color = '#f87171'; msgEl.textContent = 'Preencha a marca.'; return }
    if (!confirm(`Aplicar a marca "${novaM}" em ${lista.length} produto(s)?`)) return

    // Desabilita botões durante o processo
    document.getElementById('btn-aplicar-sem-marca').onclick = null
    document.getElementById('btn-aplicar-todos').onclick     = null

    let ok = 0, erros = 0
    for (const p of lista) {
        try {
            const r = await fetch(API+`/produtos/${p.codigo}`, {
                method: 'PUT', headers: authHeaders(),
                body: JSON.stringify({
                    descricao: p.descricao, marca: novaM,
                    ean: p.ean || '', preco_venda: p.preco_venda || 0,
                    departamento: p.departamento || '',
                    descricao_departamento: p.descricao_departamento || '',
                    secao: p.secao || '', grupo: p.grupo || '',
                    quantidade_kg_l: p.quantidade_kg_l || 0,
                    descricao_kglt: p.descricao_kglt || ''
                })
            })
            if (r.ok) {
                // Atualiza cache local para evitar rebuscar tudo
                const idx = _todosProdutosMarca.findIndex(x => x.codigo === p.codigo)
                if (idx !== -1) _todosProdutosMarca[idx].marca = novaM
                ok++
            } else { erros++ }
        } catch { erros++ }

        msgEl.style.color = '#6b7280'
        msgEl.textContent = `Salvando... ${ok + erros} de ${lista.length}`
    }

    if (erros === 0) {
        msgEl.style.color = '#4ade80'
        msgEl.textContent = `Marca "${novaM}" aplicada em ${ok} produto(s)!`
    } else {
        msgEl.style.color = '#fbbf24'
        msgEl.textContent = `${ok} salvos, ${erros} com erro.`
    }

    // Atualiza a tabela usando o cache já atualizado — sem nova requisição
    setTimeout(() => renderResultadoMarca(marcaOriginal), 800)
}

// ── CONFIGURAÇÕES ─────────────────────────────────────
async function carregarConfigPastaImagens() {
    try {
        const res  = await fetch(API+'/configuracao/pasta_imagens', { headers: authHeaders() })
        const data = await res.json()
        const input = document.getElementById('cfg-pasta-imagens')
        if (input && res.ok) input.value = data.valor
    } catch {}
}

async function salvarConfigPastaImagens() {
    const input = document.getElementById('cfg-pasta-imagens')
    const msgEl = document.getElementById('cfg-pasta-msg')
    const valor = input?.value.trim()

    if (!valor) { msgEl.style.color = '#f87171'; msgEl.textContent = 'Preencha o caminho da pasta.'; return }

    msgEl.style.color = '#6b7280'; msgEl.textContent = 'Salvando...'

    try {
        const res = await fetch(API+'/configuracao/pasta_imagens', {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ valor })
        })
        if (res.ok) {
            msgEl.style.color = '#4ade80'
            msgEl.textContent = 'Pasta salva! A próxima busca de imagem já usará o novo caminho.'
            setTimeout(() => { if (msgEl) msgEl.textContent = '' }, 4000)
        } else {
            const data = await res.json()
            msgEl.style.color = '#f87171'; msgEl.textContent = data.error ?? 'Erro ao salvar.'
        }
    } catch {
        msgEl.style.color = '#f87171'; msgEl.textContent = 'Erro ao conectar com o servidor.'
    }
}

async function carregarConfigPastaProatos() {
    try {
        const res  = await fetch(API+'/configuracao/pasta_pratos', { headers: authHeaders() })
        const data = await res.json()
        const input = document.getElementById('cfg-pasta-pratos')
        if (input && res.ok) input.value = data.valor
    } catch {}
}

async function salvarConfigPastaPratos() {
    const input = document.getElementById('cfg-pasta-pratos')
    const msgEl = document.getElementById('cfg-pratos-msg')
    const valor = input?.value.trim()
    if (!valor) { msgEl.style.color = '#f87171'; msgEl.textContent = 'Preencha o caminho da pasta.'; return }
    msgEl.style.color = '#6b7280'; msgEl.textContent = 'Salvando...'
    try {
        const res = await fetch(API+'/configuracao/pasta_pratos', {
            method: 'PUT', headers: authHeaders(), body: JSON.stringify({ valor })
        })
        if (res.ok) {
            msgEl.style.color = '#4ade80'
            msgEl.textContent = 'Pasta dos pratos salva!'
            setTimeout(() => { if (msgEl) msgEl.textContent = '' }, 4000)
        } else {
            const data = await res.json()
            msgEl.style.color = '#f87171'; msgEl.textContent = data.error ?? 'Erro ao salvar.'
        }
    } catch { msgEl.style.color = '#f87171'; msgEl.textContent = 'Erro ao conectar.' }
}

// ── GERENCIAR USUÁRIOS ───────────────────────────────
async function carregarListaUsuarios() {
    const lista = document.getElementById('lista-usuarios')
    if (!lista) return

    lista.innerHTML = `<div class="ds-empty" style="padding:32px"><div class="ds-empty-text">Carregando…</div></div>`

    try {
        const res = await fetch(API+'/usuarios', { headers: authHeaders() })
        const usuarios = await res.json()

        if (!Array.isArray(usuarios)) {
            lista.innerHTML = `<div class="ds-empty" style="padding:32px"><div class="ds-empty-title" style="color:var(--danger)">Erro ao carregar</div></div>`
            return
        }

        if (usuarios.length === 0) {
            lista.innerHTML = `<div class="ds-empty" style="padding:32px"><div class="ds-empty-text">Nenhum usuário cadastrado.</div></div>`
            return
        }

        const usuarioLogado = getUsuario()
        const ehAdmin = isAdmin()

        lista.innerHTML = `
            <div style="overflow-x:auto">
            <table class="ds-table-prod">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th style="width:120px;">Usuário</th>
                        <th style="width:140px;">Cargo</th>
                        <th style="width:100px;">Status</th>
                        <th style="width:150px;">Último acesso</th>
                        <th style="width:210px; text-align:right;">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${usuarios.map(u => {
                        const isLogado = u.usuario === usuarioLogado
                        const ativo = Number(u.ativo) === 1
                        const cargo = u.cargo || 'atendente'
                        const badgeBg = cargo === 'administrador' ? 'var(--danger-soft)' : cargo === 'gerente' ? 'var(--warn-soft)' : 'var(--surface-3)'
                        const badgeColor = cargo === 'administrador' ? 'var(--danger)' : cargo === 'gerente' ? 'var(--warn)' : 'var(--text-2)'
                        return `
                        <tr style="${ativo ? '' : 'opacity:.55'}">
                            <td class="strong">${adminEsc(u.nome)}</td>
                            <td class="mono muted">${adminEsc(u.usuario)}</td>
                            <td>
                                <select class="cargo-select" data-id="${u.id}" data-cargo-atual="${cargo}"
                                    style="background:${badgeBg}; color:${badgeColor}; font-size:11px; font-weight:600; padding:4px 8px; border-radius:9999px; border:none; cursor:pointer; max-width:130px;">
                                    <option value="atendente" style="background:#141418;" ${cargo === 'atendente' ? 'selected' : ''}>Atendente</option>
                                    <option value="gerente" style="background:#141418;" ${cargo === 'gerente' ? 'selected' : ''}>Gerente</option>
                                    <option value="administrador" style="background:#141418;" ${cargo === 'administrador' ? 'selected' : ''}>Administrador</option>
                                </select>
                            </td>
                            <td>
                                <span class="ds-badge" style="background:${ativo ? 'var(--ok-soft)' : 'var(--surface-3)'}; color:${ativo ? 'var(--ok)' : 'var(--text-3)'}">
                                    ${ativo ? 'Ativo' : 'Inativo'}
                                </span>
                            </td>
                            <td class="muted" style="font-size:11.5px; white-space:nowrap">
                                ${u.ultimo_login ? adminDataHora(u.ultimo_login) : '<span style="opacity:.6">nunca</span>'}
                            </td>
                            <td style="text-align:right; white-space:nowrap">
                                ${ehAdmin && !isLogado ? `
                                    <button class="btn-ativar-usuario" data-id="${u.id}" data-ativo="${ativo ? 0 : 1}"
                                        style="background:${ativo ? 'var(--warn-soft)' : 'var(--ok-soft)'}; color:${ativo ? 'var(--warn)' : 'var(--ok)'}; font-size:11px; font-weight:600; padding:4px 10px; border-radius:6px; border:none; cursor:pointer; margin-right:4px;">
                                        ${ativo ? 'Desativar' : 'Ativar'}
                                    </button>
                                    <button class="btn-excluir-usuario" data-id="${u.id}" data-nome="${adminEsc(u.nome)}"
                                        style="background:var(--danger-soft); color:var(--danger); font-size:11px; font-weight:600; padding:4px 10px; border-radius:6px; border:none; cursor:pointer;">
                                        Excluir
                                    </button>` : (isLogado ? '<span style="font-size:11px; color:var(--text-3)">(você)</span>' : '')}
                            </td>
                        </tr>`
                    }).join('')}
                </tbody>
            </table>
            </div>`

        // Evento: mudar cargo
        lista.querySelectorAll('.cargo-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const id = e.target.dataset.id
                const novoCargo = e.target.value
                if (!confirm(`Alterar cargo para "${novoCargo}"?`)) {
                    e.target.value = e.target.dataset.cargoAtual
                    return
                }
                try {
                    const res = await fetch(API+`/usuarios/${id}/cargo`, {
                        method: 'PUT',
                        headers: authHeaders(),
                        body: JSON.stringify({ cargo: novoCargo })
                    })
                    if (res.ok) {
                        e.target.dataset.cargoAtual = novoCargo
                        const bg = novoCargo === 'administrador' ? 'var(--danger-soft)' : novoCargo === 'gerente' ? 'var(--warn-soft)' : 'var(--surface-3)'
                        const color = novoCargo === 'administrador' ? 'var(--danger)' : novoCargo === 'gerente' ? 'var(--warn)' : 'var(--text-2)'
                        e.target.style.background = bg
                        e.target.style.color = color
                        alert('Cargo atualizado!')
                    } else {
                        const data = await res.json()
                        alert(data.error || 'Erro ao atualizar.')
                        e.target.value = e.target.dataset.cargoAtual
                    }
                } catch { alert('Erro ao conectar.'); e.target.value = e.target.dataset.cargoAtual }
            })
        })

        // Evento: ativar/desativar usuário
        lista.querySelectorAll('.btn-ativar-usuario').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id
                const ativo = e.target.dataset.ativo === '1'
                if (!confirm(ativo
                    ? 'Desativar este usuário? Ele não conseguirá mais entrar no sistema.'
                    : 'Ativar este usuário? Ele voltará a conseguir entrar no sistema.')) return
                try {
                    const res = await fetch(API+`/usuarios/${id}/ativo`, {
                        method: 'PUT',
                        headers: authHeaders(),
                        body: JSON.stringify({ ativo: !ativo })
                    })
                    const data = await res.json()
                    if (res.ok) {
                        carregarListaUsuarios()
                    } else {
                        alert(data.error || 'Erro ao alterar status.')
                    }
                } catch { alert('Erro ao conectar.') }
            })
        })

        // Evento: excluir usuário
        lista.querySelectorAll('.btn-excluir-usuario').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id
                const nome = e.target.dataset.nome
                if (!confirm(`Excluir usuário "${nome}"? Esta ação não pode ser desfeita.`)) return
                try {
                    const res = await fetch(API+`/usuarios/${id}`, {
                        method: 'DELETE', headers: authHeaders()
                    })
                    if (res.ok) {
                        carregarListaUsuarios()
                    } else {
                        const data = await res.json()
                        alert(data.error || 'Erro ao excluir.')
                    }
                } catch { alert('Erro ao conectar.') }
            })
        })

    } catch {
        lista.innerHTML = `<div class="ds-empty" style="padding:32px"><div class="ds-empty-title" style="color:var(--danger)">Erro ao conectar</div></div>`
    }
}

/** Escapa HTML (nomes de usuário vêm do banco) */
function adminEsc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]))
}

/** Formata data/hora do banco */
function adminDataHora(valor) {
    if (!valor) return '—'
    const d = new Date(String(valor).replace(' ', 'T'))
    if (isNaN(d.getTime())) return String(valor)
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}
