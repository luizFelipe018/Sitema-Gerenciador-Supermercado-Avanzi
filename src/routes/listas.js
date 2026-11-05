const router = require('express').Router()
const authMiddleware = require('../middlewares/authMiddleware')

// ── Migrações da tabela de itens ─────────────────────────────
// A lista é um retrato (snapshot) do momento da oferta: família, marca e
// departamento são copiados para o item para o designer receber tudo pronto,
// mesmo que o cadastro do produto mude depois.
;(async () => {
    const db = require('../config/database')
    const colunas = [
        ['familia', 'VARCHAR(100) NULL'],
        ['marca', 'VARCHAR(100) NULL'],
        ['departamento', 'VARCHAR(100) NULL'],
        ['inclusao', "ENUM('individual','familia') NOT NULL DEFAULT 'individual'"]
    ]
    for (const [col, def] of colunas) {
        try {
            const [existe] = await db.query('SHOW COLUMNS FROM listas_precos_itens LIKE ?', [col])
            if (!existe.length) {
                await db.query(`ALTER TABLE listas_precos_itens ADD COLUMN \`${col}\` ${def}`)
            }
        } catch (e) {
            console.error('[listas] migração:', e.message)
        }
    }
})()

router.get('/listas', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const [rows] = await db.query(`
            SELECT l.*,
                   (SELECT COUNT(*) FROM listas_precos_itens i WHERE i.lista_id = l.id) AS total_itens,
                   (SELECT COALESCE(SUM(i.preco),0) FROM listas_precos_itens i WHERE i.lista_id = l.id) AS valor_total
            FROM listas_precos l
            ORDER BY l.criado_em DESC
        `)
        res.json(rows)
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/listas', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { nome, data_oferta } = req.body
        if (!nome) return res.status(400).json({ error: 'Nome obrigatório' })
        const [result] = await db.query(
            'INSERT INTO listas_precos (nome, data_oferta) VALUES (?, ?)',
            [nome, data_oferta || null]
        )
        res.status(201).json({ id: result.insertId, nome, data_oferta: data_oferta || null })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/listas/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { nome } = req.body
        await db.query('UPDATE listas_precos SET nome = ? WHERE id = ?', [nome, req.params.id])
        res.json({ id: req.params.id, nome })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/listas/:id/finalizar', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await db.query('UPDATE listas_precos SET finalizada = 1 WHERE id = ?', [req.params.id])
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/listas/:id/duplicar', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { nome, data_oferta } = req.body

        const [result] = await db.query(
            'INSERT INTO listas_precos (nome, lista_pai_id, data_oferta) VALUES (?, ?, ?)',
            [nome, req.params.id, data_oferta || null]
        )
        const novaId = result.insertId

        const [itens] = await db.query(
            'SELECT * FROM listas_precos_itens WHERE lista_id = ? ORDER BY ordem ASC',
            [req.params.id]
        )
        if (itens.length) {
            const valores = itens.map(i => [
                novaId, i.codigo, i.ean, i.descricao, i.preco, i.ordem,
                i.familia, i.marca, i.departamento, i.inclusao
            ])
            await db.query(
                `INSERT INTO listas_precos_itens
                    (lista_id, codigo, ean, descricao, preco, ordem, familia, marca, departamento, inclusao)
                 VALUES ?`,
                [valores]
            )
        }

        res.status(201).json({ id: novaId, nome, lista_pai_id: req.params.id })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/listas/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await db.query('DELETE FROM listas_precos WHERE id = ?', [req.params.id])
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/listas/:id/itens', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const [rows] = await db.query(
            'SELECT * FROM listas_precos_itens WHERE lista_id = ? ORDER BY ordem ASC, id ASC',
            [req.params.id]
        )
        res.json(rows)
    } catch (err) { res.status(500).json({ error: err.message }) }
})

