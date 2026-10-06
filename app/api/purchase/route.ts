import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { readDownload } from "@/lib/downloads";
import { fulfillPaidSession } from "@/lib/purchases";
import { validToken } from "@/lib/records";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cookieName(slug: string) {
  return `uuo_buy_${slug}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id") || "";
  const slugParam = url.searchParams.get("slug") || "";
  const token = url.searchParams.get("token");
  const jar = await cookies();

  let slug = "";
  if (sessionId) {
    const result = await fulfillPaidSession(sessionId);
    if (result.state !== "paid") return NextResponse.redirect(new URL("/shop", url.origin));
    slug = result.slug;
  } else if (/^[a-z0-9-]+$/.test(slugParam) && validToken(token, `buy:${slugParam}`)) {
    slug = slugParam;
  } else if (/^[a-z0-9-]+$/.test(slugParam) && jar.get(cookieName(slugParam))?.value === "ok") {
    slug = slugParam;
  } else {
    return NextResponse.redirect(new URL("/shop", url.origin));
  }

  const catalog = await getCatalog();
  const product = catalog.products.find((item) => item.slug === slug && item.paidDownload);
  const file = product ? await readDownload(slug) : null;
  if (!product || !file) return NextResponse.redirect(new URL("/shop", url.origin));

  const filename = (product.fileName || `${slug}.pdf`).replace(/["\r\n]/g, "");
  const response = new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
  response.cookies.set(cookieName(slug), "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
