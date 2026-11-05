const authService = require('../services/authService')
const auditService = require('../services/auditService')

exports.login = async (req, res) => {
    const { usuario, senha } = req.body
    const ip = req.ip || req.socket?.remoteAddress || ''

    try {
        const result = await authService.login(usuario, senha)

        // Registro de auditoria: entrada no sistema
        await auditService.registrarEvento({
            usuario: result.user.usuario,
            usuarioId: result.user.id,
            nome: result.user.nome,
            cargo: result.user.cargo,
            acao: auditService.ACOES.LOGIN,
            descricao: 'Entrou no sistema',
            ip
        })

        // Marca último acesso
        try {
            const db = require('../config/database')
            await db.query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?', [result.user.id])
        } catch {}

        res.json(result)

    } catch (error) {
        // Tentativa de login falhou — fica registrada para controle
        await auditService.registrarEvento({
            usuario: String(usuario || 'desconhecido'),
            acao: auditService.ACOES.LOGIN_FALHA,
            descricao: `Falha ao entrar: ${error.message}`,
            ip
        })
        res.status(400).json({ error: error.message })
    }
}
