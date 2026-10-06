import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { clientIp, sameOrigin, tooMany } from "@/lib/http";
import { createCheckoutSession } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const unavailable = (slug = "") =>
    NextResponse.redirect(new URL(`/shop?checkout=unavailable${slug ? `#${slug}` : ""}`, url.origin), 303);

  if (!sameOrigin(request) || tooMany(`checkout:${clientIp(request)}`)) return unavailable();

  const form = await request.formData().catch(() => null);
  const slug = String(form?.get("slug") || "");
  if (!/^[a-z0-9-]+$/.test(slug)) return unavailable();

  const catalog = await getCatalog();
  const product = catalog.products.find((item) => item.slug === slug && (item.paidDownload || item.ships));
  if (!product?.priceCents || product.stock === 0) {
    return NextResponse.redirect(new URL(`/shop?checkout=${product?.stock === 0 ? "soldout" : "unavailable"}${slug ? `#${slug}` : ""}`, url.origin), 303);
  }

  const session = await createCheckoutSession({
    slug,
    name: product.name,
    summary: product.summary || product.name,
    cents: product.priceCents,
    origin: url.origin,
    shipping: product.ships
      ? { usCents: product.shippingCents || 0, intlCents: product.shippingIntlCents ?? null }
      : undefined,
  });
  if (!session) return unavailable(slug);
  return NextResponse.redirect(session.url, 303);
}
