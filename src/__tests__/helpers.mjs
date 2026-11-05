import jwt from 'jsonwebtoken'
import mysql from 'mysql2/promise'

export function generateTestToken(overrides = {}) {
  const payload = { usuario: '__test__', cargo: 'administrador', ...overrides }
  return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret')
}

export async function getTestDb() {
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'supermercado',
    port: process.env.DB_PORT || 3399,
    timezone: '-03:00',
    waitForConnections: true,
    connectionLimit: 2
  })
}

export const TEST_USER = '__test__'

export function cleanupSql(pool) {
  return Promise.all([
    pool.query(`DELETE FROM produtos WHERE codigo LIKE '__test__%'`),
    pool.query(`DELETE FROM registros_placas WHERE usuario = '__test__'`),
    // Só apaga placas de teste — nunca as reais criadas recentemente
    pool.query(`DELETE FROM log_placas WHERE codigo LIKE '__test__%'`),
    pool.query(`DELETE FROM listas_precos WHERE nome = '__test__'`),
    pool.query(`DELETE FROM imagens_verificacao WHERE codigo LIKE '__test__%'`),
    pool.query(`DELETE FROM audit_logs WHERE usuario = '__test__'`),
  ])
}
