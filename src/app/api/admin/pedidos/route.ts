import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL não configurada" }, { status: 500 });
    }

    const sql = neon(dbUrl);

    // Busca pedidos pagos, ordenados por data
    const pedidos: any[] = await sql`
      SELECT id, email, total, status, criado_em
      FROM pedidos
      WHERE status = 'pago'
      ORDER BY criado_em DESC
      LIMIT 50
    `;

    return NextResponse.json({ pedidos });
  } catch (err: any) {
    console.error("Erro ao buscar pedidos:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
