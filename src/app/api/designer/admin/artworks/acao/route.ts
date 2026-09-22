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
    const { artwork_id, acao, observacoes } = body;

    if (!artwork_id || !acao) {
      return NextResponse.json({ error: "artwork_id e acao são obrigatórios" }, { status: 400 });
    }

    const id = Number(artwork_id);

    if (acao === "approve") {
      const result: any = await sql`
        UPDATE designer_artworks
        SET status = 'approved', aprovado_em = NOW()
        WHERE id = ${id}
        RETURNING id, status
      `;
      return NextResponse.json({ ok: true, artwork: result[0] });
    }

    if (acao === "reject") {
      const result: any = await sql`
        UPDATE designer_artworks
        SET status = 'rejected', rejeitado_em = NOW(),
            observacoes = ${observacoes || null}
        WHERE id = ${id}
        RETURNING id, status
      `;
      return NextResponse.json({ ok: true, artwork: result[0] });
    }

    return NextResponse.json({ error: "acao inválida" }, { status: 400 });
  } catch (error: any) {
    console.error("Erro ao processar artwork:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
