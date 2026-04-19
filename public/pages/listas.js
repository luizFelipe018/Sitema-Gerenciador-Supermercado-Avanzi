let bancoProdutosListas = []
let listaAtiva = null

async function carregarListas() {
    setActive('btn-listas')
    setConteudo(`
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <!-- Coluna esquerda: histórico -->
            <div class="flex flex-col gap-3">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 class="font-semibold text-gray-700 text-sm">Minhas Listas</h3>
                        <button id="btn-nova-lista" class="px-3 py-1.5 text-white text-xs font-semibold rounded-lg" style="background:#b51515;">
                            + Nova Lista
                        </button>
                    </div>

                    <!-- Criar nova lista -->
                    <div id="form-nova-lista" style="display:none;" class="px-5 py-3 border-b border-gray-100 bg-gray-50">
                        <input id="input-nome-lista" type="text" placeholder="Nome da lista"
                            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 mb-2">
                        <input id="input-data-lista" type="date"
                            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 mb-2">
                        <div class="flex gap-2">
                            <button id="btn-criar-lista" class="flex-1 py-1.5 text-white text-xs font-semibold rounded-lg" style="background:#b51515;">Criar</button>
                            <button id="btn-cancelar-lista" class="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500">Cancelar</button>
                        </div>
                    </div>

                    <div id="historico-listas" class="divide-y divide-gray-50" style="max-height:600px; overflow-y:auto;">
                        <p class="text-center text-gray-400 text-xs py-6">Carregando...</p>
                    </div>
                </div>
            </div>

            <!-- Coluna direita: lista ativa -->
            <div class="lg:col-span-2" id="area-lista-ativa">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
                    <p class="text-gray-400 text-sm">Selecione ou crie uma lista</p>
                </div>
            </div>

        </div>
    `, 'Listas de Preços')

    if (bancoProdutosListas.length === 0) {
        try {
            const res  = await fetch('http://localhost:3000/produtos', { headers: authHeaders() })
            const data = await res.json()
            if (Array.isArray(data)) bancoProdutosListas = data
        } catch {}
    }

    // Data padrão = hoje
    document.getElementById('input-data-lista').value = new Date().toISOString().split('T')[0]

    vincularEventosListas()
    await atualizarHistorico()
}

function vincularEventosListas() {
    document.getElementById('btn-nova-lista').onclick = () => {
        const form = document.getElementById('form-nova-lista')
        form.style.display = form.style.display === 'none' ? 'block' : 'none'
        if (form.style.display === 'block') document.getElementById('input-nome-lista').focus()
    }
    document.getElementById('btn-cancelar-lista').onclick = () => {
        document.getElementById('form-nova-lista').style.display = 'none'
        document.getElementById('input-nome-lista').value = ''
    }
    document.getElementById('btn-criar-lista').onclick = criarLista
    document.getElementById('input-nome-lista').onkeydown = (e) => { if (e.key === 'Enter') criarLista() }
}

async function atualizarHistorico() {
    const el = document.getElementById('historico-listas')
    if (!el) return
    try {
        const res    = await fetch('http://localhost:3000/listas', { headers: authHeaders() })
        const listas = await res.json()

        if (!listas.length) {
            el.innerHTML = `<p class="text-center text-gray-400 text-xs py-6">Nenhuma lista criada ainda.</p>`
            return
        }

        el.innerHTML = listas.map(l => {
            const dt     = new Date(l.criado_em)
            const data   = dt.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit' })
            const hora   = dt.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
            const ativo  = listaAtiva?.id === l.id
            const finalBadge = l.finalizada
                ? `<span class="text-xs px-1.5 py-0.5 rounded font-semibold" style="background:#dcfce7;color:#16a34a;">✓ Finalizada</span>`
                : `<span class="text-xs px-1.5 py-0.5 rounded font-semibold" style="background:#fef3c7;color:#92400e;">Rascunho</span>`
            const filhaBadge = l.lista_pai_id
                ? `<span class="text-xs text-blue-400 ml-1">↗ versão</span>` : ''

            return `
                <div class="lista-item px-4 py-3 flex items-start justify-between cursor-pointer transition-colors ${ativo ? 'bg-red-50' : 'hover:bg-gray-50'}"
                    data-id="${l.id}" data-nome="${l.nome}" data-finalizada="${l.finalizada}" data-pai="${l.lista_pai_id || ''}">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1 flex-wrap">
                            <p class="text-sm font-semibold truncate ${ativo ? 'text-red-700' : 'text-gray-700'}">${l.nome}</p>
                            ${filhaBadge}
                        </div>
                        <p class="text-xs text-gray-400 mt-0.5">${data} às ${hora}</p>
                        <div class="mt-1">${finalBadge}</div>
                    </div>
                    <button class="btn-excluir-lista text-gray-300 hover:text-red-400 text-lg font-bold leading-none ml-2 flex-shrink-0" data-id="${l.id}">×</button>
                </div>
            `
        }).join('')

        el.querySelectorAll('.lista-item').forEach(item => {
            item.onclick = (e) => {
                if (e.target.classList.contains('btn-excluir-lista')) return
                abrirLista({
                    id:         parseInt(item.getAttribute('data-id')),
                    nome:       item.getAttribute('data-nome'),
                    finalizada: item.getAttribute('data-finalizada') === '1',
                    pai_id:     item.getAttribute('data-pai') ? parseInt(item.getAttribute('data-pai')) : null
                })
            }
        })

        el.querySelectorAll('.btn-excluir-lista').forEach(btn => {
            btn.onclick = async (e) => {
                e.stopPropagation()
                if (!confirm('Excluir esta lista?')) return
                await fetch(`http://localhost:3000/listas/${btn.getAttribute('data-id')}`, { method:'DELETE', headers:authHeaders() })
                if (listaAtiva?.id === parseInt(btn.getAttribute('data-id'))) {
                    listaAtiva = null
                    document.getElementById('area-lista-ativa').innerHTML = `
                        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
                            <p class="text-gray-400 text-sm">Selecione ou crie uma lista</p>
                        </div>`
                }
                await atualizarHistorico()
            }
        })
    } catch {
        el.innerHTML = `<p class="text-center text-red-400 text-xs py-6">Erro ao carregar.</p>`
    }
}

async function criarLista() {
    const nome = document.getElementById('input-nome-lista').value.trim()
    const data = document.getElementById('input-data-lista').value
    if (!nome) return
    const res   = await fetch('http://localhost:3000/listas', {
        method:'POST', headers:authHeaders(),
        body: JSON.stringify({ nome, data_oferta: data || null })
    })
    const lista = await res.json()
    document.getElementById('form-nova-lista').style.display = 'none'
    document.getElementById('input-nome-lista').value = ''
    await atualizarHistorico()
    abrirLista({ ...lista, finalizada: false })
}

