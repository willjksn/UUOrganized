/**
 * Public pricing contract from GET https://app.uuorganized.com/api/pricing.
 * Display strings are the source of truth. This file never stores Stripe Price IDs.
 * `fallbackPricing` is used only when that request fails or the payload is unusable.
 * If the live contract changes shape, update the parser and this fallback together.
 */

export const pricingUrl = "https://app.uuorganized.com/api/pricing";

export const planSlugs = ["free", "command-center", "family"] as const;
export const addonKeys = ["additional_person", "extra_storage_10gb"] as const;

export type PublicPlanSlug = (typeof planSlugs)[number];
export type PublicAddonKey = (typeof addonKeys)[number];

export type PublicPlanContract = {
  slug: PublicPlanSlug;
  name: string;
  outcome: string;
  audience: string;
  monthlyPrice: string;
  annualPrice: string | null;
  annualEquivalent: string | null;
  annualSavings: string | null;
  maxCareRecipients: number;
  maxWorkspaceMembers: number;
  familySharing: boolean;
  monthlyAiAllowance: number;
  storageLabel: string;
  exportsEnabled: boolean;
  advancedReminders: boolean;
};

export type PublicAddonContract = {
  key: PublicAddonKey;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  eligiblePlans: PublicPlanSlug[];
  effect: string;
};

export type PublicPricing = {
  annualBillingMessage: string;
  plans: PublicPlanContract[];
  addons: PublicAddonContract[];
};

const pricePattern = /^\$\d+(?:\.\d{2})?$/;
const equivalentPattern = /^\$\d+\.\d{2}\/mo$/;
const savingsPattern = /^Save \d+%$/;
const addonMonthlyPattern = /^\+\$\d+\.\d{2}\/mo$/;
const addonAnnualPattern = /^\$\d+\.\d{2}\/year$/;

export function storageLabel(bytes: number): string | null {
  if (!Number.isInteger(bytes) || bytes <= 0) return null;
  const megabyte = 1024 * 1024;
  const gigabyte = megabyte * 1024;
  if (bytes % gigabyte === 0) return `${bytes / gigabyte} GB`;
  if (bytes % megabyte === 0) return `${bytes / megabyte} MB`;
  return null;
}

