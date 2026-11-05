const router = require('express').Router()
const authMiddleware = require('../middlewares/authMiddleware')
const auditService = require('../services/auditService')

/** Admin-only: gerência de usuários é restrita a administradores. */
function somenteAdmin(req, res, next) {
    const cargo = req.user?.cargo || 'atendente'
    if (cargo !== 'administrador') {
        return res.status(403).json({ error: 'Acesso restrito a administradores' })
    }
    next()
}

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
        const [rows] = await db.query(
            'SELECT id, nome, usuario, cargo, ativo, ultimo_login, criado_em FROM usuarios ORDER BY nome'
        )
        res.json(rows)
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/usuarios/:id/cargo', authMiddleware, somenteAdmin, async (req, res) => {
    try {
        const db = require('../config/database')
        const { cargo } = req.body
        if (!['administrador', 'gerente', 'atendente'].includes(cargo)) {
            return res.status(400).json({ error: 'Cargo inválido' })
        }
        await db.query('UPDATE usuarios SET cargo = ? WHERE id = ?', [cargo, req.params.id])
        await auditService.registrar(req, auditService.ACOES.EDITAR_USUARIO, {
            descricao: `alterou o cargo de um usuário para ${cargo}`,
            entidade: 'usuarios',
            detalhes: { id: req.params.id, cargo }
        })
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

/** Ativa/desativa um usuário — usuário desativado não consegue entrar */
router.put('/usuarios/:id/ativo', authMiddleware, somenteAdmin, async (req, res) => {
    try {
        const db = require('../config/database')
        const { ativo } = req.body
        const valor = ativo ? 1 : 0

        // Não permite desativar a si mesmo
        if (Number(req.params.id) === Number(req.user?.id) && !valor) {
            return res.status(400).json({ error: 'Você não pode desativar a própria conta' })
        }

        const [rows] = await db.query('SELECT usuario, nome FROM usuarios WHERE id = ?', [req.params.id])
        if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado' })

        await db.query('UPDATE usuarios SET ativo = ? WHERE id = ?', [valor, req.params.id])

        await auditService.registrar(req, auditService.ACOES.ATIVAR_USUARIO, {
            descricao: `${valor ? 'ativou' : 'desativou'} o usuário ${rows[0].usuario}`,
            entidade: 'usuarios',
            detalhes: { id: req.params.id, usuario: rows[0].usuario, ativo: !!valor }
        })

        res.json({ ok: true, ativo: !!valor })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

/** Redefine a senha de um usuário */
router.put('/usuarios/:id/senha', authMiddleware, somenteAdmin, async (req, res) => {
    try {
        const bcrypt = require('bcryptjs')
        const db = require('../config/database')
        const { senha } = req.body
        if (!senha || String(senha).length < 4) {
            return res.status(400).json({ error: 'A senha deve ter ao menos 4 caracteres' })
        }
        const hash = await bcrypt.hash(String(senha), 10)
        const [rows] = await db.query('SELECT usuario FROM usuarios WHERE id = ?', [req.params.id])
        if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado' })

        await db.query('UPDATE usuarios SET senha = ? WHERE id = ?', [hash, req.params.id])

        await auditService.registrar(req, auditService.ACOES.EDITAR_USUARIO, {
            descricao: `redefiniu a senha de ${rows[0].usuario}`,
            entidade: 'usuarios',
            detalhes: { id: req.params.id, usuario: rows[0].usuario }
        })

        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/usuarios/:id', authMiddleware, somenteAdmin, async (req, res) => {
    try {
        const db = require('../config/database')
        if (Number(req.params.id) === Number(req.user?.id)) {
            return res.status(400).json({ error: 'Você não pode excluir a própria conta' })
        }
        const [rows] = await db.query('SELECT usuario, nome FROM usuarios WHERE id = ?', [req.params.id])
        if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado' })

        await db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id])

        await auditService.registrar(req, auditService.ACOES.EXCLUIR_USUARIO, {
            descricao: `excluiu o usuário ${rows[0].usuario}`,
            entidade: 'usuarios',
            detalhes: { id: req.params.id, usuario: rows[0].usuario }
        })

        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
