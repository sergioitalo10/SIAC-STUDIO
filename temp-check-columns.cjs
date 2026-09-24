const fs = require('fs');
const path = require('path');

// Ler DATABASE_URL do .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/DATABASE_URL=(.+)/);
if (!match) {
  console.error('DATABASE_URL não encontrada');
  process.exit(1);
}
const dbUrl = match[1].trim();

const { neon } = require('@neondatabase/serverless');
const sql = neon(dbUrl);

sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'usuarios' ORDER BY ordinal_position`
  .then(r => {
    console.log('Colunas da tabela usuarios:');
    r.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));
    process.exit(0);
  })
  .catch(e => {
    console.error('Erro:', e.message);
    process.exit(1);
  });