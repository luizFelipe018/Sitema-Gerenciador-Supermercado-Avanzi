const fs = require('fs');
const path = require('path');
const backup = fs.readdirSync('tools').filter(f => f.startsWith('marcas-backup-') && f.endsWith('.json')).sort().pop();
if (!backup) { console.error('Backup nao encontrado'); process.exit(1); }
const rows = JSON.parse(fs.readFileSync(path.join('tools', backup), 'utf-8'));
const counts = new Map();
for (const r of rows) {
  const m = (r.marca || '').trim();
  if (!m) continue;
  counts.set(m, (counts.get(m) || 0) + 1);
}
const sorted = [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
console.log('Backup:', backup);
console.log('Marcas distintas:', sorted.length, '| Total produtos com marca:', [...counts.values()].reduce((s, n) => s + n, 0));

// 1) Lista simples: apenas nome (pronta para colar no Marcas em Massa)
const names = sorted.map(([full]) => {
  const nome = full.includes(' - ') ? full.split(' - ').slice(1).join(' - ').trim() : full;
  return nome;
}).sort((a, b) => a.localeCompare(b, 'pt-BR'));
fs.writeFileSync('tools/lista-marcas.txt', names.join('\n') + '\n');

// 2) Lista pronta para colar (TERMO = MARCA)
fs.writeFileSync('tools/lista-marcas-colar.txt', names.map(n => `${n} = ${n}`).join('\n') + '\n');

// 3) CSV com marca completa, nome e quantidade
const csv = 'marca_completa;nome_da_marca;qtd\n' + sorted.map(([full, n]) => {
  const nome = full.includes(' - ') ? full.split(' - ').slice(1).join(' - ').trim() : full;
  return `"${full.replace(/"/g, '""')}";"${nome.replace(/"/g, '""')}";${n}`;
}).join('\n') + '\n';
fs.writeFileSync('tools/lista-marcas.csv', csv);

console.log('Gerado tools/lista-marcas.txt');
console.log('Gerado tools/lista-marcas-colar.txt');
console.log('Gerado tools/lista-marcas.csv');
console.log('Top 15 por quantidade:');
[...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([m, n]) => console.log('  ', m, n));
