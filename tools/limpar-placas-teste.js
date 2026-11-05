// Remove apenas a placa de teste criada por esta sessão (codigo 1 / FRUTA ABACATE KG).
// Uso: node tools/limpar-placas-teste.js
require('dotenv').config()
const mysql = require('mysql2/promise')

async function main() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
        user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    })
    const [r1] = await db.query(
        "DELETE FROM registros_placas WHERE codigo = '1' AND descricao LIKE 'FRUTA ABACATE%' AND usuario = 'admin'"
    )
    const [r2] = await db.query(
        "DELETE FROM log_placas WHERE codigo = '1' AND descricao LIKE 'FRUTA ABACATE%' AND usuario = 'admin'"
    )
    console.log(`placas removidas: ${r1.affectedRows} | logs removidos: ${r2.affectedRows}`)
    await db.end()
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })
