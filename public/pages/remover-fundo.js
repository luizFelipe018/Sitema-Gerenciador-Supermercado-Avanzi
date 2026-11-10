/* ═══════════════════════════════════════════════════════════════
   REMOVER FUNDO (IA) — arraste a foto, a IA remove o fundo, baixe a PNG
   Processamento 100% local no navegador (biblioteca @imgly/background-removal).
   Nenhuma imagem sai do computador. O modelo (~42 MB) é baixado uma única
   vez pelo navegador e fica em cache.
   ═══════════════════════════════════════════════════════════════ */

let rfFiles = [] // {id, name, file, url, outUrl, outName, status, size, outSize, error, progress}
let rfBusy = false

function carregarRemoverFundo() {
    setActive('btn-remover-fundo')
    setConteudo(`
        <div class="ds-page-head fade-in">
            <div>
                <div class="ds-page-eyebrow">Imagens</div>
                <h1 class="ds-page-title">Remover Fundo (IA)</h1>
                <p class="ds-page-sub">Arraste as fotos dos produtos — o fundo é removido automaticamente (com inteligência). Nada sai do seu computador</p>
            </div>
        </div>

        <div class="ds-grid ds-grid-3" id="rf-stats" style="margin-bottom:24px">
            <div class="ds-stat"><span class="ds-stat-label">Imagens</span><div class="ds-stat-value" id="rf-total">0</div></div>
            <div class="ds-stat"><span class="ds-stat-label">Prontas</span><div class="ds-stat-value" id="rf-ok" style="color:var(--ok)">0</div></div>
            <div class="ds-stat"><span class="ds-stat-label">Erros</span><div class="ds-stat-value" id="rf-erros" style="color:var(--danger)">0</div></div>
        </div>

        <div class="ds-card" style="overflow:hidden; margin-bottom:16px">
            <div class="ds-card-pad" id="rf-modelo-box" style="display:flex; flex-direction:column; gap:14px; border-bottom:1px solid var(--border);">
                <div style="display:flex; gap:14px; align-items:center; justify-content:space-between; flex-wrap:wrap;">
                    <div>
                        <div style="font-size:13px; font-weight:700; color:var(--text-1);">Modelo de IA <span id="rf-modelo-tag" class="ds-badge" style="margin-left:6px;">verificando…</span></div>
                        <div style="font-size:11.5px; color:var(--text-3); margin-top:4px; line-height:1.6;">Na 1ª vez o ERP baixa ~75 MB direto da CDN do fornecedor e guarda na sua pasta — depois funciona offline.</div>
                    </div>
                    <button id="rf-btn-preparar" class="ds-btn ds-btn-primary" type="button" style="display:none;">Preparar modelo de IA (~75 MB)</button>
                </div>
                <div id="rf-progresso-box" style="display:none;">
                    <div style="display:flex; justify-content:space-between; gap:10px; font-size:11px; color:var(--text-3); margin-bottom:6px;">
                        <span id="rf-prog-txt">Baixando…</span>
                        <span id="rf-prog-num">0/0</span>
                    </div>
                    <div style="height:10px; border-radius:99px; background:var(--border-soft); overflow:hidden;">
                        <div id="rf-prog-bar" style="height:100%; width:0%; background:linear-gradient(90deg,var(--brand-2),var(--ok)); transition:width .2s;"></div>
                    </div>
                </div>
            </div>
            <div class="ds-card-pad" style="display:flex; flex-direction:column; gap:16px;">
                <input type="file" id="rf-input" accept="image/*" multiple style="display:none">
                <div id="rf-dropzone" class="ds-dropzone" role="button" tabindex="0">
                    <div class="ds-dropzone-ico">
                        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <div class="ds-dropzone-title">Arraste as fotos aqui ou clique para selecionar</div>
                    <div class="ds-dropzone-sub">JPG, PNG ou WebP • o fundo branco/transparente vira transparente • nada é enviado para o servidor</div>
                </div>

                <div style="display:flex; gap:10px; align-items:end; flex-wrap:wrap; padding-bottom:2px;">
                    <button id="rf-btn-remover" class="ds-btn ds-btn-primary" type="button">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 2a10 10 0 017.07 17.07A10 10 0 015.93 2.93z"/><line x1="22" y1="22" x2="16.24" y2="16.24"/></svg>
                        Remover fundo de todas
                    </button>
                    <button id="rf-btn-download-all" class="ds-btn" type="button">Baixar todas (PNG)</button>
                    <button id="rf-btn-save-all" class="ds-btn" type="button">Escolher pasta e salvar</button>
                    <button id="rf-btn-clear" class="ds-btn ds-btn-danger" type="button">Limpar</button>
                </div>
                <p style="font-size:11px; color:var(--text-3); margin:0; line-height:1.6;">
                    ⚠️ A primeira imagem demora mais: o modelo de IA (~42 MB) é baixado uma vez pelo navegador da loja e fica guardado em cache — depois é rápido. Rode uma imagem de teste antes de fazer a loja inteira.
                </p>
            </div>
            <div id="rf-list" style="display:flex; flex-direction:column; border-top:1px solid var(--border)"></div>
        </div>
    `, 'Remover Fundo')

    const dz = document.getElementById('rf-dropzone')
    const input = document.getElementById('rf-input')

    dz.onclick = () => input.click()
    dz.onkeydown = (e) => { if (e.key === 'Enter') input.click() }
    dz.ondragover = (e) => { e.preventDefault(); dz.classList.add('is-over') }
    dz.ondragleave = () => dz.classList.remove('is-over')
    dz.ondrop = (e) => {
        e.preventDefault()
        dz.classList.remove('is-over')
        rfAdd([...(e.dataTransfer?.files || [])])
    }
    input.onchange = () => { rfAdd([...input.files]); input.value = '' }

    document.getElementById('rf-btn-remover').onclick = rfRemoverTodas
    document.getElementById('rf-btn-download-all').onclick = rfDownloadAll
    document.getElementById('rf-btn-save-all').onclick = rfSaveAllToFolder
    document.getElementById('rf-btn-clear').onclick = rfClear
    document.getElementById('rf-btn-preparar').onclick = rfPrepararModelo

    rfChecarModelo()
    rfRender()
}

function rfAdd(files) {
    const imgs = files.filter(f => f.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|gif)$/i.test(f.name))
    if (!imgs.length) return alert('Selecione imagens (JPG, PNG, WebP…).')
    for (const file of imgs) {
        const url = URL.createObjectURL(file)
        rfFiles.push({ id: Math.random().toString(36).slice(2), name: file.name, file, url, outUrl: null, outName: null, status: 'aguardando', size: file.size, outSize: null, error: null, progress: 0 })
    }
    rfRender()
}

function rfClear() {
    rfFiles.forEach(f => { URL.revokeObjectURL(f.url); if (f.outUrl) URL.revokeObjectURL(f.outUrl) })
    rfFiles = []
    rfRender()
}

function rfNomePng(name) {
    const base = String(name || 'imagem').replace(/\.[^.]+$/, '')
    return (base || 'imagem') + '.png'
}

function rfFmt(bytes) {
    if (bytes == null) return '—'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function rfRender() {
    const el = (id) => document.getElementById(id)
    const total = rfFiles.length
    const ok = rfFiles.filter(f => f.status === 'pronto').length
    const err = rfFiles.filter(f => f.status === 'erro').length
    if (el('rf-total')) el('rf-total').textContent = total
    if (el('rf-ok')) el('rf-ok').textContent = ok
    if (el('rf-erros')) el('rf-erros').textContent = err

    const list = document.getElementById('rf-list')
    if (!list) return
    if (!rfFiles.length) {
        list.innerHTML = '<div class="ds-empty"><div class="ds-empty-text">Nenhuma imagem ainda. Arraste fotos dos produtos no quadro acima.</div></div>'
        return
    }
    list.innerHTML = rfFiles.map(f => `
        <div style="display:flex; align-items:center; gap:14px; padding:12px 18px; border-bottom:1px solid var(--border-soft)">
            <div style="position:relative; width:56px; height:56px; flex:0 0 auto; border-radius:8px; background:linear-gradient(45deg, #777 25%, transparent 25%) 0 0/16px 16px, linear-gradient(-45deg, #777 25%, transparent 25%) 0 8px/16px 16px, linear-gradient(45deg, transparent 75%, #777 75%) 8px -8px/16px 16px, linear-gradient(-45deg, transparent 75%, #777 75%) -8px 0/16px 16px, #ccc; overflow:hidden;">
                <img src="${f.outUrl || f.url}" style="width:100%; height:100%; object-fit:contain; background:${f.outUrl ? 'transparent' : '#fff'}; border-radius:8px;" alt="">
            </div>
            <div style="flex:1; min-width:0">
                <div style="font-size:12.5px; font-weight:600; color:var(--text-1); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${rfEscape(f.outUrl ? f.outName : f.name)}</div>
                <div style="font-size:11px; color:var(--text-3); margin-top:3px;">${rfFmt(f.size)}${f.outSize ? ' → <b style="color:var(--ok)">' + rfFmt(f.outSize) + '</b>' : ''} · <span>${rfEscape(f.status)}</span>${f.error ? ' · <span style="color:var(--danger)">' + rfEscape(f.error) + '</span>' : ''}</div>
                ${f.status === 'processando' ? `<div style="height:5px; border-radius:99px; background:var(--border-soft); overflow:hidden; margin-top:6px;"><div style="height:100%; width:${Math.min(100, f.progress || 0)}%; background:linear-gradient(90deg,var(--brand-2),var(--ok)); transition:width .2s;"></div></div>` : ''}
            </div>
            ${f.outUrl ? `<a class="ds-btn ds-btn-sm" href="${f.outUrl}" download="${f.outName}">Baixar</a>` : '<span class="ds-badge">Aguardando</span>'}
            <button class="ds-icon-btn rf-remove" data-id="${f.id}" title="Remover da fila" type="button">✕</button>
        </div>
    `).join('')
    list.querySelectorAll('.rf-remove').forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id
            const idx = rfFiles.findIndex(f => f.id === id)
            if (idx >= 0) { const f = rfFiles[idx]; URL.revokeObjectURL(f.url); if (f.outUrl) URL.revokeObjectURL(f.outUrl); rfFiles.splice(idx, 1) }
            rfRender()
        }
    })
}

