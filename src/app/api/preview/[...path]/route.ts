import { NextRequest, NextResponse } from "next/server";

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

    const relativePath = pathSegments.join("/");

    // 1. Em PRODUÇÃO (Vercel), redireciona diretamente para o arquivo servido estaticamente
    if (process.env.NODE_ENV !== "development") {
      const publicUrl = new URL(`/${relativePath}`, request.url);
      return NextResponse.redirect(publicUrl);
    }

    // 2. Em DESENVOLVIMENTO LOCAL, importa 'fs' e 'path' dinamicamente usando eval
    // para impedir que o analisador estático do Turbopack rastreie o disco em produção
    const fs = eval('require("fs")');
    const path = eval('require("path")');

    const tentativas = [
      path.join(process.cwd(), "arquivos", relativePath),
      path.join(process.cwd(), "public", relativePath),
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
    const ext = path.extname(filePath).toLowerCase();
    let contentType = "image/png";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    if (ext === ".webp") contentType = "image/webp";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error("[Preview API Error]:", error);
    return new NextResponse("Erro ao carregar preview", { status: 500 });
  }
}