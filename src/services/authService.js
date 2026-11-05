const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const userRepository = require('../repositories/userRepository')

exports.login = async (usuario, senha) => {
    const user = await userRepository.findByUsuario(usuario)

    if (!user) {
        throw new Error('Usuário não encontrado')
    }

    // Conta desativada pelo administrador não entra no sistema
    if (user.ativo === 0 || user.ativo === false) {
        throw new Error('Usuário desativado. Procure o administrador.')
    }

    const senhaValida = await bcrypt.compare(senha, user.senha)

    if (!senhaValida) {
        throw new Error('Senha inválida')
    }

    // Sessão válida por até 4 horas (máximo logado)
    const SESSION_HOURS = 4
    const token = jwt.sign(
        {
            id: user.id,
            usuario: user.usuario,
            nome: user.nome,
            cargo: user.cargo || 'atendente'
        },
        process.env.JWT_SECRET,
        { expiresIn: `${SESSION_HOURS}h` }
    )

    return {
        user: {
            id: user.id,
            nome: user.nome,
            usuario: user.usuario,
            cargo: user.cargo || 'atendente'
        },
        token,
        expiresIn: `${SESSION_HOURS}h`,
        expiresAt: Date.now() + SESSION_HOURS * 60 * 60 * 1000
    }
}
