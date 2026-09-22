import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL não configurada" }, { status: 500 });
    }

    const sql = neon(dbUrl);

    // Garante que o schema existe (para não falhar no primeiro acesso)
    await sql`
      CREATE TABLE IF NOT EXISTS designer_artworks (
        id SERIAL PRIMARY KEY,
        designer_id INT,
        titulo VARCHAR(255),
        descricao TEXT,
        categoria VARCHAR(100),
        preco NUMERIC(10,2),
        imagem_url VARCHAR(500),
        arquivo_url VARCHAR(500),
        thumbnail_url VARCHAR(500),
        tags TEXT[],
        status VARCHAR(20) DEFAULT 'pending',
        designer_nome VARCHAR(255),
        criado_em TIMESTAMP
      )
    `;

    // Artes aprovadas para exibir no site
    const artworks: any[] = await sql`
      SELECT
        da.id as artwork_id,
        da.titulo,
        da.descricao,
        da.categoria,
        da.preco,
        da.imagem_url,
        da.arquivo_url,
        da.thumbnail_url,
        da.tags,
        da.status,
        da.designer_id,
        da.designer_nome
      FROM designer_artworks da
      WHERE da.status = 'approved'
      ORDER BY da.criado_em DESC
    `;

    return NextResponse.json({ artworks });
  } catch (error: any) {
    console.error("Erro ao buscar artworks aprovados:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
