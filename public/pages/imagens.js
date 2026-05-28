function carregarImagens() {
    setActive('btn-imagens')
    setConteudo(`
        <div class="dash-glass dash-animate" style="padding:20px; margin-bottom:20px;">

            <!-- Tipo de busca -->
            <div style="display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap;">
                <button class="img-tipo-btn" data-tipo="descricao"
                    style="padding:6px 16px; border-radius:20px; font-size:11px; font-weight:700; cursor:pointer; border:1px solid var(--primary); background:linear-gradient(135deg,var(--primary),var(--primary-dark)); color:#fff; transition:all 0.3s; display:flex; align-items:center; gap:6px;">
                    <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Descrição
                </button>
                <button class="img-tipo-btn" data-tipo="codigo"
                    style="padding:6px 16px; border-radius:20px; font-size:11px; font-weight:700; cursor:pointer; border:1px solid rgba(255,255,255,0.08); background:transparent; color:rgba(255,255,255,0.5); transition:all 0.3s; display:flex; align-items:center; gap:6px;">
                    <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                    Código
                </button>
                <button class="img-tipo-btn" data-tipo="ean"
                    style="padding:6px 16px; border-radius:20px; font-size:11px; font-weight:700; cursor:pointer; border:1px solid rgba(255,255,255,0.08); background:transparent; color:rgba(255,255,255,0.5); transition:all 0.3s; display:flex; align-items:center; gap:6px;">
                    <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="2"/><line x1="6" y1="11" x2="6" y2="13"/><line x1="10" y1="11" x2="10" y2="13"/><line x1="14" y1="11" x2="14" y2="13"/><line x1="18" y1="11" x2="18" y2="13"/></svg>
                    EAN
                </button>
            </div>

            <!-- Busca -->
            <div style="display:flex; gap:10px; align-items:end; flex-wrap:wrap;">
                <div style="display:flex; flex-direction:column; gap:6px; flex:1; min-width:200px;">
                    <label id="img-label" style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Descrição do Produto</label>
                    <input id="img-busca" type="text" placeholder="Ex: FRUTA AMEIXA KG" autocomplete="off"
                        style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; width:100%; transition:all 0.3s; box-sizing:border-box;"
                        onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                        onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'">
                </div>
                <button id="img-btn-buscar"
                    style="padding:10px 22px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; gap:6px;"
                    onmouseenter="this.style.transform='translateY(-2px) scale(1.03)';this.style.boxShadow='0 8px 24px rgba(181,21,21,0.4)'"
                    onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(181,21,21,0.3)'"
                    onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='translateY(-2px) scale(1.03)'">
                    <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    Buscar
                </button>
            </div>

            <!-- Sugestões da busca -->
            <div id="img-sugestoes" style="margin-top:10px;"></div>

        </div>

        <!-- Resultado -->
        <div id="img-resultado"></div>
    `, 'Consulta de Imagens')

    const inputBusca = document.getElementById('img-busca')
    inputBusca.focus()
    let tipoAtivo = 'descricao'

    function ativarTipoBtn(btn) {
        document.querySelectorAll('.img-tipo-btn').forEach(b => {
            b.style.background = 'transparent'
            b.style.color = 'rgba(255,255,255,0.5)'
            b.style.borderColor = 'rgba(255,255,255,0.08)'
        })
        btn.style.background = 'linear-gradient(135deg,var(--primary),var(--primary-dark))'
        btn.style.color = '#fff'
        btn.style.borderColor = 'var(--primary)'
    }

    document.querySelectorAll('.img-tipo-btn').forEach(btn => {
        btn.onclick = () => {
            tipoAtivo = btn.getAttribute('data-tipo')
            ativarTipoBtn(btn)

            const labels = { descricao: 'Descrição do Produto', codigo: 'Código do Produto', ean: 'EAN (Código de Barras)' }
            const placeholders = { descricao: 'Ex: FRUTA AMEIXA KG', codigo: 'Ex: 1000001', ean: 'Ex: 7896839921219' }
            document.getElementById('img-label').textContent = labels[tipoAtivo]
            inputBusca.placeholder = placeholders[tipoAtivo]
            inputBusca.value = ''
            document.getElementById('img-sugestoes').innerHTML = ''
            document.getElementById('img-resultado').innerHTML = ''
            inputBusca.focus()
        }
    })

    let debounceTimer = null
    inputBusca.oninput = () => {
        if (tipoAtivo !== 'descricao') return
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => mostrarSugestoes(inputBusca.value.trim()), 300)
    }

    inputBusca.onkeydown = (e) => {
        if (e.key === 'Enter') {
            clearTimeout(debounceTimer)
            document.getElementById('img-sugestoes').innerHTML = ''
            executarBuscaImagem(inputBusca.value.trim(), tipoAtivo)
        }
    }

    document.getElementById('img-btn-buscar').onclick = () => {
        clearTimeout(debounceTimer)
        document.getElementById('img-sugestoes').innerHTML = ''
        executarBuscaImagem(inputBusca.value.trim(), tipoAtivo)
    }
}

async function executarBuscaImagem(termo, tipo) {
    if (!termo) return
    const resultado = document.getElementById('img-resultado')
    resultado.innerHTML = `
        <div class="dash-glass dash-animate" style="padding:40px; text-align:center;">
            <svg class="animate-spin" width="24" height="24" fill="none" stroke="rgba(181,21,21,0.5)" stroke-width="2" viewBox="0 0 24 24" style="margin:0 auto 12px;"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            <p style="color:rgba(255,255,255,0.4); font-size:13px;">Buscando imagem...</p>
        </div>
    `

    if (tipo === 'descricao') {
        await buscarImagemPorNome(termo, null)

    } else if (tipo === 'codigo') {
        try {
            const res = await fetch(API+`/produtos/${encodeURIComponent(termo)}`, { headers: authHeaders() })
            if (res.ok) {
                const prod = await res.json()
                document.getElementById('img-busca').value = prod.descricao
                await buscarImagemPorNome(prod.descricao, termo)
            } else {
                resultado.innerHTML = `
                    <div class="dash-glass dash-animate" style="padding:40px; text-align:center;">
                        <svg width="40" height="40" fill="none" stroke="rgba(239,68,68,0.4)" stroke-width="1.5" viewBox="0 0 24 24" style="margin:0 auto 12px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <p style="color:#ef4444; font-size:13px;">Produto com código <strong>${termo}</strong> não encontrado no banco.</p>
                    </div>`
            }
        } catch { exibirErroImagem('Erro ao conectar com o servidor.') }

    } else if (tipo === 'ean') {
        try {
            const res  = await fetch(API+`/produtos/busca?q=${encodeURIComponent(termo)}`, { headers: authHeaders() })
            const data = await res.json()
            const prod = Array.isArray(data) ? data.find(p => p.ean === termo) : null
            if (prod) {
                document.getElementById('img-busca').value = prod.descricao
                await buscarImagemPorNome(prod.descricao, termo)
            } else {
                resultado.innerHTML = `
                    <div class="dash-glass dash-animate" style="padding:40px; text-align:center;">
                        <svg width="40" height="40" fill="none" stroke="rgba(239,68,68,0.4)" stroke-width="1.5" viewBox="0 0 24 24" style="margin:0 auto 12px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <p style="color:#ef4444; font-size:13px;">Produto com EAN <strong>${termo}</strong> não encontrado no banco.</p>
                    </div>`
            }
        } catch { exibirErroImagem('Erro ao conectar com o servidor.') }
    }
}

function mostrarSugestoes(termo) {
    const el = document.getElementById('img-sugestoes')
    if (!termo || termo.length < 2) { el.innerHTML = ''; return }

    const banco = typeof todosProdutos !== 'undefined' && todosProdutos.length > 0
        ? todosProdutos
        : (typeof placasBanco !== 'undefined' && placasBanco.length > 0 ? placasBanco : [])

    if (!banco.length) return

    const q = termo.toUpperCase()
    const resultados = banco.filter(p =>
        p.descricao?.toUpperCase().includes(q) || p.codigo?.includes(q)
    ).slice(0, 8)

    if (!resultados.length) { el.innerHTML = ''; return }

    el.innerHTML = `
        <div style="border:1px solid rgba(255,255,255,0.06); border-radius:12px; overflow:hidden;">
            ${resultados.map(p => `
                <div class="sugestao-item" data-nome="${p.descricao}" data-codigo="${p.codigo}"
                    style="padding:10px 16px; cursor:pointer; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.04); transition:all 0.15s;">
                    <span style="font-size:13px; font-weight:500; color:rgba(255,255,255,0.8);">${p.descricao}</span>
                    <span style="font-size:11px; color:rgba(255,255,255,0.3); font-family:monospace;">${p.codigo}</span>
                </div>
            `).join('')}
        </div>
    `

    el.querySelectorAll('.sugestao-item').forEach(item => {
        item.onmouseenter = () => { item.style.background = 'rgba(181,21,21,0.08)' }
        item.onmouseleave = () => { item.style.background = 'transparent' }
        item.onclick = () => {
            const nome   = item.getAttribute('data-nome')
            const codigo = item.getAttribute('data-codigo')
            document.getElementById('img-busca').value = nome
            el.innerHTML = ''
            buscarImagemPorNome(nome, codigo)
        }
    })
}

async function buscarImagemPorCodigo(codigo) {
    try {
        const res = await fetch(API+`/imagem?codigo=${encodeURIComponent(codigo)}`, {
            headers: authHeaders()
        })
        await exibirResultadoImagem(res, `Código: ${codigo}`)
    } catch { exibirErroImagem('Erro ao conectar com o servidor.') }
}

async function buscarImagemPorNome(nome, codigo) {
    try {
        if (!codigo) {
            try {
                const pRes = await fetch(API+`/produtos?descricao=${encodeURIComponent(nome)}&limit=1`, { headers: authHeaders() })
                if (pRes.ok) {
                    const pData = await pRes.json()
                    const prod  = Array.isArray(pData) ? pData[0] : null
                    if (prod && prod.codigo) codigo = prod.codigo
                }
            } catch {}
        }
        const res = await fetch(API+`/imagem?nome=${encodeURIComponent(nome)}`, {
            headers: authHeaders()
        })
        await exibirResultadoImagem(res, nome, codigo)
    } catch { exibirErroImagem('Erro ao conectar com o servidor.') }
}

async function exibirResultadoImagem(res, titulo, codigo) {
    const resultado = document.getElementById('img-resultado')

    if (res.ok) {
        const blob = await res.blob()
        const url  = URL.createObjectURL(blob)

        resultado.innerHTML = `
            <div class="dash-glass dash-animate" style="overflow:hidden;">
                <div style="padding:20px 24px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div class="dash-card-icon" style="background:rgba(34,197,94,0.12); color:#22c55e;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                        <div>
                            <h3 style="font-size:14px; font-weight:700; color:rgba(255,255,255,0.9); margin:0;">${titulo}</h3>
                            ${codigo ? `<p style="font-size:11px; color:rgba(255,255,255,0.3); margin:2px 0 0;">Código: ${codigo}</p>` : ''}
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                        <span style="padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; background:rgba(34,197,94,0.15); color:#22c55e; display:flex; align-items:center; gap:4px;">
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                            Imagem encontrada
                        </span>
                        ${codigo ? `<select id="img-status-select" style="padding:6px 10px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:11px; font-weight:600; background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.7); outline:none; cursor:pointer; transition:all 0.3s;">
                            <option value="pendente" style="background:#1a1a2e;">⏳ Pendente</option>
                            <option value="verificada" style="background:#1a1a2e;">✅ Verificada</option>
                            <option value="corrigir" style="background:#1a1a2e;">⚠️ Corrigir</option>
                            <option value="sem_imagem" style="background:#1a1a2e;">❌ Sem Imagem</option>
                        </select>` : ''}
                    </div>
                </div>
                <div style="padding:24px; display:flex; justify-content:center; background:rgba(0,0,0,0.2);">
                    <img id="img-exibida" src="${url}" alt="${titulo}"
                        style="max-width:100%; max-height:500px; object-fit:contain; border-radius:12px; box-shadow: 0 4px 24px rgba(0,0,0,0.3);">
                </div>
            </div>
        `

        const imgEl = document.getElementById('img-exibida')
        if (imgEl) imgEl.onload = () => URL.revokeObjectURL(imgEl.src)

        if (codigo) {
            try {
                const vRes  = await fetch(API+'/imagens/verificacao/' + codigo, { headers: authHeaders() })
                const vData = await vRes.json()
                const sel   = document.getElementById('img-status-select')
                if (sel) {
                    sel.value = vData.status || 'pendente'
                    imgAplicarCorStatus(sel)
                    sel.onchange = async () => {
                        imgAplicarCorStatus(sel)
                        await fetch(API+'/imagens/verificacao/' + codigo, {
                            method: 'POST', headers: authHeaders(),
                            body: JSON.stringify({ status: sel.value })
                        })
                    }
                }
            } catch (e) { console.warn('Erro ao carregar verificação:', e) }
        }
    } else {
        let nomeArquivo = titulo
        try {
            const data = await res.json()
            if (data.nome) nomeArquivo = data.nome
        } catch {}

        resultado.innerHTML = `
            <div class="dash-glass dash-animate" style="overflow:hidden;">
                <div style="padding:20px 24px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div class="dash-card-icon" style="background:rgba(239,68,68,0.12); color:#ef4444;">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        </div>
                        <div>
                            <h3 style="font-size:14px; font-weight:700; color:rgba(255,255,255,0.9); margin:0;">${titulo}</h3>
                            ${codigo ? `<p style="font-size:11px; color:rgba(255,255,255,0.3); margin:2px 0 0;">Código: ${codigo}</p>` : ''}
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                        <span style="padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; background:rgba(239,68,68,0.15); color:#ef4444; display:flex; align-items:center; gap:4px;">
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                            Imagem não encontrada
                        </span>
                        ${codigo ? `<select id="img-status-select" style="padding:6px 10px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:11px; font-weight:600; background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.7); outline:none; cursor:pointer; transition:all 0.3s;">
                            <option value="pendente" style="background:#1a1a2e;">⏳ Pendente</option>
                            <option value="verificada" style="background:#1a1a2e;">✅ Verificada</option>
                            <option value="corrigir" style="background:#1a1a2e;">⚠️ Corrigir</option>
                            <option value="sem_imagem" style="background:#1a1a2e;">❌ Sem Imagem</option>
                        </select>` : ''}
                    </div>
                </div>
                <div style="padding:40px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; background:rgba(0,0,0,0.2);">
                    <div style="width:100px; height:100px; border-radius:16px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:center;">
                        <svg width="40" height="40" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                    <div style="text-align:center;">
                        <p style="font-size:13px; color:rgba(255,255,255,0.5); margin:0;">Arquivo esperado:</p>
                        <code style="display:inline-block; margin-top:4px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); padding:4px 10px; border-radius:6px; font-size:11px; color:rgba(255,255,255,0.6); font-family:monospace;">${nomeArquivo}</code>
                    </div>
                    <p style="font-size:11px; color:rgba(255,255,255,0.25); margin:0;">Verifique se o arquivo existe em <code style="background:rgba(255,255,255,0.04); padding:2px 6px; border-radius:4px; font-size:10px;">E:\Banco de Imagens\</code></p>
                </div>
            </div>
        `

        if (codigo) {
            try {
                const vRes  = await fetch(API+'/imagens/verificacao/' + codigo, { headers: authHeaders() })
                const vData = await vRes.json()
                const sel   = document.getElementById('img-status-select')
                if (sel) {
                    sel.value = vData.status || 'pendente'
                    imgAplicarCorStatus(sel)
                    sel.onchange = async () => {
                        imgAplicarCorStatus(sel)
                        await fetch(API+'/imagens/verificacao/' + codigo, {
                            method: 'POST', headers: authHeaders(),
                            body: JSON.stringify({ status: sel.value })
                        })
                    }
                }
            } catch (e) { console.warn('Erro ao carregar verificação:', e) }
        }
    }
}

function exibirErroImagem(msg) {
    document.getElementById('img-resultado').innerHTML = `
        <div class="dash-glass dash-animate" style="padding:40px; text-align:center;">
            <svg width="40" height="40" fill="none" stroke="rgba(239,68,68,0.4)" stroke-width="1.5" viewBox="0 0 24 24" style="margin:0 auto 12px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p style="color:#ef4444; font-size:13px;">${msg}</p>
        </div>
    `
}

function imgAplicarCorStatus(sel) {
    const cores = {
        pendente:   ['rgba(255,255,255,0.04)','rgba(255,255,255,0.7)'],
        verificada: ['rgba(34,197,94,0.15)','#22c55e'],
        corrigir:   ['rgba(250,204,21,0.15)','#eab308'],
        sem_imagem: ['rgba(239,68,68,0.15)','#ef4444'],
    }
    const [bg, color] = cores[sel.value] || cores.pendente
    sel.style.background   = bg
    sel.style.color        = color
    sel.style.borderColor  = color
}
