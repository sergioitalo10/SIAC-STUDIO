
import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import { requireApprovedDesigner } from "@/lib/designer-session";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function criarClienteR2() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("CONFIGURACAO_R2_AUSENTE");
  }

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function rarValido(bytes: Uint8Array) {
  const rar4 = [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x00];
  const rar5 = [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x01, 0x00];

  return [rar4, rar5].some(
    (assinatura) =>
      bytes.length >= assinatura.length &&
      assinatura.every((byte, i) => bytes[i] === byte)
  );
}

function pngValido(bytes: Uint8Array) {
  const assinatura = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

  return (
    bytes.length >= assinatura.length &&
    assinatura.every((byte, i) => bytes[i] === byte)
  );
}

export async function POST(request: NextRequest) {
  let clienteR2: S3Client | null = null;

  try {
    const designer = await requireApprovedDesigner();

    const bucket = process.env.R2_BUCKET_NAME;
    if (!bucket) {
      return jsonError("Armazenamento temporariamente indisponível.", 500);
    }

    clienteR2 = criarClienteR2();

    const formData = await request.formData();
    const file = formData.get("file");
    const tipo = formData.get("tipo");

    if (tipo !== "rar" && tipo !== "preview") {
      return jsonError("Tipo de arquivo inválido.", 400);
    }

    if (!(file instanceof File) || file.size === 0) {
      return jsonError("Selecione um arquivo.", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonError("O arquivo não pode ultrapassar 20 MB.", 413);
    }

    const extensao = tipo === "rar" ? ".rar" : ".png";
    if (!file.name.toLowerCase().endsWith(extensao)) {
      return jsonError(`Envie um arquivo ${extensao}.`, 400);
    }

    const conteudo = new Uint8Array(await file.arrayBuffer());

    if (tipo === "rar" && !rarValido(conteudo)) {
      return jsonError("O conteúdo não é um arquivo RAR válido.", 400);
    }

    if (tipo === "preview" && !pngValido(conteudo)) {
      return jsonError("O conteúdo não é uma imagem PNG válida.", 400);
    }

    const designerId = Number(designer.id);
    if (!Number.isSafeInteger(designerId) || designerId <= 0) {
      return jsonError("Sessão de designer inválida.", 401);
    }

    const chave = `designers/${designerId}/uploads/${crypto.randomUUID()}${extensao}`;

    await clienteR2.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: chave,
        Body: conteudo,
        ContentLength: conteudo.byteLength,
        ContentType:
          tipo === "rar" ? "application/x-rar-compressed" : "image/png",
        Metadata: {
          "designer-id": String(designerId),
          "arquivo-tipo": tipo,
        },
      })
    );

    return NextResponse.json(
      {
        success: true,
        key: chave,
        tipo,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const mensagem = error instanceof Error ? error.message : "";

    if (
      mensagem.includes("UNAUTHORIZED") ||
      mensagem.includes("DESIGNER_NAO_AUTENTICADO")
    ) {
      return jsonError("Faça login para enviar arquivos.", 401);
    }

    if (mensagem.includes("DESIGNER_SUSPENSO")) {
      return jsonError("Sua conta está suspensa.", 403);
    }

    if (mensagem.includes("DESIGNER_NAO_APROVADO")) {
      return jsonError("Sua conta ainda não foi aprovada.", 403);
    }

    if (mensagem.includes("CONFIGURACAO_R2_AUSENTE")) {
      console.error("As variáveis de ambiente do R2 estão incompletas.");
      return jsonError("Armazenamento temporariamente indisponível.", 500);
    }

    console.error("Erro no upload:", mensagem || "Erro desconhecido");
    return jsonError("Não foi possível enviar o arquivo.", 500);
  } finally {
    clienteR2?.destroy();
  }
}
