import { fallbackPricing, parsePublicPricing, pricingUrl, type PublicPricing } from "./pricing-contract";

export type PricingSource = "api" | "fallback";

export type ResolvedPricing = {
  pricing: PublicPricing;
  source: PricingSource;
};

type NextFetchInit = RequestInit & { next?: { revalidate?: number } };

const OK_TTL_MS = 5 * 60 * 1000;
const FAIL_TTL_MS = 30 * 1000;

let cache: { expires: number; result: ResolvedPricing } | null = null;

export function clearPricingCache() {
  cache = null;
}

function fallbackResult(): ResolvedPricing {
  return { pricing: fallbackPricing, source: "fallback" };
}

export async function getPublicPricing(options?: {
  fetchImpl?: typeof fetch;
  now?: number;
  timeoutMs?: number;
}): Promise<ResolvedPricing> {
  const now = options?.now ?? Date.now();
  const injected = Boolean(options?.fetchImpl);
  if (!injected && cache && cache.expires > now) return cache.result;

  const result = await readPricing(options?.fetchImpl ?? fetch, options?.timeoutMs ?? 2500);
  if (!injected) {
    cache = { result, expires: now + (result.source === "api" ? OK_TTL_MS : FAIL_TTL_MS) };
  }
  return result;
}

async function readPricing(fetchImpl: typeof fetch, timeoutMs: number): Promise<ResolvedPricing> {
  try {
    const response = await fetchImpl(pricingUrl, {
      signal: AbortSignal.timeout(timeoutMs),
      next: { revalidate: 300 },
    } as NextFetchInit);
    if (!response.ok) return fallbackResult();
    const pricing = parsePublicPricing(await response.json());
    if (!pricing) return fallbackResult();
    return { pricing, source: "api" };
  } catch {
    return fallbackResult();
  }
}
