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

// ── Auto-detect server (Electron: tenta localhost, se falhar usa 192.168.2.55) ──
;(async function autoDetectServer() {
    const savedUrl = localStorage.getItem('serverUrl')
    if (savedUrl) return
    if (window.location.protocol !== 'file:') return
    const erro = document.getElementById('erro')
    erro.innerText = 'Detectando servidor...'
    erro.style.color = '#facc15'
    try {
        const controller = new AbortController()
        const t = setTimeout(() => controller.abort(), 1000)
        await fetch('http://localhost:3000/', { method: 'HEAD', signal: controller.signal })
        clearTimeout(t)
        erro.innerText = ''
    } catch {
        erro.innerText = 'Servidor local não encontrado, tentando 192.168.2.55...'
        localStorage.setItem('serverUrl', 'http://192.168.2.55:3000')
        setTimeout(() => location.reload(), 1500)
    }
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
