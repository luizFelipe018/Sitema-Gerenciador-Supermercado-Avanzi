// @ts-check
/**
 * Parser de planilha de produtos (.xlsx) em Node.
 * Substitui a dependência de Python/openpyxl — funciona no app empacotado.
 * Mantém a mesma mapeação do script importar_produtos_xlsx.py.
 */

const XLSX = require('xlsx')

/** Converte valor de célula em decimal (aceita "1.234,56" e "1234.56") */
/** @param {any} val */
function toDecimal(val) {
    if (val === null || val === undefined || val === '') return 0
    if (typeof val === 'number') return isFinite(val) ? val : 0
    if (typeof val === 'boolean') return val ? 1 : 0
    let s = String(val).trim()
    if (!s || s === '-') return 0
    if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
    const n = Number(s)
    return isFinite(n) ? n : 0
}

/** Converte "dd/mm/aaaa" (ou Date) em "aaaa-mm-dd" */
/** @param {any} val */
function toDate(val) {
    if (!val || val === '0') return null
    if (val instanceof Date && !isNaN(val.getTime())) {
        const mm = String(val.getMonth() + 1).padStart(2, '0')
        const dd = String(val.getDate()).padStart(2, '0')
        return `${val.getFullYear()}-${mm}-${dd}`
    }
    const m = String(val).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (!m) return null
    const [, d, mes, ano] = m
    return `${ano}-${mes.padStart(2, '0')}-${d.padStart(2, '0')}`
}

/** Converte para 0/1 aceitando true/sim/s/1 */
/** @param {any} val */
function toBool(val) {
    if (!val) return 0
    let s
    if (typeof val === 'boolean') s = val ? 'true' : 'false'
    else s = String(val).trim().toLowerCase()
    return ['true', 'sim', 's', '1'].includes(s) ? 1 : 0
}

/** "1524 - AMBEV" -> "AMBEV" */
/** @param {any} val */
function limparMarca(val) {
    if (!val) return null
    const s = String(val).trim()
    const sep = s.indexOf(' - ')
    if (sep !== -1 && /^\d+$/.test(s.slice(0, sep).trim())) {
        return s.slice(sep + 3).trim()
    }
    return s
}

/** Texto da célula, sem nbsp e espaços extras */
/** @param {any} val */
function txt(val) {
    if (val === null || val === undefined) return null
    const s = String(val).replace(/\u00a0/g, ' ').trim()
    return s || null
}

/**
 * Lê um buffer .xlsx e devolve { total, produtos }.
 * @param {Buffer} buffer
 * @returns {{ total: number, produtos: any[] }}
 */
function parseProdutosXlsx(buffer) {
    const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true })
    const ws = wb.Sheets[wb.SheetNames[0]]
    if (!ws) throw new Error('Planilha sem abas')

    // Matriz de valores (blankrows:true preserva a numeração original das linhas)
    const linhas = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null, blankrows: true })

    // Detecta a linha de cabeçalho: a que contém "Código" (fallback: linha 3, 1-based)
    let headerIdx = -1
    for (let i = 0; i < Math.min(linhas.length, 12); i++) {
        const c0 = linhas[i] && linhas[i][0] != null ? String(linhas[i][0]).trim().toLowerCase() : ''
        if (c0 === 'codigo' || c0 === 'código' || c0 === 'cod') { headerIdx = i; break }
    }
    const DATA_START = headerIdx >= 0 ? headerIdx + 1 : 3

    const produtos = []
    for (let i = DATA_START; i < linhas.length; i++) {
        const row = linhas[i] || []
        const codigo = txt(row[0])
        if (!codigo || codigo === 'Código') continue

        produtos.push({
            codigo,
            descricao: txt(row[1]),
            ean: txt(row[2]),
            departamento: txt(row[3]),
            secao: txt(row[4]),
            grupo: txt(row[5]),
            subgrupo: txt(row[6]),
            codigo_secundario: txt(row[7]),
            familia: txt(row[8]),
            associado: txt(row[9]),
            status: txt(row[10]),
            composto: toBool(row[11]),
            ncm: txt(row[12]),
            trib_pis_cofins: txt(row[13]),
            exc_ipi: txt(row[14]),
            exc_icms: txt(row[15]),
            cest: txt(row[16]),
            classificacao_trib: txt(row[17]),
            data_ultima_entrada: toDate(row[18]),
            estoque_atual: 0,
            pmz: 0,
            custo: 0,
            preco_venda: 0,
            preco_oferta: 0,
            preco_venda_kg: 0,
            preco_oferta_kg: 0,
            validade: null,
            data_cadastro: null,
            data_alteracao: null,
            qtde_vendida_mes: 0,
            vendas_media: 0,
            participa_cotacao: 0,
            quantidade_kg_l: 0,
            descricao_kglt: null,
            marca: null,
            ultima_alteracao_preco: null,
            aceita_troca: 0
        })
    }

    return { total: produtos.length, produtos }
}

module.exports = { parseProdutosXlsx, toDecimal, toDate, toBool, limparMarca }
