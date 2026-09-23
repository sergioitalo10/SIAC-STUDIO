import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL não configurada" }, { status: 500 });
    }

    const sql = neon(dbUrl);

    const pedidos: any[] = await sql`
      SELECT id, cliente, email, total, status, criado_em
      FROM pedidos
      ORDER BY id ASC
    `;

    // Busca itens de cada pedido
    const pedidosComItens = await Promise.all(
      pedidos.map(async (pedido) => {
        const itens: any[] = await sql`
          SELECT id, produto_id, nome, quantidade, preco
          FROM pedido_itens
          WHERE pedido_id = ${pedido.id}
        `;
        return { ...pedido, itens };
      })
    );

    return NextResponse.json({ pedidos: pedidosComItens });
  } catch (err: any) {
    console.error("Erro ao listar pedidos:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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

    const pedidoId = Number(id);
    if (isNaN(pedidoId)) {
      return NextResponse.json({ ok: false, error: "ID inválido" }, { status: 400 });
    }

    // Remove itens primeiro
    await sql`DELETE FROM pedido_itens WHERE pedido_id = ${pedidoId}`;

    // Remove o pedido
    const resultado = await sql`DELETE FROM pedidos WHERE id = ${pedidoId}`;

    if (resultado.length === 0) {
      return NextResponse.json({ ok: false, error: "Pedido não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "Pedido removido com sucesso." });
  } catch (err: any) {
    console.error("Erro ao deletar pedido:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
