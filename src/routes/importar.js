const router = require('express').Router()
const path = require('path')
const fs = require('fs')
const authMiddleware = require('../middlewares/authMiddleware')

router.post('/importar/produtos', authMiddleware, async (req, res) => {
    const { execFile } = require('child_process')
    const os = require('os')

    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', async () => {
        const body     = Buffer.concat(chunks)
        const boundary = (req.headers['content-type'] || '').split('boundary=')[1]
        if (!boundary) return res.status(400).json({ error: 'boundary não encontrado' })

        const sep = Buffer.from('--' + boundary)
        const parts = []
        let start = 0
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
                if (headerEnd !== -1) fileData = part.slice(headerEnd + 4, part.length - 2)
            }
        }

        if (!fileData || !fileData.length) return res.status(400).json({ error: 'Arquivo não encontrado' })

        const tmpFile = path.join(os.tmpdir(), 'produtos_import_' + Date.now() + '.xlsx')
        fs.writeFileSync(tmpFile, fileData)

        const script = __dirname.includes('app.asar')
            ? path.join(process.resourcesPath, 'importar_produtos_xlsx.py')
            : path.join(__dirname, '..', 'importar_produtos_xlsx.py')

        let pythonOk = 'python'
        for (const cmd of ['python', 'python3', 'py']) {
            try { require('child_process').execFileSync(cmd, ['--version']); pythonOk = cmd; break } catch {}
        }

        execFile(pythonOk, [script, tmpFile], { maxBuffer: 1024 * 1024 * 50 }, async (err, stdout, stderr) => {
            try { fs.unlinkSync(tmpFile) } catch {}
            if (err) return res.status(500).json({ error: stderr || err.message })

            let parsed
            try { parsed = JSON.parse(stdout) } catch { return res.status(500).json({ error: 'Erro ao parsear', raw: stdout.slice(0,500) }) }

            const db       = require('../config/database')
            const produtos = parsed.produtos
            const BATCH    = 500
            let inseridos  = 0, atualizados = 0, erros = 0

            for (let i = 0; i < produtos.length; i += BATCH) {
                const lote = produtos.slice(i, i + BATCH)
                try {
                    for (const p of lote) {
                            await db.query(`
                            INSERT INTO produtos
                                (codigo, descricao, ean, departamento, secao, grupo, familia, status, ncm,
                                 estoque_atual, pmz, custo, preco_venda, preco_oferta, preco_venda_kg, preco_oferta_kg,
                                 validade, data_cadastro, data_alteracao, qtde_vendida_mes, vendas_media,
                                 participa_cotacao, quantidade_kg_l, descricao_kglt, marca,
                                 ultima_alteracao_preco, data_ultima_entrada, aceita_troca)
                            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                            ON DUPLICATE KEY UPDATE
                                descricao=VALUES(descricao), ean=VALUES(ean),
                                departamento=VALUES(departamento), secao=VALUES(secao), grupo=VALUES(grupo),
                                familia=VALUES(familia), status=VALUES(status), ncm=VALUES(ncm),
                                estoque_atual=VALUES(estoque_atual), pmz=VALUES(pmz), custo=VALUES(custo),
                                preco_venda=VALUES(preco_venda), preco_oferta=VALUES(preco_oferta),
                                preco_venda_kg=VALUES(preco_venda_kg), preco_oferta_kg=VALUES(preco_oferta_kg),
                                validade=VALUES(validade), data_cadastro=VALUES(data_cadastro),
                                data_alteracao=VALUES(data_alteracao), qtde_vendida_mes=VALUES(qtde_vendida_mes),
                                vendas_media=VALUES(vendas_media), participa_cotacao=VALUES(participa_cotacao),
                                quantidade_kg_l=VALUES(quantidade_kg_l), descricao_kglt=VALUES(descricao_kglt),
                                marca=VALUES(marca), ultima_alteracao_preco=VALUES(ultima_alteracao_preco),
                                data_ultima_entrada=VALUES(data_ultima_entrada), aceita_troca=VALUES(aceita_troca)
                        `, [
                            p.codigo, p.descricao, p.ean, p.departamento, p.secao, p.grupo, p.familia,
                            p.status, p.ncm, p.estoque_atual, p.pmz, p.custo, p.preco_venda, p.preco_oferta,
                            p.preco_venda_kg, p.preco_oferta_kg, p.validade, p.data_cadastro, p.data_alteracao,
                            p.qtde_vendida_mes, p.vendas_media, p.participa_cotacao, p.quantidade_kg_l,
                            p.descricao_kglt, p.marca, p.ultima_alteracao_preco, p.data_ultima_entrada, p.aceita_troca
                        ])
                        inseridos++
                    }
                } catch (e) {
                    erros += lote.length
                }
            }

            res.json({ ok: true, total: produtos.length, inseridos, atualizados, erros })
        })
    })
})

module.exports = router
