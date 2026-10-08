import type { Metadata } from "next";
import Link from "next/link";
import { Brush } from "@/components/Brush";
import { PricingBoard } from "@/components/PricingBoard";
import { planComparison, planOffers } from "@/lib/plans";
import { site } from "@/lib/site";

const description =
  "Free, Command Center, and Family plans for the UU Organized Caregiver Command Center. Start free, or choose monthly or annual billing in the app.";

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
    name: "Caregiver Command Center pricing",
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
              Free is for getting one care recipient organized. Command Center is for the person managing
              the care. Family is for the people managing it together.
            </p>
            <p>
              Choosing a plan opens the app so you can sign up. Paid plans continue to checkout there,
              after you have an account. This page does not charge a card. The book and printables stay
              in the <Link href="/shop">shop</Link>.
            </p>
          </div>
          <PricingBoard plans={planOffers} rows={planComparison} />
          <p className="fine pricing-foot">
            Prices are in US dollars. <Link href="/command-center">Explore the Command Center</Link> before
            you decide.
          </p>
        </div>
      </section>
    </>
  );
}
