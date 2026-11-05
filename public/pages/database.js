var dbTabelaAtual = ''
var dbPrimaryKeys = []

function carregarDatabase() {
    setActive('btn-database')
    setConteudo(`
        <style>
            .db-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:22px; }
            @media (max-width:500px) { .db-grid { grid-template-columns:1fr 1fr; } }
            .db-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
            .db-wrap table { min-width:600px; width:100%; }
            .db-cell { cursor:pointer; border-radius:4px; transition:background 0.15s; }
            .db-cell:hover { background:rgba(181,21,21,0.08); }
            .db-cell-editing { padding:0 !important; }
            .db-cell-editing input { width:100%; background:rgba(0,0,0,0.3); border:2px solid rgba(181,21,21,0.5); border-radius:4px; padding:4px 6px; font:inherit; color:#fafafa; outline:none; box-sizing:border-box; min-width:60px; }
        </style>
        <div id="db-wrapper">
            <div class="dash-glass dash-animate" style="padding:20px; margin-bottom:20px;">
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
                    <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                    <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Database Manager</span>
                </div>
                <div id="db-tables-grid" class="db-grid"></div>
            </div>
            <div id="db-detail" style="display:none;">
                <div class="dash-glass dash-animate" style="padding:20px; margin-bottom:20px;">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
                        <button id="db-voltar" style="padding:6px 12px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:11px; font-weight:600; color:rgba(255,255,255,0.4); cursor:pointer; background:transparent; transition:all 0.2s; display:flex; align-items:center; gap:4px;"
                            onmouseenter="this.style.background='rgba(255,255,255,0.06)';this.style.color='rgba(255,255,255,0.7)'"
                            onmouseleave="this.style.background='transparent';this.style.color='rgba(255,255,255,0.4)'">
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                            Voltar
                        </button>
                        <span id="db-table-name" style="font-size:13px; font-weight:700; color:rgba(255,255,255,0.85);"></span>
                    </div>
                    <div style="display:flex; gap:12px; margin-bottom:20px;">
                        <button id="db-tab-estrutura" class="db-tab" style="padding:6px 14px; border:1px solid rgba(181,21,21,0.3); border-radius:6px; font-size:11px; font-weight:600; cursor:pointer; background:rgba(181,21,21,0.1); color:#b51515;">Estrutura</button>
                        <button id="db-tab-dados" class="db-tab" style="padding:6px 14px; border:1px solid rgba(255,255,255,0.08); border-radius:6px; font-size:11px; font-weight:600; cursor:pointer; background:transparent; color:rgba(255,255,255,0.4);">Dados</button>
                    </div>
                    <div id="db-detail-content"></div>
                </div>
            </div>
        </div>
    `, 'Database')

    document.getElementById('db-voltar').onclick = () => {
        dbTabelaAtual = ''; dbPrimaryKeys = []
        document.getElementById('db-detail').style.display = 'none'
        document.getElementById('db-detail-content').innerHTML = ''
    }
    document.getElementById('db-tab-estrutura').onclick = () => {
        document.querySelectorAll('.db-tab').forEach(b => { b.style.background = 'transparent'; b.style.color = 'rgba(255,255,255,0.4)'; b.style.borderColor = 'rgba(255,255,255,0.08)' })
        const btn = document.getElementById('db-tab-estrutura')
        btn.style.background = 'rgba(181,21,21,0.1)'; btn.style.color = '#b51515'; btn.style.borderColor = 'rgba(181,21,21,0.3)'
        dbCarregarEstrutura(dbTabelaAtual)
    }
    document.getElementById('db-tab-dados').onclick = () => {
        document.querySelectorAll('.db-tab').forEach(b => { b.style.background = 'transparent'; b.style.color = 'rgba(255,255,255,0.4)'; b.style.borderColor = 'rgba(255,255,255,0.08)' })
        const btn = document.getElementById('db-tab-dados')
        btn.style.background = 'rgba(181,21,21,0.1)'; btn.style.color = '#b51515'; btn.style.borderColor = 'rgba(181,21,21,0.3)'
        dbCarregarDados(dbTabelaAtual, 1)
    }

    dbCarregarTabelas()
}

