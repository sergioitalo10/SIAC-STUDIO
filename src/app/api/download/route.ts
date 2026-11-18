
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import {
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { arquivosDownload } from "@/data/downloads";

export const runtime = "nodejs";

function erro(mensagem: string, status: number) {
  return NextResponse.json({ error: mensagem }, { status });
}

function criarClienteR2() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Configuração do Cloudflare R2 ausente.");
  }

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pedidoId = searchParams.get("pedidoId");

    if (!pedidoId || !/^[1-9]\d*$/.test(pedidoId)) {
      return erro("Informe um pedido válido.", 400);
    }

    const dbUrl = process.env.DATABASE_URL;
    const bucket = process.env.R2_BUCKET_NAME;

    if (!dbUrl) {
      return erro("Banco de dados não configurado.", 500);
    }

    if (!bucket) {
      return erro("Bucket do R2 não configurado.", 500);
    }

    const sql = neon(dbUrl);

    const resultados = await sql`
      SELECT
        ped.id AS pedido_id,
        ped.status AS pedido_status,
        pi.produto_id,
        pi.nome AS nome_produto,
        pi.designer_artwork_id
      FROM pedidos AS ped
      INNER JOIN pedido_itens AS pi
        ON pi.pedido_id = ped.id
      WHERE ped.id = ${pedidoId}
      ORDER BY pi.id
    `;

    if (!resultados || resultados.length === 0) {
      return erro("Pedido ou item não encontrado.", 404);
    }

    const statusAtual = String(resultados[0].pedido_status)
      .toLowerCase()
      .trim();

    const statusValidos = [
      "pagamento_aprovado",
      "approved",
      "aprovado",
      "concluido",
      "pago",
    ];

    if (!statusValidos.includes(statusAtual)) {
      return erro("Download bloqueado: pedido ainda não está pago.", 403);
    }

    // Esta rota usa pedidoId e, por isso, ainda precisa de uma
    // verificação adicional de autorização do comprador antes da produção.
    // Não considere conhecer o ID do pedido como prova de propriedade.

    // Se houver vários itens, o cliente precisa identificar qual deseja.
    const itemId = searchParams.get("itemId");
    let itemPedido: (typeof resultados)[number];

    if (resultados.length > 1) {
      if (!itemId || !/^[1-9]\d*$/.test(itemId)) {
        return NextResponse.json(
          {
            error: "Este pedido contém vários itens. Informe itemId.",
            itens: resultados.map((item: any) => ({
              itemId: item.id,
              nome: item.nome_produto,
              produtoId: item.produto_id,
              designerArtworkId: item.designer_artwork_id,
            })),
          },
          { status: 400 }
        );
      }

      const itemEncontrado = await sql`
        SELECT
          ped.status AS pedido_status,
          pi.id,
          pi.produto_id,
          pi.nome AS nome_produto,
          pi.designer_artwork_id
        FROM pedidos AS ped
        INNER JOIN pedido_itens AS pi
          ON pi.pedido_id = ped.id
        WHERE ped.id = ${pedidoId}
          AND pi.id = ${itemId}
        LIMIT 1
      `;

      if (!itemEncontrado || itemEncontrado.length === 0) {
        return erro("Item não pertence a este pedido.", 404);
      }

      itemPedido = itemEncontrado[0] as (typeof resultados)[number];
    } else {
      itemPedido = resultados[0] as (typeof resultados)[number];
    }

    let caminhoR2: string;

    if (itemPedido.designer_artwork_id != null) {
      const artes = await sql`
        SELECT arquivo_url, status
        FROM designer_artworks
        WHERE id = ${Number(itemPedido.designer_artwork_id)}
        LIMIT 1
      `;

      if (!artes || artes.length === 0 || !artes[0].arquivo_url) {
        return erro("Arquivo da arte não encontrado.", 404);
      }

      if (String(artes[0].status).toLowerCase() !== "approved") {
        return erro("Esta arte não está aprovada para venda.", 403);
      }

      caminhoR2 = String(artes[0].arquivo_url).trim();

      // Não aceitamos URLs públicas, URLs temporárias ou caminhos absolutos.
      // O campo deve conter apenas a chave do objeto privado no R2.
      if (
        !caminhoR2 ||
        /^https?:\/\//i.test(caminhoR2) ||
        caminhoR2.startsWith("/") ||
        caminhoR2.includes("..") ||
        caminhoR2.includes("\\")
      ) {
        console.error("Chave R2 inválida para arte:", itemPedido.designer_artwork_id);
        return erro(
          "O arquivo desta arte ainda não está configurado corretamente no R2.",
          409
        );
      }
    } else {
      const produtoId = Number(itemPedido.produto_id);
      const arquivoAntigo = arquivosDownload[produtoId];

      if (!arquivoAntigo) {
        return erro(
          "Este produto ainda não possui arquivo para download.",
          404
        );
      }

      caminhoR2 = arquivoAntigo;
    }

    const s3 = criarClienteR2();

    const objeto = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: caminhoR2,
      })
    );

    if (!objeto.Body) {
      return erro("Arquivo não encontrado no armazenamento.", 404);
    }

    const nomeSeguro =
      itemPedido.designer_artwork_id != null
        ? `arte-${itemPedido.designer_artwork_id}.rar`
        : "arquivo.rar";

    return new NextResponse(objeto.Body.transformToWebStream(), {
      status: 200,
      headers: {
        "Content-Type": "application/x-rar-compressed",
        "Content-Disposition": `attachment; filename="${nomeSeguro}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: unknown) {
    console.error(
      "Erro na rota de download:",
      error instanceof Error ? error.message : "Erro desconhecido"
    );

    return erro("Não foi possível realizar o download.", 500);
  }
}
