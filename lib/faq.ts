import type { PublicAddonKey, PublicPlanSlug, PublicPricing } from "./pricing-contract";

export type FaqItem = {
  id: string;
  question: string;
  answer: string[];
};

export type FaqCategory = {
  id: string;
  title: string;
  items: FaqItem[];
};

export const homepageFaqIds = [
  "start-free",
  "invite-subscription",
  "difference",
  "another-person",
  "more-storage",
  "cancel",
] as const;

function plan(pricing: PublicPricing, slug: PublicPlanSlug) {
  const match = pricing.plans.find((item) => item.slug === slug);
  if (!match) throw new Error(`Missing ${slug} plan`);
  return match;
}

function addon(pricing: PublicPricing, key: PublicAddonKey) {
  const match = pricing.addons.find((item) => item.key === key);
  if (!match) throw new Error(`Missing ${key} add-on`);
  return match;
}

function spokenMonthly(price: string) {
  const amount = price.match(/\$\d+\.\d{2}/)?.[0];
  return amount ? `${amount}/month` : price;
}

function countWord(count: number) {
  if (count === 1) return "one";
  if (count === 2) return "two";
  if (count === 3) return "three";
  return String(count);
}

function plusTenGb(label: string) {
  const match = label.match(/^(\d+) GB$/);
  return match ? `${Number(match[1]) + 10} GB` : null;
}

