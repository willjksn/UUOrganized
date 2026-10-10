import { signupHref, type AppInterval } from "./app-links";
import type { PublicAddonContract, PublicPlanContract, PublicPlanSlug, PublicPricing } from "./pricing-contract";

/**
 * Customer-facing plan presentation.
 * Prices, allowances, and add-on eligibility come from the public pricing contract.
 * Internal keys stay free / command-center / family. Customer names stay Free / Caregiver / Caregiver Family.
 */

export type BillingInterval = AppInterval;

export type PlanOffer = {
  key: PublicPlanSlug;
  name: string;
  outcome: string;
  summary: string;
  audience: string;
  monthlyPrice: string;
  annualPrice: string;
  annualEquivalent: string | null;
  annualSavings: string | null;
  annualNote: string | null;
  monthlyHref: string;
  annualHref: string;
  cta: string;
  ctaId: string;
  featured?: boolean;
  points: string[];
};

export type AddonOffer = {
  key: PublicAddonContract["key"];
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  description: string;
  eligibility: string;
  eligiblePlans: PublicPlanSlug[];
};

export type PlanMark = {
  text: string;
  tone: "in" | "limited" | "off";
};

export type PlanComparisonGroup = {
  title: string;
  rows: { label: string; values: [PlanMark, PlanMark, PlanMark] }[];
};

export type PlanPriceView = {
  amount: string;
  period: string;
  yearly: string | null;
  savings: string | null;
};

const included: PlanMark = { text: "Included", tone: "in" };
const notIncluded: PlanMark = { text: "Not included", tone: "off" };
const onEveryPlan: [PlanMark, PlanMark, PlanMark] = [included, included, included];

const publicName: Record<PublicPlanSlug, string> = {
  free: "Free",
  "command-center": "Caregiver",
  family: "Caregiver Family",
};

const askPoint: Record<PublicPlanSlug, string> = {
  free: "Limited Ask UUO usage",
  "command-center": "Expanded Ask UUO usage",
  family: "Higher Ask UUO allowance",
};

const ctaCopy: Record<PublicPlanSlug, { cta: string; ctaId: string }> = {
  free: { cta: "Start Free", ctaId: "start-free" },
  "command-center": { cta: "Start Caregiver", ctaId: "start-caregiver" },
  family: { cta: "Start Caregiver Family", ctaId: "start-family" },
};

export function peoplePhrase(count: number) {
  if (count === 1) return "1 person you care for";
  return `Up to ${count} people you care for`;
}

function spotsPhrase(count: number) {
  return `${count} caregiver spots`;
}

function planPoints(plan: PublicPlanContract) {
  const points = [
    peoplePhrase(plan.maxCareRecipients),
    spotsPhrase(plan.maxWorkspaceMembers),
    askPoint[plan.slug],
    `${plan.storageLabel} storage`,
  ];
  if (plan.familySharing) points.push("Family sharing", "Family messaging");
  if (plan.exportsEnabled) points.push("Exports");
  points.push(plan.advancedReminders ? "Advanced reminders" : "Basic reminders");
  return points;
}

function planSummary(plan: PublicPlanContract) {
  const people = peoplePhrase(plan.maxCareRecipients);
  const spots = spotsPhrase(plan.maxWorkspaceMembers);
  if (plan.slug === "free") return `${people}, ${spots}.`;
  if (plan.slug === "command-center") {
    return `${people}, ${spots}, expanded Ask UUO, and individual organization tools.`;
  }
  return `${people}, ${spots}, family sharing, messaging, and a higher Ask UUO allowance.`;
}

export function buildPlanOffers(pricing: PublicPricing): PlanOffer[] {
  return pricing.plans.map((plan) => {
    const paid = plan.slug !== "free";
    const copy = ctaCopy[plan.slug];
    return {
      key: plan.slug,
      name: plan.name || publicName[plan.slug],
      outcome: plan.outcome,
      summary: planSummary(plan),
      audience: plan.audience,
      monthlyPrice: plan.monthlyPrice,
      annualPrice: plan.annualPrice ?? "$0",
      annualEquivalent: plan.annualEquivalent,
      annualSavings: plan.annualSavings,
      annualNote: paid ? pricing.annualBillingMessage : null,
      monthlyHref: paid ? signupHref(plan.slug, "monthly") : signupHref("free"),
      annualHref: paid ? signupHref(plan.slug, "annual") : signupHref("free"),
      cta: copy.cta,
      ctaId: copy.ctaId,
      featured: plan.slug === "command-center",
      points: planPoints(plan),
    };
  });
}

