const router = require('express').Router()
const authMiddleware = require('../middlewares/authMiddleware')

// Textos
router.get('/textos', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { q, categoria } = req.query
        let query  = 'SELECT * FROM textos WHERE 1=1'
        const params = []
        if (q) {
            query += ' AND (titulo LIKE ? OR conteudo LIKE ? OR tags LIKE ?)'
            params.push(`%${q}%`, `%${q}%`, `%${q}%`)
        }
        if (categoria) { query += ' AND categoria = ?'; params.push(categoria) }
        query += ' ORDER BY atualizado_em DESC'
        const [rows] = await db.query(query, params)
        res.json(rows)
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/textos', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { titulo, categoria, conteudo, tags } = req.body
        if (!titulo || !conteudo) return res.status(400).json({ error: 'Título e conteúdo obrigatórios' })
        const [result] = await db.query(
            'INSERT INTO textos (titulo, categoria, conteudo, tags) VALUES (?,?,?,?)',
            [titulo, categoria||null, conteudo, tags||null]
        )
        res.status(201).json({ id: result.insertId, titulo, categoria, conteudo, tags })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/textos/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { titulo, categoria, conteudo, tags } = req.body
        await db.query(
            'UPDATE textos SET titulo=?, categoria=?, conteudo=?, tags=? WHERE id=?',
            [titulo, categoria||null, conteudo, tags||null, req.params.id]
        )
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/textos/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await db.query('DELETE FROM textos WHERE id=?', [req.params.id])
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

// Formatos
router.get('/formatos', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { q, categoria } = req.query
        let sql = 'SELECT * FROM formatos WHERE 1=1'
        const params = []
        if (q) { sql += ' AND (nome LIKE ? OR descricao LIKE ?)'; params.push(`%${q}%`, `%${q}%`) }
        if (categoria) { sql += ' AND categoria = ?'; params.push(categoria) }
        sql += ' ORDER BY categoria, nome'
        const [rows] = await db.query(sql, params)
        res.json(rows)
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/formatos', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { nome, categoria, largura, altura, unidade, orientacao, descricao } = req.body
        if (!nome) return res.status(400).json({ error: 'Nome obrigatório' })
        const [r] = await db.query(
            'INSERT INTO formatos (nome, categoria, largura, altura, unidade, orientacao, descricao) VALUES (?,?,?,?,?,?,?)',
            [nome, categoria||null, largura||null, altura||null, unidade||'px', orientacao||null, descricao||null]
        )
        res.status(201).json({ id: r.insertId })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/formatos/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { nome, categoria, largura, altura, unidade, orientacao, descricao } = req.body
        await db.query(
            'UPDATE formatos SET nome=?, categoria=?, largura=?, altura=?, unidade=?, orientacao=?, descricao=? WHERE id=?',
            [nome, categoria||null, largura||null, altura||null, unidade||'px', orientacao||null, descricao||null, req.params.id]
        )
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/formatos/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await db.query('DELETE FROM formatos WHERE id=?', [req.params.id])
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

// Atalhos
router.get('/atalhos', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { q, categoria } = req.query
        let sql = 'SELECT * FROM atalhos WHERE 1=1'
        const params = []
        if (q) { sql += ' AND (nome LIKE ? OR descricao LIKE ? OR caminho LIKE ?)'; params.push(`%${q}%`, `%${q}%`, `%${q}%`) }
        if (categoria) { sql += ' AND categoria = ?'; params.push(categoria) }
        sql += ' ORDER BY categoria, nome'
        const [rows] = await db.query(sql, params)
        res.json(rows)
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/atalhos', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { nome, categoria, caminho, tipo, icone, descricao } = req.body
        if (!nome || !caminho) return res.status(400).json({ error: 'Nome e caminho obrigatórios' })
        const [r] = await db.query(
            'INSERT INTO atalhos (nome, categoria, caminho, tipo, icone, descricao) VALUES (?,?,?,?,?,?)',
            [nome, categoria||null, caminho, tipo||'arquivo', icone||null, descricao||null]
        )
        res.status(201).json({ id: r.insertId })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/atalhos/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { nome, categoria, caminho, tipo, icone, descricao } = req.body
        await db.query(
            'UPDATE atalhos SET nome=?, categoria=?, caminho=?, tipo=?, icone=?, descricao=? WHERE id=?',
            [nome, categoria||null, caminho, tipo||'arquivo', icone||null, descricao||null, req.params.id]
        )
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/atalhos/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await db.query('DELETE FROM atalhos WHERE id=?', [req.params.id])
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/atalhos/abrir', authMiddleware, (req, res) => {
    const { caminho, tipo } = req.body
    if (!caminho) return res.status(400).json({ error: 'Caminho obrigatório' })
    const { exec } = require('child_process')
    const cmd = tipo === 'pasta'
        ? `explorer "${caminho}"`
        : `start "" "${caminho}"`
    exec(cmd, (err) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ ok: true })
    })
})

