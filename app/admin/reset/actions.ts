"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { saveAdminPassword, startPasswordReset } from "@/lib/admin-password";
import { ADMIN_COOKIE, adminConfigured, createSession, sessionCookieOptions } from "@/lib/auth";
import { sendAdminReset } from "@/lib/email";
import { cleanText, tooMany } from "@/lib/http";
import { site } from "@/lib/site";

function originFrom(headerList: Headers) {
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return site.url;
}

export async function requestAdminResetAction() {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (tooMany(`admin-reset:${ip}`, 3)) redirect("/admin/login?error=rate");
  if (!adminConfigured()) redirect("/admin/login?error=setup");

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";
  const token = await startPasswordReset();
  if (!token || !adminEmail) redirect("/admin/login?error=save");

  const link = `${originFrom(headerList)}/admin/reset?t=${encodeURIComponent(token)}`;
  const sent = await sendAdminReset(adminEmail, link);
  if (!sent) redirect("/admin/login?error=mail");
  redirect("/admin/login?sent=1");
}

export async function saveAdminPasswordAction(formData: FormData) {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (tooMany(`admin-reset-save:${ip}`, 8)) redirect("/admin/login?error=rate");

  const token = cleanText(formData.get("token"), 2000);
  const password = cleanText(formData.get("password"), 200);
  const confirm = cleanText(formData.get("confirm"), 200);
  const back = `/admin/reset?t=${encodeURIComponent(token)}`;

  if (password.length < 10) redirect(`${back}&error=short`);
  if (password !== confirm) redirect(`${back}&error=match`);

  const saved = await saveAdminPassword(token, password);
  if (!saved) redirect(`${back}&error=save`);

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, createSession(), sessionCookieOptions());
  redirect("/admin");
}
