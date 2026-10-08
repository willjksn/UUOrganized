import { signupHref, type AppInterval } from "./app-links";

/**
 * Public beta prices and allowances.
 * Source of truth: UUO App `src/domain/billing-catalog.ts`.
 * Compared fields are care recipients, members, family sharing,
 * AI allowance, documents, storage, exports, and advanced reminders.
 */
export type BillingInterval = AppInterval;

export type PlanOffer = {
  key: "free" | "command-center" | "family";
  name: string;
  outcome: string;
  summary: string;
  audience: string;
  monthlyPrice: string;
  annualPrice: string;
  monthlyHref: string;
  annualHref: string;
  cta: string;
  featured?: boolean;
  points: string[];
  annualNote?: string;
};

export type PlanComparisonRow = {
  label: string;
  values: [string, string, string];
};

const freeSignup = signupHref("free");

export const planOffers: PlanOffer[] = [
  {
    key: "free",
    name: "Free",
    outcome: "Get organized.",
    summary: "1 care recipient, 2 members.",
    audience: "See whether one place for care actually helps.",
    monthlyPrice: "$0",
    annualPrice: "$0",
    monthlyHref: freeSignup,
    annualHref: freeSignup,
    cta: "Start Free",
    points: [
      "1 care recipient",
      "2 members",
      "Limited AI assistance, 10 a month",
      "250 MB for documents",
      "Basic reminders",
    ],
  },
  {
    key: "command-center",
    name: "Command Center",
    outcome: "I manage care.",
    summary: "1 care recipient, 4 members, generous AI, and individual organization tools.",
    audience: "For the person who keeps the list, with room for a few people helping.",
    monthlyPrice: "$11.99",
    annualPrice: "$119.99",
    monthlyHref: signupHref("command-center", "monthly"),
    annualHref: signupHref("command-center", "annual"),
    cta: "Choose Command Center",
    featured: true,
    annualNote: "The yearly price is about ten months of the monthly price.",
    points: [
      "1 care recipient",
      "4 members",
      "Generous AI assistance, 100 a month",
      "2 GB for documents",
      "Exports and advanced reminders",
    ],
  },
  {
    key: "family",
    name: "Family",
    outcome: "We manage care.",
    summary: "3 care recipients, 10 members, messaging, collaboration, and expanded AI.",
    audience: "For the people sharing the list, the messages, and the handoffs.",
    monthlyPrice: "$19.99",
    annualPrice: "$199.99",
    monthlyHref: signupHref("family", "monthly"),
    annualHref: signupHref("family", "annual"),
    cta: "Choose Family",
    annualNote: "The yearly price is about ten months of the monthly price.",
    points: [
      "3 care recipients",
      "10 members",
      "Messaging and family collaboration",
      "Expanded AI assistance, 300 a month",
      "10 GB for documents",
      "Exports and advanced reminders",
    ],
  },
];

export const planComparison: PlanComparisonRow[] = [
  { label: "Care recipients", values: ["1", "1", "3"] },
  { label: "Members", values: ["2", "4", "10"] },
  {
    label: "Messaging and family collaboration",
    values: ["Not included", "Not included", "Included"],
  },
  {
    label: "AI assistance",
    values: ["Limited AI assistance", "Generous AI assistance", "Expanded AI assistance"],
  },
  { label: "AI uses a month", values: ["10", "100", "300"] },
  { label: "Documents", values: ["Included", "Included", "Included"] },
  { label: "Document storage", values: ["250 MB", "2 GB", "10 GB"] },
  { label: "Exports", values: ["Not included", "Included", "Included"] },
  {
    label: "Reminders",
    values: ["Basic reminders", "Advanced reminders", "Advanced reminders"],
  },
];
