import { NextResponse } from "next/server";
import { getAdminSession, clearAdminSession } from "@/lib/admin-session";

export async function GET() {
  try {
    const admin = await getAdminSession();
    return NextResponse.json({ authenticated: !!admin, username: admin?.username || null }, { status: admin ? 200 : 401 });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
