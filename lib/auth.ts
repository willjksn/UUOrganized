import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "uuo_admin";

const sessionSecret = () => process.env.SESSION_SECRET || process.env.DOWNLOAD_SECRET || "uuo-admin-session";

export function adminConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
}

function sameSecret(left: string, right: string) {
  const a = createHash("sha256").update(left).digest();
  const b = createHash("sha256").update(right).digest();
  return timingSafeEqual(a, b);
}

export function checkLogin(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";
  const expectedPassword = process.env.ADMIN_PASSWORD?.trim() || "";
  if (!expectedEmail || !expectedPassword) return false;
  return sameSecret(email.trim().toLowerCase(), expectedEmail) && sameSecret(password.trim(), expectedPassword);
}

export function createSession() {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 14;
  const payload = Buffer.from(JSON.stringify({ role: "admin", exp })).toString("base64url");
  const sig = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function validSession(token: string | undefined) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number; role?: string };
    return data.role === "admin" && typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export async function isAdmin() {
  const jar = await cookies();
  return validSession(jar.get(ADMIN_COOKIE)?.value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  };
}
