import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawPedidoId = searchParams.get("pedido");

  if (!rawPedidoId) {
    return NextResponse.json({ error: "ID do pedido não informado." }, { status: 400 });
  }

  // Remove qualquer ponto ou caractere extra que possa ter vindo na URL
  const pedidoIdClean = rawPedidoId.replace(/[^0-9]/g, "");
  const numericId = Number(pedidoIdClean);

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json({ error: "DATABASE_URL não configurada." }, { status: 500 });
  }

  try {
    const sql = neon(dbUrl);

    // Consulta os dados do pedido no Neon
    const resPedido: any = await sql`
      SELECT id, status, total, cliente, email 
      FROM pedidos 
      WHERE id = ${numericId}
    `;

    if (!resPedido || resPedido.length === 0) {
      console.log(`--> [GET /api/orders] Pedido ID ${numericId} NÃO encontrado no Neon.`);
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    const dbOrder = resPedido[0];

    // Consulta os itens cadastrados no pedido
    const resItens: any = await sql`
  SELECT produto_id as id, 'Arquivo Digital Customizado' as nome, 'RAR' as arquivo, 'CDR / RAR' as formato
  FROM pedido_itens 
  WHERE pedido_id = ${numericId}
`;

    console.log(`--> [GET /api/orders] ID: ${dbOrder.id} | Status no Banco: ${dbOrder.status}`);

    // Normalização estrita do status para garantir a correspondência com o React
    let statusFormatado = dbOrder.status;
    if (dbOrder.status === "approved" || dbOrder.status === "pagamento_aprovado") {
      statusFormatado = "pagamento_aprovado";
    } else if (dbOrder.status === "rejected" || dbOrder.status === "cancelled" || dbOrder.status === "pagamento_recusado") {
      statusFormatado = "pagamento_recusado";
    }

    const order = {
      id: String(dbOrder.id),
      status: statusFormatado,
      produtos: resItens.length > 0 ? resItens.map((item: any) => ({
        id: Number(item.id),
        nome: String(item.nome),
        arquivo: String(item.arquivo),
        formato: String(item.formato)
      })) : [
        {
          id: 1,
          nome: "Arquivo Digital Customizado",
          arquivo: "download.zip",
          formato: "CDR / PNG",
        }
      ],
    };

    return NextResponse.json(
      { order },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("ERRO AO CONSULTAR PEDIDO NO NEON:", error);
    return NextResponse.json({ error: "Erro interno ao consultar banco." }, { status: 500 });
  }
}