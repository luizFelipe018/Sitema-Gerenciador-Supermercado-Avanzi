// 🔐 Proteção
const token = localStorage.getItem('token')
if (!token) window.location.href = 'login.html'

function parseJwt(t) {
    try { return JSON.parse(atob(t.split('.')[1])) } catch { return null }
}
const payload = parseJwt(token)
const usuarioLogado = payload?.usuario ?? ''

// ── UTILITÁRIOS GLOBAIS ────────────────────────────────
function setActive(id) {
    document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'))
    document.querySelectorAll('.submenu-btn').forEach(b => b.classList.remove('active'))
    const el = document.getElementById(id)
    if (el) el.classList.add('active')
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

// ── SETUP INICIAL ─────────────────────────────────────
document.getElementById('data-atual').textContent = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
})
const nomeUsuario = localStorage.getItem('usuarioNome')
if (nomeUsuario) document.getElementById('nomeUsuario').textContent = `👤 ${nomeUsuario}`
if (usuarioLogado === 'luiz') document.getElementById('btn-admin').style.display = 'flex'

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
    carregarInicio()
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

document.getElementById('btn-admin').addEventListener('click', () => {
    submenuPlacas.classList.remove('open')
    btnPlacasMenu.classList.remove('open')
    carregarAdmin()
})

document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuarioNome')
    window.location.href = 'login.html'
})

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
})

// ── FECHAR MODAIS ─────────────────────────────────────
document.getElementById('fechar-busca').onclick = fecharModais
document.getElementById('fechar-import').onclick = fecharModais
document.getElementById('fechar-busca-am').onclick = fecharModaisAmarela
document.getElementById('fechar-import-am').onclick = fecharModaisAmarela

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        fecharModais()
        fecharModaisAmarela()
        fecharModaisGrande()
        document.getElementById('contextMenu').style.display = 'none'
    }
})

// ── INÍCIO ────────────────────────────────────────────
carregarInicio()