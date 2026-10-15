
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { createDesignerSession } from "@/lib/designer-session";

export async function POST(request: Request) {
  try {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      return NextResponse.json(
        { error: "Serviço temporariamente indisponível." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => null);
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const senha = typeof body?.senha === "string" ? body.senha : "";

    if (!email || !senha) {
      return NextResponse.json(
        { error: "Preencha e-mail e senha." },
        { status: 400 }
      );
    }

    if (email.length > 255 || senha.length > 1024) {
      return NextResponse.json(
        { error: "E-mail ou senha inválidos." },
        { status: 400 }
      );
    }

    const sql = neon(dbUrl);

    const designers = await sql`
      SELECT id, nome, email, senha
      FROM designers
      WHERE LOWER(email) = ${email}
      LIMIT 1
    `;

    if (designers.length === 0) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    const designer = designers[0];
    const senhaValida = await bcrypt.compare(senha, designer.senha);

    if (!senhaValida) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    await createDesignerSession(Number(designer.id));

    return NextResponse.json({
      ok: true,
      designer: {
        id: designer.id,
        nome: designer.nome,
        email: designer.email,
      },
    });
  } catch (error) {
    console.error("Erro no login do designer.");

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Não foi possível realizar o login." },
      { status: 500 }
    );
  }
}
