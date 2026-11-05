async function carregarCalcKglt() {
    setActive('btn-calc-kglt')
    setConteudo(`
        <div class="dash-glass dash-animate" style="padding:20px; margin-bottom:20px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
                <h2 style="font-size:18px; font-weight:700; color:#fff; margin:0; display:flex; align-items:center; gap:8px;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="8" y1="2" x2="8" y2="8"/><line x1="16" y1="2" x2="16" y2="8"/><line x1="2" y1="8" x2="22" y2="8"/><line x1="8" y1="14" x2="8" y2="18"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="16" y1="14" x2="16" y2="18"/></svg>
                    Calculadora KG/LT
                </h2>
            </div>

            <div style="margin-bottom:16px;">
                <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3); display:block; margin-bottom:6px;">
                    Cole a lista de produtos (EAN - DESCRIÇÃO - PREÇO - LOJA)
                </label>
                <textarea id="ck-bloco" rows="5" placeholder="7896275901059 - IOGURTE FRIMESA GF 1250G COCO - 15,49 - SOMENTE LOJA 2&#10;7896275982720 - IOGURTE FRIMESA GF 1250G MORANGO - 15,49"
                    style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; width:100%; font-family:monospace; resize:none; transition:all 0.3s; box-sizing:border-box;"
                    onfocus="this.style.borderColor='rgba(181,21,21,0.5)';this.style.boxShadow='0 0 0 3px rgba(181,21,21,0.1)'"
                    onblur="this.style.borderColor='rgba(255,255,255,0.08)';this.style.boxShadow='none'"></textarea>
                <div style="display:flex; gap:12px; margin-top:8px; align-items:center; flex-wrap:wrap;">
                    <button id="ck-btn-processar" style="padding:10px 20px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.transform='translateY(-2px) scale(1.03)';this.style.boxShadow='0 8px 24px rgba(181,21,21,0.4)'"
                        onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(181,21,21,0.3)'"
                        onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='translateY(-2px) scale(1.03)'">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                        Calcular KG/LT
                    </button>
                    <button id="ck-btn-limpar" style="padding:10px 20px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:rgba(255,255,255,0.08); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; gap:6px;"
                        onmouseenter="this.style.background='rgba(255,255,255,0.15)';this.style.transform='translateY(-2px)'"
                        onmouseleave="this.style.background='rgba(255,255,255,0.08)';this.style.transform=''"
                        onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='translateY(-2px)'">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        Limpar
                    </button>
                    <p id="ck-status" style="font-size:12px; color:rgba(255,255,255,0.4); min-height:16px; margin:0;"></p>
                </div>
                <div id="ck-log-erros" style="display:none; margin-top:8px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); border-radius:10px; padding:14px 16px; font-size:12px; color:#f87171;">
                    <strong style="display:flex; align-items:center; gap:6px;">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        Produtos não encontrados no banco:
                    </strong>
                    <ul id="ck-lista-erros" style="margin-top:6px; padding-left:20px;"></ul>
                </div>
            </div>

            <div id="ck-tabela" style="overflow-x:auto;">
                <div style="text-align:center; padding:40px 20px; color:rgba(255,255,255,0.2); font-size:13px;">
                    Cole os produtos acima e clique em "Calcular KG/LT"
                </div>
            </div>
        </div>
    `)

    document.getElementById('ck-btn-processar').addEventListener('click', processarBloco)
    document.getElementById('ck-btn-limpar').addEventListener('click', limparTudo)
}

function parseLinha(linha) {
    const parts = linha.split(' - ').map(s => s.trim())
    if (parts.length < 3) return null
    const ean = parts[0]
    const descricao = parts[1]
    const precoStr = parts[2].replace('R$', '').replace(',', '.').trim()
    const preco = parseFloat(precoStr)
    if (isNaN(preco)) return null
    const loja = parts.length >= 4 ? parts.slice(3).join(' - ') : ''
    return { ean, descricao, preco, loja }
}

function extrairPeso(descricao) {
    const match = descricao.match(/(\d+)(G|KG|ML|L|LT)\b/i)
    if (!match) return null
    let valor = parseFloat(match[1])
    const unid = match[2].toUpperCase()
    if (unid === 'G') return { qtd: valor / 1000, un: 'KG' }
    if (unid === 'KG') return { qtd: valor, un: 'KG' }
    if (unid === 'ML') return { qtd: valor / 1000, un: 'LT' }
    if (unid === 'L' || unid === 'LT') return { qtd: valor, un: 'LT' }
    return null
}

