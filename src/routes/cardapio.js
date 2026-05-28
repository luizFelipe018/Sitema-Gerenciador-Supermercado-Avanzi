const router = require('express').Router()
const path = require('path')
const fs = require('fs')
const authMiddleware = require('../middlewares/authMiddleware')

router.get('/cardapio-overlay', (req, res) => {
    const possiveis = [
        path.join(__dirname, '..', '..', 'public', 'cardapio_overlay.png'),
        path.join(__dirname, '..', '..', 'public', 'assets', 'cardapio_overlay.png'),
        path.join(__dirname, 'cardapio_overlay.png'),
    ]
    const found = possiveis.find(p => fs.existsSync(p))
    if (found) return res.sendFile(found)
    res.status(404).json({ error: 'Overlay não encontrado', tentativas: possiveis })
})

router.get('/cardapio-fundo', (req, res) => {
    const possiveis = [
        path.join(__dirname, '..', '..', 'public', 'cardapio_fundo.png'),
        path.join(__dirname, '..', '..', 'public', 'assets', 'cardapio_fundo.png'),
    ]
    const found = possiveis.find(p => fs.existsSync(p))
    if (found) return res.sendFile(found)
    res.status(404).json({ error: 'Imagem de fundo não encontrada' })
})

router.get('/terca-pizza-fundo', (req, res) => {
    const possiveis = [
        path.join(__dirname, '..', '..', 'public', 'terca_pizza_fundo.png'),
        path.join(__dirname, '..', '..', 'public', 'assets', 'terca_pizza_fundo.png'),
        path.join(__dirname, 'terca_pizza_fundo.png'),
    ]
    const fundo = possiveis.find(p => fs.existsSync(p))
    if (fundo) {
        res.sendFile(fundo)
    } else {
        res.status(404).json({ error: 'Imagem de fundo não encontrada', tentativas: possiveis })
    }
})

router.get('/prato-imagem', authMiddleware, async (req, res) => {
    const nome = req.query.nome
    if (!nome) return res.status(400).json({ error: 'Nome obrigatório' })

    let PASTA_PRATOS = process.env.PASTA_PRATOS || 'E:\\Imagens\\Pratos'
    try {
        const db = require('../config/database')
        const [rows] = await db.query("SELECT valor FROM configuracoes WHERE chave = 'pasta_pratos'")
        if (rows[0]) PASTA_PRATOS = rows[0].valor
    } catch {}

    const exts = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG']
    for (const ext of exts) {
        const caminho = path.join(PASTA_PRATOS, nome + ext)
        if (fs.existsSync(caminho)) return res.sendFile(caminho)
    }

    try {
        const arquivos = fs.readdirSync(PASTA_PRATOS)
        const nomeUp   = nome.toUpperCase().replace(/[^A-Z0-9 ]/g, '')
        const encontrado = arquivos.find(a => {
            const semExt = a.replace(/\.[^.]+$/, '').toUpperCase().replace(/[^A-Z0-9 ]/g, '')
            return semExt.includes(nomeUp) || nomeUp.includes(semExt)
        })
        if (encontrado) {
            return res.sendFile(path.join(PASTA_PRATOS, encontrado))
        }
    } catch (err) {}

    res.status(404).json({ error: 'Imagem não encontrada', nome, pasta: PASTA_PRATOS })
})

router.post('/cardapio/debug-docx', authMiddleware, async (req, res) => {
    const { execFile } = require('child_process')
    const os = require('os')
    const chunks = []
    req.on('data', c => chunks.push(c))
    req.on('end', () => {
        const body     = Buffer.concat(chunks)
        const boundary = req.headers['content-type'].split('boundary=')[1]
        const sep      = Buffer.from('--' + boundary)
        let fileData   = null
        let start = 0
        while (true) {
            const idx = body.indexOf(sep, start)
            if (idx === -1) break
            const part = body.slice(start, idx)
            if (part.includes(Buffer.from('filename='))) {
                const he = part.indexOf(Buffer.from('\r\n\r\n'))
                if (he !== -1) fileData = part.slice(he + 4, part.length - 2)
            }
            start = idx + sep.length
        }
        if (!fileData) return res.status(400).json({ error: 'Arquivo não encontrado' })
        const tmp = path.join(os.tmpdir(), 'dbg_' + Date.now() + '.docx')
        fs.writeFileSync(tmp, fileData)
        const isXlsx = fileData[0] === 0x50 && fileData[1] === 0x4B
        const scriptFile = isXlsx ? 'ler_cardapio_xlsx.py' : 'ler_cardapio_docx.py'
        const ext        = isXlsx ? '.xlsx' : '.docx'
        const tmpFile    = tmp.replace('.docx', ext)
        fs.writeFileSync(tmpFile, fileData)
        const script = path.join(__dirname, '..', scriptFile)
        const pythonCmds = ['python', 'python3', 'py']
        let pythonOk = 'python'
        for (const cmd of pythonCmds) {
            try { require('child_process').execFileSync(cmd, ['--version']); pythonOk = cmd; break } catch {}
        }
        execFile(pythonOk, [script, tmp, '--debug'], { maxBuffer: 1024*1024*5 }, (err, stdout, stderr) => {
            try { fs.unlinkSync(tmp) } catch {}
            res.json({ estrutura: stderr })
        })
    })
})

router.post('/cardapio/importar-docx', authMiddleware, async (req, res) => {
    const { execFile } = require('child_process')
    const os    = require('os')
    const tmpFile = path.join(os.tmpdir(), 'cardapio_upload_' + Date.now() + '.docx')
    const chunks  = []

    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => {
        const body     = Buffer.concat(chunks)
        const boundary = req.headers['content-type'].split('boundary=')[1]
        if (!boundary) return res.status(400).json({ error: 'boundary não encontrado' })

        const sep    = Buffer.from('--' + boundary)
        const parts  = []
        let start    = 0
        while (true) {
            const idx = body.indexOf(sep, start)
            if (idx === -1) break
            parts.push(body.slice(start, idx))
            start = idx + sep.length
        }

        let fileData = null
        for (const part of parts) {
            if (part.includes(Buffer.from('filename='))) {
                const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'))
                if (headerEnd !== -1) {
                    fileData = part.slice(headerEnd + 4, part.length - 2)
                }
            }
        }

        if (!fileData || !fileData.length) return res.status(400).json({ error: 'Arquivo não encontrado no upload' })
        fs.writeFileSync(tmpFile, fileData)

        const isXlsx = fileData[0] === 0x50 && fileData[1] === 0x4B
        const scriptFile = isXlsx ? 'ler_cardapio_xlsx.py' : 'ler_cardapio_docx.py'
        const ext        = isXlsx ? '.xlsx' : '.docx'
        const finalPath  = tmpFile.replace('.docx', ext)
        fs.writeFileSync(finalPath, fileData)
        const script = path.join(__dirname, '..', scriptFile)

        let pythonOk = 'python'
        for (const cmd of ['python', 'python3', 'py']) {
            try {
                require('child_process').execFileSync(cmd, ['--version'])
                pythonOk = cmd
                break
            } catch {}
        }

        execFile(pythonOk, [script, finalPath], { maxBuffer: 1024 * 1024 * 5 }, (err, stdout, stderr) => {
            try { fs.unlinkSync(finalPath) } catch {}
            if (err) {
                return res.status(500).json({ error: stderr || err.message })
            }
            try {
                const dados = JSON.parse(stdout)
                res.json(dados)
            } catch {
                res.status(500).json({ error: 'Erro ao parsear resposta', raw: stdout.slice(0, 500) })
            }
        })
    })
})

router.get('/cardapio-semanal', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')

        await db.query(`
            CREATE TABLE IF NOT EXISTS cardapio_semanal (
                id INT AUTO_INCREMENT PRIMARY KEY,
                data_inicio DATE NOT NULL,
                dia_semana TINYINT NOT NULL,
                tipo_arroz TEXT,
                tipo_feijao TEXT,
                carnes TEXT,
                guarnicoes TEXT,
                massas TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY uk_week_day (data_inicio, dia_semana)
            )
        `)

        const { data_inicio } = req.query
        if (!data_inicio) return res.status(400).json({ error: 'data_inicio é obrigatório (YYYY-MM-DD)' })

        const [rows] = await db.query(
            'SELECT * FROM cardapio_semanal WHERE data_inicio = ? ORDER BY dia_semana',
            [data_inicio]
        )
        res.json(rows)
    } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/cardapio-semanal', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')

        await db.query(`
            CREATE TABLE IF NOT EXISTS cardapio_semanal (
                id INT AUTO_INCREMENT PRIMARY KEY,
                data_inicio DATE NOT NULL,
                dia_semana TINYINT NOT NULL,
                tipo_arroz TEXT,
                tipo_feijao TEXT,
                carnes TEXT,
                guarnicoes TEXT,
                massas TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY uk_week_day (data_inicio, dia_semana)
            )
        `)

        const { data_inicio, dias } = req.body
        if (!data_inicio || !dias) return res.status(400).json({ error: 'data_inicio e dias são obrigatórios' })

        for (const dia of dias) {
            await db.query(`
                INSERT INTO cardapio_semanal (data_inicio, dia_semana, tipo_arroz, tipo_feijao, carnes, guarnicoes, massas)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    tipo_arroz = VALUES(tipo_arroz),
                    tipo_feijao = VALUES(tipo_feijao),
                    carnes = VALUES(carnes),
                    guarnicoes = VALUES(guarnicoes),
                    massas = VALUES(massas)
            `, [
                data_inicio,
                dia.dia_semana,
                dia.tipo_arroz || null,
                dia.tipo_feijao || null,
                dia.carnes || null,
                dia.guarnicoes || null,
                dia.massas || null
            ])
        }

        res.json({ ok: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
