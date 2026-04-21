const bcrypt = require('bcryptjs')
const userRepository = require('../repositories/userRepository')

exports.create = async (nome, usuario, senha, cargo = 'atendente') => {

    // verifica se já existe usuário
    const usuarioExistente = await userRepository.findByUsuario(usuario)

    if (usuarioExistente) {
        throw new Error('Usuário já existe')
    }

    // Valida cargo
    const cargosValidos = ['administrador', 'gerente', 'atendente']
    if (!cargosValidos.includes(cargo)) {
        cargo = 'atendente'
    }

    // 🔐 criptografa a senha
    const senhaHash = await bcrypt.hash(senha, 10)

    const newUser = await userRepository.create({
        nome,
        usuario,
        senha: senhaHash,
        cargo
    })

    return {
        id: newUser.id,
        nome: newUser.nome,
        usuario: newUser.usuario,
        cargo: newUser.cargo
    }
}