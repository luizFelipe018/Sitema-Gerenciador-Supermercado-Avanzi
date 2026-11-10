/* ═══════════════════════════════════════════════════════════════
   PREÇOS DO SITE — lojasuperavanzi.com.br
   Lê o preço atual de cada produto direto da loja (SKU == CÓDIGO do ERP)
   e permite comparar, atualizar o preço no ERP e criar placas com o valor certo.
   Não mexe em nenhuma outra rota/aba.
   ═══════════════════════════════════════════════════════════════ */

const router = require('express').Router()
const https = require('https')
const authMiddleware = require('../middlewares/authMiddleware')

const SEARCH_ENGINE = 'https://sense.osuper.com.br/279/1369/v2'
const SITE_ORIGIN = 'https://lojasuperavanzi.com.br'
const SITE_REFERER = 'https://lojasuperavanzi.com.br/'

function httpGetJson(url, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
        let resolvido = false
        const falhar = (e) => { if (!resolvido) { resolvido = true; reject(e) } }
        const concluir = (v) => { if (!resolvido) { resolvido = true; resolve(v) } }

        const req = https.get(url, {
            headers: {
                'Origin': SITE_ORIGIN,
                'Referer': SITE_REFERER,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ERP-Avanzi',
                'Accept': 'application/json'
            }
        }, (res) => {
            if (res.statusCode !== 200) {
                res.resume()
                return falhar(new Error(`HTTP ${res.statusCode}`))
            }
            let data = ''
            res.setEncoding('utf8')
            res.on('data', c => { data += c })
            res.on('aborted', () => falhar(new Error('conexão abortada')))
            res.on('end', () => { try { concluir(JSON.parse(data)) } catch (e) { falhar(new Error('JSON inválido')) } })
        })
        req.on('error', falhar)
        req.setTimeout(timeoutMs, () => { req.destroy(); falhar(new Error('timeout')) })
    })
}

/* Resolve o termo (código, EAN, etc.) para o código ERP — que é o SKU do site.
   Aceita códigos curtos (1935), EANs (789...13 dígitos) ou qualquer termo que exista no ERP. */
async function resolverCodigoERP(termo) {
    const t = String(termo || '').trim()
    if (!t) return null
    try {
        const db = require('../config/database')
        // 1º: é o próprio código do ERP?
        const [byCodigo] = await db.query('SELECT codigo FROM produtos WHERE codigo = ? LIMIT 1', [t])
        if (byCodigo[0]) return byCodigo[0].codigo
        // 2º: é o EAN do produto?
        const [byEan] = await db.query('SELECT codigo FROM produtos WHERE ean = ? LIMIT 1', [t])
        if (byEan[0]) return byEan[0].codigo
        // 3º: termo parcial na descrição (útil para colar nome)
        const [byDesc] = await db.query('SELECT codigo FROM produtos WHERE descricao LIKE ? LIMIT 1', [`%${t}%`])
        if (byDesc[0]) return byDesc[0].codigo
    } catch { /* cai para o termo original */ }
    return t
}

/* Busca UM produto no site pelo SKU (== código do ERP) */
async function buscarNoSite(codigo) {
    const arr = await httpGetJson(`${SEARCH_ENGINE}/instant_search?search=${encodeURIComponent(codigo)}`)
    if (!Array.isArray(arr) || !arr.length) return null
    const p = arr[0]
    if (!p || !p.pricing) return null
    const price = Number(p.pricing.price) || 0
    const promoPrice = p.pricing.promotion === true && Number(p.pricing.promotionalPrice) > 0 ? Number(p.pricing.promotionalPrice) : null
    return {
        site_id: String(p.id),
        name: p.name || '',
        brand: p.brandName || '',
        price,                       // preço cheio
        promotionalPrice: promoPrice, // preço promocional (se ativo)
        promotion: p.pricing.promotion === true,
        discount: Number(p.pricing.discount) || 0,
        inStock: Number(p.quantity?.inStock ?? 0),
        saleUnit: p.saleUnit || 'UN',
        slug: p.slug || '',
        image: p.image || null,
        url: p.slug ? `https://lojasuperavanzi.com.br/produtos/${p.id}/${p.slug}` : null
    }
}

