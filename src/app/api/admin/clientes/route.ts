import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL não configurada" }, { status: 500 });
    }

    const sql = neon(dbUrl);

    // Busca clientes da tabela usuarios
    const clientes: any[] = await sql`
      SELECT id, nome, email
      FROM usuarios
      ORDER BY id ASC
    `;

    return NextResponse.json({ clientes });
  } catch (err: any) {
    console.error("Erro ao buscar clientes:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
