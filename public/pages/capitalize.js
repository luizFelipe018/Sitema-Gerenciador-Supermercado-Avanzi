function carregarCapitalize() {
    setActive('btn-capitalize')
    setConteudo(`
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

            <!-- Entrada -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
                <div class="flex items-center justify-between">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Texto Original (MAIÚSCULO)</label>
                    <button id="cap-btn-limpar" class="text-xs text-gray-400 hover:text-red-500 transition-all">🗑 Limpar</button>
                </div>
                <textarea id="cap-entrada" rows="18" placeholder="Cole aqui o texto em MAIÚSCULAS..."
                    class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none w-full font-mono"></textarea>
                <div class="flex gap-2">
                    <button id="cap-btn-converter" class="flex-1 py-2.5 text-white text-sm font-semibold rounded-lg" style="background:#b51515;">
                        ✨ Converter
                    </button>
                </div>
            </div>

            <!-- Saída -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
                <div class="flex items-center justify-between">
                    <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Resultado (Capitalize)</label>
                    <button id="cap-btn-copiar" class="text-xs font-semibold px-3 py-1 rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-all">
                        📋 Copiar tudo
                    </button>
                </div>
                <textarea id="cap-saida" rows="18" placeholder="O texto convertido aparecerá aqui..."
                    class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none w-full font-mono bg-gray-50" readonly></textarea>
                <p id="cap-info" class="text-xs text-gray-400 min-h-[16px]"></p>
            </div>

        </div>

        <!-- Opções -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mt-5">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Exceções — palavras que ficam em minúsculo</p>
            <div class="flex flex-wrap gap-2" id="cap-excecoes-lista">
                ${['de','da','do','das','dos','e','a','o','as','os','em','na','no','nas','nos','para','por','com','sem','ao','à','às','aos','um','uma'].map(w =>
                    `<span class="cap-excecao text-xs px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-600 cursor-pointer select-none hover:border-red-300 hover:text-red-500 transition-all" data-word="${w}">${w}</span>`
                ).join('')}
            </div>
            <p class="text-xs text-gray-400 mt-2">Clique para ativar/desativar cada exceção</p>
        </div>
    `, 'Capitalize')

    // Exceções ativas por padrão
    const excecoesAtivas = new Set(['de','da','do','das','dos','e','em','na','no','nas','nos','para','com','ao','à','às','aos'])

    // Toggle exceções
    document.querySelectorAll('.cap-excecao').forEach(span => {
        const word = span.getAttribute('data-word')
        if (excecoesAtivas.has(word)) span.classList.add('border-red-300', 'text-red-500', 'bg-red-50')

        span.onclick = () => {
            if (excecoesAtivas.has(word)) {
                excecoesAtivas.delete(word)
                span.classList.remove('border-red-300', 'text-red-500', 'bg-red-50')
            } else {
                excecoesAtivas.add(word)
                span.classList.add('border-red-300', 'text-red-500', 'bg-red-50')
            }
        }
    })

    function capitalize(texto) {
        return texto.split('\n').map(linha => {
            if (!linha.trim()) return linha
            return linha.split(' ').map((palavra, idx) => {
                if (!palavra) return palavra
                const lower = palavra.toLowerCase()
                // Primeira palavra da linha sempre capitaliza
                if (idx === 0) return capitalizar(palavra)
                // Exceções ficam em minúsculo
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
        const ta = document.createElement('textarea')
        ta.value = saida
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        const btn = document.getElementById('cap-btn-copiar')
        const orig = btn.textContent
        btn.textContent = '✅ Copiado!'
        btn.style.color = '#16a34a'
        btn.style.borderColor = '#16a34a'
        setTimeout(() => {
            btn.textContent = orig
            btn.style.color = ''
            btn.style.borderColor = ''
        }, 1500)
    }

    // Converte automaticamente ao digitar (com debounce)
    let debounce
    document.getElementById('cap-entrada').oninput = () => {
        clearTimeout(debounce)
        debounce = setTimeout(() => {
            document.getElementById('cap-btn-converter').click()
        }, 400)
    }
}