const siteCache = new Map() // codigo -> { ts, info }
const CACHE_MS = 10 * 60 * 1000

/* GET /precos-site/buscar?codigo=&ean=&q= — preço do site + dados do ERP.
   Aceita código curto, EAN ou termo — sempre resolvido para o código ERP (SKU do site). */
router.get('/precos-site/buscar', authMiddleware, async (req, res) => {
    try {
        const termo = String(req.query.codigo || req.query.ean || req.query.q || '').trim()
        if (!termo) return res.status(400).json({ error: 'Informe codigo, ean ou q' })

        const codigo = await resolverCodigoERP(termo)
        const db = require('../config/database')
        const [rows] = await db.query('SELECT codigo, descricao, ean, preco_venda, quantidade_kg_l, descricao_kglt, marca FROM produtos WHERE codigo = ? LIMIT 1', [codigo])
        const erp = rows[0] || null

        const cached = siteCache.get(codigo)
        if (cached && Date.now() - cached.ts < CACHE_MS) {
            return res.json({ ...cached.info, termoResolvido: termo, codigoERP: codigo, erp })
        }

        const info = await buscarNoSite(codigo)
        if (!info) return res.status(404).json({ erro: 'Produto não encontrado no site', termo, codigoERP: codigo, erp })
        siteCache.set(codigo, { ts: Date.now(), info })
        res.json({ ...info, termoResolvido: termo, codigoERP: codigo, erp })
    } catch (err) {
        res.status(500).json({ error: `Falha ao consultar o site: ${err.message}` })
    }
})

/* GET /precos-site/comparar?q= — busca no ERP (por código, EAN ou descrição) + preço do site (SKU = código ERP) */
router.get('/precos-site/comparar', authMiddleware, async (req, res) => {
    try {
        const termo = String(req.query.q || '').trim()
        if (termo.length < 2) return res.status(400).json({ error: 'Digite ao menos 2 caracteres' })
        const limit = Math.min(25, Math.max(1, parseInt(req.query.limit) || 15))

        const db = require('../config/database')
        const like = `%${termo}%`
        const [rows] = await db.query(
            `SELECT codigo, descricao, ean, preco_venda, quantidade_kg_l, marca
             FROM produtos
             WHERE descricao LIKE ? OR codigo LIKE ? OR ean LIKE ? OR marca LIKE ?
             ORDER BY descricao
             LIMIT ?`,
            [like, like, like, like, limit]
        )

        const itens = []
        for (const p of rows) {
            let site = null
            try {
                const cached = siteCache.get(p.codigo)
                if (cached && Date.now() - cached.ts < CACHE_MS) {
                    site = cached.info
                } else {
                    site = await buscarNoSite(p.codigo)
                    if (site) siteCache.set(p.codigo, { ts: Date.now(), info: site })
                }
            } catch {
                site = { erro: 'falha ao consultar o site' }
            }
            itens.push({
                codigo: p.codigo,
                descricao: p.descricao,
                ean: p.ean || '',
                quantidade_kg_l: p.quantidade_kg_l != null ? Number(p.quantidade_kg_l) : 0,
                marca: p.marca || '',
                precoErp: p.preco_venda != null ? Number(p.preco_venda) : null,
                site
            })
            // throttle leve para não sufocar o servidor do site
            await new Promise(r => setTimeout(r, 120))
        }
        res.json({ total: itens.length, itens })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

/* POST /precos-site/atualizar-preco {codigo, preco} — atualiza preco_venda do ERP */
router.post('/precos-site/atualizar-preco', authMiddleware, async (req, res) => {
    try {
        const codigo = String(req.body?.codigo || '').trim()
        const preco = Number(req.body?.preco)
        if (!codigo || !Number.isFinite(preco)) return res.status(400).json({ error: 'Informe codigo e preco' })

        const db = require('../config/database')
        // atualiza apenas o preço, sem mexer nos demais campos
        const [r] = await db.query('UPDATE produtos SET preco_venda = ? WHERE codigo = ?', [preco, codigo])
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Produto não encontrado no ERP' })
        res.json({ ok: true, codigo, preco })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
module.exports.buscarNoSite = buscarNoSite
