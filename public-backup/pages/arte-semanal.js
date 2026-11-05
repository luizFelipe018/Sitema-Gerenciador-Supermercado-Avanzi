/* ═════════════════════════════════════════════════════════════════════
   ARTE SEMANAL DE OFERTAS — GERADOR DE ARTE PARA MARKETING
   Cria grades de produtos com imagem + preço, prontas para imprimir
   ou salvar como PDF. Ideal para "Segunda do Pão", "Sexta de Ofertas",
   etc. As imagens vêm de uma pasta do PC da empresa.
   ═════════════════════════════════════════════════════════════════════ */

var arteBancoProdutos = []
var arteImagensPasta = []
var arteCelulas = [] // 9 células (3x3)
var arteConfig = {
    titulo: 'Segunda do Pão',
    subtitulo: '',
    colunas: 3,
    linhas: 3,
    larguraCelula: 340,   // px
    alturaCelula: 380,    // px
    corFundo: '#fdf6e9',
    corTexto: '#4a2c1a',
    fonteTitulo: 'Playfair Display',
    dataValidade: '',
    pastaImagens: ''
}

var arteSelecaoCelula = null // índice da célula sendo editada
var _arteSalvando = false

function carregarArteSemanal() {
    setActive('btn-arte-semanal')
    setConteudo(`
        <div class="arte-wrapper" style="max-width:1400px; margin:0 auto; padding:20px 0;">

            <!-- Cabeçalho da página -->
            <div class="dash-glass dash-animate pg-card" style="padding:24px; margin-bottom:20px;">
                <div style="display:flex; align-items:center; gap:16px; margin-bottom:16px;">
                    <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="color:var(--brand-2);">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/>
                    </svg>
                    <h2 class="text-white font-semibold text-lg mb-0">Gerador de Arte Semanal</h2>
                </div>
                <p class="text-white/50 text-sm">Monte a arte da semana com imagens da sua pasta e preços do banco. Pronta para imprimir ou salvar como PDF.</p>
            </div>

            <!-- Controles superiores -->
            <div class="frc gap-12 mb-16" style="align-items:flex-start;">
                <div class="fcc" style="min-width:260px;">
                    <label class="lb">Pasta de imagens</label>
                    <div style="display:flex; gap:6px;">
                        <input type="text" id="arte-pasta" class="inp" placeholder="C:\\imagens\\ofertas" value="${arteConfig.pastaImagens || ''}">
                        <button id="arte-listar-imagens" class="btn-p">Listar</button>
                    </div>
                    <div id="arte-status-pasta" class="text-xs text-white/40 mt-2"></div>
                </div>

                <div class="fcc" style="min-width:220px;">
                    <label class="lb">Título da campanha</label>
                    <input type="text" id="arte-titulo" class="inp" value="${arteConfig.titulo}" placeholder="Ex: Segunda do Pão">
                </div>

                <div class="fcc" style="min-width:220px;">
                    <label class="lb">Validade</label>
                    <input type="text" id="arte-data" class="inp" value="${arteConfig.dataValidade || new Date().toLocaleDateString('pt-BR')}" placeholder="05/10/2026">
                </div>

                <div style="align-self:flex-end; display:flex; gap:8px;">
                    <button id="arte-salvar-modelo" class="btn-p">💾 Salvar Modelo</button>
                    <button id="arte-imprimir" class="btn-p" style="background:linear-gradient(135deg,#b51515,#8a0f0f);">🖨️ Imprimir / PDF</button>
                </div>
            </div>

            <!-- Painel de imagens disponíveis -->
            <div class="dash-glass dash-animate pg-card" style="padding:20px; margin-bottom:20px; max-height:420px; overflow-y:auto;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <span class="text-white/70 font-semibold text-sm">Imagens disponíveis</span>
                    <span id="arte-cont-imagens" class="text-xs text-white/40">0 imagens</span>
                </div>
                <div id="arte-galeria-imagens" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:10px;"></div>
                <div id="arte-vazio-imagens" style="text-align:center; color:#666; padding:20px;">Nenhuma imagem encontrada. Verifique o caminho da pasta.</div>
            </div>

            <!-- Grade de células (preview da arte) -->
            <div style="display:flex; gap:20px; align-items:flex-start;">
                <div style="flex:1;">
                    <div class="dash-glass dash-animate pg-card" style="padding:20px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                            <span class="text-white/70 font-semibold text-sm">Preview da Arte</span>
                            <button id="arte-toggle-grade" class="btn-s" style="font-size:11px; padding:4px 8px;">Grid ${arteConfig.colunas}x${arteConfig.linhas}</button>
                        </div>

                        <!-- A arte renderizada -->
                        <div id="arte-preview" style="background:${arteConfig.corFundo}; padding:24px; border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,0.25); margin-bottom:16px; max-width:1100px;">
                            <!-- injetado pelo JS -->
                        </div>

                        <div style="display:flex; gap:10px; flex-wrap:wrap;">
                            ${gerarControlesCelulasArte()}
                        </div>
                    </div>
                </div>

                <!-- Editor da célula selecionada -->
                <div style="width:340px; flex-shrink:0;">
                    <div id="arte-editor-celula" class="dash-glass dash-animate pg-card" style="padding:16px; display:none;">
                        <h3 class="font-semibold text-white text-sm mb-4">Editar Celula <span id="arte-nome-celula" class="text-yellow-300">—</span></h3>
                        <div class="fcc mb-4">
                            <label class="lb">Imagem</label>
                            <select id="arte-img-celula" class="inp"></select>
                        </div>
                        <div class="fcc mb-4">
                            <label class="lb">Produto</label>
                            <input type="text" id="arte-prod-celula" class="inp" placeholder="Digite para buscar...">
                            <div id="arte-prod-resultados" style="max-height:200px; overflow-y:auto; border:1px solid #444; border-radius:6px; background:#0f0f12; z-index:50; position:relative;"></div>
                        </div>
                        <div class="fcc mb-4">
                            <label class="lb">Preço</label>
                            <input type="text" id="arte-preco-celula" class="inp" placeholder="R$ 0,00">
                        </div>
                        <div class="fcc mb-4">
                            <label class="lb">Descrição / Unidade</label>
                            <input type="text" id="arte-desc-celula" class="inp" placeholder="ex: kg, unidade, lt">
                        </div>
                        <div style="display:flex; gap:8px;">
                            <button id="arte-limpar-celula" class="btn-d">Limpar</button>
                            <button id="arte-fechar-editor" class="btn-p">✓ Salvar na Celula</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    `, 'Arte Semanal')

    // Carrega produtos do banco para busca
    carregarProdutosArte()

    // Eventos
    document.getElementById('arte-listar-imagens')?.addEventListener('click', listarImagensArte)
    document.getElementById('arte-pasta')?.addEventListener('change', () => { arteConfig.pastaImagens = document.getElementById('arte-pasta').value })
    document.getElementById('arte-titulo')?.addEventListener('input', (e) => { arteConfig.titulo = e.target.value; renderizarPreviewArte() })
    document.getElementById('arte-data')?.addEventListener('input', (e) => { arteConfig.dataValidade = e.target.value; renderizarPreviewArte() })
    document.getElementById('arte-imprimir')?.addEventListener('click', imprimirArte)
    document.getElementById('arte-salvar-modelo')?.addEventListener('click', salvarModeloArte)
    document.getElementById('arte-fechar-editor')?.addEventListener('click', salvarCelulaArte)
    document.getElementById('arte-limpar-celula')?.addEventListener('click', limparCelulaArte)
    document.getElementById('arte-prod-celula')?.addEventListener('input', buscarProdutoArte)

    renderizarGaleriaImagensArte()
    renderizarPreviewArte()
    carregarModelosArte()
}

