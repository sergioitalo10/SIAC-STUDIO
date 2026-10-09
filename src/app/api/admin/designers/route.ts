import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAdmin } from "@/lib/admin-session";
export async function GET() {
  try { await requireAdmin(); const sql=neon(process.env.DATABASE_URL!); const designers=await sql`SELECT id,nome,email,especialidade,pix,pix_tipo,comissao_percentual,valor_padrao_arte,criado_em FROM designers ORDER BY nome`; return NextResponse.json({designers}); }
  catch { return NextResponse.json({error:"Não autorizado"},{status:401}); }
}
