import { db } from './prisma/db';

async function main() {
  try {
    const resultado = await db('SELECT * FROM produtos');
    console.log('Produtos:', resultado);
  } catch (error) {
    console.error('Erro:', error);
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));