import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = new URL("/unsubscribe", url.origin);
  const email = url.searchParams.get("e");
  const token = url.searchParams.get("t");
  if (email) next.searchParams.set("e", email);
  if (token) next.searchParams.set("t", token);
  return NextResponse.redirect(next);
}
