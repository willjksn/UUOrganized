import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildFaq, faqItems, homepageFaqIds, previewFaq } from "../lib/faq";
import { legalLinks } from "../lib/app-links";
import { fallbackPricing } from "../lib/pricing-contract";
import { footerPages } from "../lib/nav";

const faq = buildFaq(fallbackPricing);
const items = faqItems(faq);

function answer(id: string) {
  const item = items.find((entry) => entry.id === id);
  assert.ok(item, id);
  return item.answer.join(" ");
}

describe("FAQ", () => {
  it("includes the required questions and a short homepage preview", () => {
    const questions = items.map((item) => item.question);
    for (const question of [
      "What is UU Organized?",
      "Who is UU Organized for?",
      "Can I start for free?",
      "What is the difference between Caregiver and Caregiver Family?",
      "Do the caregivers I invite need their own subscription?",
      "Who can change or manage the subscription?",
      "Can I add another person without moving to the Family plan?",
      "Can I buy more storage?",
      "What happens if I cancel a paid plan?",
      "What happens if I downgrade?",
      "Does UU Organized delete my files if I run out of storage?",
      "Does Ask UUO count against my storage allowance?",
      "How long are Ask UUO conversations kept?",
      "Is Ask UUO medical advice?",
      "Does UU Organized support multiple people I care for?",
      "Can I use UU Organized on my phone or tablet?",
      "Can multiple family members help?",
      "How does annual billing work?",
    ]) {
      assert.ok(questions.includes(question), question);
    }
    assert.equal(previewFaq(faq).length, 6);
    assert.deepEqual(
      previewFaq(faq).map((item) => item.id),
      [...homepageFaqIds],
    );
  });

  it("does not publish a 7-day Ask UUO retention claim", () => {
    const retention = answer("ask-retention");
    assert.match(retention, /browser tab/i);
    assert.match(retention, /Closing the tab clears it/);
    assert.equal(/7 days/i.test(retention), false);
    assert.equal(JSON.stringify(items).includes("kept for 7 days"), false);
  });

  it("keeps invited caregivers on the owner's subscription", () => {
    assert.match(answer("invite-subscription"), /do not|without buying/i);
    assert.match(answer("invite-subscription"), /Workspace Owner/);
    assert.match(answer("another-person"), /\$5\.99\/month/);
    assert.match(answer("another-person"), /\$57\.99\/year/);
    assert.match(answer("more-storage"), /\$2\.99\/month/);
    assert.match(answer("more-storage"), /\$28\.99\/year/);
    assert.match(answer("annual"), /\$114\.99\/year/);
    assert.match(answer("annual"), /\$191\.99\/year/);
    assert.match(answer("annual"), /Save 20%/);
    assert.match(answer("ask-medical"), /does not diagnose/i);
    assert.equal(/App Store|Google Play/i.test(answer("phone")), false);
  });
});

describe("footer", () => {
  it("links FAQ beside pricing, and keeps the app legal pages", () => {
    assert.ok(footerPages.some((page) => page.href === "/faq" && page.label === "FAQ"));
    assert.ok(footerPages.some((page) => page.href === "/command-center" && page.label === "UUO Command Center"));
    assert.equal(footerPages.filter((page) => page.href === "/contact").length, 1);
    assert.ok(footerPages.some((page) => page.href === "/pricing"));
    assert.ok(footerPages.some((page) => page.href === "/contact"));
    assert.ok(footerPages.some((page) => page.href === "/shop"));
    assert.deepEqual(
      legalLinks.map((link) => link.href),
      [
        "https://app.uuorganized.com/terms",
        "https://app.uuorganized.com/privacy",
        "https://app.uuorganized.com/consumer-health-data-privacy",
      ],
    );
  });
});
