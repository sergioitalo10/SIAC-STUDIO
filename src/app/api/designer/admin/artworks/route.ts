import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL não configurada" }, { status: 500 });
    }

    const sql = neon(dbUrl);

    const artworks: any[] = await sql`
      SELECT
        da.id,
        da.titulo,
        da.descricao,
        da.categoria,
        da.preco,
        da.imagem_url,
        da.thumbnail_url,
        da.status,
        da.criado_em,
        da.aprovado_em,
        da.rejeitado_em,
        da.observacoes,
        d.nome as designer_nome,
        d.email as designer_email
      FROM designer_artworks da
      JOIN designers d ON d.id = da.designer_id
      ORDER BY da.criado_em DESC
    `;

    return NextResponse.json({ artworks });
  } catch (error: any) {
    console.error("Erro ao listar artworks para admin:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
