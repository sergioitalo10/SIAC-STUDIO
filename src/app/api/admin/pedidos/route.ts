
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAdmin } from "@/lib/admin-session";

export async function GET() {
  try {
    await requireAdmin();

    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      return NextResponse.json(
        { error: "Serviço temporariamente indisponível" },
        { status: 500 }
      );
    }

    const sql = neon(dbUrl);

    const pedidos = await sql`
      SELECT id, email, total, status, criado_em
      FROM pedidos
      WHERE status = 'pago'
      ORDER BY criado_em DESC
      LIMIT 50
    `;

    return NextResponse.json({ pedidos });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    console.error("Erro ao buscar pedidos:", err);

    return NextResponse.json(
      { error: "Erro interno ao buscar pedidos" },
      { status: 500 }
    );
  }
}
