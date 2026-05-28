require('dotenv').config()

const app = require('./src/app')
const pool = require('./src/config/database')

async function startServer() {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
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