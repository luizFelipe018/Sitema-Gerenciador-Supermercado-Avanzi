const router = require('express').Router()
const productController = require('../controllers/productController')
const authController    = require('../controllers/authController')
const userController    = require('../controllers/userController')
const authMiddleware    = require('../middlewares/authMiddleware')
const { somenteAdmin }  = require('../middlewares/roles')
const auditService      = require('../services/auditService')

// Limite simples de tentativas de login por IP — evita força bruta na rede da loja.
const LOGIN_MAX = 10
const LOGIN_JANELA_MS = 15 * 60 * 1000
const tentativasLogin = new Map()

function limiteLogin(req, res, next) {
    const ip = req.ip || req.socket?.remoteAddress || 'desconhecido'
    const agora = Date.now()
    const reg = tentativasLogin.get(ip) || { count: 0, inicio: agora }
    if (agora - reg.inicio > LOGIN_JANELA_MS) {
        reg.count = 0
        reg.inicio = agora
    }
    if (reg.count >= LOGIN_MAX) {
        return res.status(429).json({ error: 'Muitas tentativas de login. Aguarde 15 minutos.' })
    }
    reg.count++
    tentativasLogin.set(ip, reg)
    if (tentativasLogin.size > 500) {
        for (const [chave, valor] of tentativasLogin) {
            if (agora - valor.inicio > LOGIN_JANELA_MS) tentativasLogin.delete(chave)
        }
    }
    res.on('finish', () => {
        if (res.statusCode < 400) tentativasLogin.delete(ip)
    })
    next()
}

router.get('/', (req, res) => res.json({ message: 'API OK 🔥' }))

router.post('/login', limiteLogin, authController.login)

// Saída do sistema — fica registrada na trilha de auditoria
router.post('/logout', authMiddleware, async (req, res) => {
    await auditService.registrar(req, auditService.ACOES.LOGOUT, {
        descricao: `saiu do sistema`,
        entidade: 'sessao'
    })
    res.json({ ok: true })
})

router.post('/usuarios', authMiddleware, somenteAdmin, userController.create)

router.get('/usuarios/minha-conta', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const [rows] = await db.query(
            'SELECT id, nome, usuario, cargo, ultimo_login, criado_em FROM usuarios WHERE id = ?',
            [req.user.id]
        )
        if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado' })
        res.json(rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.get('/produtos',            authMiddleware, productController.findAll)
router.get('/produtos/busca', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { q } = req.query
        if (!q || q.length < 2) return res.json([])
        const termo = `%${q.trim()}%`
        const [rows] = await db.query(
            `SELECT p.codigo, p.descricao, p.ean, p.preco_venda, p.familia, p.marca,
                    COALESCE(NULLIF(p.descricao_departamento, ''), NULLIF(p.departamento, '')) AS descricao_departamento,
                    (SELECT COUNT(*) FROM produtos f WHERE f.familia = p.familia AND p.familia IS NOT NULL AND p.familia <> '') AS familia_qtd
             FROM produtos p
             WHERE p.descricao LIKE ? OR p.codigo LIKE ? OR p.ean LIKE ? OR p.marca LIKE ?
             ORDER BY p.descricao
             LIMIT 30`,
            [termo, termo, termo, termo]
        )
        res.json(rows)
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/produtos/busca/ean/:ean', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const [rows] = await db.query('SELECT * FROM produtos WHERE ean = ?', [req.params.ean])
        if (rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' })
        res.json(rows[0])
    } catch (err) { res.status(500).json({ error: err.message }) }
})
router.get('/produtos/:codigo',    authMiddleware, productController.findByCodigo)
router.post('/produtos',           authMiddleware, productController.create)
router.put('/produtos/:codigo',    authMiddleware, productController.update)
router.delete('/produtos/:codigo', authMiddleware, productController.remove)

module.exports = router
