import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "E-mail do cliente não informado." },
        { status: 400 }
      );
    }

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json(
        { error: "DATABASE_URL não configurada." },
        { status: 500 }
      );
    }

    const sql = neon(dbUrl);

    // Busca todos os pedidos aprovados do e-mail do cliente
    const pedidos: any = await sql`
      SELECT id, status, criado_em 
      FROM pedidos 
      WHERE email = ${email.toLowerCase().trim()}
        AND status IN ('pagamento_aprovado', 'approved')
      ORDER BY id DESC
    `;

    // Para cada pedido, carrega os itens vinculados
    const pedidosComItens = await Promise.all(
      pedidos.map(async (pedido: any) => {
        const itens: any = await sql`
          SELECT produto_id as id, 'Arquivo Digital Customizado' as nome, 'arte.rar' as arquivo
          FROM pedido_itens
          WHERE pedido_id = ${pedido.id}
        `;
        return {
          ...pedido,
          itens: itens.length > 0 ? itens : [{ id: 1, nome: "Pacote de Artes RAR", arquivo: "arte.rar" }],
        };
      })
    );

    return NextResponse.json({ ok: true, pedidos: pedidosComItens });
  } catch (error: any) {
    console.error("Erro ao buscar meus pedidos:", error);
    return NextResponse.json(
      { error: "Erro ao carregar histórico de compras." },
      { status: 500 }
    );
  }
}