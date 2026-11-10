/* ═══════════════════════════════════════════════════════════════
   BAIXAR TODAS AS FOTOS DO SITE — lojasuperavanzi.com.br
   Baixa as fotos de todos os produtos que estão no site (SKU = código
   do ERP) e salva na pasta de imagens do ERP como <DESCRIÇÃO>.jpeg.
   ═══════════════════════════════════════════════════════════════ */

let bsBusy = false
let bsLoteAtivo = false
let bsProdutos = []

function carregarBaixarSite() {
    setActive('btn-baixar-site')
    setConteudo(`
        <div class="ds-page-head fade-in">
            <div>
                <div class="ds-page-eyebrow">Imagens</div>
                <h1 class="ds-page-title">Baixar do Site (JPEG)</h1>
                <p class="ds-page-sub">Baixa as fotos de todos os produtos que estão no site e salva na pasta de imagens com a descrição EXATA do ERP (arquivo &lt;DESCRIÇÃO DO ERP&gt;.jpeg)</p>
            </div>
        </div>

        <div class="ds-grid ds-grid-4" id="bs-stats" style="margin-bottom:24px">
            <div class="ds-stat"><span class="ds-stat-label">Produtos no site</span><div class="ds-stat-value" id="bs-total-site">—</div></div>
            <div class="ds-stat"><span class="ds-stat-label">Com foto no site</span><div class="ds-stat-value" id="bs-com-foto" style="color:var(--ok)">—</div></div>
            <div class="ds-stat"><span class="ds-stat-label">Produtos ERP</span><div class="ds-stat-value" id="bs-total-erp">—</div></div>
            <div class="ds-stat"><span class="ds-stat-label">Sem imagem local</span><div class="ds-stat-value" id="bs-sem-local" style="color:var(--danger)">—</div></div>
        </div>

        <div class="ds-card" style="margin-bottom:24px">
            <div class="ds-card-pad" style="display:flex; flex-direction:column; gap:16px;">
                <div>
                    <h3 class="ds-card-title">Importação de todas as fotos</h3>
                    <p class="ds-card-sub">Percorre todos os produtos do ERP que têm produto correspondente no site e salva a foto dele na pasta de imagens com o nome da descrição do ERP (formato JPEG). Os que já têm imagem (.png/.jpeg/.jpg/.webp) são pulados automaticamente.</p>
                </div>
                <div style="display:flex; gap:10px; align-items:end; flex-wrap:wrap;">
                    <div class="ds-field" style="min-width:140px;">
                        <label class="ds-label">Máximo: <b id="bs-max-lbl" style="color:var(--text-1)">0</b> <span style="color:var(--text-3)">(0 = todas)</span></label>
                        <input type="number" id="bs-max" min="0" step="1" value="0" style="width:140px;">
                    </div>
                    <button id="bs-btn-importar" class="ds-btn ds-btn-primary" type="button" style="font-size:14px; padding:12px 22px;">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Importar TODAS as fotos do site
                    </button>
                    <button id="bs-btn-parar" class="ds-btn ds-btn-danger" type="button" style="display:none">Parar</button>
                </div>
                <div id="bs-progresso" style="display:none; margin-top:4px;">
                    <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-3); margin-bottom:6px;">
                        <span id="bs-prog-txt">Preparando…</span>
                        <span id="bs-prog-num">0/0</span>
                    </div>
                    <div style="height:8px; border-radius:99px; background:var(--border-soft); overflow:hidden;">
                        <div id="bs-prog-bar" style="height:100%; width:0%; background:linear-gradient(90deg,var(--brand-2),var(--ok)); transition:width .25s;"></div>
                    </div>
                </div>
                <p id="bs-economia" style="font-size:11px; color:var(--text-3); margin:0;"></p>
            </div>
            <div id="bs-log"></div>
        </div>
    `, 'Baixar do Site')

    document.getElementById('bs-btn-importar').onclick = iniciarImportacao
    document.getElementById('bs-btn-parar').onclick = () => { bsLoteAtivo = false }
    document.getElementById('bs-max').oninput = (e) => { document.getElementById('bs-max-lbl').textContent = e.target.value }

    carregarStatsBaixarSite()
}

