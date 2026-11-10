/* ═══════════════════════════════════════════════════════════════
   REMOVER FUNDO (IA) — prepara o modelo na 1ª vez
   Na primeira abertura desta aba, o ERP baixa o modelo de IA
   (~75 MB, esqueleto em public/vendor/imgly/1.7.0/dist/) direto da CDN
   do fornecedor para ser servido pela própria máquina — a aba funciona
   offline depois disso e sem CORS.
   ═══════════════════════════════════════════════════════════════ */

const router = require('express').Router()
const https = require('https')
const path = require('path')
const fs = require('fs')
const authMiddleware = require('../middlewares/authMiddleware')

const CDN = 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist'
const DEST = path.join(__dirname, '..', '..', 'public', 'vendor', 'imgly', '1.7.0', 'dist')
const ESSENCIAIS = [
    '/onnxruntime-web/ort-wasm-simd-threaded.jsep.wasm',
    '/onnxruntime-web/ort-wasm-simd-threaded.wasm',
    '/onnxruntime-web/ort-wasm-simd-threaded.jsep.mjs',
    '/onnxruntime-web/ort-wasm-simd-threaded.mjs',
    '/models/isnet_quint8'
]
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ERP-Avanzi' }

const progresso = {
    arquivoAtual: '',
    arquivosOk: 0,
    arquivosTotal: 0,
    bytes: 0,
    erro: null,
    pronto: false
}
let baixando = false

function atualizarProgresso(patch) { Object.assign(progresso, patch) }

function modeloPronto() {
    try {
        if (!fs.existsSync(path.join(DEST, 'resources.json'))) return false
        // assinatura de integridade: o maior chunk do isnet_quint8 existe
        const manifest = JSON.parse(fs.readFileSync(path.join(DEST, 'resources.json'), 'utf8'))
        const maiorChunk = manifest['/models/isnet_quint8'].chunks.reduce((a, b) => (a.offsets[1] - a.offsets[0]) < (b.offsets[1] - b.offsets[0]) ? a : b).name
        return fs.existsSync(path.join(DEST, maiorChunk))
    } catch { return false }
}

function httpGetText(url, timeoutMs = 60000) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: UA }, (res) => {
            if (res.statusCode !== 200) {
                res.resume()
                return reject(new Error(`HTTP ${res.statusCode}`))
            }
            let data = ''
            res.setEncoding('utf8')
            res.on('data', c => data += c)
            res.on('end', () => resolve(data))
        })
        req.on('error', reject)
        req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error('timeout')) })
    })
}

function httpDownload(url, destino, onBytes) {
    return new Promise((resolve, reject) => {
        const arquivo = fs.createWriteStream(destino + '.part')
        const req = https.get(url, { headers: UA }, (res) => {
            if (res.statusCode !== 200) {
                arquivo.close(() => { try { fs.unlinkSync(destino + '.part') } catch {} ; reject(new Error(`HTTP ${res.statusCode}`)) })
                return
            }
            res.on('data', (chunk) => {
                arquivo.write(chunk)
                if (onBytes) onBytes(chunk.length)
            })
            res.on('end', () => arquivo.close(() => { fs.renameSync(destino + '.part', destino); resolve() }))
            res.on('error', (e) => arquivo.close(() => { try { fs.unlinkSync(destino + '.part') } catch {}; reject(e) }))
        })
        req.on('error', (e) => arquivo.close(() => { try { fs.unlinkSync(destino + '.part') } catch {}; reject(e) }))
        req.setTimeout(120000, () => { req.destroy(); arquivo.close(() => { try { fs.unlinkSync(destino + '.part') } catch {}; reject(new Error('timeout no download')) }) })
    })
}

async function iniciarDownload() {
    if (baixando || modeloPronto()) {
        if (modeloPronto()) atualizarProgresso({ pronto: true, arquivoAtual: '' })
        return
    }
    baixando = true
    atualizarProgresso({ arquivoAtual: 'preparando manifesto…', arquivosOk: 0, arquivosTotal: 0, bytes: 0, erro: null, pronto: false })
    try {
        fs.mkdirSync(DEST, { recursive: true })

        // 1) manifesto do CDN
        const manifest = JSON.parse(await httpGetText(`${CDN}/resources.json`))
        const filtrado = {}
        for (const chave of ESSENCIAIS) {
            if (!manifest[chave]) throw new Error(`modelo esperado não encontrado no manifesto: ${chave}`)
            filtrado[chave] = manifest[chave]
        }

        // 2) lista todos os chunks a baixar
        const chunks = []
        for (const chave of ESSENCIAIS) for (const c of filtrado[chave].chunks) chunks.push(c)
        atualizarProgresso({ arquivoAtual: `baixando ${chunks.length} arquivos do modelo…`, arquivosTotal: chunks.length })

        // 3) salva o manifesto filtrado primeiro (só é lido após tudo terminar)
        fs.writeFileSync(path.join(DEST, 'resources.json'), JSON.stringify(filtrado))

        // 4) baixa cada chunk
        let bytes = 0
        for (let i = 0; i < chunks.length; i++) {
            const nome = chunks[i].name
            const destino = path.join(DEST, nome)
            if (fs.existsSync(destino)) { bytes += (chunks[i].offsets[1] - chunks[i].offsets[0]); atualizarProgresso({ arquivoAtual: '', arquivosOk: i + 1, bytes }); continue }
            atualizarProgresso({ arquivoAtual: nome })
            await httpDownload(`${CDN}/${nome}`, destino, (n) => { bytes += n; atualizarProgresso({ bytes }) })
            atualizarProgresso({ arquivosOk: i + 1, bytes })
        }

        atualizarProgresso({ arquivoAtual: '', erro: null, pronto: true })
    } catch (err) {
        console.error('[RemoverFundo] Falha ao baixar modelo de IA:', err)
        atualizarProgresso({ arquivoAtual: '', erro: err.message || String(err) })
    } finally {
        baixando = false
    }
}

router.get('/remover-fundo/status', authMiddleware, (req, res) => {
    res.json({ pronto: modeloPronto() || progresso.pronto, baixando, ...progresso })
})

router.post('/remover-fundo/baixar', authMiddleware, (req, res) => {
    if (modeloPronto()) return res.json({ ok: true, pronto: true })
    iniciarDownload()
    res.json({ ok: true, iniciado: true })
})

module.exports = router
