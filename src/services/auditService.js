// @ts-check
/**
 * Serviço de auditoria — registra quem fez o quê no sistema.
 *
 * Duas camadas de registro:
 *  1. `log_placas` recebe `usuario`/`usuario_id` — atribuição de cada placa criada.
 *  2. `audit_logs` — trilha de eventos do sistema (login, criação, impressão, exclusão…).
 */
const db = require('../config/database')

/** @typedef {import('express').Request} Request */

/** Ações auditadas (constantes para evitar erros de digitação) */
const ACOES = {
    LOGIN: 'login',
    LOGIN_FALHA: 'login_falha',
    LOGOUT: 'logout',
    CRIAR_PLACAS: 'criar_placas',
    SALVAR_PLACAS: 'salvar_placas',
    IMPRIMIR_PLACAS: 'imprimir_placas',
    EXCLUIR_PLACA: 'excluir_placa',
    LIMPAR_PLACAS: 'limpar_placas',
    IMPORTAR_PRODUTOS: 'importar_produtos',
    IMPORTAR_PLACAS: 'importar_placas',
    ZERAR_DASHBOARD: 'zerar_dashboard',
    CRIAR_USUARIO: 'criar_usuario',
    EDITAR_USUARIO: 'editar_usuario',
    EXCLUIR_USUARIO: 'excluir_usuario',
    ATIVAR_USUARIO: 'ativar_usuario',
    ATUALIZAR_CONFIG: 'atualizar_config',
    EXPORTAR_XLSX: 'exportar_xlsx'
}

/** Rótulos amigáveis para exibição */
const ROTULOS = {
    login: 'Entrou no sistema',
    login_falha: 'Tentativa de login falhou',
    logout: 'Saiu do sistema',
    criar_placas: 'Criou placas',
    salvar_placas: 'Salvou placas',
    imprimir_placas: 'Marcou placas como impressas',
    excluir_placa: 'Excluiu uma placa',
    limpar_placas: ' Limpou placas do tipo',
    importar_produtos: 'Importou produtos',
    importar_placas: 'Importou placas',
    zerar_dashboard: 'Zerou os dados do dashboard',
    criar_usuario: 'Cadastrou usuário',
    editar_usuario: 'Alterou usuário',
    excluir_usuario: 'Excluiu usuário',
    ativar_usuario: 'Ativou/desativou usuário',
    atualizar_config: 'Alterou configuração',
    exportar_xlsx: 'Exportou planilha'
}

/** Eventos de placas cujo detalhe pode ser completado pelo log_placas */
const ACOES_DE_PLACAS = new Set([ACOES.CRIAR_PLACAS, ACOES.SALVAR_PLACAS, ACOES.IMPORTAR_PLACAS])

let esquemaPronto = false

/**
 * Aplica as migrações de forma idempotente.
 * @returns {Promise<void>}
 */
async function garantirEsquema() {
    if (esquemaPronto) return
    try {
        // ── log_placas: quem gerou a placa ──
        await addColumnIfMissing('log_placas', 'usuario', 'VARCHAR(100) NULL')
        await addColumnIfMissing('log_placas', 'usuario_id', 'INT NULL')
        await addColumnIfMissing('log_placas', 'usuario_nome', 'VARCHAR(255) NULL')
        await addColumnIfMissing('log_placas', 'impressa_em', 'DATETIME NULL')

        // ── usuarios: controle de acesso ──
        await addColumnIfMissing('usuarios', 'ativo', 'TINYINT(1) NOT NULL DEFAULT 1')
        await addColumnIfMissing('usuarios', 'ultimo_login', 'DATETIME NULL')
        await addColumnIfMissing('usuarios', 'criado_em', 'DATETIME NULL DEFAULT CURRENT_TIMESTAMP')

        // Normaliza cargos inválidos/vazios (enum aceitou '' em cadastros antigos)
        await db.query("UPDATE usuarios SET cargo = 'atendente' WHERE cargo IS NULL OR cargo = '' OR cargo NOT IN ('administrador','gerente','atendente')")

        // ── trilha de auditoria ──
        await db.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id          INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id  INT NULL,
                usuario     VARCHAR(100) NOT NULL,
                nome        VARCHAR(255) NULL,
                cargo       VARCHAR(20) NULL,
                acao        VARCHAR(50) NOT NULL,
                entidade    VARCHAR(50) NULL,
                tipo_placa  VARCHAR(20) NULL,
                descricao   VARCHAR(255) NULL,
                quantidade  INT NULL,
                detalhes    TEXT NULL,
                ip          VARCHAR(45) NULL,
                criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_audit_criado (criado_em),
                INDEX idx_audit_usuario (usuario),
                INDEX idx_audit_acao (acao)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `)

        // Índice para ranking por usuário nas placas
        try {
            await db.query('CREATE INDEX idx_log_placas_usuario ON log_placas (usuario)')
        } catch {}

        esquemaPronto = true
    } catch (err) {
        console.error('[auditoria] falha ao preparar esquema:', /** @type {Error} */ (err).message)
    }
}

/**
 * @param {string} tabela
 * @param {string} coluna
 * @param {string} definicao
 */
async function addColumnIfMissing(tabela, coluna, definicao) {
    const [cols] = /** @type {any} */ (await db.query(`SHOW COLUMNS FROM \`${tabela}\` LIKE ?`, [coluna]))
    if (cols.length) return
    await db.query(`ALTER TABLE \`${tabela}\` ADD COLUMN \`${coluna}\` ${definicao}`)
}

/**
 * IP do cliente (considera proxy).
 * @param {Request} req
 */
function ipDe(req) {
    const fwd = req.headers['x-forwarded-for']
    if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim().slice(0, 45)
    return String(req.ip || req.socket?.remoteAddress || '').slice(0, 45)
}

/**
 * Registra um evento de auditoria a partir da requisição (usuário autenticado).
 * @param {Request} req
 * @param {string} acao
 * @param {{descricao?: string, entidade?: string, tipoPlaca?: string, quantidade?: number, detalhes?: any}} [opts]
 */
async function registrar(req, acao, opts = {}) {
    try {
        await garantirEsquema()
        const u = req.user || {}
        await db.query(
            `INSERT INTO audit_logs
                (usuario_id, usuario, nome, cargo, acao, entidade, tipo_placa, descricao, quantidade, detalhes, ip)
             VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [
                u.id ?? null,
                String(u.usuario || 'desconhecido'),
                u.nome ?? null,
                u.cargo ?? null,
                acao,
                opts.entidade ?? null,
                opts.tipoPlaca ?? null,
                opts.descricao ? String(opts.descricao).slice(0, 255) : null,
                opts.quantidade ?? null,
                opts.detalhes ? JSON.stringify(opts.detalhes).slice(0, 20000) : null,
                ipDe(req)
            ]
        )
    } catch (err) {
        console.error('[auditoria] erro ao registrar:', /** @type {Error} */ (err).message)
    }
}

/**
 * Registra um evento sem usuário autenticado (ex.: tentativa de login).
 * @param {{usuario: string, usuarioId?: number, acao: string, nome?: string, cargo?: string, descricao?: string, ip?: string, detalhes?: any}} dados
 */
async function registrarEvento(dados) {
    try {
        await garantirEsquema()
        await db.query(
            `INSERT INTO audit_logs
                (usuario_id, usuario, nome, cargo, acao, descricao, detalhes, ip)
             VALUES (?,?,?,?,?,?,?,?)`,
            [
                dados.usuarioId ?? null,
                String(dados.usuario || 'desconhecido'),
                dados.nome ?? null,
                dados.cargo ?? null,
                dados.acao,
                dados.descricao ? String(dados.descricao).slice(0, 255) : null,
                dados.detalhes ? JSON.stringify(dados.detalhes).slice(0, 20000) : null,
                dados.ip ? String(dados.ip).slice(0, 45) : null
            ]
        )
    } catch (err) {
        console.error('[auditoria] erro ao registrar evento:', /** @type {Error} */ (err).message)
    }
}

/**
 * Eventos antigos não tinham os produtos no detalhe. Completa com o log_placas
 * (pelos IDs salvos ou pela janela de tempo do evento) sem perder os detalhes
 * que já existem. Eventos novos já nascem com `detalhes.itens` preenchido.
 * @param {any[]} rows
 * @param {boolean} [detalhado] inclui impressão, tipo e horário de cada placa
 */
async function completarItensPlacas(rows, detalhado = false) {
    for (const r of rows) {
        if (!ACOES_DE_PLACAS.has(r.acao)) continue
        try {
            let det = null
            try { det = typeof r.detalhes === 'string' ? JSON.parse(r.detalhes) : r.detalhes } catch {}
            const atuais = Array.isArray(det?.itens) ? det.itens : []
            if (atuais.length && (!detalhado || 'impressa' in (atuais[0] || {}))) continue

            const colunas = detalhado
                ? 'id, descricao, codigo, ean, preco, tipo_placa, criado_em, impressa, impressa_em'
                : 'descricao, codigo, ean, preco'

            let logs = []
            const ids = Array.isArray(det?.ids) ? det.ids : []
            const qtd = Number(r.quantidade) || 0
            const limiteItens = Math.min(Math.max(qtd || 50, 1), 50)

            if (ids.length) {
                const [encontrados] = /** @type {any} */ (await db.query(
                    `SELECT ${colunas} FROM log_placas WHERE id IN (?) ORDER BY id DESC LIMIT 50`,
                    [ids]
                ))
                logs = encontrados
            }
            // log_placas e audit_logs são gravados no mesmo instante (mesmo segundo),
            // então casar pelo horário exato evita misturar itens de eventos vizinhos.
            if (!logs.length && qtd > 0 && r.criado_em) {
                const [encontrados] = /** @type {any} */ (await db.query(
                    `SELECT ${colunas} FROM log_placas
                      WHERE usuario = ? AND criado_em = ?
                      ORDER BY id DESC LIMIT ?`,
                    [r.usuario, r.criado_em, limiteItens]
                ))
                logs = encontrados
            }
            if (logs.length) {
                r.detalhes = JSON.stringify({
                    ...(det || {}),
                    itens: logs.map(/** @param {any} l */ (l) => ({
                        descricao: l.descricao,
                        codigo: l.codigo,
                        ean: l.ean,
                        preco: l.preco,
                        ...(detalhado ? {
                            id: l.id,
                            tipo_placa: l.tipo_placa,
                            criado_em: l.criado_em,
                            impressa: l.impressa,
                            impressa_em: l.impressa_em
                        } : {})
                    }))
                })
            }
        } catch { /* detalhe é informativo: não pode derrubar a consulta */ }
    }
}

/**
 * Busca logs com filtros e paginação.
 * @param {{de?: string, ate?: string, usuario?: string, acao?: string, busca?: string, limite?: number, offset?: number}} filtros
 */
async function buscarLogs(filtros = {}) {
    await garantirEsquema()
    const where = []
    const params = []

    if (filtros.de)       { where.push('DATE(criado_em) >= ?'); params.push(filtros.de) }
    if (filtros.ate)      { where.push('DATE(criado_em) <= ?'); params.push(filtros.ate) }
    if (filtros.usuario)  { where.push('usuario = ?');       params.push(filtros.usuario) }
    if (filtros.acao)     { where.push('acao = ?');          params.push(filtros.acao) }
    if (filtros.busca) {
        where.push('(descricao LIKE ? OR usuario LIKE ? OR tipo_placa LIKE ?)')
        params.push(`%${filtros.busca}%`, `%${filtros.busca}%`, `%${filtros.busca}%`)
    }

    const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const limite = Math.min(Number(filtros.limite) || 100, 1000)
    const offset = Math.max(Number(filtros.offset) || 0, 0)

    const [rows] = /** @type {any} */ (await db.query(
        `SELECT * FROM audit_logs ${clause} ORDER BY criado_em DESC, id DESC LIMIT ? OFFSET ?`,
        [...params, limite, offset]
    ))

    await completarItensPlacas(rows)

    const [totais] = /** @type {any} */ (await db.query(`SELECT COUNT(*) AS total FROM audit_logs ${clause}`, params))

    return { rows, total: Number(totais[0]?.total || 0) }
}

/**
 * Evento único com o detalhe completo das placas (para a página de detalhe).
 * @param {string|number} id
 */
async function buscarDetalheEvento(id) {
    await garantirEsquema()
    const [rows] = /** @type {any} */ (await db.query('SELECT * FROM audit_logs WHERE id = ?', [id]))
    if (!rows.length) return null
    const evento = rows[0]
    if (ACOES_DE_PLACAS.has(evento.acao)) {
        await completarItensPlacas([evento], true)
    }
    return evento
}

/**
 * Resumo agregado por usuário e por ação no período.
 * @param {{de?: string, ate?: string}} filtros
 */
async function resumo(filtros = {}) {
    await garantirEsquema()
    const where = []
    const params = []

    if (filtros.de)  { where.push('DATE(criado_em) >= ?'); params.push(filtros.de) }
    if (filtros.ate) { where.push('DATE(criado_em) <= ?'); params.push(filtros.ate) }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const [porUsuario] = /** @type {any} */ (await db.query(`
        SELECT usuario, nome,
               SUBSTRING_INDEX(GROUP_CONCAT(cargo ORDER BY id DESC), ',', 1) AS cargo,
               COUNT(*) AS eventos,
               SUM(CASE WHEN acao IN ('criar_placas','salvar_placas','importar_placas') THEN quantidade ELSE 0 END) AS placas,
               MAX(criado_em) AS ultimo_acesso
        FROM audit_logs ${clause}
        GROUP BY usuario, nome
        ORDER BY placas DESC, eventos DESC
        LIMIT 50
    `, params))

    const [porAcao] = /** @type {any} */ (await db.query(`
        SELECT acao, COUNT(*) AS total, SUM(COALESCE(quantidade,0)) AS placas
        FROM audit_logs ${clause}
        GROUP BY acao
        ORDER BY total DESC
    `, params))

    const [porDia] = /** @type {any} */ (await db.query(`
        SELECT DATE(criado_em) AS dia, COUNT(*) AS eventos,
               SUM(CASE WHEN acao IN ('criar_placas','salvar_placas','importar_placas') THEN quantidade ELSE 0 END) AS placas
        FROM audit_logs ${clause}
        GROUP BY dia
        ORDER BY dia DESC
        LIMIT 30
    `, params))

    const [placasPorUsuario] = /** @type {any} */ (await db.query(`
        SELECT usuario, usuario_nome, tipo_placa, COUNT(*) AS total,
               SUM(impressa = 1) AS impressas, MAX(criado_em) AS ultima
        FROM log_placas
        WHERE usuario IS NOT NULL ${filtros.de ? 'AND DATE(criado_em) >= ?' : ''} ${filtros.ate ? 'AND DATE(criado_em) <= ?' : ''}
        GROUP BY usuario, usuario_nome, tipo_placa
        ORDER BY total DESC
        LIMIT 100
    `, [filtros.de, filtros.ate].filter(Boolean)))

    return { porUsuario, porAcao, porDia, placasPorUsuario }
}

module.exports = { ACOES, ROTULOS, garantirEsquema, registrar, registrarEvento, buscarLogs, buscarDetalheEvento, resumo }
