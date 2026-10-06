import { site } from "./site";

export type Product = {
  slug: string;
  eyebrow: string;
  name: string;
  summary: string;
  details: string;
  priceLabel: string;
  cta: string;
  href: string;
  external: boolean;
  image: string;
  imageAlt: string;
  width: number;
  height: number;
  featured: boolean;
  feature: boolean;
  backImage?: string;
  backImageAlt?: string;
  backWidth?: number;
  backHeight?: number;
  freeDownload?: boolean;
  paidDownload?: boolean;
  ships?: boolean;
  stock?: number | null;
  shippingCents?: number;
  shippingIntlCents?: number | null;
  priceCents?: number;
  fileName?: string;
};

export const products: Product[] = [
  {
    slug: "book",
    eyebrow: "The book",
    name: "Who the Hell Put Me in Charge?!",
    summary:
      "The real-life caregiver survival guide and command center. Medications, appointments, paperwork, and the rest of what nobody warns you about.",
    details:
      "One day you’re living your normal life. The next, you’re managing medications, appointments, equipment, paperwork, symptoms, and phone calls. This is the survival guide and command center built in the middle of that. Inside: tools for medications, appointments, medical information, contacts, equipment, daily care, and hospital stays.",
    priceLabel: "See price on Amazon",
    cta: "Buy on Amazon",
    href: site.amazon,
    external: true,
    image: "/images/book-cover.jpg",
    imageAlt: "Book cover of Who the Hell Put Me in Charge?! by Stormi J.",
    width: 1000,
    height: 1250,
    featured: true,
    feature: true,
    backImage: "/images/book-back.jpg",
    backImageAlt:
      "Back cover of Who the Hell Put Me in Charge?!, with the line Nobody gave you a damn manual.",
    backWidth: 600,
    backHeight: 750,
  },
  {
    slug: "medication-command-center",
    eyebrow: "Printable",
    name: "The Medication Command Center",
    summary:
      "A simple system for medications, schedules, changes, PRNs, and refills. Because “I think I gave it to her” isn’t a medication system.",
    details:
      "A printable for the bottles, the schedule, the changes, the PRNs, and the refills. Built for the moment someone asks, “Wait… did we already give that?” Find it in the UUO Etsy shop.",
    priceLabel: "See price on Etsy",
    cta: "Shop on Etsy",
    href: site.etsy,
    external: true,
    image: "/images/medication-command-center.jpg",
    imageAlt: "Title page of The Medication Command Center printable.",
    width: 791,
    height: 669,
    featured: true,
    feature: false,
  },
  {
    slug: "first-48-hours",
    eyebrow: "Free checklist",
    name: "First 48 Hours Home",
    summary:
      "Don’t forget this shit. A one-page sheet for the first two days at home: safety, medications, who to call, follow-up, paperwork, and the first night.",
    details:
      "The checklist for the person who just got handed discharge papers and a house that isn’t ready. Leave your email and it downloads right away.",
    priceLabel: "Free",
    cta: "Get the checklist",
    href: "/#checklist",
    external: false,
    image: "/images/checklist-teaser.jpg",
    imageAlt: "Top of the First 48 Hours Home checklist.",
    width: 796,
    height: 226,
    featured: false,
    feature: false,
  },
];
