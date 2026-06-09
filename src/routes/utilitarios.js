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

// ════════════════════════════════════════════════════════════
// ESTOQUE DE PLACAS — quantity-based model with movement log
// ════════════════════════════════════════════════════════════

// ── helpers ──────────────────────────────────────────────
async function epGarantirTabelas(db) {
    await db.query(`CREATE TABLE IF NOT EXISTS estoque_placas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        quantidade INT NOT NULL DEFAULT 1,
        localizacao VARCHAR(20) DEFAULT 'armario',
        INDEX idx_nome (nome),
        INDEX idx_nome_preco (nome, preco),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`)
    try { await db.query('ALTER TABLE estoque_placas ADD COLUMN localizacao VARCHAR(20) DEFAULT \'armario\'') } catch (_) {}
    try { await db.query('ALTER TABLE estoque_placas ADD COLUMN quantidade INT NOT NULL DEFAULT 1') } catch (_) {}
    try { await db.query('ALTER TABLE estoque_placas ADD INDEX idx_nome_preco (nome, preco)') } catch (_) {}

    await db.query(`CREATE TABLE IF NOT EXISTS movimentos_estoque_placas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        placa_id INT,
        nome VARCHAR(255) NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        tipo VARCHAR(20) NOT NULL,
        quantidade INT NOT NULL,
        localizacao_origem VARCHAR(20),
        localizacao_destino VARCHAR(20),
        observacao VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`)
}

async function epRegistrarMovimento(db, { placa_id, nome, preco, tipo, quantidade, localizacao_origem, localizacao_destino, observacao }) {
    await db.query(
        'INSERT INTO movimentos_estoque_placas (placa_id, nome, preco, tipo, quantidade, localizacao_origem, localizacao_destino, observacao) VALUES (?,?,?,?,?,?,?,?)',
        [placa_id, nome, preco, tipo, quantidade, localizacao_origem||null, localizacao_destino||null, observacao||null]
    )
}

async function epMigrarRegistros(db) {
    // Migration: merge duplicate (nome, preco, localizacao) rows into single quantity-based rows
    try {
        // Check if any record has quantidade=1 (legacy) and multiple rows per group exist
        const [check] = await db.query('SELECT COUNT(*) as c FROM (SELECT COUNT(*) as cnt FROM estoque_placas GROUP BY nome, preco, localizacao HAVING cnt > 1) sub')
        if (check[0].c === 0) return // no duplicates, migration already done

        // Step 1: Set quantidade = count for the MIN(id) of each group
        await db.query(`
            UPDATE estoque_placas e
            INNER JOIN (
                SELECT nome, preco, localizacao, COUNT(*) as cnt, MIN(id) as keep_id
                FROM estoque_placas
                GROUP BY nome, preco, localizacao
            ) sub ON e.id = sub.keep_id
            SET e.quantidade = sub.cnt
        `)
        // Step 2: Delete duplicate rows (those not kept)
        await db.query(`
            DELETE e FROM estoque_placas e
            LEFT JOIN (
                SELECT MIN(id) as keep_id
                FROM estoque_placas
                GROUP BY nome, preco, localizacao
            ) sub ON e.id = sub.keep_id
            WHERE sub.keep_id IS NULL
        `)
        console.log('[estoque-placas] Migração concluída: registros duplicados mesclados')
    } catch (err) { console.error('[estoque-placas] Erro na migração:', err.message) }
}

// ── POST — add/remove stock ──────────────────────────────
router.post('/estoque-placas', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await epGarantirTabelas(db)
        await epMigrarRegistros(db)

        const { nome, preco, quantidade, localizacao, tipo, observacao } = req.body
        if (!nome || preco == null) return res.status(400).json({ error: 'nome e preco são obrigatórios' })
        const qtd = parseInt(quantidade) || 1
        const loc = localizacao || 'armario'
        const nomeUp = nome.trim().toUpperCase()
        const tipoOp = tipo || 'entrada'

        if (tipoOp === 'saida') {
            // Remove from stock
            const [existing] = await db.query('SELECT id, quantidade FROM estoque_placas WHERE nome = ? AND preco = ? AND localizacao = ?', [nomeUp, preco, loc])
            if (!existing.length) return res.status(400).json({ error: 'Item não encontrado no estoque para esta localização.' })
            const atual = existing[0]
            if (atual.quantidade < qtd) return res.status(400).json({ error: `Quantidade insuficiente. Disponível: ${atual.quantidade}` })
            const novaQtd = atual.quantidade - qtd
            if (novaQtd <= 0) {
                await db.query('DELETE FROM estoque_placas WHERE id = ?', [atual.id])
            } else {
                await db.query('UPDATE estoque_placas SET quantidade = ? WHERE id = ?', [novaQtd, atual.id])
            }
            await epRegistrarMovimento(db, { placa_id: atual.id, nome: nomeUp, preco, tipo: 'saida', quantidade: qtd, localizacao_origem: loc, observacao })
            return res.json({ ok: true, id: atual.id, quantidade: Math.max(0, novaQtd), tipo: 'saida' })
        }

        // entrada (default): add to stock — merge with existing if same (nome, preco, localizacao)
        const [existing] = await db.query('SELECT id, quantidade FROM estoque_placas WHERE nome = ? AND preco = ? AND localizacao = ?', [nomeUp, preco, loc])
        if (existing.length) {
            const novaQtd = existing[0].quantidade + qtd
            await db.query('UPDATE estoque_placas SET quantidade = ? WHERE id = ?', [novaQtd, existing[0].id])
            await epRegistrarMovimento(db, { placa_id: existing[0].id, nome: nomeUp, preco, tipo: 'entrada', quantidade: qtd, localizacao_destino: loc, observacao })
            return res.json({ ok: true, id: existing[0].id, quantidade: novaQtd, tipo: 'entrada' })
        } else {
            const [r] = await db.query('INSERT INTO estoque_placas (nome, preco, quantidade, localizacao) VALUES (?,?,?,?)', [nomeUp, preco, qtd, loc])
            await epRegistrarMovimento(db, { placa_id: r.insertId, nome: nomeUp, preco, tipo: 'entrada', quantidade: qtd, localizacao_destino: loc, observacao })
            return res.status(201).json({ ok: true, id: r.insertId, quantidade: qtd, tipo: 'entrada' })
        }
    } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── GET /estoque-placas — search names ──────────────────
