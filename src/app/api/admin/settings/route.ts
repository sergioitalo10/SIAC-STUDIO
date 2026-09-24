import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

export async function GET() {
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

    const usuarios: any[] = await sql`
      SELECT id, username, created_at
      FROM admin_users
      ORDER BY id ASC
    `;

    return NextResponse.json({ admin_users: usuarios });
  } catch (err: any) {
    console.error("Erro ao listar admin users:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