function eligibilityLabel(slugs: PublicPlanSlug[]) {
  const names = slugs.map((slug) => publicName[slug]);
  if (names.length === 1) return `${names[0]} only`;
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return names.join(", ");
}

function addonDescription(addon: PublicAddonContract) {
  if (addon.key === "additional_person") {
    const caregiverOnly = addon.eligiblePlans.length === 1 && addon.eligiblePlans[0] === "command-center";
    return caregiverOnly
      ? "Add one more person you care for on the Caregiver plan."
      : "Add one more person you care for.";
  }
  return "Add 10 GB of workspace storage.";
}

export function buildAddons(pricing: PublicPricing): AddonOffer[] {
  return pricing.addons.map((addon) => ({
    key: addon.key,
    name: addon.name,
    monthlyPrice: addon.monthlyPrice,
    annualPrice: addon.annualPrice,
    description: addonDescription(addon),
    eligibility: eligibilityLabel(addon.eligiblePlans),
    eligiblePlans: addon.eligiblePlans,
  }));
}

export function planPriceView(plan: PlanOffer, interval: BillingInterval): PlanPriceView {
  if (interval === "annual" && plan.annualEquivalent) {
    return {
      amount: plan.annualEquivalent,
      period: "per month, billed annually",
      yearly: `${plan.annualPrice}/year`,
      savings: plan.annualSavings,
    };
  }
  return {
    amount: plan.monthlyPrice,
    period: "per month",
    yearly: null,
    savings: null,
  };
}

export function addonPriceLabel(addon: AddonOffer, interval: BillingInterval) {
  return interval === "annual" ? addon.annualPrice : addon.monthlyPrice;
}

export function shortSavings(message: string) {
  const match = message.match(/Save \d+%/);
  return match ? match[0] : message;
}

function marks(
  plans: PublicPlanContract[],
  text: (plan: PublicPlanContract) => string,
  tone: (plan: PublicPlanContract) => PlanMark["tone"],
): [PlanMark, PlanMark, PlanMark] {
  return plans.map((plan) => ({ text: text(plan), tone: tone(plan) })) as [PlanMark, PlanMark, PlanMark];
}

function askAllowance(plan: PublicPlanContract) {
  if (plan.slug === "free") return `Limited — ${plan.monthlyAiAllowance} a month`;
  if (plan.slug === "command-center") return `Expanded — ${plan.monthlyAiAllowance} a month`;
  return `Higher — ${plan.monthlyAiAllowance} a month`;
}

function joinNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function addonMarks(pricing: PublicPricing): [PlanMark, PlanMark, PlanMark] {
  return pricing.plans.map((plan) => {
    const names = pricing.addons.filter((addon) => addon.eligiblePlans.includes(plan.slug)).map((addon) => addon.name);
    if (!names.length) return { text: "Not available", tone: "off" as const };
    return { text: joinNames(names), tone: "in" as const };
  }) as [PlanMark, PlanMark, PlanMark];
}