/* ── estatísticas ── */
async function carregarStatsBaixarSite() {
    const el = (id) => document.getElementById(id)
    try {
        const r = await fetch(API + '/imagens-site/indice', { headers: authHeaders() })
        const d = await r.json()
        if (el('bs-total-site')) el('bs-total-site').textContent = d.total ?? '—'
        if (el('bs-com-foto')) el('bs-com-foto').textContent = d.total ?? '—'
    } catch { if (el('bs-total-site')) el('bs-total-site').textContent = 'erro' }
    try {
        const r = await fetch(API + '/imagens-site/sem-imagem?limit=10000', { headers: authHeaders() })
        const d = await r.json()
        if (el('bs-total-erp')) el('bs-total-erp').textContent = d.totalProdutos ?? '—'
        if (el('bs-sem-local')) el('bs-sem-local').textContent = d.semImagem ?? '—'
        bsProdutos = d.produtos || []
    } catch { if (el('bs-total-erp')) el('bs-total-erp').textContent = 'erro' }
}

/* ── converte uma imagem (qualquer formato) para JPEG via canvas ── */
function bsImagemParaJpeg(blob) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob)
        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.naturalWidth || img.width
            canvas.height = img.naturalHeight || img.height
            const ctx = canvas.getContext('2d')
            // fundo branco para imagens com transparência (JPEG não tem alfa)
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0)
            URL.revokeObjectURL(url)
            resolve(canvas.toDataURL('image/jpeg', 0.92))
        }
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('imagem inválida')) }
        img.src = url
    })
}

/* ── processa um produto: acha no site → baixa → converte → salva ── */
async function bsProcessarProduto(p) {
    // 1) localiza no site (SKU == código do ERP)
    const r = await fetch(API + '/imagens-site/buscar?codigo=' + encodeURIComponent(p.codigo), { headers: authHeaders() })
    const info = await r.json()
    if (!info.ok || !info.proxy) {
        return { codigo: p.codigo, descricao: p.descricao, ok: false, motivo: info.motivo || 'sem foto no site' }
    }
    // 2) baixa a imagem (via proxy, evita CORS) + 3) converte para JPEG
    const imgRes = await fetch(API + info.proxy, { headers: authHeaders() })
    if (!imgRes.ok) return { codigo: p.codigo, descricao: p.descricao, ok: false, motivo: `erro ao baixar (HTTP ${imgRes.status})` }
    const blob = await imgRes.blob()
    const jpeg = await bsImagemParaJpeg(blob)
    // 4) salva na pasta com o nome EXATO do ERP
    const s = await fetch(API + '/imagens-site/salvar-jpeg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ codigo: p.codigo, jpeg })
    })
    const res2 = await s.json()
    if (!res2.salvo) return { codigo: p.codigo, descricao: p.descricao, ok: false, motivo: res2.error || res2.motivo || 'falha ao salvar' }
    return { codigo: p.codigo, descricao: p.descricao, ok: true, nome: res2.nome, bytes: res2.bytes, origem: info.origem, score: info.score }
}

/* ── importação em lote ── */
async function iniciarImportacao() {
    if (bsBusy) return
    if (!bsProdutos.length) {
        try {
            const r = await fetch(API + '/imagens-site/sem-imagem?limit=10000', { headers: authHeaders() })
            const d = await r.json()
            bsProdutos = d.produtos || []
            const el = (id) => document.getElementById(id)
            if (el('bs-sem-local')) el('bs-sem-local').textContent = d.semImagem ?? '—'
            if (el('bs-total-erp')) el('bs-total-erp').textContent = d.totalProdutos ?? '—'
        } catch (e) {
            return aviso('Erro ao listar produtos sem imagem: ' + e.message, { titulo: 'Baixar do Site' })
        }
    }
    if (!bsProdutos.length) return aviso('Todos os produtos já têm imagem local!', { titulo: 'Baixar do Site', tipo: 'ok' })

    const max = parseInt(document.getElementById('bs-max').value, 10) || 0
    const fila = max > 0 ? bsProdutos.slice(0, max) : bsProdutos.slice()

    bsBusy = true
    bsLoteAtivo = true
    const elProg = document.getElementById('bs-progresso')
    const elBar = document.getElementById('bs-prog-bar')
    const elTxt = document.getElementById('bs-prog-txt')
    const elNum = document.getElementById('bs-prog-num')
    const elLog = document.getElementById('bs-log')
    const elEco = document.getElementById('bs-economia')
    const btnImportar = document.getElementById('bs-btn-importar')
    const btnParar = document.getElementById('bs-btn-parar')
    btnImportar.disabled = true
    btnImportar.style.opacity = 0.6
    btnParar.style.display = ''
    elProg.style.display = ''
    elLog.innerHTML = ''
    elEco.textContent = ''

    let baixadas = 0, semFoto = 0, falhas = 0, i = 0
    const CONC = 4
    const ESPERA_MS = 150 // respeita o site numa execução de milhares de fotos
    while (i < fila.length && bsLoteAtivo) {
        const lote = fila.slice(i, i + CONC)
        elTxt.textContent = `Baixando fotos do site… ${i + 1}–${Math.min(i + CONC, fila.length)} de ${fila.length}`
        const resultados = await Promise.allSettled(lote.map(p => bsProcessarProduto(p)))
        for (const r of resultados) {
            const info = r.status === 'fulfilled' ? r.value : { ok: false, motivo: (r.reason && r.reason.message) || 'erro inesperado' }
            if (info.ok) { baixadas++ }
            else if (/sem foto|correspondência|sem imagem no site/i.test(info.motivo || '')) { semFoto++ }
            else { falhas++ }
            elLog.insertAdjacentHTML('afterbegin', `
                <div style="display:flex; gap:10px; align-items:center; padding:8px 18px; border-bottom:1px solid var(--border-soft); font-size:12px;">
                    <span style="width:18px; text-align:center;">${info.ok ? '<span style="color:var(--ok)">✓</span>' : '<span style="color:var(--danger)">✕</span>'}</span>
                    <span style="color:var(--text-1); flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${info.descricao || info.codigo}</span>
                    <span style="color:var(--text-3); flex:0 0 auto; max-width:40%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${info.ok ? `${((info.bytes || 0) / 1024).toFixed(0)} KB${info.origem && info.origem !== 'sku' ? ' · aprox.' : ''}` : (info.motivo || '')}</span>
                </div>`)
        }
        if (i + CONC < fila.length) await new Promise(r => setTimeout(r, ESPERA_MS))
        i += CONC
        elBar.style.width = Math.round((i / fila.length) * 100) + '%'
        elNum.textContent = `${i}/${fila.length}`
    }

    elTxt.textContent = bsLoteAtivo ? 'Concluído!' : 'Interrompido.'
    elNum.textContent = `${baixadas} baixadas · ${semFoto} sem foto no site · ${falhas} falhas`
    elBar.style.width = '100%'
    elEco.textContent = `Ao todo ${baixadas + semFoto + falhas} processadas — JPEG salvo com o nome da descrição do ERP. Rode de novo para completar os que faltaram.`
    btnImportar.disabled = false
    btnImportar.style.opacity = 1
    btnParar.style.display = 'none'
    bsBusy = false
    bsLoteAtivo = false

    // remove da fila local os que foram processados
    const feitos = new Set(fila.slice(0, i).map(p => String(p.codigo)))
    bsProdutos = bsProdutos.filter(p => !feitos.has(String(p.codigo)))
    const el = (id) => document.getElementById(id)
    if (el('bs-sem-local')) el('bs-sem-local').textContent = bsProdutos.length
}
