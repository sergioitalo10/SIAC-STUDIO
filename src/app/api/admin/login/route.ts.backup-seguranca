import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { createAdminSession } from "@/lib/admin-session";

export async function POST(request: Request) {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return NextResponse.json({ error: "DATABASE_URL não configurada" }, { status: 500 });
    const sql = neon(dbUrl);
    const { username, password } = await request.json();
    if (!username || !password) return NextResponse.json({ error: "Usuário e senha são obrigatórios" }, { status: 400 });
    await sql`CREATE TABLE IF NOT EXISTS admin_users (id SERIAL PRIMARY KEY, username VARCHAR(100) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL)`;
    const admins: any[] = await sql`SELECT id, username, password_hash FROM admin_users WHERE username = ${username} LIMIT 1`;
    let admin = admins[0];
    if (!admin) {
      const count: any[] = await sql`SELECT COUNT(*)::int AS total FROM admin_users`;
      if (Number(count[0]?.total) !== 0) return NextResponse.json({ error: "Usuário ou senha incorretos" }, { status: 401 });
      if (String(password).length < 8) return NextResponse.json({ error: "A senha inicial deve ter pelo menos 8 caracteres" }, { status: 400 });
      const hash = await bcrypt.hash(password, 12);
      const created: any[] = await sql`INSERT INTO admin_users (username, password_hash) VALUES (${username}, ${hash}) RETURNING id, username, password_hash`;
      admin = created[0];
    }
    if (!(await bcrypt.compare(password, admin.password_hash))) return NextResponse.json({ error: "Usuário ou senha incorretos" }, { status: 401 });
    await sql`CREATE TABLE IF NOT EXISTS admin_sessions (id SERIAL PRIMARY KEY, admin_id INT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE, token_hash VARCHAR(128) NOT NULL UNIQUE, expires_at TIMESTAMP NOT NULL, criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
    await createAdminSession(admin.id);
    return NextResponse.json({ ok: true, username: admin.username });
  } catch (error) {
    console.error("Erro no login admin:", error);
    return NextResponse.json({ error: "Erro interno no login" }, { status: 500 });
  }
}
