import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  console.log("--> ROTA PREFERENCE CHAMADA (COM CLOUDFLARE TUNNEL)");

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  console.log("--> TOKEN MP EXISTE?:", !!accessToken);

  try {
    if (!accessToken) {
      console.error("ERRO: MERCADOPAGO_ACCESS_TOKEN é indefinido ou nulo.");
      return NextResponse.json(
        { error: "MERCADOPAGO_ACCESS_TOKEN não configurado." },
        { status: 500 }
      );
    }

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL não configurada no ambiente.");
    }

    const sql = neon(dbUrl);

    // Garante as tabelas no banco Neon
    await sql`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        cliente VARCHAR(255),
        email VARCHAR(255),
        total NUMERIC(10,2),
        status VARCHAR(50),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS pedido_itens (
        id SERIAL PRIMARY KEY,
        pedido_id INT REFERENCES pedidos(id),
        produto_id INT,
        quantidade INT,
        preco NUMERIC(10,2)
      );
    `;

    const body = await request.json();
    const { pedido } = body;
    console.log("--> DADOS DO PEDIDO RECEBIDO:", JSON.stringify(pedido));

    const total = pedido.produtos.reduce(
      (acc: number, item: any) => acc + Number(item.preco),
      0
    );

    console.log("--> INSERINDO PEDIDO NO NEON...");
    const resPedido: any = await sql`
      INSERT INTO pedidos (cliente, email, total, status) 
      VALUES (${pedido.cliente.nome}, ${pedido.cliente.email}, ${total}, 'pendente') 
      RETURNING id
    `;

    const novoPedidoId = resPedido[0]?.id;
    console.log("--> PEDIDO INSERIDO COM SUCESSO! ID:", novoPedidoId);

    console.log("--> INSERINDO ITENS DO PEDIDO...");
    for (const item of pedido.produtos) {
      await sql`
        INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco) 
        VALUES (${novoPedidoId}, ${Number(item.id)}, 1, ${Number(item.preco)})
      `;
    }

    console.log("--> CRIANDO PREFERÊNCIA NO MERCADO PAGO...");
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    // URL do seu Tunnel ativo
    const domainUrl = "https://giants-fees-minus-pty.trycloudflare.com";

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
        external_reference: String(novoPedidoId),
        notification_url: `${domainUrl}/api/mercadopago/webhook`,
        back_urls: {
          success: `${domainUrl}/pagamento/sucesso?pedido=${novoPedidoId}`,
          failure: `${domainUrl}/pagamento/falha`,
          pending: `${domainUrl}/pagamento/pendente`,
        },
        auto_return: "approved",
      },
    });

    console.log("--> PREFERÊNCIA CRIADA COM SUCESSO! ID:", response.id);

    return NextResponse.json({
      pedidoId: novoPedidoId,
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
    });
  } catch (error: any) {
    console.log("=================================");
    console.log("EXCEÇÃO CAPTURADA NO CATCH:");
    console.log(error);
    console.log("=================================");

    return NextResponse.json(
      { error: "Erro ao criar preferência.", details: String(error?.message || error) },
      { status: 500 }
    );
  }
}