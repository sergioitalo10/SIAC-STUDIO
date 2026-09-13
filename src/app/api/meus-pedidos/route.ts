import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ ok: false, error: "E-mail não informado" }, { status: 400 });
    }

    const queryPedidos = `
      SELECT id, status, criado_em 
      FROM pedidos 
      WHERE LOWER(email) = LOWER($1) AND (LOWER(status) = 'pago' OR LOWER(status) = 'approved')
      ORDER BY id DESC;
    `;
    const resultPedidos = await pool.query(queryPedidos, [email]);

    const pedidosFormatados = [];

    for (const pedido of resultPedidos.rows) {
      const queryItens = `
        SELECT id, produto_id, nome, preco 
        FROM pedido_itens 
        WHERE pedido_id = $1;
      `;
      const resultItens = await pool.query(queryItens, [pedido.id]);

      pedidosFormatados.push({
        id: pedido.id,
        status: pedido.status,
        criado_em: pedido.criado_em,
        itens: resultItens.rows.map(item => ({
          id: item.id,
          nome: item.nome || `Pacote Digital #${item.produto_id}`,
          arquivo: `pacote-${item.produto_id}.rar`
        })),
      });
    }

    return NextResponse.json({ ok: true, pedidos: pedidosFormatados });
  } catch (err: any) {
    console.error("Erro ao buscar pedidos do cliente:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}