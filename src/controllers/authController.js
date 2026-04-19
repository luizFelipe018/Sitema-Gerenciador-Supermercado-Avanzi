const authService = require('../services/authService')

exports.login = async (req, res) => {
    try {
        const { usuario, senha } = req.body

        const result = await authService.login(usuario, senha)

        res.json(result)

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}