import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  console.log("--> WEBHOOK MERCADO PAGO RECEBIDO");

  try {
    // FORÇA OS DADOS DIRETAMENTE PARA EVITAR FALHA DE AMBIENTE NO WINDOWS
    const accessToken = "APP_USR-7622554073337882-083013-0f65bb5b5f930d79e89d460014350852-3653350684".trim();
    const dbUrl = "postgresql://neondb_owner:npg_P1qLkwo7RIFu@ep-dry-brook-a5tstzox-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require".trim();

    // (Se preferir manter o process.env, cole suas strings reais naspas acima)

    if (!accessToken || !dbUrl) {
      console.error("ERRO WEBHOOK: Variáveis de ambiente não configuradas.");
      return NextResponse.json({ error: "Configuração ausente" }, { status: 500 });
    }

    // Capta os parâmetros enviados na URL da notificação ou no corpo JSON
    const { searchParams } = new URL(request.url);
    const body = await request.json().catch(() => ({}));

    // O Mercado Pago pode enviar o id do pagamento como 'data.id' ou 'id' no query param / body
    const topic = searchParams.get("topic") || searchParams.get("type") || body.type || body.topic;
    const paymentId = searchParams.get("data.id") || body.data?.id || searchParams.get("id") || body.id;

    console.log(`--> TIPO DE NOTIFICAÇÃO: ${topic} | PAYMENT ID: ${paymentId}`);

    // Só processa se a notificação for do tipo "payment" (pagamento)
    if (topic === "payment" || (paymentId && !topic)) {
      if (!paymentId) {
        return NextResponse.json({ ok: true, message: "ID de pagamento não informado" });
      }

      // Inicializa SDK do Mercado Pago para buscar o status atualizado do pagamento
      const client = new MercadoPagoConfig({ accessToken });
      const payment = new Payment(client);

      // Busca os detalhes do pagamento diretamente nos servidores do Mercado Pago
      const paymentData = await payment.get({ id: paymentId });

      const statusPagamento = paymentData.status; // ex: 'approved', 'pending', 'rejected'
      const pedidoId = paymentData.external_reference; // O ID do pedido gravado no banco Neon

      console.log(`--> PEDIDO #${pedidoId} | STATUS MP: ${statusPagamento}`);

      if (statusPagamento === "approved" && pedidoId) {
        const sql = neon(dbUrl);

        // Atualiza o status na tabela do banco Neon para liberar o download do .RAR
        await sql`
          UPDATE pedidos
          SET status = 'pago'
          WHERE id = ${Number(pedidoId)}
        `;

        console.log(`✅ PEDIDO #${pedidoId} ATUALIZADO PARA 'pago' COM SUCESSO!`);
      }
    }

    // Retorna HTTP 200 OK para o Mercado Pago não tentar reenviar a mesma notificação
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error("EXCEÇÃO NO WEBHOOK DO MERCADO PAGO:", error);
    // Retorna HTTP 200 para evitar retentativas em loop do MP em caso de erros de parse
    return NextResponse.json({ ok: true, error: error?.message }, { status: 200 });
  }
}

// Suporte a verificações de ping (GET) enviadas pelo Mercado Pago
export async function GET() {
  return NextResponse.json({ status: "Webhook SIAC STUDIO Online" });
}