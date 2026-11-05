// Testa a importação de produtos via API.
// Uso: node tools/testar-importacao.js [caminho.xlsx]
const fs = require('fs')
const path = require('path')

const arquivo = path.resolve(process.argv[2] || 'tools/produtos-teste.xlsx')

async function main() {
    const login = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: 'admin', senha: '1234' })
    })
    const { token } = await login.json()

    const form = new FormData()
    form.append('file', new Blob([fs.readFileSync(arquivo)]), path.basename(arquivo))

    const res = await fetch('http://localhost:3000/importar/produtos', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
    })

    const texto = await res.text()
    console.log('HTTP', res.status)
    console.log(texto.slice(0, 2000))
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })
