const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const urlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
const dbUrl = urlMatch ? urlMatch[1] : null;
if (!dbUrl) {
  console.error('DATABASE_URL não encontrada');
  process.exit(1);
}

const sql = neon(dbUrl);

async function main() {
  try {
    console.log('=== Colunas de produtos ===');
    const colsProdutos = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'produtos' 
      ORDER BY ordinal_position
    `;
    colsProdutos.forEach(c => console.log(`  ${c.column_name}`));

    console.log('\n=== Colunas de usuarios ===');
    const colsUsuarios = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'usuarios' 
      ORDER BY ordinal_position
    `;
    colsUsuarios.forEach(c => console.log(`  ${c.column_name}`));

    console.log('\n=== Testandoquery de produtos ===');
    const produtos = await sql`
      SELECT id, nome, designer_id, criado_em
      FROM produtos
      ORDER BY criado_em DESC
      LIMIT 3
    `;
    console.log(`Encontrados: ${produtos.length} produtos`);

    console.log('\n✓ Verificação concluída');
  } catch (err) {
    console.error('Erro:', err.message);
    process.exit(1);
  }
}

main();