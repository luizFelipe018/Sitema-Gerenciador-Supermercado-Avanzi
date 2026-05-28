const router = require('express').Router()
const authMiddleware = require('../middlewares/authMiddleware')

router.get('/configuracao/:chave', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const [rows] = await db.query('SELECT valor FROM configuracoes WHERE chave = ?', [req.params.chave])
        if (!rows[0]) return res.status(404).json({ error: 'Configuração não encontrada' })
        res.json({ chave: req.params.chave, valor: rows[0].valor })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.put('/configuracao/:chave', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { valor } = req.body
        if (!valor) return res.status(400).json({ error: 'Valor obrigatório' })
        await db.query(
            'INSERT INTO configuracoes (chave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = ?',
            [req.params.chave, valor, valor]
        )
        res.json({ chave: req.params.chave, valor })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
