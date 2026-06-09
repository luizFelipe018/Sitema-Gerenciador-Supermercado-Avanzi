const mysql = require('mysql2/promise')
const path  = require('path')

// Tenta carregar .env — funciona em dev mas pode não existir no build
try {
    require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') })
} catch {}

const db = mysql.createPool({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'supermercado',
    port:     process.env.DB_PORT     || 3399,
    timezone: '-03:00',
    waitForConnections: true,
    connectionLimit:    10,
})

module.exports = db