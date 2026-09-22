import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL não configurada" }, { status: 500 });
    }

    const sql = neon(dbUrl);

    // Cria tabelas necessárias
    await sql`
      CREATE TABLE IF NOT EXISTS designers (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS designer_artworks (
        id SERIAL PRIMARY KEY,
        designer_id INT REFERENCES designers(id) ON DELETE CASCADE,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT,
        categoria VARCHAR(100),
        preco NUMERIC(10,2) NOT NULL,
        imagem_url VARCHAR(500),
        arquivo_url VARCHAR(500),
        thumbnail_url VARCHAR(500),
        tags TEXT[],
        status VARCHAR(20) DEFAULT 'pending',
        observacoes TEXT,
        aprovado_em TIMESTAMP,
        rejeitado_em TIMESTAMP,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS designer_earnings (
        id SERIAL PRIMARY KEY,
        pedido_id INT NOT NULL,
        designer_artwork_id INT NOT NULL,
        designer_id INT NOT NULL,
        valor_venda NUMERIC(10,2) NOT NULL,
        valor_comissao NUMERIC(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pendente',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      ALTER TABLE pedido_itens ADD COLUMN IF NOT EXISTS designer_artwork_id INT
    `;

    await sql`
      ALTER TABLE pedido_itens ADD COLUMN IF NOT EXISTS designer_id INT
    `;

    await sql`
      ALTER TABLE pedido_itens ADD COLUMN IF NOT EXISTS designer_nome VARCHAR(255)
    `;

    return NextResponse.json({ ok: true, message: "Tabelas do designer criadas/atualizadas" });
  } catch (error: any) {
    console.error("Erro no init do designer:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