// ── ABRIR LISTA ───────────────────────────────────────
async function abrirLista(lista) {
    listaAtiva = lista
    await atualizarHistorico()

    const area       = document.getElementById('area-lista-ativa')
    const finalizada = lista.finalizada

    area.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-800 text-base tracking-wide">${lista.nome}</span>
                    ${finalizada
                        ? `<span class="text-xs px-3 py-1 rounded-full font-bold" style="background:#dcfce7;color:#16a34a;">✓ Finalizada</span>`
                        : `<span class="text-xs px-3 py-1 rounded-full font-bold" style="background:#fef3c7;color:#92400e;">Rascunho</span>`
                    }
                </div>
                <div class="flex gap-2 flex-wrap">
                    ${!finalizada ? `
                        <button id="btn-finalizar-lista" class="flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded-lg" style="background:#16a34a;">
                            ✓ Finalizar Lista
                        </button>
                    ` : `
                        <button id="btn-duplicar-lista" class="flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded-lg" style="background:#2563eb;">
                            ↗ Nova Versão
                        </button>
                    `}
                    <button id="btn-imprimir-lista" class="flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded-lg" style="background:#374151;">
                        🖨️ Imprimir
                    </button>
                    <button id="btn-exportar-excel" class="flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded-lg" style="background:#1d6f42;">
                        <span style="font-size:14px;">📊</span> Excel
                    </button>
                </div>
            </div>

            ${!finalizada ? `
            <!-- Adicionar produto -->
            <div class="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div class="flex gap-2 flex-wrap items-end">
                    <div class="flex flex-col gap-1 flex-1" style="min-width:180px; position:relative;">
                        <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">EAN / Código / Nome</label>
                        <input id="lista-input-busca" type="text" placeholder="Digite ou bipe o produto..."
                            class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
                            autocomplete="off">
                        <div id="lista-sugestoes" style="position:absolute; top:100%; left:0; right:0; z-index:50;"></div>
                    </div>
                    <div class="flex flex-col gap-1" style="width:110px;">
                        <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preço (R$)</label>
                        <input id="lista-input-preco" type="number" step="0.01"
                            class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
                    </div>
                    <button id="btn-add-item-lista" class="px-4 py-2 text-white text-sm font-semibold rounded-lg" style="background:#b51515;">
                        ➕ Adicionar
                    </button>
                </div>
            </div>
            ` : ''}

            <!-- Itens -->
            <div id="itens-lista" class="overflow-x-auto"></div>
        </div>

        <!-- Diff com versão anterior -->
        <div id="area-diff"></div>
    `

    if (!finalizada) vincularEventosItemLista(lista)
    document.getElementById('btn-imprimir-lista')?.addEventListener('click', () => imprimirLista(lista))
    document.getElementById('btn-exportar-excel')?.addEventListener('click', () => exportarListaExcel(lista))


    if (!finalizada) {
        document.getElementById('btn-finalizar-lista')?.addEventListener('click', async () => {
            if (!confirm('Finalizar esta lista? Ela ficará somente leitura.')) return
            await fetch(`http://localhost:3000/listas/${lista.id}/finalizar`, { method:'POST', headers:authHeaders() })
            lista.finalizada = true
            await atualizarHistorico()
            abrirLista({ ...lista, finalizada: true })
        })
    } else {
        document.getElementById('btn-duplicar-lista')?.addEventListener('click', () => abrirModalDuplicar(lista))
    }

    await carregarItensLista(lista.id, finalizada)

    // Mostra diff se tem pai
    if (lista.pai_id) await mostrarDiff(lista.pai_id, lista.id)
}

// ── MODAL DUPLICAR ────────────────────────────────────
function abrirModalDuplicar(lista) {
    const area = document.getElementById('area-lista-ativa')
    const modal = document.createElement('div')
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);z-index:1000;display:flex;align-items:center;justify-content:center;'
    modal.innerHTML = `
        <div style="background:#fff;border-radius:12px;padding:24px;width:400px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
            <h3 style="font-size:16px;font-weight:600;color:#374151;margin-bottom:16px;">Nova Versão da Lista</h3>
            <p style="font-size:12px;color:#6b7280;margin-bottom:12px;">Baseada em: <strong>${lista.nome}</strong></p>
            <div style="display:flex;flex-direction:column;gap:10px;">
                <input id="dup-nome" type="text" placeholder="Nome da nova versão" value="${lista.nome} (atualizada)"
                    style="border:1px solid #e5e7eb;border-radius:8px;padding:8px 12px;font-size:14px;outline:none;">
                <input id="dup-data" type="date"
                    style="border:1px solid #e5e7eb;border-radius:8px;padding:8px 12px;font-size:14px;outline:none;"
                    value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div style="display:flex;gap:8px;margin-top:16px;">
                <button id="dup-btn-criar" style="flex:1;padding:10px;background:#b51515;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                    Criar Nova Versão
                </button>
                <button id="dup-btn-cancelar" style="flex:1;padding:10px;background:#f3f4f6;color:#374151;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                    Cancelar
                </button>
            </div>
        </div>
    `
    document.body.appendChild(modal)
    document.getElementById('dup-nome').focus()

    document.getElementById('dup-btn-cancelar').onclick = () => document.body.removeChild(modal)
    document.getElementById('dup-btn-criar').onclick = async () => {
        const nome = document.getElementById('dup-nome').value.trim()
        const data = document.getElementById('dup-data').value
        if (!nome) return
        const res  = await fetch(`http://localhost:3000/listas/${lista.id}/duplicar`, {
            method:'POST', headers:authHeaders(),
            body: JSON.stringify({ nome, data_oferta: data || null })
        })
        const nova = await res.json()
        document.body.removeChild(modal)
        await atualizarHistorico()
        abrirLista({ ...nova, finalizada: false, pai_id: lista.id })
    }
}

