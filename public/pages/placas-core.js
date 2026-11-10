function coreCriarEstado(salvas, banco, pagina, porPagina, clicada, salvando, dragIdx) {
    return { salvas, banco, pagina, porPagina, clicada, salvando, dragIdx }
}

function coreExcluirPlaca(state) {
    const idx = state.salvas.indexOf(state.clicada)
    if (idx > -1) state.salvas.splice(idx, 1)
}

function coreDuplicarPlaca(state) {
    const clone = { ...state.clicada, id_unico: Date.now() + Math.random() }
    const idx = state.salvas.indexOf(state.clicada)
    state.salvas.splice(idx + 1, 0, clone)
}

function coreAbrirBuscaNome(suffix) {
    const modal = document.getElementById('modal-busca' + suffix)
    const input = document.getElementById('input-busca-nome' + suffix)
    const tbody = document.querySelector('#tabela-busca' + suffix + ' tbody')
    if (modal) modal.style.display = 'flex'
    if (input) { input.value = ''; input.focus() }
    if (tbody) tbody.innerHTML = ''
}

function coreExtrairKgLt(desc) {
    if (!desc) return 0
    const m = desc.match(/(\d+[.,]?\d*)\s*(KG|G|L|ML)/)
    if (!m) return 0
    const val = parseFloat(m[1].replace(',', '.'))
    if (isNaN(val) || val <= 0) return 0
    const unid = m[2]
    if (unid === 'KG' || unid === 'L') return val
    if (unid === 'G' || unid === 'ML') return val / 1000
    return 0
}

function coreDetectarUnidade(p) {
    const semEan = !p.ean || String(p.ean).trim() === ''
    const mUni = (p.descricao || '').match(/(\d+[.,]?\d*)\s*(L|ML|KG|G)\b|\b(KG|L)\b/i)
    if (mUni) {
        const mUnit = mUni[2] || mUni[3]
        return (mUnit === 'L' || mUnit === 'ML') ? 'LT' : 'KG'
    }
    const raw = (p.descricao_kglt || '').toUpperCase()
    if (raw === 'UNIDADE') return 'UN'
    if (raw === 'LITRO' || raw === 'LITROS' || raw === 'LT') return 'LT'
    if (raw === 'KG' || raw === 'KILO' || raw === 'QUILO' || raw === 'G') return 'KG'
    return semEan ? 'KG' : 'UN'
}

function coreFormatarPreco(preco) {
    return 'R$ ' + parseFloat(preco).toFixed(2).replace('.', ',')
}

function coreParsePreco(raw) {
    return Math.round(parseFloat(raw.replace(',', '.')) * 100) / 100
}

function coreNomeArte(descricao, marca) {
    if (!marca) return descricao || ''
    const idx = descricao.toUpperCase().indexOf(marca.toUpperCase())
    if (idx === -1) return descricao || ''
    return descricao.slice(0, idx).trim()
}

function coreMarcaArte(descricao, marca) {
    if (!marca) return descricao || ''
    const idx = descricao.toUpperCase().indexOf(marca.toUpperCase())
    if (idx === -1) return descricao || ''
    return descricao.slice(idx).trim()
}

function corePrintFolha(conteudo, css, opts) {
    const w = window.open('', '_blank', 'width=800,height=600')
    if (!w) { alert('Permita pop-ups para imprimir.'); return }
    w.document.write(`
        <html><head>
            <style>${css}</style>
            <style>@page { margin:0; size:${opts?.paperSize || 'A4 portrait'}; }
            body { margin:0; padding:0; display:flex; flex-wrap:wrap; }
            .folha,.folha-media,.folha-grande,.folha-pequena { page-break-after:always; break-inside:avoid; }</style>
        </head><body>${conteudo}</body></html>
    `)
    w.document.close()
    setTimeout(() => { w.focus(); w.print(); w.close() }, 300)
}

async function coreRegistrarImpressao() {
    try {
        const ids = window._ultimasPlacasGeradas || []
        if (ids.length) {
            await fetch(API+'/log-placas/imprimir', {
                method: 'POST', headers: authHeaders(),
                body: JSON.stringify({ ids })
            })
        }
    } catch (e) {
        console.warn('Erro ao registrar impressao:', e)
    }
}

