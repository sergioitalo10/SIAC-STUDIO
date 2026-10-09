import crypto from "crypto";
import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";

const COOKIE_NAME = "siac_admin_session";
const SESSION_DAYS = 7;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não configurada");
  return neon(url);
}

export async function createAdminSession(adminId: number) {
  const sql = db();
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  await sql`DELETE FROM admin_sessions WHERE expires_at < CURRENT_TIMESTAMP`;
  await sql`
    INSERT INTO admin_sessions (admin_id, token_hash, expires_at)
    VALUES (${adminId}, ${tokenHash}, CURRENT_TIMESTAMP + INTERVAL '7 days')
  `;
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const sql = db();
  const rows: any[] = await sql`
    SELECT a.id, a.username
    FROM admin_sessions s
    JOIN admin_users a ON a.id = s.admin_id
    WHERE s.token_hash = ${hashToken(token)}
      AND s.expires_at > CURRENT_TIMESTAMP
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function clearAdminSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    const sql = db();
    await sql`DELETE FROM admin_sessions WHERE token_hash = ${hashToken(token)}`;
  }
  store.set(COOKIE_NAME, "", { httpOnly: true, expires: new Date(0), path: "/" });
}
