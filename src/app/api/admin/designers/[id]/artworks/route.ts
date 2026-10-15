
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAdmin } from "@/lib/admin-session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Dados inválidos." },
        { status: 400 }
      );
    }

    const artworkId = Number(body.artwork_id);
    const preco = Number(body.preco);

    const valor =
      body.valor_personalizado === null ||
      body.valor_personalizado === undefined ||
      body.valor_personalizado === ""
        ? null
        : Number(body.valor_personalizado);

    const exclusiva = body.exclusiva;

    if (
      !Number.isSafeInteger(artworkId) ||
      artworkId <= 0 ||
      body.preco === "" ||
      body.preco === null ||
      body.preco === undefined ||
      !Number.isFinite(preco) ||
      preco < 0 ||
      (valor !== null && (!Number.isFinite(valor) || valor < 0)) ||
      typeof exclusiva !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Preço, valor personalizado ou exclusividade inválidos." },
        { status: 400 }
      );
    }

    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      return NextResponse.json(
        { error: "Serviço temporariamente indisponível." },
        { status: 500 }
      );
    }

    const sql = neon(dbUrl);

    const result = await sql`
      UPDATE designer_artworks
      SET
        preco = ${preco},
        valor_personalizado = ${valor},
        exclusiva = ${exclusiva},
        atualizado_em = CURRENT_TIMESTAMP
      WHERE id = ${artworkId}
        AND designer_id = ${designerId}
      RETURNING id, designer_id, preco, valor_personalizado, exclusiva, atualizado_em
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Arte não encontrada para este designer." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      artwork: result[0],
    });
  } catch {
    console.error("Erro ao atualizar arte pelo painel administrativo.");

    return NextResponse.json(
      { error: "Não foi possível atualizar a arte." },
      { status: 500 }
    );
  }
}
