const db = require('../config/database')

exports.findAll = async ({ busca, limit, offset } = {}) => {
    let query = 'SELECT * FROM produtos'
    const params = []

    if (busca) {
        query += ` WHERE codigo LIKE ? OR descricao LIKE ? OR ean LIKE ? OR marca LIKE ? OR descricao_departamento LIKE ?`
        const like = `%${busca}%`
        params.push(like, like, like, like, like)
    }

    query += ' ORDER BY codigo ASC'

    if (limit) {
        query += ' LIMIT ? OFFSET ?'
        params.push(limit, offset ?? 0)
    }

    const [rows] = await db.query(query, params)
    return rows
}

exports.count = async (busca) => {
    let query = 'SELECT COUNT(*) as total FROM produtos'
    const params = []

    if (busca) {
        query += ` WHERE codigo LIKE ? OR descricao LIKE ? OR ean LIKE ? OR marca LIKE ? OR descricao_departamento LIKE ?`
        const like = `%${busca}%`
        params.push(like, like, like, like, like)
    }

    const [[{ total }]] = await db.query(query, params)
    return total
}

exports.findByCodigo = async (codigo) => {
    const [rows] = await db.query('SELECT * FROM produtos WHERE codigo = ?', [codigo])
    return rows[0]
}

exports.save = async (data) => {
    const {
        codigo, descricao, ean,
        descricao_departamento, departamento, secao, grupo,
        preco_venda, quantidade_kg_l, descricao_kglt, marca
    } = data

    await db.query(
        `INSERT INTO produtos 
        (codigo, descricao, ean, descricao_departamento, departamento, secao, grupo, preco_venda, quantidade_kg_l, descricao_kglt, marca) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [codigo, descricao, ean, descricao_departamento, departamento, secao, grupo, preco_venda, quantidade_kg_l, descricao_kglt, marca]
    )

    return data
}

exports.update = async (codigo, data) => {
    const {
        descricao, ean, descricao_departamento, departamento,
        secao, grupo, preco_venda, quantidade_kg_l, descricao_kglt, marca
    } = data

    await db.query(
        `UPDATE produtos SET 
        descricao = ?, ean = ?, descricao_departamento = ?, departamento = ?,
        secao = ?, grupo = ?, preco_venda = ?, quantidade_kg_l = ?, descricao_kglt = ?, marca = ?
        WHERE codigo = ?`,
        [descricao, ean, descricao_departamento, departamento, secao, grupo, preco_venda, quantidade_kg_l, descricao_kglt, marca, codigo]
    )

    return { codigo, ...data }
}

exports.remove = async (codigo) => {
    await db.query('DELETE FROM produtos WHERE codigo = ?', [codigo])
}