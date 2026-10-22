import type { Metadata } from "next";
import { ProfessionalForm } from "@/components/ProfessionalForm";
import { site } from "@/lib/site";

const description =
  "Request book information or a review copy of Who the Hell Put Me in Charge?! for a caregiver program, discharge team, or home-care agency.";

export const metadata: Metadata = {
  title: "For Professionals",
  description,
  alternates: { canonical: "/for-professionals" },
  openGraph: {
    title: "For Professionals",
    description,
    url: "/for-professionals",
    type: "website",
  },
};

export default function ProfessionalsPage() {
  return (
    <section className="section">
      <div className="wrap contact-grid">
        <div className="prose">
          <p className="eyebrow">For professionals</p>
          <h1>Request book information.</h1>
          <p className="lede">
            For caregiver programs, discharge planners, social workers, and home-care agencies that want
            books, printables, or a review copy.
          </p>
          <p>
            From Unhinged. Unfiltered. Organized. This is not a clinical partnership, a HIPAA agreement, or
            an enterprise product. There is no provider integration to turn on.
          </p>
          <p>
            The guide comes in the original edition and a profanity-free edition. Tell us which one you
            need. Do not include patient names, medication lists, or health records.
          </p>
          <p>
            Or email <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </div>
        <ProfessionalForm email={site.email} />
      </div>
    </section>
  );
}
