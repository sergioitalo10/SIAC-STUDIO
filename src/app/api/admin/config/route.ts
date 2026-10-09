import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin-session";

export async function GET() {
  try {
    const admin = await requireAdmin();
    return NextResponse.json({ username: admin.username });
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const username = String(body.username || "").trim();
    const password = body.password ? String(body.password) : "";
    if (!username) return NextResponse.json({ error: "Informe o usuário" }, { status: 400 });
    if (password && password.length < 8) return NextResponse.json({ error: "A nova senha deve ter pelo menos 8 caracteres" }, { status: 400 });
    const sql = neon(process.env.DATABASE_URL!);
    if (password) {
      const hash = await bcrypt.hash(password, 12);
      await sql`UPDATE admin_users SET username = ${username}, password_hash = ${hash} WHERE id = ${admin.id}`;
    } else {
      await sql`UPDATE admin_users SET username = ${username} WHERE id = ${admin.id}`;
    }
    return NextResponse.json({ ok: true, username });
  } catch (error: any) {
    if (error?.code === "23505") return NextResponse.json({ error: "Esse usuário já está em uso" }, { status: 409 });
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
}
