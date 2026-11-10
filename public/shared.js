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
            // IP salvo antigo/indisponível: descarta e tenta 1x o localhost (qualquer origem)
            const savedUrl = localStorage.getItem('serverUrl')
            if ((isTimeout || isNetwork) && savedUrl && url.includes(savedUrl) && savedUrl !== 'http://localhost:3000') {
                localStorage.removeItem('serverUrl')
                const retryUrl = url.replace(savedUrl, 'http://localhost:3000')
                try {
                    const retryRes = await _originalFetch(retryUrl, opts)
                    return retryRes
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
    'placas': ['atendente', 'gerente', 'administrador'],
    'placas-media': ['atendente', 'gerente', 'administrador'],
    'placas-pequena': ['atendente', 'gerente', 'administrador'],
    'placas-grande': ['atendente', 'gerente', 'administrador'],
produtos: ['atendente', 'gerente', 'administrador'],
    imagens: ['atendente', 'gerente', 'administrador'],
    'busca-rapida': ['atendente', 'gerente', 'administrador'],
    
    // Páginas de ofertas - gerente e admin
    'terca-pizza': ['gerente', 'administrador'],
    cardapio: ['gerente', 'administrador'],
    'importar-cardapio': ['gerente', 'administrador'],
    
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
    'calc-kglt': ['atendente', 'gerente', 'administrador'],
    
    // Dashboard - gerente e admin
    dashboard: ['gerente', 'administrador'],
    cotacao: ['gerente', 'administrador'],
    'relatorio-placas': ['gerente', 'administrador'],
    'gerenciador-placas': ['gerente', 'administrador'],

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
};

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
};
;// -- Aviso no tema do app (substitui o alert nativo) --
/* Popup de aviso com o tema do app (substitui as janelas cinza do Windows).
   window.alert(msg)          -> modal centralizado, botao "Entendi" (fire-and-forget)
   window.aviso(msg, opts)    -> mesmo modal, retorna Promise; opts: { titulo, tipo, okText }
   window.avisoConfirmacao(msg, opts) -> modal com Sim/Não; retorna Promise<boolean> */
(function () {
    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[<>&"']/g, function (c) {
            return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]
        })
    }

    var ICONES = {
        aviso: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
        ok:    '<circle cx="12" cy="12" r="10"/><polyline points="9 12 11.5 14.5 15 10"/>',
        erro:  '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
        info:  '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
        pergunta: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
    }

    var fila = []
    var aberto = false

    function montarModal(mensagem, opts, confirmar) {
        return new Promise(function (resolve) {
            fila.push({ mensagem: mensagem, opts: opts || {}, confirmar: confirmar, resolve: resolve })
            if (!aberto) proximoDaFila()
        })
    }

    function proximoDaFila() {
        var item = fila.shift()
        if (!item) { aberto = false; return }
        aberto = true

        var opts = item.opts
        var tipo = opts.tipo || 'aviso'
        if (!ICONES[tipo]) tipo = 'aviso'
        var titulo = opts.titulo || (item.confirmar ? 'Confirmação' : 'Aviso')
        var okText = opts.okText || (item.confirmar ? 'Sim' : 'Entendi')
        var cancelText = opts.cancelText || 'Não'
        var idIcone = tipo === 'aviso' ? '' : ' is-' + tipo

        var backdrop = document.createElement('div')
        backdrop.className = 'ds-aviso-backdrop'
        backdrop.innerHTML =
            '<div class="ds-aviso" role="alertdialog" aria-modal="true" aria-label="' + escapeHtml(titulo) + '">' +
                '<div class="ds-aviso-head">' +
                    '<div class="ds-aviso-icon' + idIcone + '"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">' + ICONES[tipo] + '</svg></div>' +
                    '<div class="ds-aviso-titulo">' + escapeHtml(titulo) + '</div>' +
                '</div>' +
                '<div class="ds-aviso-body">' + escapeHtml(item.mensagem) + '</div>' +
                '<div class="ds-aviso-foot">' +
                    (item.confirmar ? '<button type="button" class="ds-btn" data-acao="cancelar">' + escapeHtml(cancelText) + '</button>' : '') +
                    '<button type="button" class="ds-btn ds-btn-primary" data-acao="ok">' + escapeHtml(okText) + '</button>' +
                '</div>' +
            '</div>'

        function fechar(resultado) {
            document.removeEventListener('keydown', onKey, true)
            backdrop.remove()
            item.resolve(resultado)
            proximoDaFila()
        }
        function onKey(e) {
            if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fechar(item.confirmar ? false : undefined) }
            else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); fechar(item.confirmar ? true : undefined) }
        }

        backdrop.querySelector('[data-acao="ok"]').addEventListener('click', function () { fechar(item.confirmar ? true : undefined) })
        var btnCancelar = backdrop.querySelector('[data-acao="cancelar"]')
        if (btnCancelar) btnCancelar.addEventListener('click', function () { fechar(false) })
        backdrop.addEventListener('mousedown', function (e) { if (e.target === backdrop) fechar(item.confirmar ? false : undefined) })
        document.addEventListener('keydown', onKey, true)

        document.body.appendChild(backdrop)
        backdrop.querySelector('[data-acao="ok"]').focus()
    }

    window.aviso = function (mensagem, opts) { return montarModal(mensagem, opts, false) }
    window.avisoConfirmacao = function (mensagem, opts) { return montarModal(mensagem, opts || {}, true) }
    // Substitui o alert nativo (janela sem tema) pelo modal do app
    window.alert = function (msg) { window.aviso(msg) }
})();
