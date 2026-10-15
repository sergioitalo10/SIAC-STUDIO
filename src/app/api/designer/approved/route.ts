
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      return NextResponse.json(
        { error: "Serviço temporariamente indisponível." },
        { status: 500 }
      );
    }

    const sql = neon(dbUrl);

    // Retorna apenas os dados necessários para exibir as artes na loja.
    // O endereço do arquivo original não deve ser público.
    const artworks = await sql`
      SELECT
        da.id AS artwork_id,
        da.titulo,
        da.descricao,
        da.categoria,
        da.preco,
        da.imagem_url,
        da.thumbnail_url,
        da.tags,
        da.status,
        da.designer_id,
        da.designer_nome
      FROM designer_artworks da
      WHERE da.status = 'approved'
      ORDER BY da.criado_em DESC
    `;

    return NextResponse.json(
      { artworks },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    console.error("Erro ao buscar artes aprovadas.");

    return NextResponse.json(
      { error: "Não foi possível carregar as artes." },
      { status: 500 }
    );
  }
}
