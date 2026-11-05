// Verifica a consistência do menu e das páginas:
//  1. todo btn-* referenciado no JS existe no home.html
//  2. todo btn-* do home.html tem listener em algum JS
//  3. toda função carregar* chamada existe
//  4. todo <script src="pages/X.js"> tem o arquivo
//  5. páginas órfãs (arquivo existe mas não é carregado)
// Uso: node tools/verificar-menu.js
const fs = require('fs')
const path = require('path')

const raiz = path.resolve(__dirname, '..')
const homeHtml = fs.readFileSync(path.join(raiz, 'public/home.html'), 'utf8')
const homeJs = fs.readFileSync(path.join(raiz, 'public/home.js'), 'utf8')
const paginasDir = path.join(raiz, 'public/pages')

const arquivosPagina = fs.readdirSync(paginasDir).filter(f => f.endsWith('.js'))
const jsPaginas = arquivosPagina.map(f => fs.readFileSync(path.join(paginasDir, f), 'utf8')).join('\n')
const todoJs = homeJs + '\n' + jsPaginas

const problemas = []

// menu lateral = bloco <aside class="sidebar"> ... </aside>
const aside = (homeHtml.match(/<aside class="sidebar[\s\S]*?<\/aside>/) || [''])[0]

// 1. botões do menu usados pelo home.js (as páginas criam os seus via innerHTML)
const botoesUsados = [...new Set([...homeJs.matchAll(/getElementById\(['"](btn-[^'"]+)['"]\)/g)].map(m => m[1]))]
for (const id of botoesUsados) {
    if (!aside.includes(`id="${id}"`) && !homeHtml.includes(`id="${id}"`)) {
        problemas.push(`home.js usa #${id}, mas o botão não existe no HTML`)
    }
}

// 2. botões do menu sem listener
const botoesHtml = [...new Set([...aside.matchAll(/<button id="(btn-[^"]+)"/g)].map(m => m[1]))]
for (const id of botoesHtml) {
    if (!todoJs.includes(`'${id}'`)) {
        problemas.push(`menu tem #${id}, mas nenhum JS registra listener`)
    }
}

// 3. funções carregar* chamadas
const chamadas = [...new Set([...todoJs.matchAll(/carregar([A-Z]\w*)\(/g)].map(m => 'carregar' + m[1]))]
for (const fn of chamadas) {
    const def = new RegExp(`(function\\s+${fn}\\s*\\(|const\\s+${fn}\\s*=|async\\s+function\\s+${fn}\\s*\\()`)
    if (!def.test(todoJs)) {
        problemas.push(`função ${fn}() é chamada mas não existe`)
    }
}

// 4. scripts de página existentes
for (const m of homeHtml.matchAll(/<script src="pages\/([^"]+)"><\/script>/g)) {
    if (!fs.existsSync(path.join(paginasDir, m[1]))) {
        problemas.push(`home.html carrega pages/${m[1]} mas o arquivo não existe`)
    }
}

// 5. páginas órfãs
for (const f of arquivosPagina) {
    if (!homeHtml.includes(`pages/${f}`)) {
        problemas.push(`pages/${f} existe mas não é carregado no home.html`)
    }
}

// 6. rotas de API órfãs (arquivo em src/routes sem uso no app.js)
const appJs = fs.readFileSync(path.join(raiz, 'src/app.js'), 'utf8')
const routesDir = path.join(raiz, 'src/routes')
const arquivosRoute = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'))
for (const f of arquivosRoute) {
    const nome = f.replace(/\.js$/, '')
    if (!appJs.includes(`./routes/${nome}`) && !appJs.includes(`routes/${nome}`)) {
        problemas.push(`src/routes/${f} não é registrado no app.js`)
    }
}

if (problemas.length === 0) {
    console.log(`OK — ${botoesHtml.length} botões de menu, ${chamadas.length} páginas e ${arquivosRoute.length} rotas verificados`)
} else {
    console.log('PROBLEMAS encontrados:')
    problemas.forEach(p => console.log('  - ' + p))
    process.exitCode = 1
}
