/* ═══════════════════════════════════════════════════════════════
   CONVERSOR PNG → WEBP — lote (client-side, sem servidor)
   ═══════════════════════════════════════════════════════════════ */

let cwFiles = [] // {id, name, file, url, webpUrl, status, size, webpSize, quality}
let cwBusy = false

function carregarConversorWebp() {
    setActive('btn-conversor-webp')
    setConteudo(`
        <div class="ds-page-head fade-in">
            <div>
                <div class="ds-page-eyebrow">Imagens</div>
                <h1 class="ds-page-title">Conversor PNG → WebP</h1>
                <p class="ds-page-sub">Converta várias imagens de uma vez direto no navegador — nada sai do seu computador</p>
            </div>
        </div>

        <div class="ds-grid ds-grid-4" id="cw-stats" style="margin-bottom:24px">
            <div class="ds-stat"><span class="ds-stat-label">Imagens</span><div class="ds-stat-value" id="cw-total">0</div></div>
            <div class="ds-stat"><span class="ds-stat-label">Convertidas</span><div class="ds-stat-value" id="cw-ok" style="color:var(--ok)">0</div></div>
            <div class="ds-stat"><span class="ds-stat-label">Original</span><div class="ds-stat-value" id="cw-orig" style="color:var(--text-2); font-size:20px">0 KB</div></div>
            <div class="ds-stat"><span class="ds-stat-label">Economia</span><div class="ds-stat-value" id="cw-eco" style="color:var(--ok); font-size:20px">—</div></div>
        </div>

        <div class="ds-card" style="overflow:hidden; margin-bottom:24px">
            <div class="ds-card-pad" style="display:flex; flex-direction:column; gap:16px;">
                <input type="file" id="cw-input" accept="image/png,image/*" multiple style="display:none">
                <div id="cw-dropzone" class="ds-dropzone" role="button" tabindex="0">
                    <div class="ds-dropzone-ico">
                        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <div class="ds-dropzone-title">Arraste PNGs aqui ou clique para selecionar</div>
                    <div class="ds-dropzone-sub">Várias de uma vez • PNG transparência também funciona • nada é enviado para o servidor</div>
                </div>

                <div style="display:flex; align-items:end; gap:14px; flex-wrap:wrap;">
                    <div class="ds-field" style="min-width:240px;">
                        <label class="ds-label">Qualidade WebP: <b id="cw-qtd" style="color:var(--text-1)">85%</b></label>
                        <input type="range" id="cw-quality" min="50" max="100" value="85" style="width:240px; accent-color:var(--brand-2);">
                    </div>
                    <div style="display:flex; gap:8px; flex-wrap:wrap; padding-bottom:2px;">
                        <button id="cw-btn-convert" class="ds-btn ds-btn-primary" type="button">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Converter todas
                        </button>
                        <button id="cw-btn-download-all" class="ds-btn" type="button">Baixar todas</button>
                        <button id="cw-btn-save-all" class="ds-btn" type="button" title="Escolher a pasta uma vez e salvar todas as imagens da fila nela (sobrescreve arquivos com o mesmo nome)">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                            Escolher pasta e salvar
                        </button>
                        <button id="cw-btn-clear" class="ds-btn ds-btn-danger" type="button">Limpar</button>
                    </div>
                </div>
            </div>
            <div id="cw-list" style="display:flex; flex-direction:column; border-top:1px solid var(--border)"></div>
        </div>
    `, 'Conversor WebP')

    const dz = document.getElementById('cw-dropzone')
    const input = document.getElementById('cw-input')
    const quality = document.getElementById('cw-quality')
    const qtd = document.getElementById('cw-qtd')

    dz.onclick = () => input.click()
    dz.onkeydown = (e) => { if (e.key === 'Enter') input.click() }
    dz.ondragover = (e) => { e.preventDefault(); dz.classList.add('is-over') }
    dz.ondragleave = () => dz.classList.remove('is-over')
    dz.ondrop = (e) => {
        e.preventDefault()
        dz.classList.remove('is-over')
        cwAdd([...(e.dataTransfer?.files || [])])
    }
    input.onchange = () => { cwAdd([...input.files]); input.value = '' }
    quality.oninput = () => { qtd.textContent = quality.value + '%' }
    document.getElementById('cw-btn-convert').onclick = cwConvertAll
    document.getElementById('cw-btn-clear').onclick = cwClear
    document.getElementById('cw-btn-download-all').onclick = cwDownloadAll
    document.getElementById('cw-btn-save-all').onclick = cwSaveAllToFolder

    cwRender()
}

