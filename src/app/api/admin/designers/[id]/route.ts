
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

function responderErroAutenticacao(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401 }
    );
  }

  return null;
}

export async function GET(_: Request, { params }: RouteContext) {
  try {
    await requireAdmin();
  } catch (error) {
    const resposta = responderErroAutenticacao(error);
    if (resposta) return resposta;

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
  } catch (error) {
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
  } catch (error) {
    const resposta = responderErroAutenticacao(error);
    if (resposta) return resposta;

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

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Corpo da requisição inválido." },
        { status: 400 }
      );
    }

    const camposPermitidos = [
      "nome",
      "whatsapp",
      "documento",
      "dados_pagamento",
      "pix",
      "percentual_comissao",
      "status"
    ];

    const camposEnviados = Object.keys(body);

    if (
      camposEnviados.length === 0 ||
      camposEnviados.some((campo) => !camposPermitidos.includes(campo))
    ) {
      return NextResponse.json(
        { error: "Nenhum campo válido para atualização." },
        { status: 400 }
      );
    }

    const sql = getDatabase();

    const existing = await sql`
      SELECT id
      FROM designers
      WHERE id = ${designerId}
      LIMIT 1
    `;

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Designer não encontrado." },
        { status: 404 }
      );
    }

    const possui = (campo: string) =>
      Object.prototype.hasOwnProperty.call(body, campo);

    let percentual: number | undefined;

    if (possui("percentual_comissao")) {
      const valor = body.percentual_comissao;

      if (
        (typeof valor !== "number" && typeof valor !== "string") ||
        String(valor).trim() === ""
      ) {
        return NextResponse.json(
          { error: "Informe um percentual válido entre 0 e 100." },
          { status: 400 }
        );
      }

      percentual = Number(valor);

      if (
        !Number.isFinite(percentual) ||
        percentual < 0 ||
        percentual > 100
      ) {
        return NextResponse.json(
          { error: "A comissão deve estar entre 0 e 100." },
          { status: 400 }
        );
      }
    }

    
let status: "pendente" | "aprovado" | "suspenso" | undefined;

if (possui("status")) {
  if (typeof body.status !== "string") {
    return NextResponse.json(
      { error: "Status do designer inválido." },
      { status: 400 }
    );
  }

  const valorStatus = body.status.trim().toLowerCase();

  if (!["pendente", "aprovado", "suspenso"].includes(valorStatus)) {
    return NextResponse.json(
      { error: "Status deve ser pendente, aprovado ou suspenso." },
      { status: 400 }
    );
  }

  status = valorStatus as "pendente" | "aprovado" | "suspenso";
}

    const nome = possui("nome")
      ? typeof body.nome === "string"
        ? body.nome.trim()
        : null
      : undefined;

    if (possui("nome") && !nome) {
      return NextResponse.json(
        { error: "O nome não pode ficar vazio." },
        { status: 400 }
      );
    }

    const whatsapp = possui("whatsapp")
      ? body.whatsapp == null
        ? null
        : String(body.whatsapp).trim() || null
      : undefined;

    const documento = possui("documento")
      ? body.documento == null
        ? null
        : String(body.documento).trim() || null
      : undefined;

    const dadosPagamento = possui("dados_pagamento")
      ? body.dados_pagamento == null
        ? null
        : String(body.dados_pagamento).trim() || null
      : undefined;

    const pix = possui("pix")
      ? body.pix == null
        ? null
        : String(body.pix).trim() || null
      : undefined;

    await sql`
      UPDATE designers
      SET
        nome = CASE WHEN ${possui("nome")} THEN ${nome ?? null} ELSE nome END,
        whatsapp = CASE WHEN ${possui("whatsapp")} THEN ${whatsapp ?? null} ELSE whatsapp END,
        documento = CASE WHEN ${possui("documento")} THEN ${documento ?? null} ELSE documento END,
        dados_pagamento = CASE WHEN ${possui("dados_pagamento")} THEN ${dadosPagamento ?? null} ELSE dados_pagamento END,
        pix = CASE WHEN ${possui("pix")} THEN ${pix ?? null} ELSE pix END,
        percentual_comissao = CASE
        WHEN ${percentual !== undefined} THEN ${percentual ?? null}
        ELSE percentual_comissao
        END,
        status = CASE
          WHEN ${status !== undefined} THEN ${status ?? null}
          ELSE status
        END

      WHERE id = ${designerId}
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      "Erro ao atualizar designer:",
      error instanceof Error ? error.message : "Erro desconhecido"
    );

    return NextResponse.json(
      { error: "Não foi possível atualizar o designer." },
      { status: 500 }
    );
  }
}
