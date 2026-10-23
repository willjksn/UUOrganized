import type { Metadata } from "next";
import Link from "next/link";
import { Brush } from "@/components/Brush";
import { PricingBoard } from "@/components/PricingBoard";
import { getPricingView } from "@/lib/pricing-view";
import { site } from "@/lib/site";

const description =
  "Planned Free, Caregiver, and Caregiver Family pricing for the UUO Command Center, plus optional add-ons. Public signup is not open.";

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

export default async function PricingPage() {
  const pricing = await getPricingView();
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
            <h1>Planned pricing for the UUO Command Center.</h1>
            <Brush />
            <p className="brand-by">by Unhinged. Unfiltered. Organized.</p>
            <p className="lede">
              Free is for getting one person you care for organized. Caregiver is for the person managing
              the care. Caregiver Family is for the people managing it together.
            </p>
            <p className="prelaunch-note">
              These prices describe private testing. Public signup and checkout are not open. Nothing on
              this page charges a card.
            </p>
            <p className="book-line">Invite the people helping you care.</p>
            <p>
              The Workspace Owner manages the subscription. Invited caregivers, helpers, admins, and viewers
              do not purchase a separate plan.
            </p>
            <p>
              The book and printables stay in the <Link href="/shop">shop</Link>. Joining the waitlist does
              not start a subscription.
            </p>
          </div>
          <PricingBoard
            plans={pricing.plans.map((plan) => ({ ...plan, monthlyHref: "", annualHref: "" }))}
            groups={pricing.groups}
            addons={pricing.addons}
            annualMessage={pricing.annualMessage}
            source={pricing.source}
          />
          <p className="fine pricing-foot">
            Prices are in US dollars.{" "}
            <Link href="/command-center" data-cta="explore-command-center">
              Explore the UUO Command Center
            </Link>{" "}
            or read the <Link href="/faq">FAQ</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
