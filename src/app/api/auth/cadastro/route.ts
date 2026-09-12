import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { nome, email, senha } = await request.json();

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: "Nome, e-mail e senha são obrigatórios." },
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

    // Verificação se o e-mail já está cadastrado
    const existente: any = await sql`
      SELECT id FROM usuarios WHERE email = ${email.toLowerCase().trim()}
    `;

    if (existente.length > 0) {
      return NextResponse.json(
        { error: "Já existe uma conta cadastrada com este e-mail." },
        { status: 400 }
      );
    }

    // Hash da senha com salt de 10 rodadas
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserção do novo usuário
    const resultado: any = await sql`
      INSERT INTO usuarios (nome, email, senha_hash)
      VALUES (${nome}, ${email.toLowerCase().trim()}, ${senhaHash})
      RETURNING id, nome, email
    `;

    const novoUsuario = resultado[0];

    return NextResponse.json(
      {
        ok: true,
        mensagem: "Cadastro realizado com sucesso!",
        usuario: novoUsuario,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json(
      { error: "Erro interno ao cadastrar usuário." },
      { status: 500 }
    );
  }
}