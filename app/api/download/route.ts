import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { checklistFile, validToken } from "@/lib/records";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const jar = await cookies();
  const allowed = jar.get("uuo_checklist")?.value === "ok" || validToken(url.searchParams.get("token"));

  if (!allowed) {
    return NextResponse.redirect(new URL("/#checklist", url.origin));
  }

  const file = await checklistFile();

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="UUO-First-48-Hours-Home-Checklist.pdf"',
      "Cache-Control": "private, no-store",
    },
  });
}
