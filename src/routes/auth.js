const router = require('express').Router()
const productController = require('../controllers/productController')
const authController    = require('../controllers/authController')
const userController    = require('../controllers/userController')
const authMiddleware    = require('../middlewares/authMiddleware')

router.get('/', (req, res) => res.json({ message: 'API OK 🔥' }))

router.post('/login', authController.login)
router.post('/usuarios', userController.create)

router.get('/produtos',            authMiddleware, productController.findAll)
router.get('/produtos/busca', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { q } = req.query
        if (!q || q.length < 2) return res.json([])
        const termo = `%${q.trim()}%`
        const [rows] = await db.query(
            'SELECT codigo, descricao, preco_venda, marca FROM produtos WHERE descricao LIKE ? ORDER BY descricao LIMIT 30',
            [termo]
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
