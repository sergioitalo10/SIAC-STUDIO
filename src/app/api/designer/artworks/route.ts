import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireDesigner } from "@/lib/designer-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function mensagemStatus(error: unknown) {
  if (!(error instanceof Error)) return null;

  if (error.message === "UNAUTHORIZED") {
    return { error: "Faça login para continuar.", status: 401 };
  }

  if (error.message === "DESIGNER_SUSPENSO") {
    return { error: "A conta está suspensa.", status: 403 };
  }

  if (error.message === "DESIGNER_NAO_APROVADO") {
    return {
      error: "Sua conta precisa estar aprovada para realizar esta operação.",
      status: 403,
    };
  }

  return null;
}

function obterChave(
  valor: unknown,
  tipo: "rar" | "preview",
  designerId: number
): string | null | undefined {
  // undefined significa que o campo não foi enviado.
  // null significa que foi enviado explicitamente vazio.
  if (valor === undefined) return undefined;
  if (valor === null || valor === "") return null;

  if (typeof valor !== "string") {
    throw new Error("CHAVE_ARQUIVO_INVALIDA");
  }

  const chave = valor.trim();
  const prefixo = `designers/${designerId}/uploads/`;

  if (
    !chave.startsWith(prefixo) ||
    chave.includes("..") ||
    chave.includes("\\") ||
    chave.includes("?") ||
    chave.includes("#") ||
    /^https?:\/\//i.test(chave)
  ) {
    throw new Error("CHAVE_ARQUIVO_INVALIDA");
  }

  const extensaoValida =
    tipo === "rar"
      ? chave.toLowerCase().endsWith(".rar")
      : chave.toLowerCase().endsWith(".png");

  if (!extensaoValida) {
    throw new Error("EXTENSAO_ARQUIVO_INVALIDA");
  }

  return chave;
}

function converterTags(tags: unknown): string | null | undefined {
  if (tags === undefined) return undefined;
  if (tags === null || tags === "") return null;

  if (Array.isArray(tags)) {
    if (!tags.every((tag) => typeof tag === "string")) {
      throw new Error("TAGS_INVALIDAS");
    }
    return tags.join(",");
  }

  if (typeof tags === "string") return tags;

  throw new Error("TAGS_INVALIDAS");
}

