import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL não encontrada." }, { status: 500 });
    }

    const sql = neon(dbUrl);

    // 1. Cria a tabela de usuarios
    await sql`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Adiciona a coluna usuario_id na tabela de pedidos se ela nao existir
    await sql`
      ALTER TABLE pedidos 
      ADD COLUMN IF NOT EXISTS usuario_id INT REFERENCES usuarios(id);
    `;

    return NextResponse.json({
      ok: true,
      mensagem: "Tabela 'usuarios' e relacionamento criados com sucesso no Neon DB!",
    });
  } catch (error: any) {
    console.error("Erro na migração:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}