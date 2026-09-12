import { db } from './prisma/db';

async function main() {
  const produtos = await db.query.produto.findMany();
  console.log('Produtos:', produtos);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));