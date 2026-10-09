import { signupHref } from "./app-links";
import { site } from "./site";

export type SiteCopy = {
  description: string;
  promoMessage: string;
  promoCode: string;
  homeEyebrow: string;
  homeHeadline: string;
  homeHeadlineEm: string;
  homeLede: string;
  homePrimaryCta: string;
  homePrimaryHref: string;
  homeSecondaryCta: string;
  homeSecondaryHref: string;
  heroImage: string;
  heroImageAlt: string;
  heroCaption: string;
  heroWidth: number;
  heroHeight: number;
  principles: [string, string, string, string];
  toolsEyebrow: string;
  toolsHeading: string;
  storyEyebrow: string;
  storyHeading: string;
  storyBody: string;
  storyLinkText: string;
  storyLinkHref: string;
  storyImage: string;
  storyImageAlt: string;
  checklistEyebrow: string;
  checklistHeading: string;
  checklistAttitude: string;
  checklistBody: string;
  checklistButton: string;
  checklistNote: string;
  checklistImage: string;
  checklistImageAlt: string;
  checklistWidth: number;
  checklistHeight: number;
  aboutEyebrow: string;
  aboutHeading: string;
  aboutImage: string;
  aboutImageAlt: string;
  aboutMedia: string;
  aboutBody: string;
  aboutQuote: string;
  aboutNote: string;
  aboutPoints: string;
  aboutPrimaryCta: string;
  aboutPrimaryHref: string;
  aboutSecondaryCta: string;
  aboutSecondaryHref: string;
  shopEyebrow: string;
  shopHeading: string;
  shopLede: string;
  shopLaterEyebrow: string;
  shopLaterHeading: string;
  shopLaterBody: string;
  shopLaterCta: string;
  shopLaterHref: string;
  contactEyebrow: string;
  contactHeading: string;
  contactBody: string;
};

export function defaultCopy(): SiteCopy {
  return {
    description: site.description,
    promoMessage: "",
    promoCode: "",
    homeEyebrow: "Unhinged. Unfiltered. Organized.",
    homeHeadline: "Everything living in your head,",
    homeHeadlineEm: "finally in one place.",
    homeLede:
      "Appointments. Medications. Supplies. Insurance calls. Reference numbers. Follow-ups. Family updates. The things you're waiting on. UUO Command Center helps you keep track of it all, with AI helping organize the chaos.",
    homePrimaryCta: "Start Free",
    homePrimaryHref: signupHref("free"),
    homeSecondaryCta: "Explore the UUO Command Center",
    homeSecondaryHref: "/command-center",
    heroImage: "/images/book-cover.jpg",
    heroImageAlt: "Book cover of Who the Hell Put Me in Charge?! by Stormi J.",
    heroCaption: "Who the Hell Put Me in Charge?! · Stormi J.",
    heroWidth: 1000,
    heroHeight: 1250,
    principles: ["Plan", "Organize", "Survive", "Repeat"],
    toolsEyebrow: "The tools",
    toolsHeading: "The book, and a place to put the medications.",
    storyEyebrow: "Why I started",
    storyHeading: "I built the tools I couldn’t find.",
    storyBody: [
      "My mom had a stroke. One day I was living my life. The next, I was in charge of medications, appointments, equipment, paperwork, and everything else that showed up with it.",
      "UUO started there. Caregiving was the first mess. The brand is for the rest of real life too.",
    ].join("\n"),
    storyLinkText: "Read the story",
    storyLinkHref: "/about",
    storyImage: "/images/stormi.jpg",
    storyImageAlt: "Stormi J holding her book, Who the Hell Put Me in Charge?!",
    checklistEyebrow: "Free",
    checklistHeading: "First 48 Hours Home.",
    checklistAttitude: "Don’t forget this shit.",
    checklistBody:
      "The one-page checklist for the day someone comes home and the house is not ready. Write it down. Handle one damn thing at a time.",
    checklistButton: "Send me the checklist",
    checklistNote: "New printables and the occasional discount go to this list first.",
    checklistImage: "/images/checklist-teaser.jpg",
    checklistImageAlt: "Top of the First 48 Hours Home checklist: Don’t forget this shit.",
    checklistWidth: 796,
    checklistHeight: 226,
    aboutEyebrow: "About",
    aboutHeading: "Nobody gave me a damn manual.",
    aboutImage: "",
    aboutImageAlt: "",
    aboutMedia: "image",
    aboutBody: [
      "My mom had a stroke. One day I was living my normal life. The next, I was responsible for everything. Medications. Appointments. Equipment. Paperwork. Symptoms. Phone calls. And a pile of other things nobody warns you about.",
      "I looked for a system. Somewhere to put the list, the bottles, the questions, and the “did we already give that?” I couldn’t find one that sounded like real life. So I built it.",
      "Who the Hell Put Me in Charge?! came out of that. So did the printables. Caregiving is where Unhinged. Unfiltered. Organized. started. It is growing into practical systems for the other things life throws at you. A home. A crisis. The ordinary chaos.",
    ].join("\n"),
    aboutQuote: "You don’t have to have it all together. You just need somewhere to put it all.",
    aboutNote: "From the back of the book. One damn thing at a time.",
    aboutPoints: [
      "Real-life experience",
      "Practical tools",
      "Ready-to-use worksheets",
      "A little humor, because you have to",
    ].join("\n"),
    aboutPrimaryCta: "Shop the Tools",
    aboutPrimaryHref: "/shop",
    aboutSecondaryCta: "Get the free checklist",
    aboutSecondaryHref: "/#checklist",
    shopEyebrow: "Shop",
    shopHeading: "Shop the tools.",
    shopLede: "The book, the printables, and room for whatever life requires next.",
    shopLaterEyebrow: "Coming next",
    shopLaterHeading: "More than a caregiver book.",
    shopLaterBody:
      "Planners, checklists, and practical systems for the rest of real life. New printables show up in the Etsy shop first. The book stays on Amazon.",
    shopLaterCta: "Browse the Etsy shop",
    shopLaterHref: site.etsy,
    contactEyebrow: "Contact",
    contactHeading: "Say it plain.",
    contactBody: "Questions, a shop you want linked, a correction, or the story you need to get out. Send it.",
  };
}

