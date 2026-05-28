function carregarAdmin() {
    if (!isAdmin()) return

    setActive('btn-admin')
    const cargoUsuario = window.getCargo()
    setConteudo(`
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">

            <!-- Cadastrar usuário -->
            <div class="dash-glass dash-animate" style="padding:20px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px;">
                <div style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.06);">
                    <h3 style="font-weight:600; color:rgba(255,255,255,0.85);">Cadastrar Usuário</h3>
                </div>
                <div style="padding:20px; display:flex; flex-direction:column; gap:12px;">
                    <input id="admin-nome" type="text" placeholder="Nome completo"
                        style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa;" />
                    <input id="admin-usuario" type="text" placeholder="Usuário (login)"
                        style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa;" />
                    <input id="admin-senha" type="password" placeholder="Senha"
                        style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa;" />
                    <select id="admin-cargo" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa;">
                        <option value="atendente" style="background:#1a1a2e;">Atendente</option>
                        <option value="gerente" style="background:#1a1a2e;">Gerente</option>
                        <option value="administrador" style="background:#1a1a2e;">Administrador</option>
                    </select>
                    <p id="admin-erro" style="font-size:12px; color:#f87171; min-height:16px;"></p>
                    <p id="admin-ok" style="font-size:12px; color:#4ade80; min-height:16px;"></p>
                    <button id="admin-salvar" style="background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); color:#fff; font-size:13px; font-weight:600; padding:10px 20px; border-radius:10px; border:none; cursor:pointer;">
                        Cadastrar
                    </button>
                </div>
            </div>

            <!-- Info do sistema -->
            <div class="dash-glass dash-animate" style="padding:20px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px;">
                <div style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.06);">
                    <h3 style="font-weight:600; color:rgba(255,255,255,0.85);">Informações do Sistema</h3>
                </div>
                <div style="padding:20px; display:flex; flex-direction:column; gap:8px; font-size:13px; color:rgba(255,255,255,0.4);">
                    <p>
                        <svg style="width:14px; height:14px; vertical-align:middle; margin-right:4px; fill:rgba(255,255,255,0.3);" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        Usuário logado: <span style="font-weight:600; color:rgba(255,255,255,0.85);">${getUsuario()}</span>
                    </p>
                    <p>
                        <svg style="width:14px; height:14px; vertical-align:middle; margin-right:4px; fill:rgba(255,255,255,0.3);" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                        Perfil: <span style="font-weight:600; color:rgba(255,255,255,0.85);">${cargoUsuario === 'administrador' ? 'Administrador' : cargoUsuario === 'gerente' ? 'Gerente' : 'Atendente'}</span>
                    </p>
                    <p>
                        <svg style="width:14px; height:14px; vertical-align:middle; margin-right:4px; fill:rgba(255,255,255,0.3);" viewBox="0 0 24 24"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>
                        Banco: <span style="font-weight:600; color:rgba(255,255,255,0.85);">supermercado</span>
                    </p>
                    <p>
                        <svg style="width:14px; height:14px; vertical-align:middle; margin-right:4px; fill:rgba(255,255,255,0.3);" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                        Servidor: <span style="font-weight:600; color:rgba(255,255,255,0.85);">localhost:3000</span>
                    </p>
                </div>
            </div>
        </div>

        <!-- Gerenciar Usuários -->
        <div class="dash-glass dash-animate" style="padding:20px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px; margin-bottom:20px;">
            <div style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:space-between;">
                <h3 style="font-weight:600; color:rgba(255,255,255,0.85);">Gerenciar Usuários</h3>
                <button id="btn-recargar-usuarios" style="background:linear-gradient(135deg,#16a34a,#0f7b37); box-shadow:0 4px 16px rgba(22,163,74,0.3); color:#fff; font-size:12px; font-weight:600; padding:6px 16px; border-radius:8px; border:none; cursor:pointer;">
                    <svg style="width:12px; height:12px; vertical-align:middle; margin-right:4px; fill:currentColor;" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                    Atualizar
                </button>
            </div>
            <div style="padding:20px;">
                <div id="lista-usuarios"></div>
            </div>
        </div>

        <!-- Configurações do sistema -->
        <div class="dash-glass dash-animate" style="padding:20px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px; margin-bottom:20px;">
            <div style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.06);">
                <h3 style="font-weight:600; color:rgba(255,255,255,0.85);">
                    <svg style="width:16px; height:16px; vertical-align:middle; margin-right:6px; fill:rgba(255,255,255,0.4);" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                    Configurações
                </h3>
            </div>
            <div style="padding:20px; display:flex; flex-direction:column; gap:16px;">

                <!-- Pasta de imagens -->
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">
                        <svg style="width:12px; height:12px; vertical-align:middle; margin-right:4px; fill:rgba(255,255,255,0.3);" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
                        Pasta de Imagens
                    </label>
                    <p style="font-size:12px; color:rgba(255,255,255,0.4);">Caminho da pasta onde ficam as imagens dos produtos. Altere aqui ao trocar de máquina.</p>
                    <div style="display:flex; gap:8px;">
                        <input id="cfg-pasta-imagens" type="text" placeholder="Ex: E:\Banco de Imagens"
                            style="flex:1; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; font-family:monospace;" />
                        <button id="cfg-btn-salvar-pasta" style="background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); color:#fff; font-size:13px; font-weight:600; padding:10px 20px; border-radius:10px; border:none; cursor:pointer;">
                            Salvar
                        </button>
                    </div>
                    <p id="cfg-pasta-msg" style="font-size:12px; min-height:16px;"></p>
                </div>

                <!-- Pasta de imagens dos pratos -->
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">
                        <svg style="width:12px; height:12px; vertical-align:middle; margin-right:4px; fill:rgba(255,255,255,0.3);" viewBox="0 0 24 24"><path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/></svg>
                        Pasta de Imagens dos Pratos
                    </label>
                    <p style="font-size:12px; color:rgba(255,255,255,0.4);">Pasta com as fotos dos pratos para o cardápio do restaurante.</p>
                    <div style="display:flex; gap:8px;">
                        <input id="cfg-pasta-pratos" type="text" placeholder="Ex: E:\Imagens\Pratos"
                            style="flex:1; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; font-family:monospace;" />
                        <button id="cfg-btn-salvar-pratos" style="background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); color:#fff; font-size:13px; font-weight:600; padding:10px 20px; border-radius:10px; border:none; cursor:pointer;">
                            Salvar
                        </button>
                    </div>
                    <p id="cfg-pratos-msg" style="font-size:12px; min-height:16px;"></p>
                </div>

            </div>
        </div>

        <!-- Produtos incompletos -->
        <div class="dash-glass dash-animate" style="padding:20px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px; margin-bottom:20px;">
            <div style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
                <h3 style="font-weight:600; color:rgba(255,255,255,0.85);">Produtos com Informações Faltando</h3>
                <div style="display:flex; gap:8px;">
                    <button id="btn-verificar-incompletos" style="background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); color:#fff; font-size:12px; font-weight:600; padding:6px 16px; border-radius:8px; border:none; cursor:pointer;">
                        <svg style="width:12px; height:12px; vertical-align:middle; margin-right:4px; fill:currentColor;" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                        Verificar
                    </button>
                    <button id="btn-revisao-por-marca" style="background:linear-gradient(135deg,#16a34a,#0f7b37); box-shadow:0 4px 16px rgba(22,163,74,0.3); color:#fff; font-size:12px; font-weight:600; padding:6px 16px; border-radius:8px; border:none; cursor:pointer;">
                        <svg style="width:12px; height:12px; vertical-align:middle; margin-right:4px; fill:currentColor;" viewBox="0 0 24 24"><path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16zM16 17H5V7h11l3.55 5L16 17z"/></svg>
                        Revisar por Marca
                    </button>
                </div>
            </div>
            <div id="incompletos-wrapper" style="padding:20px;">
                <p style="font-size:13px; color:rgba(255,255,255,0.4);">Clique em "Verificar" para analisar o banco.</p>
            </div>
        </div>

        <!-- Edição de produtos -->
        <div class="dash-glass dash-animate" style="padding:20px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px;">
            <div style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.06);">
                <h3 style="font-weight:600; color:rgba(255,255,255,0.85);">Editar Produto</h3>
            </div>
            <div style="padding:20px;">

                <!-- Busca -->
                <div style="display:flex; gap:12px; margin-bottom:20px;">
                    <input id="prod-busca" type="text" placeholder="Digite o código, EAN ou parte do nome..."
                        style="flex:1; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa;" />
                    <button id="prod-btn-buscar" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.85); font-size:13px; font-weight:600; padding:10px 20px; border-radius:10px; cursor:pointer;">
                        <svg style="width:14px; height:14px; vertical-align:middle; margin-right:4px; fill:currentColor;" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                        Buscar
                    </button>
                </div>

                <!-- Resultados da busca -->
                <div id="prod-resultados" style="margin-bottom:20px;"></div>

                <!-- Formulário de edição (oculto até selecionar) -->
                <div id="prod-form" style="display:none;">
                    <div style="border-top:1px solid rgba(255,255,255,0.06); padding-top:20px;">
                        <p style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3); margin-bottom:16px;">
                            Editando: <span id="prod-editando" style="color:rgba(255,255,255,0.85); text-transform:none; font-weight:600;"></span>
                        </p>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Descrição</label>
                                <input id="pe-descricao" type="text" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa;" />
                            </div>
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Marca</label>
                                <input id="pe-marca" type="text" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa;" />
                            </div>
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">EAN</label>
                                <input id="pe-ean" type="text" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa;" />
                            </div>
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Preço de Venda</label>
                                <input id="pe-preco" type="number" step="0.01" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa;" />
                            </div>
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Departamento</label>
                                <input id="pe-departamento" type="text" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa;" />
                            </div>
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Descrição Departamento</label>
                                <input id="pe-descricao-dep" type="text" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa;" />
                            </div>
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Seção</label>
                                <input id="pe-secao" type="text" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa;" />
                            </div>
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Grupo</label>
                                <input id="pe-grupo" type="text" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa;" />
                            </div>
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Quantidade KG/L</label>
                                <input id="pe-qtd-kgl" type="number" step="0.001" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa;" />
                            </div>
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Unidade (KG/LT/UN)</label>
                                <input id="pe-kglt" type="text" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa;" />
                            </div>
                        </div>

                        <div style="display:flex; gap:12px; margin-top:20px; align-items:center;">
                            <button id="prod-btn-salvar" style="background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); color:#fff; font-size:13px; font-weight:600; padding:10px 24px; border-radius:10px; border:none; cursor:pointer;">
                                <svg style="width:14px; height:14px; vertical-align:middle; margin-right:4px; fill:currentColor;" viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
                                Salvar Alterações
                            </button>
                            <button id="prod-btn-cancelar" style="border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.6); font-size:13px; font-weight:600; padding:10px 16px; border-radius:10px; cursor:pointer;">
                                Cancelar
                            </button>
                            <p id="prod-msg" style="font-size:12px; min-height:16px; margin-left:8px;"></p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `, 'Admin')

    vincularEventosAdmin()
}

