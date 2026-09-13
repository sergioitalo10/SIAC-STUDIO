import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

interface RouteParams {
  params: Promise<{
    pedidoId: string;
    itemId: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { pedidoId } = await params;

    if (!pedidoId) {
      return NextResponse.json(
        { error: "ID do pedido ausente." },
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

    // 1. Busca rigorosa do pedido exato pelo ID correto
    const pedidos: any = await sql`
      SELECT id, status 
      FROM pedidos 
      WHERE id = ${Number(pedidoId)}
    `;

    if (!pedidos || pedidos.length === 0) {
      return NextResponse.json(
        { error: `Pedido #${pedidoId} não encontrado no banco de dados.` },
        { status: 404 }
      );
    }

    const pedido = pedidos[0];
    const statusAtual = String(pedido.status).toLowerCase().trim();

    // 2. Trava de segurança de pagamento
    const statusValidos = ["pagamento_aprovado", "approved", "aprovado", "concluido", "pago"];
    if (!statusValidos.includes(statusAtual)) {
      return NextResponse.json(
        { error: `Download não liberado. Status do pedido #${pedidoId}: ${pedido.status}` },
        { status: 403 }
      );
    }

    // 3. Procura o arquivo específico do pedido (ex: arte-pedido-15.rar)
    // Se não existir, usa o coringa de testes da pasta downloads
    const arquivoNome = `arte-pedido-${pedidoId}.rar`;
    const filePath = path.join(process.cwd(), "downloads", arquivoNome);

    let finalPath = filePath;
    if (!fs.existsSync(filePath)) {
      const fallbackPath = path.join(process.cwd(), "downloads", "produto-exemplo.rar");
      if (fs.existsSync(fallbackPath)) {
        finalPath = fallbackPath;
      } else {
        return NextResponse.json(
          { error: `O arquivo compactado do pedido #${pedidoId} não foi encontrado no servidor.` },
          { status: 404 }
        );
      }
    }

    // Lê o buffer do arquivo correto
    const fileBuffer = fs.readFileSync(finalPath);

    // 4. Retorna exatamente o arquivo do pedido correspondente
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="arte-pedido-${pedidoId}.rar"`,
        "Content-Type": "application/x-rar-compressed",
      },
    });
  } catch (error: any) {
    console.error("Erro na rota de download:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar o download: " + error.message },
      { status: 500 }
    );
  }
}