/** Carrega produtos para busca rápida */
async function carregarProdutosArte() {
    try {
        const res = await fetch(API + '/produtos?page=1&limit=200', { headers: authHeaders() })
        const json = await res.json()
        arteBancoProdutos = json.data || []
    } catch (e) {
        arteBancoProdutos = []
    }
}

/** Lista imagens da pasta informada */
async function listarImagensArte() {
    const pasta = document.getElementById('arte-pasta').value.trim()
    if (!pasta) { toast('Informe o caminho da pasta', 'aviso'); return }
    try {
        const res = await fetch(API + '/arte/imagens?pasta=' + encodeURIComponent(pasta), { headers: authHeaders() })
        const data = await res.json()
        arteImagensPasta = data.imagens || []
        document.getElementById('arte-status-pasta').textContent = `✓ ${arteImagensPasta.length} imagem(ns) encontrada(s)`
        document.getElementById('arte-cont-imagens').textContent = arteImagensPasta.length + ' imagens'
        document.getElementById('arte-vazio-imagens').style.display = arteImagensPasta.length ? 'none' : 'block'
        renderizarGaleriaImagensArte()
        renderizarPreviewArte()
    } catch (e) {
        document.getElementById('arte-status-pasta').textContent = '❌ Erro ao acessar a pasta'
        toast('Erro ao listar imagens: ' + e.message, 'erro')
    }
}

