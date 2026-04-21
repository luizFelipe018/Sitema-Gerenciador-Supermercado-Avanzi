const userService = require('../services/userService')

exports.create = async (req, res) => {
    try {
        const { nome, usuario, senha, cargo } = req.body

        const user = await userService.create(nome, usuario, senha, cargo)

        res.status(201).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}