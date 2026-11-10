// @ts-check
const express = require('express')
const path = require('path')

/** @type {import('express').Express} */
const app = express()

// Permite o Electron (file://) falar com a API via http://localhost:3000
// e navegadores de outras origens — sem isso o webSecurity precisa ficar desativado.
// COOP/COEP (apenas em HTML) habilita contexto cross-origin isolated —
// desbloqueia SharedArrayBuffer para o WASM usar TODAS as threads (3-5x mais rápido).
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
})

// COOP/COEP somente para arquivos HTML — mantém imagens/CDNs externos funcionando normalmente.
// 'credentialless' é aceito por Chromium moderno (Electron) e não exige CORP dos recursos.
// usa req.originalUrl porque req.path pode ser vazio com arquivos estáticos em Express 5
app.use((req, res, next) => {
    const url = (req.originalUrl || req.url || '').split('?')[0]
    if (url === '/' || url.endsWith('.html')) {
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
        res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless')
    }
    next()
})

app.use(express.json({ limit: '50mb' }))

// Prepara a estrutura de auditoria (colunas + tabela de logs) antes das rotas
require('./services/auditService').garantirEsquema()

app.use(require('./routes/auth'))
app.use(require('./routes/auditoria'))
app.use(require('./routes/images'))
app.use(require('./routes/configuracoes'))
app.use(require('./routes/cardapio'))
app.use(require('./routes/placas'))
app.use(require('./routes/listas'))
app.use(require('./routes/utilitarios'))
app.use(require('./routes/importar'))
app.use(require('./routes/dashboard'))
app.use(require('./routes/admin'))
app.use(require('./routes/database'))
app.use(require('./routes/arte'))
app.use(require('./routes/imagensSite'))
app.use(require('./routes/precosSite'))
app.use(require('./routes/removerFundo'))
app.use('/marcas', require('./routes/marcas'))

app.use(express.static(path.join(__dirname, '..', 'public')))

module.exports = app
