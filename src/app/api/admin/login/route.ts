
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { createAdminSession } from "@/lib/admin-session";

export async function POST(request: Request) {
  try {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      return NextResponse.json(
        { error: "Serviço temporariamente indisponível" },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => null);

    const username =
      typeof body?.username === "string"
        ? body.username.trim()
        : "";

    const password =
      typeof body?.password === "string"
        ? body.password
        : "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuário ou senha incorretos" },
        { status: 401 }
      );
    }

    if (username.length > 100 || password.length > 1024) {
      return NextResponse.json(
        { error: "Usuário ou senha incorretos" },
        { status: 401 }
      );
    }

    const sql = neon(dbUrl);

    const admins = await sql`
      SELECT id, username, password_hash
      FROM admin_users
      WHERE username = ${username}
      LIMIT 1
    `;

    const admin = admins[0] as
      | {
          id: number;
          username: string;
          password_hash: string;
        }
      | undefined;

    if (
      !admin ||
      typeof admin.password_hash !== "string" ||
      !(await bcrypt.compare(password, admin.password_hash))
    ) {
      return NextResponse.json(
        { error: "Usuário ou senha incorretos" },
        { status: 401 }
      );
    }

    await createAdminSession(admin.id);

    return NextResponse.json({
      ok: true,
      username: admin.username,
    });
  } catch (error) {
    console.error(
      "Erro no login administrativo:",
      error instanceof Error
        ? error.message
        : "Erro desconhecido"
    );

    return NextResponse.json(
      { error: "Erro interno no login" },
      { status: 500 }
    );
  }
}
