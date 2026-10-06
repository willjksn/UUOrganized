import { NextResponse } from "next/server";
import { addPerson } from "@/lib/audience";
import { notifyOwner, sendChecklist } from "@/lib/email";
import { cleanEmail, cleanText, clientIp, readJson, sameOrigin, tooMany } from "@/lib/http";
import { downloadToken, saveRecord } from "@/lib/records";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "That didn’t go through." }, { status: 403 });
  }

  if (tooMany(clientIp(request))) {
    return NextResponse.json({ error: "Too many tries. Wait a minute and try again." }, { status: 429 });
  }

  const body = await readJson(request);
  if (!body) {
    return NextResponse.json({ error: "Enter a real email address." }, { status: 400 });
  }

  if (cleanText(body.company, 200)) {
    const decoy = NextResponse.json({ ok: true, emailed: false });
    decoy.cookies.set("uuo_checklist", "ok", cookieOptions());
    return decoy;
  }

  const email = cleanEmail(body.email);
  if (!email) {
    return NextResponse.json({ error: "Enter a real email address." }, { status: 400 });
  }

  await saveRecord({
    type: "checklist",
    email,
    createdAt: new Date().toISOString(),
  });
  await addPerson({ email, source: "checklist" }).catch(() => undefined);

  const downloadUrl = `${site.url}/api/download?token=${downloadToken()}`;
  const emailed = await sendChecklist(email, downloadUrl);
  await notifyOwner(
    "New checklist signup",
    `${email} asked for the First 48 Hours checklist.`,
    email,
  );

  const response = NextResponse.json({ ok: true, emailed });
  response.cookies.set("uuo_checklist", "ok", cookieOptions());
  return response;
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}