// Verificação de imagens
router.get('/imagens/verificacao/:codigo', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const [rows] = await db.query('SELECT * FROM imagens_verificacao WHERE codigo=?', [req.params.codigo])
        res.json(rows[0] || { codigo: req.params.codigo, status: 'pendente', observacao: null })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/imagens/verificacao/:codigo', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { status, observacao } = req.body
        await db.query(
            'INSERT INTO imagens_verificacao (codigo, status, observacao) VALUES (?,?,?) ON DUPLICATE KEY UPDATE status=VALUES(status), observacao=VALUES(observacao)',
            [req.params.codigo, status, observacao||null]
        )
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

// Estoque de Placas
router.post('/estoque-placas', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await db.query(`CREATE TABLE IF NOT EXISTS estoque_placas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            preco DECIMAL(10,2) NOT NULL,
            INDEX idx_nome (nome),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`)
        const { nome, preco } = req.body
        if (!nome || preco == null) return res.status(400).json({ error: 'nome e preco são obrigatórios' })
        const [r] = await db.query('INSERT INTO estoque_placas (nome, preco) VALUES (?,?)', [nome.trim().toUpperCase(), preco])
        res.status(201).json({ id: r.insertId })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/estoque-placas', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await db.query(`CREATE TABLE IF NOT EXISTS estoque_placas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            preco DECIMAL(10,2) NOT NULL,
            INDEX idx_nome (nome),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`)
        const { q } = req.query
        if (!q) return res.json([])
        const termo = `%${q.trim().toUpperCase()}%`
        const [rows] = await db.query('SELECT DISTINCT nome FROM estoque_placas WHERE nome LIKE ? ORDER BY nome LIMIT 50', [termo])
        res.json(rows)
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/estoque-placas/historico', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { nome } = req.query
        if (!nome) return res.status(400).json({ error: 'nome é obrigatório' })
        const [rows] = await db.query('SELECT * FROM estoque_placas WHERE nome = ? ORDER BY created_at DESC', [nome.trim().toUpperCase()])
        res.json(rows)
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/estoque-placas/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await db.query('DELETE FROM estoque_placas WHERE id = ?', [req.params.id])
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Novidades ──────────────────────────────────────────────
router.post('/novidades/buscar-produto', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { ean } = req.body
        if (!ean) return res.status(400).json({ error: 'EAN obrigatório' })
        const [rows] = await db.query(
            'SELECT codigo, descricao, ean, preco_venda, quantidade_kg_l, descricao_kglt, preco_venda_kg FROM produtos WHERE ean = ? OR codigo = ? LIMIT 1',
            [ean, ean]
        )
        if (rows.length === 0) return res.json({ encontrado: false })
        res.json({ encontrado: true, produto: rows[0] })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/novidades', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await db.query(`CREATE TABLE IF NOT EXISTS novidades (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ean VARCHAR(20),
            descricao VARCHAR(255) NOT NULL,
            preco DECIMAL(10,2) NOT NULL,
            loja VARCHAR(20),
            quantidade_kg_l DECIMAL(10,4),
            descricao_kglt VARCHAR(10),
            preco_kg DECIMAL(10,2),
            status ENUM('novidades','ja_tem','para_chegar') NOT NULL DEFAULT 'novidades',
            created_by VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`)
        const { status } = req.query
        let sql = 'SELECT * FROM novidades WHERE 1=1'
        const params = []
        if (status) { sql += ' AND status = ?'; params.push(status) }
        sql += ' ORDER BY created_at DESC'
        const [rows] = await db.query(sql, params)
        res.json(rows)
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/novidades', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { ean, descricao, preco, loja, quantidade_kg_l, descricao_kglt, preco_kg, status } = req.body
        if (!descricao || preco == null) return res.status(400).json({ error: 'Descrição e preço obrigatórios' })
        const [r] = await db.query(
            'INSERT INTO novidades (ean, descricao, preco, loja, quantidade_kg_l, descricao_kglt, preco_kg, status, created_by) VALUES (?,?,?,?,?,?,?,?,?)',
            [ean||null, descricao, preco, loja||null, quantidade_kg_l||null, descricao_kglt||null, preco_kg||null, status||'novidades', req.user?.usuario||null]
        )
        res.status(201).json({ id: r.insertId })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/novidades/batch', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { itens } = req.body
        if (!itens || !itens.length) return res.status(400).json({ error: 'Lista de itens obrigatória' })
        const inseridos = []
        for (const item of itens) {
            const [r] = await db.query(
                'INSERT INTO novidades (ean, descricao, preco, loja, quantidade_kg_l, descricao_kglt, preco_kg, status, created_by) VALUES (?,?,?,?,?,?,?,?,?)',
                [item.ean||null, item.descricao, item.preco, item.loja||null, item.quantidade_kg_l||null, item.descricao_kglt||null, item.preco_kg||null, item.status||'novidades', req.user?.usuario||null]
            )
            inseridos.push(r.insertId)
        }
        res.status(201).json({ ids: inseridos, total: inseridos.length })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/novidades/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { descricao, preco, loja, quantidade_kg_l, descricao_kglt, preco_kg, status } = req.body
        await db.query(
            'UPDATE novidades SET descricao=?, preco=?, loja=?, quantidade_kg_l=?, descricao_kglt=?, preco_kg=?, status=? WHERE id=?',
            [descricao, preco, loja||null, quantidade_kg_l||null, descricao_kglt||null, preco_kg||null, status, req.params.id]
        )
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/novidades/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await db.query('DELETE FROM novidades WHERE id=?', [req.params.id])
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
