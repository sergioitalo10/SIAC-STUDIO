import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireDesigner } from "@/lib/designer-session";

export async function POST(request: Request) {
  try {
    const designer = await requireDesigner();

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json(
        { error: "Serviço temporariamente indisponível." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Dados inválidos." },
        { status: 400 }
      );
    }

    const {
      titulo,
      descricao,
      categoria,
      preco,
      imagem_url,
      arquivo_url,
      thumbnail_url,
      tags,
    } = body;

    if (
      typeof titulo !== "string" ||
      !titulo.trim() ||
      titulo.length > 150 ||
      preco === undefined ||
      preco === null ||
      preco === ""
    ) {
      return NextResponse.json(
        { error: "Informe um título e um preço válidos." },
        { status: 400 }
      );
    }

    const precoNumerico = Number(preco);

    if (!Number.isFinite(precoNumerico) || precoNumerico <= 0) {
      return NextResponse.json(
        { error: "Preço inválido." },
        { status: 400 }
      );
    }

    const sql = neon(dbUrl);

    const result = await sql`
      INSERT INTO designer_artworks (
        designer_id, titulo, descricao, categoria, preco,
        imagem_url, arquivo_url, thumbnail_url, tags, status
      )
      VALUES (
        ${Number(designer.id)},
        ${titulo.trim()},
        ${typeof descricao === "string" ? descricao : null},
        ${typeof categoria === "string" ? categoria : null},
        ${precoNumerico},
        ${typeof imagem_url === "string" ? imagem_url : null},
        ${typeof arquivo_url === "string" ? arquivo_url : null},
        ${typeof thumbnail_url === "string" ? thumbnail_url : null},
        ${Array.isArray(tags) ? tags.join(",") : typeof tags === "string" ? tags : null},
        'pending'
      )
      RETURNING id, designer_id, titulo, status, criado_em
    `;

    return NextResponse.json({
      ok: true,
      artwork: result[0],
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Faça login para continuar." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "DESIGNER_SUSPENSO") {
      return NextResponse.json(
        { error: "A conta está suspensa." },
        { status: 403 }
      );
    }

    console.error("Erro ao criar artwork.");
    return NextResponse.json(
      { error: "Não foi possível cadastrar a obra." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const designer = await requireDesigner();

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json(
        { error: "Serviço temporariamente indisponível." },
        { status: 500 }
      );
    }

    const sql = neon(dbUrl);

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
        da.tags,
        da.status,
        da.criado_em,
        d.nome AS designer_nome
      FROM designer_artworks da
      JOIN designers d ON d.id = da.designer_id
      WHERE da.designer_id = ${Number(designer.id)}
      ORDER BY da.criado_em DESC
    `;

    return NextResponse.json({ artworks });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Faça login para continuar." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "DESIGNER_SUSPENSO") {
      return NextResponse.json(
        { error: "A conta está suspensa." },
        { status: 403 }
      );
    }

    console.error("Erro ao listar artworks.");
    return NextResponse.json(
      { error: "Não foi possível listar as obras." },
      { status: 500 }
    );
  }
}