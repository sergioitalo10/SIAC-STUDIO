import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { arquivosDownload } from "@/data/downloads";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pedidoId = searchParams.get("pedidoId");

    if (!pedidoId) {
      return NextResponse.json(
        { error: "Parâmetro pedidoId ausente." },
        { status: 400 }
      );
    }

    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      return NextResponse.json(
        { error: "DATABASE_URL não configurada." },
        { status: 500 }
      );
    }

    const sql = neon(dbUrl);

    // Busca o pedido e o produto comprado
    const resultados: any = await sql`
      SELECT
        ped.status,
        pi.produto_id,
        pi.nome AS nome_produto
      FROM pedidos ped
      JOIN pedido_itens pi ON pi.pedido_id = ped.id
      WHERE ped.id = ${Number(pedidoId)}
    `;

    if (!resultados || resultados.length === 0) {
      return NextResponse.json(
        {
          error: `Nenhum produto localizado no pedido #${pedidoId}.`,
        },
        { status: 404 }
      );
    }

    const itemPedido = resultados[0];

    // Verifica se é uma compra de designer (tem designer_artwork_id)
    const temDesigner = itemPedido.designer_artwork_id != null;

    // Somente pedidos pagos podem baixar
    const statusAtual = String(itemPedido.status).toLowerCase().trim();

    const statusValidos = [
      "pagamento_aprovado",
      "approved",
      "aprovado",
      "concluido",
      "pago",
    ];

    if (!statusValidos.includes(statusAtual)) {
      return NextResponse.json(
        {
          error: `Download bloqueado. Status do pedido: ${itemPedido.status}`,
        },
        { status: 403 }
      );
    }

    if (temDesigner && itemPedido.designer_artwork_id) {
      // Compra de designer: busca o arquivo_url direto na tabela designer_artworks
      const artworkUrl: any[] = await sql`
        SELECT arquivo_url FROM designer_artworks
        WHERE id = ${Number(itemPedido.designer_artwork_id)}
      `;

      if (artworkUrl.length === 0 || !artworkUrl[0].arquivo_url) {
        return NextResponse.json(
          {
            error: "Arquivo de designer não encontrado.",
            designerArtworkId: itemPedido.designer_artwork_id,
          },
          { status: 404 }
        );
      }

      // Download direto do URL do arquivo de designer (redireciona)
      return new NextResponse(null, {
        status: 302,
        headers: {
          Location: artworkUrl[0].arquivo_url,
        },
      });
    }

    const produtoId = Number(itemPedido.produto_id);
    const caminhoR2 = arquivosDownload[produtoId];

    if (!caminhoR2) {
      return NextResponse.json(
        {
          error: "Este produto ainda não possui arquivo disponível para download.",
          produtoId,
          nomeProduto: itemPedido.nome_produto,
        },
        { status: 404 }
      );
    }

    const bucket = process.env.R2_BUCKET_NAME;

    if (!bucket) {
      return NextResponse.json(
        { error: "R2_BUCKET_NAME não configurado." },
        { status: 500 }
      );
    }

    console.log("=========================================");
    console.log(`PEDIDO: #${pedidoId}`);
    console.log(`PRODUTO ID: ${produtoId}`);
    console.log(`PRODUTO: ${itemPedido.nome_produto}`);
    console.log(`R2: ${caminhoR2}`);
    console.log("=========================================");

    const resultadoR2 = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: caminhoR2,
      })
    );

    if (!resultadoR2.Body) {
      return NextResponse.json(
        { error: "Arquivo não encontrado no R2." },
        { status: 404 }
      );
    }

    return new NextResponse(resultadoR2.Body.transformToWebStream(), {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="arquivo.rar"',
        "Content-Type": "application/x-rar-compressed",
      },
    });
  } catch (error: any) {
    console.error("Erro na rota de download:", error);

    return NextResponse.json(
      {
        error: error.message || "Erro interno ao realizar download.",
      },
      { status: 500 }
    );
  }
}