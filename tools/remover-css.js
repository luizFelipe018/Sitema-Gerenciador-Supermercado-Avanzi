// Remove regras de CSS cujo seletor contenha um termo (uso: node tools/remover-css.js arquivo termo)
// Remove blocos { ... } de forma balanceada, considerando media queries.
const fs = require('fs')

const arquivo = process.argv[2]
const termo = process.argv[3]
if (!arquivo || !termo) {
    console.error('Uso: node tools/remover-css.js <arquivo> <termo>')
    process.exit(1)
}

let css = fs.readFileSync(arquivo, 'utf8')
const antes = css.length

function removerBlocos(src, seletorContem) {
    let saida = ''
    let i = 0
    while (i < src.length) {
        // encontra o início de uma regra
        const abre = src.indexOf('{', i)
        if (abre === -1) { saida += src.slice(i); break }

        // volta até o início do seletor
        let inicio = abre
        while (inicio > 0 && src[inicio - 1] !== '}' && src[inicio - 1] !== ';' && src[inicio - 1] !== '\n') {
            inicio--
        }
        const seletor = src.slice(inicio, abre)

        // encontra o par de chaves
        let profundidade = 0
        let fim = abre
        for (; fim < src.length; fim++) {
            if (src[fim] === '{') profundidade++
            else if (src[fim] === '}') {
                profundidade--
                if (profundidade === 0) { fim++; break }
            }
        }

        const corpo = src.slice(abre, fim)

        if (seletor.toLowerCase().includes(seletorContem.toLowerCase())) {
            // descarta a regra inteira
            i = fim
            // remove a quebra de linha seguinte
            while (i < src.length && (src[i] === '\r' || src[i] === '\n')) i++
            continue
        }

        // recursa dentro de media queries / blocos aninhados (sem as chaves externas)
        let novoCorpo = corpo
        if (corpo.length > 2 && corpo.includes('{')) {
            const interno = corpo.slice(1, -1)
            novoCorpo = '{' + removerBlocos(interno, seletorContem) + '}'
        }
        saida += src.slice(i, inicio) + seletor + novoCorpo
        i = fim
    }
    return saida
}

css = removerBlocos(css, termo)
fs.writeFileSync(arquivo, css)
console.log(`removido: ${antes - css.length} caracteres`)
