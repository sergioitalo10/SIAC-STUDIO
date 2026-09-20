import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];

    if (pathSegments.length === 0) {
      return new NextResponse("Caminho inválido", { status: 400 });
    }

    // Une os segmentos em uma string relativa limpa
    const relativePath = pathSegments.join("/");

    // Define os diretórios base estaticamente sem usar o operador spread (...) dentro do path.join
    const baseArquivos = path.join(process.cwd(), "arquivos");
    const basePublic = path.join(process.cwd(), "public");

    const tentativas = [
      path.join(baseArquivos, relativePath),
      path.join(basePublic, relativePath),
    ];

    let filePath = "";

    for (const local of tentativas) {
      if (fs.existsSync(local)) {
        filePath = local;
        break;
      }
    }

    if (!filePath) {
      return new NextResponse("Imagem não encontrada", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    if (fileBuffer.length === 0) {
      return new NextResponse("Imagem vazia", { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    let contentType = "image/png";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    if (ext === ".webp") contentType = "image/webp";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[Preview API Error]:", error);
    return new NextResponse("Erro ao carregar preview", { status: 500 });
  }
}