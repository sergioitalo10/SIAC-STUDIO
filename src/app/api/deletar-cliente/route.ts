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

    const clienteId = Number(id);
    if (isNaN(clienteId)) {
      return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
    }

    // Verifica se existe
    const existente: any[] = await sql`
      SELECT id, nome, email FROM usuarios WHERE id = ${clienteId}
    `;

    if (existente.length === 0) {
      return NextResponse.json({ ok: false, error: "Cliente não encontrado" }, { status: 404 });
    }

    // Remove
    await sql`DELETE FROM usuarios WHERE id = ${clienteId}`;

    return NextResponse.json({
      ok: true,
      message: `Cliente "${existente[0].nome}" (${existente[0].email}) removido.`,
    });
  } catch (err: any) {
    console.error("Erro ao deletar cliente:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