// ── EVENTOS ADMIN ─────────────────────────────────────
function vincularEventosAdmin() {

    // Carregar lista de usuários
    carregarListaUsuarios()
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
    resultadosEl.innerHTML = `<p style="font-size:13px; color:rgba(255,255,255,0.4);">Buscando...</p>`
    document.getElementById('prod-form').style.display = 'none'

    try {
        const res  = await fetch(API+`/produtos?busca=${encodeURIComponent(termo)}&page=1&limit=50`, { headers: authHeaders() })
        const json = await res.json()
        const data = json.data || []
        if (!Array.isArray(data)) { resultadosEl.innerHTML = `<p style="font-size:13px; color:#f87171;">Erro ao buscar.</p>`; return }

        const resultados = data.slice(0, 20)

        if (!resultados.length) {
            resultadosEl.innerHTML = `<p style="font-size:13px; color:rgba(255,255,255,0.4);">Nenhum produto encontrado.</p>`
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

    } catch { resultadosEl.innerHTML = `<p style="font-size:13px; color:#f87171;">Erro ao conectar com o servidor.</p>` }
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
        const res  = await fetch(API+'/produtos?page=1&limit=500', { headers: authHeaders() })
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
        const produtos = data.filter(p => p.descricao?.toUpperCase().includes(termo))

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

    lista.innerHTML = `<p style="font-size:13px; color:rgba(255,255,255,0.4);">Carregando...</p>`

    try {
        const res = await fetch(API+'/usuarios', { headers: authHeaders() })
        const usuarios = await res.json()

        if (!Array.isArray(usuarios)) {
            lista.innerHTML = `<p style="font-size:13px; color:#f87171;">Erro ao carregar.</p>`
            return
        }

        if (usuarios.length === 0) {
            lista.innerHTML = `<p style="font-size:13px; color:rgba(255,255,255,0.4);">Nenhum usuário cadastrado.</p>`
            return
        }

        const usuarioLogado = getUsuario()

        lista.innerHTML = `
            <div class="dash-table-wrap">
                <table class="dash-table">
                    <thead><tr>
                        <th>Nome</th>
                        <th>Usuário</th>
                        <th>Cargo</th>
                        <th style="text-align:center;">Ações</th>
                    </tr></thead>
                    <tbody>
                        ${usuarios.map(u => {
                            const badgeBg = u.cargo === 'administrador' ? 'rgba(239,68,68,0.15)' : u.cargo === 'gerente' ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.06)'
                            const badgeColor = u.cargo === 'administrador' ? '#f87171' : u.cargo === 'gerente' ? '#fbbf24' : 'rgba(255,255,255,0.6)'
                            const isLogado = u.usuario === usuarioLogado
                            return `
                                <tr>
                                    <td style="color:rgba(255,255,255,0.85); font-weight:500;">${u.nome}</td>
                                    <td style="color:rgba(255,255,255,0.4); font-family:monospace; font-size:11px;">${u.usuario}</td>
                                    <td>
                                        <select class="cargo-select"
                                            data-id="${u.id}" data-cargo-atual="${u.cargo}"
                                            style="background:${badgeBg}; color:${badgeColor}; font-size:11px; font-weight:600; padding:4px 8px; border-radius:9999px; border:none; cursor:pointer;">
                                            <option value="atendente" style="background:#1a1a2e;" ${u.cargo === 'atendente' ? 'selected' : ''}>Atendente</option>
                                            <option value="gerente" style="background:#1a1a2e;" ${u.cargo === 'gerente' ? 'selected' : ''}>Gerente</option>
                                            <option value="administrador" style="background:#1a1a2e;" ${u.cargo === 'administrador' ? 'selected' : ''}>Administrador</option>
                                        </select>
                                    </td>
                                    <td style="text-align:center;">
                                        ${!isLogado ? `<button class="btn-excluir-usuario" style="background:rgba(239,68,68,0.15); color:#f87171; font-size:11px; font-weight:600; padding:4px 12px; border-radius:6px; border:none; cursor:pointer;" data-id="${u.id}" data-nome="${u.nome}">Excluir</button>` : '<span style="font-size:11px; color:rgba(255,255,255,0.3);">(você)</span>'}
                                    </td>
                                </tr>
                            `
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `

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
                        const bg = novoCargo === 'administrador' ? 'rgba(239,68,68,0.15)' : novoCargo === 'gerente' ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.06)'
                        const color = novoCargo === 'administrador' ? '#f87171' : novoCargo === 'gerente' ? '#fbbf24' : 'rgba(255,255,255,0.6)'
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
        lista.innerHTML = `<p style="font-size:13px; color:#f87171;">Erro ao conectar.</p>`
    }
}
