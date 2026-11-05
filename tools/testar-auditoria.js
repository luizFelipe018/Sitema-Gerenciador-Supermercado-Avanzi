// Teste do fluxo de auditoria: login -> cria placa -> consulta log.
// Uso: node tools/testar-auditoria.js
const API = 'http://localhost:3000'

async function main() {
    // 1. Login (deve registrar o evento)
    const login = await fetch(API + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: 'admin', senha: '1234' })
    })
    const { token, user } = await login.json()
    console.log('1. Login:', user.usuario, '/', user.cargo)

    const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

    // 2. Cria placas (deve registrar quem fez)
    const placas = [
        { descricao: 'AUDITORIA TESTE 1', codigo: 'AUD001', ean: '111', preco: 10.5, tipo_placa: 'branca' },
        { descricao: 'AUDITORIA TESTE 2', codigo: 'AUD002', ean: '222', preco: 20.0, tipo_placa: 'amarela' }
    ]
    const rPlacas = await fetch(API + '/log-placas', {
        method: 'POST', headers: h, body: JSON.stringify(placas)
    })
    const p = await rPlacas.json()
    console.log('2. Placas criadas:', p.inseridos)

    // 3. Marca como impressas
    await fetch(API + '/log-placas/imprimir', {
        method: 'POST', headers: h, body: JSON.stringify({ ids: p.ids })
    })
    console.log('3. Marcadas como impressas')

    // 4. Logout
    await fetch(API + '/logout', { method: 'POST', headers: h })
    console.log('4. Logout registrado')

    // 5. Consulta a auditoria
    const rAud = await fetch(API + '/auditoria?limite=10', { headers: { Authorization: `Bearer ${token}` } })
    const aud = await rAud.json()
    console.log('\n5. Eventos de auditoria (' + aud.total + ' no total):')
    aud.rows.slice(0, 6).forEach(r => {
        console.log(`   ${r.criado_em} | ${String(r.usuario).padEnd(8)} | ${String(r.acao).padEnd(16)} | ${r.descricao || ''}`)
    })

    // 6. Placas com usuário atribuído
    const rPorUsuario = await fetch(API + '/auditoria/placas-por-usuario', { headers: { Authorization: `Bearer ${token}` } })
    const porUsuario = await rPorUsuario.json()
    console.log('\n6. Placas por usuário:')
    porUsuario.slice(0, 6).forEach(l => {
        console.log(`   ${l.usuario} | ${l.tipo_placa} | ${l.total} placa(s) | ${l.impressas} impressa(s)`)
    })

    // 7. Resumo
    const rResumo = await fetch(API + '/auditoria/resumo', { headers: { Authorization: `Bearer ${token}` } })
    const resumo = await rResumo.json()
    console.log('\n7. Resumo por usuário:')
    resumo.porUsuario.forEach(u => {
        console.log(`   ${u.usuario} (${u.cargo}) — ${u.eventos} evento(s), ${u.placas} placa(s)`)
    })

    // 8. Limpa os dados de teste
    const mysql = require('mysql2/promise')
    require('dotenv').config()
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
        user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    })
    const [r1] = await conn.query("DELETE FROM log_placas WHERE codigo LIKE 'AUD%'")
    const [r2] = await conn.query("DELETE FROM audit_logs WHERE acao IN ('criar_placas','imprimir_placas','logout') AND criado_em > DATE_SUB(NOW(), INTERVAL 1 HOUR)")
    await conn.end()
    console.log(`\n8. Limpeza: ${r1.affectedRows} placa(s) e ${r2.affectedRows} evento(s) de teste removidos`)
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })
