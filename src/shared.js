export const API = localStorage.getItem('serverUrl') || window.location.origin

// Global fetch interceptor
const _originalFetch = window.fetch
window.fetch = async function(...args) {
    const res = await _originalFetch.apply(this, args)
    if (res.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        localStorage.removeItem('usuarioCargo')
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html'
        }
    }
    return res
}

export function getUsuario() {
    return localStorage.getItem('usuario') || 'default'
}

export function getCargo() {
    return localStorage.getItem('usuarioCargo') || 'atendente'
}

export function hasCargo(...cargos) {
    return cargos.includes(getCargo())
}

export function isAdmin() {
    return hasCargo('administrador')
}

export function isGerente() {
    return hasCargo('gerente', 'administrador')
}

export const PERMISSOES = {
    'placas': ['atendente', 'gerente', 'administrador'],
    'placas-media': ['atendente', 'gerente', 'administrador'],
    'placas-pequena': ['atendente', 'gerente', 'administrador'],
    'placas-grande': ['atendente', 'gerente', 'administrador'],
    produtos: ['atendente', 'gerente', 'administrador'],
    imagens: ['atendente', 'gerente', 'administrador'],
    'busca-rapida': ['atendente', 'gerente', 'administrador'],
    'terca-pizza': ['gerente', 'administrador'],
    cardapio: ['gerente', 'administrador'],
    'importar-cardapio': ['gerente', 'administrador'],
    importar: ['gerente', 'administrador'],
    listas: ['atendente', 'gerente', 'administrador'],
    admin: ['administrador'],
    database: ['administrador'],
    formatos: ['gerente', 'administrador'],
    atalhos: ['gerente', 'administrador'],
    textos: ['gerente', 'administrador'],
    capitalize: ['gerente', 'administrador'],
    'relatorio-placas': ['gerente', 'administrador'],
    'gerenciador-placas': ['gerente', 'administrador'],
}

export function podeAcessar(pagina) {
    const cargosPermitidos = PERMISSOES[pagina]
    if (!cargosPermitidos) return true
    return hasCargo(...cargosPermitidos)
}

export function aplicarPermissoesMenu() {
    Object.keys(PERMISSOES).forEach(pagina => {
        const btn = document.getElementById(`btn-${pagina}`) || document.getElementById(`btn-${pagina}-menu`)
        if (btn && !podeAcessar(pagina)) {
            btn.style.display = 'none'
        }
    })
}

export function authHeaders() {
    const token = localStorage.getItem('token')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export async function api(endpoint, options = {}) {
    const res = await fetch(`${endpoint}`, {
        ...options,
        headers: { ...authHeaders(), ...(options.headers || {}) }
    })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
}

// Backward compat: attach to window for inline onclick etc.
window.authHeaders = authHeaders
window.getUsuario = getUsuario
window.getCargo = getCargo
window.hasCargo = hasCargo
window.isAdmin = isAdmin
window.isGerente = isGerente
window.podeAcessar = podeAcessar
window.aplicarPermissoesMenu = aplicarPermissoesMenu
window.buscarFotoProduto = async function(termo) {
    try {
        const data = await api(API + `/off-buscar?q=${encodeURIComponent(termo)}`)
        if (data.image_url) return `/off-image?url=${encodeURIComponent(data.image_url)}`
        if (data.image_small_url) return `/off-image?url=${encodeURIComponent(data.image_small_url)}`
        return null
    } catch { return null }
}
window.buscarFotoPorEAN = async function(ean) {
    try {
        const data = await api(API + `/off-buscar?ean=${ean}`)
        if (data.image_url) return `/off-image?url=${encodeURIComponent(data.image_url)}`
        if (data.image_small_url) return `/off-image?url=${encodeURIComponent(data.image_small_url)}`
        return null
    } catch { return null }
}
