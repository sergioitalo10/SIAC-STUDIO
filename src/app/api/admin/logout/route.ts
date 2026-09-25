import { NextResponse } from "next/server";

export async function POST() {
  localStorage.removeItem("admin_logado");
  return NextResponse.json({ ok: true });
}
