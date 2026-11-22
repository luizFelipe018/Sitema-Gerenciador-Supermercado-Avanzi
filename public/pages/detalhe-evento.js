/* ═══════════════════════════════════════════════════════════════
   DETALHE DO EVENTO — nova guia aberta pelo duplo clique na Auditoria
   Design system v2 (public/design.css)
   ═══════════════════════════════════════════════════════════════ */

// O IP do servidor pode ser dinâmico (Electron/file://). Libera a origem da API na CSP.
;(function injetarServidorNaCsp() {
    const meta = document.getElementById('meta-csp')
    const origem = (String(API).match(/^https?:\/\/[^/]+/) || [''])[0]
    if (!meta || !origem) return
    const csp = meta.getAttribute('content') || ''
    if (!csp.includes(origem)) {
        meta.setAttribute('content', csp.replace(/(connect-src[^;]*)/, '$1 ' + origem))
    }
})()

document.getElementById('det-voltar').addEventListener('click', () => {
    if (window.opener && !window.opener.closed) window.close()
    else window.location.href = 'home.html'
})

carregarDetalheEvento()

async function carregarDetalheEvento() {
    const alvo = document.getElementById('det-conteudo')
    const id = new URLSearchParams(location.search).get('id')

    if (window.podeAcessar && !window.podeAcessar('auditoria')) {
        alvo.innerHTML = `<div class="ds-card ds-card-pad" style="max-width:520px; margin:40px auto; text-align:center">
            <div class="ds-empty-title">Acesso restrito</div>
            <div class="ds-empty-text">O detalhe da auditoria está disponível para gerentes e administradores.</div>
        </div>`
        return
    }
    if (!id) {
        alvo.innerHTML = `<div class="ds-card ds-card-pad">Evento não informado.</div>`
        return
    }

    try {
        const res = await fetch(API + '/auditoria/' + encodeURIComponent(id), { headers: authHeaders() })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Erro ao carregar o evento')

        const rotulo = (data.rotulos || {})[data.acao] || data.acao
        const detalhes = detParse(data.detalhes)
        const itens = Array.isArray(detalhes?.itens) ? detalhes.itens : []
        const qtd = Number(data.quantidade || itens.length || 0)
        const impressas = itens.filter(i => Number(i.impressa) === 1).length
        const pendentes = Math.max(qtd - impressas, 0)

        const kpis = itens.length ? `
            <div class="det-grid">
                <div class="det-kpi"><div class="det-kpi-label">Placas criadas</div><div class="det-kpi-valor">${qtd.toLocaleString('pt-BR')}</div></div>
                <div class="det-kpi"><div class="det-kpi-label">Impressas</div><div class="det-kpi-valor" style="color:var(--ok)">${impressas.toLocaleString('pt-BR')}</div></div>
                <div class="det-kpi"><div class="det-kpi-label">Pendentes</div><div class="det-kpi-valor" style="color:var(--warn)">${pendentes.toLocaleString('pt-BR')}</div></div>
            </div>` : ''

        const linhas = (chave, valor) => `<div class="det-linha"><div class="det-linha-chave">${chave}</div><div>${valor}</div></div>`

        const cabecalho = `
            <div class="ds-card ds-card-pad">
                <div class="ds-card-head" style="margin-bottom:10px">
                    <div class="ds-card-title">${detEsc(rotulo)}</div>
                    <span class="ds-chip">Evento #${detEsc(data.id)}</span>
                </div>
                ${linhas('Descrição', detEsc(data.descricao || '—'))}
                ${linhas('Data/Hora', detDataHora(data.criado_em))}
                ${linhas('Usuário', `<strong>${detEsc(data.nome || data.usuario || '—')}</strong>${data.usuario ? ` <span class="muted mono">(${detEsc(data.usuario)})</span>` : ''}`)}
                ${linhas('Cargo', detEsc(data.cargo || '—'))}
                ${linhas('Tipo de placa', detEsc(data.tipo_placa || '—'))}
                ${linhas('Quantidade', qtd ? `${qtd.toLocaleString('pt-BR')} placa(s)` : '—')}
                ${linhas('IP', detEsc(data.ip || '—'))}
            </div>`

        let corpo
        if (itens.length) {
            corpo = `
                <div class="ds-card ds-card-pad" style="margin-top:16px">
                    <div class="ds-card-head">
                        <div class="ds-card-title">Produtos deste evento</div>
                        <span class="ds-chip">${itens.length.toLocaleString('pt-BR')} item(ns)</span>
                    </div>
                    <div class="det-tabela-wrap">
                        <table class="ds-table-prod">
                            <thead><tr>
                                <th style="width:36px">#</th>
                                <th>Produto</th>
                                <th style="width:110px">Código</th>
                                <th style="width:120px">EAN</th>
                                <th style="width:100px; text-align:right">Preço</th>
                                <th style="width:90px">Tipo</th>
                                <th style="width:135px">Situação</th>
                                <th style="width:135px">Impresso em</th>
                            </tr></thead>
                            <tbody>
                                ${itens.map((item, i) => {
                                    const ok = Number(item.impressa) === 1
                                    return `<tr>
                                        <td class="muted">${i + 1}</td>
                                        <td class="strong">${detEsc(item.descricao || '—')}</td>
                                        <td class="mono">${detEsc(item.codigo || '—')}</td>
                                        <td class="mono muted">${detEsc(item.ean || '—')}</td>
                                        <td class="mono" style="text-align:right; font-weight:600; color:var(--brand-text)">${detPreco(item.preco)}</td>
                                        <td class="muted">${detEsc(item.tipo_placa || '—')}</td>
                                        <td><span class="ds-chip ${ok ? 'ds-chip-ok' : 'ds-chip-warn'}">${ok ? 'Impressa' : 'Pendente'}</span></td>
                                        <td class="mono muted">${detDataHora(item.impressa_em)}</td>
                                    </tr>`
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>`
        } else {
            const extra = detalhes ? `<pre style="white-space:pre-wrap; font-size:11.5px; color:var(--text-2)">${detEsc(JSON.stringify(detalhes, null, 2))}</pre>` : ''
            corpo = `<div class="ds-card ds-card-pad" style="margin-top:16px">
                <div class="ds-card-title">Este evento não gerou placas.</div>
                <div class="muted" style="font-size:12.5px; margin-top:6px">Os detalhes acima mostram quem realizou a ação e quando.</div>
                ${extra}
            </div>`
        }

        alvo.innerHTML = kpis + cabecalho + corpo
    } catch (e) {
        alvo.innerHTML = `<div class="ds-card ds-card-pad" style="color:var(--danger)">${detEsc(e.message)}</div>`
    }
}

function detParse(v) {
    if (!v) return null
    if (typeof v === 'object') return v
    try { return JSON.parse(v) } catch { return null }
}

function detEsc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]))
}

function detPreco(v) {
    if (v == null || v === '') return '—'
    const n = Number(v)
    return Number.isFinite(n) ? 'R$ ' + n.toFixed(2).replace('.', ',') : detEsc(v)
}

function detDataHora(v) {
    if (!v) return '—'
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return detEsc(v)
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(d)
}
