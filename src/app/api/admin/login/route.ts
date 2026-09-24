import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const adminUser = process.env.ADMIN_USERNAME;
    const adminPassHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminUser || !adminPassHash) {
      return NextResponse.json(
        { error: "Admin não configurado. Configure ADMIN_USERNAME e ADMIN_PASSWORD_HASH." },
        { status: 500 }
      );
    }

    if (username !== adminUser) {
      return NextResponse.json({ error: "Usuário ou senha inválidos." }, { status: 401 });
    }

    const valido = await bcrypt.compare(password, adminPassHash);
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
