// @ts-check
/**
 * API de auditoria — trail de eventos e controle de quem fez as placas.
 */
const router = require('express').Router()
const authMiddleware = require('../middlewares/authMiddleware')
const auditService = require('../services/auditService')

/** Só gerente/administrador acessa a auditoria completa. */
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function somenteGestao(req, res, next) {
    const cargo = req.user?.cargo || 'atendente'
    if (cargo !== 'administrador' && cargo !== 'gerente') {
        return res.status(403).json({ error: 'Acesso restrito a gerentes e administradores' })
    }
    next()
}

/** Lista de eventos com filtros e paginação */
router.get('/auditoria', authMiddleware, somenteGestao, async (req, res) => {
    try {
        const { de, ate, usuario, acao, busca, limite, offset } = req.query
        const resultado = await auditService.buscarLogs({
            de: de ? String(de) : undefined,
            ate: ate ? String(ate) : undefined,
            usuario: usuario ? String(usuario) : undefined,
            acao: acao ? String(acao) : undefined,
            busca: busca ? String(busca) : undefined,
            limite: limite ? Number(limite) : 100,
            offset: offset ? Number(offset) : 0
        })

        res.json({
            ...resultado,
            rotulos: auditService.ROTULOS,
            acoes: Object.values(auditService.ACOES)
        })
    } catch (err) {
        res.status(500).json({ error: /** @type {Error} */ (err).message })
    }
})

/** Resumo agregado: por usuário, por ação, por dia e placas por usuário */
router.get('/auditoria/resumo', authMiddleware, somenteGestao, async (req, res) => {
    try {
        const { de, ate } = req.query
        const dados = await auditService.resumo({
            de: de ? String(de) : undefined,
            ate: ate ? String(ate) : undefined
        })
        res.json(dados)
    } catch (err) {
        res.status(500).json({ error: /** @type {Error} */ (err).message })
    }
})

/** Exporta os eventos em CSV (Excel abre direto) */
router.get('/auditoria/exportar', authMiddleware, somenteGestao, async (req, res) => {
    try {
        const { de, ate, usuario, acao } = req.query
        const { rows } = await auditService.buscarLogs({
            de: de ? String(de) : undefined,
            ate: ate ? String(ate) : undefined,
            usuario: usuario ? String(usuario) : undefined,
            acao: acao ? String(acao) : undefined,
            limite: 100000
        })

        const esc = (/** @type {any} */ v) => {
            const s = v === null || v === undefined ? '' : String(v)
            return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
        }

        const header = ['Data/Hora', 'Usuário', 'Nome', 'Cargo', 'Ação', 'Descrição', 'Tipo de placa', 'Quantidade', 'IP']

        const linhas = rows.map((/** @type {any} */ r) => [
            r.criado_em,
            r.usuario,
            r.nome,
            r.cargo,
            (/** @type {Record<string,string>} */ (auditService.ROTULOS))[r.acao] || r.acao,
            r.descricao,
            r.tipo_placa,
            r.quantidade,
            r.ip
        ].map(esc).join(';'))

        const csv = '\uFEFF' + [header.map(esc).join(';'), ...linhas].join('\r\n')

        res.setHeader('Content-Type', 'text/csv; charset=utf-8')
        res.setHeader('Content-Disposition', `attachment; filename="auditoria-${new Date().toISOString().slice(0, 10)}.csv"`)
        res.send(csv)
    } catch (err) {
        res.status(500).json({ error: /** @type {Error} */ (err).message })
    }
})

/** Placas criadas por usuário (atribuição direta em log_placas) */
router.get('/auditoria/placas-por-usuario', authMiddleware, somenteGestao, async (req, res) => {
    try {
        const db = require('../config/database')
        const { de, ate, usuario } = req.query

        const where = ['usuario IS NOT NULL']
        const params = []

        if (de)      { where.push('DATE(criado_em) >= ?'); params.push(String(de)) }
        if (ate)     { where.push('DATE(criado_em) <= ?'); params.push(String(ate)) }
        if (usuario) { where.push('usuario = ?');       params.push(String(usuario)) }

        const [rows] = /** @type {any} */ (await db.query(`
            SELECT usuario, usuario_nome, tipo_placa,
                   COUNT(*)          AS total,
                   SUM(impressa = 1) AS impressas,
                   DATE(criado_em)   AS dia
            FROM log_placas
            WHERE ${where.join(' AND ')}
            GROUP BY usuario, usuario_nome, tipo_placa, dia
            ORDER BY dia DESC, total DESC
            LIMIT 500
        `, params))

        res.json(rows)
    } catch (err) {
        res.status(500).json({ error: /** @type {Error} */ (err).message })
    }
})

/** Log de login/saída (visão rápida de quem entrou) */
router.get('/auditoria/acessos', authMiddleware, somenteGestao, async (req, res) => {
    try {
        const db = require('../config/database')
        const { limite } = req.query
        const [rows] = /** @type {any} */ (await db.query(`
            SELECT usuario, nome, cargo, acao, descricao, ip, criado_em
            FROM audit_logs
            WHERE acao IN ('login','login_falha','logout')
            ORDER BY criado_em DESC
            LIMIT ?
        `, [Math.min(Number(limite) || 100, 500)]))
        res.json(rows)
    } catch (err) {
        res.status(500).json({ error: /** @type {Error} */ (err).message })
    }
})

module.exports = router
