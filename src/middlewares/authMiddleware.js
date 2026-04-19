const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization']

    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' })
    }

    const token = authHeader.split(' ')[1] // formato: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Token mal formatado' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded // disponibiliza os dados do usuário na requisição
        next()
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado' })
    }
}
