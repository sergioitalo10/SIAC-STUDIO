import { headers } from "next/headers";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const gabaritoPath = path.join(
    process.cwd(),
    "public",
    "gabarito",
    "gabarito-siax-studio.rar"
  );

  if (!fs.existsSync(gabaritoPath)) {
    return NextResponse.json(
      { error: "Gabarito não encontrado. Entre em contato com o administrador." },
      { status: 404 }
    );
  }

  const fileBuffer = fs.readFileSync(gabaritoPath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": 'attachment; filename="gabarito-siax-studio.rar"',
      "Content-Length": fileBuffer.length.toString(),
    },
  });
}
