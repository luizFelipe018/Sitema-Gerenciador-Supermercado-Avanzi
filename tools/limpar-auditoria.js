// Limpa TODOS os eventos de auditoria.
// Uso: node tools/limpar-auditoria.js --todos
require('dotenv').config()
const mysql = require('mysql2/promise')

async function main() {
    const todos = process.argv.includes('--todos')
    const db = await mysql.createConnection({
        host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
        user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    })

    const where = todos ? '' : "AND usuario = '__test__'"
    const [r] = await db.query(`DELETE FROM audit_logs WHERE 1=1 ${where}`)
    const [t] = await db.query('SELECT COUNT(*) AS total FROM audit_logs')
    console.log(`removidos: ${r.affectedRows} | total na tabela: ${t[0].total}`)
    await db.end()
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })
