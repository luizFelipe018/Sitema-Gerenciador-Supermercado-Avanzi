const API = localStorage.getItem('serverUrl') || (window.location.protocol === 'file:' ? 'http://localhost:3000' : window.location.origin)

// ── Global fetch interceptor — catches 401 and redirects to login ──
const _originalFetch = window.fetch
const FETCH_TIMEOUT_MS = 15000
window.fetch = async function(...args) {
    // Timeout amigável: evita travar em "Failed to fetch" (IP/servidor fora do ar)
    const [url, opts = {}] = args
    if (typeof url === 'string' && url.includes(API) &&
        !(opts && typeof opts.signal !== 'undefined')) {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
        try {
            const res = await _originalFetch(url, { ...opts, signal: controller.signal })
            clearTimeout(timer)
            if (res.status === 401) {
                localStorage.removeItem('token')
                localStorage.removeItem('tokenExp')
                localStorage.removeItem('usuario')
                localStorage.removeItem('usuarioCargo')
                if (window.location.pathname !== '/login.html' && !window.location.pathname.endsWith('login.html')) {
                    window.location.href = 'login.html'
                }
            }
            return res
        } catch (e) {
            clearTimeout(timer)
            const isTimeout = e && e.name === 'AbortError'
            const isNetwork = e && (e.name === 'TypeError' || /Failed to fetch|Load failed|NetworkError/.test(String(e.message || '')))
            // IP salvo antigo/indisponível: descarta e tenta 1x o localhost (mesma máquina)
            const savedUrl = localStorage.getItem('serverUrl')
            if ((isTimeout || isNetwork) && savedUrl && url.includes(savedUrl) && window.location.protocol === 'file:') {
                localStorage.removeItem('serverUrl')
                const retryUrl = url.replace(savedUrl, 'http://localhost:3000')
                try {
                    return await _originalFetch(retryUrl, opts)
                } catch { /* cai no erro abaixo */ }
            }
            if (isTimeout) {
                const err = /** @type {Error} */ (new Error('Sem conexão com o servidor (tempo limite esgotado). Verifique se o servidor está rodando e se o endereço está correto.'))
                err.name = 'TimeoutError'
                throw err
            }
            if (isNetwork) {
                const err = /** @type {Error} */ (new Error('Sem conexão com o servidor. Verifique se o servidor está rodando e se o endereço está correto.'))
                err.name = 'TimeoutError'
                throw err
            }
            throw e
        }
    }
    const res = await _originalFetch.apply(this, args)
    if (res.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('tokenExp')
        localStorage.removeItem('usuario')
        localStorage.removeItem('usuarioCargo')
        if (window.location.pathname !== '/login.html' && !window.location.pathname.endsWith('login.html')) {
            window.location.href = 'login.html'
        }
    }
    return res
}

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
    placasGrande: ['atendente', 'gerente', 'administrador'],
    placasGrande4: ['atendente', 'gerente', 'administrador'],
    placasA4: ['atendente', 'gerente', 'administrador'],
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
    database: ['administrador'],
    formatos: ['gerente', 'administrador'],
    atalhos: ['gerente', 'administrador'],
    textos: ['gerente', 'administrador'],
    capitalize: ['gerente', 'administrador'],
    
    // Calc KG/LT - todos
    calcKglt: ['atendente', 'gerente', 'administrador'],
    
    // Dashboard - gerente e admin
    dashboard: ['gerente', 'administrador'],
    cotacao: ['gerente', 'administrador'],
    relatorioPlacas: ['gerente', 'administrador'],
    gerenciadorPlacas: ['gerente', 'administrador'],

    // Auditoria - gerente e admin (controle de quem fez as placas)
    auditoria: ['gerente', 'administrador'],
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
    const res = await fetch(`${endpoint}`, {
        ...options,
        headers: { ...authHeaders(), ...(options.headers || {}) }
    })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
}

// Buscar foto do produto no Open Food Facts (retorna URL do proxy)
window.buscarFotoProduto = async function(termo) {
    try {
        const data = await api(API+`/off-buscar?q=${encodeURIComponent(termo)}`)
        if (data.image_url) {
            return `/off-image?url=${encodeURIComponent(data.image_url)}`
        }
        if (data.image_small_url) {
            return `/off-image?url=${encodeURIComponent(data.image_small_url)}`
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
        const data = await api(API+`/off-buscar?ean=${ean}`)
        if (data.image_url) {
            return `/off-image?url=${encodeURIComponent(data.image_url)}`
        }
        if (data.image_small_url) {
            return `/off-image?url=${encodeURIComponent(data.image_small_url)}`
        }
        return null
    } catch (e) {
        console.log('[OpenFoodFacts] Erro:', e.message)
        return null
    }
}