
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-session";

export async function POST() {
  try {
    await requireAdmin();

    return NextResponse.json(
      {
        error:
          "Repasses automáticos temporariamente desativados. O fluxo será reabilitado após a implementação da transferência segura e da prevenção contra pagamentos duplicados.",
      },
      { status: 503 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    console.error("Erro ao validar acesso administrativo aos repasses.");

    return NextResponse.json(
      { error: "Não foi possível validar o acesso." },
      { status: 500 }
    );
  }
}
