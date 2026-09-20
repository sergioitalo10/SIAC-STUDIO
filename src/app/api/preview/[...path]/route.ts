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
    const publicUrl = new URL(`/${relativePath}`, request.url);

    return NextResponse.redirect(publicUrl);
  } catch (error) {
    console.error("[Preview API Error]:", error);
    return new NextResponse("Erro ao carregar preview", { status: 500 });
  }
}