const router = require('express').Router()
const path = require('path')
const fs = require('fs')
const https = require('https')

async function getPastaImagens() {
    try {
        const db = require('../config/database')
        const [rows] = await db.query("SELECT valor FROM configuracoes WHERE chave = 'pasta_imagens'")
        if (rows[0]) return rows[0].valor
    } catch {}
    return process.env.PASTA_IMAGENS || 'E:\\Banco de Imagens'
}

function buscarImagem(pasta, nomeArquivo) {
    try {
        const itens = fs.readdirSync(pasta)
        for (const item of itens) {
            const caminhoCompleto = path.join(pasta, item)
            const stat = fs.statSync(caminhoCompleto)
            if (stat.isDirectory()) {
                const encontrado = buscarImagem(caminhoCompleto, nomeArquivo)
                if (encontrado) return encontrado
            } else {
                if (item.toLowerCase() === nomeArquivo.toLowerCase()) {
                    return caminhoCompleto
                }
            }
        }
    } catch {}
    return null
}

async function buscarOpenFoodFacts(termo) {
    return new Promise((resolve, reject) => {
        const isCodigo = /^\d+$/.test(String(termo))
        let url = ''

        if (isCodigo && String(termo).length >= 8) {
            url = `https://world.openfoodfacts.org/api/v0/product/${termo}.json`
        } else {
            url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(termo)}&search_simple=1&action=process&json=1&page_size=1`
        }

        https.get(url, (res) => {
            let data = ''
            res.on('data', chunk => data += chunk)
            res.on('end', () => {
                try {
                    const json = JSON.parse(data)
                    if (isCodigo) {
                        if (json.status === 1 && json.product) {
                            const p = json.product
                            resolve({
                                image_url: p.image_front_url || p.image_url || p.image_small_url,
                                image_small_url: p.image_front_small_url || p.image_small_url,
                                product_name: p.product_name || p.product_name_pt,
                                brands: p.brands,
                                categories: p.categories
                            })
                        } else {
                            resolve(null)
                        }
                    } else {
                        if (json.products && json.products.length > 0) {
                            const p = json.products[0]
                            resolve({
                                image_url: p.image_front_url || p.image_front_small_url || p.image_small_url || p.image_url,
                                image_small_url: p.image_front_small_url || p.image_small_url,
                                product_name: p.product_name || p.product_name_pt,
                                brands: p.brands,
                                categories: p.categories
                            })
                        } else {
                            resolve(null)
                        }
                    }
                } catch (e) {
                    reject(e)
                }
            })
        }).on('error', reject)
    })
}

router.get('/imagem', async (req, res) => {
    try {
        let nomeArquivo = null

        if (req.query.nome) {
            nomeArquivo = req.query.nome.trim().toUpperCase() + '.png'
        } else if (req.query.codigo) {
            const db = require('../config/database')
            const [rows] = await db.query('SELECT descricao FROM produtos WHERE codigo = ?', [req.query.codigo])
            if (!rows[0]) return res.status(404).json({ error: 'Produto não encontrado' })
            nomeArquivo = rows[0].descricao.trim().toUpperCase() + '.png'
        } else {
            return res.status(400).json({ error: 'Informe nome ou codigo' })
        }

        const PASTA_IMAGENS = await getPastaImagens()
        const caminho = buscarImagem(PASTA_IMAGENS, nomeArquivo)

        if (!caminho) {
            try {
                const nomeBusca = req.query.nome || req.query.codigo
                const produtoOFF = await buscarOpenFoodFacts(nomeBusca)
                if (produtoOFF && produtoOFF.image_url) {
                    const proxyUrl = `/off-image?url=${encodeURIComponent(produtoOFF.image_url)}`
                    return res.redirect(proxyUrl)
                }
            } catch (e) {}
            return res.status(404).json({ error: 'Imagem não encontrada', nome: nomeArquivo })
        }

        res.sendFile(caminho)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.get('/off-image', (req, res) => {
    const { url } = req.query
    if (!url) return res.status(400).json({ error: 'URL obrigatória' })

    try {
        https.get(url, (imgRes) => {
            if (imgRes.statusCode !== 200) {
                return res.status(404).json({ error: 'Imagem não encontrada' })
            }
            res.setHeader('Content-Type', imgRes.headers['content-type'] || 'image/jpeg')
            res.setHeader('Cache-Control', 'public, max-age=86400')
            imgRes.pipe(res)
        }).on('error', (e) => {
            res.status(500).json({ error: e.message })
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.get('/off-buscar', async (req, res) => {
    try {
        const { q, ean, codigo } = req.query
        if (!q && !ean && !codigo) {
            return res.status(400).json({ error: 'Informe q, ean ou codigo' })
        }

        const termo = q || ean || codigo
        const resultado = await buscarOpenFoodFacts(termo)

        if (resultado) {
            res.json(resultado)
        } else {
            res.status(404).json({ error: 'Produto não encontrado no Open Food Facts' })
        }
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
