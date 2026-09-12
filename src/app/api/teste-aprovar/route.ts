import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "3"; // Por padrão aprova o pedido 3

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json({ error: "DATABASE_URL não encontrada" }, { status: 500 });
  }

  const sql = neon(dbUrl);
  await sql`UPDATE pedidos SET status = 'pagamento_aprovado' WHERE id = ${Number(id)}`;

  return NextResponse.json({ ok: true, mensagem: `Pedido ${id} alterado para pagamento_aprovado com sucesso!` });
}