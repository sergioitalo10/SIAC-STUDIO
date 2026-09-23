import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { neon } from "@neondatabase/serverless";
import { sendDesignerSaleNotification } from "@/lib/email";

export async function POST(request: Request) {
  console.log("--> WEBHOOK MERCADO PAGO RECEBIDO");

  try {
    const accessToken = (process.env.MERCADOPAGO_ACCESS_TOKEN || "").trim()
      || "APP_USR-1019679740284004-082521-49c4031fad060ecc2bcfc5b83bcf234a-131847059";

    const dbUrl = (process.env.DATABASE_URL || "").trim()
      || "postgresql://neondb_owner:***@ep-cool-darkness-a2j6x0xh.westus2.azure.neon.tech/siac-studio?sslmode=require";

    if (!accessToken || !dbUrl) {
      console.error("ERRO WEBHOOK: Variáveis de ambiente não configuradas.");
      return NextResponse.json({ error: "Configuração ausente" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const body = await request.json().catch(() => ({}));

    const topic = searchParams.get("topic") || searchParams.get("type") || body.type || body.topic;
    const paymentId = searchParams.get("data.id") || body.data?.id || searchParams.get("id") || body.id;

    console.log(`--> TIPO DE NOTIFICAÇÃO: ${topic} | PAYMENT ID: ${paymentId}`);

    if (topic === "payment" || (paymentId && !topic)) {
      if (!paymentId) {
        return NextResponse.json({ ok: true, message: "ID de pagamento não informado" });
      }

      const client = new MercadoPagoConfig({ accessToken });
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });

      const statusPagamento = paymentData.status;
      const pedidoId = paymentData.external_reference;

      console.log(`--> PEDIDO #${pedidoId} | STATUS MP: ${statusPagamento}`);

      if (statusPagamento === "approved" && pedidoId) {
        const sql = neon(dbUrl);

        await sql`
          UPDATE pedidos
          SET status = 'pago'
          WHERE id = ${Number(pedidoId)}
        `;

        console.log(`✅ PEDIDO #${pedidoId} ATUALIZADO PARA 'pago' COM SUCESSO!`);

        // Registrar earnings dos designers (40% por venda) — status pendente para fluxo de payout
        const itensComDesigner: any[] = await sql`
          SELECT
            pi.id,
            pi.designer_artwork_id,
            pi.designer_id,
            pi.designer_nome,
            pi.preco,
            da.preco as preco_artwork
          FROM pedido_itens pi
          LEFT JOIN designer_artworks da ON da.id = pi.designer_artwork_id
          WHERE pi.pedido_id = ${Number(pedidoId)}
            AND pi.designer_artwork_id IS NOT NULL
        `;

        for (const item of itensComDesigner) {
          const designerId = item.designer_id;
          const designerArtworkId = item.designer_artwork_id;
          const precoVenda = item.preco || item.preco_artwork || 0;
          const comissao = Number(precoVenda) * 0.4;

          if (designerId) {
            const existing: any[] = await sql`
              SELECT id FROM designer_earnings
              WHERE pedido_id = ${Number(pedidoId)}
                AND designer_artwork_id = ${Number(designerArtworkId)}
            `;

            if (existing.length === 0) {
              await sql`
                INSERT INTO designer_earnings (
                  pedido_id, designer_artwork_id, designer_id,
                  valor_venda, valor_comissao, status
                )
                VALUES (
                  ${Number(pedidoId)},
                  ${Number(designerArtworkId)},
                  ${Number(designerId)},
                  ${Number(precoVenda)},
                  ${comissao},
                  'pendente'
                )
              `;
              console.log(
                `✅ EARNING registrado: pedido #${pedidoId}, designer_id=${designerId}, comissao=R$ ${comissao.toFixed(2)}`
              );

              await sendDesignerSaleNotification(
                item.designer_email || "",
                item.designer_nome || "Designer",
                Number(pedidoId),
                Number(precoVenda),
                comissao
              ).catch((err) =>
                console.error(`⚠️ Falha ao enviar e-mail para designer ${designerId}:`, err.message)
              );
            }
          }
        }
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error("EXCEÇÃO NO WEBHOOK DO MERCADO PAGO:", error);
    return NextResponse.json({ ok: true, error: error?.message }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Webhook SIAC STUDIO Online" });
}