// ── Persistência "sempre salvo": espelho local à prova de falhas ──────────
// As placas ficam gravadas em 2 lugares:
//   1. servidor (/registros-placas) — fonte de verdade compartilhada
//   2. localStorage (cópia local por usuário+tipo) — usada para reexibir a
//      lista instantaneamente e como salva-vidas quando o servidor falha ou
//      volta vazio. Assim, trocar de página NUNCA apaga as placas.
function coreUsuarioId() {
    return typeof getUsuario === 'function' ? getUsuario() : (localStorage.getItem('usuario') || 'default')
}
function coreCacheChave(tipo) {
    return 'placas-cache-v1:' + coreUsuarioId() + ':' + tipo
}
function coreCachePendenteChave(tipo) {
    return 'placas-pendente-v1:' + coreUsuarioId() + ':' + tipo
}
function coreCacheSalvar(tipo, placas) {
    try { localStorage.setItem(coreCacheChave(tipo), JSON.stringify(placas)) }
    catch (e) { console.warn('Cache local de placas indisponível:', e) }
}
function coreCacheLer(tipo) {
    try {
        const raw = localStorage.getItem(coreCacheChave(tipo))
        if (!raw) return null
        const obj = JSON.parse(raw)
        if (Array.isArray(obj)) return obj
        if (obj && Array.isArray(obj.placas)) return obj.placas
        return null
    } catch (e) { return null }
}
// Marca o tipo como "não sincronizado": usado quando o último salvar no
// servidor falhou, para o próximo carregamento dar prioridade à cópia local.
function coreCachePendente(tipo, valor) {
    const chave = coreCachePendenteChave(tipo)
    try {
        if (valor === undefined) return localStorage.getItem(chave) === '1'
        if (valor) localStorage.setItem(chave, '1')
        else localStorage.removeItem(chave)
    } catch (e) { return false }
}
function coreParseConfig(str) {
    if (!str) return null
    try { return JSON.parse(str) } catch (e) { return null }
}

// Carrega placas do servidor com prioridade segura:
//   pendente (último salvar falhou) → cópia local é a mais nova
//   servidor com dados             → fonte de verdade
//   servidor vazio + cache         → cache (nunca deixa a tela vazia)
//   servidor fora do ar            → cache
async function coreCarregarPlacas(tipo, normalizar) {
    const cache = coreCacheLer(tipo)
    const pendente = coreCachePendente(tipo)
    let servidor = null
    let origem = 'server'
    try {
        const res = await fetch(API + '/registros-placas?tipo=' + encodeURIComponent(tipo), { headers: authHeaders() })
        const data = await res.json()
        servidor = (res.ok && Array.isArray(data)) ? data : null
        if (!Array.isArray(data) || !res.ok) origem = 'resposta-invalida'
    } catch (e) {
        origem = 'offline'
    }

    let dados
    if (pendente && cache && cache.length) {
        dados = cache
        origem = 'pendente'
    } else if (servidor && servidor.length) {
        dados = servidor
        origem = 'server'
    } else if (servidor && servidor.length === 0) {
        if (cache && cache.length) { dados = cache; origem = 'cache-servidor-vazio' }
        else { dados = servidor; origem = 'server' }
    } else if (cache && cache.length) {
        dados = cache
        if (origem === 'server') origem = 'cache-resposta-invalida'
    } else {
        dados = null
    }

    // .filter(Boolean) descarta itens nulos/inválidos (ex.: cache antigo corrompido)
    const placas = Array.isArray(dados) ? dados.map(normalizar).filter(p => p) : []
    coreCacheSalvar(tipo, placas)
    return { placas, origem }
}

async function coreSalvar(state, opts) {
    if (state.salvando) return
    state.salvando = true
    const tipo = opts?.tipo
    try {
        const body = opts?.mapBody
            ? { tipo, placas: state.salvas.map(opts.mapBody) }
            : { tipo, placas: state.salvas }
        coreCacheSalvar(tipo, body.placas)
        const res = await fetch(API+'/registros-placas', {
            method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Erro ao salvar')
        coreCachePendente(tipo, false)
        if (data.logIds?.length) {
            if (!window._ultimasPlacasGeradas) window._ultimasPlacasGeradas = []
            window._ultimasPlacasGeradas.push(...data.logIds)
        }
    } catch (e) {
        console.error('Erro ao salvar placas:', e)
        coreCachePendente(tipo, true)
        alert('Erro ao salvar no servidor: ' + e.message +
            '\n\nSuas placas continuam salvas neste computador e serão reenviadas automaticamente quando o servidor voltar.')
    } finally {
        state.salvando = false
    }
}

function coreMudarPagina(state, v) {
    const total = Math.ceil(state.salvas.length / state.porPagina) || 1
    return Math.max(0, Math.min((state.pagina ?? 0) + v, total - 1))
}

// -- Pre�o do site (lojasuperavanzi.com.br) --
const PRECO_SITE_KEY = '' + 'placas_preco_site'

function corePrecoSiteAtivo() {
    try { return localStorage.getItem(PRECO_SITE_KEY) === '1' } catch (e) { return false }
}

function coreSalvarPrecoSiteAtivo(v) {
    try { localStorage.setItem(PRECO_SITE_KEY, v ? '1' : '0') } catch (e) { /* sem armazenamento */ }
}

/* Busca o preco do produto no site pelo codigo/EAN (SKU == codigo do ERP) e
   preenche o input. Usa o preco promocional quando a promocao esta ativa.
   Retorna true se conseguiu preencher. */
async function coreAplicarPrecoSite(codigo, inputId) {
    const input = document.getElementById(inputId)
    if (!input || !codigo) return false
    try {
        const res = await fetch(API + '/precos-site/buscar?codigo=' + encodeURIComponent(codigo), { headers: authHeaders() })
        if (!res.ok) return false
        const data = await res.json()
        const promo = data.promotion === true && Number(data.promotionalPrice) > 0
        const preco = promo ? Number(data.promotionalPrice) : Number(data.price)
        if (!preco || !(preco > 0)) return false
        input.value = preco.toFixed(2).replace('.', ',')
        input.style.borderColor = 'var(--ok)'
        setTimeout(() => { input.style.borderColor = '' }, 1500)
        return true
    } catch (e) {
        return false
    }
}

/* Liga o checkbox "Preco do site" da aba: persiste a escolha e preenche o
   preco ao sair do campo de codigo (e ao ativar, se ja houver codigo digitado). */
function coreVincularPrecoSite(chkId, labelId, eanInputId, precoInputId) {
    const chk = document.getElementById(chkId)
    const label = document.getElementById(labelId)
    const eanInput = document.getElementById(eanInputId)
    if (!chk || !eanInput) return

    const aplicarEstado = (v) => {
        chk.checked = v
        if (label) label.classList.toggle('is-on', v)
    }
    aplicarEstado(corePrecoSiteAtivo())

    chk.addEventListener('change', () => {
        coreSalvarPrecoSiteAtivo(chk.checked)
        aplicarEstado(chk.checked)
        if (chk.checked) {
            const codigo = eanInput.value.trim()
            if (codigo) coreAplicarPrecoSite(codigo, precoInputId)
        }
    })

    eanInput.addEventListener('blur', () => {
        if (!corePrecoSiteAtivo()) return
        const codigo = eanInput.value.trim()
        if (codigo && !document.getElementById(precoInputId).value.trim()) {
            coreAplicarPrecoSite(codigo, precoInputId)
        }
    })
}

/* Aplica UMA predefinição em TODAS as placas da fila e a salva como padrão do
   modelo (as próximas placas já nascem com ela). Fonte, em ordem de prioridade:
   a placa selecionada com ajustes; senão, a 1ª placa da fila com ajustes;
   senão, o padrão já salvo do modelo no localStorage.
   Retorna a quantidade de placas afetadas (0 = nada para aplicar). */
function coreAplicarPresetEmTodas(placas, tipo, selecionada) {
    let fontePreset = null
    if (selecionada && selecionada._fs && Object.keys(selecionada._fs).length) {
        fontePreset = selecionada._fs
    } else {
        const comAjuste = (placas || []).find(p => p && p._fs && Object.keys(p._fs).length)
        if (comAjuste) fontePreset = comAjuste._fs
        else fontePreset = coreLerPresetPadrao(tipo)
    }
    if (!fontePreset) return 0
    const modelo = JSON.parse(JSON.stringify(fontePreset))
    let aplicadas = 0
    ;(placas || []).forEach(p => {
        if (!p) return
        p._fs = JSON.parse(JSON.stringify(modelo))
        aplicadas++
    })
    // passa a ser o padrão das próximas placas do modelo
    coreSalvarPresetPadrao(tipo, modelo)
    return aplicadas
}