const comparisonTemplate: PlanComparisonGroup[] = [
  {
    title: "Care organization",
    rows: [
      { label: "Today / My Day", values: onEveryPlan },
      { label: "Calendar and appointments", values: onEveryPlan },
      { label: "Tasks and assignments", values: onEveryPlan },
      { label: "Follow-ups", values: onEveryPlan },
      { label: "Needs Attention", values: onEveryPlan },
      { label: "Waiting On", values: onEveryPlan },
      { label: "Calls and reference numbers", values: onEveryPlan },
      { label: "Equipment, services, and applications", values: onEveryPlan },
      { label: "Universal Timeline", values: onEveryPlan },
    ],
  },
  {
    title: "Medications",
    rows: [
      { label: "Medication list and schedules", values: onEveryPlan },
      { label: "History and change tracking", values: onEveryPlan },
      { label: "Label photo and review before saving", values: onEveryPlan },
    ],
  },
  {
    title: "Supplies",
    rows: [
      { label: "Supply tracking and catalog", values: onEveryPlan },
      { label: "Low-stock thresholds and alerts", values: onEveryPlan },
      { label: "Photos and reorder links", values: onEveryPlan },
    ],
  },
  {
    title: "History and documents",
    rows: [
      { label: "Notes and observations", values: onEveryPlan },
      { label: "Know Their Normal", values: onEveryPlan },
      { label: "Documents and attachments", values: onEveryPlan },
      { label: "Search and filters", values: onEveryPlan },
      { label: "Monthly Care Review", values: onEveryPlan },
      { label: "Exports", values: [notIncluded, included, included] },
      {
        label: "Storage",
        values: [
          { text: "250 MB", tone: "limited" },
          { text: "2 GB", tone: "in" },
          { text: "10 GB", tone: "in" },
        ],
      },
    ],
  },
  {
    title: "Collaboration",
    rows: [
      { label: "Who’s Got This?", values: onEveryPlan },
      {
        label: "Caregiver spots",
        values: [
          { text: "2 caregiver spots", tone: "limited" },
          { text: "4 caregiver spots", tone: "in" },
          { text: "10 caregiver spots", tone: "in" },
        ],
      },
      {
        label: "People you care for",
        values: [
          { text: "1 person you care for", tone: "limited" },
          { text: "1 person you care for", tone: "limited" },
          { text: "Up to 3 people you care for", tone: "in" },
        ],
      },
      { label: "Roles and access", values: onEveryPlan },
      { label: "Task ownership and handoffs", values: onEveryPlan },
      { label: "Family sharing", values: [notIncluded, notIncluded, included] },
      { label: "Family messaging", values: [notIncluded, notIncluded, included] },
    ],
  },
  {
    title: "AI",
    rows: [
      { label: "Typed Quick Capture", values: onEveryPlan },
      { label: "Voice Quick Capture", values: onEveryPlan },
      { label: "Medication photo extraction", values: onEveryPlan },
      { label: "Ask UUO", values: onEveryPlan },
      { label: "Appointment prep and handoff help", values: onEveryPlan },
      { label: "Monthly review and change summaries", values: onEveryPlan },
      {
        label: "Ask UUO allowance",
        values: [
          { text: "Limited — 10 a month", tone: "limited" },
          { text: "Expanded — 100 a month", tone: "in" },
          { text: "Higher — 300 a month", tone: "in" },
        ],
      },
    ],
  },
  {
    title: "Notifications and reminders",
    rows: [
      { label: "In-app notifications", values: onEveryPlan },
      { label: "Email notifications", values: onEveryPlan },
      {
        label: "Reminders",
        values: [
          { text: "Basic reminders", tone: "limited" },
          { text: "Advanced reminders", tone: "in" },
          { text: "Advanced reminders", tone: "in" },
        ],
      },
    ],
  },
];

export function buildPlanComparison(pricing: PublicPricing): PlanComparisonGroup[] {
  const plans = pricing.plans;
  const patches: Record<string, [PlanMark, PlanMark, PlanMark]> = {
    Exports: marks(plans, (plan) => (plan.exportsEnabled ? "Included" : "Not included"), (plan) =>
      plan.exportsEnabled ? "in" : "off",
    ),
    Storage: marks(plans, (plan) => plan.storageLabel, (plan) => (plan.slug === "free" ? "limited" : "in")),
    "Caregiver spots": marks(plans, (plan) => spotsPhrase(plan.maxWorkspaceMembers), (plan) =>
      plan.slug === "free" ? "limited" : "in",
    ),
    "People you care for": marks(plans, (plan) => peoplePhrase(plan.maxCareRecipients), (plan) =>
      plan.maxCareRecipients === 1 ? "limited" : "in",
    ),
    "Family sharing": marks(plans, (plan) => (plan.familySharing ? "Included" : "Not included"), (plan) =>
      plan.familySharing ? "in" : "off",
    ),
    "Family messaging": marks(plans, (plan) => (plan.familySharing ? "Included" : "Not included"), (plan) =>
      plan.familySharing ? "in" : "off",
    ),
    "Ask UUO allowance": marks(plans, askAllowance, (plan) => (plan.slug === "free" ? "limited" : "in")),
    Reminders: marks(
      plans,
      (plan) => (plan.advancedReminders ? "Advanced reminders" : "Basic reminders"),
      (plan) => (plan.advancedReminders ? "in" : "limited"),
    ),
  };

  const groups = comparisonTemplate.map((group) => ({
    title: group.title,
    rows: group.rows.map((row) => (patches[row.label] ? { label: row.label, values: patches[row.label] } : row)),
  }));

  groups.push({
    title: "Optional add-ons",
    rows: [{ label: "Available add-ons", values: addonMarks(pricing) }],
  });

  return groups;
}
