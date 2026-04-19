const bcrypt = require('bcryptjs')
const userRepository = require('../repositories/userRepository')

exports.create = async (nome, usuario, senha) => {

    // verifica se já existe usuário
    const usuarioExistente = await userRepository.findByUsuario(usuario)

    if (usuarioExistente) {
        throw new Error('Usuário já existe')
    }

    // 🔐 criptografa a senha
    const senhaHash = await bcrypt.hash(senha, 10)

    const newUser = await userRepository.create({
        nome,
        usuario,
        senha: senhaHash
    })

    return {
        id: newUser.id,
        nome: newUser.nome,
        usuario: newUser.usuario
    }
}