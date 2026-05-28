const router = require('express').Router()
const authMiddleware = require('../middlewares/authMiddleware')

router.post('/migrar-cargos', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const [cols] = await db.query('SHOW COLUMNS FROM usuarios LIKE "cargo"')
        if (cols.length > 0) {
            return res.json({ ok: true, message: 'Coluna cargo já existe' })
        }
        await db.query("ALTER TABLE usuarios ADD COLUMN cargo ENUM('administrador', 'gerente', 'atendente') DEFAULT 'atendente'")
        await db.query("UPDATE usuarios SET cargo = 'administrador' WHERE usuario = 'luiz'")
        res.json({ ok: true, message: 'Migração concluída: coluna cargo adicionada' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.get('/usuarios', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const [rows] = await db.query('SELECT id, nome, usuario, cargo, created_at FROM usuarios ORDER BY nome')
        res.json(rows)
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/usuarios/:id/cargo', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { cargo } = req.body
        if (!['administrador', 'gerente', 'atendente'].includes(cargo)) {
            return res.status(400).json({ error: 'Cargo inválido' })
        }
        await db.query('UPDATE usuarios SET cargo = ? WHERE id = ?', [cargo, req.params.id])
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/usuarios/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id])
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
