const router = require('express').Router()
const authMiddleware = require('../middlewares/authMiddleware')

router.get('/database/tables', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const [tables] = await db.query(`
            SELECT TABLE_NAME, TABLE_ROWS, TABLE_COMMENT,
                   (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = t.TABLE_NAME) AS COLUMNS
            FROM information_schema.TABLES t
            WHERE TABLE_SCHEMA = DATABASE()
            ORDER BY TABLE_NAME
        `)
        res.json(tables)
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/database/tables/:table', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const table = req.params.table.replace(/[^a-zA-Z0-9_]/g, '')
        const [columns] = await db.query(`
            SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT, EXTRA, COLUMN_COMMENT
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
            ORDER BY ORDINAL_POSITION
        `, [table])
        const [indexes] = await db.query('SHOW INDEX FROM `' + table + '`')
        const [pks] = await db.query(`
            SELECT COLUMN_NAME FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_KEY = 'PRI'
        `, [table])
        res.json({ columns, indexes, primaryKeys: pks.map(r => r.COLUMN_NAME) })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/database/tables/:table/data', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const table = req.params.table.replace(/[^a-zA-Z0-9_]/g, '')
        const page = Math.max(1, parseInt(req.query.page) || 1)
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50))
        const offset = (page - 1) * limit
        const [rows] = await db.query('SELECT * FROM `' + table + '` LIMIT ? OFFSET ?', [limit, offset])
        const [countResult] = await db.query('SELECT COUNT(*) AS total FROM `' + table + '`')
        res.json({ data: rows, total: countResult[0].total, page, limit })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/database/tables/:table/row', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const table = req.params.table.replace(/[^a-zA-Z0-9_]/g, '')
        const { column, value, pks } = req.body
        if (!column || !pks || !Object.keys(pks).length) {
            return res.status(400).json({ error: 'column e pks são obrigatórios' })
        }
        const colSafe = column.replace(/[^a-zA-Z0-9_]/g, '')
        const where = Object.keys(pks).map(k => '`' + k.replace(/[^a-zA-Z0-9_]/g, '') + '` = ?').join(' AND ')
        const params = Object.values(pks)
        await db.query('UPDATE `' + table + '` SET `' + colSafe + '` = ? WHERE ' + where, [value, ...params])
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