export async function POST(request: Request) {
  try {
    const designer = await requireDesigner();
    const designerId = Number(designer.id);

    if (!Number.isSafeInteger(designerId) || designerId <= 0) {
      return jsonError("Sessão de designer inválida.", 401);
    }

    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      return jsonError("Serviço temporariamente indisponível.", 500);
    }

    const url = new URL(request.url);
    const artworkIdParam = url.searchParams.get("artwork_id");
    const artworkId = artworkIdParam === null ? null : Number(artworkIdParam);

    if (
      artworkIdParam !== null &&
      (!Number.isSafeInteger(artworkId) || Number(artworkId) <= 0)
    ) {
      return jsonError("Identificador da arte inválido.", 400);
    }

    const body: unknown = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonError("Dados inválidos.", 400);
    }

    const dados = body as Record<string, unknown>;
    const {
      titulo,
      descricao,
      categoria,
      preco,
      imagem_url,
      arquivo_url,
      thumbnail_url,
      tags,
    } = dados;

    if (
      typeof titulo !== "string" ||
      !titulo.trim() ||
      titulo.trim().length > 150
    ) {
      return jsonError("Informe um título válido de até 150 caracteres.", 400);
    }

    if (
      preco === undefined ||
      preco === null ||
      preco === "" ||
      !Number.isFinite(Number(preco)) ||
      Number(preco) <= 0
    ) {
      return jsonError("Informe um preço válido.", 400);
    }

    if (descricao !== undefined && descricao !== null && typeof descricao !== "string") {
      return jsonError("Descrição inválida.", 400);
    }

    if (categoria !== undefined && categoria !== null && typeof categoria !== "string") {
      return jsonError("Categoria inválida.", 400);
    }

    let novaImagem: string | null | undefined;
    let novoThumbnail: string | null | undefined;
    let novoArquivo: string | null | undefined;
    let novasTags: string | null | undefined;

    try {
      novaImagem = obterChave(imagem_url, "preview", designerId);
      novoThumbnail = obterChave(thumbnail_url, "preview", designerId);
      novoArquivo = obterChave(arquivo_url, "rar", designerId);
      novasTags = converterTags(tags);
    } catch (error) {
      if (error instanceof Error && error.message === "TAGS_INVALIDAS") {
        return jsonError("As tags enviadas são inválidas.", 400);
      }

      if (error instanceof Error && error.message === "EXTENSAO_ARQUIVO_INVALIDA") {
        return jsonError("A extensão de um dos arquivos é inválida.", 400);
      }

      return jsonError(
        "Uma chave de arquivo é inválida. Envie os arquivos novamente.",
        400
      );
    }

    const sql = neon(dbUrl);
    const precoNumerico = Number(preco);
    const descricaoFinal = typeof descricao === "string" ? descricao.trim() : null;
    const categoriaFinal = typeof categoria === "string" ? categoria.trim() : null;

    if (artworkId !== null) {
      const existentes = await sql`
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

      if (existentes.length === 0) {
        return jsonError("Arte não encontrada ou sem permissão para editá-la.", 404);
      }

      const atual = existentes[0];

      // Campos omitidos são preservados. Isso também permite editar
      // artes antigas sem precisar reenviar URLs legadas.
      const imagemFinal =
        novaImagem === undefined ? atual.imagem_url : novaImagem;
      const thumbnailFinal =
        novoThumbnail === undefined ? atual.thumbnail_url : novoThumbnail;
      const arquivoFinal =
        novoArquivo === undefined ? atual.arquivo_url : novoArquivo;

      if (!imagemFinal || !thumbnailFinal || !arquivoFinal) {
        return jsonError(
          "A arte precisa ter os dois previews e o arquivo RAR. Envie os arquivos que estiverem faltando.",
          400
        );
      }

      const resultado = await sql`
        UPDATE designer_artworks
        SET
          titulo = ${titulo.trim()},
          descricao = ${descricaoFinal},
          categoria = ${categoriaFinal},
          preco = ${precoNumerico},
          imagem_url = ${imagemFinal},
          thumbnail_url = ${thumbnailFinal},
          arquivo_url = ${arquivoFinal},
          tags = CASE
            WHEN ${novasTags !== undefined} THEN ${novasTags ?? null}
            ELSE tags
          END,
          status = 'pending',
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ${artworkId}
          AND designer_id = ${designerId}
        RETURNING
          id,
          designer_id,
          titulo,
          descricao,
          categoria,
          preco,
          imagem_url,
          thumbnail_url,
          status,
          criado_em,
          atualizado_em
      `;

      return NextResponse.json({
        ok: true,
        artwork: resultado[0],
        message: "Arte atualizada e enviada novamente para análise.",
      });
    }

    // Novo cadastro: os três arquivos precisam ter sido enviados ao R2.
    if (!novaImagem || !novoThumbnail || !novoArquivo) {
      return jsonError(
        "Envie o preview.png, o preview2.png e o arquivo .rar antes de cadastrar a arte.",
        400
      );
    }

    const resultado = await sql`
      INSERT INTO designer_artworks (
        designer_id,
        titulo,
        descricao,
        categoria,
        preco,
        imagem_url,
        arquivo_url,
        thumbnail_url,
        tags,
        status
      )
      VALUES (
        ${designerId},
        ${titulo.trim()},
        ${descricaoFinal},
        ${categoriaFinal},
        ${precoNumerico},
        ${novaImagem},
        ${novoArquivo},
        ${novoThumbnail},
        ${novasTags ?? null},
        'pending'
      )
      RETURNING
        id,
        designer_id,
        titulo,
        descricao,
        categoria,
        preco,
        imagem_url,
        thumbnail_url,
        status,
        criado_em
    `;

    return NextResponse.json(
      {
        ok: true,
        artwork: resultado[0],
        message: "Arte cadastrada e enviada para análise.",
      },
      { status: 201 }
    );
  } catch (error) {
    const respostaStatus = mensagemStatus(error);

    if (respostaStatus) {
      return jsonError(respostaStatus.error, respostaStatus.status);
    }

    console.error("Erro ao salvar arte do designer:", error);
    return jsonError("Não foi possível salvar a arte.", 500);
  }
}

export async function GET(request: Request) {
  try {
    const designer = await requireDesigner();
    const designerId = Number(designer.id);

    if (!Number.isSafeInteger(designerId) || designerId <= 0) {
      return jsonError("Sessão de designer inválida.", 401);
    }

    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      return jsonError("Serviço temporariamente indisponível.", 500);
    }

    const sql = neon(dbUrl);
    const url = new URL(request.url);
    const artworkIdParam = url.searchParams.get("artwork_id");

    if (artworkIdParam !== null) {
      const artworkId = Number(artworkIdParam);

      if (!Number.isSafeInteger(artworkId) || artworkId <= 0) {
        return jsonError("Identificador da arte inválido.", 400);
      }

      const resultado = await sql`
        SELECT
          id,
          designer_id,
          titulo,
          descricao,
          categoria,
          preco,
          imagem_url,
          thumbnail_url,
          arquivo_url,
          tags,
          status,
          criado_em,
          atualizado_em
        FROM designer_artworks
        WHERE id = ${artworkId}
          AND designer_id = ${designerId}
        LIMIT 1
      `;

      if (resultado.length === 0) {
        return jsonError("Arte não encontrada.", 404);
      }

      return NextResponse.json(
        { artwork: resultado[0] },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const artworks = await sql`
      SELECT
        da.id,
        da.designer_id,
        da.titulo,
        da.descricao,
        da.categoria,
        da.preco,
        da.imagem_url,
        da.thumbnail_url,
        da.arquivo_url,
        da.tags,
        da.status,
        da.criado_em,
        da.atualizado_em,
        d.nome AS designer_nome
      FROM designer_artworks da
      JOIN designers d ON d.id = da.designer_id
      WHERE da.designer_id = ${designerId}
      ORDER BY da.criado_em DESC
    `;

    return NextResponse.json(
      { artworks },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const respostaStatus = mensagemStatus(error);

    if (respostaStatus) {
      return jsonError(respostaStatus.error, respostaStatus.status);
    }

    console.error("Erro ao listar artes do designer:", error);
    return jsonError("Não foi possível listar as artes.", 500);
  }
}