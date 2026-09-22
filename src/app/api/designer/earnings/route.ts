import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL não configurada" }, { status: 500 });
    }

    const sql = neon(dbUrl);
    const { searchParams } = new URL(request.url);
    const designerId = searchParams.get("designer_id");

    if (!designerId) {
      return NextResponse.json({ error: "designer_id é obrigatório" }, { status: 400 });
    }

    const result: any[] = await sql`
      SELECT
        de.id,
        de.pedido_id,
        de.designer_artwork_id,
        de.designer_id,
        de.valor_venda,
        de.valor_comissao,
        da.titulo as nome_arte,
        d.nome as designer_nome,
        de.status,
        de.criado_em
      FROM designer_earnings de
      JOIN designer_artworks da ON da.id = de.designer_artwork_id
      JOIN designers d ON d.id = de.designer_id
      WHERE de.designer_id = ${Number(designerId)}
      ORDER BY de.criado_em DESC
    `;

    // Calcula total
    const total = result.reduce((acc: number, item: any) => acc + Number(item.valor_comissao), 0);

    return NextResponse.json({
      earnings: result,
      total_comissao: total,
    });
  } catch (error: any) {
    console.error("Erro ao listar earnings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL não configurada" }, { status: 500 });
    }

    const sql = neon(dbUrl);
    const body = await request.json();
    const { earning_ids, status } = body;

    if (!earning_ids || !status) {
      return NextResponse.json({ error: "earning_ids e status são obrigatórios" }, { status: 400 });
    }

    for (const id of earning_ids) {
      await sql`
        UPDATE designer_earnings
        SET status = ${status}
        WHERE id = ${Number(id)}
      `;
    }

    return NextResponse.json({ ok: true, updated: earning_ids.length });
  } catch (error: any) {
    console.error("Erro ao atualizar earnings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
