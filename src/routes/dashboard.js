const router = require('express').Router()
const authMiddleware = require('../middlewares/authMiddleware')

router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')

        const [porDepto] = await db.query(`
            SELECT
                COALESCE(descricao_departamento, CONCAT('Depto ', departamento), 'Sem Departamento') AS depto,
                COUNT(*) AS total
            FROM produtos
            GROUP BY depto
            ORDER BY total DESC
            LIMIT 15
        `)

        const [[{ totalProdutos }]] = await db.query('SELECT COUNT(*) AS totalProdutos FROM produtos')
        const [[{ semEan }]] = await db.query("SELECT COUNT(*) AS semEan FROM produtos WHERE ean IS NULL OR ean = ''")
        const [[{ semImagem }]] = await db.query(`
            SELECT COUNT(*) AS semImagem FROM produtos p
            LEFT JOIN imagens_verificacao iv ON iv.codigo = p.codigo
            WHERE iv.status = 'sem_imagem' OR iv.status IS NULL
        `)

        const [[placasMes]] = await db.query(`
            SELECT
                SUM(tipo_placa = 'branca')  AS branca,
                SUM(tipo_placa = 'amarela') AS amarela,
                SUM(tipo_placa = 'grande')  AS grande,
                COUNT(*)                    AS total
            FROM registros_placas
            WHERE MONTH(criado_em) = MONTH(CURDATE())
              AND YEAR(criado_em)  = YEAR(CURDATE())
        `)

        const [[impressasMes]] = await db.query(`
            SELECT
                SUM(sub.impressa_max = 1) AS impressas,
                SUM(sub.impressa_max = 0) AS geradas
            FROM (
                SELECT MAX(l.impressa) AS impressa_max
                FROM log_placas l
                WHERE MONTH(l.criado_em) = MONTH(CURDATE())
                  AND YEAR(l.criado_em)  = YEAR(CURDATE())
                GROUP BY COALESCE(l.codigo, CONCAT(l.descricao, l.ean, l.preco, l.tipo_placa))
            ) sub
        `)

        const [placasDias] = await db.query(`
            SELECT
                DATE(criado_em) AS dia,
                COUNT(*)        AS total
            FROM registros_placas
            WHERE criado_em >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY dia
            ORDER BY dia ASC
        `)

        const [topProdutos] = await db.query(`
            SELECT descricao, tipo_placa, COUNT(*) AS total
            FROM registros_placas
            WHERE MONTH(criado_em) = MONTH(CURDATE())
              AND YEAR(criado_em)  = YEAR(CURDATE())
            GROUP BY descricao, tipo_placa
            ORDER BY total DESC
            LIMIT 10
        `)

        const [[{ listasMes }]] = await db.query(`
            SELECT COUNT(*) AS listasMes FROM listas_precos
            WHERE MONTH(criado_em) = MONTH(CURDATE())
              AND YEAR(criado_em)  = YEAR(CURDATE())
        `)

        res.json({
            totalProdutos,
            semEan,
            semImagem,
            porDepto,
            placasMes,
            impressasMes,
            placasDias,
            topProdutos,
            listasMes
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.delete('/dashboard/zerar', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await db.query('DELETE FROM registros_placas')
        await db.query('DELETE FROM log_placas')
        await db.query('DELETE FROM listas_precos')
        res.json({ ok: true, message: 'Dashboard zerado' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