/** Renderiza galeria de miniaturas */
function renderizarGaleriaImagensArte() {
    const galeria = document.getElementById('arte-galeria-imagens')
    if (!galeria) return
    galeria.innerHTML = ''
    arteImagensPasta.forEach((img, i) => {
        const el = document.createElement('div')
        el.style.cssText = 'border:1px solid #444; border-radius:8px; overflow:hidden; cursor:pointer; aspect-ratio:1; background:#1a1a2e; display:flex; align-items:center; justify-content:center; position:relative;'
        el.innerHTML = `<img src="file:///${img.caminho}" style="width:100%; height:100%; object-fit:cover; opacity:0.8;" onerror="this.style.display='none'; this.parentElement.style.color='#666'; this.parentElement.textContent='?';">`
        el.title = img.nome
        el.onclick = () => {
            if (arteSelecaoCelula !== null) {
                arteCelulas[arteSelecaoCelula].imagem = img.caminho
                arteCelulas[arteSelecaoCelula].nomeImagem = img.nome
                fecharEditorArte()
                renderizarPreviewArte()
                toast('Imagem aplicada à célula ' + (arteSelecaoCelula + 1), 'ok')
            } else {
                toast('Clique primeiro em uma célula da grade para selecioná-la', 'info')
            }
        }
        galeria.appendChild(el)
    })
}

