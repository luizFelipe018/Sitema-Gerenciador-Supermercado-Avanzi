// 🔐 Proteção
const token = localStorage.getItem('token')
if (!token) window.location.href = 'login.html'

// ── TEMA CLARO/ESCURO ──────────────────────────────
function initTema() {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
}

function setTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('theme-light')
        document.getElementById('icon-sol').classList.add('hidden')
        document.getElementById('icon-lua').classList.remove('hidden')
        document.getElementById('bg-decoration').style.display = 'none'
    } else {
        document.body.classList.remove('theme-light')
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

function authHeaders() {
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
}

function fecharModais() {
    document.getElementById('modal-busca').style.display = 'none'
    document.getElementById('modal-import').style.display = 'none'
    document.getElementById('log-erros').style.display = 'none'
}

function fecharModaisAmarela() {
    document.getElementById('modal-busca-am').style.display = 'none'
    document.getElementById('modal-import-am').style.display = 'none'
    document.getElementById('log-erros-am').style.display = 'none'
}

function fecharModaisGrande() {
    document.getElementById('modal-busca-g').style.display = 'none'
    document.getElementById('modal-import-g').style.display = 'none'
    document.getElementById('log-erros-g').style.display = 'none'
}

// ── FECHAR MODAIS ─────────────────────────────────────
document.getElementById('fechar-busca').onclick = () => { document.getElementById('modal-busca').style.display = 'none' }
document.getElementById('fechar-import').onclick = () => { document.getElementById('modal-import').style.display = 'none' }
document.getElementById('fechar-busca-am').onclick = () => { document.getElementById('modal-busca-am').style.display = 'none' }
document.getElementById('fechar-import-am').onclick = () => { document.getElementById('modal-import-am').style.display = 'none' }
document.getElementById('fechar-busca-g').onclick = () => { document.getElementById('modal-busca-g').style.display = 'none' }
document.getElementById('fechar-import-g').onclick = () => { document.getElementById('modal-import-g').style.display = 'none' }

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        fecharModais()
        fecharModaisAmarela()
        fecharModaisGrande()
        document.getElementById('contextMenu').style.display = 'none'
        if (popupBuscaAberto) fecharPopupBuscaGlobal()
    }
})
const nomeUsuario = localStorage.getItem('usuarioNome')
if (nomeUsuario) {
    document.getElementById('nomeUsuario').textContent = nomeUsuario
    const iniciais = nomeUsuario.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()
    document.getElementById('user-avatar').textContent = iniciais
    document.getElementById('user-avatar-header').textContent = iniciais
}
if (isAdmin()) document.getElementById('btn-admin').style.display = 'flex'

// ── FUNÇÕES GLOBAIS DE PLACAS ─────────────────────────
window._ultimasPlacasGeradas = []

async function registrarLogPlacas(placas) {
    if (!placas || !placas.length) return
    try {
        const res  = await fetch('http://localhost:3000/log-placas', {
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
                await fetch('http://localhost:3000/log-placas/imprimir', {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify({ ids })
                })
                window._ultimasPlacasGeradas = []
                console.log('[PLACAS] Marcadas como impressas:', ids)
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
    carregarDashboard()
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

document.getElementById('btn-placas').addEventListener('click', () => {
    abrirSubmenuPlacas()
    document.getElementById('submenu-modelos').classList.add('open')
    document.getElementById('btn-modelos-menu').classList.add('open2')
    carregarPlacas()
})

document.getElementById('btn-placas-amarela').addEventListener('click', () => {
    abrirSubmenuPlacas()
    document.getElementById('submenu-modelos').classList.add('open')
    document.getElementById('btn-modelos-menu').classList.add('open2')
    carregarPlacasAmarela()
})

document.getElementById('btn-placas-grande').addEventListener('click', () => {
    abrirSubmenuPlacas()
    document.getElementById('submenu-modelos').classList.add('open')
    document.getElementById('btn-modelos-menu').classList.add('open2')
    carregarPlacasGrande()
})

document.getElementById('btn-relatorio-placas').addEventListener('click', () => {
    abrirSubmenuPlacas()
    carregarRelatorioPlacas()
})

document.getElementById('btn-lista-precos').addEventListener('click', () => {
    abrirSubmenuPlacas()
    carregarListaPrecos()
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

document.getElementById('btn-busca-rapida').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarBuscaRapida()
})

document.getElementById('btn-gerenciador-placas').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarGerenciadorPlacas()
})

document.getElementById('btn-importar-cardapio').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarImportarCardapio()
})

