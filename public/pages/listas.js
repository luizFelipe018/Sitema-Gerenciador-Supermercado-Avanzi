let bancoProdutosListas = []
let listaAtiva = null
let sugestaoIndex = -1
let sugestoesAtuais = []

async function carregarListas() {
    setActive('btn-listas')
    setConteudo(`
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <!-- Coluna esquerda: histórico -->
            <div class="flex flex-col gap-3">
                <div class="dash-glass dash-animate" style="padding:20px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px;">
                    <div style="padding:16px 0; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:space-between;">
                        <h3 style="font-size:13px; font-weight:700; color:rgba(255,255,255,0.85);">Minhas Listas</h3>
                        <button id="btn-nova-lista" class="px-3 py-1.5 text-white text-xs font-semibold rounded-lg" style="background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3);">
                            <svg style="width:12px;height:12px;display:inline;vertical-align:middle;margin-right:4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Nova Lista
                        </button>
                    </div>

                    <!-- Criar nova lista -->
                    <div id="form-nova-lista" style="display:none; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.06);">
                        <input id="input-nome-lista" type="text" placeholder="Nome da lista"
                            style="width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; margin-bottom:8px; outline:none;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'">
                        <input id="input-data-lista" type="date"
                            style="width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; margin-bottom:8px; outline:none;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'">
                        <div style="display:flex; gap:8px;">
                            <button id="btn-criar-lista" class="flex-1 py-1.5 text-white text-xs font-semibold rounded-lg" style="background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3);">Criar</button>
                            <button id="btn-cancelar-lista" class="flex-1 py-1.5 text-xs font-semibold rounded-lg" style="border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.6);">Cancelar</button>
                        </div>
                    </div>

                    <div id="historico-listas" style="max-height:600px; overflow-y:auto;">
                        <p style="text-align:center; color:rgba(255,255,255,0.3); font-size:11px; padding:24px 0;">Carregando...</p>
                    </div>
                </div>
            </div>

            <!-- Coluna direita: lista ativa -->
            <div class="lg:col-span-2" id="area-lista-ativa">
                <div class="dash-glass dash-animate" style="padding:40px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px; text-align:center;">
                    <p style="color:rgba(255,255,255,0.4); font-size:13px;">Selecione ou crie uma lista</p>
                </div>
            </div>

        </div>
    `, 'Listas de Preços')

    if (bancoProdutosListas.length === 0) {
        try {
            const res  = await fetch(API+'/produtos?page=1&limit=500', { headers: authHeaders() })
            const json = await res.json()
            if (json.data && Array.isArray(json.data)) bancoProdutosListas = json.data
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
        const res    = await fetch(API+'/listas', { headers: authHeaders() })
        const listas = await res.json()

        if (!listas.length) {
            el.innerHTML = `<p style="text-align:center; color:rgba(255,255,255,0.3); font-size:11px; padding:24px 0;">Nenhuma lista criada ainda.</p>`
            return
        }

        el.innerHTML = listas.map(l => {
            const dt     = new Date(l.criado_em)
            const data   = dt.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit' })
            const hora   = dt.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
            const ativo  = listaAtiva?.id === l.id
            const finalBadge = l.finalizada
                ? `<span style="font-size:10px; padding:2px 6px; border-radius:6px; font-weight:700; background:rgba(22,163,74,0.15); color:#4ade80;">Finalizada</span>`
                : `<span style="font-size:10px; padding:2px 6px; border-radius:6px; font-weight:700; background:rgba(234,179,8,0.15); color:#facc15;">Rascunho</span>`
            const filhaBadge = l.lista_pai_id
                ? `<span style="font-size:10px; color:#60a5fa; margin-left:4px;"><svg style="width:10px;height:10px;display:inline;vertical-align:middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg> versão</span>` : ''

            return `
                <div class="lista-item" style="padding:12px 16px; display:flex; align-items:start; justify-content:space-between; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.04); transition:background 0.15s; ${ativo ? 'background:rgba(181,21,21,0.08);' : ''}"
                    data-id="${l.id}" data-nome="${l.nome}" data-finalizada="${l.finalizada}" data-pai="${l.lista_pai_id || ''}"
                    onmouseover="if(!this.style.background.includes('0.08'))this.style.background='rgba(255,255,255,0.02)'"
                    onmouseout="if(!this.style.background.includes('0.08'))this.style.background=''">
                    <div style="flex:1; min-width:0;">
                        <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
                            <p style="font-size:13px; font-weight:700; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; ${ativo ? 'color:#f87171;' : 'color:rgba(255,255,255,0.85);'}">${l.nome}</p>
                            ${filhaBadge}
                        </div>
                        <p style="font-size:11px; color:rgba(255,255,255,0.3); margin-top:2px;">${data} às ${hora}</p>
                        <div style="margin-top:4px;">${finalBadge}</div>
                    </div>
                    <button class="btn-excluir-lista" style="color:rgba(255,255,255,0.2); font-size:16px; font-weight:700; line-height:1; margin-left:8px; flex-shrink:0; background:none; border:none; cursor:pointer; padding:4px;"
                        data-id="${l.id}"
                        onmouseover="this.style.color='#f87171'" onmouseout="this.style.color='rgba(255,255,255,0.2)'">
                        <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            `
        }).join('')

        el.querySelectorAll('.lista-item').forEach(item => {
            item.onclick = (e) => {
                if (e.target.classList.contains('btn-excluir-lista') || e.target.closest('.btn-excluir-lista')) return
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
                await fetch(API+`/listas/${btn.getAttribute('data-id')}`, { method:'DELETE', headers:authHeaders() })
                if (listaAtiva?.id === parseInt(btn.getAttribute('data-id'))) {
                    listaAtiva = null
                    document.getElementById('area-lista-ativa').innerHTML = `
                        <div class="dash-glass dash-animate" style="padding:40px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px; text-align:center;">
                            <p style="color:rgba(255,255,255,0.4); font-size:13px;">Selecione ou crie uma lista</p>
                        </div>`
                }
                await atualizarHistorico()
            }
        })
    } catch {
        el.innerHTML = `<p style="text-align:center; color:#f87171; font-size:11px; padding:24px 0;">Erro ao carregar.</p>`
    }
}

async function criarLista() {
    const nome = document.getElementById('input-nome-lista').value.trim()
    const data = document.getElementById('input-data-lista').value
    if (!nome) return
    const res   = await fetch(API+'/listas', {
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
        <div class="dash-glass dash-animate" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px; overflow:hidden;">
            <div style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <span style="font-size:15px; font-weight:800; color:rgba(255,255,255,0.85); letter-spacing:0.02em;">${lista.nome}</span>
                    ${finalizada
                        ? `<span style="font-size:10px; padding:4px 12px; border-radius:999px; font-weight:800; background:rgba(22,163,74,0.15); color:#4ade80;">Finalizada</span>`
                        : `<span style="font-size:10px; padding:4px 12px; border-radius:999px; font-weight:800; background:rgba(234,179,8,0.15); color:#facc15;">Rascunho</span>`
                    }
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    ${!finalizada ? `
                        <button id="btn-finalizar-lista" style="display:flex; align-items:center; gap:6px; padding:8px 16px; color:#fff; font-size:11px; font-weight:800; border-radius:10px; background:linear-gradient(135deg,#16a34a,#15803d); box-shadow:0 4px 16px rgba(22,163,74,0.3); border:none; cursor:pointer;">
                            <svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            Finalizar Lista
                        </button>
                    ` : `
                        <button id="btn-duplicar-lista" style="display:flex; align-items:center; gap:6px; padding:8px 16px; color:#fff; font-size:11px; font-weight:800; border-radius:10px; background:linear-gradient(135deg,#2563eb,#1d4ed8); box-shadow:0 4px 16px rgba(37,99,235,0.3); border:none; cursor:pointer;">
                            <svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            Nova Versão
                        </button>
                    `}
                    <button id="btn-imprimir-lista" style="display:flex; align-items:center; gap:6px; padding:8px 16px; color:rgba(255,255,255,0.7); font-size:11px; font-weight:800; border-radius:10px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); cursor:pointer;">
                        <svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Imprimir
                    </button>
                    <button id="btn-exportar-excel" style="display:flex; align-items:center; gap:6px; padding:8px 16px; color:rgba(255,255,255,0.7); font-size:11px; font-weight:800; border-radius:10px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); cursor:pointer;">
                        <svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
                        Excel
                    </button>
                </div>
            </div>

            ${!finalizada ? `
            <!-- Adicionar produto -->
            <div style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.06);">
                <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:end;">
                    <div style="flex:1; min-width:180px; position:relative; display:flex; flex-direction:column; gap:4px;">
                        <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">EAN / Código / Nome</label>
                        <input id="lista-input-busca" type="text" placeholder="Digite ou bipe o produto..."
                            style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none;"
                            autocomplete="off"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'">
                        <div id="lista-sugestoes" style="position:absolute; top:100%; left:0; right:0; z-index:50;"></div>
                    </div>
                    <div style="width:110px; display:flex; flex-direction:column; gap:4px;">
                        <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Preço (R$)</label>
                        <input id="lista-input-preco" type="number" step="0.01"
                            style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none;"
                            onfocus="this.style.borderColor='rgba(181,21,21,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'">
                    </div>
                    <button id="btn-add-item-lista" style="padding:10px 16px; color:#fff; font-size:13px; font-weight:700; border-radius:10px; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); border:none; cursor:pointer; display:flex; align-items:center; gap:6px;">
                        <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Adicionar
                    </button>
                </div>
            </div>
            ` : ''}

            <!-- Itens -->
            <div id="itens-lista" class="dash-table-wrap" style="overflow-x:auto;"></div>
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
            await fetch(API+`/listas/${lista.id}/finalizar`, { method:'POST', headers:authHeaders() })
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
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:1000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);'
    modal.innerHTML = `
        <div style="background:rgba(20,20,35,0.95); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px; width:400px; box-shadow:0 20px 60px rgba(0,0,0,0.5); backdrop-filter:blur(12px);">
            <h3 style="font-size:15px; font-weight:700; color:rgba(255,255,255,0.85); margin-bottom:12px;">Nova Versão da Lista</h3>
            <p style="font-size:12px; color:rgba(255,255,255,0.4); margin-bottom:16px;">Baseada em: <strong style="color:rgba(255,255,255,0.7);">${lista.nome}</strong></p>
            <div style="display:flex;flex-direction:column;gap:10px;">
                <input id="dup-nome" type="text" placeholder="Nome da nova versão" value="${lista.nome} (atualizada)"
                    style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none;"
                    onfocus="this.style.borderColor='rgba(181,21,21,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'">
                <input id="dup-data" type="date"
                    style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none;"
                    value="${new Date().toISOString().split('T')[0]}"
                    onfocus="this.style.borderColor='rgba(181,21,21,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'">
            </div>
            <div style="display:flex;gap:8px;margin-top:16px;">
                <button id="dup-btn-criar" style="flex:1;padding:10px;background:linear-gradient(135deg,#b51515,#8a0f0f);box-shadow:0 4px 16px rgba(181,21,21,0.3);color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;">
                    Criar Nova Versão
                </button>
                <button id="dup-btn-cancelar" style="flex:1;padding:10px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.6);border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;">
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
        const res  = await fetch(API+`/listas/${lista.id}/duplicar`, {
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
        fetch(API+`/listas/${paiId}/itens`, { headers:authHeaders() }),
        fetch(API+`/listas/${filhoId}/itens`, { headers:authHeaders() })
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
        <div class="dash-glass dash-animate" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:16px; overflow:hidden; margin-top:16px;">
            <div style="padding:12px 20px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; gap:12px;">
                <span style="font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Alterações em relação à versão anterior</span>
                ${adicionados.length ? `<span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:999px; background:rgba(22,163,74,0.15); color:#4ade80;">+${adicionados.length} adicionado(s)</span>` : ''}
                ${removidos.length   ? `<span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:999px; background:rgba(220,38,38,0.15); color:#f87171;">-${removidos.length} removido(s)</span>` : ''}
            </div>
            <table class="dash-table" style="width:100%;">
                <tbody>
                    ${adicionados.map(i => `
                        <tr style="background:rgba(22,163,74,0.05); border-bottom:1px solid rgba(22,163,74,0.1);">
                            <td style="padding:12px 20px; width:24px;">
                                <svg style="width:16px;height:16px; color:#4ade80;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            </td>
                            <td style="padding:12px 0; font-weight:700; color:#4ade80;">${i.descricao}</td>
                            <td style="padding:12px 20px; text-align:right; font-weight:700; color:#4ade80;">R$ ${parseFloat(i.preco).toFixed(2).replace('.',',')}</td>
                        </tr>
                    `).join('')}
                    ${mantidos.map(i => `
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                            <td style="padding:12px 20px; width:24px;">
                                <svg style="width:14px;height:14px; color:rgba(255,255,255,0.15);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            </td>
                            <td style="padding:12px 0; color:rgba(255,255,255,0.6);">${i.descricao}</td>
                            <td style="padding:12px 20px; text-align:right; color:rgba(255,255,255,0.4);">R$ ${parseFloat(i.preco).toFixed(2).replace('.',',')}</td>
                        </tr>
                    `).join('')}
                    ${removidos.map(i => `
                        <tr style="background:rgba(220,38,38,0.05); border-bottom:1px solid rgba(220,38,38,0.1);">
                            <td style="padding:12px 20px; width:24px;">
                                <svg style="width:16px;height:16px; color:#f87171;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            </td>
                            <td style="padding:12px 0; font-weight:700; text-decoration:line-through; color:#f87171;">${i.descricao}</td>
                            <td style="padding:12px 20px; text-align:right; font-weight:700; text-decoration:line-through; color:#f87171;">R$ ${parseFloat(i.preco).toFixed(2).replace('.',',')}</td>
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
    const res   = await fetch(API+`/listas/${listaId}/itens`, { headers:authHeaders() })
    const itens = await res.json()

    if (!itens.length) {
        el.innerHTML = `<p style="text-align:center; color:rgba(255,255,255,0.3); font-size:13px; padding:32px 0;">Nenhum produto na lista ainda.</p>`
        return
    }

    const total = itens.reduce((s, i) => s + parseFloat(i.preco || 0), 0)

    el.innerHTML = `
        <table class="dash-table" style="width:100%;">
            <thead>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                    <th style="padding:12px 20px; text-align:left; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3); width:32px;">#</th>
                    <th style="padding:12px 20px; text-align:left; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Descrição</th>
                    <th style="padding:12px 20px; text-align:left; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Código</th>
                    <th style="padding:12px 20px; text-align:right; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Preço</th>
                    ${!somenteLeitura ? '<th style="padding:12px 20px; width:32px;"></th>' : ''}
                </tr>
            </thead>
            <tbody>
                ${itens.map((item, i) => `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.04); transition:background 0.15s;" data-item-id="${item.id}"
                        onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background=''">
                        <td style="padding:14px 20px; color:rgba(255,255,255,0.3); font-size:11px;">${i + 1}</td>
                        <td style="padding:14px 20px; font-weight:700; color:rgba(255,255,255,0.85); ${!somenteLeitura ? 'cursor:pointer;' : ''}" class="${!somenteLeitura ? 'item-desc' : ''}" data-field="descricao"
                            ${!somenteLeitura ? 'onmouseover="this.style.color=\'#f87171\'" onmouseout="this.style.color=\'rgba(255,255,255,0.85)\'"' : ''}>${item.descricao}</td>
                        <td style="padding:14px 20px; font-family:monospace; color:rgba(255,255,255,0.3); font-size:11px;">${item.codigo || '—'}</td>
                        <td style="padding:14px 20px; text-align:right; font-weight:700; color:rgba(255,255,255,0.85); ${!somenteLeitura ? 'cursor:pointer;' : ''}" class="${!somenteLeitura ? 'item-preco' : ''}" data-field="preco"
                            ${!somenteLeitura ? 'onmouseover="this.style.color=\'#f87171\'" onmouseout="this.style.color=\'rgba(255,255,255,0.85)\'"' : ''}>
                            R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')}
                        </td>
                        ${!somenteLeitura ? `
                        <td style="padding:14px 20px; text-align:center;">
                            <button class="btn-remover-item" style="background:none; border:none; cursor:pointer; padding:4px; color:rgba(255,255,255,0.15); transition:color 0.15s;"
                                data-id="${item.id}"
                                onmouseover="this.style.color='#f87171'" onmouseout="this.style.color='rgba(255,255,255,0.15)'">
                                <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        </td>` : ''}
                    </tr>
                `).join('')}
            </tbody>
            <tfoot>
                <tr style="border-top:1px solid rgba(255,255,255,0.06);">
                    <td colspan="${somenteLeitura ? 3 : 4}" style="padding:12px 20px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">
                        Total — ${itens.length} produto(s)
                    </td>
                    <td style="padding:12px 20px; text-align:right; font-weight:800; color:rgba(255,255,255,0.85); font-size:15px;">R$ ${total.toFixed(2).replace('.', ',')}</td>
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
                input.style.cssText = 'width:100%;border:1px solid #b51515;border-radius:6px;padding:4px 8px;font-size:13px;background:rgba(255,255,255,0.04);color:#fafafa;outline:none;'
                span.replaceWith(input); input.focus(); input.select()
                const salvar = async () => {
                    const v = input.value.trim(); if (!v) { carregarItensLista(listaId); return }
                    const item = itens.find(i => i.id === itemId)
                    await fetch(API+`/listas/${listaId}/itens/${itemId}`, {
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
                await fetch(API+`/listas/${listaId}/itens/${btn.getAttribute('data-id')}`, { method:'DELETE', headers:authHeaders() })
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
        sugestaoIndex = -1
        sugestoesAtuais = []
        debounce = setTimeout(async () => {
            await mostrarSugestoesLista(inputBusca.value.trim())
            sugestoesAtuais = document.querySelectorAll('.sugestao-lista')
            if (sugestoesAtuais.length) { sugestaoIndex = 0; sugestoesAtuais[0].style.background = 'rgba(181,21,21,0.25)' }
        }, 250)
    }
    inputBusca.onkeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (sugestaoIndex >= 0 && sugestoesAtuais[sugestaoIndex]) {
                sugestoesAtuais[sugestaoIndex].click()
            } else {
                inputPreco.focus(); inputPreco.select()
            }
        }
        if (e.key === 'Escape') {
            document.getElementById('lista-sugestoes').innerHTML = ''
            sugestoesAtuais = []; sugestaoIndex = -1
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            if (!sugestoesAtuais.length) return
            sugestoesAtuais[sugestaoIndex].style.background = ''
            sugestaoIndex = (sugestaoIndex + 1) % sugestoesAtuais.length
            sugestoesAtuais[sugestaoIndex].style.background = 'rgba(181,21,21,0.25)'
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault()
            if (!sugestoesAtuais.length) return
            sugestoesAtuais[sugestaoIndex].style.background = ''
            sugestaoIndex = (sugestaoIndex - 1 + sugestoesAtuais.length) % sugestoesAtuais.length
            sugestoesAtuais[sugestaoIndex].style.background = 'rgba(181,21,21,0.25)'
        }
    }
    inputPreco.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarItemLista(lista.id) } }
    document.getElementById('btn-add-item-lista').onclick = () => adicionarItemLista(lista.id)
}

async function mostrarSugestoesLista(termo) {
    const el = document.getElementById('lista-sugestoes')
    if (!el) return
    if (!termo || termo.length < 2) { el.innerHTML = ''; sugestoesAtuais = []; return }
    const q = termo.toUpperCase()

    let resultados = bancoProdutosListas.filter(p =>
        p.descricao?.toUpperCase().includes(q) || String(p.codigo).includes(q) || String(p.ean).includes(q)
    ).slice(0, 7)

    if (resultados.length < 7) {
        try {
            const res = await fetch(API+`/produtos/busca?q=${encodeURIComponent(termo)}`, { headers: authHeaders() })
            if (res.ok) {
                const apiRes = await res.json()
                const descs = new Set(resultados.map(r => r.descricao?.toUpperCase()))
                for (const p of apiRes) {
                    if (!descs.has(p.descricao?.toUpperCase())) {
                        resultados.push(p)
                        if (resultados.length >= 7) break
                    }
                }
            }
        } catch {}
    }

    if (!resultados.length) { el.innerHTML = ''; return }
    el.innerHTML = `
        <div style="background:rgba(20,20,35,0.95);border:1px solid rgba(255,255,255,0.08);border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,0.4);overflow:hidden;backdrop-filter:blur(12px);">
            ${resultados.map((p, i) => `
                <div class="sugestao-lista" data-index="${i}"
                    style="padding:10px 14px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <p style="font-size:13px;color:rgba(255,255,255,0.85);font-weight:600;">${p.descricao}</p>
                    <p style="font-size:11px;color:rgba(255,255,255,0.3);">${p.codigo}${p.ean ? ' · ' + p.ean : ''}${p.preco_venda ? ' · R$ ' + Number(p.preco_venda).toFixed(2).replace('.',',') : ''}</p>
                </div>
            `).join('')}
        </div>
    `
    el.querySelectorAll('.sugestao-lista').forEach(item => {
        item.onmouseover = () => item.style.background = 'rgba(181,21,21,0.1)'
        item.onmouseout  = () => item.style.background = ''
        item.onclick = () => {
            const i = parseInt(item.getAttribute('data-index'))
            const p = resultados[i]
            document.getElementById('lista-input-busca').value = p.descricao
            document.getElementById('lista-input-preco').value = p.preco_venda || ''
            el.innerHTML = ''
            el.dataset.codigo = p.codigo; el.dataset.ean = p.ean || ''
            sugestoesAtuais = []; sugestaoIndex = -1
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
    await fetch(API+`/listas/${listaId}/itens`, {
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
    const res   = await fetch(API+`/listas/${lista.id}/itens`, { headers:authHeaders() })
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
        const res = await fetch(API+`/listas/${lista.id}/exportar-xlsx`, {
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
