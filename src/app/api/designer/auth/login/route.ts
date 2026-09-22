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
    const { email, senha } = body;

    if (!email || !senha) {
      return NextResponse.json({ error: "Preencha e-mail e senha" }, { status: 400 });
    }

    const designers: any[] = await sql`
      SELECT id, nome, email, senha FROM designers WHERE email = ${email}
    `;

    if (designers.length === 0) {
      return NextResponse.json({ error: "E-mail não encontrado" }, { status: 401 });
    }

    const designer = designers[0];
    const senhaValida = await bcrypt.compare(senha, designer.senha);

    if (!senhaValida) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }

    // Salva na localStorage do cliente (frontend cuida disso)
    return NextResponse.json({
      ok: true,
      designer: {
        id: designer.id,
        nome: designer.nome,
        email: designer.email,
      },
    });
  } catch (error: any) {
    console.error("Erro no login do designer:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
