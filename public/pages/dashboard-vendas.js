async function carregarDashboardVendas() {
    setActive('btn-dashboard-vendas')
    setConteudo(`
        <div class="dash-glass dash-animate" style="padding:20px; margin-bottom:20px;">
            <div class="flex items-center gap-3 flex-wrap">
                <div class="flex items-center gap-2">
                    <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Período</span>
                </div>
                <select id="dv-periodo" style="padding:8px 12px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:12px; color:#fafafa; background:#252525; outline:none; transition:border-color 0.3s;"
                    onfocus="this.style.borderColor='rgba(181,21,21,0.4)'"
                    onblur="this.style.borderColor='rgba(255,255,255,0.08)'">
                    <option value="30">Últimos 30 dias</option>
                    <option value="7">Últimos 7 dias</option>
                    <option value="hoje">Hoje</option>
                </select>
                <button id="dv-btn-atualizar" style="padding:8px 16px; border:none; border-radius:8px; font-size:12px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); transition:all 0.3s;"
                    onmouseenter="this.style.opacity='0.85'" onmouseleave="this.style.opacity='1'">🔄 Atualizar</button>
            </div>
        </div>
        <div id="dv-cartoes" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5"></div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div class="dash-glass dash-animate" style="padding:20px;">
                <div class="flex items-center gap-2 mb-4">
                    <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Placas por Dia</span>
                </div>
                <div id="dv-grafico-dias" class="h-64 flex items-end gap-1"></div>
            </div>
            <div class="dash-glass dash-animate" style="padding:20px;">
                <div class="flex items-center gap-2 mb-4">
                    <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 010-5C7 4 6 9 6 9z"/><path d="M18 9h1.5a2.5 2.5 0 000-5C17 4 18 9 18 9z"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>
                    <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Top 10 Produtos</span>
                </div>
                <div id="dv-grafico-top" class="h-64 overflow-y-auto"></div>
            </div>
        </div>
    `, 'Dashboard de Vendas')

    async function carregarDados() {
        try {
            const res = await fetch(API+'/dashboard', { headers: authHeaders() })
            const dados = await res.json()

            const total = dados.placasMes?.total || 0
            const branca = dados.placasMes?.branca || 0
            const amarela = dados.placasMes?.amarela || 0
            const grande = dados.placasMes?.grande || 0

            document.getElementById('dv-cartoes').innerHTML = `
                <div class="dash-glass" style="padding:16px;">
                    <p style="font-size:10px; color:rgba(255,255,255,0.25); text-transform:uppercase;">Placas Mês</p>
                    <p style="font-size:24px; font-weight:800; color:rgba(181,21,21,0.9); margin-top:4px;">${total}</p>
                </div>
                <div class="dash-glass" style="padding:16px;">
                    <p style="font-size:10px; color:rgba(255,255,255,0.25); text-transform:uppercase;">Brancas</p>
                    <p style="font-size:24px; font-weight:800; color:rgba(255,255,255,0.7); margin-top:4px;">${branca}</p>
                </div>
                <div class="dash-glass" style="padding:16px;">
                    <p style="font-size:10px; color:rgba(255,255,255,0.25); text-transform:uppercase;">Amarelas</p>
                    <p style="font-size:24px; font-weight:800; color:#ca8a04; margin-top:4px;">${amarela}</p>
                </div>
                <div class="dash-glass" style="padding:16px;">
                    <p style="font-size:10px; color:rgba(255,255,255,0.25); text-transform:uppercase;">Grandes</p>
                    <p style="font-size:24px; font-weight:800; color:#3b82f6; margin-top:4px;">${grande}</p>
                </div>
            `

            renderizarGraficoDias(dados.placasDias || [])
            renderizarTop(dados.topProdutos || [])
        } catch (e) {
            console.error('Erro dashboard:', e)
        }
    }

    function renderizarGraficoDias(dados) {
        const container = document.getElementById('dv-grafico-dias')
        if (!dados.length) {
            container.innerHTML = `<p style="color:rgba(255,255,255,0.2); font-size:12px;">Sem dados</p>`
            return
        }

        const max = Math.max(...dados.map(d => d.total))
        container.innerHTML = dados.map(d => {
            const altura = max > 0 ? (d.total / max) * 100 : 0
            const data = new Date(d.dia).toLocaleDateString('pt-BR', { day: '2-digit' })
            return `
                <div class="flex-1 flex flex-col items-center gap-1">
                    <div style="width:100%; background:rgba(181,21,21,0.6); border-radius:4px 4px 0 0; height:${altura}%; min-height:4px; transition:height 0.3s;"></div>
                    <span style="font-size:9px; color:rgba(255,255,255,0.2);">${data}</span>
                    <span style="font-size:10px; font-weight:600; color:rgba(255,255,255,0.5);">${d.total}</span>
                </div>
            `
        }).join('')
    }

    function renderizarTop(dados) {
        const container = document.getElementById('dv-grafico-top')
        if (!dados.length) {
            container.innerHTML = `<p style="color:rgba(255,255,255,0.2); font-size:12px;">Sem dados</p>`
            return
        }

        container.innerHTML = dados.map(d => `
            <div class="flex items-center gap-3 py-2" style="border-bottom:1px solid rgba(255,255,255,0.04);">
                <div class="flex-1 min-w-0">
                    <p style="font-size:12px; font-weight:500; color:rgba(255,255,255,0.7); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${d.descricao}</p>
                    <p style="font-size:10px; color:rgba(255,255,255,0.25);">${d.tipo_placa}</p>
                </div>
                <span style="font-size:16px; font-weight:800; color:rgba(181,21,21,0.9);">${d.total}</span>
            </div>
        `).join('')
    }

    document.getElementById('dv-btn-atualizar').onclick = carregarDados
    carregarDados()
}
