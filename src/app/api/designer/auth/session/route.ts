
import { NextResponse } from "next/server";
import { getDesignerSession } from "@/lib/designer-session";

export async function GET() {
  try {
    const designer = await getDesignerSession();

    if (!designer) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      designer: {
        id: designer.id,
        nome: designer.nome,
        email: designer.email,
        status: designer.status,
      },
    });
  } catch {
    console.error("Erro ao verificar sessão do designer.");

    return NextResponse.json(
      { error: "Não foi possível verificar a sessão." },
      { status: 500 }
    );
  }
}
