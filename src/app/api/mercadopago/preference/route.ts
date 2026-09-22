import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  console.log("--> ROTA PREFERENCE CHAMADA (SIAC STUDIO)");

  // Token fixado diretamente para isolar qualquer problema de leitura do ambiente
  const accessToken = "APP_USR-1019679740284004-082521-49c4031fad060ecc2bcfc5b83bcf234a-131847059"; 
  console.log("--> TOKEN MP EXISTE?:", !!accessToken);

  try {
    if (!accessToken) {
      console.error("ERRO: MERCADOPAGO_ACCESS_TOKEN é indefinido ou nulo.");
      return NextResponse.json(
        { error: "MERCADOPAGO_ACCESS_TOKEN não configurado no .env.local" },
        { status: 500 }
      );
    }

    const dbUrl = (process.env.DATABASE_URL || "").trim();
    if (!dbUrl) {
      throw new Error("DATABASE_URL não configurada no ambiente.");
    }

    const sql = neon(dbUrl);

    // 1. Garante as tabelas no banco Neon (unificadas com nome e arquivo)
    // 1. Garante as tabelas e colunas necessárias no banco Neon
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

    // Garante que a coluna 'nome' exista caso a tabela já tenha sido criada antes sem ela
    await sql`
      ALTER TABLE pedido_itens ADD COLUMN IF NOT EXISTS nome VARCHAR(255);
    `;

    const body = await request.json();

    const email = body.email || body.pedido?.cliente?.email;
    const nome = body.nome || body.pedido?.cliente?.nome || email?.split("@")[0] || "Cliente SIAC";
    
    let produtos = [];
    if (body.produtoId && body.titulo && body.preco) {
      produtos = [{ id: body.produtoId, nome: body.titulo, preco: body.preco }];
    } else if (body.pedido?.produtos) {
      produtos = body.pedido.produtos;
    }

    if (!email || produtos.length === 0) {
      return NextResponse.json(
        { error: "Dados do produto ou e-mail incompletos para gerar preference." },
        { status: 400 }
      );
    }

    const total = produtos.reduce(
      (acc: number, item: any) => acc + Number(item.preco),
      0
    );

    console.log("--> INSERINDO PEDIDO NO NEON...");
    const resPedido: any = await sql`
      INSERT INTO pedidos (cliente, email, total, status) 
      VALUES (${nome}, ${email}, ${total}, 'pendente') 
      RETURNING id
    `;

    const novoPedidoId = resPedido[0]?.id;
    console.log("--> PEDIDO INSERIDO COM SUCESSO! ID:", novoPedidoId);

    console.log("--> INSERINDO ITENS DO PEDIDO...");
    for (const item of produtos) {
      await sql`
        INSERT INTO pedido_itens (pedido_id, produto_id, nome, quantidade, preco) 
        VALUES (${novoPedidoId}, ${Number(item.id)}, ${String(item.nome)}, 1, ${Number(item.preco)})
      `;
    }

    const domainUrl = process.env.DOMAIN_URL || "https://practical-crafts-becoming-theology.trycloudflare.com";

    console.log("--> CRIANDO PREFERÊNCIA NO MERCADO PAGO...");
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: produtos.map((produto: any) => ({
          id: String(produto.id),
          title: String(produto.nome),
          quantity: 1,
          unit_price: Number(produto.preco),
          currency_id: "BRL",
        })),
        payer: {
          name: String(nome),
          email: String(email).trim(),
        },
        external_reference: String(novoPedidoId),
        notification_url: `${domainUrl}/api/mercadopago/webhook`,
        back_urls: {
          success: `${domainUrl}/minha-conta?status=sucesso&pedido=${novoPedidoId}`,
          failure: `${domainUrl}/minha-conta?status=falha`,
          pending: `${domainUrl}/minha-conta?status=pendente`,
        },
        auto_return: "approved",
      },
    });

    console.log("--> PREFERÊNCIA CRIADA COM SUCESSO! ID:", response.id);

    return NextResponse.json({
      ok: true,
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