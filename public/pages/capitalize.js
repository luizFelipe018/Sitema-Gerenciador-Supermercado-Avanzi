/* ═══════════════════════════════════════════════════════════════
   CAPITALIZE — converte texto MAIÚSCULO para título, com exceções.
   Layout 100% no design system (sem Tailwind CDN).
   ═══════════════════════════════════════════════════════════════ */

function carregarCapitalize() {
    setActive('btn-capitalize')

    if (!document.getElementById('capitalize-style')) {
        const st = document.createElement('style')
        st.id = 'capitalize-style'
        st.textContent = `
            .cap-wrap { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px; }
            .cap-card { padding:20px; min-width:0; }
            .cap-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; }
            .cap-head-left { display:flex; align-items:center; gap:8px; min-width:0; }
            .cap-label {
                display:inline-flex; align-items:center; gap:7px; font-size:11px; font-weight:800;
                letter-spacing:0.06em; text-transform:uppercase; color:var(--text-3);
            }
            .cap-clear {
                font-size:11px; color:var(--text-3); background:none; border:none; cursor:pointer;
                padding:4px 7px; border-radius:6px; transition:all .2s;
            }
            .cap-clear:hover { color:var(--danger); background:var(--danger-soft); }
            .cap-ta {
                width:100%; min-height:390px; padding:12px 14px; border:1px solid var(--border);
                border-radius:10px; font-size:13px; color:var(--text-1); background:var(--surface-2);
                outline:none; resize:vertical; box-sizing:border-box; transition:border-color .2s;
                font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
            }
            .cap-ta:focus { border-color:var(--brand); }
            .cap-ta::placeholder { color:var(--text-3); }
            .cap-ta-out { background:var(--surface-0); }
            .cap-converter { margin-top:12px; width:100%; height:44px; }
            .cap-copy { height:30px; padding:0 12px; font-size:11px; font-weight:600; }
            .cap-info { font-size:11px; text-align:center; min-height:16px; margin-top:8px; color:var(--text-3); }
            .cap-ex-list { display:flex; flex-wrap:wrap; gap:8px; }
            .cap-ex {
                display:inline-flex; align-items:center; padding:5px 11px; border-radius:999px;
                border:1px solid var(--border); background:var(--surface-2); color:var(--text-2);
                font-size:11px; cursor:pointer; user-select:none; transition:all .2s;
            }
            .cap-ex:hover { border-color:var(--brand); color:var(--text-1); }
            .cap-ex.ativa { border-color:var(--brand-soft-2); color:var(--brand-text); background:var(--brand-soft); }
            .cap-hint { font-size:10px; color:var(--text-3); margin-top:10px; }
            @media (max-width: 900px) { .cap-wrap { grid-template-columns:1fr; } }
        `
        document.head.appendChild(st)
    }

    setConteudo(`
        <div class="cap-wrap fade-in">

            <div class="dash-glass dash-animate ds-card cap-card">
                <div class="cap-head">
                    <div class="cap-head-left">
                        <svg width="16" height="16" fill="none" stroke="var(--text-3)" stroke-width="2" viewBox="0 0 24 24"><path d="M4 7V4h16v3"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                        <span class="cap-label">Texto Original</span>
                    </div>
                    <button id="cap-btn-limpar" class="cap-clear" type="button">Limpar</button>
                </div>
                <textarea id="cap-entrada" class="cap-ta" placeholder="Cole aqui o texto em MAIÚSCULAS..." spellcheck="false"></textarea>
                <button id="cap-btn-converter" class="ds-btn ds-btn-primary cap-converter" type="button">
                    ✨ Converter
                </button>
            </div>

            <div class="dash-glass dash-animate ds-card cap-card">
                <div class="cap-head">
                    <div class="cap-head-left">
                        <svg width="16" height="16" fill="none" stroke="var(--text-3)" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                        <span class="cap-label">Resultado</span>
                    </div>
                    <button id="cap-btn-copiar" class="ds-btn ds-btn-sm cap-copy" type="button">Copiar</button>
                </div>
                <textarea id="cap-saida" class="cap-ta cap-ta-out" placeholder="O texto convertido aparecerá aqui..." readonly></textarea>
                <p id="cap-info" class="cap-info"></p>
            </div>

        </div>

        <div class="dash-glass dash-animate ds-card cap-card" style="margin-top:20px;">
            <div class="cap-head" style="margin-bottom:12px;">
                <div class="cap-head-left">
                    <svg width="14" height="14" fill="none" stroke="var(--text-3)" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    <span class="cap-label">Exceções — palavras em minúsculo</span>
                </div>
            </div>
            <div class="cap-ex-list" id="cap-excecoes-lista">
                ${['de','da','do','das','dos','e','a','o','as','os','em','na','no','nas','nos','para','por','com','sem','ao','à','às','aos','um','uma'].map(w =>
                    `<span class="cap-ex" data-word="${w}">${w}</span>`
                ).join('')}
            </div>
            <p class="cap-hint">Clique para ativar/desativar cada exceção</p>
        </div>
    `, 'Capitalize')

    const excecoesAtivas = new Set(['de','da','do','das','dos','e','em','na','no','nas','nos','para','com','ao','à','às','aos'])

    document.querySelectorAll('.cap-ex').forEach(span => {
        const word = span.getAttribute('data-word')
        span.classList.toggle('ativa', excecoesAtivas.has(word))

        span.onclick = () => {
            if (excecoesAtivas.has(word)) excecoesAtivas.delete(word)
            else excecoesAtivas.add(word)
            span.classList.toggle('ativa', excecoesAtivas.has(word))
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
            const orig = 'Copiar'
            btn.textContent = '✅ Copiado!'
            btn.classList.add('ds-btn-primary')
            setTimeout(() => { btn.textContent = orig; btn.classList.remove('ds-btn-primary') }, 1500)
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
