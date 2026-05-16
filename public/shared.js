// Função global para obter o usuário atual
window.getUsuario = function() {
    return localStorage.getItem('usuario') || 'default'
}

// Funções de Cargo e Permissões
window.getCargo = function() {
    return localStorage.getItem('usuarioCargo') || 'atendente'
}

window.hasCargo = function(...cargos) {
    const cargo = window.getCargo()
    return cargos.includes(cargo)
}

window.isAdmin = function() {
    return window.hasCargo('administrador')
}

window.isGerente = function() {
    return window.hasCargo('gerente', 'administrador')
}

// Permissões por página/recurso
window.PERMISSOES = {
    // Páginas básicas - todos acessam
    placas: ['atendente', 'gerente', 'administrador'],
    placasAmarela: ['atendente', 'gerente', 'administrador'],
    placasGrande: ['atendente', 'gerente', 'administrador'],
    listaPrecos: ['atendente', 'gerente', 'administrador'],
    produtos: ['atendente', 'gerente', 'administrador'],
    imagens: ['atendente', 'gerente', 'administrador'],
    buscaRapida: ['atendente', 'gerente', 'administrador'],
    
    // Páginas de ofertas - gerente e admin
    tercaPizza: ['gerente', 'administrador'],
    cardapio: ['gerente', 'administrador'],
    importarCardapio: ['gerente', 'administrador'],
    
    // Utilitários - gerente e admin
    importar: ['gerente', 'administrador'],
    listas: ['atendente', 'gerente', 'administrador'],
    
    // Admin only
    admin: ['administrador'],
    formatos: ['gerente', 'administrador'],
    atalhos: ['gerente', 'administrador'],
    textos: ['gerente', 'administrador'],
    capitalize: ['gerente', 'administrador'],
    
    // Dashboard - gerente e admin
    dashboard: ['gerente', 'administrador'],
    dashboardVendas: ['gerente', 'administrador'],
    cotacao: ['gerente', 'administrador'],
    relatorioPlacas: ['gerente', 'administrador'],
    gerenciadorPlacas: ['gerente', 'administrador'],
}

window.podeAcessar = function(pagina) {
    const cargosPermitidos = window.PERMISSOES[pagina]
    if (!cargosPermitidos) return true
    return window.hasCargo(...cargosPermitidos)
}

// Esconder botões do menu que o usuário não tem permissão
window.aplicarPermissoesMenu = function() {
    Object.keys(window.PERMISSOES).forEach(pagina => {
        const btn = document.getElementById(`btn-${pagina}`) || document.getElementById(`btn-${pagina}-menu`)
        if (btn && !window.podeAcessar(pagina)) {
            btn.style.display = 'none'
        }
    })
}

// Auth helper (for API calls)
function authHeaders() {
    const token = localStorage.getItem('token')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
}

// API request helper
async function api(endpoint, options = {}) {
    const res = await fetch(`http://localhost:3000${endpoint}`, {
        ...options,
        headers: { ...authHeaders(), ...(options.headers || {}) }
    })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
}

// Buscar foto do produto no Open Food Facts (retorna URL do proxy)
window.buscarFotoProduto = async function(termo) {
    try {
        const data = await api(`/off-buscar?q=${encodeURIComponent(termo)}`)
        if (data.image_url) {
            return `http://localhost:3000/off-image?url=${encodeURIComponent(data.image_url)}`
        }
        if (data.image_small_url) {
            return `http://localhost:3000/off-image?url=${encodeURIComponent(data.image_small_url)}`
        }
        return null
    } catch (e) {
        console.log('[OpenFoodFacts] Erro:', e.message)
        return null
    }
}

// Buscar foto por código de barras (EAN)
window.buscarFotoPorEAN = async function(ean) {
    try {
        const data = await api(`/off-buscar?ean=${ean}`)
        if (data.image_url) {
            return `http://localhost:3000/off-image?url=${encodeURIComponent(data.image_url)}`
        }
        if (data.image_small_url) {
            return `http://localhost:3000/off-image?url=${encodeURIComponent(data.image_small_url)}`
        }
        return null
    } catch (e) {
        console.log('[OpenFoodFacts] Erro:', e.message)
        return null
    }
}