async function dbCarregarTabelas() {
    const grid = document.getElementById('db-tables-grid')
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:30px; color:rgba(255,255,255,0.15); font-size:12px;">Carregando...</div>'
    try {
        const res = await fetch(API+'/database/tables', { headers: authHeaders() })
        const tables = await res.json()
        if (!tables.length) { grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:30px; color:rgba(255,255,255,0.2); font-size:12px;">Nenhuma tabela.</div>'; return }
        grid.innerHTML = tables.map(t => {
            const n = t.TABLE_NAME; const rows = t.TABLE_ROWS != null ? parseInt(t.TABLE_ROWS).toLocaleString() : '?'
            return `<div onclick="dbAbrirTabela('${n}')" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:14px; cursor:pointer; transition:all 0.2s;"
                onmouseenter="this.style.background='rgba(181,21,21,0.08)';this.style.borderColor='rgba(181,21,21,0.2)'"
                onmouseleave="this.style.background='rgba(255,255,255,0.03)';this.style.borderColor='rgba(255,255,255,0.06)'">
                <div style="font-size:12px; font-weight:700; color:rgba(255,255,255,0.85); margin-bottom:4px; word-break:break-all;">${n}</div>
                <div style="display:flex; gap:8px; font-size:10px; color:rgba(255,255,255,0.3);"><span>${t.COLUMNS} col</span><span>${rows} linhas</span></div>
            </div>`
        }).join('')
    } catch { grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:30px; color:#ef4444; font-size:12px;">Erro ao conectar.</div>' }
}

async function dbAbrirTabela(nome) {
    dbTabelaAtual = nome; dbPrimaryKeys = []
    document.getElementById('db-table-name').textContent = nome
    document.getElementById('db-detail').style.display = 'block'
    try {
        const res = await fetch(API+'/database/tables/'+encodeURIComponent(nome), { headers: authHeaders() })
        const data = await res.json()
        dbPrimaryKeys = data.primaryKeys || []
    } catch { dbPrimaryKeys = [] }
    document.getElementById('db-tab-estrutura').click()
}

async function dbCarregarEstrutura(nome) {
    const container = document.getElementById('db-detail-content')
    container.innerHTML = '<div style="text-align:center; padding:30px; color:rgba(255,255,255,0.15); font-size:12px;">Carregando...</div>'
    try {
        const res = await fetch(API+'/database/tables/'+encodeURIComponent(nome), { headers: authHeaders() })
        const data = await res.json()
        if (!data.columns || !data.columns.length) { container.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.2); font-size:12px; padding:20px;">Nenhuma coluna.</p>'; return }
        container.innerHTML = `
            <div class="db-wrap"><table class="dash-table"><thead><tr>
                <th>Coluna</th><th>Tipo</th><th>Nulo</th><th>Key</th><th>Default</th><th>Extra</th>
            </tr></thead><tbody>
                ${data.columns.map(c => `<tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                    <td style="padding:8px 12px; font-weight:600; color:rgba(255,255,255,0.85); font-family:monospace; font-size:12px;">${c.COLUMN_NAME}</td>
                    <td style="padding:8px 12px; color:rgba(255,200,50,0.7); font-family:monospace; font-size:11px;">${c.COLUMN_TYPE}</td>
                    <td style="padding:8px 12px; font-size:11px; color:${c.IS_NULLABLE === 'YES' ? 'rgba(255,255,255,0.4)' : '#ef4444'};">${c.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}</td>
                    <td style="padding:8px 12px; font-size:11px; font-weight:600; color:${c.COLUMN_KEY === 'PRI' ? '#b51515' : c.COLUMN_KEY === 'UNI' ? '#22c55e' : 'rgba(255,255,255,0.4)'};">${c.COLUMN_KEY || '—'}</td>
                    <td style="padding:8px 12px; font-family:monospace; font-size:11px; color:rgba(255,255,255,0.4);">${c.COLUMN_DEFAULT != null ? c.COLUMN_DEFAULT : '<span style="color:rgba(255,255,255,0.15);">NULL</span>'}</td>
                    <td style="padding:8px 12px; font-size:11px; color:rgba(255,255,255,0.4);">${c.EXTRA || '—'}</td>
                </tr>`).join('')}
            </tbody></table></div>
            ${data.indexes && data.indexes.length ? `
                <div style="margin-top:16px;">
                    <div style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.25); margin-bottom:8px;">Índices</div>
                    <div class="db-wrap"><table class="dash-table"><thead><tr><th>Nome</th><th>Coluna</th><th>Único</th><th>Método</th></tr></thead><tbody>
                        ${data.indexes.map(idx => `<tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                            <td style="padding:6px 10px; font-family:monospace; font-size:11px; color:rgba(255,255,255,0.7);">${idx.Key_name}</td>
                            <td style="padding:6px 10px; font-family:monospace; font-size:11px; color:rgba(255,255,255,0.5);">${idx.Column_name}</td>
                            <td style="padding:6px 10px; font-size:11px; color:${idx.Non_unique === 0 ? '#22c55e' : 'rgba(255,255,255,0.4)'};">${idx.Non_unique === 0 ? 'Sim' : 'Não'}</td>
                            <td style="padding:6px 10px; font-size:11px; color:rgba(255,255,255,0.4);">${idx.Index_type}</td>
                        </tr>`).join('')}
                    </tbody></table></div>
                </div>` : ''}
        `
    } catch { container.innerHTML = '<p style="text-align:center; color:#ef4444; font-size:12px; padding:20px;">Erro ao carregar estrutura.</p>' }
}

async function dbCarregarDados(nome, pagina) {
    const container = document.getElementById('db-detail-content')
    container.innerHTML = '<div style="text-align:center; padding:30px; color:rgba(255,255,255,0.15); font-size:12px;">Carregando...</div>'
    try {
        if (!dbPrimaryKeys.length) {
            const res2 = await fetch(API+'/database/tables/'+encodeURIComponent(nome), { headers: authHeaders() })
            const meta = await res2.json()
            dbPrimaryKeys = meta.primaryKeys || []
        }
        const res = await fetch(API+'/database/tables/'+encodeURIComponent(nome)+'/data?page='+pagina+'&limit=50', { headers: authHeaders() })
        const json = await res.json()
        const rows = json.data || []; const total = json.total || 0; const page = json.page || 1; const limit = json.limit || 50
        const totalPages = Math.ceil(total / limit) || 1
        if (!rows.length) { container.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.2); font-size:12px; padding:20px;">Nenhum registro.</p>'; return }

        const cols = Object.keys(rows[0])
        let html = '<div class="db-wrap"><table class="dash-table"><thead><tr>'
        cols.forEach(c => { html += '<th style="padding:8px 10px; text-align:left; font-family:monospace; font-size:10px; white-space:nowrap;">' + c + '</th>' })
        html += '</tr></thead><tbody>'
        rows.forEach(r => {
            const pks = {}; dbPrimaryKeys.forEach(k => { pks[k] = r[k] })
            html += '<tr style="border-bottom:1px solid rgba(255,255,255,0.04);">'
            cols.forEach(c => {
                const isPk = dbPrimaryKeys.includes(c)
                const v = r[c]
                const txt = v === null ? '<span style="color:rgba(255,255,255,0.15);font-style:italic;">NULL</span>' : typeof v === 'object' ? '<span style="color:rgba(255,255,255,0.3);">[object]</span>' : String(v)
                const d = '"' + nome.replace(/"/g,'&quot;') + '"'
                const pkJson = encodeURIComponent(JSON.stringify(pks))
                const colJson = encodeURIComponent(c)
                html += '<td style="padding:6px 10px; font-size:11px; color:rgba(255,255,255,0.6); max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;' + (isPk ? ' font-weight:700;color:rgba(255,255,255,0.85);' : '') + '"'
                if (!isPk) html += ' class="db-cell" onclick="dbEditarCelula(this,' + d + ',\'' + colJson + '\',\'' + encodeURIComponent(JSON.stringify(pks)) + '\')"'
                html += '>' + txt + '</td>'
            })
            html += '</tr>'
        })
        html += '</tbody></table></div>'

        html += '<div style="display:flex; align-items:center; justify-content:space-between; padding:12px 0; font-size:11px; color:rgba(255,255,255,0.4); flex-wrap:wrap; gap:8px;">'
        html += '<span>' + total + ' registro(s) — pág ' + page + ' de ' + totalPages + '</span>'
        html += '<div style="display:flex; gap:6px;">'
        if (page > 1) html += '<button onclick="dbCarregarDados(\'' + nome + '\',' + (page - 1) + ')" style="padding:6px 12px; border:1px solid rgba(255,255,255,0.08); border-radius:6px; font-size:11px; cursor:pointer; background:transparent; color:rgba(255,255,255,0.4);">◀ Anterior</button>'
        if (page < totalPages) html += '<button onclick="dbCarregarDados(\'' + nome + '\',' + (page + 1) + ')" style="padding:6px 12px; border:1px solid rgba(255,255,255,0.08); border-radius:6px; font-size:11px; cursor:pointer; background:transparent; color:rgba(255,255,255,0.4);">Próxima ▶</button>'
        html += '</div></div>'

        container.innerHTML = html
    } catch { container.innerHTML = '<p style="text-align:center; color:#ef4444; font-size:12px; padding:20px;">Erro ao carregar dados.</p>' }
}

function dbEditarCelula(td, tabela, coluna, pkJson) {
    const valorAtual = td.textContent.trim()
    td.className = 'db-cell-editing'
    td.innerHTML = '<input type="text" value="' + valorAtual.replace(/"/g,'&quot;') + '">'
    const input = td.querySelector('input')
    input.focus()
    input.select()
    const salvar = async () => {
        const novo = input.value
        if (novo === valorAtual) { td.className = 'db-cell'; td.textContent = valorAtual; return }
        td.className = 'db-cell'
        td.textContent = '...'
        td.style.color = 'rgba(255,255,255,0.3)'
        try {
            const pks = JSON.parse(decodeURIComponent(pkJson))
            const params = { column: decodeURIComponent(coluna), value: novo, pks }
            const r = await fetch(API+'/database/tables/'+encodeURIComponent(tabela)+'/row', {
                method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
                body: JSON.stringify(params)
            })
            if (r.ok) { td.textContent = novo; td.style.color = '' } else { td.textContent = valorAtual; td.style.color = '#ef4444' }
        } catch { td.textContent = valorAtual; td.style.color = '#ef4444' }
        setTimeout(() => { td.style.color = '' }, 2000)
    }
    input.onblur = salvar
    input.onkeydown = (e) => { if (e.key === 'Enter') { input.blur() }; if (e.key === 'Escape') { td.className = 'db-cell'; td.textContent = valorAtual } }
}
