
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Criação manual de comissões desativada. As comissões são registradas após a confirmação do pagamento pelo Mercado Pago.",
    },
    { status: 410 }
  );
}
