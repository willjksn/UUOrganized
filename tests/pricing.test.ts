import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { signupHref } from "../lib/app-links";
import { clearPricingCache, getPublicPricing } from "../lib/get-pricing";
import { fallbackPricing, parsePublicPricing } from "../lib/pricing-contract";
import {
  addonPriceLabel,
  buildAddons,
  buildPlanComparison,
  buildPlanOffers,
  planPriceView,
} from "../lib/plans";

const liveFixture = {
  version: 2,
  currency: "usd",
  source: "app-billing-catalog",
  annualBillingMessage: "Save 20% with annual billing",
  plans: [
    {
      slug: "free",
      name: "Free",
      outcome: "Get organized.",
      audience: "See whether one place for care actually helps.",
      monthlyPriceCents: 0,
      annualPriceCents: null,
      monthlyPrice: "$0",
      annualPrice: null,
      annualEquivalentMonthlyCents: null,
      annualEquivalentMonthlyPrice: null,
      annualSavings: null,
      maxCareRecipients: 1,
      maxWorkspaceMembers: 2,
      familySharing: false,
      monthlyAiAllowance: 10,
      documentStorageLimitBytes: 262144000,
      exportsEnabled: false,
      advancedReminders: false,
      signupPaths: ["/signup?plan=free"],
      stripePriceId: "price_should_not_leak",
    },
    {
      slug: "command-center",
      name: "Caregiver",
      outcome: "I manage care.",
      audience: "The person who keeps the list, with room for a few people helping.",
      monthlyPrice: "$11.99",
      annualPrice: "$114.99",
      annualEquivalentMonthlyPrice: "$9.58/mo",
      annualSavings: "Save 20%",
      maxCareRecipients: 1,
      maxWorkspaceMembers: 4,
      familySharing: false,
      monthlyAiAllowance: 100,
      documentStorageLimitBytes: 2147483648,
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
      annualEquivalentMonthlyPrice: "$16.00/mo",
      annualSavings: "Save 20%",
      maxCareRecipients: 3,
      maxWorkspaceMembers: 10,
      familySharing: true,
      monthlyAiAllowance: 300,
      documentStorageLimitBytes: 10737418240,
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
      stripePriceId: "price_addon_secret",
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

function row(groups: ReturnType<typeof buildPlanComparison>, label: string) {
  const match = groups.flatMap((group) => group.rows).find((item) => item.label === label);
  assert.ok(match, label);
  return match.values.map((value) => value.text);
}

describe("public pricing contract", () => {
  it("keeps Stripe identifiers out of the parsed contract", () => {
    const pricing = parsePublicPricing(liveFixture);
    assert.ok(pricing);
    const serialized = JSON.stringify(pricing);
    assert.equal(serialized.includes("price_"), false);
    assert.equal(serialized.includes("stripe"), false);
    assert.equal(pricing.plans[1].annualPrice, "$114.99");
    assert.equal(pricing.plans[2].annualEquivalent, "$16.00");
  });

  it("falls back when the payload is not the public contract", () => {
    assert.equal(parsePublicPricing(null), null);
    assert.equal(parsePublicPricing({ plans: [] }), null);
    assert.equal(JSON.stringify(fallbackPricing).includes("119.99"), false);
    assert.equal(JSON.stringify(fallbackPricing).includes("199.99"), false);
  });
});

describe("plan presentation", () => {
  const plans = buildPlanOffers(fallbackPricing);
  const addons = buildAddons(fallbackPricing);
  const groups = buildPlanComparison(fallbackPricing);

  it("uses customer-facing names, prices, and signup links", () => {
    assert.deepEqual(
      plans.map((plan) => plan.name),
      ["Free", "Caregiver", "Caregiver Family"],
    );
    assert.deepEqual(
      plans.map((plan) => plan.cta),
      ["Start Free", "Start Caregiver", "Start Caregiver Family"],
    );
    assert.equal(plans[0].monthlyHref, "https://app.uuorganized.com/signup?plan=free");
    assert.equal(plans[1].monthlyHref, "https://app.uuorganized.com/signup?plan=command-center&interval=monthly");
    assert.equal(plans[1].annualHref, "https://app.uuorganized.com/signup?plan=command-center&interval=annual");
    assert.equal(plans[2].monthlyHref, "https://app.uuorganized.com/signup?plan=family&interval=monthly");
    assert.equal(plans[2].annualHref, "https://app.uuorganized.com/signup?plan=family&interval=annual");
    assert.equal(JSON.stringify(plans).includes("Command Center"), false);
  });

  it("switches annual display without recomputing the marketed prices", () => {
    assert.deepEqual(planPriceView(plans[1], "monthly"), {
      amount: "$11.99",
      period: "per month",
      yearly: null,
      savings: null,
    });
    assert.deepEqual(planPriceView(plans[1], "annual"), {
      amount: "$9.58",
      period: "per month, billed annually",
      yearly: "$114.99/year",
      savings: "Save 20%",
    });
    assert.equal(planPriceView(plans[2], "annual").amount, "$16.00");
    assert.equal(planPriceView(plans[2], "annual").yearly, "$191.99/year");
    assert.equal(addonPriceLabel(addons[0], "monthly"), "+$5.99/mo");
    assert.equal(addonPriceLabel(addons[0], "annual"), "$57.99/year");
    assert.equal(addonPriceLabel(addons[1], "monthly"), "+$2.99/mo");
    assert.equal(addonPriceLabel(addons[1], "annual"), "$28.99/year");
  });

  it("lists allowances and keeps Additional Person off Family", () => {
    assert.deepEqual(plans[0].points, [
      "1 person you care for",
      "2 caregiver spots",
      "Limited Ask UUO usage",
      "250 MB storage",
      "Basic reminders",
    ]);
    assert.ok(plans[1].points.includes("2 GB storage"));
    assert.ok(plans[1].points.includes("Exports"));
    assert.ok(plans[2].points.includes("10 GB storage"));
    assert.ok(plans[2].points.includes("Family sharing"));
    assert.equal(addons[0].eligibility, "Caregiver only");
    assert.equal(addons[0].description, "Add one more person you care for on the Caregiver plan.");
    assert.equal(addons[1].eligibility, "Caregiver and Caregiver Family");
    assert.deepEqual(row(groups, "Storage"), ["250 MB", "2 GB", "10 GB"]);
    assert.deepEqual(row(groups, "Caregiver spots"), ["2 caregiver spots", "4 caregiver spots", "10 caregiver spots"]);
    assert.deepEqual(row(groups, "People you care for"), [
      "1 person you care for",
      "1 person you care for",
      "Up to 3 people you care for",
    ]);
    assert.deepEqual(row(groups, "Available add-ons"), [
      "Not available",
      "Additional Person and Extra 10 GB Storage",
      "Extra 10 GB Storage",
    ]);
    assert.equal(row(groups, "Available add-ons")[2].includes("Additional Person"), false);
  });
});

describe("pricing fetch", () => {
  it("uses the public contract when the request succeeds", async () => {
    clearPricingCache();
    const resolved = await getPublicPricing({
      fetchImpl: async () => new Response(JSON.stringify(liveFixture), { status: 200 }),
    });
    assert.equal(resolved.source, "api");
    assert.equal(resolved.pricing.plans[1].monthlyPrice, "$11.99");
    assert.equal(JSON.stringify(resolved.pricing).includes("price_should_not_leak"), false);
  });

  it("keeps the page prices when the request fails", async () => {
    clearPricingCache();
    const resolved = await getPublicPricing({
      fetchImpl: async () => {
        throw new Error("offline");
      },
    });
    assert.equal(resolved.source, "fallback");
    assert.equal(resolved.pricing.plans[2].annualPrice, "$191.99");
    assert.equal(buildPlanOffers(resolved.pricing)[0].monthlyHref, signupHref("free"));
  });
});
