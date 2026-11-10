// Testa o fluxo de salvar placas do tipo pequena pela API.
// Uso: node tools/testar-placas.js
const API = 'http://localhost:3000'

async function main() {
    const login = await fetch(API + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: 'admin', senha: '1234' })
    })
    const { token, user } = await login.json()
    const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

    // cria uma lista de teste para guardar as placas
    const rLista = await fetch(API + '/listas', { method: 'POST', headers: h, body: JSON.stringify({ nome: '__teste_modelos__' }) })
    const lista = await rLista.json()
    console.log('lista de teste criada:', lista.id)

    // salva 1 placa pequena
    const placas = [{ descricao: 'TESTE PLACA GRANDE 4', codigo: 'TESTE4', ean: '999888777666', preco: 12.34 }]
    const rSalva = await fetch(`${API}/registros-placas`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ tipo: 'pequena', placas })
    })
    const salvo = await rSalva.json()
    console.log('salvo:', JSON.stringify(salvo))

    // lê de volta
    const rLê = await fetch(`${API}/registros-placas?tipo=pequena`, { headers: h })
    const lidos = await rLê.json()
    console.log('lidos de volta:', JSON.stringify(lidos.map(p => ({ codigo: p.codigo, tipo: p.tipo_placa, usuario: p.usuario }))))

    // limpa
    await fetch(`${API}/registros-placas/limpar/pequena`, { method: 'DELETE', headers: h })
    await fetch(`${API}/listas/${lista.id}`, { method: 'DELETE', headers: h })
    console.log('limpeza ok')
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })
