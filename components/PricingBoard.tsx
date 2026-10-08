"use client";

import { useId, useState } from "react";
import type { BillingInterval, PlanComparisonGroup, PlanOffer } from "@/lib/plans";

export function PricingBoard({
  plans,
  groups,
}: {
  plans: PlanOffer[];
  groups: PlanComparisonGroup[];
}) {
  const [billing, setBilling] = useState<BillingInterval>("monthly");
  const labelId = useId();
  const annual = billing === "annual";

  return (
    <div className="pricing-board">
      <div className="interval-switch">
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
      </div>

      <div className="plan-grid" aria-live="polite">
        {plans.map((plan) => {
          const price = annual ? plan.annualPrice : plan.monthlyPrice;
          const href = annual ? plan.annualHref : plan.monthlyHref;
          return (
            <article
              key={plan.key}
              className={plan.featured ? "plan-card plan-card-main" : "plan-card"}
              data-plan={plan.key}
              data-price={price}
              data-href={href}
            >
              <p className="eyebrow">{plan.outcome}</p>
              <h2>{plan.name}</h2>
              <p className="plan-price">
                <span className="plan-amount">{price}</span>
                <span className="plan-period">{annual ? "per year" : "per month"}</span>
              </p>
              <p className="plan-summary">{plan.summary}</p>
              <p className="fine">{plan.audience}</p>
              {annual && plan.annualNote ? <p className="fine">{plan.annualNote}</p> : null}
              <ul className="plan-points">
                {plan.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <a className="button" href={href} data-cta={plan.ctaId}>
                {plan.cta}
              </a>
            </article>
          );
        })}
      </div>

      <div className="compare">
        <div className="compare-intro">
          <h2>What each plan includes</h2>
          <p>
            The book and printables stay in the shop. Inside the app, the care tools are on every plan.
            Plans differ by how many people they hold, how much AI and document storage you get, exports,
            reminders, and whether the family can message each other.
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
