import { NextResponse } from "next/server";
import type { Order } from "@/types/order";

const orders = new Map<string, Order>();

export async function POST(request: Request) {
  try {
    const order = (await request.json()) as Order;

    if (!order?.id) {
      return NextResponse.json(
        { error: "Pedido não informado." },
        { status: 400 }
      );
    }

    orders.set(order.id, order);

    console.log("PEDIDO RECEBIDO PELO SERVIDOR:");
    console.log(JSON.stringify(order, null, 2));

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ERRO AO SALVAR PEDIDO:", error);

    return NextResponse.json(
      { error: "Não foi possível salvar o pedido." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    orders: Array.from(orders.values()),
  });
}