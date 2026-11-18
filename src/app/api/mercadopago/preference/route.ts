
import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { products as catalogProducts } from "@/data/products";

export const runtime = "nodejs";

type CheckoutItem = {
  id?: number | string;
  nome?: string;
  quantidade?: number;
  designerArtworkId?: number | string;
};

type VerifiedItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: "BRL";
  produtoId: number | null;
  designerArtworkId: number | null;
  designerId: number | null;
  designerNome: string | null;
};

function validEmail(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) &&
    value.length <= 254
  );
}

function positiveInteger(value: unknown): number | null {
  const numberValue = Number(value);

  return Number.isSafeInteger(numberValue) && numberValue > 0
    ? numberValue
    : null;
}

export async function POST(request: Request) {
  let pedidoId: number | null = null;
  let sql:
    | ReturnType<typeof neon>
    | null = null;

  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
    const dbUrl = process.env.DATABASE_URL?.trim();
    const configuredDomain = process.env.DOMAIN_URL?.trim();

    if (!accessToken || !dbUrl || !configuredDomain) {
      console.error(
        "Checkout indisponível: configuração obrigatória ausente."
      );

      return NextResponse.json(
        { error: "Pagamento temporariamente indisponível." },
        { status: 503 }
      );
    }

    let domain: URL;

    try {
      domain = new URL(configuredDomain);
    } catch {
      return NextResponse.json(
        { error: "Configuração de pagamento inválida." },
        { status: 503 }
      );
    }

    if (
      domain.protocol !== "https:" ||
      !domain.hostname ||
      domain.username ||
      domain.password
    ) {
      return NextResponse.json(
        { error: "Configuração de pagamento inválida." },
        { status: 503 }
      );
    }

    const domainUrl = domain.origin;
    sql = neon(dbUrl);

    const body = await request.json();
    const pedido = body?.pedido;

    const nome = pedido?.cliente?.nome;
    const email = pedido?.cliente?.email;
    const whatsapp = pedido?.cliente?.whatsapp;

    if (
      typeof nome !== "string" ||
      !nome.trim() ||
      nome.trim().length > 255 ||
      !validEmail(email) ||
      (whatsapp != null &&
        (typeof whatsapp !== "string" || whatsapp.length > 30))
    ) {
      return NextResponse.json(
        { error: "Confira os dados do cliente." },
        { status: 400 }
      );
    }

    const submittedItems = pedido?.produtos;

    if (
      !Array.isArray(submittedItems) ||
      submittedItems.length === 0 ||
      submittedItems.length > 50
    ) {
      return NextResponse.json(
        { error: "O carrinho está vazio ou contém itens inválidos." },
        { status: 400 }
      );
    }

    const verifiedItems: VerifiedItem[] = [];

    for (const item of submittedItems as CheckoutItem[]) {
      const quantity = positiveInteger(item.quantidade ?? 1);

      if (!quantity || quantity > 20) {
        return NextResponse.json(
          { error: "Quantidade de produto inválida." },
          { status: 400 }
        );
      }

      const artworkId = item.designerArtworkId != null
        ? positiveInteger(item.designerArtworkId)
        : null;

      if (item.designerArtworkId != null && !artworkId) {
        return NextResponse.json(
          { error: "Arte de designer inválida." },
          { status: 400 }
        );
      }

      if (artworkId !== null) {
        // O preço e os dados da arte vêm exclusivamente do banco.
        const artworks = (await sql`
          SELECT id, titulo, preco, designer_id, designer_nome
          FROM designer_artworks
          WHERE id = ${artworkId}
          AND status = 'approved'
          LIMIT 1
        `) as Record<string, unknown>[];

const artwork = artworks[0];

        if (!artwork) {
          return NextResponse.json(
            {
              error:
                "Uma das artes não está mais disponível. Atualize o carrinho.",
            },
            { status: 409 }
          );
        }

        const price = Number(artwork.preco);

        if (
          !Number.isFinite(price) ||
          price <= 0 ||
          !Number.isSafeInteger(Math.round(price * 100))
        ) {
          console.error("Preço inválido na arte:", artworkId);

          return NextResponse.json(
            { error: "Não foi possível validar o preço de uma arte." },
            { status: 409 }
          );
        }

        verifiedItems.push({
          id: `designer-artwork-${artwork.id}`,
          title: String(artwork.titulo),
          quantity,
          unit_price: Math.round(price * 100) / 100,
          currency_id: "BRL",
          produtoId: null,
          designerArtworkId: Number(artwork.id),
          designerId:
            artwork.designer_id == null
              ? null
              : Number(artwork.designer_id),
          designerNome: artwork.designer_nome
            ? String(artwork.designer_nome)
            : null,
        });

        continue;
      }

      // Para produtos tradicionais, usa o catálogo mantido no servidor.
      const productId = positiveInteger(item.id);

      if (!productId) {
        return NextResponse.json(
          { error: "Produto inválido no carrinho." },
          { status: 400 }
        );
      }

      const product = catalogProducts.find(
        (candidate) => candidate.id === productId
      );

      if (
        !product ||
        !Number.isFinite(product.preco) ||
        product.preco <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "Um dos produtos não está disponível. Atualize o carrinho.",
          },
          { status: 409 }
        );
      }

      verifiedItems.push({
        id: `produto-${product.id}`,
        title: product.nome,
        quantity,
        unit_price: Math.round(product.preco * 100) / 100,
        currency_id: "BRL",
        produtoId: product.id,
        designerArtworkId: null,
        designerId: null,
        designerNome: null,
      });
    }

    const totalInCents = verifiedItems.reduce(
      (sum, item) =>
        sum + Math.round(item.unit_price * 100) * item.quantity,
      0
    );

    if (
      !Number.isSafeInteger(totalInCents) ||
      totalInCents <= 0
    ) {
      return NextResponse.json(
        { error: "Não foi possível calcular o total do pedido." },
        { status: 400 }
      );
    }

    const total = totalInCents / 100;

    // Usa o ID gerado pelo banco. Não cria tabelas nem altera o esquema.
    const insertedOrders = (await sql`
  INSERT INTO pedidos (
    cliente,
    email,
    whatsapp,
    total,
    status
  )
  VALUES (
    ${nome.trim()},
    ${email.trim().toLowerCase()},
    ${typeof whatsapp === "string" ? whatsapp.trim() : ""},
    ${total},
    'pendente'
  )
  RETURNING id
`) as Record<string, unknown>[];

