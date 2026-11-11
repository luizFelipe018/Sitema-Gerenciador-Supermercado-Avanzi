/* Backup completo do banco em arquivo .sql (sem mysqldump).
   Lê todas as tabelas em ordem segura (fora de FK) e escreve arquivos INSERT.
   A pasta de destino vem da configuração 'pasta_backup' (ou usa data/backups no app). */

const fs = require('fs')
const path = require('path')

function sqlValue(v) {
    if (v === null || v === undefined) return 'NULL'
    if (Buffer.isBuffer(v)) return "'" + v.toString('hex').toLowerCase() + "'" // BLOB como hex
    if (typeof v === 'number') {
        if (!Number.isFinite(v)) return 'NULL'
        return String(v)
    }
    if (typeof v === 'boolean') return v ? '1' : '0'
    if (v instanceof Date) return "'" + v.toISOString().slice(0, 19).replace('T', ' ') + "'"
    const s = String(v)
    return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "''") + "'"
}

async function fazerBackup(destinoDir) {
    const db = require('../config/database')
    fs.mkdirSync(destinoDir, { recursive: true })
    const ts = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')
    const arquivo = path.join(destinoDir, 'erp-backup-' + ts + '.sql')
    const out = fs.createWriteStream(arquivo, { encoding: 'utf8' })
    const write = (s) => new Promise((resolve, reject) => {
        if (!out.write(s, 'utf8')) out.once('drain', resolve)
        else resolve()
    })

    await write('-- Backup ERP Avanzi\n-- gerado em: ' + new Date().toISOString() + '\n\n')
    await write('SET FOREIGN_KEY_CHECKS = 0;\nSET SQL_MODE = "";\n\n')

    const [tableRows] = await db.query('SHOW TABLES')
    const tabelaKey = Object.keys(tableRows[0] || {})[0]
    const tabelas = tableRows.map(r => r[tabelaKey])

    let totalLinhas = 0
    for (const tabela of tabelas) {
        // Estrutura da tabela
        const [[ddl]] = await db.query('SHOW CREATE TABLE `' + tabela + '`')
        const createSql = ddl['Create Table'] || ddl['CREATE TABLE']
        await write('\n-- ── ' + tabela + ' ──\n')
        await write('DROP TABLE IF EXISTS `' + tabela + '`;\n')
        await write(createSql + ';\n\n')
        // Dados
        const [rows] = await db.query('SELECT * FROM `' + tabela + '`')
        totalLinhas += rows.length
        if (!rows.length) continue
        const colunas = Object.keys(rows[0]).map(c => '`' + c + '`').join(', ')
        const CHUNK = 200
        for (let i = 0; i < rows.length; i += CHUNK) {
            const chunk = rows.slice(i, i + CHUNK)
            const values = chunk.map(r =>
                '(' + Object.values(r).map(sqlValue).join(', ') + ')'
            ).join(',\n  ')
            await write('INSERT INTO `' + tabela + '` (' + colunas + ') VALUES\n  ' + values + ';\n')
        }
    }
    await write('\nSET FOREIGN_KEY_CHECKS = 1;\n')
    await new Promise((resolve, reject) => {
        out.end(() => resolve(null))
        out.on('error', reject)
    })

    const stat = fs.statSync(arquivo)
    return { arquivo, tamanho: stat.size, tabelas: tabelas.length, linhas: totalLinhas }
}

module.exports = { fazerBackup }
