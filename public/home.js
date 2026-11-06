// 🔐 Proteção — sessão máxima de 4 horas
const token = localStorage.getItem('token')
if (!token) window.location.href = 'login.html'
else {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const now = Math.floor(Date.now() / 1000)
        if ((payload.exp && now >= payload.exp) || (payload.iat && now - payload.iat > 4 * 60 * 60)) {
            localStorage.removeItem('token')
    localStorage.removeItem('tokenExp')
            localStorage.removeItem('tokenExp')
            window.location.href = 'login.html'
        }
    } catch { /* token opaco: deixa a API validar via 401 */ }
}

// ── TEMA CLARO/ESCURO ──────────────────────────────
function initTema() {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
}

function setTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('theme-light')
        document.documentElement.setAttribute('data-theme', 'avanzi-light')
        document.getElementById('icon-sol').classList.add('hidden')
        document.getElementById('icon-lua').classList.remove('hidden')
        document.getElementById('bg-decoration').style.display = 'none'
    } else {
        document.body.classList.remove('theme-light')
        document.documentElement.setAttribute('data-theme', 'avanzi-dark')
        document.getElementById('icon-sol').classList.remove('hidden')
        document.getElementById('icon-lua').classList.add('hidden')
        document.getElementById('bg-decoration').style.display = 'block'
    }
    localStorage.setItem('theme', theme)
}

function toggleTheme() {
    const isLight = document.body.classList.contains('theme-light')
    setTheme(isLight ? 'dark' : 'light')
}

document.getElementById('btn-theme-toggle')?.addEventListener('click', toggleTheme)

// ── SIDEBAR TOGGLE (mobile) ──────────────────────────
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar')
    const overlay = document.getElementById('sidebar-overlay')
    const isOpen = sidebar.classList.contains('open-mobile')
    if (isOpen) {
        sidebar.classList.remove('open-mobile')
        overlay.classList.remove('active')
    } else {
        sidebar.classList.add('open-mobile')
        overlay.classList.add('active')
    }
}

function closeSidebar() {
    document.querySelector('.sidebar').classList.remove('open-mobile')
    document.getElementById('sidebar-overlay').classList.remove('active')
}

document.getElementById('btn-sidebar-toggle')?.addEventListener('click', toggleSidebar)
document.getElementById('btn-sidebar-close')?.addEventListener('click', toggleSidebar)
document.getElementById('sidebar-overlay')?.addEventListener('click', closeSidebar)

// Close sidebar on navigation (mobile)
function closeSidebarOnNav() {
    if (window.innerWidth <= 1024) closeSidebar()
}

// Wrap click handlers to close sidebar after navigation
const navButtons = document.querySelectorAll('.sidebar-btn, .submenu-btn, .submenu3-btn')
navButtons.forEach(btn => {
    btn.addEventListener('click', closeSidebarOnNav)
})

// Handle resize: close sidebar when going back to desktop
let resizeTimer
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 1024) closeSidebar()
    }, 200)
})

function parseJwt(t) {
    try { return JSON.parse(atob(t.split('.')[1])) } catch { return null }
}
const payload = parseJwt(token)
const usuarioLogado = payload?.usuario ?? ''

// getUsuario já definido em shared.js (carregado antes dos page scripts)

// ── UTILITÁRIOS GLOBAIS ────────────────────────────────
function setActive(id) {
    document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'))
    document.querySelectorAll('.submenu-btn').forEach(b => b.classList.remove('active'))
    document.querySelectorAll('.submenu3-btn').forEach(b => b.classList.remove('active'))
    const el = document.getElementById(id)
    if (el) {
        el.classList.add('active')
        // Se for submenu-btn, abre o submenu pai
        if (el.classList.contains('submenu-btn') || el.classList.contains('submenu3-btn')) {
            const submenu = el.closest('.submenu')
            if (submenu) submenu.classList.add('open')
        }
    }
}

function setConteudo(html, titulo) {
    const el = document.getElementById('conteudo')
    document.getElementById('page-title').textContent = titulo
    el.classList.remove('fade-in')
    void el.offsetWidth
    el.classList.add('fade-in')
    el.innerHTML = html
}

