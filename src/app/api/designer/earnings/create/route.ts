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
    const { designer_artwork_id, valor_venda } = body;

    if (!designer_artwork_id || !valor_venda) {
      return NextResponse.json({ error: "Preencha designer_artwork_id e valor_venda" }, { status: 400 });
    }

    // Busca o artwork para obter designer_id
    const artwork: any[] = await sql`
      SELECT designer_id, preco FROM designer_artworks WHERE id = ${Number(designer_artwork_id)}
    `;

    if (artwork.length === 0) {
      return NextResponse.json({ error: "Artwork não encontrado" }, { status: 404 });
    }

    const designerId = artwork[0].designer_id;
    const valorComissao = Number(valor_venda) * 0.4;

    const result: any = await sql`
      INSERT INTO designer_earnings (
        pedido_id, designer_artwork_id, designer_id,
        valor_venda, valor_comissao, status
      )
      VALUES (
        ${null}, ${Number(designer_artwork_id)}, ${designerId},
        ${valor_venda}, ${valorComissao}, 'pendente'
      )
      RETURNING id
    `;

    return NextResponse.json({
      ok: true,
      earning_id: result[0].id,
      designer_id: designerId,
      valor_comissao,
    });
  } catch (error: any) {
    console.error("Erro ao criar earning:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
