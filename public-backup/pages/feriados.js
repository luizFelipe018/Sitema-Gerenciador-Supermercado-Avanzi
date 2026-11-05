let ferAno = new Date().getFullYear()

function carregarFeriados() {
    setActive('btn-feriados')
    ferAno = new Date().getFullYear()

    setConteudo(`
        <div class="dash-glass dash-animate" style="padding:20px; margin-bottom:20px;">
            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span style="font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.4);">Feriados Nacionais</span>
                </div>
                <div style="display:flex; gap:8px; align-items:center;">
                    <button id="fer-ano-ant" style="padding:7px 10px; border:none; border-radius:8px; font-size:12px; font-weight:600; color:rgba(255,255,255,0.5); cursor:pointer; background:rgba(255,255,255,0.05); transition:all 0.3s; display:flex; align-items:center; gap:4px;"
                        onmouseenter="this.style.background='rgba(255,255,255,0.1)';this.style.color='#fff'"
                        onmouseleave="this.style.background='rgba(255,255,255,0.05)';this.style.color='rgba(255,255,255,0.5)'">
                        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <span id="fer-ano-label" style="font-size:16px; font-weight:700; color:rgba(255,255,255,0.85); min-width:60px; text-align:center;">${ferAno}</span>
                    <button id="fer-ano-prox" style="padding:7px 10px; border:none; border-radius:8px; font-size:12px; font-weight:600; color:rgba(255,255,255,0.5); cursor:pointer; background:rgba(255,255,255,0.05); transition:all 0.3s; display:flex; align-items:center; gap:4px;"
                        onmouseenter="this.style.background='rgba(255,255,255,0.1)';this.style.color='#fff'"
                        onmouseleave="this.style.background='rgba(255,255,255,0.05)';this.style.color='rgba(255,255,255,0.5)'">
                        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>
            </div>
        </div>

        <div id="fer-content" class="dash-table-wrap">
            <p style="text-align:center; color:rgba(255,255,255,0.2); font-size:13px; padding:50px 0;">Carregando feriados...</p>
        </div>
    `, 'Feriados')

    document.getElementById('fer-ano-ant').onclick = () => { ferAno--; ferBuscar() }
    document.getElementById('fer-ano-prox').onclick = () => { ferAno++; ferBuscar() }

    ferBuscar()
}

async function ferBuscar() {
    document.getElementById('fer-ano-label').textContent = ferAno
    const container = document.getElementById('fer-content')
    container.innerHTML = `<p style="text-align:center; color:rgba(255,255,255,0.2); font-size:13px; padding:50px 0;">Carregando...</p>`

    try {
        const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ferAno}`)
        if (!res.ok) throw new Error('Erro ao buscar feriados')
        const feriados = await res.json()

        if (!feriados.length) {
            container.innerHTML = `<p style="text-align:center; color:rgba(255,255,255,0.2); font-size:13px; padding:50px 0;">Nenhum feriado encontrado para ${ferAno}</p>`
            return
        }

        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

        const agrupados = {}
        feriados.forEach(f => {
            const [ano, mes, dia] = f.date.split('-').map(Number)
            const chave = `${mes}`
            if (!agrupados[chave]) agrupados[chave] = { mes: meses[mes - 1], itens: [] }
            agrupados[chave].itens.push({ ...f, dia, mes })
        })

        container.innerHTML = Object.keys(agrupados).sort((a, b) => a - b).map(chave => {
            const grupo = agrupados[chave]
            return `
                <div style="padding:16px 20px 8px;">
                    <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3); margin-bottom:8px;">${grupo.mes}</div>
                    ${grupo.itens.map(f => {
                        const data = new Date(f.date + 'T12:00:00')
                        const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'long' })
                        return `
                            <div style="display:flex; align-items:center; gap:12px; padding:8px 12px; border-radius:8px; transition:background 0.2s;"
                                onmouseenter="this.style.background='rgba(255,255,255,0.04)'"
                                onmouseleave="this.style.background='transparent'">
                                <div style="min-width:40px; text-align:center;">
                                    <div style="font-size:18px; font-weight:800; color:#fff; line-height:1.1;">${String(f.dia).padStart(2, '0')}</div>
                                    <div style="font-size:9px; font-weight:600; color:rgba(255,255,255,0.3); text-transform:uppercase;">${String(f.mes).padStart(2, '0')}</div>
                                </div>
                                <div style="flex:1;">
                                    <div style="font-size:13px; font-weight:600; color:rgba(255,255,255,0.85);">${f.name}</div>
                                    <div style="font-size:11px; color:rgba(255,255,255,0.3);">${diaSemana}</div>
                                </div>
                                <div style="font-size:18px;">${f.type === 'nacional' ? '🇧🇷' : f.type === 'estadual' ? '📍' : '🏛️'}</div>
                            </div>
                        `
                    }).join('')}
                </div>
            `
        }).join('')

    } catch (e) {
        container.innerHTML = `<p style="text-align:center; color:#ef4444; font-size:13px; padding:50px 0;">Erro: ${e.message}</p>`
    }
}
