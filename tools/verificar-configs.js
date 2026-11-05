// Mostra os configs (predefinições) salvos por placa.
// Uso: node tools/verificar-configs.js
require('dotenv').config()
const mysql = require('mysql2/promise')

async function main() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
        user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    })
    const [r] = await db.query(
        'SELECT id, codigo, descricao, tipo_placa, config FROM registros_placas WHERE config IS NOT NULL AND config <> \'\' ORDER BY id DESC LIMIT 15'
    )
    console.log('=== placas com predefinição salva ===')
    console.table(r.map(x => ({ id: x.id, codigo: x.codigo, tipo: x.tipo_placa, config: (x.config || '').slice(0, 90) })))
    await db.end()
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })
