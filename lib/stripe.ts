import { createHmac, timingSafeEqual } from "crypto";

const STRIPE = "https://api.stripe.com/v1";

export type PaidSession = {
  id: string;
  paymentStatus: string;
  slug: string;
  email: string;
  buyerName: string;
  address: string;
  amountCents: number;
  shippingCents: number;
  totalCents: number;
};

const SHIP_COUNTRIES = [
  "US", "CA", "MX", "GB", "IE", "AU", "NZ", "DE", "FR", "ES", "IT", "NL", "BE", "AT", "CH",
  "SE", "NO", "DK", "FI", "PT", "PL", "JP", "SG", "KR", "IN", "BR", "ZA", "AE",
];

function secretKey() {
  return process.env.STRIPE_SECRET_KEY || "";
}

function redact(value: string) {
  return value.replace(/[rs]k_(live|test)_[A-Za-z0-9]+/g, "[key]").slice(0, 180);
}

async function stripe(path: string, body?: URLSearchParams, method = "POST") {
  const key = secretKey();
  if (!key) return null;
  const response = await fetch(`${STRIPE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body,
  });
  const json = (await response.json().catch(() => null)) as {
    error?: { message?: string; code?: string };
  } | null;
  if (!response.ok || !json) {
    console.error("Stripe", response.status, json?.error?.code || "", redact(json?.error?.message || ""));
    return null;
  }
  return json as Record<string, unknown>;
}

export async function createCheckoutSession(input: {
  slug: string;
  name: string;
  summary: string;
  cents: number;
  origin: string;
  shipping?: { usCents: number; intlCents: number | null };
}) {
  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("success_url", `${input.origin}/shop/purchased?session_id={CHECKOUT_SESSION_ID}`);
  body.set("cancel_url", `${input.origin}/shop#${input.slug}`);
  body.set("client_reference_id", input.slug);
  body.set("metadata[slug]", input.slug);
  body.set("line_items[0][quantity]", "1");
  body.set("line_items[0][price_data][currency]", "usd");
  body.set("line_items[0][price_data][unit_amount]", String(input.cents));
  body.set("line_items[0][price_data][product_data][name]", input.name.slice(0, 250));
  body.set("line_items[0][price_data][product_data][description]", input.summary.slice(0, 400));
  body.set("payment_method_types[0]", "card");

  if (input.shipping) {
    const countries = input.shipping.intlCents == null ? ["US"] : SHIP_COUNTRIES;
    countries.forEach((country, index) => {
      body.set(`shipping_address_collection[allowed_countries][${index}]`, country);
    });
    addShippingOption(body, 0, "Shipping in the United States", input.shipping.usCents);
    if (input.shipping.intlCents != null) {
      addShippingOption(body, 1, "Shipping outside the United States", input.shipping.intlCents);
    }
  }

  const json = await stripe("/checkout/sessions", body);
  const url = json && typeof json.url === "string" ? json.url : "";
  const id = json && typeof json.id === "string" ? json.id : "";
  if (!url.startsWith("https://checkout.stripe.com/") || !id.startsWith("cs_")) return null;
  return { id, url };
}

function addShippingOption(body: URLSearchParams, index: number, name: string, cents: number) {
  const prefix = `shipping_options[${index}][shipping_rate_data]`;
  body.set(`${prefix}[display_name]`, name);
  body.set(`${prefix}[type]`, "fixed_amount");
  body.set(`${prefix}[fixed_amount][amount]`, String(cents));
  body.set(`${prefix}[fixed_amount][currency]`, "usd");
}

export async function getCheckoutSession(sessionId: string): Promise<PaidSession | null> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;
  const json = await stripe(`/checkout/sessions/${sessionId}`, undefined, "GET");
  if (!json) return null;
  const metadata = json.metadata as { slug?: unknown } | undefined;
  const details = json.customer_details as { email?: unknown; name?: unknown; address?: Address } | undefined;
  const shipping = json.shipping_details as { name?: unknown; address?: Address } | undefined;
  const totals = json.total_details as { amount_shipping?: unknown } | undefined;
  const slug = typeof metadata?.slug === "string" ? metadata.slug : "";
  const email =
    (typeof details?.email === "string" ? details.email : "") ||
    (typeof json.customer_email === "string" ? json.customer_email : "");
  const buyerName =
    (typeof shipping?.name === "string" ? shipping.name : "") ||
    (typeof details?.name === "string" ? details.name : "");
  const address = formatAddress(buyerName, shipping?.address || details?.address);
  const amountCents = numberOrZero(json.amount_subtotal);
  const shippingCents = numberOrZero(totals?.amount_shipping);
  const totalCents = numberOrZero(json.amount_total) || amountCents + shippingCents;
  return {
    id: String(json.id || ""),
    paymentStatus: String(json.payment_status || ""),
    slug,
    email: email.trim().toLowerCase(),
    buyerName: buyerName.trim(),
    address,
    amountCents,
    shippingCents,
    totalCents,
  };
}

type Address = {
  line1?: unknown;
  line2?: unknown;
  city?: unknown;
  state?: unknown;
  postal_code?: unknown;
  country?: unknown;
};

function numberOrZero(value: unknown) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : 0;
}

function formatAddress(name: string, address?: Address) {
  if (!address) return name.trim();
  const cityLine = [address.city, address.state, address.postal_code]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(", ");
  return [name, address.line1, address.line2, cityLine, address.country]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join("\n");
}

export function verifyStripeSignature(payload: string, header: string | null, secret: string) {
  if (!header || !secret) return false;
  let timestamp = "";
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const eq = part.indexOf("=");
    if (eq < 1) continue;
    const name = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (name === "t") timestamp = value;
    if (name === "v1") signatures.push(value);
  }
  if (!/^\d+$/.test(timestamp) || signatures.length === 0) return false;
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (age > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const expectedBuf = Buffer.from(expected);
  return signatures.some((signature) => {
    const got = Buffer.from(signature);
    return got.length === expectedBuf.length && timingSafeEqual(got, expectedBuf);
  });
}
