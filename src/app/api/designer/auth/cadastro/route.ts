import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL não configurada" }, { status: 500 });
    }

    const sql = neon(dbUrl);
    const body = await request.json();
    const { nome, email, senha, pix } = body;

    if (!nome || !email || !senha) {
      return NextResponse.json({ error: "Preencha nome, e-mail e senha" }, { status: 400 });
    }

    // Verifica se já existe
    const existente: any[] = await sql`
      SELECT id FROM designers WHERE email = ${email}
    `;

    if (existente.length > 0) {
      return NextResponse.json({ error: "Este e-mail já está cadastrado" }, { status: 409 });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const result: any = await sql`
      INSERT INTO designers (nome, email, senha, pix)
      VALUES (${nome}, ${email}, ${senhaHash}, ${pix || null})
      RETURNING id, nome, email, pix, created_at
    `;

    return NextResponse.json({
      ok: true,
      designer: {
        id: result[0].id,
        nome: result[0].nome,
        email: result[0].email,
        pix: result[0].pix,
      },
    });
  } catch (error: any) {
    console.error("Erro no cadastro do designer:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