/** Gera controles das células (botões rápidos) */
function gerarControlesCelulasArte() {
    let html = ''
    const total = arteConfig.colunas * arteConfig.linhas
    // Garante array de células
    while (arteCelulas.length < total) arteCelulas.push({})
    while (arteCelulas.length > total) arteCelulas.pop()

    for (let i = 0; i < total; i++) {
        const c = arteCelulas[i] || {}
        const temConteudo = c.imagem || c.descricao || c.preco
        html += `
            <button class="btn-g arte-celula-btn" style="width:78px; height:78px; position:relative; ${temConteudo ? 'border:2px solid var(--brand-2);' : ''}" onclick="selecionarCelulaArte(${i})" title="Célula ${i+1}">
                <div style="position:absolute; top:2px; left:2px; right:2px; bottom:2px; border-radius:6px; background:${c.imagem ? 'url(file:///' + c.imagem + ')' : '#1a1a2e'}; background-size:cover; background-position:center; opacity:${c.imagem ? 0.85 : 0.3};"></div>
                <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; flex-direction:column; color:rgba(255,255,255,0.7); font-size:10px; pointer-events:none;">
                    <div style="font-weight:bold; color:#fff;">${i+1}</div>
                    ${c.descricao ? `<div style="font-size:8px; opacity:0.8; max-width:60px; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.descricao}</div>` : ''}
                    ${c.preco ? `<div style="font-size:9px; color:#fbbf24; margin-top:2px;">R$ ${c.preco}</div>` : ''}
                </div>
            </button>
        `
    }
    return html
}

/** Seleciona uma célula para edição */
function selecionarCelulaArte(idx) {
    arteSelecaoCelula = idx
    const c = arteCelulas[idx] || {}
    document.getElementById('arte-nome-celula').textContent = (idx + 1)
    document.getElementById('arte-img-celula').value = c.imagem || ''
    document.getElementById('arte-prod-celula').value = c.descricao || ''
    document.getElementById('arte-preco-celula').value = c.preco || ''
    document.getElementById('arte-desc-celula').value = c.unidade || ''
    const editor = document.getElementById('arte-editor-celula')
    if (editor) editor.style.display = 'block'
    renderizarPreviewArte()
}

/** Salva a célula editada */
function salvarCelulaArte() {
    if (arteSelecaoCelula === null) return
    const c = arteCelulas[arteSelecaoCelula] || {}
    c.imagem = document.getElementById('arte-img-celula').value || c.imagem
    c.descricao = document.getElementById('arte-prod-celula').value.trim()
    c.preco = document.getElementById('arte-preco-celula').value.trim()
    c.unidade = document.getElementById('arte-desc-celula').value.trim()
    arteCelulas[arteSelecaoCelula] = c
    fecharEditorArte()
    renderizarPreviewArte()
}

/** Limpa a célula */
function limparCelulaArte() {
    if (arteSelecaoCelula === null) return
    arteCelulas[arteSelecaoCelula] = {}
    fecharEditorArte()
    renderizarPreviewArte()
}

/** Fecha editor */
function fecharEditorArte() {
    arteSelecaoCelula = null
    const editor = document.getElementById('arte-editor-celula')
    if (editor) editor.style.display = 'none'
    renderizarPreviewArte()
}

/** Busca produtos para autocomplete */
async function buscarProdutoArte(e) {
    const termo = e.target.value.trim().toLowerCase()
    const resultados = document.getElementById('arte-prod-resultados')
    if (!termo || termo.length < 2) { resultados.innerHTML = ''; resultados.style.display = 'none'; return }
    const achados = arteBancoProdutos.filter(p =>
        (p.descricao && p.descricao.toLowerCase().includes(termo)) ||
        (p.codigo && String(p.codigo).includes(termo)) ||
        (p.ean && String(p.ean).includes(termo))
    ).slice(0, 8)
    if (achados.length === 0) { resultados.innerHTML = '<div style="padding:8px; color:#666;">Nenhum produto</div>'; resultados.style.display = 'block'; return }
    resultados.innerHTML = achados.map(p => `
        <div style="padding:8px; border-bottom:1px solid #333; cursor:pointer;" onclick="selecionarProdutoArte('${escapeHtml(p.descricao || '')}', '${escapeHtml(String(p.codigo || ''))}', '${escapeHtml(String(p.ean || ''))}')">
            <div style="color:#fff; font-size:13px;">${p.descricao}</div>
            <div style="color:#888; font-size:11px;">Cód: ${p.codigo} | EAN: ${p.ean}</div>
        </div>
    `).join('')
    resultados.style.display = 'block'
}

/** Seleciona produto da busca */
function selecionarProdutoArte(descricao, codigo, ean) {
    document.getElementById('arte-prod-celula').value = descricao
    document.getElementById('arte-prod-resultados').style.display = 'none'
    // Busca preço médio ou preço de venda do produto
    const prod = arteBancoProdutos.find(p => p.descricao === descricao && String(p.codigo) === codigo)
    if (prod && (prod.preco_venda || prod.preco_oferta)) {
        const preco = prod.preco_oferta || prod.preco_venda
        document.getElementById('arte-preco-celula').value = parseFloat(preco).toFixed(2).replace('.', ',')
    }
}

/** Renderiza o preview da arte */
function renderizarPreviewArte() {
    const preview = document.getElementById('arte-preview')
    if (!preview) return

    // Atualiza config do formulário
    arteConfig.titulo = document.getElementById('arte-titulo')?.value || arteConfig.titulo
    arteConfig.dataValidade = document.getElementById('arte-data')?.value || arteConfig.dataValidade

    const total = arteConfig.colunas * arteConfig.linhas
    const celulasHtml = []
    for (let i = 0; i < total; i++) {
        const c = arteCelulas[i] || {}
        const imgStyle = c.imagem ? `background-image:url('file:///${c.imagem}');` : ''
        celulasHtml.push(`
            <div class="arte-celula-preview" style="${imgStyle} background-size:cover; background-position:center;">
                <div class="arte-celula-conteudo">
                    ${c.descricao ? `<div class="arte-desc">${escapeHtml(c.descricao)}</div>` : ''}
                    ${c.preco ? `<div class="arte-preco">R$ ${c.preco}</div>` : ''}
                    ${c.unidade ? `<div class="arte-unidade">${escapeHtml(c.unidade)}</div>` : ''}
                </div>
            </div>
        `)
    }

    preview.innerHTML = `
        <div class="arte-banner">
            <div class="arte-titulo">${escapeHtml(arteConfig.titulo)}</div>
            ${arteConfig.subtitulo ? `<div class="arte-subtitulo">${escapeHtml(arteConfig.subtitulo)}</div>` : ''}
        </div>
        <div class="arte-grade" style="grid-template-columns:repeat(${arteConfig.colunas}, 1fr);">
            ${celulasHtml.join('')}
        </div>
        <div class="arte-rodape">
            Ofertas válidas para o dia ${escapeHtml(arteConfig.dataValidade)}
        </div>
    `
}

/** Imprime a arte (abre janela de impressão / salvar PDF) */
function imprimirArte() {
    renderizarPreviewArte()
    const conteudo = document.getElementById('arte-preview').innerHTML
    const estilos = `
        <style>
            @page { size: A4 landscape; margin: 0; }
            body { margin:0; background:${arteConfig.corFundo}; font-family:'Segoe UI',Tahoma,sans-serif; color:${arteConfig.corTexto}; }
            .arte-banner { text-align:center; padding:20px 0 10px; }
            .arte-titulo { font-size:34px; font-weight:700; letter-spacing:2px; margin:0; }
            .arte-subtitulo { font-size:16px; opacity:0.8; margin-top:4px; }
            .arte-grade { display:grid; gap:8px; margin-top:16px; }
            .arte-celula-preview { aspect-ratio:1; border:2px solid #fff; border-radius:10px; overflow:hidden; position:relative; background:#1a1a2e; }
            .arte-celula-conteudo { position:absolute; bottom:0; left:0; right:0; background:linear-gradient(transparent, rgba(0,0,0,0.75)); padding:12px; }
            .arte-desc { font-size:15px; font-weight:700; color:#fff; margin:0 0 2px; }
            .arte-preco { font-size:20px; font-weight:800; color:#fbbf24; margin:0 0 2px; }
            .arte-unidade { font-size:13px; color:#ddd; margin:0; }
            .arte-rodape { text-align:center; margin-top:14px; font-size:16px; font-weight:600; }
            @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
        </style>
    `
    const janela = window.open('', '_blank', 'width=1200,height=800')
    janela.document.write('<html><head><title>Arte ' + arteConfig.titulo + '</title>' + estilos + '</head><body>' + conteudo + '</body></html>')
    janela.document.close()
    janela.focus()
    setTimeout(() => { janela.print(); janela.close() }, 500)
}

/** Salva modelo no banco */
async function salvarModeloArte() {
    if (_arteSalvando) return
    _arteSalvando = true
    const nome = prompt('Nome do modelo (ex: Segunda do Pão):')
    if (!nome) { _arteSalvando = false; return }
    try {
        await fetch(API + '/arte/salvar-modelo', {
            method: 'POST',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: nome,
                configuracao: arteConfig,
                celulas: arteCelulas,
                data: new Date().toISOString()
            })
        })
        toast('Modelo "' + nome + '" salvo!', 'ok')
        carregarModelosArte()
    } catch (e) {
        toast('Erro ao salvar: ' + e.message, 'erro')
    } finally {
        _arteSalvando = false
    }
}

/** Carrega modelos salvos */
async function carregarModelosArte() {
    try {
        const res = await fetch(API + '/arte/modelos', { headers: authHeaders() })
        const modelos = await res.json()
        // Poderia montar um dropdown de modelos, mas por simplicidade deixamos salvo
        // O usuário pode reabrir e salvar novamente
    } catch {}
}

/** Escapa HTML */
function escapeHtml(t) {
    if (!t) return ''
    return String(t).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" })[m])
}

/** Toast */
function toast(msg, tipo = 'ok') {
    if (typeof window.toastApp === 'function') { window.toastApp(msg, tipo); return }
    const el = document.createElement('div')
    el.style.cssText = 'position:fixed; top:20px; right:20px; z-index:9999; padding:10px 16px; border-radius:8px; color:#fff; font-size:13px; font-weight:600; background:' + (tipo === 'erro' ? '#ef4444' : tipo === 'aviso' ? '#f59e0b' : '#22c55e')
    el.textContent = msg
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 2500)
}

window.carregarArteSemanal = carregarArteSemanal
