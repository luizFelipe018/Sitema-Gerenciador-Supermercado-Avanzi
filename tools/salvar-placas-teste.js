// Salva placas de teste no tipo pequena para conferir a visualização.
// Uso: node tools/salvar-placas-teste.js [quantidade]
const API = 'http://localhost:3000'

async function main() {
    const qtd = Number(process.argv[2] || 4)
    const login = await fetch(API + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: 'admin', senha: '1234' })
    })
    const { token } = await login.json()
    const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

    const placas = []
    for (let i = 1; i <= qtd; i++) {
        placas.push({
            descricao: `PRODUTO DE TESTE PARA VISUALIZACAO ${i}`,
            codigo: `VIS${1000 + i}`,
            ean: `78955500000${i}`,
            preco: 10 + i * 3.5,
            marca: 'MARCA TESTE'
        })
    }

    const res = await fetch(`${API}/registros-placas`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ tipo: 'pequena', placas })
    })
    console.log('salvas:', JSON.stringify(await res.json()))
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })
