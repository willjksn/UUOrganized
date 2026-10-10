import { buildFaq, previewFaq } from "./faq";
import { getPublicPricing } from "./get-pricing";
import { buildAddons, buildPlanComparison, buildPlanOffers } from "./plans";

export async function getPricingView() {
  const resolved = await getPublicPricing();
  const faq = buildFaq(resolved.pricing);
  return {
    source: resolved.source,
    annualMessage: resolved.pricing.annualBillingMessage,
    plans: buildPlanOffers(resolved.pricing),
    groups: buildPlanComparison(resolved.pricing),
    addons: buildAddons(resolved.pricing),
    faq,
    preview: previewFaq(faq),
  };
}
