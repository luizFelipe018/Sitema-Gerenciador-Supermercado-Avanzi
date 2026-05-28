const express = require('express')
const path = require('path')

const app = express()

app.use(express.json({ limit: '50mb' }))

app.use(require('./routes/auth'))
app.use(require('./routes/images'))
app.use(require('./routes/configuracoes'))
app.use(require('./routes/cardapio'))
app.use(require('./routes/placas'))
app.use(require('./routes/listas'))
app.use(require('./routes/utilitarios'))
app.use(require('./routes/importar'))
app.use(require('./routes/dashboard'))
app.use(require('./routes/admin'))

app.use(express.static(path.join(__dirname, '..', 'public')))
module.exports = app
