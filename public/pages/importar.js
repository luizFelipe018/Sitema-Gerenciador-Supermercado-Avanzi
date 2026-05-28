function carregarImportar() {
    setActive('btn-importar')
    setConteudo(`
        <div class="dash-glass dash-animate" style="max-width:720px; margin:0 auto; padding:24px; display:flex; flex-direction:column; gap:20px;">

            <!-- Card principal -->
            <div style="padding:24px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px;">
                <h2 style="font-size:16px; font-weight:700; color:rgba(255,255,255,0.9); margin-bottom:4px;">Importar Produtos do Excel</h2>
                <p style="font-size:13px; color:rgba(255,255,255,0.4); margin-bottom:20px;">
                    Selecione o relatório exportado do sistema (Pesquisa Genérica de Produtos) em formato .xlsx.
                    Os produtos serão inseridos ou atualizados no banco automaticamente.
                </p>

                <label for="imp-xlsx-upload"
                    style="display:flex; flex-direction:column; align-items:center; justify-center; gap:8px; width:100%; padding:32px 16px; border:2px dashed rgba(255,255,255,0.1); border-radius:12px; cursor:pointer; transition:all 0.2s;"
                    onmouseover="this.style.borderColor='rgba(181,21,21,0.4)';this.style.background='rgba(181,21,21,0.05)'"
                    onmouseout="this.style.borderColor='rgba(255,255,255,0.1)';this.style.background='transparent'">
                    <svg width="36" height="36" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span style="font-size:13px; font-weight:600; color:rgba(255,255,255,0.5);">Selecionar arquivo .xlsx</span>
                    <span style="font-size:11px; color:rgba(255,255,255,0.3);">Relatório "Pesquisa Genérica de Produtos"</span>
                </label>
                <input id="imp-xlsx-upload" type="file" accept=".xlsx" style="display:none;">

                <div id="imp-arquivo-info" style="display:none; margin-top:16px; padding:12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); border-radius:10px; display:none; align-items:center; gap:12px;">
                    <svg width="24" height="24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <div>
                        <p id="imp-arquivo-nome" style="font-size:13px; font-weight:600; color:rgba(255,255,255,0.8);"></p>
                        <p id="imp-arquivo-tam" style="font-size:11px; color:rgba(255,255,255,0.3);"></p>
                    </div>
                </div>

                <button id="imp-btn-importar"
                    style="width:100%; padding:14px; margin-top:16px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:not-allowed; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s; opacity:0.4;" disabled>
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="display:inline; vertical-align:middle; margin-right:6px;"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Iniciar Importação
                </button>
            </div>

            <!-- Progresso -->
            <div id="imp-progresso" style="display:none; padding:24px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
                    <span style="font-size:13px; font-weight:600; color:rgba(255,255,255,0.7);">Importando...</span>
                    <span id="imp-pct" style="font-size:13px; font-weight:700; color:#b51515;">0%</span>
                </div>
                <div style="width:100%; background:rgba(255,255,255,0.06); border-radius:999px; height:12px; margin-bottom:12px; overflow:hidden;">
                    <div id="imp-barra" style="height:100%; border-radius:999px; transition:width 0.3s; width:0%; background:linear-gradient(135deg,#b51515,#8a0f0f);"></div>
                </div>
                <p id="imp-status-txt" style="font-size:11px; color:rgba(255,255,255,0.3);">Lendo arquivo...</p>
            </div>

            <!-- Resultado -->
            <div id="imp-resultado" style="display:none;"></div>

            <!-- Colunas importadas -->
            <div style="padding:24px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px;">
                <h3 style="font-size:13px; font-weight:700; color:rgba(255,255,255,0.7); margin-bottom:16px;">Colunas importadas</h3>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:12px; color:rgba(255,255,255,0.4);">
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Código</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Descrição</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> EAN</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Departamento</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Seção</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Grupo</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Família</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Status</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> NCM/SH</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Estoque Atual</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> PMZ</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Custo</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Preço Venda</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Preço Oferta</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Preço Venda Kg/L</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Preço Oferta Kg/L</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Validade</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Data Cadastro</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Data Alteração</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Qtde Vendida Mês</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Vendas Média</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Participa Cotação</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Quantidade KG/L</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Descrição KG/L</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Marca</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Última Alteração Preço</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Data Última Entrada</span>
                    <span style="display:flex; align-items:center; gap:6px;"><svg width="14" height="14" fill="none" stroke="#22c55e" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Aceita Troca</span>
                </div>
            </div>

        </div>
    `, 'Importar Produtos')

    let arquivoSelecionado = null

    document.getElementById('imp-xlsx-upload').onchange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        arquivoSelecionado = file

        const info = document.getElementById('imp-arquivo-info')
        info.style.display = 'flex'
        document.getElementById('imp-arquivo-nome').textContent = file.name
        document.getElementById('imp-arquivo-tam').textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB'

        const btn = document.getElementById('imp-btn-importar')
        btn.disabled = false
        btn.style.opacity = '1'
        btn.style.cursor = 'pointer'
    }

    document.getElementById('imp-btn-importar').onclick = async () => {
        if (!arquivoSelecionado) return

        const btn       = document.getElementById('imp-btn-importar')
        const progresso = document.getElementById('imp-progresso')
        const resultado = document.getElementById('imp-resultado')
        const barra     = document.getElementById('imp-barra')
        const pct       = document.getElementById('imp-pct')
        const statusTxt = document.getElementById('imp-status-txt')

        btn.disabled = true
        btn.style.opacity = '0.4'
        btn.style.cursor = 'not-allowed'
        btn.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="display:inline; vertical-align:middle; margin-right:6px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Importando...'
        progresso.style.display = 'block'
        resultado.style.display = 'none'

        let progVal = 0
        const progInterval = setInterval(() => {
            if (progVal < 85) {
                progVal += Math.random() * 3
                barra.style.width = progVal + '%'
                pct.textContent   = Math.floor(progVal) + '%'
                if (progVal < 20)       statusTxt.textContent = 'Lendo arquivo...'
                else if (progVal < 50)  statusTxt.textContent = 'Processando produtos...'
                else if (progVal < 80)  statusTxt.textContent = 'Gravando no banco de dados...'
            }
        }, 200)

        try {
            const formData = new FormData()
            formData.append('file', arquivoSelecionado)

            const res  = await fetch(API+'/importar/produtos', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            })
            const data = await res.json()

            clearInterval(progInterval)
            barra.style.width = '100%'
            pct.textContent   = '100%'
            statusTxt.textContent = 'Concluído!'

            if (!res.ok || data.error) {
                resultado.style.display = 'block'
                resultado.innerHTML = `
                    <div style="padding:20px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); border-radius:12px;">
                        <p style="font-size:14px; font-weight:700; color:#ef4444; margin-bottom:4px;">Erro na importação</p>
                        <p style="font-size:12px; color:rgba(239,68,68,0.7);">${data.error || 'Erro desconhecido'}</p>
                    </div>`
            } else {
                resultado.style.display = 'block'
                resultado.innerHTML = `
                    <div style="padding:20px; background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2); border-radius:12px;">
                        <p style="font-size:16px; font-weight:700; color:#22c55e; margin-bottom:16px;">Importação concluída!</p>
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                            <div style="padding:12px; background:rgba(255,255,255,0.04); border:1px solid rgba(34,197,94,0.15); border-radius:10px; text-align:center;">
                                <p style="font-size:24px; font-weight:800; color:#22c55e;">${data.total.toLocaleString('pt-BR')}</p>
                                <p style="font-size:11px; color:rgba(255,255,255,0.4); margin-top:4px;">Total no arquivo</p>
                            </div>
                            <div style="padding:12px; background:rgba(255,255,255,0.04); border:1px solid rgba(59,130,246,0.15); border-radius:10px; text-align:center;">
                                <p style="font-size:24px; font-weight:800; color:#60a5fa;">${data.inseridos.toLocaleString('pt-BR')}</p>
                                <p style="font-size:11px; color:rgba(255,255,255,0.4); margin-top:4px;">Inseridos/Atualizados</p>
                            </div>
                            <div style="padding:12px; background:rgba(255,255,255,0.04); border:1px solid rgba(239,68,68,0.15); border-radius:10px; text-align:center;">
                                <p style="font-size:24px; font-weight:800; color:#ef4444;">${data.erros}</p>
                                <p style="font-size:11px; color:rgba(255,255,255,0.4); margin-top:4px;">Erros</p>
                            </div>
                        </div>
                    </div>`

                btn.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="display:inline; vertical-align:middle; margin-right:6px;"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Importar novamente'
                btn.disabled    = false
                btn.style.opacity = '1'
                btn.style.cursor = 'pointer'
            }
        } catch (e) {
            clearInterval(progInterval)
            console.error(e)
            resultado.style.display = 'block'
            resultado.innerHTML = `
                <div style="padding:20px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); border-radius:12px;">
                    <p style="font-size:14px; font-weight:700; color:#ef4444;">Erro ao conectar com o servidor</p>
                </div>`
            btn.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="display:inline; vertical-align:middle; margin-right:6px;"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Tentar novamente'
            btn.disabled    = false
            btn.style.opacity = '1'
            btn.style.cursor = 'pointer'
        }
    }
}
