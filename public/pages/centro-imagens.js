/* ═══════════════════════════════════════════════════════════════
   CENTRO DE IMAGENS — ponto único de acesso às ferramentas de imagem.
   Não substitui as páginas existentes: apenas as organiza em um painel.
   ═══════════════════════════════════════════════════════════════ */

function carregarCentroImagens() {
    setActive('btn-centro-imagens')
    setConteudo(`
        <div class="ds-page-head fade-in">
            <div>
                <div class="ds-page-eyebrow">Catálogo</div>
                <h1 class="ds-page-title">Centro de Imagens</h1>
                <p class="ds-page-sub">Todas as ferramentas de imagem da loja em um só lugar</p>
            </div>
        </div>

        <div class="ds-grid ds-grid-3" style="gap:20px">
            ${ciCard('Buscar imagem', 'Localizar foto pelo código ou descrição', '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>', 'carregarImagens()')}
            ${ciCard('Verificar faltantes', 'Encontrar produtos sem imagem cadastrada', '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>', 'carregarVerificarImagens()')}
            ${ciCard('Importar do site', 'Baixar imagens direto da loja virtual', '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>', 'carregarImagensSite()')}
            ${ciCard('Conversor WebP', 'Converter imagens para o formato da loja', '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>', 'carregarConversorWebp()')}
            ${ciCard('Baixar do site', 'Exportar imagens em JPEG para a pasta', '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>', 'carregarBaixarSite()')}
            ${ciCard('Remover fundo', 'Recortar fundo das imagens com IA', '<path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/><circle cx="12" cy="12" r="3"/>', 'carregarRemoverFundo()')}
        </div>
    `, 'Centro de Imagens')
}

function ciCard(titulo, subtitulo, paths, funcao) {
    return `
    <button class="ds-action-modern" onclick="${funcao}" style="width:100%; text-align:left;">
        <div class="ds-action-ico-modern">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">${paths}</svg>
        </div>
        <div style="min-width:0">
            <div class="ds-action-title-modern">${titulo}</div>
            <div class="ds-action-sub-modern">${subtitulo}</div>
        </div>
    </button>`
}
