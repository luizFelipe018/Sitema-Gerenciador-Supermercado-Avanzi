// Remove os rascunhos (registros_placas) dos modelos removidos.
// Uso: node tools/limpar-modelos-antigos.js
require('dotenv').config()
const mysql = require('mysql2/promise')

async function main() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
        user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    })

    const [r] = await db.query(
        "DELETE FROM registros_placas WHERE tipo_placa IN ('branca', 'amarela')"
    )
    console.log(`rascunhos obsoletos removidos: ${r.affectedRows}`)

    const [t] = await db.query('SELECT tipo_placa, COUNT(*) AS q FROM registros_placas GROUP BY tipo_placa')
    console.log('registros_placas agora:', JSON.stringify(t))

    const [h] = await db.query('SELECT tipo_placa, COUNT(*) AS q FROM log_placas GROUP BY tipo_placa')
    console.log('log_placas (histórico, mantido):', JSON.stringify(h))

    await db.end()
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })
