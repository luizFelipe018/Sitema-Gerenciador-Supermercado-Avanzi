let listaPrecos = JSON.parse(localStorage.getItem('listaPrecos')) || []
let bancoProdutos = []
let filtroAtivo = 'Todos'

async function carregarListaPrecos() {
    setActive('btn-lista-precos')
    setConteudo(`
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">

            <!-- Área de cole em bloco -->
            <div class="mb-4">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                    Cole o bloco de produtos aqui
                </label>
                <textarea id="lp-bloco" rows="6" placeholder="7896839921219 - VELOTROL TOYS TICO TICO FANI REF2121 - 10,22 - LOJA 2&#10;7896839921110 - VELOTROL TOYS TICO TICO POPO REF2111 - 15,90 - LOJA 1&#10;7897449702441 - CJ MARLUX KEKA CACAROLA 5PCS - 89,90"
                    class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 font-mono resize-none"></textarea>
                <div class="flex gap-3 mt-2 items-center">
                    <button id="lp-btn-processar-bloco" class="px-5 py-2 text-white text-sm font-semibold rounded-lg" style="background:#b51515;">
                        ✅ Processar Bloco
                    </button>
                    <p id="lp-erro" class="text-xs text-red-500 min-h-[16px]"></p>
                </div>
                <div id="lp-log-erros" style="display:none;" class="mt-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-600">
                    <strong>⚠️ EANs não encontrados no banco:</strong>
                    <ul id="lp-lista-erros" class="mt-1 pl-4 list-disc"></ul>
                </div>
            </div>

            <!-- Adicionar manualmente 1 produto -->
            <details class="border border-gray-100 rounded-lg">
                <summary class="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-50 rounded-lg">
                    ➕ Adicionar produto manualmente
                </summary>
                <div class="px-4 pb-4 pt-3 flex gap-3 flex-wrap items-end border-t border-gray-100">
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">EAN / Código</label>
                        <input type="text" id="lp-ean" autocomplete="off"
                            class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-44 focus:outline-none focus:border-red-400">
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preço (R$)</label>
                        <input type="number" id="lp-preco" step="0.01"
                            class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:border-red-400">
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Loja</label>
                        <select id="lp-loja" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white">
                            <option value="Geral">Geral</option>
                            <option value="Loja 1">Loja 1</option>
                            <option value="Loja 2">Loja 2</option>
                        </select>
                    </div>
                    <button id="lp-btn-add" class="px-4 py-2 text-white text-sm font-semibold rounded-lg" style="background:#28a745;">
                        Adicionar
                    </button>
                    <button id="lp-btn-busca" class="px-4 py-2 text-white text-sm font-semibold rounded-lg" style="background:#007bff;">
                        🔍 Buscar Nome
                    </button>
                </div>
            </details>

            <!-- Filtros e ações -->
            <div class="flex gap-3 items-center mt-4 pt-4 border-t border-gray-100 flex-wrap">
                <div class="flex gap-2">
                    <button id="lp-filtro-todos"  class="px-3 py-1.5 text-xs font-semibold rounded-lg border">Todos</button>
                    <button id="lp-filtro-geral"  class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">Geral</button>
                    <button id="lp-filtro-loja1"  class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">Loja 1</button>
                    <button id="lp-filtro-loja2"  class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">Loja 2</button>
                </div>
                <button id="lp-btn-imprimir" class="px-4 py-2 text-white text-sm font-semibold rounded-lg" style="background:#4a4a4a;">
                    🖨️ Imprimir
                </button>
                <button id="lp-btn-limpar" class="px-4 py-2 text-white text-sm font-semibold rounded-lg ml-auto" style="background:#dc3545;">
                    🗑 Limpar Tudo
                </button>
            </div>
        </div>

        <!-- Tabela -->
        <div id="lp-tabela-wrapper" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <p class="text-center text-gray-400 text-sm py-10">Nenhum produto adicionado ainda.</p>
        </div>

        <!-- Modal busca por nome -->
        <div id="lp-modal-busca" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#fff; border:2px solid #b51515; border-radius:10px; z-index:3000; padding:25px; box-shadow:0 0 50px rgba(0,0,0,0.4); width:620px;">
            <button id="lp-fechar-busca" style="float:right; border:none; background:none; font-size:20px; cursor:pointer;">×</button>
            <h3 class="font-semibold text-gray-700 mb-3">Buscar Produto por Nome</h3>
            <input type="text" id="lp-input-busca" placeholder="Digite o nome e pressione ENTER"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 mb-2">
            <div style="max-height:300px; overflow-y:auto;">
                <table id="lp-tabela-busca" style="width:100%; border-collapse:collapse; font-size:13px;">
                    <thead><tr style="background:#f8f9fa;">
                        <th class="px-3 py-2 text-left">Código</th>
                        <th class="px-3 py-2 text-left">Descrição</th>
                        <th class="px-3 py-2 text-right">Preço banco</th>
                    </tr></thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    `, 'Lista de Preços')

    // Carrega banco se necessário
    if (bancoProdutos.length === 0) {
        try {
            const res = await fetch('http://localhost:3000/produtos', { headers: authHeaders() })
            const data = await res.json()
            if (Array.isArray(data)) bancoProdutos = data
        } catch { console.error('Erro ao carregar banco') }
    }

    renderListaPrecos()
    vincularEventosLista()
    atualizarFiltrosBotoes()
}

// ── PARSE DO BLOCO ────────────────────────────────────
// Aceita os formatos:
//   EAN - DESCRIÇÃO - PREÇO - LOJA
//   EAN - DESCRIÇÃO - PREÇO
//   EAN	PREÇO	LOJA  (separado por tab)
function parseLinha(linha) {
    linha = linha.trim()
    if (!linha) return null

    // Tenta separar por " - " (formato principal)
    const partesDash = linha.split(/\s+-\s+/)
    if (partesDash.length >= 3) {
        const ean = partesDash[0].trim()
        // Preço pode ser a 3ª ou última coluna antes da loja
        const precoStr = partesDash[partesDash.length >= 4 ? 2 : partesDash.length - 1]
        const lojaStr  = partesDash.length >= 4 ? partesDash[3] : ''
        const preco = parseFloat(precoStr.replace('R$', '').replace(/\s/g, '').replace(',', '.').trim())
        const loja  = parseLoja(lojaStr)
        if (!isNaN(preco)) return { ean, preco, loja }
    }

    // Fallback: separado por tab
    const partsTab = linha.split(/\t/)
    if (partsTab.length >= 2) {
        const ean   = partsTab[0].trim()
        const preco = parseFloat(partsTab[1].replace('R$', '').replace(/\s/g, '').replace(',', '.').trim())
        const loja  = parseLoja(partsTab[2] || '')
        if (!isNaN(preco)) return { ean, preco, loja }
    }

    return null
}

function parseLoja(str) {
    const s = str.trim().toUpperCase()
    if (s.includes('1')) return 'Loja 1'
    if (s.includes('2')) return 'Loja 2'
    return 'Geral'
}

function processarBloco() {
    const texto = document.getElementById('lp-bloco').value.trim()
    if (!texto) return

    const logEl    = document.getElementById('lp-log-erros')
    const listaEl  = document.getElementById('lp-lista-erros')
    const erroEl   = document.getElementById('lp-erro')
    listaEl.innerHTML = ''
    logEl.style.display = 'none'
    erroEl.textContent = ''

    const linhas = texto.split(/\r?\n/)
    const erros  = []
    let contador = 0

    linhas.forEach(linha => {
        const parsed = parseLinha(linha)
        if (!parsed) return

        const prod = bancoProdutos.find(p => p.ean === parsed.ean) ||
                     bancoProdutos.find(p => p.codigo === parsed.ean)

        if (prod) {
            listaPrecos.push({ ...prod, preco: parsed.preco, loja: parsed.loja })
            contador++
        } else {
            erros.push(parsed.ean)
        }
    })

    if (erros.length) {
        logEl.style.display = 'block'
        erros.forEach(e => { const li = document.createElement('li'); li.textContent = e; listaEl.appendChild(li) })
    }

    if (contador > 0) {
        salvarLista()
        renderListaPrecos()
        document.getElementById('lp-bloco').value = ''
        erroEl.textContent = ''
        if (!erros.length) erroEl.style.color = '#16a34a'
        erroEl.textContent = `${contador} produto(s) adicionado(s) com sucesso.`
        setTimeout(() => { if (erroEl) erroEl.textContent = '' }, 3000)
    } else {
        erroEl.style.color = '#dc2626'
        erroEl.textContent = 'Nenhum produto reconhecido. Verifique o formato.'
    }
}

// ── RENDERIZAÇÃO ──────────────────────────────────────
function calcPrecoUn(preco, produto) {
    const qtd = parseFloat(produto.quantidade_kg_l)
    if (!qtd || qtd <= 0) return null
    return (preco / qtd).toFixed(2).replace('.', ',')
}

function unidade(produto) {
    const d = produto.descricao_kglt?.toUpperCase()
    if (d === 'UNIDADE') return 'UN'
    if (d === 'QUILO')   return 'KG'
    if (d === 'LITRO')   return 'LT'
    return d || ''
}


function copiarCelula(el, texto) {
    if (!texto || texto === '—') return
    try {
        // Método 1: execCommand (funciona em Electron com file://)
        const ta = document.createElement('textarea')
        ta.value = texto
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
    } catch (e) {
        // Método 2: clipboard API como fallback
        navigator.clipboard?.writeText(texto)
    }
    const orig = el.style.background
    el.style.background = '#d1fae5'
    el.title = 'Copiado!'
    setTimeout(() => { el.style.background = orig; el.title = 'Clique para copiar' }, 800)
}
function salvarLista() {
    localStorage.setItem('listaPrecos', JSON.stringify(listaPrecos))
}

function atualizarFiltrosBotoes() {
    const btnMap = {
        'Todos':  'lp-filtro-todos',
        'Geral':  'lp-filtro-geral',
        'Loja 1': 'lp-filtro-loja1',
        'Loja 2': 'lp-filtro-loja2'
    }
    Object.entries(btnMap).forEach(([key, id]) => {
        const btn = document.getElementById(id)
        if (!btn) return
        if (key === filtroAtivo) {
            btn.style.background = '#1a1a2e'; btn.style.color = '#fff'; btn.style.borderColor = '#1a1a2e'
        } else {
            btn.style.background = ''; btn.style.color = '#6b7280'; btn.style.borderColor = '#e5e7eb'
        }
    })
}

function renderListaPrecos(filtro) {
    if (filtro) filtroAtivo = filtro
    atualizarFiltrosBotoes()

    const wrapper = document.getElementById('lp-tabela-wrapper')
    if (!wrapper) return

    const lista = filtroAtivo === 'Todos'
        ? listaPrecos
        : listaPrecos.filter(p => p.loja === filtroAtivo)

    if (!lista.length) {
        wrapper.innerHTML = `<p class="text-center text-gray-400 text-sm py-10">Nenhum produto${filtroAtivo !== 'Todos' ? ' para ' + filtroAtivo : ' adicionado'}.</p>`
        return
    }

    // Monta HTML sem inline handlers — dados guardados em data-attributes
    const tbody = lista.map((p, i) => {
        const precoUn  = calcPrecoUn(p.preco, p)
        const uni      = unidade(p)
        const eanVal     = p.ean || p.codigo || ''
        const precoVal   = parseFloat(p.preco).toFixed(2).replace('.', ',')
        const precoUnVal = precoUn ? precoUn : ''
        const lojaBadge = p.loja === 'Loja 1'
            ? `<span class="px-2 py-0.5 rounded-full text-xs font-semibold" style="background:#dbeafe;color:#1d4ed8;">Loja 1</span>`
            : p.loja === 'Loja 2'
            ? `<span class="px-2 py-0.5 rounded-full text-xs font-semibold" style="background:#fce7f3;color:#9d174d;">Loja 2</span>`
            : `<span class="px-2 py-0.5 rounded-full text-xs font-semibold" style="background:#f3f4f6;color:#6b7280;">Geral</span>`
        const realIdx = listaPrecos.indexOf(p)
        return `<tr class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-2.5 text-gray-400 text-xs">${i + 1}</td>
            <td class="px-4 py-2.5 font-mono text-gray-500 text-xs copiavel" data-copy="${eanVal}" title="Clique para copiar" style="cursor:pointer;">${eanVal}</td>
            <td class="px-4 py-2.5 text-gray-800 font-medium copiavel" data-copy="${p.descricao}" title="Clique para copiar" style="cursor:pointer;">${p.descricao}</td>
            <td class="px-4 py-2.5 text-right font-semibold text-gray-800 copiavel" data-copy="${precoVal}" title="Clique para copiar" style="cursor:pointer;">R$ ${precoVal}</td>
            <td class="px-4 py-2.5 text-right text-gray-600 copiavel" data-copy="${precoUnVal}" title="Clique para copiar" style="cursor:pointer;">
                ${precoUn ? `R$ ${precoUn} / ${uni}` : '<span class="text-gray-300">—</span>'}
            </td>
            <td class="px-4 py-2.5 text-center">${lojaBadge}</td>
            <td class="px-4 py-2.5 text-center">
                <button class="btn-remover text-xs text-red-400 hover:text-red-600 font-semibold" data-idx="${realIdx}">Remover</button>
            </td>
        </tr>`
    }).join('')

    wrapper.innerHTML = `
        <table class="w-full text-sm">
            <thead>
                <tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th class="px-4 py-3 text-left font-semibold w-8">#</th>
                    <th class="px-4 py-3 text-left font-semibold">EAN</th>
                    <th class="px-4 py-3 text-left font-semibold">Descrição</th>
                    <th class="px-4 py-3 text-right font-semibold">Preço</th>
                    <th class="px-4 py-3 text-right font-semibold">Preço / UN·KG·LT</th>
                    <th class="px-4 py-3 text-center font-semibold">Loja</th>
                    <th class="px-4 py-3 text-center font-semibold">Ações</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">${tbody}</tbody>
        </table>
        <p class="text-xs text-gray-300 px-4 py-3">${lista.length} produto(s)</p>
    `

    // Delegação de eventos — sem inline handlers
    wrapper.querySelectorAll('.copiavel').forEach(td => {
        td.addEventListener('click', () => copiarCelula(td, td.getAttribute('data-copy')))
    })
    wrapper.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', () => removerItemLista(parseInt(btn.getAttribute('data-idx'))))
    })
}

function removerItemLista(idx) {
    listaPrecos.splice(idx, 1)
    salvarLista()
    renderListaPrecos()
}

// ── EVENTOS ───────────────────────────────────────────
function vincularEventosLista() {
    // Processar bloco
    document.getElementById('lp-btn-processar-bloco')?.addEventListener('click', processarBloco)

    // Ctrl+Enter no textarea também processa
    document.getElementById('lp-bloco')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); processarBloco() }
    })

    // Adicionar manual
    const eanInput   = document.getElementById('lp-ean')
    const precoInput = document.getElementById('lp-preco')
    const lojaSelect = document.getElementById('lp-loja')

    eanInput?.addEventListener('keyup', (e) => {
        if (eanInput.value.length >= 13 || e.key === 'Enter') {
            e.preventDefault(); precoInput?.focus(); precoInput?.select()
        }
    })
    precoInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); lojaSelect?.focus() }
    })
    lojaSelect?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); document.getElementById('lp-btn-add')?.click() }
    })

    document.getElementById('lp-btn-add')?.addEventListener('click', () => {
        const ean   = eanInput.value.trim()
        const preco = parseFloat(precoInput.value)
        const loja  = lojaSelect.value
        const prod  = bancoProdutos.find(p => p.ean === ean) || bancoProdutos.find(p => p.codigo === ean)
        const erroEl = document.getElementById('lp-erro')
        if (!prod) { erroEl.textContent = 'Produto não encontrado.'; return }
        if (isNaN(preco) || preco <= 0) { erroEl.textContent = 'Preço inválido.'; return }
        erroEl.textContent = ''
        listaPrecos.push({ ...prod, preco, loja })
        salvarLista(); renderListaPrecos()
        eanInput.value = ''; precoInput.value = ''; lojaSelect.value = 'Geral'
        eanInput.focus()
    })

    // Filtros
    document.getElementById('lp-filtro-todos')?.addEventListener('click',  () => renderListaPrecos('Todos'))
    document.getElementById('lp-filtro-geral')?.addEventListener('click',  () => renderListaPrecos('Geral'))
    document.getElementById('lp-filtro-loja1')?.addEventListener('click',  () => renderListaPrecos('Loja 1'))
    document.getElementById('lp-filtro-loja2')?.addEventListener('click',  () => renderListaPrecos('Loja 2'))

    // Imprimir
    document.getElementById('lp-btn-imprimir')?.addEventListener('click', imprimirListaPrecos)

    // Limpar
    document.getElementById('lp-btn-limpar')?.addEventListener('click', () => {
        if (confirm('Limpar toda a lista de preços?')) {
            listaPrecos = []; salvarLista(); renderListaPrecos()
        }
    })

    // Busca por nome
    document.getElementById('lp-btn-busca')?.addEventListener('click', () => {
        document.getElementById('lp-modal-busca').style.display = 'block'
        document.getElementById('lp-input-busca').value = ''
        document.querySelector('#lp-tabela-busca tbody').innerHTML = ''
        document.getElementById('lp-input-busca').focus()
    })
    document.getElementById('lp-fechar-busca')?.addEventListener('click', () => {
        document.getElementById('lp-modal-busca').style.display = 'none'
    })
    document.getElementById('lp-input-busca')?.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return
        const termo = e.target.value.trim().toUpperCase()
        const resultados = bancoProdutos.filter(p =>
            p.descricao?.toUpperCase().includes(termo) ||
            p.codigo?.includes(termo) || p.ean?.includes(termo)
        ).slice(0, 50)
        const tbody = document.querySelector('#lp-tabela-busca tbody')
        if (!resultados.length) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:10px;color:#999;">Nenhum produto encontrado</td></tr>'
            return
        }
        tbody.innerHTML = resultados.map((p, i) => `
            <tr data-index="${i}" style="cursor:pointer; border-bottom:1px solid #f0f0f0;"
                onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background=''">
                <td style="padding:8px 12px;font-size:12px;color:#666;">${p.codigo}</td>
                <td style="padding:8px 12px;font-size:13px;">${p.descricao}</td>
                <td style="padding:8px 12px;font-size:13px;text-align:right;">R$ ${parseFloat(p.preco_venda || 0).toFixed(2).replace('.', ',')}</td>
            </tr>
        `).join('')
        tbody.querySelectorAll('tr').forEach(tr => {
            tr.addEventListener('click', () => {
                const i = parseInt(tr.getAttribute('data-index'))
                document.getElementById('lp-ean').value = resultados[i].codigo
                document.getElementById('lp-modal-busca').style.display = 'none'
                document.getElementById('lp-preco').focus()
            })
        })
    })
}

