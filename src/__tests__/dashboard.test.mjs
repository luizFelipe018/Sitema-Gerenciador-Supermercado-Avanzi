import { createRequire } from 'module'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { generateTestToken, getTestDb, cleanupSql } from './helpers.mjs'

const require = createRequire(import.meta.url)
const app = require('../app.js')

let db

beforeAll(async () => {
  db = await getTestDb()
  await cleanupSql(db)

  await db.query(
    `INSERT INTO produtos (codigo, descricao, ean, departamento, descricao_departamento, preco_venda) VALUES ?`,
    [[
      ['__test__001', 'Arroz',    '1234567890123', 1, 'Graos',      5.00],
      ['__test__002', 'Feijao',   null,            1, 'Graos',      8.00],
      ['__test__003', 'Leite',    '2345678901234', 2, 'Laticinios', 4.50],
      ['__test__004', 'Queijo',   null,            2, 'Laticinios', 25.00],
      ['__test__005', 'PaO',      '3456789012345', 3, 'Padaria',    0.50],
      ['__test__006', 'Manteiga', '',              2, 'Laticinios', 12.00]
    ]]
  )

  await db.query(
    `INSERT INTO imagens_verificacao (codigo, status) VALUES (?,?)`,
    ['__test__002', 'sem_imagem']
  )

  await db.query(
    `INSERT INTO registros_placas (usuario, descricao, codigo, ean, preco, tipo_placa, ordem) VALUES ?`,
    [[
      ['__test__', 'Arroz',  '__test__001', '1234567890123', 5.00, 'grande4',  0],
      ['__test__', 'Feijao', '__test__002', null,            8.00, 'grande4',  1],
      ['__test__', 'Leite',  '__test__003', '2345678901234', 4.50, 'grande', 0]
    ]]
  )

  await db.query(
    `INSERT INTO log_placas (descricao, codigo, ean, preco, tipo_placa, impressa) VALUES ?`,
    [[
      ['Arroz',  '__test__001', '1234567890123', 5.00, 'grande4',  0],
      ['Feijao', '__test__002', null,            8.00, 'grande4',  1],
      ['Leite',  '__test__003', '2345678901234', 4.50, 'grande', 0]
    ]]
  )

  await db.query(`INSERT INTO listas_precos (nome) VALUES ('__test__')`)
})

afterAll(async () => {
  await cleanupSql(db)
  await db.end()
})

function expectNumberOrString(val) {
  expect(val == null).toBe(false)
}

describe('GET /dashboard', () => {
  const token = generateTestToken()

  it('deve retornar 200 com todas as metricas', async () => {
    const res = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('totalProdutos')
    expect(res.body).toHaveProperty('semEan')
    expect(res.body).toHaveProperty('semImagem')
    expect(res.body).toHaveProperty('porDepto')
    expect(res.body).toHaveProperty('placasMes')
    expect(res.body).toHaveProperty('impressasMes')
    expect(res.body).toHaveProperty('placasDias')
    expect(res.body).toHaveProperty('topProdutos')
    expect(res.body).toHaveProperty('listasMes')
  })

  it('deve retornar valores nao nulos', async () => {
    const res = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`)

    expectNumberOrString(res.body.totalProdutos)
    expectNumberOrString(res.body.semEan)
    expectNumberOrString(res.body.listasMes)
    expectNumberOrString(res.body.placasMes.total)
    expectNumberOrString(res.body.impressasMes.impressas)
    expectNumberOrString(res.body.impressasMes.geradas)
  })

  it('deve contar produtos corretamente', async () => {
    const res = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`)

    expect(Number(res.body.totalProdutos)).toBeGreaterThanOrEqual(6)
    expect(Number(res.body.semEan)).toBeGreaterThanOrEqual(3)
    expect(Number(res.body.listasMes)).toBeGreaterThanOrEqual(1)
  })

  it('deve agrupar produtos por departamento', async () => {
    const res = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`)

    expect(res.body.porDepto).toBeInstanceOf(Array)
    expect(res.body.porDepto.length).toBeGreaterThanOrEqual(2)
    for (const depto of res.body.porDepto) {
      expect(depto).toHaveProperty('depto')
      expect(depto).toHaveProperty('total')
      expectNumberOrString(depto.total)
    }
  })

  it('deve retornar metricas de placas do mes', async () => {
    const res = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`)

    expect(res.body.placasMes).toHaveProperty('grande4')
    expect(res.body.placasMes).toHaveProperty('grande')
    expect(res.body.placasMes).toHaveProperty('grande')
    expect(res.body.placasMes).toHaveProperty('total')
    expect(Number(res.body.placasMes.total)).toBeGreaterThanOrEqual(3)
  })

  it('deve retornar metricas de impressao do mes', async () => {
    const res = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`)

    expect(res.body.impressasMes).toHaveProperty('impressas')
    expect(res.body.impressasMes).toHaveProperty('geradas')
    expectNumberOrString(res.body.impressasMes.impressas)
    expectNumberOrString(res.body.impressasMes.geradas)
  })

  it('deve retornar top produtos do mes', async () => {
    const res = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`)

    expect(res.body.topProdutos).toBeInstanceOf(Array)
    for (const p of res.body.topProdutos) {
      expect(p).toHaveProperty('descricao')
      expect(p).toHaveProperty('tipo_placa')
      expect(p).toHaveProperty('total')
    }
  })

  it('deve retornar placas dos ultimos 30 dias', async () => {
    const res = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`)

    expect(res.body.placasDias).toBeInstanceOf(Array)
    expect(res.body.placasDias.length).toBeGreaterThanOrEqual(1)
    expect(res.body.placasDias[0]).toHaveProperty('dia')
    expect(res.body.placasDias[0]).toHaveProperty('total')
    expectNumberOrString(res.body.placasDias[0].total)
  })

  it('deve retornar 401 sem token', async () => {
    const res = await request(app).get('/dashboard')
    expect(res.status).toBe(401)
  })

  it('deve retornar 401 com token invalido', async () => {
    const res = await request(app)
      .get('/dashboard')
      .set('Authorization', 'Bearer token-invalido')
    expect(res.status).toBe(401)
  })
})
