import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL não configurada" }, { status: 500 });
    }

    const sql = neon(dbUrl);

    // --- vendas (pedidos pagos) ---
    const pagos: any[] = await sql`
      SELECT
        p.id,
        p.email AS cliente_email,
        p.total,
        p.status,
        p.criado_em
      FROM pedidos p
      WHERE p.status = 'pago'
      ORDER BY p.id DESC
    `;

    // --- faturamento (soma dos pagos) ---
    const faturamentoRaw: any[] = await sql`
      SELECT COALESCE(SUM(total), 0) AS total FROM pedidos WHERE status = 'pago'
    `;
    const faturamento = Number(faturamentoRaw[0]?.total ?? 0);

    // --- artistas ---
    const designers: any[] = await sql`
      SELECT id, nome, email FROM designers ORDER BY id ASC
    `;

    // --- vendas por designer (via pedido_itens → produtos → designer_id) ---
    const vendasPorDesigner: any[] = await sql`
      SELECT
        d.id AS designer_id,
        d.nome AS designer_nome,
        d.email AS designer_email,
        COALESCE(SUM(
          CASE WHEN p.status = 'pago'
          THEN pi.quantidade * pi.preco
          ELSE 0 END
        ), 0) AS total_vendido,
        COUNT(DISTINCT p.id) AS qtde_pedidos
      FROM designers d
      LEFT JOIN produtos prod ON prod.designer_id = d.id
      LEFT JOIN pedido_itens pi ON pi.produto_id = prod.id
      LEFT JOIN pedidos p ON p.id = pi.pedido_id
      GROUP BY d.id, d.nome, d.email
      ORDER BY d.id ASC
    `;

    // --- artistas que não tiveram vendas ---
    const semVendas = designers.filter(
      (d) => !vendasPorDesigner.some((v) => v.designer_id === d.id)
    );

    // montar resultado
    const resultado = {
      vendas: pagos,
      faturamento,
      totalVendas: pagos.length,
      artistas: designers.map((d) => ({
        ...d,
        vendas: vendasPorDesigner.find((v) => v.designer_id === d.id) ?? {
          total_vendido: 0,
          qtde_pedidos: 0,
        },
        sem_vendas: semVendas.some((s) => s.id === d.id),
      })),
      artistasSemVendas: semVendas.map((s) => ({
        id: s.id,
        nome: s.nome,
        email: s.email,
      })),
    };

    return NextResponse.json(resultado);
  } catch (err: any) {
    console.error("Erro ao gerar relatórios:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
