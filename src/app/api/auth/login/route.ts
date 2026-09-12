import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, senha } = await request.json();

    if (!email || !senha) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json(
        { error: "DATABASE_URL não configurada." },
        { status: 500 }
      );
    }

    const sql = neon(dbUrl);

    // Busca o usuário no banco pelo e-mail
    const usuarios: any = await sql`
      SELECT id, nome, email, senha_hash 
      FROM usuarios 
      WHERE email = ${email.toLowerCase().trim()}
    `;

    if (usuarios.length === 0) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    const usuario = usuarios[0];

    // Valida a senha informada com o hash salvo no banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        mensagem: "Login efetuado com sucesso!",
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: "Erro interno ao realizar login." },
      { status: 500 }
    );
  }
}