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

    // Garante a tabela existe
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Verifica se já tem um admin cadastrado
    const existentes: any[] = await sql`SELECT id FROM admin_users LIMIT 1`;

    const body = await request.json();
    const { username, currentPassword, newPassword } = body;

    if (!username || !newPassword) {
      return NextResponse.json({ error: "Usuário e nova senha são obrigatórios." }, { status: 400 });
    }

    if (existentes.length === 0) {
      // Primeiro cadastro: não precisa de senha atual
      const hash = await bcrypt.hash(newPassword, 10);
      await sql`
        INSERT INTO admin_users (username, password_hash)
        VALUES (${username}, ${hash})
      `;
      return NextResponse.json({ ok: true, message: "Admin criado com sucesso." });
    }

    if (!currentPassword) {
      return NextResponse.json({ error: "Senha atual é obrigatória para alterar." }, { status: 400 });
    }

    // Valida senha atual
    const admins: any[] = await sql`SELECT id, password_hash FROM admin_users LIMIT 1`;
    const admin = admins[0];
    if (!admin || !admin.password_hash) {
      return NextResponse.json({ error: "Admin não encontrado." }, { status: 404 });
    }
    const valido = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!valido) {
      return NextResponse.json({ error: "Senha atual incorreta." }, { status: 401 });
    }

    // Atualiza
    const novoHash = await bcrypt.hash(newPassword, 10);
    await sql`
      UPDATE admin_users
      SET username = ${username}, password_hash = ${novoHash}
      WHERE id = ${admin.id}
    `;

    return NextResponse.json({ ok: true, message: "Login e senha atualizados com sucesso." });
  } catch (err: any) {
    console.error("Erro ao atualizar configurações:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
