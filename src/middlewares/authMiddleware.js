// @ts-check
const jwt = require('jsonwebtoken')

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization']

    if (!authHeader) {
        res.status(401).json({ error: 'Token não fornecido' })
        return
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
        res.status(401).json({ error: 'Token mal formatado' })
        return
    }

    try {
        const secret = /** @type {string} */ (process.env.JWT_SECRET)
        const decoded = /** @type {any} */ (jwt.verify(token, secret))
        // Limite máximo de sessão: 4 horas (também vale para tokens antigos de 8h)
        const MAX_SESSION_SECONDS = 4 * 60 * 60
        if (decoded && typeof decoded.iat === 'number') {
            const now = Math.floor(Date.now() / 1000)
            if (now - decoded.iat > MAX_SESSION_SECONDS) {
                res.status(401).json({ error: 'Sessão expirada (limite de 4 horas). Faça login novamente.' })
                return
            }
        }
        req.user = /** @type {import('../types/index').JwtUserPayload} */ (decoded)
        next()
    } catch (err) {
        res.status(401).json({ error: 'Token inválido ou expirado' })
    }
}
