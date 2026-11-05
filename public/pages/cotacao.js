async function carregarCotacao() {
    setActive('btn-cotacao')
    setConteudo(`
        <div class="dash-glass dash-animate" style="padding:20px; margin-bottom:24px;">
            <div style="display:flex; gap:12px; flex-wrap; align-items:end; margin-bottom:16px;">
                <div class="flex flex-col gap-1" style="flex:1; min-width:200px;">
                    <label style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Selecione a Lista</label>
                    <select id="cot-lista" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 14px; font-size:13px; color:#fafafa; outline:none; transition:all 0.3s;">
                        <option value="" style="background:#1a1a2e;">Carregando...</option>
                    </select>
                </div>
                <button id="cot-btn-carregar" style="padding:10px 20px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; gap:6px;">
                    <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> Carregar Dados
                </button>
                <button id="cot-btn-nova" style="padding:10px 18px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; font-weight:600; color:rgba(255,255,255,0.6); cursor:pointer; background:rgba(255,255,255,0.04); transition:all 0.3s; display:flex; align-items:center; gap:6px; margin-left:auto;">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> Nova Cotação
                </button>
            </div>
        </div>
        <div id="cot-graficos" class="dash-glass dash-animate" style="padding:20px; margin-bottom:24px; display:grid; grid-template-columns:1fr 1fr; gap:24px;"></div>
        <div id="cot-tabela" class="dash-table-wrap dash-glass dash-animate" style="padding:20px;">
            <p style="text-align:center; color:rgba(255,255,255,0.3); font-size:13px; padding:40px 0;">Selecione uma lista para comparar</p>
        </div>
    `, 'Cotação / Comparativo')

    let listas = []
    let itensLista = new Map()

    async function carregarListas() {
        try {
            const res = await fetch(API+'/listas', { headers: authHeaders() })
            listas = await res.json()
            const sel = document.getElementById('cot-lista')
            sel.innerHTML = '<option value="" style="background:#1a1a2e;">Selecione...</option>' + listas.map(l => `<option value="${l.id}" style="background:#1a1a2e;">${l.nome}</option>`).join('')
        } catch { alert('Erro ao carregar listas') }
    }

    async function carregarDados() {
        const id = document.getElementById('cot-lista').value
        if (!id) return

        const wrapper = document.getElementById('cot-tabela')
        wrapper.innerHTML = `<p style="text-align:center; color:rgba(255,255,255,0.4); font-size:13px; padding:40px 0;">Carregando...</p>`

        try {
            const res = await fetch(API+'/listas/' + id + '/itens', { headers: authHeaders() })
            const itens = await res.json()

            const total = itens.length
            const comPreco = itens.filter(i => i.preco != null && i.preco > 0).length
            const semPreco = total - comPreco

            const valores = itens.map(i => parseFloat(i.preco) || 0).filter(p => p > 0)
            const menor = valores.length ? Math.min(...valores) : 0
            const maior = valores.length ? Math.max(...valores) : 0
            const medio = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0

            document.getElementById('cot-graficos').innerHTML = `
                <div style="padding:16px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:12px;">
                    <h4 style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3); margin-bottom:8px;">Total de Itens</h4>
                    <p style="font-size:28px; font-weight:800; color:#b51515;">${total}</p>
                    <p style="font-size:11px; color:rgba(255,255,255,0.3); margin-top:4px;">${comPreco} com preço | ${semPreco} sem preço</p>
                </div>
                <div style="padding:16px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:12px;">
                    <h4 style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3); margin-bottom:8px;">Faixa de Preços</h4>
                    <p style="font-size:18px; font-weight:800; color:rgba(255,255,255,0.85);">R$ ${menor.toFixed(2).replace('.', ',')} — R$ ${maior.toFixed(2).replace('.', ',')}</p>
                    <p style="font-size:11px; color:rgba(255,255,255,0.3); margin-top:4px;">Média: R$ ${medio.toFixed(2).replace('.', ',')}</p>
                </div>
            `

            wrapper.innerHTML = `
                <div style="overflow-x:auto;">
                    <table class="dash-table">
                        <thead><tr style="background:rgba(255,255,255,0.02); color:rgba(255,255,255,0.3); font-size:10px; text-transform:uppercase; letter-spacing:0.06em; font-weight:700;">
                            <th style="padding:14px 16px; text-align:left;">#</th>
                            <th style="padding:14px 16px; text-align:left;">Código</th>
                            <th style="padding:14px 16px; text-align:left;">Descrição</th>
                            <th style="padding:14px 16px; text:right;">EAN</th>
                            <th style="padding:14px 16px; text-align:right;">Preço</th>
                        </tr></thead>
                        <tbody>
                            ${itens.map((p, i) => `
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.04); transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
                                    <td style="padding:10px 16px; color:rgba(255,255,255,0.3); font-size:12px;">${i + 1}</td>
                                    <td style="padding:10px 16px; color:rgba(255,255,255,0.4); font-family:monospace; font-size:12px;">${p.codigo || '—'}</td>
                                    <td style="padding:10px 16px; font-weight:500; color:rgba(255,255,255,0.85); font-size:13px;">${p.descricao || ''}</td>
                                    <td style="padding:10px 16px; text-align:right; color:rgba(255,255,255,0.3); font-size:11px; font-family:monospace;">${p.ean || '—'}</td>
                                    <td style="padding:10px 16px; text-align:right; font-weight:700; font-size:13px; color:${p.preco ? 'rgba(255,255,255,0.85)' : '#f59e0b'};">
                                        ${p.preco ? 'R$ ' + parseFloat(p.preco).toFixed(2).replace('.', ',') : '—'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `
        } catch {
            wrapper.innerHTML = `<p style="text-align:center; color:#ef4444; font-size:13px; padding:40px 0;">Erro ao carregar dados</p>`
        }
    }

    document.getElementById('cot-btn-carregar').onclick = carregarDados
    document.getElementById('cot-btn-nova').onclick = () => {
        const nome = prompt('Nome da nova lista de preços:')
        if (!nome) return
        fetch(API+'/listas', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ nome })
        }).then(() => carregarListas())
    }

    carregarListas()
}
