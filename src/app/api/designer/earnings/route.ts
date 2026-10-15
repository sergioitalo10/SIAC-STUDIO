import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireDesigner } from "@/lib/designer-session";
import { requireAdmin } from "@/lib/admin-session";

export async function GET() {
  try {
    const designer = await requireDesigner();

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json(
        { error: "Serviço temporariamente indisponível." },
        { status: 500 }
      );
    }

    const sql = neon(dbUrl);

    const result = await sql`
      SELECT
        de.id,
        de.pedido_id,
        de.designer_artwork_id,
        de.designer_id,
        de.valor_venda,
        de.valor_comissao,
        da.titulo AS nome_arte,
        d.nome AS designer_nome,
        de.status,
        de.criado_em
      FROM designer_earnings de
      JOIN designer_artworks da ON da.id = de.designer_artwork_id
      JOIN designers d ON d.id = de.designer_id
      WHERE de.designer_id = ${Number(designer.id)}
      ORDER BY de.criado_em DESC
    `;

    const total = result.reduce(
      (acc, item) => acc + Number(item.valor_comissao || 0),
      0
    );

    return NextResponse.json({
      earnings: result,
      total_comissao: total,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Faça login para continuar." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "DESIGNER_SUSPENSO") {
      return NextResponse.json(
        { error: "A conta está suspensa." },
        { status: 403 }
      );
    }

    console.error("Erro ao listar earnings.");
    return NextResponse.json(
      { error: "Não foi possível consultar os ganhos." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json(
        { error: "Serviço temporariamente indisponível." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => null);
    const earningIds = body?.earning_ids;
    const status = body?.status;

    if (
      !Array.isArray(earningIds) ||
      earningIds.length === 0 ||
      earningIds.length > 500 ||
      !earningIds.every(
        (id: unknown) =>
          (typeof id === "number" || typeof id === "string") &&
          String(id).trim() !== "" &&
          Number.isSafeInteger(Number(id)) &&
          Number(id) > 0
      ) ||
      !["pendente", "pago"].includes(status)
    ) {
      return NextResponse.json(
        { error: "IDs ou status inválidos." },
        { status: 400 }
      );
    }

    const db = neon(dbUrl);
    const ids = [...new Set(earningIds.map((id: string | number) => Number(id)))];

    const updated = await db`
      UPDATE designer_earnings
      SET status = ${status}
      WHERE id = ANY(${ids})
      RETURNING id
    `;

    return NextResponse.json({
      ok: true,
      updated: updated.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    console.error("Erro ao atualizar earnings.");
    return NextResponse.json(
      { error: "Não foi possível atualizar os pagamentos." },
      { status: 500 }
    );
  }
}