// ── IMPRESSÃO ─────────────────────────────────────────
function imprimirListaPrecos() {
    const lista = filtroAtivo === 'Todos' ? listaPrecos : listaPrecos.filter(p => p.loja === filtroAtivo)
    if (!lista.length) { alert('Nenhum produto para imprimir.'); return }

    const titulo = filtroAtivo === 'Todos' ? 'Lista de Preços' : `Lista de Preços — ${filtroAtivo}`

    const linhas = lista.map((p, i) => {
        const precoUn = calcPrecoUn(p.preco, p)
        const uni = unidade(p)
        return `<tr>
            <td>${i + 1}</td>
            <td>${p.ean || p.codigo || ''}</td>
            <td>${p.descricao}</td>
            <td style="text-align:right;">R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</td>
            <td style="text-align:right;">${precoUn ? `R$ ${precoUn} / ${uni}` : '—'}</td>
            <td style="text-align:center;">${p.loja}</td>
        </tr>`
    }).join('')

    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
        <title>${titulo}</title>
        <style>
            * { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; box-sizing: border-box; }
            body { padding: 20px; font-size: 12px; }
            h2 { font-size: 16px; margin-bottom: 4px; }
            p.sub { font-size: 11px; color: #666; margin-bottom: 14px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f3f4f6; font-weight: 600; text-align: left; padding: 7px 10px; border: 1px solid #e5e7eb; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
            td { padding: 6px 10px; border: 1px solid #e5e7eb; vertical-align: middle; }
            tr:nth-child(even) td { background: #f9fafb; }
            @page { size: A4; margin: 15mm; }
        </style></head><body>
        <h2>${titulo}</h2>
        <p class="sub">Gerado em ${new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })} — ${lista.length} produto(s)</p>
        <table>
            <thead><tr>
                <th>#</th><th>EAN</th><th>Descrição</th>
                <th>Preço</th><th>Preço / UN·KG·LT</th><th>Loja</th>
            </tr></thead>
            <tbody>${linhas}</tbody>
        </table>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body></html>`)
    win.document.close()
}