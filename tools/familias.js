// Diagnóstico das famílias de produtos.
// Uso: node tools/familias.js
require('dotenv').config()
const mysql = require('mysql2/promise')

async function main() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
        user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    })

    const [itens] = await db.query('SHOW COLUMNS FROM listas_precos_itens')
    console.log('=== listas_precos_itens ===')
    itens.forEach(c => console.log(`  ${c.Field.padEnd(16)} ${c.Type}`))

    const [tot] = await db.query(
        "SELECT COUNT(*) AS total, COUNT(DISTINCT familia) AS familias, SUM(familia IS NULL OR familia='') AS sem_familia FROM produtos"
    )
    console.log('\n=== produtos ===')
    console.log(tot[0])

    const [top] = await db.query(`
        SELECT familia, COUNT(*) AS qtd
        FROM produtos
        WHERE familia IS NOT NULL AND familia <> ''
        GROUP BY familia
        ORDER BY qtd DESC
        LIMIT 12
    `)
    console.log('\n=== maiores famílias ===')
    console.table(top)

    const [ex] = await db.query(`
        SELECT codigo, descricao, ean, familia, marca, preco_venda
        FROM produtos WHERE familia = (SELECT familia FROM produtos WHERE familia <> '' AND familia IS NOT NULL LIMIT 1)
    `)
    console.log('\n=== exemplo de uma família ===')
    console.table(ex.slice(0, 8))

    await db.end()
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })
