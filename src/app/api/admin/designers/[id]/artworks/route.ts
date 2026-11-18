
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAdmin } from "@/lib/admin-session";

export const runtime = "nodejs";

type Contexto = {
  params: Promise<{ id: string }>;
};

function erroJson(mensagem: string, status: number) {
  return NextResponse.json({ error: mensagem }, { status });
}

async function validarAdmin() {
  try {
    await requireAdmin();
    return null;
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return erroJson("Não autorizado.", 401);
    }

    console.error("Erro ao validar sessão administrativa.");
    return erroJson("Não foi possível validar a sessão administrativa.", 500);
  }
}

export async function PATCH(request: Request, { params }: Contexto) {
  const respostaAuth = await validarAdmin();

  if (respostaAuth) {
    return respostaAuth;
  }

  try {
    const { id } = await params;
    const designerId = Number(id);

    if (!Number.isSafeInteger(designerId) || designerId <= 0) {
      return erroJson("ID do designer inválido.", 400);
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return erroJson("Dados inválidos.", 400);
    }

    const artworkId = Number(body.artwork_id);

    if (!Number.isSafeInteger(artworkId) || artworkId <= 0) {
      return erroJson("ID da arte inválido.", 400);
    }

    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      console.error("DATABASE_URL não configurada.");
      return erroJson("Serviço temporariamente indisponível.", 500);
    }

    const sql = neon(dbUrl);

    /*
     * APROVAR OU REPROVAR ARTE
     */
    if (body.acao === "aprovar" || body.acao === "rejeitar") {
      const acao = body.acao as "aprovar" | "rejeitar";

      
let observacoes: string | null = null;

if (body.observacoes !== null && body.observacoes !== undefined) {
  if (typeof body.observacoes !== "string") {
    return erroJson(
      "As observações informadas são inválidas.",
      400
    );
  }

  const textoObservacoes = body.observacoes.trim();

  if (textoObservacoes.length > 2000) {
    return erroJson(
      "As observações devem ter no máximo 2.000 caracteres.",
      400
    );
  }

  observacoes = textoObservacoes || null;
}



      if (acao === "aprovar") {
        const resultado = await sql`
          UPDATE designer_artworks
          SET
            status = 'approved',
            aprovado_em = CURRENT_TIMESTAMP,
            rejeitado_em = NULL,
            observacoes = NULL,
            atualizado_em = CURRENT_TIMESTAMP
          WHERE id = ${artworkId}
            AND designer_id = ${designerId}
          RETURNING
            id,
            designer_id,
            titulo,
            status,
            observacoes,
            aprovado_em,
            rejeitado_em,
            atualizado_em
        `;

        if (resultado.length === 0) {
          return erroJson(
            "Arte não encontrada para este designer.",
            404
          );
        }

        return NextResponse.json({
          ok: true,
          mensagem: "Arte aprovada com sucesso.",
          artwork: resultado[0],
        });
      }

      
      const resultado = await sql`
        UPDATE designer_artworks
        SET
          status = 'rejected',
          rejeitado_em = CURRENT_TIMESTAMP,
          aprovado_em = NULL,
          observacoes = ${observacoes},
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ${artworkId}
          AND designer_id = ${designerId}
        RETURNING
          id,
          designer_id,
          titulo,
          status,
          observacoes,
          aprovado_em,
          rejeitado_em,
          atualizado_em
      `;

      if (resultado.length === 0) {
        return erroJson(
          "Arte não encontrada para este designer.",
          404
        );
      }

      const arteReprovada = resultado[0];
      const motivo =
        observacoes ||
        "Sua arte foi reprovada pela equipe administrativa. Entre em contato com o suporte para obter mais informações.";

      await sql`
        INSERT INTO designer_notifications (
          designer_id,
          artwork_id,
          tipo,
          titulo,
          mensagem
        )
        VALUES (
          ${designerId},
          ${artworkId},
          'arte_reprovada',
          ${"Arte reprovada: " + String(arteReprovada.titulo ?? "Arte")},
          ${motivo}
        )
      `;

      return NextResponse.json({
        ok: true,
        mensagem: "Arte reprovada e designer notificado.",
        artwork: arteReprovada,
      });

          return NextResponse.json({
        ok: true,
        mensagem: "Arte reprovada com sucesso.",
        artwork: resultado[0],
      });
    }

    /*
     * ATUALIZAR PREÇO E EXCLUSIVIDADE
     */
    const preco =
      body.preco === "" || body.preco === null || body.preco === undefined
        ? NaN
        : Number(body.preco);

    const valor =
      body.valor_personalizado === null ||
      body.valor_personalizado === undefined ||
      body.valor_personalizado === ""
        ? null
        : Number(body.valor_personalizado);

    const exclusiva = body.exclusiva;

    if (
      !Number.isFinite(preco) ||
      preco < 0 ||
      (valor !== null && (!Number.isFinite(valor) || valor < 0)) ||
      typeof exclusiva !== "boolean"
    ) {
      return erroJson(
        "Preço, valor personalizado ou exclusividade inválidos.",
        400
      );
    }

    const resultado = await sql`
      UPDATE designer_artworks
      SET
        preco = ${preco},
        valor_personalizado = ${valor},
        exclusiva = ${exclusiva},
        atualizado_em = CURRENT_TIMESTAMP
      WHERE id = ${artworkId}
        AND designer_id = ${designerId}
      RETURNING
        id,
        designer_id,
        preco,
        valor_personalizado,
        exclusiva,
        atualizado_em
    `;

    if (resultado.length === 0) {
      return erroJson(
        "Arte não encontrada para este designer.",
        404
      );
    }

    return NextResponse.json({
      ok: true,
      artwork: resultado[0],
    });
  } catch (error) {
    console.error("Erro ao processar arte no painel administrativo.", error);

    return erroJson("Não foi possível atualizar a arte.", 500);
  }
}