router.get('/estoque-placas', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await epGarantirTabelas(db)
        await epMigrarRegistros(db)
        const { q } = req.query
        if (!q) return res.json([])
        const termo = `%${q.trim().toUpperCase()}%`
        const [rows] = await db.query('SELECT DISTINCT nome FROM estoque_placas WHERE nome LIKE ? ORDER BY nome LIMIT 30', [termo])
        res.json(rows.map(r => r.nome))
    } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── GET /estoque-placas/todos — full list ───────────────
router.get('/estoque-placas/todos', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await epGarantirTabelas(db)
        await epMigrarRegistros(db)
        const [rows] = await db.query('SELECT * FROM estoque_placas ORDER BY nome ASC')
        res.json(rows)
    } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── PATCH /estoque-placas/:id — update qty / transfer ───
router.patch('/estoque-placas/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { quantidade, localizacao, tipo, observacao } = req.body
        const [rows] = await db.query('SELECT * FROM estoque_placas WHERE id = ?', [req.params.id])
        if (!rows.length) return res.status(404).json({ error: 'Item não encontrado' })

        const item = rows[0]

        if (quantidade != null && tipo) {
            // Adjust quantity (entrada or saida)
            const qtd = parseInt(quantidade)
            if (tipo === 'saida') {
                if (item.quantidade < qtd) return res.status(400).json({ error: `Quantidade insuficiente. Disponível: ${item.quantidade}` })
                const nova = item.quantidade - qtd
                if (nova <= 0) {
                    await db.query('DELETE FROM estoque_placas WHERE id = ?', [item.id])
                } else {
                    await db.query('UPDATE estoque_placas SET quantidade = ? WHERE id = ?', [nova, item.id])
                }
                await epRegistrarMovimento(db, { placa_id: item.id, nome: item.nome, preco: item.preco, tipo: 'saida', quantidade: qtd, localizacao_origem: item.localizacao, observacao })
                return res.json({ ok: true, tipo: 'saida', quantidade: Math.max(0, item.quantidade - qtd) })
            } else {
                // entrada
                const nova = item.quantidade + qtd
                await db.query('UPDATE estoque_placas SET quantidade = ? WHERE id = ?', [nova, item.id])
                await epRegistrarMovimento(db, { placa_id: item.id, nome: item.nome, preco: item.preco, tipo: 'entrada', quantidade: qtd, localizacao_destino: item.localizacao, observacao })
                return res.json({ ok: true, tipo: 'entrada', quantidade: nova })
            }
        }

        if (localizacao && localizacao !== item.localizacao) {
            // Transfer: create record in new location, reduce qty in old location
            const qtdTransf = parseInt(quantidade) || item.quantidade
            if (item.quantidade < qtdTransf) return res.status(400).json({ error: `Quantidade insuficiente para transferir. Disponível: ${item.quantidade}` })

            const novaOrigem = item.quantidade - qtdTransf
            if (novaOrigem <= 0) {
                await db.query('DELETE FROM estoque_placas WHERE id = ?', [item.id])
            } else {
                await db.query('UPDATE estoque_placas SET quantidade = ? WHERE id = ?', [novaOrigem, item.id])
            }

            // Check if destination already has this product
            const [dest] = await db.query('SELECT id, quantidade FROM estoque_placas WHERE nome = ? AND preco = ? AND localizacao = ?', [item.nome, item.preco, localizacao])
            if (dest.length) {
                await db.query('UPDATE estoque_placas SET quantidade = quantidade + ? WHERE id = ?', [qtdTransf, dest[0].id])
                await epRegistrarMovimento(db, { placa_id: dest[0].id, nome: item.nome, preco: item.preco, tipo: 'transferencia', quantidade: qtdTransf, localizacao_origem: item.localizacao, localizacao_destino: localizacao, observacao })
                return res.json({ ok: true, tipo: 'transferencia', destino_id: dest[0].id })
            } else {
                const [r] = await db.query('INSERT INTO estoque_placas (nome, preco, quantidade, localizacao) VALUES (?,?,?,?)', [item.nome, item.preco, qtdTransf, localizacao])
                await epRegistrarMovimento(db, { placa_id: r.insertId, nome: item.nome, preco: item.preco, tipo: 'transferencia', quantidade: qtdTransf, localizacao_origem: item.localizacao, localizacao_destino: localizacao, observacao })
                return res.json({ ok: true, tipo: 'transferencia', destino_id: r.insertId })
            }
        }

        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── DELETE /estoque-placas/:id ───────────────────────────
router.delete('/estoque-placas/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const [rows] = await db.query('SELECT * FROM estoque_placas WHERE id = ?', [req.params.id])
        if (rows.length) {
            const item = rows[0]
            await epRegistrarMovimento(db, { placa_id: item.id, nome: item.nome, preco: item.preco, tipo: 'saida', quantidade: item.quantidade, localizacao_origem: item.localizacao, observacao: 'Exclusão manual' })
            await db.query('DELETE FROM estoque_placas WHERE id = ?', [item.id])
        }
        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── GET /estoque-placas/movimentos — history ─────────────
router.get('/estoque-placas/movimentos', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await epGarantirTabelas(db)
        const { data_inicio, data_fim, localizacao, nome, limit: qlimit } = req.query
        let sql = 'SELECT * FROM movimentos_estoque_placas WHERE 1=1'
        const params = []
        if (data_inicio) { sql += ' AND DATE(created_at) >= ?'; params.push(data_inicio) }
        if (data_fim) { sql += ' AND DATE(created_at) <= ?'; params.push(data_fim) }
        if (localizacao) { sql += ' AND (localizacao_origem = ? OR localizacao_destino = ?)'; params.push(localizacao, localizacao) }
        if (nome) { sql += ' AND nome LIKE ?'; params.push(`%${nome.trim().toUpperCase()}%`) }
        sql += ' ORDER BY created_at DESC'
        if (qlimit) sql += ' LIMIT ' + parseInt(qlimit)
        const [rows] = await db.query(sql, params)
        res.json(rows)
    } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── GET /estoque-placas/historico — legacy, returns grouped history ──
router.get('/estoque-placas/historico', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { nome } = req.query
        if (!nome) return res.status(400).json({ error: 'nome é obrigatório' })
        const [movimentos] = await db.query('SELECT * FROM movimentos_estoque_placas WHERE nome = ? ORDER BY created_at DESC LIMIT 100', [nome.trim().toUpperCase()])
        const [estoque] = await db.query('SELECT * FROM estoque_placas WHERE nome = ? ORDER BY localizacao', [nome.trim().toUpperCase()])
        res.json({ movimentos, estoque })
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
            status ENUM('novidades','ja_tem','para_chegar','nao_fazer') NOT NULL DEFAULT 'novidades',
            created_by VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`)
        await db.query(`ALTER TABLE novidades MODIFY COLUMN status ENUM('novidades','ja_tem','para_chegar','nao_fazer') NOT NULL DEFAULT 'novidades'`).catch(() => {})
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

router.get('/novidades/sem-preco', authMiddleware, async (req, res) => {
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
            status ENUM('novidades','ja_tem','para_chegar','nao_fazer') NOT NULL DEFAULT 'novidades',
            created_by VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`)
        await db.query(`ALTER TABLE novidades MODIFY COLUMN status ENUM('novidades','ja_tem','para_chegar','nao_fazer') NOT NULL DEFAULT 'novidades'`).catch(() => {})
        const { busca, pendentes } = req.query
        let sql = `
            SELECT p.codigo, p.descricao, p.ean, p.descricao_departamento,
                   p.preco_venda, p.data_cadastro, p.quantidade_kg_l, p.marca,
                   p.estoque_atual, p.qtde_vendida_mes, p.data_ultima_entrada,
                   n.id AS novidade_id, n.status AS novidade_status
            FROM produtos p
            LEFT JOIN novidades n ON (n.ean = p.ean OR n.ean = p.codigo) AND n.ean IS NOT NULL AND n.ean != ''
            WHERE p.data_cadastro IS NOT NULL
              AND p.data_cadastro >= '2026-01-01'`
        const params = []
        if (pendentes === 'true') {
            sql += ` AND n.id IS NULL`
        }
        if (busca) {
            sql += ` AND (p.codigo LIKE ? OR p.descricao LIKE ? OR p.ean LIKE ?)`
            const like = `%${busca}%`
            params.push(like, like, like)
        }
        sql += ` ORDER BY p.data_cadastro DESC`
        const [rows] = await db.query(sql, params)
        res.json(rows)
    } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
