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
      return new NextResponse("Caminho inválido", {
        status: 400,
      });
    }

    // Proteção contra Path Traversal
    if (
      pathSegments.some(
        (segment) =>
          segment === ".." ||
          segment === "." ||
          segment.includes("\\")
      )
    ) {
      return new NextResponse("Caminho inválido", {
        status: 400,
      });
    }

    // Pasta onde ficam os previews
    const basePath = path.resolve(
      process.cwd(),
      "arquivos",
      "interclasses"
    );

    const filePath = path.resolve(
      basePath,
      ...pathSegments
    );

    // Garante que o arquivo permanece dentro de /arquivos/interclasses
    if (
      filePath !== basePath &&
      !filePath.startsWith(basePath + path.sep)
    ) {
      return new NextResponse("Caminho inválido", {
        status: 400,
      });
    }

    // A API de preview só pode entregar PNG
    const extension = path
      .extname(filePath)
      .toLowerCase();

    if (extension !== ".png") {
      return new NextResponse("Arquivo não permitido", {
        status: 403,
      });
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Preview não encontrado", {
        status: 404,
      });
    }

    const fileBuffer = fs.readFileSync(
      /* turbopackIgnore: true */ filePath
    );

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control":
          "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error(
      "[Preview API Error]:",
      error
    );

    return new NextResponse(
      "Erro ao carregar preview",
      {
        status: 500,
      }
    );
  }
}