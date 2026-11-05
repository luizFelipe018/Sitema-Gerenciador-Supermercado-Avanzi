const express = require('express')
const router = express.Router()
const db = require('../config/database')
const authMiddleware = require('../middlewares/authMiddleware')

/**
 * POST /marcas/prever
 * Simula quantos produtos vão receber a marca
 */
router.post('/prever', authMiddleware, async (req, res) => {
    try {
        const { marca, termo, apenasVazios } = req.body

        if (!termo || !termo.trim()) {
            return res.status(400).json({ error: 'Informe um termo para buscar na descrição.' })
        }

        const termoUpper = termo.trim().toUpperCase()
        let sql = `SELECT codigo, descricao, marca FROM produtos WHERE UPPER(descricao) LIKE CONCAT('%', ?, '%')`
        const params = [termoUpper]

        if (apenasVazios !== false) {
            sql += ` AND (marca IS NULL OR TRIM(marca) = '')`
        }

        sql += ` ORDER BY descricao ASC LIMIT 300`

        const [rows] = await db.query(sql, params)
        res.json({ ok: true, itens: rows, total: rows.length })
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

/**
 * POST /marcas/atribuir-massa
 * Atribui a marca em massa para produtos com o termo na descrição
 */
router.post('/atribuir-massa', authMiddleware, async (req, res) => {
    try {
        const { marca, termo, apenasVazios } = req.body

        if (!marca || !marca.trim()) {
            return res.status(400).json({ error: 'Informe o nome da marca para atribuir.' })
        }
        if (!termo || !termo.trim()) {
            return res.status(400).json({ error: 'Informe um termo para buscar na descrição.' })
        }

        const marcaTrim = marca.trim().toUpperCase()
        const termoUpper = termo.trim().toUpperCase()

        let sql = `UPDATE produtos SET marca = ? WHERE UPPER(descricao) LIKE CONCAT('%', ?, '%')`
        const params = [marcaTrim, termoUpper]

        if (apenasVazios !== false) {
            sql += ` AND (marca IS NULL OR TRIM(marca) = '')`
        }

        const [result] = await db.query(sql, params)
        res.json({ ok: true, afetados: result.affectedRows, marca: marcaTrim })
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

/**
 * POST /marcas/prever-multi
 * Simula várias regras de uma vez (termo -> marca).
 * { regras: [{termo, marca}], apenasVazios: true }
 */
router.post('/prever-multi', authMiddleware, async (req, res) => {
    try {
        const { regras, apenasVazios } = req.body
        if (!Array.isArray(regras) || regras.length === 0) {
            return res.status(400).json({ error: 'Informe ao menos uma regra (termo e marca).' })
        }
        if (regras.length > 50) {
            return res.status(400).json({ error: 'Máximo de 50 regras por vez. Simule/aplique em lotes.' })
        }
        const resultado = []
        for (const r of regras) {
            const termo = String(r.termo || '').trim()
            const marca = String(r.marca || '').trim()
            if (!termo || !marca) {
                resultado.push({ termo, marca, total: 0, amostra: [], erro: 'Termo e marca obrigatórios.' })
                continue
            }
            let sql = `SELECT codigo, descricao, marca FROM produtos WHERE UPPER(descricao) LIKE CONCAT('%', ?, '%')`
            const params = [termo.toUpperCase()]
            if (apenasVazios !== false) {
                sql += ` AND (marca IS NULL OR TRIM(marca) = '')`
            }
            sql += ` ORDER BY descricao ASC LIMIT 10`
            const [rows] = await db.query(sql, params)
            const [[count]] = await db.query(
                `SELECT COUNT(*) AS n FROM produtos WHERE UPPER(descricao) LIKE CONCAT('%', ?, '%')` +
                (apenasVazios !== false ? ` AND (marca IS NULL OR TRIM(marca) = '')` : ''),
                [termo.toUpperCase()]
            )
            resultado.push({ termo, marca: marca.toUpperCase(), total: count.n, amostra: rows })
        }
        res.json({ ok: true, regras: resultado })
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

/**
 * POST /marcas/atribuir-massa-multi
 * Aplica várias regras de uma vez, em ordem.
 * Termos sobrepostos com apenasVazios: a primeira regra que casar preenche;
 * as seguintes só preenchem o que ainda estiver vazio.
 */
router.post('/atribuir-massa-multi', authMiddleware, async (req, res) => {
    try {
        const { regras, apenasVazios } = req.body
        if (!Array.isArray(regras) || regras.length === 0) {
            return res.status(400).json({ error: 'Informe ao menos uma regra (termo e marca).' })
        }
        if (regras.length > 50) {
            return res.status(400).json({ error: 'Máximo de 50 regras por vez. Aplique em lotes.' })
        }
        const resultado = []
        let total = 0
        for (const r of regras) {
            const termo = String(r.termo || '').trim()
            const marca = String(r.marca || '').trim()
            if (!termo || !marca) {
                resultado.push({ termo, marca, afetados: 0, erro: 'Termo e marca obrigatórios.' })
                continue
            }
            let sql = `UPDATE produtos SET marca = ? WHERE UPPER(descricao) LIKE CONCAT('%', ?, '%')`
            const params = [marca.toUpperCase(), termo.toUpperCase()]
            if (apenasVazios !== false) {
                sql += ` AND (marca IS NULL OR TRIM(marca) = '')`
            }
            const [result] = await db.query(sql, params)
            total += result.affectedRows
            resultado.push({ termo, marca: marca.toUpperCase(), afetados: result.affectedRows })
        }
        res.json({ ok: true, afetados: total, regras: resultado })
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

module.exports = router
