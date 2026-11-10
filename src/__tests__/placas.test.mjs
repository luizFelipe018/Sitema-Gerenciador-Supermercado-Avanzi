import { createRequire } from 'module'
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { generateTestToken, getTestDb, TEST_USER, cleanupSql } from './helpers.mjs'

const require = createRequire(import.meta.url)
const app = require('../app.js')

let db

beforeAll(async () => {
  db = await getTestDb()
  await cleanupSql(db)
})

afterAll(async () => {
  await cleanupSql(db)
  await db.end()
})

describe('POST /log-placas', () => {
  const token = generateTestToken()

  afterEach(async () => {
    await cleanupSql(db)
  })

  it('deve inserir registros e retornar IDs', async () => {
    const placas = [
      { descricao: 'Arroz', codigo: '__test__001', ean: '1234567890123', preco: 5.00, tipo_placa: 'pequena' },
      { descricao: 'Feijao', codigo: '__test__002', ean: null, preco: 8.00, tipo_placa: 'pequena' }
    ]

    const res = await request(app)
      .post('/log-placas')
      .set('Authorization', `Bearer ${token}`)
      .send(placas)

    expect(res.status).toBe(200)
    expect(res.body.inseridos).toBe(2)
    expect(res.body.ids).toBeInstanceOf(Array)
    expect(res.body.ids.length).toBe(2)

    const [rows] = await db.query('SELECT * FROM log_placas ORDER BY id DESC LIMIT 2')
    expect(rows.length).toBe(2)
    expect(rows[0].descricao).toBe('Feijao')
    expect(rows[1].descricao).toBe('Arroz')
  })

  it('deve rejeitar array vazio', async () => {
    const res = await request(app)
      .post('/log-placas')
      .set('Authorization', `Bearer ${token}`)
      .send([])

    expect(res.status).toBe(400)
  })

  it('deve rejeitar body que nao e array', async () => {
    const res = await request(app)
      .post('/log-placas')
      .set('Authorization', `Bearer ${token}`)
      .send({ descricao: 'teste' })

    expect(res.status).toBe(400)
  })
})

describe('POST /log-placas/imprimir', () => {
  const token = generateTestToken()

  afterEach(async () => {
    await cleanupSql(db)
  })

  it('deve marcar registros como impressos', async () => {
    const [ins] = await db.query(
      `INSERT INTO log_placas (descricao, codigo, ean, preco, tipo_placa, impressa) VALUES ?`,
      [[['Arroz','__test__001','123',5.00,'pequena',0], ['Feijao','__test__002',null,8.00,'pequena',0]]]
    )
    const ids = [ins.insertId, ins.insertId + 1]

    const res = await request(app)
      .post('/log-placas/imprimir')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids })

    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.atualizados).toBe(2)

    const [rows] = await db.query('SELECT impressa FROM log_placas WHERE id IN (?)', [ids])
    rows.forEach(r => expect(r.impressa).toBe(1))
  })
})

describe('POST /registros-placas', () => {
  const token = generateTestToken()

  afterEach(async () => {
    await cleanupSql(db)
  })

  it('deve salvar registros e auto-logar', async () => {
    const placas = [
      { descricao: 'Arroz', codigo: '__test__001', ean: '1234567890123', preco: 5.00, quantidade_kg_l: 0 },
      { descricao: 'Feijao', codigo: '__test__002', ean: null, preco: 8.00, quantidade_kg_l: 0 }
    ]

    const res = await request(app)
      .post('/registros-placas')
      .set('Authorization', `Bearer ${token}`)
      .send({ tipo: 'pequena', placas })

    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.total).toBe(2)
    expect(res.body.logIds).toBeInstanceOf(Array)
    expect(res.body.logIds.length).toBe(2)

    const [registros] = await db.query(
      'SELECT * FROM registros_placas WHERE usuario = ? AND tipo_placa = ? ORDER BY ordem ASC',
      ['__test__', 'pequena']
    )
    expect(registros.length).toBe(2)
    expect(registros[0].descricao).toBe('Arroz')
    expect(registros[1].descricao).toBe('Feijao')
  })

  it('deve sobrescrever registros do mesmo tipo', async () => {
    const p1 = [{ descricao: 'Arroz', codigo: '__test__001', ean: '1234567890123', preco: 5.00, quantidade_kg_l: 0 }]
    const p2 = [{ descricao: 'Leite', codigo: '__test__003', ean: '2345678901234', preco: 4.50, quantidade_kg_l: 0 }]

    await request(app)
      .post('/registros-placas')
      .set('Authorization', `Bearer ${token}`)
      .send({ tipo: 'pequena', placas: p1 })

    await request(app)
      .post('/registros-placas')
      .set('Authorization', `Bearer ${token}`)
      .send({ tipo: 'pequena', placas: p2 })

    const [restantes] = await db.query(
      'SELECT * FROM registros_placas WHERE usuario = ? AND tipo_placa = ?',
      ['__test__', 'pequena']
    )
    expect(restantes.length).toBe(1)
    expect(restantes[0].descricao).toBe('Leite')
  })

  it('deve aceitar array vazio (limpar)', async () => {
    const res = await request(app)
      .post('/registros-placas')
      .set('Authorization', `Bearer ${token}`)
      .send({ tipo: 'pequena', placas: [] })

    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.total).toBe(0)
  })
})

describe('GET /registros-placas', () => {
  const token = generateTestToken()

  beforeEach(async () => {
    await cleanupSql(db)
    await db.query(
      `INSERT INTO registros_placas (usuario, descricao, codigo, ean, preco, tipo_placa, ordem) VALUES ?`,
      [[
        ['__test__', 'Arroz', '__test__001', '123', 5.00, 'pequena', 0],
        ['__test__', 'Leite', '__test__003', '234', 4.50, 'media', 0]
      ]]
    )
  })

  afterAll(async () => {
    await cleanupSql(db)
  })

  it('deve listar registros do usuario', async () => {
    const res = await request(app)
      .get('/registros-placas')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(2)
  })

  it('deve filtrar por tipo', async () => {
    const res = await request(app)
      .get('/registros-placas?tipo=media')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.length).toBe(1)
    expect(res.body[0].tipo_placa).toBe('media')
  })
})

describe('DELETE /registros-placas/:id', () => {
  const token = generateTestToken()

  it('deve excluir um registro', async () => {
    const [ins] = await db.query(
      `INSERT INTO registros_placas (usuario, descricao, codigo, ean, preco, tipo_placa, ordem) VALUES (?,?,?,?,?,?,?)`,
      ['__test__', 'Excluir', '__test__999', null, 1.00, 'pequena', 0]
    )

    const res = await request(app)
      .delete(`/registros-placas/${ins.insertId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)

    const [rows] = await db.query('SELECT id FROM registros_placas WHERE id = ?', [ins.insertId])
    expect(rows.length).toBe(0)
  })
})

describe('DELETE /registros-placas/limpar/:tipo', () => {
  const token = generateTestToken()

  it('deve limpar registros do tipo', async () => {
    await db.query(
      `INSERT INTO registros_placas (usuario, descricao, codigo, ean, preco, tipo_placa, ordem) VALUES (?,?,?,?,?,?,?)`,
      ['__test__', 'Limpar', '__test__000', null, 1.00, 'media', 0]
    )

    const res = await request(app)
      .delete('/registros-placas/limpar/media')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)

    const [rows] = await db.query(
      'SELECT id FROM registros_placas WHERE usuario = ? AND tipo_placa = ?',
      ['__test__', 'media']
    )
    expect(rows.length).toBe(0)
  })
})
