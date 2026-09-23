import { NextResponse } from "next/server";

export async function GET() {
  // Redirect para o arquivo estático em /public/gabarito/
  // O arquivo é servido como static asset pelo Next.js
  return NextResponse.redirect(
    new URL("/gabarito/gabarito-siac-studio.rar", "https://siac-studio.vercel.app"),
    302
  );
}
