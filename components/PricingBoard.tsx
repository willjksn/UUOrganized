"use client";

import { useId, useState } from "react";
import type { BillingInterval, PlanComparisonRow, PlanOffer } from "@/lib/plans";

export function PricingBoard({
  plans,
  rows,
}: {
  plans: PlanOffer[];
  rows: PlanComparisonRow[];
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
              <a className="button" href={href}>
                {plan.cta}
              </a>
            </article>
          );
        })}
      </div>

      <div className="plan-table-wrap">
        <table className="plan-table">
          <caption>
            What each plan includes
            <span>The book and printables stay in the shop. These are the allowances inside the app.</span>
          </caption>
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">Allowance</span>
              </th>
              {plans.map((plan) => (
                <th key={plan.key} scope="col" className={plan.featured ? "col-main" : undefined}>
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {row.values.map((value, index) => (
                  <td key={plans[index].key} className={plans[index].featured ? "col-main" : undefined}>
                    <span className={value === "Not included" ? "is-off" : undefined}>{value}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
