const router = require('express').Router()
const path = require('path')
const fs = require('fs')
const https = require('https')
const authMiddleware = require('../middlewares/authMiddleware')

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
            // 1º fallback: site da loja (lojasuperavanzi.com.br) — própria imagem do produto
            try {
                let codigoSite = req.query.codigo || null
                if (!codigoSite && req.query.nome) {
                    const dbSite = require('../config/database')
                    const [rowsSite] = await dbSite.query('SELECT codigo FROM produtos WHERE descricao = ? LIMIT 1', [String(req.query.nome).trim()])
                    if (rowsSite[0]) codigoSite = rowsSite[0].codigo
                }
                if (codigoSite) {
                    const site = require('./imagensSite')
                    const info = await site.buscarImagemSitePorCodigo(codigoSite)
                    if (info && info.ok && info.score >= 0.7) {
                        const proxyUrl = `/off-image?url=${encodeURIComponent(info.imagem_url)}`
                        return res.redirect(proxyUrl)
                    }
                }
            } catch (e) {}
            // 2º fallback: Open Food Facts
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

// Cache do índice de nomes de imagem (re-de-escanear em 5 minutos)
let imgCache = { ts: 0, nomes: null }
async function getNomesImagem() {
    if (imgCache.ts && Date.now() - imgCache.ts < 5 * 60 * 1000 && imgCache.nomes) {
        return imgCache.nomes
    }
    const PASTA_IMAGENS = await getPastaImagens()
    const nomes = new Set()
    const walk = (dir) => {
        let itens = []
        try { itens = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
        for (const it of itens) {
            const full = path.join(dir, it.name)
            if (it.isDirectory()) walk(full)
            else nomes.add(it.name.toLowerCase())
        }
    }
    walk(PASTA_IMAGENS)
    imgCache = { ts: Date.now(), nomes }
    return nomes
}
const imgExiste = (nomes, descricao) => nomes.has((String(descricao || '').trim().toUpperCase() + '.png').toLowerCase())

/**
 * GET /imagens/auditar?page=1&limit=50&status=todas|existe|sem|pendente|verificada|corrigir|sem_imagem&busca=termo
 * Cruza todos os produtos com a pasta de imagens e com imagens_verificacao.
 */
router.get('/imagens/auditar', authMiddleware, async (req, res) => {
    try {
        const nomes = await getNomesImagem()
        const db = require('../config/database')
        const page = Math.max(1, parseInt(req.query.page) || 1)
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50))
        const status = String(req.query.status || 'todas')
        const busca = String(req.query.busca || '').trim().toLowerCase()

        const [rows] = await db.query(`
            SELECT p.codigo, p.descricao, p.ean, p.preco_venda, COALESCE(iv.status, 'pendente') AS status
            FROM produtos p
            LEFT JOIN imagens_verificacao iv ON iv.codigo = p.codigo
        `)

        let itens = rows.map(p => ({
            codigo: p.codigo,
            descricao: p.descricao,
            ean: p.ean || '',
            existe: imgExiste(nomes, p.descricao),
            status: (p.status || 'pendente').trim() || 'pendente'
        }))

        const total = itens.length
        const totalExiste = itens.filter(i => i.existe).length
        const verificadas = itens.filter(i => i.status === 'verificada').length
        const corrigir = itens.filter(i => i.status === 'corrigir').length
        const semImagemBanco = itens.filter(i => i.status === 'sem_imagem').length
        const pendentes = itens.filter(i => i.status === 'pendente').length

        if (busca) itens = itens.filter(i => (i.codigo + ' ' + i.descricao).toLowerCase().includes(busca))
        if (status === 'existe') itens = itens.filter(i => i.existe)
        else if (status === 'sem') itens = itens.filter(i => !i.existe)
        else if (status === 'verificada') itens = itens.filter(i => i.status === 'verificada')
        else if (status === 'corrigir') itens = itens.filter(i => i.status === 'corrigir')
        else if (status === 'sem_imagem') itens = itens.filter(i => i.status === 'sem_imagem')
        else if (status === 'pendente') itens = itens.filter(i => i.status === 'pendente')

        const filtrados = itens.length
        const offset = (page - 1) * limit

        res.json({
            pagina: page,
            limite: limit,
            total: filtrados,
            paginas: Math.max(1, Math.ceil(filtrados / limit)),
            resumo: { total, totalExiste, totalSem: total - totalExiste, verificadas, corrigir, semImagemBanco, pendentes, naoVerificadas: pendentes + corrigir },
            itens: itens.slice(offset, offset + limit)
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.get('/off-image', (req, res) => {
    let url = String(req.query.url || '')
    if (!url) return res.status(400).json({ error: 'URL obrigatória' })

    // o site bloqueia requisições sem User-Agent (Cloudflare): mandamos um UA de browser
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Referer': 'https://lojasuperavanzi.com.br/'
    }

    const buscar = (u, redirects = 0) => {
        let alvo
        try {
            // http:// vira https:// (o site redireciona para TLS de qualquer forma)
            u = String(u).replace(/^http:\/\//i, 'https://')
            alvo = new URL(u)
        } catch {
            return res.status(400).json({ error: 'URL inválida' })
        }
        https.get({ hostname: alvo.hostname, path: alvo.pathname + alvo.search, headers }, (imgRes) => {
            if (imgRes.statusCode >= 300 && imgRes.statusCode < 400 && imgRes.headers.location && redirects < 5) {
                imgRes.resume()
                return buscar(imgRes.headers.location, redirects + 1)
            }
            if (imgRes.statusCode !== 200) {
                imgRes.resume()
                return res.status(404).json({ error: `Imagem não encontrada (HTTP ${imgRes.statusCode})` })
            }
            res.setHeader('Content-Type', imgRes.headers['content-type'] || 'image/jpeg')
            res.setHeader('Cache-Control', 'public, max-age=86400')
            imgRes.pipe(res)
        }).on('error', (e) => {
            if (!res.headersSent) res.status(500).json({ error: e.message })
        })
    }

    try {
        buscar(url)
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
