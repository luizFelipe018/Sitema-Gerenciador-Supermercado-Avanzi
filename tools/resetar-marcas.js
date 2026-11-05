require('dotenv').config();
const fs = require('fs');
const mysql = require('mysql2/promise');
(async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'supermercado',
    port: process.env.DB_PORT || 3399
  });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const [rows] = await db.query(
    'SELECT codigo, descricao, marca FROM produtos ORDER BY codigo ASC'
  );
  const file = `tools/marcas-backup-${stamp}.json`;
  fs.writeFileSync(file, JSON.stringify(rows, null, 1));
  console.log('Backup salvo em:', file, '| registros:', rows.length);

  const [[c]] = await db.query('SELECT COUNT(*) n FROM produtos');
  console.log('Antes (total):', c.n);

  const [res] = await db.query('UPDATE produtos SET marca = NULL');
  console.log('Atualizados (marca -> NULL):', res.affectedRows);

  const [[d]] = await db.query('SELECT COUNT(*) n FROM produtos WHERE marca IS NOT NULL AND TRIM(marca) <> 0');
  console.log('Depois, com marca preenchida:', d.n);

  await db.end();
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
