import { NextResponse } from "next/server";
import { notifyOwner } from "@/lib/email";
import { cleanEmail, cleanText, clientIp, readJson, sameOrigin, tooMany } from "@/lib/http";
import { saveRecord } from "@/lib/records";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "That didn’t go through." }, { status: 403 });
  }

  if (tooMany(clientIp(request), 6)) {
    return NextResponse.json({ error: "Too many tries. Wait a minute and try again." }, { status: 429 });
  }

  const body = await readJson(request);
  if (!body) {
    return NextResponse.json({ error: "Add your name, a real email, and a message." }, { status: 400 });
  }

  if (cleanText(body.company, 200)) {
    return NextResponse.json({ ok: true });
  }

  const name = cleanText(body.name, 120);
  const email = cleanEmail(body.email);
  const message = cleanText(body.message, 4000);

  if (!name || !email || message.length < 2) {
    return NextResponse.json(
      { error: "Add your name, a real email, and a message." },
      { status: 400 },
    );
  }

  const saved = await saveRecord({
    type: "contact",
    name,
    email,
    message,
    createdAt: new Date().toISOString(),
  });

  const mailed = await notifyOwner(
    `Message from ${name}`,
    `From: ${name}\nEmail: ${email}\n\n${message}`,
    email,
  );

  if (!saved && !mailed) {
    return NextResponse.json(
      { error: `The form isn’t connected yet. Email ${site.email} and it will get there.` },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
