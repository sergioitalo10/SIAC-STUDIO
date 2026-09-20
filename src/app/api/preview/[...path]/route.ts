import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Força o Next.js a tratar esta rota como totalmente dinâmica em tempo de execução
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

    // O comentário /*turbopackIgnore: true*/ impede que o Turbopack tente rastrear
    // o disco rígido inteiro durante a compilação (build).
    const tentativas = [
      path.join(process.cwd(), "arquivos", /*turbopackIgnore: true*/ ...pathSegments),
      path.join(process.cwd(), "public", /*turbopackIgnore: true*/ ...pathSegments),
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