pedidoId = Number(insertedOrders[0]?.id);

    if (!Number.isSafeInteger(pedidoId) || pedidoId <= 0) {
      throw new Error("O banco não retornou um ID de pedido válido.");
    }

    for (const item of verifiedItems) {
      await sql`
        INSERT INTO pedido_itens (
          pedido_id,
          produto_id,
          nome,
          quantidade,
          preco,
          designer_artwork_id,
          designer_id,
          designer_nome
        )
        VALUES (
          ${pedidoId},
          ${item.produtoId},
          ${item.title},
          ${item.quantity},
          ${item.unit_price},
          ${item.designerArtworkId},
          ${item.designerId},
          ${item.designerNome}
        )
      `;
    }

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    let response;

    try {
      response = await preference.create({
        body: {
          items: verifiedItems.map((item) => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            unit_price: item.unit_price,
            currency_id: item.currency_id,
          })),
          payer: {
            name: nome.trim(),
            email: email.trim().toLowerCase(),
          },
          external_reference: String(pedidoId),
          notification_url: `${domainUrl}/api/mercadopago/webhook`,
          back_urls: {
            success: `${domainUrl}/minha-conta?status=sucesso&pedido=${pedidoId}`,
            failure: `${domainUrl}/minha-conta?status=falha`,
            pending: `${domainUrl}/minha-conta?status=pendente`,
          },
          auto_return: "approved",
        },
      });
    } catch (error) {
      console.error("Falha ao criar preferência de pagamento:", error);

      // Mantém o pedido para auditoria, mas sinaliza que a preferência falhou.
      await sql`
        UPDATE pedidos
        SET status = 'falha_preferencia'
        WHERE id = ${pedidoId}
          AND status = 'pendente'
      `;

      return NextResponse.json(
        { error: "Não foi possível iniciar o pagamento. Tente novamente." },
        { status: 502 }
      );
    }

    if (!response.init_point) {
      await sql`
        UPDATE pedidos
        SET status = 'falha_preferencia'
        WHERE id = ${pedidoId}
          AND status = 'pendente'
      `;

      return NextResponse.json(
        { error: "O serviço de pagamento não retornou um link válido." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      pedidoId,
      id: response.id,
      init_point: response.init_point,
    });
  } catch (error) {
    console.error("Erro ao processar checkout:", error);

    if (sql && pedidoId !== null) {
      try {
        await sql`
          UPDATE pedidos
          SET status = 'erro_checkout'
          WHERE id = ${pedidoId}
            AND status = 'pendente'
        `;
      } catch (updateError) {
        console.error(
          "Não foi possível atualizar o status do pedido:",
          updateError
        );
      }
    }

    return NextResponse.json(
      { error: "Não foi possível processar o pedido." },
      { status: 500 }
    );
  }
}