function rfEscape(s) { return String(s ?? '').replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c])) }

/* ── checa/prepara o modelo local (servido pelo próprio ERP) ── */
let rfModeloPronto = false
let rfModeloBaixando = false

async function rfChecarModelo() {
    try {
        const res = await fetch(API + '/remover-fundo/status?_=' + Date.now(), { headers: authHeaders(), cache: 'no-store' })
        const d = await res.json()
        rfModeloPronto = !!d.pronto
        rfModeloBaixando = !!d.baixando
        rfAtualizarUIDoModelo(d)
    } catch (e) {
        rfAtualizarUIDoModelo({ pronto: false, erro: 'Erro ao verificar o modelo: ' + e.message })
    }
}

function rfAtualizarUIDoModelo(d) {
    const tag = document.getElementById('rf-modelo-tag')
    const btn = document.getElementById('rf-btn-preparar')
    if (!tag || !btn) return
    if (d.pronto) {
        tag.textContent = 'pronto'
        tag.style.background = 'var(--ok-soft)'
        tag.style.color = 'var(--ok)'
        btn.style.display = 'none'
        const box = document.getElementById('rf-progresso-box')
        if (box) box.style.display = 'none'
        return
    }
    if (d.baixando) {
        tag.textContent = 'baixando…'
        btn.style.display = 'none'
        rfMostrarProgresso(d)
        return
    }
    tag.textContent = 'não baixado'
    tag.style.background = 'var(--warn-soft)'
    tag.style.color = 'var(--warn)'
    btn.style.display = ''
    if (d.erro) {
        tag.textContent = 'erro'
        tag.style.background = 'var(--danger-soft)'
        tag.style.color = 'var(--danger)'
    }
    const box = document.getElementById('rf-progresso-box')
    if (box) box.style.display = 'none'
}

function rfMostrarProgresso(d) {
    const box = document.getElementById('rf-progresso-box')
    const txt = document.getElementById('rf-prog-txt')
    const num = document.getElementById('rf-prog-num')
    const bar = document.getElementById('rf-prog-bar')
    if (box) box.style.display = ''
    if (txt) txt.textContent = d.arquivoAtual ? 'Baixando modelo de IA… ' + d.arquivoAtual.split('/').pop().slice(-40) : 'Baixando modelo de IA…'
    if (num) num.textContent = `${d.arquivosOk || 0}/${d.arquivosTotal || 0} arquivos`
    if (bar && d.arquivosTotal > 0) bar.style.width = Math.round(((d.arquivosOk || 0) / d.arquivosTotal) * 100) + '%'
}

async function rfPrepararModelo() {
    const btn = document.getElementById('rf-btn-preparar')
    if (btn) { btn.disabled = true; btn.style.opacity = 0.6 }
    try {
        const res = await fetch(API + '/remover-fundo/baixar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: '{}'
        })
        if (!res.ok) throw new Error('HTTP ' + res.status)
        // verificação contínua até terminar
        const ini = Date.now()
        while (Date.now() - ini < 15 * 60 * 1000) {
            const r = await fetch(API + '/remover-fundo/status?_=' + Date.now(), { headers: authHeaders(), cache: 'no-store' })
            const d = await r.json()
            rfAtualizarUIDoModelo(d)
            if (d.pronto) {
                rfModeloPronto = true
                rfModeloBaixando = false
                rfCarregarLib().catch(() => {}) // pré-carrega em segundo plano
                return
            }
            if (d.erro) throw new Error(d.erro)
            await new Promise(r => setTimeout(r, 1000))
        }
        throw new Error('demorou demais (15 min) — verifique a conexão e tente novamente')
    } catch (e) {
        rfAtualizarUIDoModelo({ pronto: false, erro: e.message })
        alert('Não foi possível baixar o modelo de IA: ' + e.message)
    } finally {
        if (btn) { btn.disabled = false; btn.style.opacity = 1 }
    }
}

