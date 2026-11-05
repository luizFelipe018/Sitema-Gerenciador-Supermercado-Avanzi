// Lista usuários com cargo e status.
// Uso: node tools/usuarios.js
require('dotenv').config()
const mysql = require('mysql2/promise')

async function main() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
        user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    })
    const [rows] = await db.query('SELECT id, nome, usuario, cargo, ativo, ultimo_login FROM usuarios ORDER BY nome')
    console.table(rows)
    await db.end()
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })
