let buscaRapidaTimer = null

async function carregarBuscaRapida() {
    setActive('btn-busca-rapida')
    setConteudo(`
        <div class="dash-glass dash-animate" style="padding:20px; margin-bottom:20px;">
            <div class="flex items-center gap-3 mb-4">
                <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <span style="font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.4);">Busca Rápida de Produtos</span>
            </div>
            <div class="flex gap-3">
                <input id="br-input" type="text" autofocus placeholder="Digite código, EAN ou descrição..."
                    style="flex:1; padding:12px 16px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:14px; color:#fafafa; background:#252525; outline:none; transition:border-color 0.3s; box-sizing:border-box;"
                    onfocus="this.style.borderColor='rgba(181,21,21,0.4)'"
                    onblur="this.style.borderColor='rgba(255,255,255,0.08)'">
                <button id="br-btn" style="padding:12px 24px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s;"
                    onmouseenter="this.style.opacity='0.85'" onmouseleave="this.style.opacity='1'">Buscar</button>
            </div>
            <div id="br-sugestoes" style="margin-top:12px;"></div>
        </div>
        <div id="br-resultado"></div>
    `, 'Busca Rápida')

    const input = document.getElementById('br-input')
    input.focus()

    input.oninput = () => {
        clearTimeout(buscaRapidaTimer)
        if (input.value.length < 2) {
            document.getElementById('br-sugestoes').innerHTML = ''
            return
        }
        buscaRapidaTimer = setTimeout(() => buscarSugestoesBR(input.value.trim()), 250)
    }

    input.onkeydown = (e) => {
        if (e.key === 'Enter') {
            clearTimeout(buscaRapidaTimer)
            document.getElementById('br-sugestoes').innerHTML = ''
            executarBuscaRapida(input.value.trim())
        }
    }

    document.getElementById('br-btn').onclick = () => {
        clearTimeout(buscaRapidaTimer)
        document.getElementById('br-sugestoes').innerHTML = ''
        executarBuscaRapida(input.value.trim())
    }
}

