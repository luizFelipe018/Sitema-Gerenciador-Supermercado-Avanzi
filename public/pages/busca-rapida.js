let buscaRapidaTimer = null

/** Estilos próprios da Busca Rápida — injetados uma vez, escopados ao #conteudo. */
function brInjetarEstilos() {
    if (document.getElementById('br-styles')) return
    const style = document.createElement('style')
    style.id = 'br-styles'
    style.textContent = `
        @keyframes brFadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:none } }

        #conteudo > div.br-panel {
            background: var(--surface-1) !important;
            border: 1px solid var(--border);
            border-radius: var(--r-lg);
            padding: 22px;
            margin-bottom: 18px;
            box-shadow: var(--shadow-sm);
            animation: brFadeUp var(--dur) var(--ease-out) both;
        }
        #conteudo .br-head { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
        #conteudo .br-icon {
            width:34px; height:34px; flex:none; display:grid; place-items:center;
            border-radius:var(--r-sm); background:var(--brand-soft) !important; color:var(--brand-text) !important;
        }
        #conteudo .br-title {
            font-size:12px; font-weight:700; text-transform:uppercase;
            letter-spacing:.08em; color:var(--text-3) !important;
        }
        #conteudo .br-row { display:flex; gap:12px; align-items:stretch; }

        #conteudo .br-input {
            flex:1 1 280px; min-width:0; padding:13px 16px;
            border:1px solid var(--border-strong); border-radius:var(--r-md);
            background:var(--surface-2); color:var(--text-1); font-size:14px;
            outline:none; transition:border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease), background var(--dur);
        }
        #conteudo .br-input::placeholder { color:var(--text-3); }
        #conteudo .br-input:hover { border-color:var(--brand-soft-2); }
        #conteudo .br-input:focus { border-color:var(--brand); box-shadow:var(--ring); background:var(--surface-1); }

        #conteudo .br-btn {
            padding:0 24px; min-height:46px; border:0; border-radius:var(--r-md);
            font-size:13px; font-weight:700; color:var(--text-inv); background:var(--brand);
            box-shadow:0 4px 14px rgba(181,21,21,.28); cursor:pointer;
            transition:transform var(--dur) var(--ease), filter var(--dur), box-shadow var(--dur);
        }
        #conteudo .br-btn:hover { filter:brightness(1.08); transform:translateY(-1px); box-shadow:0 8px 20px rgba(181,21,21,.34); }
        #conteudo .br-btn:active { transform:translateY(0); }
        #conteudo .br-btn:focus-visible { outline:none; box-shadow:var(--ring); }

        #conteudo .br-sugestoes:empty { display:none; }
        #conteudo .br-sugestoes {
            margin-top:12px; max-height:340px; overflow-y:auto;
            border:1px solid var(--border); border-radius:var(--r-md);
            background:var(--surface-2); animation:brFadeUp var(--dur) var(--ease-out) both;
        }
        #conteudo .br-sugestao {
            display:flex; align-items:center; justify-content:space-between; gap:12px;
            padding:11px 16px; cursor:pointer; border-bottom:1px solid var(--border-soft);
            transition:background var(--dur), padding-left var(--dur) var(--ease);
        }
        #conteudo .br-sugestao:last-child { border-bottom:0; }
        #conteudo .br-sugestao:hover { background:var(--surface-hover); padding-left:20px; }
        #conteudo .br-sugestao-nome {
            font-size:13px; font-weight:500; color:var(--text-1);
            overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
        }
        #conteudo .br-sugestao-meta { display:flex; align-items:center; gap:14px; flex:none; }
        #conteudo .br-codigo { font-size:11px; font-family:ui-monospace,Consolas,monospace; color:var(--text-3) !important; }
        #conteudo .br-preco { font-size:13px; font-weight:700; color:var(--brand-text) !important; white-space:nowrap; }

        #conteudo .br-card {
            background:var(--surface-1); border:1px solid var(--border);
            border-radius:var(--r-lg); padding:22px; box-shadow:var(--shadow-sm);
            animation:brFadeUp var(--dur) var(--ease-out) both;
        }
        #conteudo .br-card-top { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:16px; margin-bottom:20px; }
        #conteudo .br-nome { font-size:18px; font-weight:700; color:var(--text-1); }
        #conteudo .br-meta { font-size:11px; color:var(--text-3) !important; margin-top:4px; }
        #conteudo .br-preco-grande { font-size:28px; font-weight:800; color:var(--brand-text) !important; text-align:right; line-height:1.1; }
        #conteudo .br-oferta { font-size:12px; font-weight:600; color:var(--ok) !important; text-align:right; margin-top:4px; }

        #conteudo .br-kpis { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; margin-bottom:20px; }
        #conteudo .br-kpi { padding:12px; background:var(--surface-2); border:1px solid var(--border-soft); border-radius:var(--r-sm); }
        #conteudo .br-kpi-label { font-size:10px; text-transform:uppercase; letter-spacing:.06em; color:var(--text-3) !important; }
        #conteudo .br-kpi-valor {
            font-size:13px; font-weight:600; color:var(--text-1) !important; margin-top:4px;
            overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
        }

        #conteudo .br-acoes { display:flex; gap:10px; flex-wrap:wrap; }
        #conteudo .br-acao {
            padding:9px 16px; border-radius:var(--r-sm); font-size:12px; font-weight:600;
            cursor:pointer; transition:transform var(--dur) var(--ease), filter var(--dur);
        }
        #conteudo .br-acao:hover { transform:translateY(-1px); filter:brightness(1.1); }
        #conteudo .br-acao-img { border:1px solid var(--info); color:var(--info); background:var(--info-soft); }
        #conteudo .br-acao-placa { border:1px solid var(--ok); color:var(--ok); background:var(--ok-soft); }

        #conteudo .br-estado { padding:40px 20px; text-align:center; color:var(--text-3) !important; font-size:13px; }
        #conteudo .br-estado-erro { color:var(--danger) !important; }
        #conteudo .br-foto {
            margin-top:16px; padding:16px; background:var(--surface-2);
            border-radius:var(--r-md); display:flex; justify-content:center;
        }
        #conteudo .br-foto img { max-height:300px; object-fit:contain; border-radius:var(--r-sm); }

        @media (min-width:768px) { #conteudo .br-kpis { grid-template-columns:repeat(4,minmax(0,1fr)); } }
        @media (max-width:640px) {
            #conteudo .br-row { flex-direction:column; }
            #conteudo .br-btn { width:100%; }
        }
        @media (prefers-reduced-motion:reduce) {
            #conteudo > div.br-panel, #conteudo .br-sugestoes, #conteudo .br-card { animation:none; }
            #conteudo .br-btn, #conteudo .br-sugestao, #conteudo .br-acao { transition:none; }
        }
    `
    document.head.appendChild(style)
}

async function carregarBuscaRapida() {
    brInjetarEstilos()
    setActive('btn-busca-rapida')
    setConteudo(`
        <div class="br-panel">
            <div class="br-head">
                <span class="br-icon">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </span>
                <span class="br-title">Busca Rápida de Produtos</span>
            </div>
            <div class="br-row">
                <input id="br-input" class="br-input" type="text" autofocus placeholder="Digite código, EAN ou descrição...">
                <button id="br-btn" class="br-btn" type="button">Buscar</button>
            </div>
            <div id="br-sugestoes" class="br-sugestoes"></div>
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

        el.innerHTML = resultados.map(p => `
            <div class="br-sugestao" data-codigo="${p.codigo}" data-desc="${p.descricao}" data-ean="${p.ean || ''}" data-preco="${p.preco_venda || ''}">
                <span class="br-sugestao-nome">${p.descricao}</span>
                <div class="br-sugestao-meta">
                    <span class="br-codigo">${p.codigo}</span>
                    <span class="br-preco">R$ ${parseFloat(p.preco_venda || 0).toFixed(2).replace('.', ',')}</span>
                </div>
            </div>
        `).join('')

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
    resultado.innerHTML = `<div class="br-card"><div class="br-estado">Buscando...</div></div>`

    try {
        const res = await fetch(API+`/produtos/${encodeURIComponent(termo)}`, { headers: authHeaders() })
        if (!res.ok) {
            resultado.innerHTML = `<div class="br-card"><div class="br-estado br-estado-erro">Produto não encontrado: <strong>${termo}</strong></div></div>`
            return
        }
        const prod = await res.json()
        resultado.innerHTML = `
            <div class="br-card">
                <div class="br-card-top">
                    <div>
                        <h3 class="br-nome">${prod.descricao}</h3>
                        <p class="br-meta">Código: ${prod.codigo} | EAN: ${prod.ean || '—'}</p>
                    </div>
                    <div>
                        <p class="br-preco-grande">R$ ${parseFloat(prod.preco_venda || 0).toFixed(2).replace('.', ',')}</p>
                        ${Number(prod.preco_oferta) > 0 ? `<p class="br-oferta">Oferta: R$ ${parseFloat(prod.preco_oferta).toFixed(2).replace('.', ',')}</p>` : ''}
                    </div>
                </div>
                <div class="br-kpis">
                    <div class="br-kpi"><p class="br-kpi-label">Departamento</p><p class="br-kpi-valor" title="${prod.descricao_departamento || ''}">${prod.descricao_departamento || '—'}</p></div>
                    <div class="br-kpi"><p class="br-kpi-label">Seção</p><p class="br-kpi-valor" title="${prod.secao || ''}">${prod.secao || '—'}</p></div>
                    <div class="br-kpi"><p class="br-kpi-label">Grupo</p><p class="br-kpi-valor" title="${prod.grupo || ''}">${prod.grupo || '—'}</p></div>
                    <div class="br-kpi"><p class="br-kpi-label">Marca</p><p class="br-kpi-valor" title="${prod.marca || ''}">${prod.marca || '—'}</p></div>
                </div>
                <div class="br-acoes">
                    <button id="br-btn-imagem" class="br-acao br-acao-img" type="button">📷 Ver Imagem</button>
                    <button id="br-btn-placa" class="br-acao br-acao-placa" type="button">🏷️ Gerar Placa</button>
                </div>
                <div id="br-acao-resultado"></div>
            </div>
        `

        document.getElementById('br-btn-imagem').onclick = async () => {
            document.getElementById('br-acao-resultado').innerHTML = `<div class="br-estado">Carregando imagem...</div>`
            try {
                const res = await fetch(API+`/imagem?nome=${encodeURIComponent(prod.descricao)}`, { headers: authHeaders() })
                if (res.ok) {
                    const blob = await res.blob()
                    const url = URL.createObjectURL(blob)
                    document.getElementById('br-acao-resultado').innerHTML = `
                        <div class="br-foto"><img src="${url}" alt="${prod.descricao}"></div>`
                } else {
                    document.getElementById('br-acao-resultado').innerHTML = `<div class="br-estado br-estado-erro">Imagem não encontrada</div>`
                }
            } catch {
                document.getElementById('br-acao-resultado').innerHTML = `<div class="br-estado br-estado-erro">Erro ao carregar imagem</div>`
            }
        }

        document.getElementById('br-btn-placa').onclick = () => {
            setActive('btn-placas')
            abrirSubmenuPlacas()
            carregarPlacasPequena()
            setTimeout(() => {
                document.getElementById('ean-input-pequena').value = prod.codigo
                document.getElementById('preco-input-pequena').value = prod.preco_venda || ''
                document.getElementById('preco-input-pequena').focus()
            }, 100)
        }
    } catch {
        resultado.innerHTML = `<div class="br-card"><div class="br-estado br-estado-erro">Erro ao conectar com o servidor</div></div>`
    }
}
