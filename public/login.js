// Sessão de 4 horas: se ainda houver token válido, entra direto (sem pedir senha de novo ao reabrir)
function sessaoValida() {
    const token = localStorage.getItem('token')
    if (!token) return false
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const now = Math.floor(Date.now() / 1000)
        if (payload.exp && now >= payload.exp) {
            localStorage.removeItem('token')
            localStorage.removeItem('tokenExp')
            return false
        }
        if (payload.iat && now - payload.iat > 4 * 60 * 60) {
            localStorage.removeItem('token')
            localStorage.removeItem('tokenExp')
            return false
        }
        return true
    } catch {
        return !!token
    }
}

if (sessaoValida()) {
    window.location.href = window.location.protocol === 'file:' ? 'home.html' : (localStorage.getItem('serverUrl') || window.location.origin) + '/home.html'
}

async function fazerLogin() {
    const usuario = document.getElementById('usuario').value.trim()
    const senha = document.getElementById('senha').value
    const botao = document.getElementById('btn-login')
    const erro = document.getElementById('erro')

    if (!usuario || !senha) {
        erro.innerText = 'Informe usuário e senha.'
        return
    }

    botao.classList.add('loading')
    botao.disabled = true
    erro.innerText = ''

    try {
        const response = await fetch(API+'/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario, senha })
        })

        const data = await response.json()

        if (response.ok) {
            localStorage.setItem('token', data.token)
            if (data.expiresAt) localStorage.setItem('tokenExp', String(data.expiresAt))
            localStorage.setItem('usuarioNome', data.user.nome)
            localStorage.setItem('usuario', data.user.usuario)
            localStorage.setItem('usuarioCargo', data.user.cargo || 'atendente')
            window.location.href = window.location.protocol === 'file:' ? 'home.html' : API + '/home.html'
        } else {
            erro.innerText = data.error
            botao.classList.remove('loading')
            botao.disabled = false
            document.getElementById('senha').value = ''
            document.getElementById('senha').focus()
        }
    } catch (e) {
        erro.innerText = 'Não foi possível conectar ao servidor.'
        botao.classList.remove('loading')
        botao.disabled = false
    }
}

// Evento do botão (sem inline onclick)
document.getElementById('btn-login').addEventListener('click', fazerLogin)

// Permite logar pressionando Enter
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fazerLogin()
})

// ── Auto-detect server (Electron: tenta localhost, depois o IP da rede local) ──
;(async function autoDetectServer() {
    if (window.location.protocol !== 'file:') return
    const erro = document.getElementById('erro')
    const ok = async (url) => {
        if (!url) return false
        try {
            const controller = new AbortController()
            const t = setTimeout(() => controller.abort(), 1500)
            await fetch(url.replace(/\/+$/, '') + '/', { method: 'HEAD', signal: controller.signal })
            clearTimeout(t)
            return true
        } catch {
            return false
        }
    }
    const savedUrl = localStorage.getItem('serverUrl')
    // Se já há um endereço salvo, valida ele (IP antigo salvo não pode travar o login)
    if (savedUrl) {
        if (await ok(savedUrl)) return
        localStorage.removeItem('serverUrl')
        erro.innerText = 'Endereço salvo indisponível, buscando servidor...'
        erro.style.color = '#facc15'
    }
    erro.innerText = 'Detectando servidor...'
    erro.style.color = '#facc15'
    if (await ok('http://localhost:3000')) {
        erro.innerText = ''
        return
    }
    if (await ok('http://192.168.3.26:3000')) {
        localStorage.setItem('serverUrl', 'http://192.168.3.26:3000')
        erro.innerText = 'Servidor encontrado na rede local, conectando...'
        erro.style.color = '#4ade80'
        setTimeout(() => location.reload(), 1200)
        return
    }
    erro.innerText = 'Servidor não encontrado. Verifique se ele está rodando e, se necessário, configure o endereço.'
    erro.style.color = '#f87171'
    const area = document.getElementById('server-config-area')
    if (area) area.style.display = 'block'
})()

// ── Server config ──
document.getElementById('btn-server-config-login').onclick = () => {
    const area = document.getElementById('server-config-area')
    area.style.display = area.style.display === 'none' ? 'block' : 'none'
    if (area.style.display === 'block') {
        document.getElementById('input-server-url').value = localStorage.getItem('serverUrl') || ''
        document.getElementById('input-server-url').focus()
    }
}

document.getElementById('btn-cancel-server').onclick = () => {
    document.getElementById('server-config-area').style.display = 'none'
}

document.getElementById('btn-localhost-server').onclick = () => {
    localStorage.removeItem('serverUrl')
    document.getElementById('server-config-area').style.display = 'none'
    document.getElementById('erro').innerText = 'Usando localhost:3000'
    document.getElementById('erro').style.color = '#facc15'
    setTimeout(() => location.reload(), 1500)
}

document.getElementById('btn-save-server').onclick = () => {
    const url = document.getElementById('input-server-url').value.trim()
    if (url) {
        const clean = url.replace(/\/+$/, '')
        localStorage.setItem('serverUrl', clean)
        const origin = clean.match(/^https?:\/\/[^\/]+/)[0]
        const meta = document.getElementById('meta-csp')
        if (meta) {
            let csp = meta.getAttribute('content')
            if (csp.indexOf(origin) === -1) {
                csp = csp.replace(/(connect-src[^;]*)/, '$1 ' + origin)
                meta.setAttribute('content', csp)
            }
        }
        document.getElementById('erro').innerText = 'Servidor salvo! Reconectando...'
        document.getElementById('erro').style.color = '#4ade80'
    } else {
        localStorage.removeItem('serverUrl')
        document.getElementById('erro').innerText = 'Usando servidor local (localhost:3000)'
        document.getElementById('erro').style.color = '#facc15'
    }
    document.getElementById('server-config-area').style.display = 'none'
    setTimeout(() => location.reload(), 1500)
}
