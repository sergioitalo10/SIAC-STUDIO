import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextResponse } from "next/server";
import {
  getOrder,
  updateOrderStatus,
} from "@/lib/ordersStore";

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("=================================");
    console.log("WEBHOOK MERCADO PAGO RECEBIDO");
    console.log("=================================");
    console.log(JSON.stringify(body, null, 2));

    const paymentId = body?.data?.id;

    if (!paymentId) {
      console.log("Webhook sem payment ID.");

      return NextResponse.json(
        { received: true },
        { status: 200 }
      );
    }

    if (!accessToken) {
      console.error(
        "MERCADOPAGO_ACCESS_TOKEN não configurado."
      );

      return NextResponse.json(
        {
          error:
            "MERCADOPAGO_ACCESS_TOKEN não configurado.",
        },
        { status: 500 }
      );
    }

    const client = new MercadoPagoConfig({
      accessToken,
    });

    const payment = new Payment(client);

    const response = await payment.get({
      id: String(paymentId),
    });

    console.log("=================================");
    console.log("PAGAMENTO CONSULTADO");
    console.log("=================================");

    console.log(
      JSON.stringify(
        {
          id: response.id,
          status: response.status,
          status_detail: response.status_detail,
          external_reference:
            response.external_reference,
          transaction_amount:
            response.transaction_amount,
        },
        null,
        2
      )
    );

    const pedidoId = response.external_reference;

    if (!pedidoId) {
      console.log(
        "Pagamento sem external_reference."
      );

      return NextResponse.json(
        { received: true },
        { status: 200 }
      );
    }

    const pedido = getOrder(String(pedidoId));

    if (!pedido) {
      console.log(
        `Pedido não encontrado no servidor: ${pedidoId}`
      );

      return NextResponse.json(
        {
          received: true,
          warning: "Pedido não encontrado.",
        },
        { status: 200 }
      );
    }

    console.log("PEDIDO ENCONTRADO:");
    console.log(
      JSON.stringify(pedido, null, 2)
    );

    if (response.status === "approved") {
      const pedidoAtualizado =
        updateOrderStatus(
          String(pedidoId),
          "pagamento_aprovado"
        );

      console.log(
        "================================="
      );
      console.log(
        "PAGAMENTO APROVADO - PEDIDO ATUALIZADO"
      );
      console.log(
        "================================="
      );

      console.log(
        JSON.stringify(
          pedidoAtualizado,
          null,
          2
        )
      );
    }

    if (response.status === "rejected") {
      updateOrderStatus(
        String(pedidoId),
        "pagamento_recusado"
      );

      console.log(
        `Pagamento recusado para o pedido ${pedidoId}`
      );
    }

    if (response.status === "cancelled") {
      updateOrderStatus(
        String(pedidoId),
        "cancelado"
      );

      console.log(
        `Pagamento cancelado para o pedido ${pedidoId}`
      );
    }

    return NextResponse.json(
      { received: true },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "ERRO NO WEBHOOK MERCADO PAGO:",
      error
    );

    return NextResponse.json(
      {
        error: "Erro ao processar webhook.",
      },
      { status: 500 }
    );
  }
}