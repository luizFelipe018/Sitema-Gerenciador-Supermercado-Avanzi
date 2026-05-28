const router = require('express').Router()
const authMiddleware = require('../middlewares/authMiddleware')

router.post('/log-placas', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const registros = req.body
        if (!Array.isArray(registros) || !registros.length)
            return res.status(400).json({ error: 'Envie um array de placas' })

        const valores = registros.map(p => [
            p.descricao || '',
            p.codigo    || null,
            p.ean       || null,
            p.preco     || null,
            p.tipo_placa || 'branca'
        ])

        const [result] = await db.query(
            `INSERT INTO log_placas (descricao, codigo, ean, preco, tipo_placa) VALUES ?`,
            [valores]
        )
        const firstId = result.insertId
        const ids = Array.from({ length: valores.length }, (_, i) => firstId + i)
        res.json({ inseridos: valores.length, ids })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.post('/log-placas/imprimir', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { ids } = req.body
        if (!Array.isArray(ids) || !ids.length)
            return res.status(400).json({ error: 'IDs obrigatórios' })
        await db.query(
            'UPDATE log_placas SET impressa = 1, impressa_em = NOW() WHERE id IN (?)',
            [ids]
        )
        res.json({ ok: true, atualizados: ids.length })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/log-placas', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { de, ate, descricao } = req.query

        let query = `SELECT * FROM log_placas WHERE 1=1`
        const params = []

        if (de)        { query += ` AND DATE(criado_em) >= ?`; params.push(de) }
        if (ate)       { query += ` AND DATE(criado_em) <= ?`; params.push(ate) }
        if (descricao) { query += ` AND descricao LIKE ?`;     params.push(`%${descricao}%`) }

        query += ` ORDER BY criado_em DESC`

        const [rows] = await db.query(query, params)
        res.json(rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.get('/registros-placas', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { tipo } = req.query
        const usuario = req.user.usuario
        let query = 'SELECT * FROM registros_placas WHERE usuario = ?'
        const params = [usuario]
        if (tipo) { query += ' AND tipo_placa = ?'; params.push(tipo) }
        query += ' ORDER BY ordem ASC'
        const [rows] = await db.query(query, params)
        res.json(rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.post('/registros-placas', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { tipo, placas } = req.body
        const usuario = req.user.usuario
        if (!Array.isArray(placas)) return res.status(400).json({ error: 'Envie um array de placas' })

        await db.query('DELETE FROM registros_placas WHERE usuario = ? AND tipo_placa = ?', [usuario, tipo])

        if (placas.length === 0) return res.json({ ok: true, total: 0 })

        const valores = placas.map((p, i) => [
            usuario,
            p.descricao || '',
            p.codigo || null,
            p.ean || null,
            p.preco || 0,
            p.preco_info || null,
            p.quantidade_kg_l || 0,
            p.descricao_kglt || null,
            i,
            tipo
        ])

        await db.query(
            `INSERT INTO registros_placas (usuario, descricao, codigo, ean, preco, preco_info, quantidade_kg_l, descricao_kglt, ordem, tipo_placa) VALUES ?`,
            [valores]
        )

        res.json({ ok: true, total: placas.length })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.delete('/registros-placas/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await db.query('DELETE FROM registros_placas WHERE id = ? AND usuario = ?', [req.params.id, req.user.usuario])
        res.json({ ok: true })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.delete('/registros-placas/limpar/:tipo', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await db.query('DELETE FROM registros_placas WHERE usuario = ? AND tipo_placa = ?', [req.user.usuario, req.params.tipo])
        res.json({ ok: true })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
