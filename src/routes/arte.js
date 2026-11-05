const router = require('express').Router()
const path = require('path')
const fs = require('fs')
const authMiddleware = require('../middlewares/authMiddleware')

// Pasta padrão onde estão as imagens de arte (ajustável via variável de ambiente)
const ARTE_IMAGES_DIR = process.env.ARTE_IMAGES_DIR || path.join(__dirname, '..', '..', 'imagens-arte')

// Garante que a pasta exista (não cria automaticamente para não gerar lixo no deploy)
function listarImagensSeguro(dir) {
    try {
        if (!fs.existsSync(dir)) return []
        return fs.readdirSync(dir)
            .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
            .map(f => ({
                nome: f,
                caminho: path.join(dir, f).replace(/\\/g, '/')
            }))
            .sort((a, b) => a.nome.localeCompare(b.nome))
    } catch (e) {
        return []
    }
}

/**
 * GET /arte/imagens?pasta=caminho
 * Lista imagens disponíveis em uma pasta do PC/servidor.
 */
router.get('/imagens', authMiddleware, (req, res) => {
    const pasta = req.query.pasta || ARTE_IMAGES_DIR
    // Segurança: impede navegação acima da raiz desejada (simples)
    const alvo = path.resolve(pasta)
    const imagens = listarImagensSeguro(alvo)
    res.json({ pasta: alvo, imagens })
})

/**
 * POST /arte/salvar-modelo
 * Salva um modelo de arte (template) para reutilizar semana que vem.
 * Corpo: { nome, configuracao, celulas[], data }
 */
router.post('/salvar-modelo', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const { nome, configuracao, celulas, data } = req.body
        if (!nome || !celulas) {
            return res.status(400).json({ error: 'Nome e células são obrigatórios' })
        }
        await db.query(
            `INSERT INTO arte_modelos (nome, configuracao, celulas, criado_em, atualizado_em)
             VALUES (?, ?, ?, NOW(), NOW())
             ON DUPLICATE KEY UPDATE configuracao=VALUES(configuracao), celulas=VALUES(celulas), atualizado_em=NOW()`,
            [nome, JSON.stringify(configuracao || {}), JSON.stringify(celulas)]
        )
        res.json({ ok: true, mensagem: 'Modelo salvo com sucesso' })
    } catch (e) {
        // Tabela pode não existir ainda; tenta criar
        try {
            const db = require('../config/database')
            await db.query(`
                CREATE TABLE IF NOT EXISTS arte_modelos (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nome VARCHAR(150) NOT NULL UNIQUE,
                    configuracao JSON,
                    celulas JSON,
                    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            `)
            const { nome, configuracao, celulas } = req.body
            await db.query(
                `INSERT INTO arte_modelos (nome, configuracao, celulas) VALUES (?, ?, ?)`,
                [nome, JSON.stringify(configuracao || {}), JSON.stringify(celulas)]
            )
            res.json({ ok: true, mensagem: 'Modelo salvo (tabela criada)' })
        } catch (e2) {
            res.status(500).json({ error: e2.message })
        }
    }
})

/**
 * GET /arte/modelos
 * Lista modelos salvos.
 */
router.get('/modelos', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const [rows] = await db.query(
            `SELECT id, nome, configuracao, celulas, criado_em, atualizado_em FROM arte_modelos ORDER BY atualizado_em DESC`
        )
        rows.forEach(r => {
            try { r.configuracao = JSON.parse(r.configuracao || '{}') } catch {}
            try { r.celulas = JSON.parse(r.celulas || '[]') } catch {}
        })
        res.json(rows)
    } catch (e) {
        res.json([])
    }
})

/**
 * DELETE /arte/modelos/:id
 */
router.delete('/modelos/:id', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        await db.query('DELETE FROM arte_modelos WHERE id = ?', [req.params.id])
        res.json({ ok: true })
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

module.exports = router
