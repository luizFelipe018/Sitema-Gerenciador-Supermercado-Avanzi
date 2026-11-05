// Remove os itens de teste que adicionei nas listas (família CAFE 3 CORACOES).
// Uso: node tools/limpar-listas-teste.js
require('dotenv').config()
const mysql = require('mysql2/promise')

async function main() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
        user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    })
    const [r] = await db.query(
        "DELETE FROM listas_precos_itens WHERE familia LIKE 'CAFE 3 CORACOES%'"
    )
    console.log(`${r.affectedRows} item(ns) de teste removido(s)`)
    await db.end()
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })
