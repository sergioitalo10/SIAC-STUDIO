import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

    // Tenta os 3 locais possíveis onde o arquivo pode estar
    const tentativas = [
      path.join(process.cwd(), "arquivos", ...pathSegments),
      path.join(process.cwd(), "public", ...pathSegments),
      path.join(process.cwd(), ...pathSegments),
    ];

    let filePath = "";

    for (const local of tentativas) {
      if (fs.existsSync(local)) {
        filePath = local;
        break;
      }
    }

    // Se o arquivo não existir em nenhum dos caminhos
    if (!filePath) {
      console.warn(`[Preview API 404] Não encontrado: ${pathSegments.join("/")}`);
      return new NextResponse("Imagem não encontrada", { status: 404 });
    }

    // Lê os dados brutos da imagem (Buffer binário)
    const fileBuffer = fs.readFileSync(filePath);

    if (fileBuffer.length === 0) {
      return new NextResponse("Imagem zerada", { status: 404 });
    }

    // Define o tipo do conteúdo de acordo com a extensão
    const ext = path.extname(filePath).toLowerCase();
    let contentType = "image/png";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    if (ext === ".webp") contentType = "image/webp";

    // Retorna o buffer binário diretamente
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