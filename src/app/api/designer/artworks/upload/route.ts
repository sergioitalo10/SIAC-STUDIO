import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { requireDesigner } from "@/lib/designer-session";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "arquivos", "upload");
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

function isRar(buffer: Buffer) {
  const rar4 = Buffer.from([0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x00]);
  const rar5 = Buffer.from([0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x01, 0x00]);

  return (
    buffer.subarray(0, rar4.length).equals(rar4) ||
    buffer.subarray(0, rar5.length).equals(rar5)
  );
}

export async function POST(request: NextRequest) {
  try {
    await requireDesigner();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Selecione um arquivo válido." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "O arquivo não pode ultrapassar 20 MB." },
        { status: 413 }
      );
    }

    if (path.extname(file.name).toLowerCase() !== ".rar") {
      return NextResponse.json(
        { error: "Apenas arquivos .rar são aceitos." },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    if (!isRar(fileBuffer)) {
      return NextResponse.json(
        { error: "O conteúdo enviado não parece ser um arquivo RAR válido." },
        { status: 400 }
      );
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const fileName = `${crypto.randomUUID()}.rar`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    await fs.writeFile(filePath, fileBuffer, { flag: "wx" });

    return NextResponse.json({
      success: true,
      message: "Arquivo recebido.",
      fileName,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Faça login para enviar arquivos." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "DESIGNER_SUSPENSO") {
      return NextResponse.json(
        { error: "A conta está suspensa." },
        { status: 403 }
      );
    }

    console.error("Erro ao processar upload.");
    return NextResponse.json(
      { error: "Não foi possível processar o upload." },
      { status: 500 }
    );
  }
}