import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL não configurada" }, { status: 500 });
    }

    const sql = neon(dbUrl);
    const body = await request.json();
    const {
      designer_id,
      titulo,
      descricao,
      categoria,
      preco,
      imagem_url,
      arquivo_url,
      thumbnail_url,
      tags,
    } = body;

    if (!designer_id || !titulo || !preco) {
      return NextResponse.json({ error: "Preencha designer_id, titulo e preco" }, { status: 400 });
    }

    const result: any = await sql`
      INSERT INTO designer_artworks (
        designer_id, titulo, descricao, categoria, preco,
        imagem_url, arquivo_url, thumbnail_url, tags, status
      )
      VALUES (
        ${designer_id}, ${titulo}, ${descricao || null}, ${categoria || null},
        ${preco}, ${imagem_url || null}, ${arquivo_url || null},
        ${thumbnail_url || null}, ${tags || null}, 'pending'
      )
      RETURNING id, designer_id, titulo, status, criado_em
    `;

    return NextResponse.json({
      ok: true,
      artwork: {
        id: result[0].id,
        designer_id: result[0].designer_id,
        titulo: result[0].titulo,
        status: result[0].status,
        criado_em: result[0].criado_em,
      },
    });
  } catch (error: any) {
    console.error("Erro ao criar artwork:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL não configurada" }, { status: 500 });
    }

    const sql = neon(dbUrl);
    const { searchParams } = new URL(request.url);
    const designerId = searchParams.get("designer_id");

    let artworks: any[];

    if (designerId) {
      artworks = await sql`
        SELECT da.* , d.nome as designer_nome
        FROM designer_artworks da
        JOIN designers d ON d.id = da.designer_id
        WHERE da.designer_id = ${Number(designerId)}
        ORDER BY da.criado_em DESC
      `;
    } else {
      artworks = await sql`
        SELECT da.* , d.nome as designer_nome
        FROM designer_artworks da
        JOIN designers d ON d.id = da.designer_id
        ORDER BY da.criado_em DESC
      `;
    }

    return NextResponse.json({ artworks });
  } catch (error: any) {
    console.error("Erro ao listar artworks:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
