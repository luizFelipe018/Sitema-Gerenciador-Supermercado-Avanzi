function carregarCapitalize() {
    setActive('btn-capitalize')
    setConteudo(`
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

            <div class="dash-glass dash-animate" style="padding:20px;">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                        <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><path d="M4 7V4h16v3"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                        <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Texto Original</span>
                    </div>
                    <button id="cap-btn-limpar" style="font-size:11px; color:rgba(255,255,255,0.3); background:none; border:none; cursor:pointer; transition:all 0.3s;"
                        onmouseenter="this.style.color='#ef4444'" onmouseleave="this.style.color='rgba(255,255,255,0.3)'">Limpar</button>
                </div>
                <textarea id="cap-entrada" rows="18" placeholder="Cole aqui o texto em MAIÚSCULAS..."
                    style="width:100%; padding:12px 14px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; color:#fafafa; background:#252525; outline:none; resize:vertical; font-family:monospace; box-sizing:border-box; transition:border-color 0.3s;"
                    onfocus="this.style.borderColor='rgba(181,21,21,0.4)'"
                    onblur="this.style.borderColor='rgba(255,255,255,0.08)'"></textarea>
                <button id="cap-btn-converter" style="margin-top:12px; width:100%; padding:12px; border:none; border-radius:10px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; background:linear-gradient(135deg,#b51515,#8a0f0f); box-shadow:0 4px 16px rgba(181,21,21,0.3); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);"
                    onmouseenter="this.style.transform='translateY(-2px) scale(1.02)';this.style.boxShadow='0 8px 24px rgba(181,21,21,0.4)'"
                    onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(181,21,21,0.3)'"
                    onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='translateY(-2px) scale(1.02)'">
                    ✨ Converter
                </button>
            </div>

            <div class="dash-glass dash-animate" style="padding:20px;">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                        <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                        <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Resultado</span>
                    </div>
                    <button id="cap-btn-copiar" style="font-size:11px; font-weight:600; padding:6px 12px; border:1px solid rgba(255,255,255,0.08); border-radius:8px; color:rgba(255,255,255,0.3); background:rgba(255,255,255,0.04); cursor:pointer; transition:all 0.3s;"
                        onmouseenter="this.style.borderColor='rgba(181,21,21,0.4)';this.style.color='#fff'"
                        onmouseleave="this.style.borderColor='rgba(255,255,255,0.08)';this.style.color='rgba(255,255,255,0.3)'">Copiar</button>
                </div>
                <textarea id="cap-saida" rows="18" placeholder="O texto convertido aparecerá aqui..."
                    style="width:100%; padding:12px 14px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:13px; color:#fafafa; background:#1a1a1a; outline:none; resize:vertical; font-family:monospace; box-sizing:border-box;" readonly></textarea>
                <p id="cap-info" style="font-size:11px; text-align:center; min-height:16px; margin-top:8px; color:rgba(255,255,255,0.25);"></p>
            </div>

        </div>

        <div class="dash-glass dash-animate" style="padding:20px; margin-top:20px;">
            <div class="flex items-center gap-2 mb-3">
                <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:rgba(255,255,255,0.3);">Exceções — palavras em minúsculo</span>
            </div>
            <div class="flex flex-wrap gap-2" id="cap-excecoes-lista">
                ${['de','da','do','das','dos','e','a','o','as','os','em','na','no','nas','nos','para','por','com','sem','ao','à','às','aos','um','uma'].map(w =>
                    `<span class="cap-excecao text-xs px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-600 cursor-pointer select-none hover:border-red-300 hover:text-red-500 transition-all" data-word="${w}">${w}</span>`
                ).join('')}
            </div>
            <p style="font-size:10px; color:rgba(255,255,255,0.2); margin-top:8px;">Clique para ativar/desativar cada exceção</p>
        </div>
    `, 'Capitalize')

    const excecoesAtivas = new Set(['de','da','do','das','dos','e','em','na','no','nas','nos','para','com','ao','à','às','aos'])

    document.querySelectorAll('.cap-excecao').forEach(span => {
        const word = span.getAttribute('data-word')
        if (excecoesAtivas.has(word)) {
            span.style.borderColor = 'rgba(181,21,21,0.4)'
            span.style.color = '#ef4444'
            span.style.background = 'rgba(181,21,21,0.08)'
        }

        span.onclick = () => {
            if (excecoesAtivas.has(word)) {
                excecoesAtivas.delete(word)
                span.style.borderColor = 'rgba(255,255,255,0.08)'
                span.style.color = 'rgba(255,255,255,0.3)'
                span.style.background = 'rgba(255,255,255,0.04)'
            } else {
                excecoesAtivas.add(word)
                span.style.borderColor = 'rgba(181,21,21,0.4)'
                span.style.color = '#ef4444'
                span.style.background = 'rgba(181,21,21,0.08)'
            }
        }
    })

    function capitalize(texto) {
        return texto.split('\n').map(linha => {
            if (!linha.trim()) return linha
            return linha.split(' ').map((palavra, idx) => {
                if (!palavra) return palavra
                const lower = palavra.toLowerCase()
                if (idx === 0) return capitalizar(palavra)
                if (excecoesAtivas.has(lower)) return lower
                return capitalizar(palavra)
            }).join(' ')
        }).join('\n')
    }

    function capitalizar(palavra) {
        if (!palavra) return palavra
        return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()
    }

    document.getElementById('cap-btn-converter').onclick = () => {
        const entrada = document.getElementById('cap-entrada').value
        if (!entrada.trim()) return

        const resultado = capitalize(entrada)
        document.getElementById('cap-saida').value = resultado

        const linhas = resultado.split('\n').filter(l => l.trim()).length
        const palavras = resultado.trim().split(/\s+/).length
        document.getElementById('cap-info').textContent = `${linhas} linha(s) · ${palavras} palavra(s) convertidas`
    }

    document.getElementById('cap-btn-limpar').onclick = () => {
        document.getElementById('cap-entrada').value = ''
        document.getElementById('cap-saida').value = ''
        document.getElementById('cap-info').textContent = ''
    }

    document.getElementById('cap-btn-copiar').onclick = () => {
        const saida = document.getElementById('cap-saida').value
        if (!saida) return
        navigator.clipboard.writeText(saida).then(() => {
            const btn = document.getElementById('cap-btn-copiar')
            const orig = btn.textContent
            btn.textContent = '✅ Copiado!'
            btn.style.color = '#22c55e'
            btn.style.borderColor = 'rgba(34,197,94,0.4)'
            setTimeout(() => { btn.textContent = orig; btn.style.color = ''; btn.style.borderColor = '' }, 1500)
        })
    }

    let debounce
    document.getElementById('cap-entrada').oninput = () => {
        clearTimeout(debounce)
        debounce = setTimeout(() => {
            document.getElementById('cap-btn-converter').click()
        }, 400)
    }
}
