// Remove os produtos de teste do banco.
// Uso: node tools/limpar-teste.js
require('dotenv').config()
const mysql = require('mysql2/promise')

async function main() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    })
    const [r] = await db.query("DELETE FROM produtos WHERE codigo LIKE 'TESTE%'")
    console.log(`${r.affectedRows} produto(s) de teste removido(s)`)
    await db.end()
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })
