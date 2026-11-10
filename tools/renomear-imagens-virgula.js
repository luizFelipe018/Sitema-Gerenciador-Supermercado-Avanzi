/* ═══════════════════════════════════════════════════════════════
   RENOMEAR IMAGENS: arquivos com vírgula no nome -> ponto
   Usa a nova descrição do ERP (que agora usa "." em vez de ",").
   Por padrão só LISTA o que seria renomeado (dry-run).
   Use --aplicar para renomear de verdade.
   Uso:  node tools/renomear-imagens-virgula.js           (dry-run)
         node tools/renomear-imagens-virgula.js --aplicar  (renomeia)
   ═══════════════════════════════════════════════════════════════ */

const path = require('path')
const fs = require('fs')

require('dotenv').config()
const APLICAR = process.argv.includes('--aplicar')
const EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'])

;(async () => {
    let pasta = process.env.PASTA_IMAGENS || 'E:\\Banco de Imagens\\'
    try {
        const db = require('../src/config/database')
        const [rows] = await db.query("SELECT valor FROM configuracoes WHERE chave = 'pasta_imagens'")
        if (rows[0] && rows[0].valor) pasta = rows[0].valor
    } catch { /* usa o padrão do .env */ }

    console.log('Pasta:', pasta)
    if (!fs.existsSync(pasta)) {
        console.log('Pasta não existe — nada a fazer.')
        process.exit(0)
    }

    const itens = fs.readdirSync(pasta).filter(f => EXTS.has(path.extname(f).toLowerCase()))
    let previstos = 0, renomeados = 0, conflitos = 0

    for (const nome of itens) {
        if (!nome.includes(',')) continue
        previstos++
        const novo = nome.replace(/,/g, '.')
        const de = path.join(pasta, nome)
        const para = path.join(pasta, novo)
        if (fs.existsSync(para)) {
            console.log(`  CONFLITO (já existe): ${nome} -> ${novo}`)
            conflitos++
            continue
        }
        if (APLICAR) {
            fs.renameSync(de, para)
            renomeados++
            console.log(`  ✓ ${nome} -> ${novo}`)
        } else {
            console.log(`  -> ${nome} -> ${novo}`)
        }
    }

    console.log(`\n${previstos} arquivo(s) com vírgula · ${APLICAR ? renomeados + ' renomeado(s)' : 'dry-run (nada renomeado)'} · ${conflitos} conflito(s)`)
    console.log('Para renomear de verdade, rode com --aplicar')
    process.exit(0)
})().catch(e => { console.log('erro:', e.message); process.exit(1) })
