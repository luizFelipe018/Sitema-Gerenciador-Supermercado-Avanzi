import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

export default async function () {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const root = path.join(__dirname, '..', '..')

  try { dotenv.config({ path: path.join(root, '.env') }) } catch {}

  process.env.DB_NAME = process.env.DB_NAME || 'supermercado'
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'
}
