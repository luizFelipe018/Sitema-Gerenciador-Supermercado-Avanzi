/* ═══════════════════════════════════════════════════════════════
   PÁGINA IMPORTAR — upload de planilha de produtos
   Design system v2 (public/design.css)
   ═══════════════════════════════════════════════════════════════ */

const COLUNAS_IMPORTADAS = [
    'Código', 'Descrição', 'EAN', 'Departamento', 'Seção', 'Grupo', 'Família', 'Status', 'NCM/SH',
    'Estoque Atual', 'PMZ', 'Custo', 'Preço Venda', 'Preço Oferta', 'Preço Venda Kg/L',
    'Preço Oferta Kg/L', 'Validade', 'Data Cadastro', 'Data Alteração', 'Qtde Vendida Mês',
    'Vendas Média', 'Participa Cotação', 'Quantidade KG/L', 'Descrição KG/LT', 'Marca',
    'Última Alteração Preço', 'Data Última Entrada', 'Aceita Troca'
]

function carregarImportar() {
    setActive('btn-importar')

    setConteudo(`
        <div class="ds-page-head fade-in">
            <div>
                <div class="ds-page-eyebrow">Dados</div>
                <h1 class="ds-page-title">Importar produtos</h1>
                <p class="ds-page-sub">Envie o relatório "Pesquisa Genérica de Produtos" em .xlsx — os registros são inseridos ou atualizados automaticamente.</p>
            </div>
        </div>

        <div class="ds-grid" style="grid-template-columns:1.2fr 1fr; align-items:start">
            <!-- Upload -->
            <div class="ds-card ds-card-pad">
                <label for="imp-xlsx-upload" class="ds-dropzone" id="imp-dropzone">
                    <span class="ds-dropzone-ico">
                        <svg width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                    </span>
                    <span class="ds-dropzone-title">Selecionar arquivo .xlsx</span>
                    <span class="ds-dropzone-sub">ou arraste o arquivo para cá</span>
                </label>
                <input id="imp-xlsx-upload" type="file" accept=".xlsx" style="display:none;">

                <div id="imp-arquivo-info" class="ds-fileinfo" style="display:none;">
                    <span class="ds-fileinfo-ico">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                    </span>
                    <span style="min-width:0">
                        <span class="ds-fileinfo-name" id="imp-arquivo-nome"></span>
                        <span class="ds-fileinfo-size" id="imp-arquivo-tam"></span>
                    </span>
                </div>

                <button id="imp-btn-importar" class="ds-btn ds-btn-primary" style="width:100%; margin-top:14px; height:42px; opacity:.45; cursor:not-allowed;" disabled>
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Iniciar importação
                </button>

                <div id="imp-progresso" style="display:none; margin-top:16px;">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                        <span style="font-size:12.5px; font-weight:600; color:var(--text-2);">Importando…</span>
                        <span id="imp-pct" style="font-size:12.5px; font-weight:800; color:var(--brand-text);">0%</span>
                    </div>
                    <div class="ds-progress"><div id="imp-barra" class="ds-progress-fill" style="width:0%"></div></div>
                    <p id="imp-status-txt" class="ds-progress-note">Lendo arquivo…</p>
                </div>

                <div id="imp-resultado" style="display:none; margin-top:16px;"></div>
            </div>

            <!-- Colunas -->
            <div class="ds-card">
                <div class="ds-card-head">
                    <div class="ds-card-title">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                        Colunas importadas
                        <span style="text-transform:none;letter-spacing:0;font-weight:500;color:var(--text-3)">· ${COLUNAS_IMPORTADAS.length}</span>
                    </div>
                </div>
                <div class="ds-card-pad">
                    <div class="ds-cols">
                        ${COLUNAS_IMPORTADAS.map(c => `
                            <span class="ds-col-item">
                                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.6" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                                ${c}
                            </span>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `, 'Importar Produtos')

    let arquivoSelecionado = null
    const input = document.getElementById('imp-xlsx-upload')
    const dropzone = document.getElementById('imp-dropzone')
    const btn = document.getElementById('imp-btn-importar')

    const selecionarArquivo = (file) => {
        if (!file) return
        if (!/\.xlsx$/i.test(file.name)) {
            alert('Selecione um arquivo .xlsx (Excel).')
            return
        }
        arquivoSelecionado = file

        const info = document.getElementById('imp-arquivo-info')
        info.style.display = 'flex'
        document.getElementById('imp-arquivo-nome').textContent = file.name
        document.getElementById('imp-arquivo-tam').textContent = (file.size / 1024).toFixed(0) + ' KB'

        btn.disabled = false
        btn.style.opacity = '1'
        btn.style.cursor = 'pointer'
    }

    input.addEventListener('change', e => selecionarArquivo(e.target.files[0]))

    // drag & drop
    ;['dragenter', 'dragover'].forEach(ev => dropzone.addEventListener(ev, e => {
        e.preventDefault()
        dropzone.classList.add('is-over')
    }))
    ;['dragleave', 'drop'].forEach(ev => dropzone.addEventListener(ev, e => {
        e.preventDefault()
        dropzone.classList.remove('is-over')
    }))
    dropzone.addEventListener('drop', e => {
        const file = e.dataTransfer?.files?.[0]
        if (file) selecionarArquivo(file)
    })

    btn.addEventListener('click', async () => {
        if (!arquivoSelecionado) return

        const progresso = document.getElementById('imp-progresso')
        const resultado = document.getElementById('imp-resultado')
        const barra = document.getElementById('imp-barra')
        const pct = document.getElementById('imp-pct')
        const statusTxt = document.getElementById('imp-status-txt')

        btn.disabled = true
        btn.style.opacity = '.45'
        btn.style.cursor = 'not-allowed'
        btn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="animation:spin 1s linear infinite"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Importando…`
        progresso.style.display = 'block'
        resultado.style.display = 'none'

        let progVal = 0
        const progInterval = setInterval(() => {
            if (progVal < 85) {
                progVal += Math.random() * 3
                barra.style.width = progVal + '%'
                pct.textContent = Math.floor(progVal) + '%'
                if (progVal < 20) statusTxt.textContent = 'Lendo arquivo…'
                else if (progVal < 50) statusTxt.textContent = 'Processando produtos…'
                else if (progVal < 80) statusTxt.textContent = 'Gravando no banco de dados…'
            }
        }, 200)

        const restaurarBotao = (rotulo) => {
            btn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> ${rotulo}`
            btn.disabled = false
            btn.style.opacity = '1'
            btn.style.cursor = 'pointer'
        }

        try {
            const formData = new FormData()
            formData.append('file', arquivoSelecionado)

            const res = await fetch(API + '/importar/produtos', {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: formData
            })
            const data = await res.json()

            clearInterval(progInterval)
            barra.style.width = '100%'
            pct.textContent = '100%'
            statusTxt.textContent = 'Concluído!'

            if (!res.ok || data.error) {
                resultado.style.display = 'block'
                resultado.innerHTML = `
                    <div class="ds-alert-box" style="--alert-color:var(--danger); --alert-bg:var(--danger-soft);">
                        <p class="ds-alert-title">Erro na importação</p>
                        <p class="ds-alert-text">${dashEscSafe(data.error || 'Erro desconhecido')}</p>
                    </div>`
                restaurarBotao('Tentar novamente')
            } else {
                resultado.style.display = 'block'
                resultado.innerHTML = `
                    <div class="ds-alert-box" style="--alert-color:var(--ok); --alert-bg:var(--ok-soft);">
                        <p class="ds-alert-title">Importação concluída!</p>
                        <div class="ds-grid ds-grid-3" style="margin-top:14px;">
                            <div class="ds-tile" style="text-align:center">
                                <span class="ds-tile-value" style="color:var(--ok)">${Number(data.total || 0).toLocaleString('pt-BR')}</span>
                                <span class="ds-tile-label">Total no arquivo</span>
                            </div>
                            <div class="ds-tile" style="text-align:center">
                                <span class="ds-tile-value" style="color:var(--info)">${Number(data.inseridos || 0).toLocaleString('pt-BR')}</span>
                                <span class="ds-tile-label">Inseridos/Atualizados</span>
                            </div>
                            <div class="ds-tile" style="text-align:center">
                                <span class="ds-tile-value" style="color:${Number(data.erros) > 0 ? 'var(--danger)' : 'var(--text-1)'}">${Number(data.erros || 0)}</span>
                                <span class="ds-tile-label">Erros</span>
                            </div>
                        </div>
                    </div>`
                restaurarBotao('Importar novamente')
            }
        } catch (e) {
            clearInterval(progInterval)
            console.error(e)
            resultado.style.display = 'block'
            resultado.innerHTML = `
                <div class="ds-alert-box" style="--alert-color:var(--danger); --alert-bg:var(--danger-soft);">
                    <p class="ds-alert-title">Erro ao conectar com o servidor</p>
                    <p class="ds-alert-text">${dashEscSafe(e.message)}</p>
                </div>`
            restaurarBotao('Tentar novamente')
        }
    })
}

/** Escapa HTML com fallback (a página de dashboard não está sempre carregada) */
function dashEscSafe(v) {
    if (typeof dashEsc === 'function') return dashEsc(v)
    return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]))
}