async function processarBloco() {
    const texto = document.getElementById('ck-bloco').value.trim()
    if (!texto) return

    const statusEl = document.getElementById('ck-status')
    const logErros = document.getElementById('ck-log-erros')
    const listaErros = document.getElementById('ck-lista-erros')

    statusEl.textContent = 'Processando...'
    logErros.style.display = 'none'

    const linhas = texto.split('\n').filter(l => l.trim())
    const resultados = []
    const erros = []

    for (let i = 0; i < linhas.length; i++) {
        const parsed = parseLinha(linhas[i])
        if (!parsed) {
            erros.push(`Linha ${i+1}: formato inválido`)
            continue
        }

        let qtdKgL = null
        let unKgLt = null
        let precoKg = null

        if (parsed.ean) {
            try {
                const res = await fetch(`${API}/novidades/buscar-produto`, {
                    method: 'POST',
                    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ean: parsed.ean })
                })
                const data = await res.json()
                if (data.encontrado) {
                    const p = data.produto
                    qtdKgL = p.quantidade_kg_l
                    unKgLt = p.descricao_kglt
                    if (qtdKgL && qtdKgL > 0) {
                        precoKg = parsed.preco / qtdKgL
                    } else if (p.preco_venda_kg && p.preco_venda_kg > 0) {
                        precoKg = p.preco_venda_kg
                    }
                }
            } catch {}
        }

        if (!qtdKgL || !unKgLt) {
            const extraido = extrairPeso(parsed.descricao)
            if (extraido) {
                qtdKgL = extraido.qtd
                unKgLt = extraido.un
                if (qtdKgL > 0) precoKg = parsed.preco / qtdKgL
            }
        }

        resultados.push({
            ean: parsed.ean,
            descricao: parsed.descricao,
            preco: parsed.preco,
            loja: parsed.loja,
            quantidade_kg_l: qtdKgL,
            descricao_kglt: unKgLt,
            preco_kg: precoKg ? Math.round(precoKg * 100) / 100 : null
        })
    }

    if (erros.length) {
        logErros.style.display = 'block'
        listaErros.innerHTML = erros.map(e => `<li>${e}</li>`).join('')
    }

    renderizarTabela(resultados)
    statusEl.textContent = `${resultados.length} produto(s) calculado(s)`
}

function limparTudo() {
    document.getElementById('ck-bloco').value = ''
    document.getElementById('ck-status').textContent = ''
    document.getElementById('ck-log-erros').style.display = 'none'
    document.getElementById('ck-tabela').innerHTML = `
        <div style="text-align:center; padding:40px 20px; color:rgba(255,255,255,0.2); font-size:13px;">
            Cole os produtos acima e clique em "Calcular KG/LT"
        </div>`
}

function selecionarLinha(el) {
    document.querySelectorAll('.ck-row.selected').forEach(r => {
        r.classList.remove('selected')
        r.style.background = ''
        r.querySelectorAll('td').forEach(td => td.style.color = '')
    })
    el.classList.add('selected')
    el.style.background = 'linear-gradient(135deg, rgba(181,21,21,0.25), rgba(138,15,15,0.15))'
    el.querySelectorAll('td').forEach(td => td.style.color = '#fff')
}

function renderizarTabela(itens) {
    const container = document.getElementById('ck-tabela')
    if (!itens.length) {
        container.innerHTML = '<div style="text-align:center; padding:40px 20px; color:rgba(255,255,255,0.2); font-size:13px;">Nenhum resultado</div>'
        return
    }

    container.innerHTML = `
        <table style="width:100%; border-collapse:collapse; font-size:13px;">
            <thead>
                <tr style="background:rgba(255,255,255,0.04); border-bottom:1px solid rgba(255,255,255,0.08);">
                    <th style="padding:10px 12px; text-align:left; color:rgba(255,255,255,0.3); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em;">EAN</th>
                    <th style="padding:10px 12px; text-align:left; color:rgba(255,255,255,0.3); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em;">Descrição</th>
                    <th style="padding:10px 12px; text-align:right; color:rgba(255,255,255,0.3); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em;">Preço</th>
                    <th style="padding:10px 12px; text-align:center; color:rgba(255,255,255,0.3); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em;">Qtd</th>
                    <th style="padding:10px 12px; text-align:center; color:rgba(255,255,255,0.3); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em;">UN</th>
                    <th style="padding:10px 12px; text-align:right; color:rgba(255,255,255,0.3); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em;">Preço/KG</th>
                    <th style="padding:10px 12px; text-align:center; color:rgba(255,255,255,0.3); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em;">Loja</th>
                </tr>
            </thead>
            <tbody>
                ${itens.map(item => `
                    <tr class="ck-row" onclick="selecionarLinha(this)"
                        style="border-bottom:1px solid rgba(255,255,255,0.04); transition:all 0.2s; cursor:pointer;"
                        onmouseenter="if(!this.classList.contains('selected')){this.style.background='rgba(255,255,255,0.03)'}"
                        onmouseleave="if(!this.classList.contains('selected')){this.style.background=''}">
                        <td style="padding:10px 12px; color:rgba(255,255,255,0.4); font-family:monospace; font-size:12px;">${item.ean || '—'}</td>
                        <td style="padding:10px 12px; color:#fff; font-weight:500;">${item.descricao}</td>
                        <td style="padding:10px 12px; text-align:right; color:#f87171; font-weight:700;">R$ ${Number(item.preco).toFixed(2).replace('.',',')}</td>
                        <td style="padding:10px 12px; text-align:center; color:rgba(255,255,255,0.6);">${item.quantidade_kg_l ? Number(item.quantidade_kg_l).toFixed(3).replace('.',',') : '—'}</td>
                        <td style="padding:10px 12px; text-align:center; color:rgba(255,255,255,0.6);">${item.descricao_kglt || '—'}</td>
                        <td style="padding:10px 12px; text-align:right; color:${item.preco_kg ? '#34d399' : 'rgba(255,255,255,0.2)'}; font-weight:700;">
                            ${item.preco_kg ? 'R$ ' + Number(item.preco_kg).toFixed(2).replace('.',',') : '—'}
                        </td>
                        <td style="padding:10px 12px; text-align:center; color:rgba(255,255,255,0.4); font-size:12px;">${item.loja || '—'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `
}