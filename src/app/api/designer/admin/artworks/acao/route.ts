import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAdmin } from "@/lib/admin-session";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      return NextResponse.json(
        { error: "Serviço temporariamente indisponível" },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => null);
    const artworkId = Number(body?.artwork_id);
    const acao = body?.acao;
    const observacoes =
      typeof body?.observacoes === "string"
        ? body.observacoes.trim()
        : "";

    if (
      !Number.isSafeInteger(artworkId) ||
      artworkId <= 0 ||
      !["approve", "reject"].includes(acao)
    ) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    if (observacoes.length > 2000) {
      return NextResponse.json(
        { error: "As observações excedem o limite permitido" },
        { status: 400 }
      );
    }

    const sql = neon(dbUrl);

    const result =
      acao === "approve"
        ? await sql`
            UPDATE designer_artworks
            SET status = 'approved',
                aprovado_em = NOW(),
                rejeitado_em = NULL
            WHERE id = ${artworkId}
            RETURNING id, status
          `
        : await sql`
            UPDATE designer_artworks
            SET status = 'rejected',
                rejeitado_em = NOW(),
                observacoes = ${observacoes || null}
            WHERE id = ${artworkId}
            RETURNING id, status
          `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Arte não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      artwork: result[0],
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    console.error("Erro ao processar artwork:", error);

    return NextResponse.json(
      { error: "Não foi possível processar a arte" },
      { status: 500 }
    );
  }
}
