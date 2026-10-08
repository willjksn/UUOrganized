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
  ctaId: string;
  featured?: boolean;
  points: string[];
  annualNote?: string;
};

export type PlanMark = {
  text: string;
  tone: "in" | "limited" | "off";
};

export type PlanComparisonGroup = {
  title: string;
  rows: { label: string; values: [PlanMark, PlanMark, PlanMark] }[];
};

const included: PlanMark = { text: "Included", tone: "in" };
const notIncluded: PlanMark = { text: "Not included", tone: "off" };
const onEveryPlan: [PlanMark, PlanMark, PlanMark] = [included, included, included];

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
    ctaId: "start-free",
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
    ctaId: "choose-command-center",
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
    ctaId: "choose-family",
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

export const planComparison: PlanComparisonGroup[] = [
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
      {
        label: "Exports",
        values: [notIncluded, included, included],
      },
      {
        label: "Document storage",
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
      {
        label: "Care-team coverage / “Who’s got this?”",
        values: onEveryPlan,
      },
      {
        label: "Members",
        values: [
          { text: "Up to 2", tone: "limited" },
          { text: "Up to 4", tone: "in" },
          { text: "Up to 10", tone: "in" },
        ],
      },
      {
        label: "Care recipients",
        values: [
          { text: "1", tone: "limited" },
          { text: "1", tone: "limited" },
          { text: "3", tone: "in" },
        ],
      },
      { label: "Roles and recipient access", values: onEveryPlan },
      { label: "Task ownership and handoffs", values: onEveryPlan },
      {
        label: "Family messaging",
        values: [notIncluded, notIncluded, included],
      },
    ],
  },
  {
    title: "AI",
    rows: [
      { label: "Typed Quick Capture", values: onEveryPlan },
      { label: "Voice Quick Capture", values: onEveryPlan },
      { label: "Medication photo extraction", values: onEveryPlan },
      { label: "Ask Command Center", values: onEveryPlan },
      { label: "Appointment prep and handoff help", values: onEveryPlan },
      { label: "Monthly review and change summaries", values: onEveryPlan },
      {
        label: "Monthly AI allowance",
        values: [
          { text: "Limited — 10 a month", tone: "limited" },
          { text: "Generous — 100 a month", tone: "in" },
          { text: "Expanded — 300 a month", tone: "in" },
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
  {
    title: "Capacity",
    rows: [
      {
        label: "Care recipients",
        values: [
          { text: "1 care recipient", tone: "limited" },
          { text: "1 care recipient", tone: "limited" },
          { text: "3 care recipients", tone: "in" },
        ],
      },
      {
        label: "Members",
        values: [
          { text: "2 members", tone: "limited" },
          { text: "4 members", tone: "in" },
          { text: "10 members", tone: "in" },
        ],
      },
    ],
  },
];
