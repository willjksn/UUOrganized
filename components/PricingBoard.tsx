"use client";

import { useId, useState } from "react";
import type { AddonOffer, BillingInterval, PlanComparisonGroup, PlanOffer } from "@/lib/plans";
import { addonPriceLabel, planPriceView, shortSavings } from "@/lib/plans";

export function PricingBoard({
  plans,
  groups,
  addons,
  annualMessage,
  source,
}: {
  plans: PlanOffer[];
  groups: PlanComparisonGroup[];
  addons: AddonOffer[];
  annualMessage: string;
  source: "api" | "fallback";
}) {
  const [billing, setBilling] = useState<BillingInterval>("monthly");
  const labelId = useId();
  const annual = billing === "annual";
  const savings = shortSavings(annualMessage);

  return (
    <div className="pricing-board" data-pricing-source={source} data-billing={billing}>
      <div className="interval-switch" role="group" aria-label="Billing interval">
        <button
          type="button"
          className={annual ? "interval-label" : "interval-label is-on"}
          aria-pressed={!annual}
          onClick={() => setBilling("monthly")}
        >
          Monthly
        </button>
        <button
          type="button"
          className="interval-track"
          role="switch"
          id={labelId}
          aria-checked={annual}
          aria-label="Annual billing"
          onClick={() => setBilling(annual ? "monthly" : "annual")}
        >
          <span className={annual ? "interval-knob is-annual" : "interval-knob"} />
        </button>
        <button
          type="button"
          className={annual ? "interval-label is-on" : "interval-label"}
          aria-pressed={annual}
          onClick={() => setBilling("annual")}
        >
          Annual
        </button>
        <span className="save-note">{savings}</span>
      </div>

      <div className="plan-grid" aria-live="polite">
        {plans.map((plan) => {
          const view = planPriceView(plan, billing);
          const href = annual ? plan.annualHref : plan.monthlyHref;
          const priceLabel = [view.amount, view.period, view.yearly].filter(Boolean).join(", ");
          return (
            <article
              key={plan.key}
              className={plan.featured ? "plan-card plan-card-main" : "plan-card"}
              data-plan={plan.key}
              data-price={view.amount}
              data-href={href}
            >
              <p className="eyebrow">{plan.outcome}</p>
              <h2>{plan.name}</h2>
              <p className="plan-price">
                <span className="plan-amount">{view.amount}</span>
                <span className="plan-period">{view.period}</span>
              </p>
              {view.yearly ? <p className="plan-yearly">{view.yearly}</p> : null}
              {view.savings ? <p className="save-note">{view.savings}</p> : null}
              <p className="plan-summary">{plan.summary}</p>
              <p className="fine">{plan.audience}</p>
              <ul className="plan-points">
                {plan.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <a className="button" href={href} data-cta={plan.ctaId} aria-label={`${plan.cta}. ${priceLabel}`}>
                {plan.cta}
              </a>
            </article>
          );
        })}
      </div>

      <section className="addon-board" aria-labelledby="addons-heading">
        <div className="addon-head">
          <h2 id="addons-heading">Optional add-ons</h2>
          <p>Add-ons are optional. They are not part of Free.</p>
        </div>
        <div className="addon-grid">
          {addons.map((addon) => (
            <article key={addon.key} data-addon={addon.key}>
              <h3>{addon.name}</h3>
              <p className="addon-price">{addonPriceLabel(addon, billing)}</p>
              <p>{addon.description}</p>
              <p className="addon-eligibility">{addon.eligibility}</p>
            </article>
          ))}
        </div>
        {annual ? null : <p className="addon-annual-note">Annual options available.</p>}
      </section>

      <div className="compare">
        <div className="compare-intro">
          <h2>What each plan includes</h2>
          <p>
            The book and printables stay in the shop. Who&apos;s Got This? is on every plan. Caregiver Family
            is the larger team, and the one with family sharing and messaging. Optional add-ons are separate
            from the plan price.
          </p>
        </div>
        {groups.map((group) => (
          <section key={group.title} className="compare-group" aria-label={group.title}>
            <h3>{group.title}</h3>
            <div className="compare-names" aria-hidden="true">
              <span />
              <div className="compare-name-row">
                {plans.map((plan) => (
                  <span key={plan.key} className={plan.featured ? "is-featured" : undefined}>
                    {plan.name}
                  </span>
                ))}
              </div>
            </div>
            {group.rows.map((row) => (
              <div key={row.label} className="compare-feature">
                <h4>{row.label}</h4>
                <ul className="compare-values">
                  {row.values.map((value, index) => (
                    <li
                      key={plans[index].key}
                      className={plans[index].featured ? "compare-value is-featured" : "compare-value"}
                    >
                      <span className="compare-plan">{plans[index].name}</span>
                      <span className={value.tone === "off" ? "is-off" : value.tone === "limited" ? "is-limited" : "is-in"}>
                        {value.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
