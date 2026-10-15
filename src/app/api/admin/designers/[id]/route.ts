import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAdmin } from "@/lib/admin-session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function getDatabase() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error("DATABASE_URL não configurada");
  }

  return neon(dbUrl);
}

export async function GET(_: Request, { params }: RouteContext) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    console.error("Erro ao validar sessão administrativa.");

    return NextResponse.json(
      { error: "Não foi possível validar a sessão." },
      { status: 500 }
    );
  }

  try {
    const { id } = await params;
    const designerId = Number(id);

    if (!Number.isSafeInteger(designerId) || designerId <= 0) {
      return NextResponse.json(
        { error: "ID do designer inválido." },
        { status: 400 }
      );
    }

    const sql = getDatabase();

    const designers = await sql`
      SELECT
        id,
        nome,
        email,
        whatsapp,
        documento,
        status,
        percentual_comissao,
        dados_pagamento,
        pix,
        created_at
      FROM designers
      WHERE id = ${designerId}
      LIMIT 1
    `;

    if (designers.length === 0) {
      return NextResponse.json(
        { error: "Designer não encontrado." },
        { status: 404 }
      );
    }

    const artworks = await sql`
      SELECT
        id,
        designer_id,
        titulo,
        descricao,
        categoria,
        preco,
        imagem_url,
        thumbnail_url,
        tags,
        status,
        valor_personalizado,
        exclusiva,
        criado_em,
        atualizado_em
      FROM designer_artworks
      WHERE designer_id = ${designerId}
      ORDER BY criado_em DESC
    `;

    return NextResponse.json(
      {
        designer: designers[0],
        artworks,
        earnings: [],
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    console.error("Erro ao consultar designer e suas artes.");

    return NextResponse.json(
      { error: "Não foi possível consultar o designer." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await params;
    const designerId = Number(id);

    if (!Number.isInteger(designerId) || designerId <= 0) {
      return NextResponse.json(
        { error: "ID do designer inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const sql = getDatabase();

    const nome =
      body.nome == null ? null : String(body.nome).trim();

    const whatsapp =
      body.whatsapp == null ? null : String(body.whatsapp).trim();

    const documento =
      body.documento == null ? null : String(body.documento).trim();

    const dadosPagamento =
      body.dados_pagamento == null
        ? null
        : String(body.dados_pagamento).trim();

    const pix =
      body.pix == null ? null : String(body.pix).trim();

    const percentual = Number(body.percentual_comissao);

    if (
      body.percentual_comissao == null ||
      !Number.isFinite(percentual) ||
      percentual < 0 ||
      percentual > 100
    ) {
      return NextResponse.json(
        { error: "A comissão deve estar entre 0 e 100." },
        { status: 400 }
      );
    }

    if (nome !== null && !nome) {
      return NextResponse.json(
        { error: "O nome não pode ficar vazio." },
        { status: 400 }
      );
    }

    const existing = await sql`
      SELECT id
      FROM designers
      WHERE id = ${designerId}
    `;

    if (!existing.length) {
      return NextResponse.json(
        { error: "Designer não encontrado" },
        { status: 404 }
      );
    }

    await sql`
      UPDATE designers
      SET
        nome = COALESCE(${nome}, nome),
        whatsapp = COALESCE(${whatsapp}, whatsapp),
        documento = COALESCE(${documento}, documento),
        dados_pagamento = COALESCE(${dadosPagamento}, dados_pagamento),
        pix = COALESCE(${pix}, pix),
        percentual_comissao = ${percentual}
      WHERE id = ${designerId}
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao atualizar designer:", error);

    return NextResponse.json(
      { error: "Não foi possível atualizar o designer." },
      { status: 500 }
    );
  }
}