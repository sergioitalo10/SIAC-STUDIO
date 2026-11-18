
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireDesigner } from "@/lib/designer-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const designer = await requireDesigner();
    const designerId = Number(designer.id);

    if (!Number.isSafeInteger(designerId) || designerId <= 0) {
      return NextResponse.json(
        { error: "Sessão de designer inválida." },
        { status: 401 }
      );
    }

    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      return NextResponse.json(
        { error: "Serviço temporariamente indisponível." },
        { status: 500 }
      );
    }

    const sql = neon(dbUrl);

    const notifications = await sql`
      SELECT
        id,
        artwork_id,
        tipo,
        titulo,
        mensagem,
        lida,
        criado_em
      FROM designer_notifications
      WHERE designer_id = ${designerId}
      ORDER BY criado_em DESC
      LIMIT 100
    `;

    return NextResponse.json({
      notifications,
      nao_lidas: notifications.filter(
        (item) => item.lida === false
      ).length,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        { error: "Faça login para continuar." },
        { status: 401 }
      );
    }

    console.error("Erro ao consultar notificações do designer.");

    return NextResponse.json(
      { error: "Não foi possível carregar as notificações." },
      { status: 500 }
    );
  }
}
