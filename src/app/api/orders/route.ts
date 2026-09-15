import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// 1. POST: Salva o pedido e os itens (incluindo o arquivo .rar) no banco Neon
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, cliente, produtos, total, status } = body;

    if (!id || !cliente || !produtos || produtos.length === 0) {
      return NextResponse.json({ error: "Dados do pedido incompletos." }, { status: 400 });
    }

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL não configurada." }, { status: 500 });
    }

    const sql = neon(dbUrl);
    const numericId = Number(String(id).replace(/[^0-9]/g, ""));

    // 1. GERA UM ID CRESCENTE E ORDENADO PARA O CLIENTE (Ex: CLIENTE-001, CLIENTE-002...)
    const totalClientesRes: any = await sql`SELECT COUNT(DISTINCT email) as total FROM pedidos`;
    const proximoNumCliente = Number(totalClientesRes[0]?.total || 0) + 1;
    const clienteIdOrdenado = `CLIENTE-${String(proximoNumCliente).padStart(3, '0')}`;

    // Salva o pedido principal (já guardando o ID organizado do cliente se necessário)
    await sql`
      INSERT INTO pedidos (id, status, total, cliente, email, whatsapp)
      VALUES (
        ${numericId}, 
        ${status || "aguardando_pagamento"}, 
        ${total}, 
        ${cliente.nome}, 
        ${cliente.email}, 
        ${cliente.whatsapp || ""}
      )
      ON CONFLICT (id) DO UPDATE 
      SET status = EXCLUDED.status, total = EXCLUDED.total
    `;

    // Limpa itens antigos do pedido caso esteja reprocessando
    await sql`
      DELETE FROM pedido_itens WHERE pedido_id = ${numericId}
    `;

    // Salva cada item do carrinho e o seu arquivo .rar correspondente na tabela pedido_itens
    for (const prod of produtos) {
      const arquivoRar = prod.arquivo || prod.arquivoRar || "produto-exemplo.rar";
      const produtoIdNum = Number(prod.id) || 1;

      await sql`
        INSERT INTO pedido_itens (pedido_id, produto_id, nome_produto, arquivo_rar, preco)
        VALUES (
          ${numericId}, 
          ${produtoIdNum}, 
          ${prod.nome || "Arquivo Digital Customizado"}, 
          ${arquivoRar}, 
          ${prod.preco || 0}
        )
      `;
    }

    return NextResponse.json({ 
      success: true, 
      orderId: numericId, 
      clienteId: clienteIdOrdenado 
    }, { status: 201 });

  } catch (error: any) {
    console.error("ERRO AO SALVAR PEDIDO NO NEON (POST):", error);
    return NextResponse.json({ error: "Erro interno ao salvar pedido: " + error.message }, { status: 500 });
  }
}

// 2. GET: Consulta o pedido e os itens associados do banco Neon
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawPedidoId = searchParams.get("pedido");

  if (!rawPedidoId) {
    return NextResponse.json({ error: "ID do pedido não informado." }, { status: 400 });
  }

  const pedidoIdClean = rawPedidoId.replace(/[^0-9]/g, "");
  const numericId = Number(pedidoIdClean);

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json({ error: "DATABASE_URL não configurada." }, { status: 500 });
  }

  try {
    const sql = neon(dbUrl);

    // Consulta os dados do pedido no Neon
    const resPedido: any = await sql`
      SELECT id, status, total, cliente, email 
      FROM pedidos 
      WHERE id = ${numericId}
    `;

    if (!resPedido || resPedido.length === 0) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    const dbOrder = resPedido[0];

    // Consulta os itens cadastrados no pedido, puxando o arquivo .rar correto
    const resItens: any = await sql`
      SELECT produto_id as id, nome_produto as nome, arquivo_rar as arquivo, 'CDR / RAR' as formato
      FROM pedido_itens 
      WHERE pedido_id = ${numericId}
    `;

    // Normalização estrita do status
    let statusFormatado = dbOrder.status;
    if (dbOrder.status === "approved" || dbOrder.status === "pagamento_aprovado") {
      statusFormatado = "pagamento_aprovado";
    } else if (dbOrder.status === "rejected" || dbOrder.status === "cancelled" || dbOrder.status === "pagamento_recusado") {
      statusFormatado = "pagamento_recusado";
    }

    const order = {
      id: String(dbOrder.id),
      status: statusFormatado,
      produtos: resItens.length > 0 ? resItens.map((item: any) => ({
        id: Number(item.id),
        nome: String(item.nome),
        arquivo: String(item.arquivo),
        formato: String(item.formato)
      })) : [
        {
          id: 1,
          nome: "Arquivo Digital Customizado",
          arquivo: "produto-exemplo.rar",
          formato: "CDR / PNG",
        }
      ],
    };

    return NextResponse.json(
      { order },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("ERRO AO CONSULTAR PEDIDO NO NEON (GET):", error);
    return NextResponse.json({ error: "Erro interno ao consultar banco." }, { status: 500 });
  }
}