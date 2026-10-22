import { cleanEmail, cleanText } from "./http";

export const professionalCategories = [
  "Book information",
  "Review copy",
  "Printables for a program",
  "Something else",
] as const;

export type ProfessionalCategory = (typeof professionalCategories)[number];

export function marketingOptIn(value: unknown) {
  return value === true || value === "true" || value === "on" || value === "yes";
}

export function professionalInquiry(body: Record<string, unknown>) {
  if (cleanText(body.company, 200)) return { bot: true as const };

  const name = cleanText(body.name, 120);
  const email = cleanEmail(body.email);
  const organization = cleanText(body.organization, 160);
  const role = cleanText(body.role, 120);
  const category = cleanText(body.category, 80);
  const message = cleanText(body.message, 2000);
  const acknowledged = body.noHealthData === true || body.noHealthData === "on" || body.noHealthData === "true";
  const allowed = new Set<string>(professionalCategories);

  if (!name || !email || !organization || !allowed.has(category) || message.length < 2) {
    return { error: "Add your name, email, organization, what you need, and a short message." as const };
  }

  if (!acknowledged) {
    return { error: "Confirm this inquiry does not include patient information." as const };
  }

  return {
    name,
    email,
    organization,
    role,
    category: category as ProfessionalCategory,
    message,
  };
}
