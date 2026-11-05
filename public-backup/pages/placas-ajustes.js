/* ═══════════════════════════════════════════════════════════════
   PREDEFINIÇÃO DE TEXTOS POR PLACA
   O ajuste de fonte/posição é feito no próprio clique no texto da
   placa (popup de +/- e arraste). O menu de contexto (botão direito)
   tem "Salvar predefinição" para gravar esses ajustes na placa.

   Cada placa guarda seus próprios tamanhos em `p._fs`, que é salvo no
   campo `config` da tabela registros_placas — assim a predefinição
   acompanha a placa e volta exatamente como foi definida.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Chave do localStorage do preset padrão de um modelo de placa.
 * @param {string} tipo
 */
function coreChavePresetPadrao(tipo) {
    return 'presetPadraoPlacas:' + tipo
}

/** Lê o preset padrão do modelo (usado nas placas novas). */
function coreLerPresetPadrao(tipo) {
    try {
        const bruto = localStorage.getItem(coreChavePresetPadrao(tipo))
        return bruto ? JSON.parse(bruto) : null
    } catch { return null }
}

/** Salva (ou remove, se vazio) o preset padrão do modelo. */
function coreSalvarPresetPadrao(tipo, fs) {
    try {
        if (!fs || !Object.keys(fs).length) {
            localStorage.removeItem(coreChavePresetPadrao(tipo))
        } else {
            localStorage.setItem(coreChavePresetPadrao(tipo), JSON.stringify(fs))
        }
    } catch {}
}

/**
 * Aplica o preset padrão a uma placa recém-criada.
 * Ajustes já existentes na placa têm prioridade.
 * @param {any} placa
 * @param {string} tipo
 */
function coreAplicarPresetPadrao(placa, tipo) {
    const padrao = coreLerPresetPadrao(tipo)
    if (!padrao || !placa) return placa
    if (!placa._fs) placa._fs = {}
    Object.keys(padrao).forEach(k => {
        if (placa._fs[k] === undefined) placa._fs[k] = padrao[k]
    })
    return placa
}
