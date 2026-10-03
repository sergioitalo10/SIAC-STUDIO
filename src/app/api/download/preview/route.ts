import { NextResponse } from "next/server";
import sharp from "sharp";
import * as path from "path";
import * as fs from "fs";

// Rota: /api/download/preview?path=/interclasses/.../preview.png
// Aplica watermark GRANDE do logo SIAC STUDIO e retorna a imagem para download

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const caminhoRelativo = searchParams.get("path");

    if (!caminhoRelativo) {
      return NextResponse.json(
        { error: "Parâmetro 'path' é obrigatório." },
        { status: 400 }
      );
    }

    // Validar que o path é seguro (só permite interclasses)
    if (!caminhoRelativo.startsWith("/interclasses/")) {
      return NextResponse.json(
        { error: "Caminho inválido." },
        { status: 403 }
      );
    }

    // Caminho absoluto no filesystem
    const caminhoAbsoluto = path.join(process.cwd(), "public", caminhoRelativo);

    // Verificar se o arquivo existe
    if (!fs.existsSync(caminhoAbsoluto)) {
      return NextResponse.json(
        { error: "Arquivo não encontrado." },
        { status: 404 }
      );
    }

    // Carregar metadata da imagem original e logo
    const imagemOriginal = sharp(caminhoAbsoluto);
    const metadata = await imagemOriginal.metadata();

    const logoPath = path.join(process.cwd(), "public", "logo.png");
    if (!fs.existsSync(logoPath)) {
      return NextResponse.json(
        { error: "Logo não encontrado." },
        { status: 500 }
      );
    }

    const logoMetadata = await sharp(logoPath).metadata();

    // Criar watermark GRANDE (40% do tamanho da imagem) com 100% opacidade
    const scale = 0.40; // 40% do tamanho — grande o suficiente para atrapalhar redesenho
    const novoLargura = Math.floor(metadata.width * scale);
    const novoAltura = Math.floor(
      (logoMetadata.height / logoMetadata.width) * novoLargura
    );

    // Posicionar no centro
    const x = Math.floor((metadata.width - novoLargura) / 2);
    const y = Math.floor((metadata.height - novoAltura) / 2);

    // Composite: imagem original + logo watermark (convertido para buffer primeiro)
    const resultado = await imagemOriginal.composite([
      {
        input: await sharp(logoPath)
          .resize(novoLargura, novoAltura)
          .toBuffer(),
        left: x,
        top: y,
      },
    ]);

    const buffer = await resultado.png().toBuffer();

    // Nome do arquivo de saída
    const nomeArquivo = caminhoRelativo.split("/").pop() || "preview.png";
    const nomeWatermarkado = nomeArquivo.replace(".png", "-com-watermark.png");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${nomeWatermarkado}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Erro no download de preview:", error);
    return NextResponse.json(
      { error: "Erro ao processar download." },
      { status: 500 }
    );
  }
}
