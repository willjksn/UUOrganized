import { NextResponse } from "next/server";
import { fulfillPaidSession } from "@/lib/purchases";
import { verifyStripeSignature } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if (!verifyStripeSignature(payload, request.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: { type?: string; data?: { object?: { id?: string } } };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    return NextResponse.json({ ok: true });
  }

  const result = await fulfillPaidSession(event.data?.object?.id || "");
  if (result.state === "error") return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}