// ── DIFF ──────────────────────────────────────────────
async function mostrarDiff(paiId, filhoId) {
    const el = document.getElementById('area-diff')
    if (!el) return

    const [resPai, resFilho] = await Promise.all([
        fetch(`http://localhost:3000/listas/${paiId}/itens`, { headers:authHeaders() }),
        fetch(`http://localhost:3000/listas/${filhoId}/itens`, { headers:authHeaders() })
    ])
    const itensPai    = await resPai.json()
    const itensFilho  = await resFilho.json()

    const descsPai    = new Set(itensPai.map(i => i.descricao.toUpperCase()))
    const descsFilho  = new Set(itensFilho.map(i => i.descricao.toUpperCase()))

    const adicionados = itensFilho.filter(i => !descsPai.has(i.descricao.toUpperCase()))
    const removidos   = itensPai.filter(i => !descsFilho.has(i.descricao.toUpperCase()))
    const mantidos    = itensFilho.filter(i => descsPai.has(i.descricao.toUpperCase()))

    if (!adicionados.length && !removidos.length) {
        el.innerHTML = ''; return
    }

    el.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
            <div class="px-5 py-3.5 flex items-center gap-3" style="border-bottom:2px solid #f3f4f6;">
                <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Alterações em relação à versão anterior</span>
                ${adicionados.length ? `<span class="text-xs font-bold px-2 py-0.5 rounded-full" style="background:#dcfce7;color:#16a34a;">+${adicionados.length} adicionado(s)</span>` : ''}
                ${removidos.length   ? `<span class="text-xs font-bold px-2 py-0.5 rounded-full" style="background:#fee2e2;color:#dc2626;">-${removidos.length} removido(s)</span>` : ''}
            </div>
            <table class="w-full text-sm">
                <tbody>
                    ${adicionados.map(i => `
                        <tr style="background:#f0fdf4; border-bottom:1px solid #dcfce7;">
                            <td class="px-5 py-3 w-6">
                                <span class="font-black text-base" style="color:#16a34a;">+</span>
                            </td>
                            <td class="py-3 font-bold" style="color:#15803d;">${i.descricao}</td>
                            <td class="px-5 py-3 text-right font-bold" style="color:#16a34a;">R$ ${parseFloat(i.preco).toFixed(2).replace('.',',')}</td>
                        </tr>
                    `).join('')}
                    ${mantidos.map(i => `
                        <tr style="border-bottom:1px solid #f9fafb;">
                            <td class="px-5 py-3 w-6">
                                <span class="font-bold text-base text-gray-300">=</span>
                            </td>
                            <td class="py-3 text-gray-600">${i.descricao}</td>
                            <td class="px-5 py-3 text-right text-gray-500">R$ ${parseFloat(i.preco).toFixed(2).replace('.',',')}</td>
                        </tr>
                    `).join('')}
                    ${removidos.map(i => `
                        <tr style="background:#fef2f2; border-bottom:1px solid #fee2e2;">
                            <td class="px-5 py-3 w-6">
                                <span class="font-black text-base" style="color:#dc2626;">−</span>
                            </td>
                            <td class="py-3 font-bold line-through" style="color:#dc2626;">${i.descricao}</td>
                            <td class="px-5 py-3 text-right font-bold line-through" style="color:#dc2626;">R$ ${parseFloat(i.preco).toFixed(2).replace('.',',')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `
}

// ── CARREGAR ITENS ────────────────────────────────────
async function carregarItensLista(listaId, somenteLeitura = false) {
    const el = document.getElementById('itens-lista')
    if (!el) return
    const res   = await fetch(`http://localhost:3000/listas/${listaId}/itens`, { headers:authHeaders() })
    const itens = await res.json()

    if (!itens.length) {
        el.innerHTML = `<p class="text-center text-gray-400 text-sm py-8">Nenhum produto na lista ainda.</p>`
        return
    }

    const total = itens.reduce((s, i) => s + parseFloat(i.preco || 0), 0)

    el.innerHTML = `
        <table class="w-full text-sm">
            <thead>
                <tr style="border-bottom:2px solid #f3f4f6;">
                    <th class="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-8">#</th>
                    <th class="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Descrição</th>
                    <th class="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Código</th>
                    <th class="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Preço</th>
                    ${!somenteLeitura ? '<th class="px-5 py-3 w-8"></th>' : ''}
                </tr>
            </thead>
            <tbody>
                ${itens.map((item, i) => `
                    <tr class="hover:bg-gray-50 transition-colors" style="border-bottom:1px solid #f9fafb;" data-item-id="${item.id}">
                        <td class="px-5 py-3.5 text-gray-400 text-xs">${i + 1}</td>
                        <td class="px-5 py-3.5 font-semibold text-gray-800 ${!somenteLeitura ? 'item-desc cursor-pointer hover:text-red-600' : ''}" data-field="descricao">${item.descricao}</td>
                        <td class="px-5 py-3.5 font-mono text-gray-400 text-xs">${item.codigo || '—'}</td>
                        <td class="px-5 py-3.5 text-right font-bold text-gray-800 ${!somenteLeitura ? 'item-preco cursor-pointer hover:text-red-600' : ''}" data-field="preco">
                            R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')}
                        </td>
                        ${!somenteLeitura ? `
                        <td class="px-5 py-3.5 text-center">
                            <button class="btn-remover-item text-gray-200 hover:text-red-400 font-bold text-xl leading-none transition-colors" data-id="${item.id}">×</button>
                        </td>` : ''}
                    </tr>
                `).join('')}
            </tbody>
            <tfoot>
                <tr style="border-top:2px solid #f3f4f6;">
                    <td colspan="${somenteLeitura ? 3 : 4}" class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Total — ${itens.length} produto(s)
                    </td>
                    <td class="px-5 py-3 text-right font-bold text-gray-900 text-base">R$ ${total.toFixed(2).replace('.', ',')}</td>
                    ${!somenteLeitura ? '<td></td>' : ''}
                </tr>
            </tfoot>
        </table>
    `

    if (!somenteLeitura) {
        // Edição inline
        el.querySelectorAll('[data-field]').forEach(span => {
            span.onclick = () => {
                const tr     = span.closest('tr')
                const itemId = parseInt(tr.getAttribute('data-item-id'))
                const field  = span.getAttribute('data-field')
                const input  = document.createElement('input')
                let val = span.textContent.trim().replace('R$','').replace(',','.').trim()
                input.value = val; input.type = field === 'preco' ? 'number' : 'text'; input.step = '0.01'
                input.style.cssText = 'width:100%;border:1px solid #b51515;border-radius:4px;padding:2px 6px;font-size:13px;'
                span.replaceWith(input); input.focus(); input.select()
                const salvar = async () => {
                    const v = input.value.trim(); if (!v) { carregarItensLista(listaId); return }
                    const item = itens.find(i => i.id === itemId)
                    await fetch(`http://localhost:3000/listas/${listaId}/itens/${itemId}`, {
                        method:'PUT', headers:authHeaders(),
                        body: JSON.stringify({ descricao: field==='descricao'?v:item.descricao, preco: field==='preco'?parseFloat(v):item.preco })
                    })
                    await carregarItensLista(listaId)
                    if (listaAtiva?.pai_id) await mostrarDiff(listaAtiva.pai_id, listaId)
                }
                input.onblur = salvar
                input.onkeydown = (e) => { if (e.key==='Enter') salvar(); if (e.key==='Escape') carregarItensLista(listaId) }
            }
        })

        el.querySelectorAll('.btn-remover-item').forEach(btn => {
            btn.onclick = async () => {
                await fetch(`http://localhost:3000/listas/${listaId}/itens/${btn.getAttribute('data-id')}`, { method:'DELETE', headers:authHeaders() })
                await carregarItensLista(listaId)
                if (listaAtiva?.pai_id) await mostrarDiff(listaAtiva.pai_id, listaId)
            }
        })
    }
}

// ── ADICIONAR ITEM ────────────────────────────────────
function vincularEventosItemLista(lista) {
    const inputBusca = document.getElementById('lista-input-busca')
    const inputPreco = document.getElementById('lista-input-preco')
    if (!inputBusca) return

    let debounce = null
    inputBusca.oninput = () => {
        clearTimeout(debounce)
        debounce = setTimeout(() => mostrarSugestoesLista(inputBusca.value.trim()), 250)
    }
    inputBusca.onkeydown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); inputPreco.focus(); inputPreco.select() }
        if (e.key === 'Escape') document.getElementById('lista-sugestoes').innerHTML = ''
    }
    inputPreco.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarItemLista(lista.id) } }
    document.getElementById('btn-add-item-lista').onclick = () => adicionarItemLista(lista.id)
}

