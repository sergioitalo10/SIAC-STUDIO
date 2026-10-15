
import { NextResponse } from "next/server";
import { clearDesignerSession } from "@/lib/designer-session";

export async function POST() {
  try {
    await clearDesignerSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao encerrar sessão do designer.");

    return NextResponse.json(
      { error: "Não foi possível encerrar a sessão." },
      { status: 500 }
    );
  }
}
