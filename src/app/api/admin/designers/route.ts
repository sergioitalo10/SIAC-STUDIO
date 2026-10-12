
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAdmin } from "@/lib/admin-session";

export async function GET() {
  try {
    await requireAdmin();

    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      return NextResponse.json(
        { error: "DATABASE_URL não configurada" },
        { status: 500 }
      );
    }

    const sql = neon(dbUrl);

    const designers = await sql`
      SELECT
        id,
        nome,
        email,
        whatsapp,
        documento,
        status,
        percentual_comissao,
        dados_pagamento,
        created_at
      FROM designers
      ORDER BY nome
    `;

    return NextResponse.json({ designers });
  } catch (error) {
    console.error("Erro ao listar designers:", error);

    return NextResponse.json(
      { error: "Não foi possível listar os designers." },
      { status: 500 }
    );
  }
}