document.getElementById('btn-monitor-imagens').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarMonitorImagens()
})

document.getElementById('btn-cotacao').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarCotacao()
})

document.getElementById('btn-dashboard-vendas').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    submenuOfertas.classList.remove('open')
    btnOfertasMenu.classList.remove('open')
    carregarDashboardVendas()
})

document.getElementById('btn-admin').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    carregarAdmin()
})

document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuarioNome')
    localStorage.removeItem('usuario')
    localStorage.removeItem('usuarioCargo')
    window.location.href = 'login.html'
})

// ── PERMISSIONS ─────────────────────────────────────
aplicarPermissoesMenu()

// ── MENU CONTEXTO (excluir placa) ─────────────────────
document.getElementById('contextMenu').onclick = () => {
    const abaAtiva = document.querySelector('.submenu-btn.active')?.id
    if (abaAtiva === 'btn-placas-amarela') {
        onExcluirPlacaAmarela()
    } else if (abaAtiva === 'btn-placas-grande') {
        onExcluirPlacaGrande()
    } else {
        onExcluirPlaca()
    }
    document.getElementById('contextMenu').style.display = 'none'
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.placa') && !e.target.closest('.placa-amarela')) {
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

// ── FECHAR MODAIS ─────────────────────────────────────
document.getElementById('fechar-busca').onclick = () => { document.getElementById('modal-busca').style.display = 'none' }
document.getElementById('fechar-import').onclick = () => { document.getElementById('modal-import').style.display = 'none' }
document.getElementById('fechar-busca-am').onclick = () => { document.getElementById('modal-busca-am').style.display = 'none' }
document.getElementById('fechar-import-am').onclick = () => { document.getElementById('modal-import-am').style.display = 'none' }
document.getElementById('fechar-busca-g').onclick = () => { document.getElementById('modal-busca-g').style.display = 'none' }
document.getElementById('fechar-import-g').onclick = () => { document.getElementById('modal-import-g').style.display = 'none' }

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        fecharModais()
        fecharModaisAmarela()
        fecharModaisGrande()
        document.getElementById('contextMenu').style.display = 'none'
    }
})

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        fecharModais()
        fecharModaisAmarela()
        fecharModaisGrande()
        document.getElementById('contextMenu').style.display = 'none'
    }
})

// ── INÍCIO ────────────────────────────────────────────
initTema()
document.getElementById('data-atual').textContent = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
})
carregarInicio()

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
    if (bancoBuscaGlobal.length > 0) return
    try {
        const res = await fetch('http://localhost:3000/produtos', { headers: authHeaders() })
        bancoBuscaGlobal = await res.json()
    } catch { console.warn('Erro ao carregar banco') }
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

function executarBuscaGlobal(termo, selecionarPrimeiro = false) {
    const container = document.getElementById('resultado-busca-global')
    if (!termo) {
        container.innerHTML = '<div class="text-center text-white/30 py-12 text-sm">Digite para buscar...</div>'
        return
    }

    const q = termo.toUpperCase()
    const resultados = bancoBuscaGlobal.filter(p =>
        p.descricao?.toUpperCase().includes(q) ||
        p.codigo?.includes(q) ||
        p.ean?.includes(q)
    ).slice(0, 20)

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
            carregarPlacas()
            setTimeout(() => {
                document.getElementById('ean-input').value = codigo
                document.getElementById('preco-input').value = preco
                document.getElementById('preco-input').focus()
            }, 150)
        }
    })
}