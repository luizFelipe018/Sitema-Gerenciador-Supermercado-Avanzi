// Testa a exportação Excel da lista e mostra o conteúdo gerado.
// Uso: node tools/testar-excel-lista.js [listaId]
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const ExcelJS = require('exceljs')

const API = 'http://localhost:3000'

async function main() {
    const login = await fetch(API + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: 'admin', senha: '1234' })
    })
    const { token } = await login.json()

    const res = await fetch(API + '/listas', { headers: { Authorization: `Bearer ${token}` } })
    const listas = await res.json()
    const alvo = process.argv[2] ? listas.find(l => l.id == process.argv[2]) : listas.find(l => !l.finalizada && Number(l.total_itens) > 1)

    if (!alvo) { console.log('nenhuma lista com itens'); return }
    console.log(`Exportando: "${alvo.nome}" (${alvo.total_itens} itens)`)

    const r = await fetch(`${API}/listas/${alvo.id}/exportar-xlsx`, { headers: { Authorization: `Bearer ${token}` } })
    if (!r.ok) { console.log('ERRO', r.status, await r.text()); return }

    const buf = Buffer.from(await r.arrayBuffer())
    const saida = path.resolve('tools/teste-export.xlsx')
    fs.writeFileSync(saida, buf)
    console.log(`Arquivo gerado: ${saida} (${buf.length} bytes)`)

    // lê de volta para conferir as colunas
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.readFile(saida)
    const ws = wb.worksheets[0]
    console.log('\nColunas:', ws.columns.map(c => c.header || c.key).join(' | '))
    ws.eachRow((row, i) => {
        if (i > 6) return
        console.log(' ', row.values.slice(1).join(' | '))
    })
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })
