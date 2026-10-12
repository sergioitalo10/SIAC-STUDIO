
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

    const clientes = await sql`
      SELECT id, nome, email
      FROM usuarios
      ORDER BY id ASC
    `;

    return NextResponse.json({ clientes });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    console.error("Erro ao buscar clientes:", err);

    return NextResponse.json(
      { error: "Erro interno ao buscar clientes" },
      { status: 500 }
    );
  }
}