async function buscarSugestoesBR(termo) {
    const el = document.getElementById('br-sugestoes')
    if (!termo || termo.length < 2) { el.innerHTML = ''; return }

    try {
        const res = await fetch(API+`/produtos/busca?q=${encodeURIComponent(termo)}`, { headers: authHeaders() })
        const resultados = await res.json()
        if (!resultados.length) { el.innerHTML = ''; return }

        el.innerHTML = `
            <div class="dash-glass" style="padding:8px; overflow:hidden;">
                ${resultados.map(p => `
                    <div class="br-sugestao flex items-center justify-between px-4 py-2.5 rounded-lg cursor-pointer transition-all"
                        style="transition:background 0.2s;"
                        data-codigo="${p.codigo}" data-desc="${p.descricao}" data-ean="${p.ean || ''}" data-preco="${p.preco_venda || ''}"
                        onmouseenter="this.style.background='rgba(255,255,255,0.05)'"
                        onmouseleave="this.style.background='transparent'">
                        <span style="font-size:13px; font-weight:500; color:rgba(255,255,255,0.85);">${p.descricao}</span>
                        <div class="flex items-center gap-3">
                            <span style="font-size:11px; color:rgba(255,255,255,0.3); font-family:monospace;">${p.codigo}</span>
                            <span style="font-size:13px; font-weight:700; color:rgba(181,21,21,0.9);">R$ ${parseFloat(p.preco_venda || 0).toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `

        el.querySelectorAll('.br-sugestao').forEach(item => {
            item.onclick = () => {
                const codigo = item.getAttribute('data-codigo')
                document.getElementById('br-sugestoes').innerHTML = ''
                executarBuscaRapida(codigo)
            }
        })
    } catch {}
}

async function executarBuscaRapida(termo) {
    if (!termo) return
    const resultado = document.getElementById('br-resultado')
    resultado.innerHTML = `<div class="dash-glass dash-animate" style="padding:40px; text-align:center;"><p style="color:rgba(255,255,255,0.3); font-size:13px;">Buscando...</p></div>`

    try {
        const res = await fetch(API+`/produtos/${encodeURIComponent(termo)}`, { headers: authHeaders() })
        if (!res.ok) {
            resultado.innerHTML = `<div class="dash-glass dash-animate" style="padding:40px; text-align:center;"><p style="color:#ef4444; font-size:13px;">Produto não encontrado: <strong>${termo}</strong></p></div>`
            return
        }
        const prod = await res.json()
        resultado.innerHTML = `
            <div class="dash-glass dash-animate" style="padding:20px;">
                <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
                    <div>
                        <h3 style="font-size:18px; font-weight:700; color:rgba(255,255,255,0.9);">${prod.descricao}</h3>
                        <p style="font-size:11px; color:rgba(255,255,255,0.3); margin-top:4px;">Código: ${prod.codigo} | EAN: ${prod.ean || '—'}</p>
                    </div>
                    <div style="text-align:right;">
                        <p style="font-size:28px; font-weight:800; color:rgba(181,21,21,0.9);">R$ ${parseFloat(prod.preco_venda || 0).toFixed(2).replace('.', ',')}</p>
                        ${prod.preco_oferta ? `<p style="font-size:12px; font-weight:600; color:#22c55e;">Oferta: R$ ${parseFloat(prod.preco_oferta).toFixed(2).replace('.', ',')}</p>` : ''}
                    </div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div style="padding:12px; background:rgba(255,255,255,0.03); border-radius:8px;">
                        <p style="font-size:10px; color:rgba(255,255,255,0.25); text-transform:uppercase;">Departamento</p>
                        <p style="font-size:13px; font-weight:600; color:rgba(255,255,255,0.7);">${prod.descricao_departamento || '—'}</p>
                    </div>
                    <div style="padding:12px; background:rgba(255,255,255,0.03); border-radius:8px;">
                        <p style="font-size:10px; color:rgba(255,255,255,0.25); text-transform:uppercase;">Seção</p>
                        <p style="font-size:13px; font-weight:600; color:rgba(255,255,255,0.7);">${prod.secao || '—'}</p>
                    </div>
                    <div style="padding:12px; background:rgba(255,255,255,0.03); border-radius:8px;">
                        <p style="font-size:10px; color:rgba(255,255,255,0.25); text-transform:uppercase;">Grupo</p>
                        <p style="font-size:13px; font-weight:600; color:rgba(255,255,255,0.7);">${prod.grupo || '—'}</p>
                    </div>
                    <div style="padding:12px; background:rgba(255,255,255,0.03); border-radius:8px;">
                        <p style="font-size:10px; color:rgba(255,255,255,0.25); text-transform:uppercase;">Marca</p>
                        <p style="font-size:13px; font-weight:600; color:rgba(255,255,255,0.7);">${prod.marca || '—'}</p>
                    </div>
                </div>
                <div class="flex gap-3 flex-wrap">
                    <button id="br-btn-imagem" style="padding:8px 16px; border:1px solid rgba(59,130,246,0.3); border-radius:8px; font-size:12px; font-weight:600; color:#3b82f6; background:rgba(59,130,246,0.08); cursor:pointer; transition:all 0.3s;"
                        onmouseenter="this.style.background='rgba(59,130,246,0.15)'" onmouseleave="this.style.background='rgba(59,130,246,0.08)'">📷 Ver Imagem</button>
                    <button id="br-btn-placa" style="padding:8px 16px; border:1px solid rgba(34,197,94,0.3); border-radius:8px; font-size:12px; font-weight:600; color:#22c55e; background:rgba(34,197,94,0.08); cursor:pointer; transition:all 0.3s;"
                        onmouseenter="this.style.background='rgba(34,197,94,0.15)'" onmouseleave="this.style.background='rgba(34,197,94,0.08)'">🏷️ Gerar Placa</button>
                </div>
                <div id="br-acao-resultado" style="margin-top:16px;"></div>
            </div>
        `

        document.getElementById('br-btn-imagem').onclick = async () => {
            document.getElementById('br-acao-resultado').innerHTML = `<div style="padding:20px; text-align:center; color:rgba(255,255,255,0.3); font-size:13px;">Carregando imagem...</div>`
            try {
                const res = await fetch(API+`/imagem?nome=${encodeURIComponent(prod.descricao)}`, { headers: authHeaders() })
                if (res.ok) {
                    const blob = await res.blob()
                    const url = URL.createObjectURL(blob)
                    document.getElementById('br-acao-resultado').innerHTML = `
                        <div style="padding:16px; background:rgba(255,255,255,0.03); border-radius:10px; display:flex; justify-content:center;">
                            <img src="${url}" style="max-height:300px; object-fit:contain; border-radius:8px;">
                        </div>`
                } else {
                    document.getElementById('br-acao-resultado').innerHTML = `<div style="padding:20px; text-align:center; color:#ef4444; font-size:13px;">Imagem não encontrada</div>`
                }
            } catch { document.getElementById('br-acao-resultado').innerHTML = `<div style="padding:20px; text-align:center; color:#ef4444; font-size:13px;">Erro ao carregar imagem</div>` }
        }

        document.getElementById('br-btn-placa').onclick = () => {
            setActive('btn-placas')
            abrirSubmenuPlacas()
            carregarPlacas()
            setTimeout(() => {
                document.getElementById('ean-input').value = prod.codigo
                document.getElementById('preco-input').value = prod.preco_venda || ''
                document.getElementById('preco-input').focus()
            }, 100)
        }
    } catch {
        resultado.innerHTML = `<div class="dash-glass dash-animate" style="padding:40px; text-align:center;"><p style="color:#ef4444; font-size:13px;">Erro ao conectar com o servidor</p></div>`
    }
}
