import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  console.log("--> WEBHOOK MERCADO PAGO FOI CHAMADO");

  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const dbUrl = process.env.DATABASE_URL;

    if (!accessToken || !dbUrl) {
      console.error("ERRO: Variáveis de ambiente faltando.");
      return NextResponse.json(
        { error: "Configuração do servidor incompleta." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const body = await request.json().catch(() => ({}));

    // O Mercado Pago envia o ID do pagamento via Query String (?data.id=... ou ?id=...) ou no Body
    const topic = searchParams.get("topic") || searchParams.get("type") || body.type;
    const paymentId = searchParams.get("data.id") || searchParams.get("id") || body.data?.id;

    console.log(`--> WEBHOOK RECEBIDO | TÓPICO: ${topic} | ID PAGAMENTO: ${paymentId}`);

    // Só processamos notificações relativas a pagamentos
    if (topic === "payment" || body.action === "payment.created" || body.action === "payment.updated" || paymentId) {
      if (!paymentId) {
        console.log("--> Notificação recebida sem ID de pagamento. Ignorando.");
        return NextResponse.json({ received: true });
      }

      console.log(`--> CONSULTANDO STATUS DO PAGAMENTO ${paymentId} NO MERCADO PAGO...`);
      const client = new MercadoPagoConfig({ accessToken });
      const payment = new Payment(client);

      // Busca os detalhes oficiais do pagamento na API do Mercado Pago
      const paymentData = await payment.get({ id: paymentId });
      
      const rawStatus = paymentData.status;
      const novoPedidoId = paymentData.external_reference;

      // Mapeia os status do Mercado Pago para a convenção esperada pela tela do React
      let statusFormatado = rawStatus;
      if (rawStatus === "approved") {
        statusFormatado = "pagamento_aprovado";
      } else if (rawStatus === "rejected" || rawStatus === "cancelled") {
        statusFormatado = "pagamento_recusado";
      }

      console.log(`--> DETALHES ENCONTRADOS | PEDIDO ID: ${novoPedidoId} | STATUS ORIGINAL: ${rawStatus} | STATUS MAPEADO: ${statusFormatado}`);

      if (novoPedidoId) {
        const sql = neon(dbUrl);

        // Atualiza o status do pedido no banco de dados Neon
        await sql`
          UPDATE pedidos 
          SET status = ${statusFormatado} 
          WHERE id = ${Number(novoPedidoId)}
        `;

        console.log(`--> BANCO NEON ATUALIZADO: Pedido ${novoPedidoId} alterado para status '${statusFormatado}'`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.log("=================================");
    console.log("EXCEÇÃO CAPTURADA NO WEBHOOK:");
    console.log(error?.message || error);
    console.log("=================================");

    return NextResponse.json({ received: true, error: String(error) });
  }
}