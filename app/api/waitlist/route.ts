import { NextResponse } from "next/server";
import { addPerson } from "@/lib/audience";
import { notifyOwner } from "@/lib/email";
import { cleanEmail, cleanText, clientIp, readJson, sameOrigin, tooMany } from "@/lib/http";
import { marketingOptIn } from "@/lib/inquiries";
import { hasSignup, remoteSideEffectsAllowed, saveRecord } from "@/lib/records";
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
    return NextResponse.json({ ok: true, duplicate: false });
  }

  const email = cleanEmail(body.email);
  if (!email) {
    return NextResponse.json({ error: "Enter a real email address." }, { status: 400 });
  }

  if (!remoteSideEffectsAllowed()) {
    return NextResponse.json(
      { error: "This preview does not save waitlist addresses or send email." },
      { status: 503 },
    );
  }

  if (await hasSignup("waitlist", email)) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const marketing = marketingOptIn(body.updates);
  const saved = await saveRecord({
    type: "waitlist",
    email,
    marketingConsent: marketing,
    createdAt: new Date().toISOString(),
  });

  if (marketing) {
    await addPerson({ email, source: "checklist" }).catch(() => undefined);
  }

  const mailed = await notifyOwner(
    "Command Center waitlist",
    `${email} joined the UUO Command Center waitlist.${marketing ? " They also asked for notes about books and printables." : " They did not opt in to other notes."}`,
    email,
  );

  if (!saved && !mailed) {
    return NextResponse.json(
      { error: `The waitlist isn’t connected yet. Email ${site.email} and ask to be added.` },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, duplicate: false });
}
