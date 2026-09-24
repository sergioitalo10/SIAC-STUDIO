import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

/* ---------- helpers ---------- */

function ensureAdminTable(sql: any) {
  return sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

async function getAdminUser(sql: any, username: string) {
  const rows: any[] = await sql`
    SELECT id, username, password_hash
    FROM admin_users
    WHERE username = ${username}
    LIMIT 1
  `;
  return rows[0] || null;
}

/* ---------- POST: login ---------- */

export async function POST(request: Request) {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json(
        { error: "DATABASE_URL não configurada" },
        { status: 500 }
      );
    }

    const sql = neon(dbUrl);
    await ensureAdminTable(sql);

    const { username, password } = await request.json();

    // Se não tem admin cadastrado, cria o primeiro com admin/admin
    let admin = await getAdminUser(sql, username || "admin");
    if (!admin) {
      const hash = await bcrypt.hash(password || "admin", 10);
      await sql`
        INSERT INTO admin_users (username, password_hash)
        VALUES (${username || "admin"}, ${hash})
      `;
      admin = await getAdminUser(sql, username || "admin");
    }

    // Valida senha
    const valido = await bcrypt.compare(password, admin.password_hash);
    if (!valido) {
      return NextResponse.json({ error: "Usuário ou senha inválidos." }, { status: 401 });
    }

    // Cria cookie de sessão
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/admin",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