/** Adiciona um item. Aceita os dados da família para manter o retrato da oferta. */
router.post('/listas/:id/itens', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { codigo, ean, descricao, preco, familia, marca, departamento, inclusao } = req.body
        if (!descricao) return res.status(400).json({ error: 'Descrição obrigatória' })

        const [[{ max_ordem }]] = await db.query(
            'SELECT COALESCE(MAX(ordem),0) as max_ordem FROM listas_precos_itens WHERE lista_id = ?',
            [req.params.id]
        )
        const ordem = max_ordem + 1

        const [result] = await db.query(
            `INSERT INTO listas_precos_itens
                (lista_id, codigo, ean, descricao, preco, ordem, familia, marca, departamento, inclusao)
             VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [
                req.params.id,
                codigo || null,
                ean || null,
                descricao,
                preco || 0,
                ordem,
                familia || null,
                marca || null,
                departamento || null,
                inclusao === 'familia' ? 'familia' : 'individual'
            ]
        )
        res.status(201).json({
            id: result.insertId, lista_id: Number(req.params.id),
            codigo, ean, descricao, preco, ordem,
            familia: familia || null, marca: marca || null,
            departamento: departamento || null,
            inclusao: inclusao === 'familia' ? 'familia' : 'individual'
        })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

/** Remove todos os itens da lista (mantém a lista). */
router.delete('/listas/:id/itens', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const [r] = await db.query('DELETE FROM listas_precos_itens WHERE lista_id = ?', [req.params.id])
        res.json({ ok: true, removidos: r.affectedRows })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/listas/:id/itens/:itemId', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { descricao, preco } = req.body
        await db.query(
            'UPDATE listas_precos_itens SET descricao = ?, preco = ? WHERE id = ? AND lista_id = ?',
            [descricao, preco, req.params.itemId, req.params.id]
        )
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/listas/:id/itens/:itemId', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await db.query('DELETE FROM listas_precos_itens WHERE id = ? AND lista_id = ?',
            [req.params.itemId, req.params.id])
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/listas/:id/exportar-xlsx', authMiddleware, async (req, res) => {
    const db = require('../config/database')
    try {
        const [[lista]] = await db.query('SELECT * FROM listas_precos WHERE id = ?', [req.params.id])
        if (!lista) return res.status(404).json({ error: 'Lista não encontrada' })

        const [itens] = await db.query(
            'SELECT * FROM listas_precos_itens WHERE lista_id = ? ORDER BY ordem ASC, id ASC',
            [req.params.id]
        )

        const ExcelJS = require('exceljs')
        const wb = new ExcelJS.Workbook()
        const ws = wb.addWorksheet('Ofertas')

        ws.columns = [
            { key: 'ordem',      width: 6 },
            { key: 'codigo',     width: 14 },
            { key: 'descricao',  width: 46 },
            { key: 'ean',        width: 16 },
            { key: 'preco',      width: 12 },
            { key: 'familia',    width: 30 },
            { key: 'marca',      width: 20 },
            { key: 'departamento', width: 22 },
            { key: 'inclusao',   width: 14 }
        ]

        const header = ws.addRow(['#', 'CODIGO', 'DESCRICAO', 'EAN', 'PRECO', 'FAMILIA', 'MARCA', 'DEPARTAMENTO', 'ORIGEM'])
        header.height = 22
        header.eachCell(cell => {
            cell.font      = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
            cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB51515' } }
            cell.alignment = { horizontal: 'center', vertical: 'middle' }
            cell.border    = { top:{style:'thin',color:{argb:'FFE5E7EB'}}, bottom:{style:'thin',color:{argb:'FFE5E7EB'}}, left:{style:'thin',color:{argb:'FFE5E7EB'}}, right:{style:'thin',color:{argb:'FFE5E7EB'}} }
        })

        let itensPai = []
        if (lista.lista_pai_id) {
            const [rowsPai] = await db.query(
                'SELECT * FROM listas_precos_itens WHERE lista_id = ? ORDER BY ordem ASC, id ASC',
                [lista.lista_pai_id]
            )
            itensPai = rowsPai
        }

        const descsPai   = new Set(itensPai.map(i => i.descricao.toUpperCase()))
        const descsFilho = new Set(itens.map(i => i.descricao.toUpperCase()))
        const temDiff    = itensPai.length > 0

        const adicionados = temDiff ? itens.filter(i => !descsPai.has(i.descricao.toUpperCase()))   : []
        const removidos   = temDiff ? itensPai.filter(i => !descsFilho.has(i.descricao.toUpperCase())) : []
        const mantidos    = temDiff ? itens.filter(i => descsPai.has(i.descricao.toUpperCase()))    : itens

        const borda = { top:{style:'thin',color:{argb:'FFE5E7EB'}}, bottom:{style:'thin',color:{argb:'FFE5E7EB'}}, left:{style:'thin',color:{argb:'FFE5E7EB'}}, right:{style:'thin',color:{argb:'FFE5E7EB'}} }

        const addRow = (item, tipo, idx) => {
            const preco = parseFloat(item.preco || 0).toFixed(2).replace('.', ',')
            const row   = ws.addRow([
                idx + 1,
                item.codigo || '',
                item.descricao || '',
                item.ean || '',
                preco,
                item.familia || '',
                item.marca || '',
                item.departamento || '',
                item.inclusao === 'familia' ? 'FAMÍLIA' : 'ÚNICO'
            ])

            let fill, fontColor, prefix = ''
            if (tipo === 'adicionado') {
                fill      = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFD1FAE5' } }
                fontColor = 'FF166534'
                prefix    = '+ '
            } else if (tipo === 'removido') {
                fill      = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFFEE2E2' } }
                fontColor = 'FF991B1B'
                prefix    = '- '
            } else {
                fill = idx % 2 === 0
                    ? { type:'pattern', pattern:'solid', fgColor:{ argb:'FFF9F9F9' } }
                    : { type:'pattern', pattern:'solid', fgColor:{ argb:'FFFFFFFF' } }
                fontColor = 'FF111827'
            }

            row.eachCell((cell, col) => {
                cell.font      = { name:'Calibri', size:11, color:{ argb: fontColor }, strike: tipo === 'removido' }
                cell.fill      = fill
                cell.border    = borda
                cell.alignment = col === 3 ? { horizontal:'left',   vertical:'middle' }
                               : col === 5 ? { horizontal:'right',  vertical:'middle' }
                               : col === 1 ? { horizontal:'center', vertical:'middle' }
                               :             { horizontal:'left',   vertical:'middle' }
                if (col === 4) cell.numFmt = '@'
                if (col === 3 && prefix) cell.value = prefix + cell.value
                if (col === 9) cell.alignment = { horizontal: 'center', vertical: 'middle' }
            })
        }

        if (temDiff && (adicionados.length || removidos.length)) {
            adicionados.forEach((item, i) => addRow(item, 'adicionado', i))
            mantidos.forEach((item, i)    => addRow(item, 'mantido', i))
            removidos.forEach((item, i)   => addRow(item, 'removido', i))

            ws.addRow([])
            const legenda = ws.addRow([`Alterações: +${adicionados.length} adicionado(s)   −${removidos.length} removido(s)   =${mantidos.length} mantido(s)`])
            ws.mergeCells(`A${legenda.number}:I${legenda.number}`)
            legenda.getCell(1).font      = { name:'Calibri', size:10, bold:true, color:{ argb:'FF374151' } }
            legenda.getCell(1).alignment = { horizontal:'left' }
        } else {
            itens.forEach((item, i) => addRow(item, 'mantido', i))
        }

        ws.addRow([])
        const agora = new Date().toLocaleString('pt-BR')
        const rodape = ws.addRow([`Gerado em: ${agora}`])
        ws.mergeCells(`A${rodape.number}:I${rodape.number}`)
        rodape.getCell(1).font      = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF666666' } }
        rodape.getCell(1).alignment = { horizontal: 'left' }

        const nomeLimpo = lista.nome.replace(/[^a-zA-Z0-9À-ÿ ]/g, '').trim()
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', `attachment; filename="${nomeLimpo}.xlsx"`)
        await wb.xlsx.write(res)
        res.end()

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
