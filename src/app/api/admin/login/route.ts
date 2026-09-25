import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

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
        password_hash VARCHAR(255) NOT NULL
      )
    `;

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Usuário e senha são obrigatórios" }, { status: 400 });
    }

    // Tenta buscar o admin no banco
    const admins: any[] = await sql`
      SELECT id, username, password_hash FROM admin_users WHERE username = ${username} LIMIT 1
    `;

    let admin = admins[0];
    let needsCreate = false;

    if (!admin) {
      // Admin não existe, cria com as credenciais informadas
      const hash = await bcrypt.hash(password, 10);
      await sql`
        INSERT INTO admin_users (username, password_hash)
        VALUES (${username}, ${hash})
      `;
      admin = { username, password_hash: hash };
      needsCreate = true;
    }

    // Valida senha
    const valido = await bcrypt.compare(password, admin.password_hash);
    if (!valido) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }

    return NextResponse.json({ ok: true, username: admin.username });
  } catch (err: any) {
    console.error("Erro no login:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
