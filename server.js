require('dotenv').config()

const app = require('./src/app')
const pool = require('./src/config/database')

async function startServer() {
  try {
    const connection = await pool.getConnection()
    console.log('Banco conectado 🔥')
    connection.release()

    app.listen(3000, () => {
      console.log('Servidor rodando na porta 3000')
    })

  } catch (err) {
    console.error('Erro ao conectar no banco:', err)
  }
}

startServer()