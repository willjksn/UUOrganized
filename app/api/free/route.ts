import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { addPerson } from "@/lib/audience";
import { readDownload } from "@/lib/downloads";
import { notifyOwner, sendDownload } from "@/lib/email";
import { cleanEmail, cleanText, clientIp, readJson, sameOrigin, tooMany } from "@/lib/http";
import { getCatalog } from "@/lib/catalog";
import { downloadToken, saveRecord, validToken } from "@/lib/records";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cookieName(slug: string) {
  return `uuo_dl_${slug}`;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "That didn’t go through." }, { status: 403 });
  }
  if (tooMany(`free:${clientIp(request)}`)) {
    return NextResponse.json({ error: "Too many tries. Wait a minute and try again." }, { status: 429 });
  }

  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Enter a real email address." }, { status: 400 });

  const slug = cleanText(body.slug, 80);
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "That file isn’t available." }, { status: 404 });
  }

  if (cleanText(body.company, 200)) {
    const decoy = NextResponse.json({ ok: true, emailed: false });
    decoy.cookies.set(cookieName(slug), "ok", cookieOptions());
    return decoy;
  }

  const email = cleanEmail(body.email);
  if (!email) return NextResponse.json({ error: "Enter a real email address." }, { status: 400 });

  const catalog = await getCatalog();
  const product = catalog.products.find((item) => item.slug === slug && item.freeDownload);
  if (!product) return NextResponse.json({ error: "That file isn’t available." }, { status: 404 });

  const file = await readDownload(slug);
  if (!file) return NextResponse.json({ error: "That file isn’t ready yet." }, { status: 404 });

  await saveRecord({
    type: "download",
    email,
    product: product.name,
    createdAt: new Date().toISOString(),
  });
  await addPerson({ email, source: "download" }).catch(() => undefined);

  const downloadUrl = `${site.url}/api/free?slug=${slug}&token=${downloadToken(slug)}`;
  const emailed = await sendDownload(email, product.name, product.fileName || `${slug}.pdf`, downloadUrl, file);
  await notifyOwner("New free download", `${email} asked for ${product.name}.`, email);

  const response = NextResponse.json({ ok: true, emailed });
  response.cookies.set(cookieName(slug), "ok", cookieOptions());
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") || "";
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.redirect(new URL("/shop", url.origin));
  }

  const jar = await cookies();
  const allowed = jar.get(cookieName(slug))?.value === "ok" || validToken(url.searchParams.get("token"), slug);
  if (!allowed) return NextResponse.redirect(new URL(`/shop#${slug}`, url.origin));

  const catalog = await getCatalog();
  const product = catalog.products.find((item) => item.slug === slug && item.freeDownload);
  const file = product ? await readDownload(slug) : null;
  if (!product || !file) return NextResponse.redirect(new URL("/shop", url.origin));

  const filename = (product.fileName || `${slug}.pdf`).replace(/["\r\n]/g, "");
  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
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
