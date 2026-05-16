const express = require('express')
const routes = require('./routes')

const app = express()

app.use(express.json({ limit: '50mb' }))
app.use(routes)
app.use(express.static('public'))
module.exports = app