function mostrarSugestoesLista(termo) {
    const el = document.getElementById('lista-sugestoes')
    if (!termo || termo.length < 2) { el.innerHTML = ''; return }
    const q = termo.toUpperCase()
    const resultados = bancoProdutosListas.filter(p =>
        p.descricao?.toUpperCase().includes(q) || p.codigo?.includes(q) || p.ean?.includes(q)
    ).slice(0, 7)
    if (!resultados.length) { el.innerHTML = ''; return }
    el.innerHTML = `
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);overflow:hidden;">
            ${resultados.map((p, i) => `
                <div class="sugestao-lista" data-index="${i}"
                    style="padding:8px 12px;cursor:pointer;border-bottom:1px solid #f9fafb;">
                    <p style="font-size:13px;color:#1f2937;font-weight:500;">${p.descricao}</p>
                    <p style="font-size:11px;color:#9ca3af;">${p.codigo}${p.ean ? ' · ' + p.ean : ''}${p.preco_venda ? ' · R$ ' + Number(p.preco_venda).toFixed(2).replace('.',',') : ''}</p>
                </div>
            `).join('')}
        </div>
    `
    el.querySelectorAll('.sugestao-lista').forEach(item => {
        item.onmouseover = () => item.style.background = '#fef2f2'
        item.onmouseout  = () => item.style.background = ''
        item.onclick = () => {
            const i = parseInt(item.getAttribute('data-index'))
            const p = resultados[i]
            document.getElementById('lista-input-busca').value = p.descricao
            document.getElementById('lista-input-preco').value = p.preco_venda || ''
            el.innerHTML = ''
            el.dataset.codigo = p.codigo; el.dataset.ean = p.ean || ''
            document.getElementById('lista-input-preco').focus()
            document.getElementById('lista-input-preco').select()
        }
    })
}

