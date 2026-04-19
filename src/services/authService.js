const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const userRepository = require('../repositories/userRepository')

exports.login = async (usuario, senha) => {
    const user = await userRepository.findByUsuario(usuario)

    if (!user) {
        throw new Error('Usuário não encontrado')
    }

    const senhaValida = await bcrypt.compare(senha, user.senha)

    if (!senhaValida) {
        throw new Error('Senha inválida')
    }

    const token = jwt.sign(
        { id: user.id, usuario: user.usuario },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    )

    return {
        user: {
            id: user.id,
            nome: user.nome,
            usuario: user.usuario
        },
        token
    }
}