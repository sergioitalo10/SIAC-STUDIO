import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextResponse } from "next/server";

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

export async function POST(request: Request) {
  try {
    if (!accessToken) {
      return NextResponse.json(
        {
          error: "MERCADOPAGO_ACCESS_TOKEN não configurado.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { pedido } = body;

    if (!pedido) {
      return NextResponse.json(
        {
          error: "Dados do pedido não informados.",
        },
        { status: 400 }
      );
    }

    const client = new MercadoPagoConfig({
      accessToken,
    });

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: pedido.produtos.map((produto: any) => ({
          id: String(produto.id),
          title: produto.nome,
          quantity: 1,
          unit_price: Number(produto.preco),
          currency_id: "BRL",
        })),

        payer: {
          name: pedido.cliente.nome,
          email: pedido.cliente.email,
        },

        external_reference: pedido.id,

        back_urls: {
          success: "http://localhost:3000/pagamento/sucesso",
          failure: "http://localhost:3000/pagamento/falha",
          pending: "http://localhost:3000/pagamento/pendente",
        },
      },
    });

    return NextResponse.json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
    });
  } catch (error) {
    console.error(
      "ERRO COMPLETO MERCADO PAGO:",
      JSON.stringify(error, null, 2)
    );

    console.error("ERRO MERCADO PAGO:", error);

    return NextResponse.json(
      {
        error: "Não foi possível criar o pagamento.",
      },
      { status: 500 }
    );
  }
}