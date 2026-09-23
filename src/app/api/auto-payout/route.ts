// Verifica e dispara payouts automáticos para earnings pendentes
// Deve ser chamado periodicamente ou quando uma venda é aprovada

import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const MP_TOKEN = process.env.MP_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN || "APP_USR-1019679740284004-082521-49c4031fad060ecc2bcfc5b83bcf234a-131847059";
const DB_URL = process.env.DATABASE_URL || "";

export async function runAutoPayout(): Promise<{ processed: number; success: number; failed: number; errors: string[] }> {
  const result: { processed: number; success: number; failed: number; errors: string[] } = {
    processed: 0, success: 0, failed: 0, errors: [],
  };

  if (!DB_URL) {
    result.errors.push("DATABASE_URL não configurada");
    return result;
  }

  const sql = neon(DB_URL);

  try {
    // Buscar earnings pendentes (status = 'pendente')
    const pendentes: any[] = await sql`
      SELECT
        de.id, de.designer_artwork_id, de.designer_id,
        de.valor_venda, de.valor_comissao, de.status, de.pedido_id,
        da.titulo as nome_arte, da.preco as preco_artwork,
        d.nome as designer_nome, d.email as designer_email
      FROM designer_earnings de
      JOIN designer_artworks da ON da.id = de.designer_artwork_id
      JOIN designers d ON d.id = de.designer_id
      WHERE de.status = 'pendente'
      ORDER BY de.criado_em ASC
      LIMIT 50
    `;

    for (const earning of pendentes) {
      result.processed++;
      const key = earning.designer_email || earning.designer_nome;

      // Verificar se designer está na blacklist
      const isBlacklisted: any[] = await sql`
        SELECT blacklist_reason FROM designers WHERE id = ${earning.designer_id} AND blacklist_reason IS NOT NULL
      `;

      if (isBlacklisted.length > 0) {
        result.failed++;
        result.errors.push(`Designer #${earning.designer_id} blacklistado: ${isBlacklisted[0].blacklist_reason}`);
        await sql`
          UPDATE designer_earnings SET status = 'reprovado' WHERE id = ${earning.id}
        `;
        continue;
      }

      const idempotencyKey = `auto-payout-${earning.id}-${Date.now()}`;

      try {
        const mpResp = await fetch("https://api.mercadopago.com/v1/payments", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${MP_TOKEN}`,
            "Content-Type": "application/json",
            "X-Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify({
            transaction_amount: earning.valor_comissao,
            description: `Payout automático — ${earning.nome_arte} (pedido #${earning.pedido_id})`,
            payment_method_id: "pix",
            payer: { email: key },
            external_reference: `auto-payout-${earning.id}`,
          }),
        });

        const mpData = await mpResp.json();

        if (!mpResp.ok) {
          throw new Error(mpData.message || "MP falhou");
        }

        // Atualizar earning para enviado
        await sql`
          UPDATE designer_earnings SET status = 'enviado' WHERE id = ${earning.id}
        `;

        // Registrar payout
        await sql`
          INSERT INTO designer_payouts (earning_id, mp_payment_id, valor, status, criado_em)
          VALUES (
            ${earning.id}, ${mpData.id ? String(mpData.id) : null}, ${earning.valor_comissao}, 'enviado', NOW()
          )
        `;

        result.success++;
      } catch (err: any) {
        result.failed++;
        result.errors.push(`Earning #${earning.id}: ${err.message}`);
        // Marcar como falhou para não reprocessar infinitamente
        await sql`
          UPDATE designer_earnings SET status = 'falha_envio' WHERE id = ${earning.id}
        `;
      }
    }
  } catch (err: any) {
    result.errors.push(`Job error: ${err.message}`);
  }

  return result;
}

// Endpoint para disparar manualmente (admin ou teste)
export async function POST(request: Request) {
  try {
    if (!DB_URL) {
      return NextResponse.json({ error: "DATABASE_URL não configurada" }, { status: 500 });
    }

    const result = await runAutoPayout();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
