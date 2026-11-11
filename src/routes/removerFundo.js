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

// ── REMOÇÃO DE FUNDO EM LOTE (Python + rembg) ──
// Processa MUITAS imagens de uma vez via Python (muito mais rápido que WASM no navegador).
// O status é consultado por polling (mesma estrutura do /remover-fundo/status).
const progressoNativo = {
    ativo: false,
    pasta: '',
    destino: '',
    total: 0,
    processados: 0,
    sucesso: 0,
    puladas: 0,
    erros: 0,
    atual: '',
    concluido: false,
    erro: null,
    logs: []
}
const EXTS_IMAGEM = /\.(png|jpe?g|webp|bmp)$/i

function logNativo(texto, ok) {
    progressoNativo.logs.push({ texto, ok, ts: Date.now() })
    if (progressoNativo.logs.length > 120) progressoNativo.logs = progressoNativo.logs.slice(-80)
}

function contarImagens(pasta) {
    let n = 0
    try {
        const itens = fs.readdirSync(pasta, { withFileTypes: true })
        for (const item of itens) {
            if (item.isFile() && EXTS_IMAGEM.test(item.name)) n++
        }
    } catch {}
    return n
}

async function executarPythonRemoverFundo(src, dst) {
    return new Promise((resolve, reject) => {
        const { execFile } = require('child_process')
        const pythonExe = path.join(__dirname, '..', '..', 'python312', 'python.exe')
        const script = path.join(__dirname, '..', '..', 'tools', 'remover-fundo.py')
        if (!fs.existsSync(pythonExe) || !fs.existsSync(script)) return reject(new Error('Python/rembg ou script não encontrados em python312/tools'))
        execFile(pythonExe, [script, src, dst], {
            timeout: 5 * 60 * 1000,  // 5 min por foto (generoso)
            maxBuffer: 1024 * 1024
        }, (err, stdout, stderr) => {
            if (err) return reject(new Error(stderr?.trim() || err.message))
            resolve()
        })
    })
}

async function iniciarProcessarPasta(pasta) {
    if (progressoNativo.ativo) return
    progressoNativo.ativo = true
    progressoNativo.pasta = pasta
    progressoNativo.destino = path.join(pasta, 'sem_fundo')
    progressoNativo.total = 0
    progressoNativo.processados = 0
    progressoNativo.sucesso = 0
    progressoNativo.puladas = 0
    progressoNativo.erros = 0
    progressoNativo.atual = ''
    progressoNativo.concluido = false
    progressoNativo.erro = null
    progressoNativo.logs.length = 0
    logNativo('Iniciando processamento na pasta ' + pasta, true)
    try {
        fs.mkdirSync(progressoNativo.destino, { recursive: true })
        const itens = []
        const entradas = fs.readdirSync(pasta, { withFileTypes: true })
        for (const ent of entradas) {
            if (ent.isFile() && EXTS_IMAGEM.test(ent.name)) itens.push(ent.name)
        }
        progressoNativo.total = itens.length
        logNativo('Total de imagens: ' + itens.length, true)

        for (let i = 0; i < itens.length; i++) {
            const nome = itens[i]
            const src = path.join(pasta, nome)
            const dst = path.join(progressoNativo.destino, nome.replace(/\.[^.]+$/, '') + '.png')
            progressoNativo.atual = nome
            // pular se já existe no destino
            if (fs.existsSync(dst)) {
                progressoNativo.puladas++
                progressoNativo.processados++
                logNativo('pulada (já existe): ' + nome, true)
                continue
            }
            try {
                await executarPythonRemoverFundo(src, dst)
                progressoNativo.sucesso++
                logNativo('OK: ' + nome, true)
            } catch (e) {
                progressoNativo.erros++
                logNativo('ERRO ' + nome + ': ' + (e.message || e), false)
            }
            progressoNativo.processados++
        }
        progressoNativo.atual = ''
        progressoNativo.concluido = true
        logNativo('Concluído: ' + progressoNativo.sucesso + ' ok · ' + progressoNativo.puladas + ' puladas · ' + progressoNativo.erros + ' erros', true)
    } catch (e) {
        progressoNativo.erro = e.message || String(e)
        logNativo('Falha geral: ' + progressoNativo.erro, false)
    } finally {
        progressoNativo.ativo = false
    }
}

router.get('/remover-fundo/progresso-nativo', authMiddleware, (req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    res.json({ ...progressoNativo, logs: progressoNativo.logs.slice(-60) })
})

router.post('/remover-fundo/processar-pasta', authMiddleware, (req, res) => {
    const pasta = (req.body && typeof req.body.pasta === 'string' && req.body.pasta.trim()) || 'D:\\imagens site'
    const pastaAbs = path.resolve(pasta)
    if (!fs.existsSync(pastaAbs) || !fs.statSync(pastaAbs).isDirectory()) {
        return res.status(400).json({ error: 'Pasta não existe ou não é um diretório: ' + pastaAbs })
    }
    const total = contarImagens(pastaAbs)
    if (!total) {
        return res.status(400).json({ error: 'Nenhuma imagem encontrada em ' + pastaAbs })
    }
    if (progressoNativo.ativo) {
        return res.json({ ok: true, jaEmAndamento: true, total })
    }
    iniciarProcessarPasta(pastaAbs)
    res.json({ ok: true, iniciado: true, total, destino: path.join(pastaAbs, 'sem_fundo') })
})

router.post('/remover-fundo/cancelar-pasta', authMiddleware, (req, res) => {
    progressoNativo.ativo = false
    res.json({ ok: true, cancelado: true })
})

router.get('/remover-fundo/status', authMiddleware, (req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    res.json({ ...progresso, pronto: modeloPronto() || progresso.pronto, baixando })
})

router.post('/remover-fundo/baixar', authMiddleware, (req, res) => {
    if (modeloPronto()) return res.json({ ok: true, pronto: true })
    iniciarDownload()
    res.json({ ok: true, iniciado: true })
})

module.exports = router
