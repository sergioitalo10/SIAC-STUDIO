import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pedidoId = searchParams.get("id");

    if (!pedidoId) {
      return NextResponse.json({ ok: false, error: "ID do pedido não informado" }, { status: 400 });
    }

    // Remove os itens e depois o pedido pendente
    await pool.query("DELETE FROM pedido_itens WHERE pedido_id = $1;", [pedidoId]);
    
    const resultado = await pool.query(
      "DELETE FROM pedidos WHERE id = $1 AND LOWER(status) = 'pendente';", 
      [pedidoId]
    );

    return NextResponse.json({ ok: true, message: "Pedido removido com sucesso." });
  } catch (err: any) {
    console.error("Erro ao deletar pedido:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}