async function carregarGerenciadorPlacas() {
    setActive('btn-gerenciador-placas')
    setConteudo(`
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
            <div class="flex gap-3 flex-wrap items-end mb-4">
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">De</label>
                    <input type="date" id="gp-de" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Até</label>
                    <input type="date" id="gp-ate" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Descrição</label>
                    <input type="text" id="gp-desc" placeholder="Buscar descrição..."
                        class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
                </div>
                <button id="gp-btn-buscar" class="px-5 py-2 text-white text-sm font-semibold rounded-lg" style="background:#b51515;">🔍 Filtrar</button>
                <button id="gp-btn-limpar" class="px-5 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">Limpar</button>
            </div>
            <div class="flex gap-3 items-center border-t border-gray-100 pt-4">
                <div class="flex gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background:#dcfce7; color:#16a34a;" id="gp-contador-total">—</span>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background:#fef3c7; color:#92400e;" id="gp-contador-pendentes">—</span>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background:#d1fae5; color:#16a34a;" id="gp-contador-impressas">—</span>
                </div>
                <button id="gp-btn-exportar" class="px-4 py-2 bg-green-50 text-green-600 text-sm font-semibold rounded-lg hover:bg-green-100 transition-colors ml-auto">📥 Exportar XLSX</button>
            </div>
        </div>
        <div id="gp-tabela-wrapper" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <p class="text-center text-gray-400 text-sm py-10">Carregando registros...</p>
        </div>
    `, 'Gerenciador de Placas')

    const hoje = new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-')
    document.getElementById('gp-de').value = hoje
    document.getElementById('gp-ate').value = hoje

    let dadosAtuais = []

    async function carregarRegistros() {
        const de = document.getElementById('gp-de').value
        const ate = document.getElementById('gp-ate').value
        const desc = document.getElementById('gp-desc').value.trim()

        const params = new URLSearchParams()
        if (de) params.set('de', de)
        if (ate) params.set('ate', ate)
        if (desc) params.set('descricao', desc)

        const wrapper = document.getElementById('gp-tabela-wrapper')
        wrapper.innerHTML = `<p class="text-center text-gray-400 text-sm py-10">Carregando...</p>`

        try {
            const res = await fetch('http://localhost:3000/log-placas?' + params.toString(), { headers: authHeaders() })
            dadosAtuais = await res.json()

            const total = dadosAtuais.length
            const impressas = dadosAtuais.filter(p => p.impressa === 1).length
            const pendentes = total - impressas

            document.getElementById('gp-contador-total').textContent = `Total: ${total}`
            document.getElementById('gp-contador-pendentes').textContent = `Pendentes: ${pendentes}`
            document.getElementById('gp-contador-impressas').textContent = `Impressas: ${impressas}`

            if (!dadosAtuais.length) {
                wrapper.innerHTML = `<p class="text-center text-gray-400 text-sm py-10">Nenhum registro encontrado</p>`
                return
            }

            wrapper.innerHTML = `
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead><tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                            <th class="px-4 py-3 text-left">Data/Hora</th>
                            <th class="px-4 py-3 text-left">Descrição</th>
                            <th class="px-4 py-3 text-left">Código</th>
                            <th class="px-4 py-3 text-left">EAN</th>
                            <th class="px-4 py-3 text-right">Preço</th>
                            <th class="px-4 py-3 text-center">Tipo</th>
                            <th class="px-4 py-3 text-center">Status</th>
                        </tr></thead>
                        <tbody class="divide-y divide-gray-100" id="gp-tbody"></tbody>
                    </table>
                </div>
                <div id="gp-paginacao" class="flex items-center justify-between px-6 py-3 border-t border-gray-100 text-sm text-gray-500"></div>
            `

            renderizarTabelaGP(dadosAtuais, 1)
        } catch {
            wrapper.innerHTML = `<p class="text-center text-red-400 text-sm py-10">Erro ao conectar com o servidor</p>`
        }
    }

    function renderizarTabelaGP(dados, pagina) {
        const porPagina = 100
        const tbody = document.getElementById('gp-tbody')
        const paginacao = document.getElementById('gp-paginacao')
        const totalPaginas = Math.ceil(dados.length / porPagina) || 1
        const inicio = (pagina - 1) * porPagina
        const paginaDados = dados.slice(inicio, inicio + porPagina)

        tbody.innerHTML = paginaDados.map(p => `
            <tr class="hover:bg-gray-50 transition-colors ${p.impressa ? 'opacity-60' : ''}">
                <td class="px-4 py-2.5 text-gray-500 text-xs">${new Date(p.criado_em).toLocaleString('pt-BR')}</td>
                <td class="px-4 py-2.5 text-gray-800 font-medium">${p.descricao || '—'}</td>
                <td class="px-4 py-2.5 text-gray-400 text-xs font-mono">${p.codigo || '—'}</td>
                <td class="px-4 py-2.5 text-gray-400 text-xs font-mono">${p.ean || '—'}</td>
                <td class="px-4 py-2.5 text-right font-semibold text-gray-800">${p.preco != null ? 'R$ ' + parseFloat(p.preco).toFixed(2).replace('.', ',') : '—'}</td>
                <td class="px-4 py-2.5 text-center">
                    <span class="px-2 py-0.5 rounded text-xs font-semibold ${p.tipo_placa === 'branca' ? 'bg-gray-100 text-gray-600' : p.tipo_placa === 'amarela' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}">${p.tipo_placa}</span>
                </td>
                <td class="px-4 py-2.5 text-center">
                    <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${p.impressa ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}">${p.impressa ? '✅ Impressa' : '⏳ Pendente'}</span>
                </td>
            </tr>
        `).join('')

        if (paginacao) {
            paginacao.innerHTML = `
                <span>${dados.length} registro(s) — página ${pagina} de ${totalPaginas}</span>
                <div class="flex gap-2">
                    <button class="gp-pag-btn px-3 py-1 rounded border border-gray-200 text-xs hover:bg-gray-50" data-pag="${pagina - 1}" ${pagina === 1 ? 'disabled style="opacity:0.4"' : ''}>◀ Anterior</button>
                    <button class="gp-pag-btn px-3 py-1 rounded border border-gray-200 text-xs hover:bg-gray-50" data-pag="${pagina + 1}" ${pagina === totalPaginas ? 'disabled style="opacity:0.4"' : ''}>Próxima ▶</button>
                </div>`
            paginacao.querySelectorAll('.gp-pag-btn:not([disabled])').forEach(btn => {
                btn.onclick = () => {
                    const novaPag = parseInt(btn.getAttribute('data-pag'))
                    renderizarTabelaGP(dados, novaPag)
                }
            })
        }
    }

    document.getElementById('gp-btn-buscar').onclick = carregarRegistros
    document.getElementById('gp-btn-limpar').onclick = () => {
        document.getElementById('gp-de').value = hoje
        document.getElementById('gp-ate').value = hoje
        document.getElementById('gp-desc').value = ''
        carregarRegistros()
    }

    document.getElementById('gp-btn-exportar').onclick = () => {
        if (!dadosAtuais.length) { alert('Nenhum dado para exportar'); return }
        const cols = ['criado_em', 'descricao', 'codigo', 'ean', 'preco', 'tipo_placa', 'impressa']
        const header = cols.join('\t')
        const rows = dadosAtuais.map(p => cols.map(c => {
            if (c === 'criado_em') return new Date(p[c]).toLocaleString('pt-BR')
            if (c === 'preco') return p[c] != null ? parseFloat(p[c]).toFixed(2).replace('.', ',') : ''
            if (c === 'impressa') return p[c] ? 'Sim' : 'Não'
            return p[c] || ''
        }).join('\t')).join('\n')

        const blob = new Blob(['\ufeff' + header + '\n' + rows], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'placas_' + new Date().toISOString().slice(0, 10) + '.csv'
        a.click()
    }

    carregarRegistros()
}