async function adicionarItemLista(listaId) {
    const inputBusca = document.getElementById('lista-input-busca')
    const inputPreco = document.getElementById('lista-input-preco')
    const sugestoes  = document.getElementById('lista-sugestoes')
    const descricao  = inputBusca.value.trim()
    const preco      = parseFloat(inputPreco.value) || 0
    if (!descricao) { inputBusca.focus(); return }
    await fetch(`http://localhost:3000/listas/${listaId}/itens`, {
        method:'POST', headers:authHeaders(),
        body: JSON.stringify({ descricao, preco, codigo: sugestoes.dataset.codigo||null, ean: sugestoes.dataset.ean||null })
    })
    inputBusca.value = ''; inputPreco.value = ''; sugestoes.innerHTML = ''
    delete sugestoes.dataset.codigo; delete sugestoes.dataset.ean
    inputBusca.focus()
    await carregarItensLista(listaId)
    if (listaAtiva?.pai_id) await mostrarDiff(listaAtiva.pai_id, listaId)
}

// ── IMPRIMIR ──────────────────────────────────────────
async function imprimirLista(lista) {
    const res   = await fetch(`http://localhost:3000/listas/${lista.id}/itens`, { headers:authHeaders() })
    const itens = await res.json()
    if (!itens.length) { alert('A lista está vazia.'); return }
    const total = itens.reduce((s, i) => s + parseFloat(i.preco || 0), 0)
    const dt    = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })
    const win   = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${lista.nome}</title>
        <style>
            * { font-family:'Segoe UI',sans-serif; margin:0; padding:0; box-sizing:border-box; }
            body { padding:20px; font-size:13px; }
            .header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:16px; border-bottom:2px solid #b51515; padding-bottom:10px; }
            h2 { font-size:18px; color:#b51515; }
            p.sub { font-size:11px; color:#666; margin-top:2px; }
            .badge { font-size:10px; padding:2px 6px; border-radius:4px; font-weight:600; }
            .finalizada { background:#dcfce7; color:#16a34a; }
            .rascunho { background:#fef3c7; color:#92400e; }
            table { width:100%; border-collapse:collapse; }
            th { background:#b51515; color:#fff; font-weight:600; text-align:left; padding:8px 10px; font-size:11px; text-transform:uppercase; }
            td { padding:7px 10px; border-bottom:1px solid #f0f0f0; }
            tfoot td { background:#f3f4f6; font-weight:700; border-top:2px solid #e5e7eb; }
            tr:nth-child(even) td { background:#f9fafb; }
            @page { size:A4; margin:15mm; }
        </style></head><body>
        <div class="header">
            <div>
                <h2>${lista.nome} <span class="badge ${lista.finalizada ? 'finalizada' : 'rascunho'}">${lista.finalizada ? '✓ Finalizada' : 'Rascunho'}</span></h2>
                <p class="sub">Gerado em ${dt} — ${itens.length} produto(s)</p>
            </div>
            <p class="sub">Supermercado Avanzi</p>
        </div>
        <table>
            <thead><tr><th>#</th><th>Descrição</th><th>Código</th><th style="text-align:right;">Preço</th></tr></thead>
            <tbody>${itens.map((item,i) => `
                <tr><td>${i+1}</td><td><strong>${item.descricao}</strong></td><td>${item.codigo||'—'}</td>
                <td style="text-align:right;font-weight:600;">R$ ${parseFloat(item.preco).toFixed(2).replace('.',',')}</td></tr>
            `).join('')}</tbody>
            <tfoot><tr><td colspan="3">Total</td><td style="text-align:right;">R$ ${total.toFixed(2).replace('.',',')}</td></tr></tfoot>
        </table>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body></html>`)
    win.document.close()
}

// ── EXPORTAR EXCEL ────────────────────────────────────
async function exportarListaExcel(lista) {
    const msgEl = document.getElementById('cp-msg') || { textContent: '', style: {} }
    try {
        const res = await fetch(`http://localhost:3000/listas/${lista.id}/exportar-xlsx`, {
            headers: authHeaders()
        })
        if (!res.ok) { alert('Erro ao gerar Excel.'); return }

        const blob = await res.blob()
        const url  = URL.createObjectURL(blob)
        const link = document.createElement('a')
        const nome = lista.nome.replace(/[^a-zA-Z0-9À-ÿ ]/g, '').trim()
        link.download = `${nome}.xlsx`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
    } catch (e) {
        console.error(e)
        alert('Erro ao exportar Excel.')
    }
}