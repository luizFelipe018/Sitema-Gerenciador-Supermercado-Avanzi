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

router.get('/saude', authMiddleware, somenteAdmin, async (req, res) => {
    try {
        const path = require('path')
        const fsp = require('fs/promises')
        const fs = require('fs')
        const os = require('os')
        const db = require('../config/database')

        const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'))

        // Conexão do banco
        let bancoOk = true
        let dbErr = null
        try { await db.query('SELECT 1') } catch (err) { bancoOk = false; dbErr = err.message }

        // Estatística de produtos
        let produtosTotal = null
        if (bancoOk) {
            try { const [[r]] = await db.query('SELECT COUNT(*) AS n FROM produtos'); produtosTotal = r.n } catch {}
        }

        // Pasta de imagens — rápido: alguns arquivos de topo, sem recursão pesada
        let pastaInfo = { caminho: '—', existe: false, arquivos: 0, bytesTotal: 0, limitado: false }
        try {
            const [rows] = await db.query("SELECT valor FROM configuracoes WHERE chave = 'pasta_imagens'")
            const caminho = (rows[0] && rows[0].valor) ? rows[0].valor : (process.env.PASTA_IMAGENS || 'E:\\Banco de Imagens\\')
            if (caminho) {
                pastaInfo.caminho = caminho
                try {
                    const st = await fsp.stat(caminho)
                    pastaInfo.existe = st.isDirectory()
                    if (pastaInfo.existe) {
                        const exts = new Set(['.png', '.jpg', '.jpeg', '.webp'])
                        let total = 0, bytes = 0, limitou = false
                        async function walk(dir, depth) {
                            if (depth > 2 || total >= 10000) { limitou = true; return }
                            let es
                            try { es = await fsp.readdir(dir, { withFileTypes: true }) } catch { return }
                            for (const e of es) {
                                if (e.isFile() && exts.has(path.extname(e.name).toLowerCase())) {
                                    try { const s = await fsp.stat(path.join(dir, e.name)); bytes += s.size; total++ } catch {}
                                } else if (e.isDirectory()) {
                                    await walk(path.join(dir, e.name), depth + 1)
                                }
                            }
                        }
                        await walk(caminho, 0)
                        pastaInfo.arquivos = total
                        pastaInfo.bytesTotal = bytes
                        pastaInfo.limitado = limitou
                    }
                } catch { pastaInfo.existe = false }
            }
        } catch {}

        // Últimos logs do sistema
        let logs = []
        if (bancoOk) {
            try {
                const [rows] = await db.query('SELECT acao, descricao, usuario, criado_em FROM audit_logs ORDER BY criado_em DESC LIMIT 6')
                logs = rows.map(r => ({ acao: r.acao, descricao: r.descricao, usuario: r.usuario, quando: r.criado_em }))
            } catch {}
        }

        res.json({
            versao: pkg.version,
            node: process.version,
            uptimeSeg: Math.floor(process.uptime()),
            plataforma: os.platform() + ' (' + os.release() + ')',
            cpuNucleos: os.cpus().length,
            memoriaLivreMB: Math.round(os.freemem() / 1048576),
            memoriaTotalMB: Math.round(os.totalmem() / 1048576),
            banco: { conectado: bancoOk, erro: dbErr },
            produtos: produtosTotal,
            pastaImagens: pastaInfo,
            logs
        })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/backup', authMiddleware, somenteAdmin, async (req, res) => {
    try {
        const path = require('path')
        const destinoDir = path.join(__dirname, '..', '..', 'data', 'backups')
        const r = await require('../services/backup').fazerBackup(destinoDir)
        res.json({ ok: true, arquivo: path.basename(r.arquivo), caminho: r.arquivo, tamanho: r.tamanho, tabelas: r.tabelas, linhas: r.linhas })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/alertas', authMiddleware, somenteAdmin, async (req, res) => {
    const alertas = []
    try {
        const db = require('../config/database')
        // Pasta de imagens configurada? Existe?
        try {
            const [rows] = await db.query("SELECT valor FROM configuracoes WHERE chave = 'pasta_imagens'")
            const caminho = (rows[0] && rows[0].valor) ? rows[0].valor : (process.env.PASTA_IMAGENS || 'E:\\Banco de Imagens\\')
            if (caminho) {
                if (!require('fs').existsSync(caminho)) {
                    alertas.push({ tipo: 'erro', titulo: 'Pasta de imagens não encontrada', detalhe: caminho })
                }
            } else {
                alertas.push({ tipo: 'aviso', titulo: 'Pasta de imagens não configurada', detalhe: 'Configure em Admin → Configurações' })
            }
        } catch {}
        // Último backup?
        const path = require('path')
        const fs = require('fs')
        const backups = path.join(__dirname, '..', '..', 'data', 'backups')
        try {
            if (!fs.existsSync(backups)) fs.mkdirSync(backups, { recursive: true })
            const files = fs.readdirSync(backups).filter(f => f.endsWith('.sql'))
                .map(f => ({ name: f, mt: fs.statSync(path.join(backups, f)).mtime }))
                .sort((a, b) => b.mt - a.mt)
            if (!files.length) {
                alertas.push({ tipo: 'aviso', titulo: 'Nenhum backup encontrado', detalhe: 'Clique em Infraestrutura → Fazer Backup Agora para criar o primeiro.' })
            } else if ((Date.now() - files[0].mt.getTime()) > 7 * 24 * 3600 * 1000) {
                alertas.push({ tipo: 'aviso', titulo: 'Backup antigo', detalhe: 'Último backup em ' + new Date(files[0].mt).toLocaleString('pt-BR') + ' (' + files[0].name + ')' })
            }
        } catch {}
        // Inserir logs muito recentes? Sem erros prévios por ora
        res.json({ alertas })
    } catch (err) { res.status(500).json({ error: err.message }) }
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