export const fallbackPricing: PublicPricing = {
  annualBillingMessage: "Save 20% with annual billing",
  plans: [
    {
      slug: "free",
      name: "Free",
      outcome: "Get organized.",
      audience: "See whether one place for care actually helps.",
      monthlyPrice: "$0",
      annualPrice: null,
      annualEquivalent: null,
      annualSavings: null,
      maxCareRecipients: 1,
      maxWorkspaceMembers: 2,
      familySharing: false,
      monthlyAiAllowance: 10,
      storageLabel: "250 MB",
      exportsEnabled: false,
      advancedReminders: false,
    },
    {
      slug: "command-center",
      name: "Caregiver",
      outcome: "I manage care.",
      audience: "The person who keeps the list, with room for a few people helping.",
      monthlyPrice: "$11.99",
      annualPrice: "$114.99",
      annualEquivalent: "$9.58",
      annualSavings: "Save 20%",
      maxCareRecipients: 1,
      maxWorkspaceMembers: 4,
      familySharing: false,
      monthlyAiAllowance: 100,
      storageLabel: "2 GB",
      exportsEnabled: true,
      advancedReminders: true,
    },
    {
      slug: "family",
      name: "Caregiver Family",
      outcome: "We manage care.",
      audience: "The people helping can share the list, the messages, and the handoffs.",
      monthlyPrice: "$19.99",
      annualPrice: "$191.99",
      annualEquivalent: "$16.00",
      annualSavings: "Save 20%",
      maxCareRecipients: 3,
      maxWorkspaceMembers: 10,
      familySharing: true,
      monthlyAiAllowance: 300,
      storageLabel: "10 GB",
      exportsEnabled: true,
      advancedReminders: true,
    },
  ],
  addons: [
    {
      key: "additional_person",
      name: "Additional Person",
      monthlyPrice: "+$5.99/mo",
      annualPrice: "$57.99/year",
      eligiblePlans: ["command-center"],
      effect: "Adds one more person you care for.",
    },
    {
      key: "extra_storage_10gb",
      name: "Extra 10 GB Storage",
      monthlyPrice: "+$2.99/mo",
      annualPrice: "$28.99/year",
      eligiblePlans: ["command-center", "family"],
      effect: "Adds 10 GB to your workspace storage allowance.",
    },
  ],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSlug(value: unknown): value is PublicPlanSlug {
  return typeof value === "string" && (planSlugs as readonly string[]).includes(value);
}

function isAddonKey(value: unknown): value is PublicAddonKey {
  return typeof value === "string" && (addonKeys as readonly string[]).includes(value);
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function whole(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;
}

function flag(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function dollarAmount(value: string) {
  const match = value.match(/\$\d+(?:\.\d{2})?/);
  return match ? match[0] : null;
}

function parsePlan(raw: unknown): PublicPlanContract | null {
  if (!isRecord(raw) || !isSlug(raw.slug)) return null;
  const name = text(raw.name);
  const outcome = text(raw.outcome);
  const audience = text(raw.audience);
  const monthlyPrice = text(raw.monthlyPrice);
  const recipients = whole(raw.maxCareRecipients);
  const members = whole(raw.maxWorkspaceMembers);
  const sharing = flag(raw.familySharing);
  const allowance = whole(raw.monthlyAiAllowance);
  const exportsEnabled = flag(raw.exportsEnabled);
  const advancedReminders = flag(raw.advancedReminders);
  const storage = typeof raw.documentStorageLimitBytes === "number" ? storageLabel(raw.documentStorageLimitBytes) : null;
  if (!name || !outcome || !audience || !monthlyPrice || !pricePattern.test(monthlyPrice)) return null;
  if (!recipients || !members || sharing === null || !allowance || !storage) return null;
  if (exportsEnabled === null || advancedReminders === null) return null;

  const paid = raw.slug !== "free";
  const annualPrice = raw.annualPrice === null ? null : text(raw.annualPrice);
  const equivalentRaw = raw.annualEquivalentMonthlyPrice === null ? null : text(raw.annualEquivalentMonthlyPrice);
  const savings = raw.annualSavings === null ? null : text(raw.annualSavings);

  if (!paid) {
    if (monthlyPrice !== "$0" && monthlyPrice !== "$0.00") return null;
    return {
      slug: raw.slug,
      name,
      outcome,
      audience,
      monthlyPrice,
      annualPrice: null,
      annualEquivalent: null,
      annualSavings: null,
      maxCareRecipients: recipients,
      maxWorkspaceMembers: members,
      familySharing: sharing,
      monthlyAiAllowance: allowance,
      storageLabel: storage,
      exportsEnabled,
      advancedReminders,
    };
  }

  if (!annualPrice || !pricePattern.test(annualPrice)) return null;
  if (!equivalentRaw || !equivalentPattern.test(equivalentRaw)) return null;
  if (!savings || !savingsPattern.test(savings)) return null;
  const annualEquivalent = dollarAmount(equivalentRaw);
  if (!annualEquivalent) return null;

  return {
    slug: raw.slug,
    name,
    outcome,
    audience,
    monthlyPrice,
    annualPrice,
    annualEquivalent,
    annualSavings: savings,
    maxCareRecipients: recipients,
    maxWorkspaceMembers: members,
    familySharing: sharing,
    monthlyAiAllowance: allowance,
    storageLabel: storage,
    exportsEnabled,
    advancedReminders,
  };
}

function parseAddon(raw: unknown): PublicAddonContract | null {
  if (!isRecord(raw) || !isAddonKey(raw.key)) return null;
  const name = text(raw.name);
  const monthlyPrice = text(raw.monthlyPrice);
  const annualPrice = text(raw.annualPrice);
  const effect = text(raw.effect);
  if (!name || !monthlyPrice || !annualPrice || !effect) return null;
  if (!addonMonthlyPattern.test(monthlyPrice) || !addonAnnualPattern.test(annualPrice)) return null;
  const eligible = raw.eligiblePlans;
  if (!Array.isArray(eligible) || eligible.length === 0 || !eligible.every(isSlug)) return null;
  const eligiblePlans = planSlugs.filter((slug) => eligible.some((item) => item === slug));
  if (!eligiblePlans.length) return null;
  return { key: raw.key, name, monthlyPrice, annualPrice, eligiblePlans, effect };
}

export function parsePublicPricing(raw: unknown): PublicPricing | null {
  if (!isRecord(raw)) return null;
  if ("currency" in raw && raw.currency !== "usd") return null;
  const annualBillingMessage = text(raw.annualBillingMessage);
  if (!annualBillingMessage) return null;
  const planRows = raw.plans;
  const addonRows = raw.addons;
  if (!Array.isArray(planRows) || !Array.isArray(addonRows)) return null;

  const plans = planSlugs.map((slug) =>
    parsePlan(planRows.find((plan: unknown) => isRecord(plan) && plan.slug === slug)),
  );
  if (plans.some((plan) => !plan)) return null;

  const addons = addonKeys.map((key) =>
    parseAddon(addonRows.find((addon: unknown) => isRecord(addon) && addon.key === key)),
  );
  if (addons.some((addon) => !addon)) return null;

  return {
    annualBillingMessage,
    plans: plans as PublicPlanContract[],
    addons: addons as PublicAddonContract[],
  };
}
