require('dotenv').config()

const os = require('os')
const app = require('./src/app')
const pool = require('./src/config/database')

function ipsDaRede() {
    const ips = []
    Object.values(os.networkInterfaces()).forEach(interfaces => {
        ;(interfaces || []).forEach(i => {
            if (i.family === 'IPv4' && !i.internal && ips.indexOf(i.address) === -1) ips.push(i.address)
        })
    })
    return ips
}

async function startServer() {
    const PORT = process.env.PORT || 3000
    // 0.0.0.0 expõe o ERP na rede local (celular/tablet na mesma Wi-Fi).
    // HOST permite restringir a localhost se precisar, via .env.
    const HOST = process.env.HOST || '0.0.0.0'

    app.listen(PORT, HOST, () => {
        console.log(`Servidor rodando na porta ${PORT} (${HOST})`)
        const links = ipsDaRede().map(ip => `http://${ip}:${PORT}`)
        if (links.length) console.log('Acesso pelo celular: ' + links.join('  |  '))
    })

    try {
        const connection = await pool.getConnection()
        console.log('Banco conectado 🔥')
        connection.release()
    } catch (err) {
        console.error('MySQL não disponível:', err.message)
        console.log('O servidor está rodando, mas o banco de dados não está acessível.')
    }
}

startServer()