/* ── carrega a biblioteca de IA (uma vez, da CDN) ── */
let rfLibPromise = null
function rfCarregarLib() {
    if (!rfLibPromise) {
        rfLibPromise = import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/index.mjs')
            .then(mod => {
                if (!mod || typeof mod.removeBackground !== 'function') throw new Error('biblioteca de IA não carregou corretamente')
                return mod
            })
            .catch(e => {
                rfLibPromise = null
                throw new Error('Não consegui carregar a IA: ' + (e.message || e))
            })
    }
    return rfLibPromise
}

async function rfRemoverFundoDe(f) {
    // limpa resultado anterior
    if (f.outUrl) { URL.revokeObjectURL(f.outUrl); f.outUrl = null; f.outName = null; f.outSize = null }
    f.status = 'processando'
    f.progress = 0
    f.error = null
    rfRender()

    // caminho absoluto para a pasta do modelo — funciona em http:// e file://
    const dirBase = window.location.href.slice(0, window.location.href.lastIndexOf('/') + 1)
    const publicPath = new URL('vendor/imgly/1.7.0/dist/', dirBase).href

    const mod = await rfCarregarLib()
    const blob = await mod.removeBackground(f.file, {
        publicPath,
        model: 'small',
        device: 'cpu',
        proxyToWorker: false,
        progress: (_key, current, total) => {
            if (total > 0) {
                f.progress = Math.min(100, Math.round((current / total) * 100))
                rfRenderItemProgress(f.id, f.progress)
            }
        }
    })

    f.outUrl = URL.createObjectURL(blob)
    f.outName = rfNomePng(f.name)
    f.outSize = blob.size
    f.status = 'pronto'
    f.progress = 100
    rfRender()
}

function rfRenderItemProgress(id, progress) {
    const item = rfFiles.find(f => f.id === id)
    if (item) item.progress = progress
    const bar = document.querySelector(`.rf-remove[data-id="${id}"]`)?.closest('div')?.querySelector('div[style*="height:100%"]')
    if (bar) bar.style.width = Math.min(100, progress) + '%'
}

async function rfRemoverTodas() {
    if (!rfFiles.length) return alert('Arraste as fotos primeiro.')
    if (!rfModeloPronto) {
        return aviso('O modelo de IA ainda não foi baixado nesta máquina. Clique em "Preparar modelo de IA" e aguarde a conclusão.', { titulo: 'Remover Fundo' })
    }
    if (rfBusy) return
    rfBusy = true
    const pendentes = rfFiles.filter(f => f.status !== 'pronto')
    for (const f of pendentes) {
        try {
            await rfRemoverFundoDe(f)
        } catch (e) {
            f.status = 'erro'
            f.error = e.message || String(e)
            f.progress = 0
            rfRender()
        }
    }
    rfBusy = false
    rfRender()
}

async function rfDownloadAll() {
    const prontas = rfFiles.filter(f => f.outUrl)
    if (!prontas.length) return alert('Remova os fundos primeiro (botão Remover fundo de todas).')
    for (const f of prontas) {
        const a = document.createElement('a')
        a.href = f.outUrl
        a.download = f.outName
        document.body.appendChild(a)
        a.click()
        a.remove()
        await new Promise(r => setTimeout(r, 300)) // respeita o navegador
    }
}

async function rfSaveAllToFolder() {
    // converte o que estiver pendente antes de salvar a fila inteira
    if (rfFiles.some(f => f.status !== 'pronto')) await rfRemoverTodas()
    const prontas = rfFiles.filter(f => f.outUrl)
    if (!prontas.length) return alert('Adicione imagens primeiro.')

    if (typeof window.showDirectoryPicker !== 'function') {
        alert('Este navegador não permite escolher a pasta. Usando o download tradicional (o navegador pode pedir o local de cada arquivo).')
        return rfDownloadAll()
    }

    let dirHandle
    try {
        dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' })
    } catch (e) {
        return // cancelado pelo usuário
    }

    let salvos = 0
    const erros = []
    for (const f of prontas) {
        try {
            const blob = await (await fetch(f.outUrl)).blob()
            const fileHandle = await dirHandle.getFileHandle(f.outName, { create: true })
            const writable = await fileHandle.createWritable()
            await writable.write(blob)
            await writable.close()
            salvos++
        } catch (e) {
            erros.push(f.outName + ': ' + (e.message || e))
        }
    }

    if (erros.length) {
        alert(`${salvos} imagem(ns) salva(s) na pasta escolhida.\n\nFalharam ${erros.length}:\n` + erros.slice(0, 5).join('\n'))
    } else {
        alert(`${salvos} imagem(ns) salva(s) na pasta escolhida.`)
    }
}
