import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getOrder } from "@/lib/ordersStore";

type RouteContext = {
  params: Promise<{
    pedidoId: string;
    produtoId: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { pedidoId, produtoId } = await context.params;

    // 1. Busca o pedido
    const pedido = getOrder(pedidoId);

    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido não encontrado." },
        { status: 404 }
      );
    }

    // 2. Verifica se o pagamento foi aprovado
    if (pedido.status !== "pagamento_aprovado") {
      return NextResponse.json(
        {
          error:
            "Download indisponível. O pagamento ainda não foi aprovado.",
        },
        { status: 403 }
      );
    }

    // 3. Procura o produto dentro do pedido
    const produto = pedido.produtos.find(
      (item) => String(item.id) === String(produtoId)
    );

    if (!produto) {
      return NextResponse.json(
        { error: "Produto não pertence a este pedido." },
        { status: 403 }
      );
    }

    // 4. Nome do arquivo definido no cadastro do produto
    const caminhoRelativo = produto.arquivo
  .replace(/^[/\\]+/, "")
  .replace(/\//g, path.sep);

const nomeArquivo = path.basename(caminhoRelativo);

const caminhoArquivo = path.join(
  process.cwd(),
  "arquivos",
  caminhoRelativo
);

    // 6. Verifica se o arquivo realmente existe
    try {
      await fs.access(caminhoArquivo);
    } catch {
      console.error(
        "ARQUIVO NÃO ENCONTRADO:",
        caminhoArquivo
      );

      return NextResponse.json(
        { error: "Arquivo do produto não encontrado." },
        { status: 404 }
      );
    }

    // 7. Lê o arquivo
    const arquivo = await fs.readFile(caminhoArquivo);

    // 8. Entrega o arquivo para download
    return new NextResponse(arquivo, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
        "Content-Length": arquivo.length.toString(),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("ERRO NO DOWNLOAD:", error);

    return NextResponse.json(
      { error: "Não foi possível realizar o download." },
      { status: 500 }
    );
  }
}