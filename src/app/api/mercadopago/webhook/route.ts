
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { neon } from "@neondatabase/serverless";
import { sendDesignerSaleNotification } from "@/lib/email";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

function validarAssinaturaWebhook(
  request: Request,
  secret: string
): boolean {
  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id");

  if (!signature || !requestId || !dataId) return false;

  const parts = signature.split(",").map((part) => part.trim());
  const ts = parts.find((part) => part.startsWith("ts="))?.slice(3);
  const receivedHash = parts
    .find((part) => part.startsWith("v1="))
    ?.slice(3);

  if (
    !ts ||
    !/^\d+$/.test(ts) ||
    !receivedHash ||
    !/^[a-f0-9]{64}$/i.test(receivedHash)
  ) {
    return false;
  }

  // Aceita timestamp Unix em segundos ou milissegundos.
  const timestampNumber = Number(ts);
  const timestampMs =
    timestampNumber < 1_000_000_000_000
      ? timestampNumber * 1000
      : timestampNumber;

  // Tolerância de 10 minutos contra notificações muito antigas ou futuras.
  if (
    !Number.isFinite(timestampMs) ||
    Math.abs(Date.now() - timestampMs) > 10 * 60 * 1000
  ) {
    return false;
  }

  const manifest =
    `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;

  const expectedHash = createHmac("sha256", secret)
    .update(manifest)
    .digest();

  const receivedBuffer = Buffer.from(receivedHash, "hex");

  return (
    receivedBuffer.length === expectedHash.length &&
    timingSafeEqual(receivedBuffer, expectedHash)
  );
}

function paraCentavos(value: unknown): number | null {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return null;
  }

  return Math.round(numberValue * 100);
}

export async function POST(request: Request) {
  try {
    const accessToken = (process.env.MERCADOPAGO_ACCESS_TOKEN || "").trim();
    const dbUrl = (process.env.DATABASE_URL || "").trim();
    const webhookSecret = (
      process.env.MERCADOPAGO_WEBHOOK_SECRET || ""
    ).trim();

    if (!accessToken || !dbUrl || !webhookSecret) {
      console.error("Webhook: configuração de ambiente ausente.");
      return NextResponse.json(
        { error: "Serviço temporariamente indisponível." },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));

    const topic =
      url.searchParams.get("type") ||
      url.searchParams.get("topic") ||
      body?.type ||
      body?.topic;

    const paymentId = url.searchParams.get("data.id");

    // Ignora notificações que não são de pagamento.
    if (topic && topic !== "payment") {
      return NextResponse.json({ ok: true, ignored: true });
    }

    // Para processar pagamentos, exigimos o ID assinado na URL.
    if (!paymentId || !/^\d+$/.test(paymentId)) {
      return NextResponse.json(
        { error: "Identificador de pagamento inválido." },
        { status: 400 }
      );
    }

    if (!validarAssinaturaWebhook(request, webhookSecret)) {
      console.warn("Webhook: assinatura inválida.");
      return NextResponse.json(
        { error: "Assinatura inválida." },
        { status: 401 }
      );
    }

    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);

    // Os dados oficiais são consultados diretamente no Mercado Pago.
    const paymentData = await payment.get({ id: paymentId });

    if (paymentData.status !== "approved") {
      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: "Pagamento ainda não aprovado.",
      });
    }

    if (paymentData.currency_id !== "BRL") {
      console.error("Webhook: moeda diferente de BRL.", {
        paymentId,
        currency: paymentData.currency_id,
      });

      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: "Moeda não aceita.",
      });
    }

    const pedidoId = paymentData.external_reference;

    // Não convertemos o ID para Number, pois pedidos.id é BIGINT.
    if (
      typeof pedidoId !== "string" ||
      !/^[1-9]\d*$/.test(pedidoId)
    ) {
      console.error("Webhook: referência de pedido inválida.", {
        paymentId,
      });

      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: "Referência de pedido inválida.",
      });
    }

    const amountCents = paraCentavos(paymentData.transaction_amount);

    if (amountCents === null) {
      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: "Valor de pagamento inválido.",
      });
    }

    const sql = neon(dbUrl);

    const pedidos = (await sql`
      SELECT id, total, status
      FROM pedidos
      WHERE id = ${pedidoId}
      LIMIT 1
    `) as Record<string, unknown>[];

    if (pedidos.length === 0) {
      console.error("Webhook: pedido não encontrado.", { pedidoId });

      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: "Pedido não encontrado.",
      });
    }

    const pedido = pedidos[0];
    const totalPedidoCents = paraCentavos(pedido.total);

    if (
      totalPedidoCents === null ||
      totalPedidoCents !== amountCents
    ) {
      console.error("Webhook: valor do pagamento não corresponde ao pedido.", {
        pedidoId,
        paymentId,
        valorPagamentoCentavos: amountCents,
        valorPedidoCentavos: totalPedidoCents,
      });

      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: "Valor do pagamento diferente do pedido.",
      });
    }

    /*
     * Uma única instrução SQL atualiza o pedido e registra as comissões.
     * A restrição UNIQUE (pedido_id, designer_artwork_id) da migração
     * impede comissões duplicadas quando o webhook é repetido.
     */
    const resultado = (await sql`
      WITH pedido_validado AS MATERIALIZED (
        SELECT id
        FROM pedidos
        WHERE id = ${pedidoId}
          AND ROUND(total * 100) = ${amountCents}
      ),
      pedido_atualizado AS (
        UPDATE pedidos AS p
        SET status = 'pago'
        FROM pedido_validado AS pv
        WHERE p.id = pv.id
        RETURNING p.id
      ),
      comissoes_inseridas AS (
        INSERT INTO designer_earnings (
          pedido_id,
          designer_artwork_id,
          designer_id,
          valor_venda,
          percentual_comissao,
          valor_comissao,
          status
        )
        SELECT
          itens.pedido_id,
          itens.designer_artwork_id,
          itens.designer_id,
          itens.valor_venda,
          itens.percentual_comissao,
          ROUND(
            itens.valor_venda * itens.percentual_comissao / 100,
            2
          ),
          'pendente'
        FROM (
          SELECT
            pi.pedido_id,
            pi.designer_artwork_id,
            COALESCE(pi.designer_id, da.designer_id) AS designer_id,
            ROUND(
              SUM(pi.preco * COALESCE(pi.quantidade, 1)),
              2
            ) AS valor_venda,
            COALESCE(d.percentual_comissao, 40.00)::numeric(5,2)
              AS percentual_comissao
          FROM pedido_itens AS pi
          JOIN designer_artworks AS da
            ON da.id = pi.designer_artwork_id
          JOIN designers AS d
            ON d.id = COALESCE(pi.designer_id, da.designer_id)
          JOIN pedido_validado AS pv
            ON pv.id = pi.pedido_id
          WHERE pi.designer_artwork_id IS NOT NULL
            AND pi.preco IS NOT NULL
            AND pi.quantidade > 0
          GROUP BY
            pi.pedido_id,
            pi.designer_artwork_id,
            COALESCE(pi.designer_id, da.designer_id),
            COALESCE(d.percentual_comissao, 40.00)
        ) AS itens
        ON CONFLICT (pedido_id, designer_artwork_id) DO NOTHING
        RETURNING
          id,
          pedido_id,
          designer_artwork_id,
          designer_id,
          valor_venda,
          percentual_comissao,
          valor_comissao
      )
      SELECT
        pv.id AS pedido_validado_id,
        ci.id AS earning_id,
        ci.pedido_id,
        ci.designer_artwork_id,
        ci.designer_id,
        ci.valor_venda,
        ci.percentual_comissao,
        ci.valor_comissao,
        d.email AS designer_email,
        d.nome AS designer_nome
      FROM pedido_validado AS pv
      LEFT JOIN comissoes_inseridas AS ci
        ON ci.pedido_id = pv.id
      LEFT JOIN designers AS d
        ON d.id = ci.designer_id
    `) as Record<string, unknown>[];

    if (resultado.length === 0) {
      console.error(
        "Webhook: pedido não foi validado durante o processamento.",
        { pedidoId }
      );

      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: "Pedido não validado.",
      });
    }

    console.log(`Pedido #${pedidoId} confirmado como pago.`);

    // Notifica somente sobre comissões efetivamente inseridas agora.
    // Falha no e-mail não desfaz a confirmação nem duplica a comissão.
    for (const row of resultado) {
      if (row.earning_id == null) continue;

      const email = String(row.designer_email || "");
      const nome = String(row.designer_nome || "Designer");
      const designerId = row.designer_id;
      const valorVenda = Number(row.valor_venda);
      const valorComissao = Number(row.valor_comissao);

      console.log("Comissão registrada.", {
        pedidoId,
        designerId,
        valorVenda,
        percentual: Number(row.percentual_comissao),
        valorComissao,
      });

      if (email) {
        await sendDesignerSaleNotification(
          email,
          nome,
          Number(pedidoId),
          valorVenda,
          valorComissao
        ).catch((error: unknown) => {
          console.error(
            `Falha ao enviar e-mail para designer ${String(designerId)}:`,
            error instanceof Error ? error.message : "Erro desconhecido"
          );
        });
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    console.error(
      "Erro ao processar webhook do Mercado Pago:",
      error instanceof Error ? error.message : "Erro desconhecido"
    );

    // Erros transitórios devem permitir nova tentativa do Mercado Pago.
    return NextResponse.json(
      { error: "Falha ao processar a notificação." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Webhook SIAC STUDIO Online",
  });
}
