const router = require('express').Router()
const authMiddleware = require('../middlewares/authMiddleware')
const auditService = require('../services/auditService')

// Ensure config and marca columns exist
;(async () => {
    try {
        const db = require('../config/database')
        await db.query(`ALTER TABLE registros_placas ADD COLUMN config TEXT NULL AFTER descricao_kglt`)
    } catch {}
    try {
        const db = require('../config/database')
        await db.query(`ALTER TABLE registros_placas ADD COLUMN marca VARCHAR(100) NULL AFTER config`)
    } catch {}
})()

router.post('/log-placas', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const registros = req.body
        if (!Array.isArray(registros) || !registros.length)
            return res.status(400).json({ error: 'Envie um array de placas' })

        const u = req.user || {}
        const valores = registros.map(p => [
            p.descricao || '',
            p.codigo    || null,
            p.ean       || null,
            p.preco     || null,
            p.tipo_placa || 'grande4',
            u.usuario   || null,
            u.id        || null,
            u.nome      || null
        ])

        const [result] = await db.query(
            `INSERT INTO log_placas (descricao, codigo, ean, preco, tipo_placa, usuario, usuario_id, usuario_nome) VALUES ?`,
            [valores]
        )
        const firstId = result.insertId
        const ids = Array.from({ length: valores.length }, (_, i) => firstId + i)

        // Auditoria: quem criou as placas
        const tipos = [...new Set(registros.map(p => p.tipo_placa || 'grande4'))]
        await auditService.registrar(req, auditService.ACOES.CRIAR_PLACAS, {
            descricao: `criou ${valores.length} placa(s)`,
            entidade: 'log_placas',
            tipoPlaca: tipos.join(', ').slice(0, 20),
            quantidade: valores.length,
            detalhes: { tipos, ids: ids.slice(0, 50) }
        })

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
            return res.json({ ok: true, atualizados: 0 })
        await db.query(
            'UPDATE log_placas SET impressa = 1, impressa_em = NOW() WHERE id IN (?)',
            [ids]
        )

        await auditService.registrar(req, auditService.ACOES.IMPRIMIR_PLACAS, {
            descricao: `marcou ${ids.length} placa(s) como impressa(s)`,
            entidade: 'log_placas',
            quantidade: ids.length
        })

        res.json({ ok: true, atualizados: ids.length })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/log-placas', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { de, ate, descricao, usuario, tipo } = req.query

        let query = `SELECT * FROM log_placas WHERE 1=1`
        const params = []

        if (de)        { query += ` AND DATE(criado_em) >= ?`; params.push(de) }
        if (ate)       { query += ` AND DATE(criado_em) <= ?`; params.push(ate) }
        if (descricao) { query += ` AND descricao LIKE ?`;     params.push(`%${descricao}%`) }
        if (usuario)   { query += ` AND usuario = ?`;           params.push(usuario) }
        if (tipo)      { query += ` AND tipo_placa = ?`;        params.push(tipo) }

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
    const db = require('../config/database')
    const { tipo, placas } = req.body
    const usuario = req.user.usuario
    if (!Array.isArray(placas)) return res.status(400).json({ error: 'Envie um array de placas' })

    // Corte nos limites das colunas para o INSERT nunca falhar por excesso:
    // uma unica linha fora do limite derrubava o salvamento inteiro e, como o
    // DELETE rodava antes do INSERT, limpava todas as placas salvas.
    const txt = (v, n) => {
        const s = String(v ?? '')
        return s.length > n ? s.slice(0, n) : s
    }
    const num = (v) => {
        const x = Number(v)
        return Number.isFinite(x) ? x : 0
    }
    const tipoLimpo = String(tipo).slice(0, 20)

    let conn
    try {
        conn = await db.getConnection()
        await conn.beginTransaction()

        await conn.query('DELETE FROM registros_placas WHERE usuario = ? AND tipo_placa = ?', [usuario, tipoLimpo])

        let logIds = []
        if (placas.length) {
            const valores = placas.map((p, i) => [
                usuario,
                txt(p.descricao, 255),
                txt(p.codigo, 50) || null,
                txt(p.ean, 50) || null,
                num(p.preco),
                txt(p.preco_info, 50) || null,
                num(p.quantidade_kg_l),
                txt(p.descricao_kglt, 50) || null,
                txt(p.config, 100000) || null,
                txt(p.marca, 100) || null,
                i,
                tipoLimpo
            ])

            await conn.query(
                `INSERT INTO registros_placas (usuario, descricao, codigo, ean, preco, preco_info, quantidade_kg_l, descricao_kglt, config, marca, ordem, tipo_placa) VALUES ?`,
                [valores]
            )

            // Auto-log all plaques to log_placas for print tracking
            const logValores = placas.map(p => [
                txt(p.descricao, 255),
                txt(p.codigo, 50) || null,
                txt(p.ean, 13) || null,
                num(p.preco),
                tipoLimpo,
                usuario,
                req.user?.id || null,
                req.user?.nome || null
            ])
            const [logResult] = await conn.query(
                `INSERT INTO log_placas (descricao, codigo, ean, preco, tipo_placa, usuario, usuario_id, usuario_nome) VALUES ?`,
                [logValores]
            )
            const firstLogId = logResult.insertId
            logIds = Array.from({ length: logValores.length }, (_, i) => firstLogId + i)
        }

        await conn.commit()

        // Auditoria: placas salvas por este usuário
        await auditService.registrar(req, auditService.ACOES.SALVAR_PLACAS, {
            descricao: `salvou ${placas.length} placa(s) do tipo ${tipoLimpo}`,
            entidade: 'registros_placas',
            tipoPlaca: tipoLimpo,
            quantidade: placas.length
        })

        res.json({ ok: true, total: placas.length, logIds })
    } catch (err) {
        if (conn) { try { await conn.rollback() } catch {} }
        console.error('Erro ao salvar placas:', err)
        res.status(500).json({ error: err.message })
    } finally {
        if (conn) conn.release()
    }
})

router.delete('/registros-placas/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await db.query('DELETE FROM registros_placas WHERE id = ? AND usuario = ?', [req.params.id, req.user.usuario])
        await auditService.registrar(req, auditService.ACOES.EXCLUIR_PLACA, {
            descricao: `excluiu uma placa`,
            entidade: 'registros_placas',
            detalhes: { id: req.params.id }
        })
        res.json({ ok: true })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.delete('/registros-placas/limpar/:tipo', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const tipo = String(req.params.tipo).slice(0, 20)
        const [r] = await db.query('DELETE FROM registros_placas WHERE usuario = ? AND tipo_placa = ?', [req.user.usuario, tipo])
        await auditService.registrar(req, auditService.ACOES.LIMPAR_PLACAS, {
            descricao: `limpou ${r.affectedRows} placa(s) do tipo ${tipo}`,
            entidade: 'registros_placas',
            tipoPlaca: tipo,
            quantidade: r.affectedRows
        })
        res.json({ ok: true, removidos: r.affectedRows })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
