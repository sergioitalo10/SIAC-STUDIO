import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const body = await req.json();
    const { total, cliente, email, whatsapp, items } = body;

    // GERAR ID DE 6 DÍGITOS QUE CABE PERFEITAMENTE EM INTEGER NO POSTGRESQL
    const numericId = Math.floor(100000 + Math.random() * 900000);

    // 1. Salva o pedido principal no Neon DB
    await sql`
      INSERT INTO pedidos (id, status, total, cliente, email, whatsapp)
      VALUES (${numericId}, 'Pendente', ${total}, ${cliente}, ${email}, ${whatsapp || ''})
    `;

    // 2. Limpa itens antigos caso exista algum registro prévio com o mesmo ID
    await sql`
      DELETE FROM pedido_itens WHERE pedido_id = ${numericId}
    `;

    // 3. Cadastra cada item do carrinho
    if (items && items.length > 0) {
      for (const item of items) {
        await sql`
          INSERT INTO pedido_itens (pedido_id, produto_id, nome, preco, quantidade)
          VALUES (${numericId}, ${item.id}, ${item.nome}, ${item.preco}, ${item.quantidade || 1})
        `;
      }
    }

    return NextResponse.json({ success: true, orderId: numericId });
  } catch (error: any) {
    console.error("ERRO AO SALVAR PEDIDO NO NEON (POST):", error);
    return NextResponse.json(
      { error: `Erro interno ao salvar pedido: ${error.message}` },
      { status: 500 }
    );
  }
}