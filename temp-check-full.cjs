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
    console.log('=== Tabelas disponíveis ===');
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    tables.forEach(t => console.log(`  ${t.table_name}`));

    console.log('\n=== Colunas de usuarios ===');
    const colsUsuarios = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'usuarios' 
      ORDER BY ordinal_position
    `;
    colsUsuarios.forEach(c => console.log(`  ${c.column_name}`));

    console.log('\n=== Colunas de designers ===');
    const colsDesigners = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'designers' 
      ORDER BY ordinal_position
    `;
    colsDesigners.forEach(c => console.log(`  ${c.column_name}`));

    console.log('\n=== Colunas de pedidos ===');
    const colsPedidos = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'pedidos' 
      ORDER BY ordinal_position
    `;
    colsPedidos.forEach(c => console.log(`  ${c.column_name}`));

    console.log('\n=== Colunas de produtos ===');
    const colsProdutos = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'produtos' 
      ORDER BY ordinal_position
    `;
    colsProdutos.forEach(c => console.log(`  ${c.column_name}`));

    console.log('\n=== Colunas de pedido_itens ===');
    const colsPedidoItens = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'pedido_itens' 
      ORDER BY ordinal_position
    `;
    colsPedidoItens.forEach(c => console.log(`  ${c.column_name}`));

    console.log('\n✓ Verificação concluída');
  } catch (err) {
    console.error('Erro:', err.message);
    process.exit(1);
  }
}

main();