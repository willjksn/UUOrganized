import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Paragraphs } from "@/components/Paragraphs";
import { getCatalog } from "@/lib/catalog";
import { paragraphs } from "@/lib/copy";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await getCatalog();
  return {
    title: "Contact",
    description: paragraphs(copy.contactBody)[0]?.slice(0, 180) || "Write to Stormi J.",
  };
}

export default async function ContactPage() {
  const { copy } = await getCatalog();
  return (
    <section className="section">
      <div className="wrap contact-grid">
        <div className="prose">
          <p className="eyebrow">{copy.contactEyebrow}</p>
          <h1>{copy.contactHeading}</h1>
          <Paragraphs text={copy.contactBody} />
          <p>
            Or email <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </div>
        <ContactForm email={site.email} />
      </div>
    </section>
  );
}
