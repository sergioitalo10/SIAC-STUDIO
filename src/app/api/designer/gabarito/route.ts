import { NextResponse } from "next/server";

// URL do Google Drive (pode ser configurada via env ou hardcode aqui)
const GABARITO_DRIVE_URL =
  process.env.GABARITO_DRIVE_URL ||
  "https://drive.google.com/uc?id=PLACEHOLDER_ID&export=download";

export async function GET() {
  // Retorna o link do Google Drive para download
  // O frontend redireciona para lá após validar a sessão
  return NextResponse.json({
    url: GABARITO_DRIVE_URL,
    mensagem: "Link de download do gabarito",
  });
}
