import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ ok: false, error: "ID não informado" }, { status: 400 });
    }

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL não configurada" }, { status: 500 });
    }

    const sql = neon(dbUrl);

    const designerId = Number(id);
    if (isNaN(designerId)) {
      return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
    }

    // Verifica se existe
    const existente: any[] = await sql`
      SELECT id, nome, email, pix FROM designers WHERE id = ${designerId}
    `;

    if (existente.length === 0) {
      return NextResponse.json({ ok: false, error: "Designer não encontrado" }, { status: 404 });
    }

    // Remove
    await sql`DELETE FROM designers WHERE id = ${designerId}`;

    return NextResponse.json({
      ok: true,
      message: `Designer "${existente[0].nome}" (${existente[0].email}) removido.`,
    });
  } catch (err: any) {
    console.error("Erro ao deletar designer:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// GET para listar todos os designers
export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL não configurada" }, { status: 500 });
    }

    const sql = neon(dbUrl);

    const designers: any[] = await sql`
      SELECT id, nome, email, pix, created_at
      FROM designers
      ORDER BY id ASC
    `;

    return NextResponse.json({ designers });
  } catch (err: any) {
    console.error("Erro ao listar designers:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