export function buildFaq(pricing: PublicPricing): FaqCategory[] {
  const free = plan(pricing, "free");
  const caregiver = plan(pricing, "command-center");
  const family = plan(pricing, "family");
  const person = addon(pricing, "additional_person");
  const storage = addon(pricing, "extra_storage_10gb");
  const caregiverWithStorage = plusTenGb(caregiver.storageLabel);
  const familyWithStorage = plusTenGb(family.storageLabel);
  const storageExample =
    caregiverWithStorage && familyWithStorage
      ? `That takes Caregiver from ${caregiver.storageLabel} to ${caregiverWithStorage}, or Caregiver Family from ${family.storageLabel} to ${familyWithStorage}.`
      : null;

  return [
    {
      id: "getting-started",
      title: "Getting Started",
      items: [
        {
          id: "what-is",
          question: "What is UU Organized?",
          answer: [
            "UU Organized is a caregiver organization system designed to help keep appointments, medications, care contacts, supplies, follow-ups, notes, documents, and day-to-day caregiving information in one place.",
            "Everything living in your head, finally in one place.",
          ],
        },
        {
          id: "who-for",
          question: "Who is UU Organized for?",
          answer: [
            "People who suddenly or gradually find themselves coordinating care for a parent, spouse, family member, or other person they care for.",
          ],
        },
        {
          id: "start-free",
          question: "Can I start for free?",
          answer: [
            "Yes. The Free plan lets you organize care for one person with basic tools before deciding whether a paid plan is right for you.",
          ],
        },
        {
          id: "phone",
          question: "Can I use UU Organized on my phone or tablet?",
          answer: [
            "Yes. UU Organized works in the browser on a phone, tablet, or computer, and you can install it from the browser as a web app.",
          ],
        },
      ],
    },
    {
      id: "plans-billing",
      title: "Plans & Billing",
      items: [
        {
          id: "difference",
          question: "What is the difference between Caregiver and Caregiver Family?",
          answer: [
            `Caregiver is designed for someone organizing care for one person and includes up to ${caregiver.maxWorkspaceMembers} caregiver spots.`,
            `Caregiver Family supports up to ${family.maxCareRecipients} people you care for, up to ${family.maxWorkspaceMembers} caregiver spots, family sharing and messaging, a higher Ask UUO allowance, and more storage.`,
          ],
        },
        {
          id: "another-person",
          question: "Can I add another person without moving to the Family plan?",
          answer: [
            `Yes, on the Caregiver plan you can add one Additional Person add-on for ${spokenMonthly(person.monthlyPrice)} or ${person.annualPrice}.`,
            "This increases the Caregiver plan from one person you care for to two.",
            `If you need to organize care for up to ${family.maxCareRecipients} people or want the Family collaboration features, Caregiver Family may be a better fit.`,
          ],
        },
        {
          id: "multiple-people",
          question: "Does UU Organized support multiple people I care for?",
          answer: [
            `Free supports ${countWord(free.maxCareRecipients)}.`,
            `Caregiver supports ${countWord(caregiver.maxCareRecipients)}, or ${countWord(caregiver.maxCareRecipients + 1)} with the Additional Person add-on.`,
            `Caregiver Family supports up to ${countWord(family.maxCareRecipients)}.`,
          ],
        },
        {
          id: "annual",
          question: "How does annual billing work?",
          answer: [
            `Caregiver is ${caregiver.annualPrice}/year (${caregiver.annualEquivalent}/month billed annually).`,
            `Caregiver Family is ${family.annualPrice}/year (${family.annualEquivalent}/month billed annually).`,
            `${pricing.annualBillingMessage}. Annual billing is paid once per year.`,
          ],
        },
        {
          id: "cancel",
          question: "What happens if I cancel a paid plan?",
          answer: [
            "Your paid plan remains available through the end of the billing period you already paid for. After that, your workspace moves to the Free plan.",
            "UU Organized does not automatically delete your existing care data simply because your paid subscription ends. If the workspace is above a Free-plan limit, adding new people, members, or files can be limited until usage fits that plan or you choose another plan.",
          ],
        },
        {
          id: "downgrade",
          question: "What happens if I downgrade?",
          answer: [
            "A downgrade, or removing an add-on, lowers what the workspace can add. UU Organized does not automatically delete people, files, or care history to force the workspace into the lower plan.",
          ],
        },
      ],
    },
    {
      id: "care-team",
      title: "Care Team & Sharing",
      items: [
        {
          id: "invite-subscription",
          question: "Do the caregivers I invite need their own subscription?",
          answer: [
            "No.",
            "The Workspace Owner manages the subscription. Invited Admins, Caregivers, Helpers, and Viewers participate according to their permissions without buying their own separate UU Organized subscription.",
          ],
        },
        {
          id: "who-manages",
          question: "Who can change or manage the subscription?",
          answer: [
            "Only the Workspace Owner can manage billing, change plans, purchase add-ons, or open the billing account.",
            "Other invited members can use the workspace according to their permissions but do not manage billing.",
          ],
        },
        {
          id: "family-help",
          question: "Can multiple family members help?",
          answer: [
            "Yes. The Workspace Owner can invite people to help and assign roles such as Admin, Caregiver, Helper, or Viewer according to the capabilities supported in the app.",
          ],
        },
      ],
    },
    {
      id: "storage-data",
      title: "Storage & Data",
      items: [
        {
          id: "more-storage",
          question: "Can I buy more storage?",
          answer: [
            `Yes. Caregiver and Caregiver Family can add an Extra 10 GB Storage add-on for ${spokenMonthly(storage.monthlyPrice)} or ${storage.annualPrice}.`,
            `Caregiver includes ${caregiver.storageLabel} before the add-on. Caregiver Family includes ${family.storageLabel} before the add-on.`,
            ...(storageExample ? [storageExample] : []),
          ],
        },
        {
          id: "storage-full",
          question: "Does UU Organized delete my files if I run out of storage?",
          answer: [
            "No. UU Organized does not delete existing files because a workspace is over its storage allowance or a paid plan ends.",
            "New uploads are limited by the storage allowance until there is room again. On Caregiver or Caregiver Family, Extra 10 GB Storage can add room. You can also delete a file you no longer need.",
          ],
        },
        {
          id: "ask-storage",
          question: "Does Ask UUO count against my storage allowance?",
          answer: [
            "No. Ask UUO conversation text stays in the browser tab. It is not a workspace file, so it does not count against the file-storage allowance.",
            "Files or attachments uploaded to the workspace follow the normal storage rules.",
          ],
        },
      ],
    },
    {
      id: "ask-uuo",
      title: "Ask UUO",
      items: [
        {
          id: "ask-retention",
          question: "How long are Ask UUO conversations kept?",
          answer: [
            "Ask UUO conversations stay in the browser tab you have open. Refreshing the page keeps that thread. Closing the tab clears it. They are not saved in an Ask conversation database.",
            "Anything you want to keep should be explicitly saved to Notes.",
          ],
        },
        {
          id: "ask-medical",
          question: "Is Ask UUO medical advice?",
          answer: [
            "No. Ask UUO helps organize and summarize information saved in UU Organized. It does not diagnose conditions, determine whether a medication is medically safe to give, or replace professional medical advice.",
            "UU Organized does not provide legal advice, insurance advice, financial advice, or benefits-eligibility advice.",
          ],
        },
      ],
    },
  ];
}

export function faqItems(categories: FaqCategory[]) {
  return categories.flatMap((category) => category.items);
}

export function previewFaq(categories: FaqCategory[]) {
  const items = faqItems(categories);
  return homepageFaqIds.map((id) => {
    const item = items.find((entry) => entry.id === id);
    if (!item) throw new Error(`Missing FAQ preview ${id}`);
    return item;
  });
}
