// @ts-check
/** Middlewares de cargo — usados nas rotas sensíveis. */

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function somenteAdmin(req, res, next) {
    const cargo = req.user?.cargo || 'atendente'
    if (cargo !== 'administrador') {
        return res.status(403).json({ error: 'Acesso restrito a administradores' })
    }
    next()
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function somenteGestao(req, res, next) {
    const cargo = req.user?.cargo || 'atendente'
    if (cargo !== 'administrador' && cargo !== 'gerente') {
        return res.status(403).json({ error: 'Acesso restrito a gerentes e administradores' })
    }
    next()
}

module.exports = { somenteAdmin, somenteGestao }