export function paragraphs(value: string) {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function cleanLink(value: string) {
  const href = value.trim();
  if (!href) return "";
  if (href.startsWith("#") && !/\s/.test(href)) return href.slice(0, 200);
  if (href.startsWith("/") && !href.startsWith("//") && !/\s/.test(href)) return href.slice(0, 500);
  try {
    const url = new URL(href);
    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
  } catch {
    return null;
  }
  return null;
}

export function fillCopy(value: unknown): SiteCopy {
  const defaults = defaultCopy();
  if (!value || typeof value !== "object") return defaults;
  const source = value as Record<string, unknown>;
  const copy = { ...defaults };

  (Object.keys(defaults) as (keyof SiteCopy)[]).forEach((key) => {
    if (!(key in source)) return;
    const current = defaults[key];
    const next = source[key];
    if (typeof current === "string") {
      copy[key] = (typeof next === "string" ? next.replace(/\0/g, "").trim().slice(0, 4000) : current) as never;
      return;
    }
    if (typeof current === "number") {
      copy[key] = (typeof next === "number" && next > 0 ? next : current) as never;
    }
  });

  if (Array.isArray(source.principles)) {
    const words = source.principles.filter((item): item is string => typeof item === "string").map((item) => item.trim()).slice(0, 4);
    if (words.length === 4 && words.every(Boolean)) copy.principles = words as SiteCopy["principles"];
  }

  return copy;
}

const legacyDescriptions = new Set([
  "Practical systems for the shit nobody tells you about. The book, printables, and tools by Stormi J.",
  "Practical systems for the shit nobody tells you about. The book, printables, and Caregiver Command Center by Stormi J.",
]);

export function withPublicHome(copy: SiteCopy): SiteCopy {
  const defaults = defaultCopy();
  const legacyHero =
    copy.homeHeadline === "Real. Ready." &&
    copy.homePrimaryCta === "Shop the Tools" &&
    copy.homePrimaryHref.replace(/\/$/, "") === "/shop";
  const description = legacyDescriptions.has(copy.description) ? defaults.description : copy.description;
  if (!legacyHero) return { ...copy, description };
  return {
    ...copy,
    description,
    homeHeadline: defaults.homeHeadline,
    homeHeadlineEm: defaults.homeHeadlineEm,
    homeLede: defaults.homeLede,
    homePrimaryCta: defaults.homePrimaryCta,
    homePrimaryHref: defaults.homePrimaryHref,
    homeSecondaryCta: defaults.homeSecondaryCta,
    homeSecondaryHref: defaults.homeSecondaryHref,
  };
}
