// Confere os dados importados no banco.
// Uso: node tools/verificar-importacao.js
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

    const [rows] = await db.query(
        "SELECT codigo, descricao, ean, preco_venda, estoque_atual, data_cadastro, marca, aceita_troca FROM produtos WHERE codigo LIKE 'TESTE%' ORDER BY codigo"
    )
    console.table(rows)

    await db.end()
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })
