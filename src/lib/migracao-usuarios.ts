import { neon } from "@neondatabase/serverless";

export async function criarTabelaUsuarios() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL não configurada.");

  const sql = neon(dbUrl);

  // 1. Cria a tabela de usuários/clientes
  await sql`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      senha_hash VARCHAR(255) NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 2. Adiciona a coluna usuario_id na tabela de pedidos se ela não existir
  await sql`
    ALTER TABLE pedidos 
    ADD COLUMN IF NOT EXISTS usuario_id INT REFERENCES usuarios(id);
  `;

  console.log("Tabela 'usuarios' e relacionamento com 'pedidos' criados no Neon com sucesso!");
}