
import crypto from "crypto";
import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";

const COOKIE_NAME = "siac_designer_session";
const SESSION_DAYS = 7;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não configurada");
  return neon(url);
}

export async function createDesignerSession(designerId: number) {
  if (!Number.isSafeInteger(designerId) || designerId <= 0) {
    throw new Error("ID de designer inválido");
  }

  const sql = db();
  const designers = await sql`
    SELECT id FROM designers WHERE id = ${designerId} LIMIT 1
  `;

  if (designers.length === 0) {
    throw new Error("Designer não encontrado");
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);

  await sql`
    DELETE FROM designer_sessions
    WHERE expires_at < CURRENT_TIMESTAMP
  `;

  await sql`
    INSERT INTO designer_sessions (designer_id, token_hash, expires_at)
    VALUES (
      ${designerId},
      ${tokenHash},
      CURRENT_TIMESTAMP + INTERVAL '7 days'
    )
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

export async function getDesignerSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const sql = db();
  const rows = await sql`
    SELECT d.id, d.nome, d.email, d.status
    FROM designer_sessions s
    JOIN designers d ON d.id = s.designer_id
    WHERE s.token_hash = ${hashToken(token)}
      AND s.expires_at > CURRENT_TIMESTAMP
    LIMIT 1
  `;

  return rows[0] || null;
}

export async function requireDesigner() {
  const designer = await getDesignerSession();

  if (!designer) throw new Error("UNAUTHORIZED");

  if (String(designer.status ?? "").toLowerCase() === "suspenso") {
    throw new Error("DESIGNER_SUSPENSO");
  }

  return designer;
}

export async function requireApprovedDesigner() {
  const designer = await requireDesigner();
  const status = String(designer.status ?? "").toLowerCase();

  if (status !== "aprovado" && status !== "approved") {
    throw new Error("DESIGNER_NAO_APROVADO");
  }

  return designer;
}

export async function clearDesignerSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  try {
    if (token) {
      const sql = db();
      await sql`
        DELETE FROM designer_sessions
        WHERE token_hash = ${hashToken(token)}
      `;
    }
  } finally {
    store.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
      maxAge: 0,
    });
  }
}
