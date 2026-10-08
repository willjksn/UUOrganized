import type { Metadata } from "next";
import Link from "next/link";
import { Brush } from "@/components/Brush";
import { PricingBoard } from "@/components/PricingBoard";
import { planComparison, planOffers } from "@/lib/plans";
import { site } from "@/lib/site";

const description =
  "Free, Caregiver, and Caregiver Family plans for the UU Organized app. Start free, or choose monthly or annual billing in the app.";

export const metadata: Metadata = {
  title: "Pricing",
  description,
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing",
    description,
    url: "/pricing",
    type: "website",
  },
};

export default function PricingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "UU Organized pricing",
    url: `${site.url}/pricing`,
    description,
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Pricing</p>
            <h1>Start free. Make room when the list gets bigger.</h1>
            <Brush />
            <p className="lede">
              Free is for getting one person you care for organized. Caregiver is for the person managing
              the care. Caregiver Family is for the people managing it together.
            </p>
            <p>
              A caregiver spot is someone who can sign in and help. They join your workspace. They do not
              buy their own plan. Choosing a plan opens the app so you can sign up. Paid plans continue
              to checkout there, after you have an account. This page does not charge a card. The book
              and printables stay in the <Link href="/shop">shop</Link>.
            </p>
          </div>
          <PricingBoard plans={planOffers} groups={planComparison} />
          <p className="fine pricing-foot">
            Prices are in US dollars.{" "}
            <Link href="/command-center" data-cta="explore-command-center">
              Explore the Command Center
            </Link>{" "}
            before you decide.
          </p>
        </div>
      </section>
    </>
  );
}
