// Mostra os últimos registros de placas por tipo.
// Uso: node tools/verificar-placas.js [limite]
require('dotenv').config()
const mysql = require('mysql2/promise')

async function main() {
    const limite = Number(process.argv[2] || 8)
    const db = await mysql.createConnection({
        host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
        user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    })

    const [r] = await db.query(
        'SELECT id, codigo, descricao, preco, tipo_placa, usuario FROM registros_placas ORDER BY id DESC LIMIT ?',
        [limite]
    )
    console.log('=== registros_placas (rascunhos) ===')
    console.table(r)

    const [l] = await db.query(
        'SELECT id, codigo, descricao, tipo_placa, usuario, criado_em FROM log_placas ORDER BY id DESC LIMIT ?',
        [limite]
    )
    console.log('=== log_placas (histórico) ===')
    console.table(l)

    await db.end()
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })
