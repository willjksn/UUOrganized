import type { Metadata } from "next";
import Link from "next/link";
import { Brush } from "@/components/Brush";
import { FaqList } from "@/components/FaqList";
import { faqItems } from "@/lib/faq";
import { getPricingView } from "@/lib/pricing-view";
import { site } from "@/lib/site";

const title = "UU Organized FAQ | Caregiver App, Plans & Billing";
const description =
  "Answers about UU Organized caregiver organization, plans, invited caregivers, storage, Ask UUO, billing, and account management.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/faq" },
  openGraph: {
    title,
    description,
    url: "/faq",
    type: "website",
  },
};

export default async function FaqPage() {
  const pricing = await getPricingView();
  const items = faqItems(pricing.faq);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: title,
    url: `${site.url}/faq`,
    description,
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer.join(" "),
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="section faq-page">
        <div className="wrap narrow">
          <p className="eyebrow">FAQ</p>
          <h1>The stuff you should not have to guess.</h1>
          <Brush />
          <p className="lede">Answers for the UUO Command Center, by Unhinged. Unfiltered. Organized.</p>
          <p>
            The book teaches the system. These answers describe the caregiver app, the plans, and who pays
            while the app is in private testing.
          </p>
          <p className="prelaunch-note">Public signup is not open. Prices here are not a checkout.</p>
          {pricing.faq.map((category) => (
            <section key={category.id} className="faq-category" aria-labelledby={category.id}>
              <h2 id={category.id}>{category.title}</h2>
              <FaqList items={category.items} />
            </section>
          ))}
          <div className="actions faq-close">
            <Link className="button" href="/command-center#waitlist" data-cta="join-waitlist">
              Join the Command Center Waitlist
            </Link>
            <Link className="button button-ghost" href="/pricing">
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
