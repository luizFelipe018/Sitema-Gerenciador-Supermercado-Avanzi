const router = require('express').Router()
const path = require('path')
const fs = require('fs')
const authMiddleware = require('../middlewares/authMiddleware')
const auditService = require('../services/auditService')

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

        // Parser nativo em Node (sem depender de Python/openpyxl).
        // O script Python segue como reserva para arquivos fora do padrão.
        let parsed = null
        let parseError = null
        try {
            parsed = require('../services/produtosXlsx').parseProdutosXlsx(fileData)
        } catch (e) {
            parseError = e
        }

        if (!parsed) {
            const script = __dirname.includes('app.asar')
                ? path.join(process.resourcesPath, 'importar_produtos_xlsx.py')
                : path.join(__dirname, '..', 'importar_produtos_xlsx.py')

            let pythonOk = 'python'
            for (const cmd of ['python', 'python3', 'py']) {
                try { require('child_process').execFileSync(cmd, ['--version']); pythonOk = cmd; break } catch {}
            }

            execFile(pythonOk, [script, tmpFile], { maxBuffer: 1024 * 1024 * 50 }, async (err, stdout, stderr) => {
                try { fs.unlinkSync(tmpFile) } catch {}
                if (err) {
                    const detalhe = parseError ? `${parseError.message} | ` : ''
                    return res.status(500).json({ error: detalhe + (stderr || err.message) })
                }

                let parsedPy
                try { parsedPy = JSON.parse(stdout) } catch { return res.status(500).json({ error: 'Erro ao parsear', raw: stdout.slice(0,500) }) }
                await gravarProdutos(req, res, parsedPy.produtos || [])
            })
            return
        }

        try { fs.unlinkSync(tmpFile) } catch {}
        await gravarProdutos(req, res, parsed.produtos || [])
    })
})

/**
 * Grava os produtos importados no banco (upsert em lotes).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {any[]} produtos
 */
async function gravarProdutos(req, res, produtos) {
    const db       = require('../config/database')
    const BATCH    = 500
    let inseridos  = 0, atualizados = 0, erros = 0

    for (let i = 0; i < produtos.length; i += BATCH) {
        const lote = produtos.slice(i, i + BATCH)
        try {
            for (const p of lote) {
                await db.query(`
                    INSERT INTO produtos
                        (codigo, descricao, ean, departamento, secao, grupo, subgrupo, codigo_secundario, familia, associado, status, composto, ncm,
                         trib_pis_cofins, exc_ipi, exc_icms, cest, classificacao_trib,
                         estoque_atual, pmz, custo, preco_venda, preco_oferta, preco_venda_kg, preco_oferta_kg,
                         validade, data_cadastro, data_alteracao, qtde_vendida_mes, vendas_media,
                         participa_cotacao, quantidade_kg_l, descricao_kglt, marca,
                         ultima_alteracao_preco, data_ultima_entrada, aceita_troca)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                    ON DUPLICATE KEY UPDATE
                        descricao=VALUES(descricao), ean=VALUES(ean),
                        departamento=VALUES(departamento), secao=VALUES(secao), grupo=VALUES(grupo),
                        subgrupo=VALUES(subgrupo), codigo_secundario=VALUES(codigo_secundario),
                        familia=VALUES(familia), associado=VALUES(associado), status=VALUES(status), composto=VALUES(composto),
                        ncm=VALUES(ncm), trib_pis_cofins=VALUES(trib_pis_cofins), exc_ipi=VALUES(exc_ipi),
                        exc_icms=VALUES(exc_icms), cest=VALUES(cest), classificacao_trib=VALUES(classificacao_trib),
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
                    p.codigo, p.descricao, p.ean, p.departamento, p.secao, p.grupo, p.subgrupo, p.codigo_secundario, p.familia, p.associado,
                    p.status, p.composto, p.ncm, p.trib_pis_cofins, p.exc_ipi, p.exc_icms, p.cest, p.classificacao_trib,
                    p.estoque_atual, p.pmz, p.custo, p.preco_venda, p.preco_oferta,
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

    try {
        await auditService.registrar(req, auditService.ACOES.IMPORTAR_PRODUTOS, {
            descricao: `importou ${produtos.length} produto(s)`,
            entidade: 'produtos',
            quantidade: produtos.length,
            detalhes: { inseridos, atualizados, erros }
        })
    } catch (e) {
        // não falhar a requisição por erro na auditoria
    }
}

module.exports = router