function printFolha(htmlContent, extraCss) {
    // Imprime num iframe escondido da propria pagina. window.open nao era
    // confiavel: o "Imprimir tudo" chamava dentro de setTimeout, o popup perdia
    // a \"acao do usuario\" e o navegador bloqueava (nenhuma guia abria).
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;'
    document.body.appendChild(iframe)

    // As placas usam background-image (CSS), que NAO aparece em imgDoc.images —
    // por isso o print antigo disparava com a arte ainda carregando (banner
    // sumia) ou antes da rasterizacao do iframe oculto (textos sumiam), conforme
    // cache/rede no momento do clique. Aqui listamos os url(...) do HTML e
    // pre-carregamos todos antes de imprimir.
    const urlsFundo = []
    const reUrl = /url\(\s*['"]?([^'")]+)['"]?\s*\)/g
    let m
    while ((m = reUrl.exec(htmlContent))) {
        const u = m[1].trim()
        if (/^data:/i.test(u)) continue
        try { urlsFundo.push(new URL(u, location.href).href) } catch (e) { /* URL invalida, ignora */ }
    }
    const preloads = [...new Set(urlsFundo)].map(u => new Promise(res => {
        const img = new Image()
        img.onload = img.onerror = () => res()
        img.src = u
    }))

    const doc = iframe.contentDocument
    doc.open()
    doc.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
        <style>
            @page { size: A4 landscape; margin: 0; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { margin: 0; padding: 0; background: #fff; font-family: 'Segoe UI', sans-serif; }
            ${extraCss || ''}
        </style>
    </head><body>${htmlContent}</body></html>`)
    doc.close()

    let imprimiu = false
    const imprimir = () => {
        if (imprimiu) return
        imprimiu = true
        iframe.contentWindow.focus()
        iframe.contentWindow.print()
        // deixa o iframe vivo ate o dialogo fechar, depois descarta
        setTimeout(() => iframe.remove(), 120000)
    }

    // espera fontes e <img> carregarem (ate 5s) e as imagens de fundo (ate 4s),
    // depois da uma folga para o navegador rasterizar o iframe oculto.
    const encerrar = async () => {
        const t0 = Date.now()
        const esperaDom = () => new Promise(res => {
            const verifica = () => {
                const imgDoc = iframe.contentDocument
                const imgs = Array.from(imgDoc.images)
                let fontsOk = true
                try { fontsOk = !imgDoc.fonts || imgDoc.fonts.status !== 'loading' } catch (e) { /* ignora */ }
                if ((imgs.every(img => img.complete) && fontsOk) || Date.now() - t0 > 5000) res()
                else setTimeout(verifica, 120)
            }
            verifica()
        })
        await esperaDom()
        await Promise.race([Promise.all(preloads), new Promise(res => setTimeout(res, 4000))])
        await new Promise(res => setTimeout(res, 350))
        imprimir()
    }
    encerrar()
}

function authHeaders() {
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
}

function fecharModaisGrande() {
    document.getElementById('modal-busca-g').style.display = 'none'
    document.getElementById('modal-import-g').style.display = 'none'
    document.getElementById('log-erros-g').style.display = 'none'
}

// ── FECHAR MODAIS ─────────────────────────────────────
document.getElementById('fechar-busca-g').onclick = () => { document.getElementById('modal-busca-g').style.display = 'none' }
document.getElementById('fechar-import-g').onclick = () => { document.getElementById('modal-import-g').style.display = 'none' }

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        fecharModaisGrande()
        document.getElementById('contextMenu').style.display = 'none'
        if (popupBuscaAberto) fecharPopupBuscaGlobal()
    }
})

if (isAdmin()) document.getElementById('btn-admin').style.display = 'flex'

// ── FUNÇÕES GLOBAIS DE PLACAS ─────────────────────────
window._ultimasPlacasGeradas = []

async function registrarLogPlacas(placas) {
    if (!placas || !placas.length) return
    try {
        const res  = await fetch(API+'/log-placas', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(placas)
        })
        const data = await res.json()
        if (data.ids) {
            window._ultimasPlacasGeradas.push(...data.ids)
            console.log('[PLACAS] IDs acumulados:', window._ultimasPlacasGeradas)
        }
    } catch (e) {
        console.warn('Erro ao registrar log de placas:', e)
    }
}

function registrarImpressaoPlacas() {
    const ids = [...(window._ultimasPlacasGeradas || [])]
    setTimeout(() => {
        // Sempre mostra o popup ao imprimir
        const overlay = document.createElement('div')
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);z-index:9999;display:flex;align-items:center;justify-content:center;'

        const box = document.createElement('div')
        box.style.cssText = 'background:#fff;border-radius:16px;padding:28px 32px;width:380px;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;'

        const icone = document.createElement('div')
        icone.style.cssText = 'font-size:40px;margin-bottom:12px;'
        icone.textContent = '🖨️'

        const titulo = document.createElement('h3')
        titulo.style.cssText = 'font-size:16px;font-weight:700;color:#111827;margin-bottom:8px;'
        titulo.textContent = 'A impressão foi concluída?'

        const descricao = document.createElement('p')
        descricao.style.cssText = 'font-size:13px;color:#6b7280;margin-bottom:24px;'
        descricao.textContent = 'Confirme para registrar as placas como impressas no relatório.'

        const botoes = document.createElement('div')
        botoes.style.cssText = 'display:flex;gap:10px;'

        const btnSim = document.createElement('button')
        btnSim.style.cssText = 'flex:1;padding:10px;background:#16a34a;color:#fff;border:none;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;'
        btnSim.textContent = '✅ Sim, foi impressa'

        const btnNao = document.createElement('button')
        btnNao.style.cssText = 'flex:1;padding:10px;background:#f3f4f6;color:#374151;border:none;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;'
        btnNao.textContent = '❌ Não'

        btnNao.onclick = () => document.body.removeChild(overlay)

        btnSim.onclick = async () => {
            document.body.removeChild(overlay)
            try {
                let idsParaMarcar = ids
                // Fallback: if no accumulated IDs, auto-log current plaques
                if (!idsParaMarcar.length && window._placasAtuais && window._placasAtuais.length) {
                    const logPlacas = window._placasAtuais.map(p => ({
                        descricao: p.descricao || '',
                        codigo: p.codigo || null,
                        ean: p.ean || null,
                        preco: p.preco || 0,
                        tipo_placa: p.tipo_placa || 'grande4'
                    }))
                    const res = await fetch(API+'/log-placas', {
                        method: 'POST',
                        headers: authHeaders(),
                        body: JSON.stringify(logPlacas)
                    })
                    const data = await res.json()
                    if (data.ids && data.ids.length) idsParaMarcar = data.ids
                }
                if (idsParaMarcar.length) {
                    await fetch(API+'/log-placas/imprimir', {
                        method: 'POST',
                        headers: authHeaders(),
                        body: JSON.stringify({ ids: idsParaMarcar })
                    })
                }
                window._ultimasPlacasGeradas = []
                console.log('[PLACAS] Marcadas como impressas:', idsParaMarcar)
            } catch (e) {
                console.warn('Erro ao registrar impressão:', e)
            }
        }

        botoes.appendChild(btnSim)
        botoes.appendChild(btnNao)
        box.appendChild(icone)
        box.appendChild(titulo)
        box.appendChild(descricao)
        box.appendChild(botoes)
        overlay.appendChild(box)
        document.body.appendChild(overlay)
    }, 500)
}

// ── SUBMENU OFERTAS ───────────────────────────────────
const btnOfertasMenu  = document.getElementById('btn-ofertas-menu')
const submenuOfertas  = document.getElementById('submenu-ofertas')

btnOfertasMenu.addEventListener('click', () => {
    const aberto = submenuOfertas.classList.contains('open')
    submenuOfertas.classList.toggle('open', !aberto)
    btnOfertasMenu.classList.toggle('open', !aberto)
})

function abrirSubmenuOfertas() {
    submenuOfertas.classList.add('open')
    btnOfertasMenu.classList.add('open')
}

// ── SUBMENU MARKETING ────────────────────────────────────
const btnMarketingMenu = document.getElementById('btn-marketing-menu')
const submenuMarketing  = document.getElementById('submenu-marketing')

if (btnMarketingMenu && submenuMarketing) {
    btnMarketingMenu.addEventListener('click', () => {
        const aberto = submenuMarketing.classList.contains('open')
        submenuMarketing.classList.toggle('open', !aberto)
        btnMarketingMenu.classList.toggle('open', !aberto)
    })
}

function abrirSubmenuMarketing() {
    if (submenuMarketing && btnMarketingMenu) {
        submenuMarketing.classList.add('open')
        btnMarketingMenu.classList.add('open')
    }
}

// ── SUBMENU PLACAS ────────────────────────────────────
const btnPlacasMenu = document.getElementById('btn-placas-menu')
const submenuPlacas = document.getElementById('submenu-placas')

btnPlacasMenu.addEventListener('click', () => {
    const aberto = submenuPlacas.classList.contains('open')
    submenuPlacas.classList.toggle('open', !aberto)
    btnPlacasMenu.classList.toggle('open', !aberto)
    if (!aberto) setTimeout(() => btnPlacasMenu.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
})

// Abre o submenu automaticamente se uma sub-aba de placas estiver ativa
// ── SUB-SUBMENU MODELOS ───────────────────────────────
document.getElementById('btn-modelos-menu').addEventListener('click', () => {
    const submenu = document.getElementById('submenu-modelos')
    const btnMenu = document.getElementById('btn-modelos-menu')
    const aberto  = submenu.classList.contains('open')
    submenu.classList.toggle('open', !aberto)
    btnMenu.classList.toggle('open2', !aberto)
})

function abrirSubmenuPlacas() {
    submenuPlacas.classList.add('open')
    btnPlacasMenu.classList.add('open')
}

// ── ROTEAMENTO ────────────────────────────────────────
document.getElementById('btn-inicio').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarInicio()
})

document.getElementById('btn-dashboard').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarDashboard()
})

document.getElementById('btn-produtos').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarProdutos()
})

document.getElementById('btn-placas-grande').addEventListener('click', () => {
    abrirSubmenuPlacas()
    document.getElementById('submenu-modelos').classList.add('open')
    document.getElementById('btn-modelos-menu').classList.add('open2')
    carregarPlacasGrande()
})

document.getElementById('btn-placas-grande-4').addEventListener('click', () => {
    abrirSubmenuPlacas()
    document.getElementById('submenu-modelos').classList.add('open')
    document.getElementById('btn-modelos-menu').classList.add('open2')
    carregarPlacasGrande4()
})

document.getElementById('btn-placas-a4').addEventListener('click', () => {
    abrirSubmenuPlacas()
    document.getElementById('submenu-modelos').classList.add('open')
    document.getElementById('btn-modelos-menu').classList.add('open2')
    carregarPlacasA4()
})

document.getElementById('btn-arte-semanal')?.addEventListener('click', () => {
    if (submenuPlacas) { submenuPlacas.classList.remove('open') }
    if (btnPlacasMenu) { btnPlacasMenu.classList.remove('open') }
    if (submenuOfertas) { submenuOfertas.classList.remove('open') }
    if (btnOfertasMenu) { btnOfertasMenu.classList.remove('open') }
    if (typeof abrirSubmenuMarketing === 'function') abrirSubmenuMarketing()
    carregarArteSemanal()
})

document.getElementById('btn-relatorio-placas').addEventListener('click', () => {
    abrirSubmenuPlacas()
    carregarRelatorioPlacas()
})

document.getElementById('btn-cardapio').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    abrirSubmenuOfertas()
    carregarCardapio()
})

document.getElementById('btn-terca-pizza').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    abrirSubmenuOfertas()
    carregarTercaPizza()
})

document.getElementById('btn-atalhos').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarAtalhos()
})

document.getElementById('btn-formatos').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarFormatos()
})

document.getElementById('btn-capitalize').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarCapitalize()
})

document.getElementById('btn-importar').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarImportar()
})

document.getElementById('btn-textos').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarTextos()
})

document.getElementById('btn-criar-texto').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarCriarTexto()
})

document.getElementById('btn-listas').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarListas()
})

document.getElementById('btn-imagens').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarImagens()
})

document.getElementById('btn-verificar-imagens').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarVerificarImagens()
})

document.getElementById('btn-busca-rapida').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarBuscaRapida()
})

document.getElementById('btn-marcas-massa')?.addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    if (typeof carregarMarcasMassa === 'function') carregarMarcasMassa()
})

document.getElementById('btn-gerenciador-placas').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarGerenciadorPlacas()
})

document.getElementById('btn-estoque-placas').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarEstoquePlacas()
})

document.getElementById('btn-importar-cardapio').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarImportarCardapio()
})



document.getElementById('btn-qrcode').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarQrcode()
})

document.getElementById('btn-feriados').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarFeriados()
})

document.getElementById('btn-cotacao').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarCotacao()
})

document.getElementById('btn-auditoria').addEventListener('click', () => {    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarAuditoria()
})

document.getElementById('btn-calc-kglt').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarCalcKglt()
})

document.getElementById('btn-admin').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    carregarAdmin()
})

document.getElementById('btn-database').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    carregarDatabase()
})

document.getElementById('btn-novidades').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    carregarNovidades()
})

document.getElementById('btn-logout').addEventListener('click', async () => {
    // Registra a saída na trilha de auditoria antes de limpar a sessão
    try {
        await fetch(API + '/logout', {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
    } catch (e) { /* offline: segue o logout mesmo assim */ }

    localStorage.removeItem('token')
    localStorage.removeItem('tokenExp')
    localStorage.removeItem('usuarioNome')
    localStorage.removeItem('usuario')
    localStorage.removeItem('usuarioCargo')
    window.location.href = 'login.html'
})

// ── PERMISSIONS ─────────────────────────────────────
aplicarPermissoesMenu()

// ── MENU CONTEXTO (excluir/duplicar placa) ────────────
function executarContexto(fn) {
    const abaAtiva = document.querySelector('.submenu-btn.active, .submenu3-btn.active')?.id
    if (abaAtiva === 'btn-placas-grande') fn('Grande')
    else if (abaAtiva === 'btn-placas-grande-4') fn('Grande4')
    else if (abaAtiva === 'btn-placas-a4') fn('A4')
    else fn('')
    document.getElementById('contextMenu').style.display = 'none'
}
document.getElementById('ctx-excluir').onclick = () => executarContexto(suf => {
    const fn = suf ? window['onExcluirPlaca' + suf] : window.onExcluirPlaca
    if (fn) fn()
})
document.getElementById('ctx-duplicar').onclick = () => executarContexto(suf => {
    const fn = suf ? window['onDuplicarPlaca' + suf] : window.onDuplicarPlaca
    if (fn) fn()
})
// Salva a predefinição de texto da placa selecionada
document.getElementById('ctx-salvar-predef').onclick = () => executarContexto(suf => {
    const fn = suf ? window['onSalvarPredef' + suf] : window.onSalvarPredef
    if (fn) fn()
})
// Define a predefinição da placa como padrão das novas placas
document.getElementById('ctx-padrao-novas').onclick = () => executarContexto(suf => {
    const fn = suf ? window['onSalvarPredefPadrao' + suf] : window.onSalvarPredefPadrao
    if (fn) fn()
})

document.addEventListener('click', (e) => {
    if (!e.target.closest('.placa') && !e.target.closest('.placa-grande') && !e.target.closest('.placa-grande-4')) {
        document.getElementById('contextMenu').style.display = 'none'
    }
    if (popupBuscaAberto && !e.target.closest('.modal-box')) {
        fecharPopupBuscaGlobal()
    }
})

document.getElementById('btn-global-search')?.addEventListener('click', () => {
    abrirPopupBuscaGlobal()
})

// Fechar modais ao clicar no overlay
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.style.display = 'none'
        }
    })
})


// ══════════════════════════════════════════════════════════
// USUÁRIO LOGADO — avatar, nome, cargo e painel de conta
// ══════════════════════════════════════════════════════════
const CARGOS = {
    administrador: 'Administrador',
    gerente: 'Gerente',
    atendente: 'Atendente'
}

/** Iniciais (até 2 letras) a partir do nome completo */
function iniciaisDoUsuario(nome) {
    const partes = String(nome || '').trim().split(/\s+/).filter(Boolean)
    if (!partes.length) return '?'
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

/** Aplica o usuário logado em todos os pontos da interface */
function renderUsuarioLogado() {
    const nome = localStorage.getItem('usuarioNome') || getUsuario() || 'Usuário'
    const login = getUsuario()
    const cargo = getCargo()

    const iniciais = iniciaisDoUsuario(nome)
    const rotuloCargo = CARGOS[cargo] || cargo

    // avatares
    ;['user-avatar', 'user-avatar-header', 'user-avatar-popover'].forEach(id => {
        const el = document.getElementById(id)
        if (el) el.textContent = iniciais
    })

    // nome e cargo no rodapé da sidebar
    const nomeEl = document.getElementById('nomeUsuario')
    if (nomeEl) nomeEl.textContent = nome
    const cargoEl = document.getElementById('cargoUsuario')
    if (cargoEl) cargoEl.textContent = rotuloCargo

    // nome e cargo no cabeçalho
    const nomeHeader = document.getElementById('nomeUsuarioHeader')
    if (nomeHeader) nomeHeader.textContent = nome
    const cargoHeader = document.getElementById('cargoUsuarioHeader')
    if (cargoHeader) cargoHeader.textContent = rotuloCargo

    // botão do cabeçalho visível
    const btnHeader = document.getElementById('btn-minha-conta-header')
    if (btnHeader) btnHeader.style.display = 'inline-flex'
    const infoHeader = document.getElementById('user-info-header')
    if (infoHeader) infoHeader.style.display = 'block'

    // painel de conta
    const painelNome = document.getElementById('popover-nome')
    if (painelNome) painelNome.textContent = nome
    const painelUsuario = document.getElementById('popover-usuario')
    if (painelUsuario) painelUsuario.textContent = '@' + login
    const painelCargo = document.getElementById('popover-cargo')
    if (painelCargo) painelCargo.textContent = rotuloCargo

    const permissoes = contarPermissoes()
    const painelPerm = document.getElementById('popover-permissoes')
    if (painelPerm) painelPerm.textContent = permissoes
}

// ── INÍCIO ────────────────────────────────────────────
initTema()
document.getElementById('data-atual').textContent = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
})
renderUsuarioLogado()
carregarInicio()


/** Quantas páginas o usuário atual pode acessar */
function contarPermissoes() {
    if (!window.PERMISSOES) return '—'
    const total = Object.keys(window.PERMISSOES).length
    const permitidas = Object.keys(window.PERMISSOES)
        .filter(p => window.podeAcessar(p)).length
    return `${permitidas} de ${total} áreas`
}

/** Abre/fecha o painel do usuário */
function alternarPainelUsuario(alvo, jaPosicionado) {
    const painel = document.getElementById('painel-usuario')
    if (!painel) return

    const aberto = painel.style.display !== 'none'
    if (aberto) {
        painel.style.display = 'none'
        return
    }

    // posição: abaixo do botão do header, acima do botão da sidebar
    if (!jaPosicionado && alvo) {
        const r = alvo.getBoundingClientRect()
        const emBaixo = r.left < window.innerWidth / 2
        painel.style.left = emBaixo ? `${r.left}px` : 'auto'
        painel.style.right = emBaixo ? 'auto' : `${window.innerWidth - r.right}px`
        painel.style.top = `${r.bottom + 8}px`
    }
    painel.style.display = 'block'

    // busca o último acesso no servidor
    const ultimo = document.getElementById('popover-ultimo')
    if (ultimo) ultimo.textContent = 'carregando…'
    fetch(API + '/usuarios/minha-conta', { headers: authHeaders() })
        .then(r => r.ok ? r.json() : null)
        .then(d => {
            if (!ultimo) return
            if (!d || !d.ultimo_login) { ultimo.textContent = 'agora'; return }
            const dt = new Date(String(d.ultimo_login).replace(' ', 'T'))
            ultimo.textContent = isNaN(dt.getTime())
                ? String(d.ultimo_login)
                : dt.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
        })
        .catch(() => { if (ultimo) ultimo.textContent = '—' })
}

// listeners dos dois botões de conta
document.getElementById('btn-minha-conta')?.addEventListener('click', (e) => {
    e.stopPropagation()
    const alvo = e.currentTarget
    const painel = document.getElementById('painel-usuario')
    if (!painel) return
    const r = alvo.getBoundingClientRect()
    // no rodapé da sidebar o painel abre para cima
    painel.style.left = `${r.left}px`
    painel.style.right = 'auto'
    painel.style.top = `${r.top - painel.offsetHeight - 10}px`
    alternarPainelUsuario(alvo, true)
})

document.getElementById('btn-minha-conta-header')?.addEventListener('click', (e) => {
    e.stopPropagation()
    alternarPainelUsuario(e.currentTarget)
})

// fecha o painel ao clicar fora
document.addEventListener('click', (e) => {
    const painel = document.getElementById('painel-usuario')
    if (!painel || painel.style.display === 'none') return
    if (!painel.contains(e.target) && !e.target.closest('#btn-minha-conta') && !e.target.closest('#btn-minha-conta-header')) {
        painel.style.display = 'none'
    }
})

// logout pelo painel
document.getElementById('btn-logout-popover')?.addEventListener('click', () => {
    document.getElementById('btn-logout').click()
})


// ── POPUP BUSCA RÁPIDA GLOBAL (Ctrl+Tab) ───────────
let popupBuscaAberto = false
let bancoBuscaGlobal = []

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault()
        abrirPopupBuscaGlobal()
    }
    if (e.key === 'Escape' && popupBuscaAberto) {
        fecharPopupBuscaGlobal()
    }
})

function abrirPopupBuscaGlobal() {
    popupBuscaAberto = true
    document.getElementById('popupBuscaGlobal').style.display = 'flex'
    document.getElementById('input-busca-global').value = ''
    document.getElementById('resultado-busca-global').innerHTML = '<div class="text-center text-gray-400 py-10 text-sm">Digite para buscar...</div>'
    document.getElementById('input-busca-global').focus()
    carregarBancoBusca()
}

function fecharPopupBuscaGlobal() {
    popupBuscaAberto = false
    document.getElementById('popupBuscaGlobal').style.display = 'none'
}

async function carregarBancoBusca() {
    // No longer needed — uses server-side search via /produtos/busca
}

let timerBuscaGlobal = null
document.getElementById('input-busca-global').addEventListener('input', (e) => {
    clearTimeout(timerBuscaGlobal)
    timerBuscaGlobal = setTimeout(() => executarBuscaGlobal(e.target.value.trim()), 200)
})

document.getElementById('input-busca-global').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        clearTimeout(timerBuscaGlobal)
        executarBuscaGlobal(e.target.value.trim(), true)
    }
})

async function executarBuscaGlobal(termo, selecionarPrimeiro = false) {
    const container = document.getElementById('resultado-busca-global')
    if (!termo || termo.length < 2) {
        container.innerHTML = '<div class="text-center text-white/30 py-12 text-sm">Digite pelo menos 2 caracteres...</div>'
        return
    }

    container.innerHTML = '<div class="text-center text-white/30 py-12 text-sm">Buscando...</div>'

    try {
        const res = await fetch(API+`/produtos/busca?q=${encodeURIComponent(termo)}`, { headers: authHeaders() })
        const resultados = await res.json()

        if (!resultados.length) {
            container.innerHTML = '<div class="text-center text-white/30 py-12 text-sm">Nenhum resultado encontrado</div>'
            return
        }

        container.innerHTML = resultados.map((p, i) => `
            <div class="item-busca-global cursor-pointer rounded-xl p-4 mb-2 flex items-center justify-between transition-all hover:scale-[1.01] hover:bg-white/5"
                data-codigo="${p.codigo}" data-desc="${p.descricao}" data-ean="${p.ean || ''}" data-preco="${p.preco_venda || ''}"
                style="${selecionarPrimeiro && i === 0 ? 'background:linear-gradient(135deg, var(--primary), var(--primary-dark)); border:none;' : 'background:rgba(255,255,255,0.03); border:1px solid var(--glass-border);'}">
                <div class="flex-1 min-w-0">
                    <div class="font-semibold text-sm truncate ${selecionarPrimeiro && i === 0 ? 'text-white' : 'text-white'}">${p.descricao}</div>
                    <div class="text-xs mt-1 ${selecionarPrimeiro && i === 0 ? 'text-white/70' : 'text-white/40'}">${p.codigo} • ${p.ean || 'sem EAN'}</div>
                </div>
                <div class="font-bold text-lg ml-4 ${selecionarPrimeiro && i === 0 ? 'text-white' : 'text-red-400'}">
                    R$ ${parseFloat(p.preco_venda || 0).toFixed(2).replace('.', ',')}
                </div>
        </div>
    `).join('')

    container.querySelectorAll('.item-busca-global').forEach(item => {
        item.onclick = () => {
            const codigo = item.getAttribute('data-codigo')
            const desc = item.getAttribute('data-desc')
            const preco = item.getAttribute('data-preco')
            fecharPopupBuscaGlobal()
            // Vai para página de placas e preenche
            abrirSubmenuPlacas()
            document.getElementById('submenu-modelos').classList.add('open')
            document.getElementById('btn-modelos-menu').classList.add('open2')
            carregarPlacasGrande4()
            setTimeout(() => {
                document.getElementById('ean-input-g4').value = codigo
                document.getElementById('preco-input-g4').value = preco
                document.getElementById('preco-input-g4').focus()
            }, 150)
        }
    })
    } catch {
        container.innerHTML = '<div class="text-center text-white/30 py-12 text-sm">Erro na busca</div>'
    }
}