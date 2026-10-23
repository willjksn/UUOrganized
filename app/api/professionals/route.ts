import { NextResponse } from "next/server";
import { notifyOwner } from "@/lib/email";
import { clientIp, readJson, sameOrigin, tooMany } from "@/lib/http";
import { professionalInquiry } from "@/lib/inquiries";
import { remoteSideEffectsAllowed, saveRecord } from "@/lib/records";
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
    return NextResponse.json(
      { error: "Add your name, email, organization, what you need, and a short message." },
      { status: 400 },
    );
  }

  const inquiry = professionalInquiry(body);
  if ("bot" in inquiry) return NextResponse.json({ ok: true });
  if ("error" in inquiry) return NextResponse.json({ error: inquiry.error }, { status: 400 });

  if (!remoteSideEffectsAllowed()) {
    return NextResponse.json(
      { error: `This preview does not send inquiries. Email ${site.email} instead.` },
      { status: 503 },
    );
  }

  const saved = await saveRecord({
    type: "professional",
    name: inquiry.name,
    email: inquiry.email,
    organization: inquiry.organization,
    role: inquiry.role,
    category: inquiry.category,
    message: inquiry.message,
    createdAt: new Date().toISOString(),
  });

  const mailed = await notifyOwner(
    `Book inquiry from ${inquiry.name}`,
    [
      `From: ${inquiry.name}`,
      `Email: ${inquiry.email}`,
      `Organization: ${inquiry.organization}`,
      inquiry.role ? `Role: ${inquiry.role}` : "",
      `Request: ${inquiry.category}`,
      "",
      inquiry.message,
    ]
      .filter(Boolean)
      .join("\n"),
    inquiry.email,
  );

  if (!saved && !mailed) {
    return NextResponse.json(
      { error: `The form isn’t connected yet. Email ${site.email} and it will get there.` },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
