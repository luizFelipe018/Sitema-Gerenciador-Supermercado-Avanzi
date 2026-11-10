/* ═══════════════════════════════════════════════════════════════
   IMAGENS DO SITE AVANZI — lojasuperavanzi.com.br
   Baixa o sitemap do site, casa com os produtos do ERP e
   extrai/baixa a imagem de cada produto (og:image / product-vault).
   ═══════════════════════════════════════════════════════════════ */

const router = require('express').Router()
const path = require('path')
const fs = require('fs')
const https = require('https')
const authMiddleware = require('../middlewares/authMiddleware')

const SITE_BASE = 'https://lojasuperavanzi.com.br'
const SITEMAP_URL = `${SITE_BASE}/sitemap.xml`

async function getPastaImagens() {
    try {
        const db = require('../config/database')
        const [rows] = await db.query("SELECT valor FROM configuracoes WHERE chave = 'pasta_imagens'")
        if (rows[0] && rows[0].valor) return rows[0].valor
    } catch {}
    return process.env.PASTA_IMAGENS || 'E:\\Banco de Imagens'
}

/* ── util: GET https com texto ── */
function httpGetText(url, timeoutMs = 25000) {
    return new Promise((resolve, reject) => {
        let resolvido = false
        const falhar = (e) => { if (!resolvido) { resolvido = true; reject(e) } }
        const concluir = (v) => { if (!resolvido) { resolvido = true; resolve(v) } }

        const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ERP-Avanzi', 'Accept': '*/*' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                res.resume()
                return concluir(httpGetText(res.headers.location, timeoutMs))
            }
            if (res.statusCode !== 200) {
                res.resume()
                return falhar(new Error(`HTTP ${res.statusCode} em ${url.slice(0, 80)}`))
            }
            let data = ''
            res.setEncoding('utf8')
            res.on('data', c => { data += c })
            res.on('aborted', () => falhar(new Error('conexão abortada')))
            res.on('end', () => concluir(data))
        })
        req.on('error', falhar)
        req.setTimeout(timeoutMs, () => { req.destroy(); falhar(new Error('timeout')) })
    })
}

function httpGetBuffer(url, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
        let resolvido = false
        const falhar = (e) => { if (!resolvido) { resolvido = true; reject(e) } }
        const concluir = (v) => { if (!resolvido) { resolvido = true; resolve(v) } }

        const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ERP-Avanzi' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                res.resume()
                return concluir(httpGetBuffer(res.headers.location, timeoutMs))
            }
            if (res.statusCode !== 200) {
                res.resume()
                return falhar(new Error(`HTTP ${res.statusCode}`))
            }
            const chunks = []
            res.on('data', c => chunks.push(c))
            res.on('aborted', () => falhar(new Error('conexão abortada')))
            res.on('end', () => concluir({ buf: Buffer.concat(chunks), contentType: res.headers['content-type'] || 'image/jpeg' }))
        })
        req.on('error', falhar)
        req.setTimeout(timeoutMs, () => { req.destroy(); falhar(new Error('timeout')) })
    })
}

/* ── normalização de texto p/ comparação ── */
function normalizarTexto(s) {
    return String(s || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .replace(/\s+/g, ' ')
}

/* ── índice do sitemap do site (cache 12h em memória) ── */
let siteIndexCache = { ts: 0, itens: null }
async function getIndiceSite(force = false) {
    if (!force && siteIndexCache.itens && Date.now() - siteIndexCache.ts < 12 * 60 * 60 * 1000) {
        return siteIndexCache.itens
    }
    const xml = await httpGetText(SITEMAP_URL)
    const itens = [...xml.matchAll(/<loc>(https:\/\/lojasuperavanzi\.com\.br\/produtos\/(\d+)\/([^<]+))<\/loc>/g)].map(m => ({
        url: m[1],
        id: m[2],
        nome: m[3].replace(/-/g, ' ').trim()
    }))
    // índice invertido por token p/ match rápido
    const porToken = new Map()
    itens.forEach((item, i) => {
        const toks = normalizarTexto(item.nome).split(' ').filter(Boolean)
        item.toks = toks
        for (const t of new Set(toks)) {
            if (!porToken.has(t)) porToken.set(t, [])
            porToken.get(t).push(i)
        }
    })
    siteIndexCache = { ts: Date.now(), itens, porToken }
    return itens
}

/* ── dicionário de equivalências (abreviações do ERP ↔ formas do site) ── */
const SINONIMOS = {
    // unidades/medidas
    'ml': ['ml'], 'lt': ['lt', 'l', 'litro'], 'l': ['l', 'lt', 'litro'], 'lts': ['lt', 'litros'],
    'kg': ['kg', 'quilo'], 'g': ['g', 'grama'], 'gr': ['g', 'grama'], 'grs': ['grama'],
    'cx': ['cx', 'caixa'], 'fd': ['fd', 'fardo'], 'pct': ['pct', 'pacote'],
    'un': ['un', 'unidade'], 'und': ['un', 'unidade'], 'dz': ['dz', 'duzia'],
    // abreviações comuns de produtos
    'amac': ['amac', 'amaciante'], 'amaciante': ['amaciante', 'amac'],
    'deterg': ['detergente'], 'detergente': ['detergente', 'deterg'],
    'sab': ['sabao'], 'sabao': ['sabao', 'sab'], 'sabonete': ['sabonete'],
    'shp': ['shampoo'], 'shampoo': ['shampoo', 'shp'],
    'cond': ['condicionador'], 'condicionador': ['condicionador', 'cond'],
    'crem': ['creme'], 'creme': ['creme', 'crem'],
    'desod': ['desodorante'], 'perf': ['perfume'],
    'esc': ['escova'], 'cig': ['cigarro'],
    'ref': ['refil'], 'refil': ['refil', 'ref'],
    'lat': ['lata'], 'bdj': ['broche'],
    'fl': ['fl', 'frasco'], 'fr': ['frasco'], 'frasc': ['frasco'],
    'frasco': ['frasco', 'fl', 'fr', 'frasc'],
    'pump': ['pump', 'bomba'], 'bomba': ['bomba', 'pump'],
    // abreviações de marcas/nomes
    'ype': ['ype'], 'coca': ['coca', 'coca cola'], 'nescau': ['nescau'],
    // embalagens
    'garrafa': ['garrafa'], 'pet': ['pet'], 'latao': ['latao']
}

/* ── verifica se 2 tokens são "equivalentes" (iguais, abreviação ou sinônimo) ── */
function tokensEquivalentes(a, b) {
    if (a === b) return true
    // números com unidade: 2l ≈ 2lt, 500g ≈ 500gr
    const numA = a.match(/^(\d+)(l|lt|ml|g|gr|kg|mg)?$/)
    const numB = b.match(/^(\d+)(l|lt|ml|g|gr|kg|mg)?$/)
    if (numA && numB && numA[1] === numB[1]) {
        const ua = numA[2] || '', ub = numB[2] || ''
        if (ua === ub) return true
        if ((ua === 'l' && ub === 'lt') || (ua === 'lt' && ub === 'l')) return true
        if ((ua === 'g' && ub === 'gr') || (ua === 'gr' && ub === 'g')) return true
    }
    const sin = SINONIMOS[a]
    if (sin && sin.includes(b)) return true
    const sinB = SINONIMOS[b]
    if (sinB && sinB.includes(a)) return true
    return false
}

/* ── melhor match de um produto ERP no índice do site ── */
async function buscarMatchSite(descricao) {
    const itens = await getIndiceSite()
    const { porToken } = siteIndexCache
    const toksERP = [...new Set(normalizarTexto(descricao).split(' ').filter(Boolean))]
    if (!toksERP.length) return null

    // votação: candidatos que compartilham tokens com o produto do ERP
    const votos = new Map() // idx -> nº tokens exatos
    for (const t of toksERP) {
        for (const idx of (porToken.get(t) || [])) {
            votos.set(idx, (votos.get(idx) || 0) + 1)
        }
    }
    // candidatos por equivalência (abreviações/sinônimos) — contam 0.5
    const eqTokens = new Map() // idx -> nº tokens equivalentes (não exatos)
    for (const t of toksERP) {
        const sin = SINONIMOS[t]
        if (!sin) continue
        for (const s of sin) {
            if (s === t) continue
            for (const idx of (porToken.get(s) || [])) {
                // só conta se este token do ERP ainda não bate exatamente neste candidato
                const item = itens[idx]
                if (item.toks.includes(t)) continue
                if (!votos.has(idx) || !item.toks.includes(t)) {
                    eqTokens.set(idx, (eqTokens.get(idx) || 0) + 0.5)
                }
            }
        }
    }
    // equivalentes numéricos (2l ↔ 2lt): varre candidatos com 2+ em comum já
    for (const [idx, inter] of votos) {
        const item = itens[idx]
        for (const t of toksERP) {
            if (item.toks.includes(t)) continue
            for (const s of item.toks) {
                if (tokensEquivalentes(t, s)) {
                    eqTokens.set(idx, (eqTokens.get(idx) || 0) + 0.5)
                    break
                }
            }
        }
    }

    let melhor = null
    const avalia = (idx, interExato, interEq) => {
        const item = itens[idx]
        const tamERP = toksERP.length
        const tamSite = new Set(item.toks).size
        const interPonderada = interExato + interEq
        if (interPonderada < 1) return
        const menor = Math.min(tamERP, tamSite)
        const score = interPonderada / menor
        const coberturaERP = Math.min(1, interPonderada / tamERP)
        const scoreFinal = Math.round((score * 0.7 + coberturaERP * 0.3) * 100) / 100
        const difTam = Math.abs(tamERP - tamSite)
        if (scoreFinal >= 0.4 && (!melhor || scoreFinal > melhor.score || (scoreFinal === melhor.score && difTam < melhor.difTam))) {
            melhor = { ...item, score: scoreFinal, difTam }
        }
    }

    for (const [idx, inter] of votos) avalia(idx, inter, eqTokens.get(idx) || 0)
    for (const [idx, eq] of eqTokens) {
        if (!votos.has(idx)) avalia(idx, 0, eq)
    }
    return melhor
}

/* ── extrai a imagem principal de uma página de produto do site ── */
function extrairImagemDoHTML(html) {
    // 1º: URLs do product-vault (originais) — prefere 1600x0 (sem corte)
    const vault = [...html.matchAll(/https:\/\/edge\.osuper\.com\.br\/[^"'\\\s)]*?osuper-product-vault[^"'\\\s)]+/g)].map(m => m[0])
    const wide = vault.find(u => /\/1600x0\//.test(u))
    if (wide) return { url: wide, origem: 'vault-1600' }
    if (vault[0]) return { url: vault[0], origem: 'vault' }
    // 2º: og:image
    const og = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/)
    if (og) return { url: og[1], origem: 'og-image' }
    // 3º: qualquer imagem S3 da loja
    const s3 = html.match(/https:\/\/edge\.osuper\.com\.br\/[^"'\\\s)]*?osuper-ecommerce-superavanzi\.s3[^"'\\\s)]+\.(?:jpg|jpeg|png|webp)/i)
    if (s3) return { url: s3[0], origem: 's3' }
    return null
}

/* ── cache de resultados por produto (evita refetch) ── */
const resultadoCache = new Map() // codigo -> { ok, url, ... ts }

async function buscarImagemSitePorCodigo(codigo) {
    const db = require('../config/database')
    const [rows] = await db.query('SELECT codigo, descricao, ean FROM produtos WHERE codigo = ?', [codigo])
    if (!rows[0]) return { erro: 'Produto não encontrado no ERP' }
    const prod = rows[0]

    const cache = resultadoCache.get(String(codigo))
    if (cache && Date.now() - cache.ts < 12 * 60 * 60 * 1000) return { ...cache, cache: true }

    const match = await buscarMatchSite(prod.descricao)
    if (!match) {
        const r = { ok: false, codigo: prod.codigo, descricao: prod.descricao, motivo: 'sem correspondência no site' }
        resultadoCache.set(String(codigo), { ...r, ts: Date.now() })
        return r
    }

    try {
        const html = await httpGetText(match.url)
        const img = extrairImagemDoHTML(html)
        if (!img) {
            const r = { ok: false, codigo: prod.codigo, descricao: prod.descricao, match: match.nome, url_site: match.url, motivo: 'produto sem imagem no site' }
            resultadoCache.set(String(codigo), { ...r, ts: Date.now() })
            return r
        }
        const r = {
            ok: true,
            codigo: prod.codigo,
            descricao: prod.descricao,
            match: match.nome,
            score: match.score,
            url_site: match.url,
            imagem_url: img.url,
            origem: img.origem,
            proxy: `/off-image?url=${encodeURIComponent(img.url)}`
        }
        resultadoCache.set(String(codigo), { ...r, ts: Date.now() })
        return r
    } catch (e) {
        return { ok: false, codigo: prod.codigo, descricao: prod.descricao, match: match.nome, url_site: match.url, motivo: `falha ao buscar página (${e.message})` }
    }
}

/* ── baixa a imagem e grava na pasta como DESCRIÇÃO.png ── */
async function baixarESalvar(codigo) {
    const info = await buscarImagemSitePorCodigo(codigo)
    if (!info.ok) return { ...info, salvo: false }

    const nomeArquivo = String(info.descricao).trim().toUpperCase() + '.png'
    const pasta = await getPastaImagens()
    const destino = path.join(pasta, nomeArquivo)

    let pastaOk = true
    try { fs.mkdirSync(pasta, { recursive: true }) } catch (e) {
        pastaOk = false
        return { ...info, salvo: false, motivo: `pasta de imagens inacessível (${pasta}): ${e.message}` }
    }

    const { buf } = await httpGetBuffer(info.imagem_url)
    fs.writeFileSync(destino, buf)
    return { ...info, salvo: true, arquivo: destino, bytes: buf.length }
}

/* ══════════════════ ROTAS ══════════════════ */

/* GET /imagens-site/indice — status do índice do site */
router.get('/imagens-site/indice', authMiddleware, async (req, res) => {
    try {
        const itens = await getIndiceSite(req.query.refresh === '1')
        res.json({ total: itens.length, atualizado: new Date(siteIndexCache.ts).toISOString() })
    } catch (err) {
        res.status(500).json({ error: `Falha ao ler sitemap do site: ${err.message}` })
    }
})

/* GET /imagens-site/buscar?codigo=123 — localiza o produto no site (não baixa) */
router.get('/imagens-site/buscar', authMiddleware, async (req, res) => {
    try {
        const codigo = String(req.query.codigo || '').trim()
        if (!codigo) return res.status(400).json({ error: 'Informe codigo' })
        const r = await buscarImagemSitePorCodigo(codigo)
        res.status(r.erro ? 404 : 200).json(r)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

/* POST /imagens-site/salvar {codigo} — baixa e grava na pasta de imagens */
router.post('/imagens-site/salvar', authMiddleware, async (req, res) => {
    try {
        const codigo = String(req.body?.codigo || '').trim()
        if (!codigo) return res.status(400).json({ error: 'Informe codigo' })
        const r = await baixarESalvar(codigo)
        res.json(r)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

/* POST /imagens-site/salvar-lote {codigos:[]} — lote (máx 40 por chamada) */
router.post('/imagens-site/salvar-lote', authMiddleware, async (req, res) => {
    try {
        const codigos = (req.body?.codigos || []).map(String).slice(0, 40)
        if (!codigos.length) return res.status(400).json({ error: 'Informe codigos' })
        const resultados = []
        for (const c of codigos) {
            try {
                resultados.push(await baixarESalvar(c))
            } catch (e) {
                resultados.push({ codigo: c, ok: false, salvo: false, motivo: e.message })
            }
            await new Promise(r => setTimeout(r, 250)) // respeita o site
        }
        const salvos = resultados.filter(r => r.salvo).length
        res.json({ total: resultados.length, salvos, resultados })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

/* GET /imagens-site/sem-imagem — produtos do ERP sem imagem local (p/ importar em lote) */
router.get('/imagens-site/sem-imagem', authMiddleware, async (req, res) => {
    try {
        const db = require('../config/database')
        const pasta = await getPastaImagens()
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
        walk(pasta)
        const [rows] = await db.query('SELECT codigo, descricao, ean FROM produtos ORDER BY descricao')
        const sem = rows.filter(p => !nomes.has((String(p.descricao || '').trim().toUpperCase() + '.png').toLowerCase()))
        res.json({ totalProdutos: rows.length, semImagem: sem.length, produtos: sem.slice(0, parseInt(req.query.limit) || 500) })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
module.exports.buscarImagemSitePorCodigo = buscarImagemSitePorCodigo
module.exports.getIndiceSite = getIndiceSite
