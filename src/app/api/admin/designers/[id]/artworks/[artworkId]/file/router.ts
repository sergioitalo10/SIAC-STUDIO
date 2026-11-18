
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import {S3Client, GetObjectCommand,} from "@aws-sdk/client-s3";
import { requireAdmin } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Contexto = {
  params: Promise<{
    id: string;
    artworkId: string;
  }>;
};

type TipoArquivo = "preview1" | "preview2" | "original";

function erroJson(mensagem: string, status: number) {
  return NextResponse.json(
    { error: mensagem },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
      },
    }
  );
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
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function chavePermitida(
  chave: string,
  designerId: number,
  tipo: TipoArquivo
) {
  const prefixo = `designers/${designerId}/uploads/`;

  if (
    !chave.startsWith(prefixo) ||
    chave.includes("..") ||
    chave.includes("\\") ||
    chave.startsWith("/") ||
    chave.includes("\0")
  ) {
    return false;
  }

  if (tipo === "original") {
    return chave.toLowerCase().endsWith(".rar");
  }

  return chave.toLowerCase().endsWith(".png");
}

export async function GET(
  request: Request,
  { params }: Contexto
) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return erroJson("Não autorizado.", 401);
    }

    console.error("Erro ao validar sessão administrativa.");
    return erroJson(
      "Não foi possível validar a sessão administrativa.",
      500
    );
  }

  const { id, artworkId: artworkIdTexto } = await params;
  const designerId = Number(id);
  const artworkId = Number(artworkIdTexto);

  if (
    !Number.isSafeInteger(designerId) ||
    designerId <= 0 ||
    !Number.isSafeInteger(artworkId) ||
    artworkId <= 0
  ) {
    return erroJson("ID do designer ou da arte inválido.", 400);
  }

  const url = new URL(request.url);
  const tipo = url.searchParams.get("tipo");

  if (
    tipo !== "preview1" &&
    tipo !== "preview2" &&
    tipo !== "original"
  ) {
    return erroJson("Tipo de arquivo inválido.", 400);
  }

  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error("DATABASE_URL não configurada.");
    return erroJson("Serviço temporariamente indisponível.", 500);
  }

  let clienteR2: S3Client | null = null;

  try {
    const sql = neon(dbUrl);

    const resultado = await sql`
      SELECT
        id,
        designer_id,
        imagem_url,
        thumbnail_url,
        arquivo_url
      FROM designer_artworks
      WHERE id = ${artworkId}
        AND designer_id = ${designerId}
      LIMIT 1
    `;

    if (resultado.length === 0) {
      return erroJson("Arte não encontrada.", 404);
    }

    const arte = resultado[0];

    let chave: string | null = null;

    if (tipo === "preview1") {
      chave = arte.imagem_url;
    } else if (tipo === "preview2") {
      chave = arte.thumbnail_url;
    } else {
      chave = arte.arquivo_url;
    }

    if (!chave || typeof chave !== "string") {
      return erroJson("Este arquivo não está cadastrado para a arte.", 404);
    }

    if (!chavePermitida(chave, designerId, tipo)) {
      console.error("Chave de arquivo inválida para a arte:", artworkId);
      return erroJson("Arquivo inválido.", 400);
    }

    const bucket = process.env.R2_BUCKET_NAME;

    if (!bucket) {
      console.error("R2_BUCKET_NAME não configurada.");
      return erroJson("Serviço de arquivos indisponível.", 500);
    }

    clienteR2 = criarClienteR2();

    const objeto = await clienteR2.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: chave,
      })
    );

    if (!objeto.Body) {
      return erroJson("O arquivo está vazio ou indisponível.", 404);
    }

    const bytes = await objeto.Body.transformToByteArray();

    const contentType =
      tipo === "original"
        ? "application/x-rar-compressed"
        : "image/png";

    const nomeArquivo =
      tipo === "original"
        ? `arte-${artworkId}.rar`
        : `arte-${artworkId}-${tipo}.png`;

    return new Response(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition":
          tipo === "original"
            ? `attachment; filename="${nomeArquivo}"`
            : `inline; filename="${nomeArquivo}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch (error) {
    const erro = error as {
      name?: string;
      message?: string;
    };

    if (
      erro.name === "NoSuchKey" ||
      erro.name === "NotFound" ||
      erro.name === "NoSuchBucket"
    ) {
      return erroJson("Arquivo não encontrado no armazenamento.", 404);
    }

    console.error("Erro ao carregar arquivo privado da arte.", {
      artworkId,
      tipo,
      erro: erro.name || "Erro desconhecido",
    });

    if (erro.message === "CONFIGURACAO_R2_AUSENTE") {
      return erroJson("Serviço de arquivos não configurado.", 500);
    }

    return erroJson("Não foi possível carregar o arquivo.", 500);
  } finally {
    clienteR2?.destroy();
  }
}
