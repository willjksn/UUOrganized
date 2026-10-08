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

export function isAppHref(href: string) {
  try {
    const url = new URL(href);
    return url.protocol === "https:" && url.hostname === "app.uuorganized.com";
  } catch {
    return false;
  }
}
