import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "arquivos", "upload");

export async function POST(request: NextRequest) {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado." },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const ext = fileName.split(".").pop()?.toLowerCase();

    if (ext !== "rar") {
      return NextResponse.json(
        { error: "Apenas arquivos .rar são aceitos." },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(UPLOAD_DIR, fileName);

    if (fs.existsSync(filePath)) {
      const nameWithoutExt = fileName.replace(".rar", "");
      const timestamp = Date.now();
      const newName = `${nameWithoutExt}_${timestamp}.rar`;
      const newPath = path.join(UPLOAD_DIR, newName);
      fs.writeFileSync(newPath, fileBuffer);
      return NextResponse.json({
        success: true,
        message: "Arquivo enviado para análise.",
        fileName: newName,
      });
    }

    fs.writeFileSync(filePath, fileBuffer);

    return NextResponse.json({
      success: true,
      message: "Arquivo enviado para análise.",
      fileName,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro ao processar o upload." },
      { status: 500 }
    );
  }
}
