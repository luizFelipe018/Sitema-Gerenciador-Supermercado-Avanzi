async function fazerLogin() {
    const usuario = document.getElementById('usuario').value
    const senha = document.getElementById('senha').value

    const response = await fetch('http://localhost:3000/login', {
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
        window.location.href = 'home.html'
    } else {
        document.getElementById('erro').innerText = data.error
    }
}

// Evento do botão (sem inline onclick)
document.getElementById('btn-login').addEventListener('click', fazerLogin)

// Permite logar pressionando Enter
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fazerLogin()
})
