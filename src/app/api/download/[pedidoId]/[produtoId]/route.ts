import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

interface RouteParams {
  params: Promise<{
    pedidoId: string;
    produtoId: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { pedidoId, produtoId } = await params;

    if (!pedidoId || !produtoId) {
      return NextResponse.json(
        { error: "Parâmetros de pedido ou produto ausentes." },
        { status: 400 }
      );
    }

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json(
        { error: "DATABASE_URL não configurada no servidor." },
        { status: 500 }
      );
    }

    const sql = neon(dbUrl);

    // 1. Busca o pedido no Neon para checar a aprovação do pagamento
    const pedidos: any = await sql`
      SELECT id, status 
      FROM pedidos 
      WHERE id = ${Number(pedidoId)}
    `;

    if (!pedidos || pedidos.length === 0) {
      return NextResponse.json(
        { error: "Pedido não encontrado." },
        { status: 404 }
      );
    }

    const statusAtual = pedidos[0].status;

    // 2. Trava de Segurança: Permite se for 'pagamento_aprovado' ou 'approved'
    if (statusAtual !== "pagamento_aprovado" && statusAtual !== "approved") {
      return NextResponse.json(
        { error: `Download não liberado. Status atual do pagamento: ${statusAtual}` },
        { status: 403 }
      );
    }

    // 3. Nome do arquivo RAR associado ao pedido
    const arquivoNome = `arte-pedido-${pedidoId}.rar`;

    // Caminho na pasta /downloads dentro do projeto
    const filePath = path.join(process.cwd(), "downloads", arquivoNome);

    // Se o arquivo específico não existir, tenta um arquivo RAR genérico para testes
    let finalPath = filePath;
    if (!fs.existsSync(filePath)) {
      const fallbackPath = path.join(process.cwd(), "downloads", "produto-exemplo.rar");
      if (fs.existsSync(fallbackPath)) {
        finalPath = fallbackPath;
      } else {
        return NextResponse.json(
          { error: `Arquivo físico (${arquivoNome} ou produto-exemplo.rar) não encontrado na pasta /downloads.` },
          { status: 404 }
        );
      }
    }

    // Lê o buffer do arquivo RAR
    const fileBuffer = fs.readFileSync(finalPath);

    // 4. Retorna o arquivo com os headers configurados para download de RAR
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${arquivoNome}"`,
        "Content-Type": "application/x-rar-compressed",
      },
    });
  } catch (error: any) {
    console.error("Erro na rota de download:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar o download." },
      { status: 500 }
    );
  }
}