function cwAdd(files) {
    const imgs = files.filter(f => f.type.startsWith('image/') || /\.png$/i.test(f.name))
    if (!imgs.length) return alert('Selecione imagens PNG (ou qualquer imagem — será convertida para WebP).')
    for (const file of imgs) {
        const url = URL.createObjectURL(file)
        cwFiles.push({ id: Math.random().toString(36).slice(2), name: file.name, file, url, webpUrl: null, status: 'aguardando', size: file.size, webpSize: null, error: null })
    }
    cwRender()
}

function cwClear() {
    cwFiles.forEach(f => { URL.revokeObjectURL(f.url); if (f.webpUrl) URL.revokeObjectURL(f.webpUrl); f.webpBlob = null })
    cwFiles = []
    cwRender()
}

function cwFmt(bytes) {
    if (bytes == null) return '—'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function cwRender() {
    const total = cwFiles.length
    const ok = cwFiles.filter(f => f.status === 'convertido').length
    const orig = cwFiles.reduce((s, f) => s + (f.size || 0), 0)
    const conv = cwFiles.reduce((s, f) => s + (f.webpSize || 0), 0)
    const el = (id) => document.getElementById(id)
    if (el('cw-total')) el('cw-total').textContent = total
    if (el('cw-ok')) el('cw-ok').textContent = ok
    if (el('cw-orig')) el('cw-orig').textContent = cwFmt(orig)
    if (el('cw-eco')) {
        const pct = orig > 0 && ok > 0 ? Math.max(0, Math.round((1 - conv / Math.max(1, cwFiles.filter(f => f.status === 'convertido').reduce((s, f) => s + f.size, 0))) * 100)) : null
        el('cw-eco').textContent = pct != null ? '-' + pct + '%' : '—'
    }

    const list = document.getElementById('cw-list')
    if (!list) return
    if (!cwFiles.length) {
        list.innerHTML = '<div class="ds-empty"><div class="ds-empty-text">Nenhuma imagem ainda. Arraste PNGs no quadro acima.</div></div>'
        return
    }
    list.innerHTML = cwFiles.map(f => `
        <div style="display:flex; align-items:center; gap:14px; padding:12px 18px; border-bottom:1px solid var(--border-soft)">
            <img src="${f.url}" style="width:56px; height:56px; object-fit:contain; border-radius:8px; background:#fff; flex:0 0 auto;">
            <div style="flex:1; min-width:0">
                <div style="font-size:12.5px; font-weight:600; color:var(--text-1); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${f.name}</div>
                <div style="font-size:11px; color:var(--text-3); margin-top:3px;">${cwFmt(f.size)}${f.webpSize ? ' → <b style="color:var(--ok)">' + cwFmt(f.webpSize) + '</b>' : ''} · <span>${f.status}</span>${f.error ? ' · <span style="color:var(--danger)">' + f.error + '</span>' : ''}</div>
            </div>
            ${f.webpUrl ? `<a class="ds-btn ds-btn-sm" href="${f.webpUrl}" download="${f.name.replace(/\.png$/i, '')}.webp">Baixar</a>` : '<span class="ds-badge">Aguardando</span>'}
            <button class="ds-icon-btn cw-remove" data-id="${f.id}" title="Remover" type="button">✕</button>
        </div>
    `).join('')
    list.querySelectorAll('.cw-remove').forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id
            const idx = cwFiles.findIndex(f => f.id === id)
            if (idx >= 0) { const f = cwFiles[idx]; URL.revokeObjectURL(f.url); if (f.webpUrl) URL.revokeObjectURL(f.webpUrl); f.webpBlob = null; cwFiles.splice(idx, 1) }
            cwRender()
        }
    })
}

function cwFileToWebP(dataUrl, quality) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas')
                canvas.width = img.naturalWidth || img.width
                canvas.height = img.naturalHeight || img.height
                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0)
                canvas.toBlob((blob) => {
                    if (!blob) reject(new Error('Falha no navegador ao gerar WebP'))
                    else resolve(blob)
                }, 'image/webp', quality / 100)
            } catch (e) { reject(e) }
        }
        img.onerror = () => reject(new Error('Imagem inválida'))
        img.src = dataUrl
    })
}

async function cwConvertAll() {
    if (!cwFiles.length) return alert('Adicione imagens primeiro.')
    if (cwBusy) return
    cwBusy = true
    const quality = parseInt(document.getElementById('cw-quality').value || '85', 10)
    const pending = cwFiles.filter(f => f.status !== 'convertido')
    for (const f of pending) {
        f.status = 'convertendo'
        cwRender()
        try {
            const blob = await cwFileToWebP(f.url, quality)
            if (f.webpUrl) URL.revokeObjectURL(f.webpUrl)
            f.webpBlob = blob
            f.webpUrl = URL.createObjectURL(blob)
            f.webpSize = blob.size
            f.status = 'convertido'
            f.error = null
        } catch (e) {
            f.status = 'erro'
            f.error = e.message
        }
        cwRender()
    }
    cwBusy = false
    cwRender()
}

async function cwDownloadAll() {
    const converted = cwFiles.filter(f => f.webpUrl)
    if (!converted.length) return alert('Converta primeiro (botão Converter todas).')
    if (converted.length === 1) {
        const a = document.createElement('a')
        a.href = converted[0].webpUrl
        a.download = converted[0].name.replace(/\.png$/i, '') + '.webp'
        a.click()
        return
    }
    try {
        for (const f of converted) {
            const a = document.createElement('a')
            a.href = f.webpUrl
            a.download = f.name.replace(/\.png$/i, '') + '.webp'
            document.body.appendChild(a)
            a.click()
            a.remove()
            await new Promise(r => setTimeout(r, 250))
        }
    } catch (e) {
        alert('Erro ao baixar: ' + e.message)
    }
}

async function cwSaveAllToFolder() {
    // Converte o que estiver pendente antes de salvar a fila inteira
    if (cwFiles.some(f => f.status !== 'convertido')) await cwConvertAll()
    const converted = cwFiles.filter(f => f.webpBlob || f.webpUrl)
    if (!converted.length) return alert('Adicione imagens primeiro.')

    // Navegador sem suporte à escolha de pasta: cai no download tradicional
    if (typeof window.showDirectoryPicker !== 'function') {
        alert('Este navegador não permite escolher a pasta. Usando o download tradicional (o navegador pode pedir o local de cada arquivo).')
        return cwDownloadAll()
    }

    let dirHandle
    try {
        dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' })
    } catch (e) {
        return // cancelado pelo usuário na janela de pasta
    }

    const nomeWebp = (name) => name.replace(/\.[^.]+$/, '') + '.webp'
    let salvos = 0
    const erros = []
    for (const f of converted) {
        const filename = nomeWebp(f.name)
        try {
            const fileHandle = await dirHandle.getFileHandle(filename, { create: true })
            const writable = await fileHandle.createWritable()
            const blob = f.webpBlob || await (await fetch(f.webpUrl)).blob()
            await writable.write(blob)
            await writable.close()
            salvos++
        } catch (e) {
            erros.push(filename + ': ' + (e.message || e))
            console.error('Erro ao salvar', filename, e)
        }
    }

    if (erros.length) {
        alert(`${salvos} imagem(ns) salva(s) na pasta escolhida.\n\nFalharam ${erros.length}:\n` + erros.slice(0, 5).join('\n'))
    } else {
        alert(`${salvos} imagem(ns) salva(s) na pasta escolhida.`)
    }
}
