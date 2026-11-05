// Correção pontual dos cargos de usuário.
// Uso: node tools/fix-cargos.js
require('dotenv').config()
const mysql = require('mysql2/promise')

async function main() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
        user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    })

    // Cargo vazio/inválido -> atendente
    await db.query("UPDATE usuarios SET cargo = 'atendente' WHERE cargo IS NULL OR cargo = '' OR cargo NOT IN ('administrador','gerente','atendente')")

    // A conta "admin" é a conta de administração do sistema
    await db.query("UPDATE usuarios SET cargo = 'administrador' WHERE usuario = 'admin'")

    // Remove duplicata de login criada durante a instalação ("Luiz" / id 7)
    const [dup] = await db.query(
        "SELECT id, usuario, nome FROM usuarios WHERE usuario = 'luiz' AND id <> (SELECT MIN(id) FROM (SELECT id FROM usuarios WHERE usuario = 'luiz') x)"
    )
    for (const d of dup) {
        await db.query('DELETE FROM usuarios WHERE id = ?', [d.id])
        console.log(`duplicata removida: #${d.id} ${d.usuario} (${d.nome})`)
    }

    const [rows] = await db.query('SELECT id, nome, usuario, cargo, ativo FROM usuarios ORDER BY nome')
    console.table(rows)
    await db.end()
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })
