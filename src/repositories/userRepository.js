const db = require('../config/database')
exports.findByUsuario = async (usuario) => {
    const [rows] = await db.query(
        'SELECT * FROM usuarios WHERE usuario = ?',
        [usuario]
    )

    return rows[0]
}

exports.create = async ({ nome, usuario, senha, cargo }) => {
    const [result] = await db.query(
        'INSERT INTO usuarios (nome, usuario, senha, cargo) VALUES (?, ?, ?, ?)',
        [nome, usuario, senha, cargo || 'atendente']
    )

    return {
        id: result.insertId,
        nome,
        usuario,
        cargo: cargo || 'atendente'
    }
}