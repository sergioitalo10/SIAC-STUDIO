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

    // Junta os segmentos da URL (ex: ["interclasses", "mascote.png"] -> "interclasses/mascote.png")
    const relativePath = pathSegments.join("/");

    // Constrói a URL direta para o arquivo estático na pasta public
    const publicUrl = new URL(`/${relativePath}`, request.url);

    // Redireciona o navegador diretamente para o recurso estático servido pela Vercel/CDN
    return NextResponse.redirect(publicUrl);
  } catch (error) {
    console.error("[Preview API Error]:", error);
    return new NextResponse("Erro ao carregar preview", { status: 500 });
  }
}