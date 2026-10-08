export const appOrigin = "https://app.uuorganized.com";

export type AppPlan = "free" | "command-center" | "family";
export type AppInterval = "monthly" | "annual";

export function signupHref(plan: AppPlan, interval?: AppInterval) {
  const url = new URL("/signup", appOrigin);
  url.searchParams.set("plan", plan);
  if (plan !== "free" && interval) url.searchParams.set("interval", interval);
  return url.toString();
}

export const loginHref = new URL("/login", appOrigin).toString();

export const legalLinks = [
  { href: new URL("/terms", appOrigin).toString(), label: "Terms of Service" },
  { href: new URL("/privacy", appOrigin).toString(), label: "Privacy Policy" },
  {
    href: new URL("/consumer-health-data-privacy", appOrigin).toString(),
    label: "Consumer Health Data Privacy",
  },
] as const;

export function isAppHref(href: string) {
  try {
    const url = new URL(href);
    return url.protocol === "https:" && url.hostname === "app.uuorganized.com";
  } catch {
    return false;
  }
}
