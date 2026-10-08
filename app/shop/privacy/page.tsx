import type { Metadata } from "next";
import { Brush } from "@/components/Brush";
import { legalLinks } from "@/lib/app-links";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shop privacy note",
  description: "What this website does with shop orders, free-file emails, and contact messages.",
  alternates: { canonical: "/shop/privacy" },
};

export default function ShopPrivacyPage() {
  return (
    <section className="section privacy">
      <div className="wrap privacy-wrap">
        <header className="privacy-intro">
          <p className="eyebrow">Privacy</p>
          <h1>A plain note.</h1>
          <Brush />
          <p>
            I’m Stormi J. This site is {site.name} at {site.url.replace("https://", "")}. This is a
            plain-language note about the shop, free files, and messages on this website.
          </p>
          <p>
            The UU Organized app keeps its own{" "}
            {legalLinks.map((link, index) => (
              <span key={link.href}>
                {index === 0 ? "" : index === legalLinks.length - 1 ? ", and " : ", "}
                <a href={link.href}>{link.label}</a>
              </span>
            ))}
            .
          </p>
        </header>
        <div className="privacy-grid">
          <article className="privacy-card privacy-wide">
            <h2>Email for free files</h2>
            <p>
              If you ask for a free file, including the First 48 Hours checklist, I keep your email so I
              can send that file and, later, notes about new tools and the occasional discount. The file
              downloads in your browser after you sign up. When email delivery is connected, a copy also
              goes to your inbox.
            </p>
          </article>
          <article className="privacy-card">
            <h2>Contact messages</h2>
            <p>
              If you use the contact form, I keep your name, email, and message so I can reply. That’s
              the only use.
            </p>
          </article>
          <article className="privacy-card">
            <h2>Your information stays here</h2>
            <p>Your email and messages stay with me. They are not sold, rented, or handed to another list.</p>
          </article>
          <article className="privacy-card privacy-wide">
            <h2>Buying a file here</h2>
            <p>
              If you buy a download on this site, the card payment is handled by Stripe. I keep the email
              from that payment so I can send the file. If the product ships, I also keep the name and
              address from checkout so I can mail it. Stripe has its own privacy rules.
            </p>
            <p>
              The file downloads in your browser after payment, and a copy is emailed to you. If it
              doesn’t arrive, or you need a refund, email{" "}
              <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> and I’ll handle it.
            </p>
          </article>
          <article className="privacy-card">
            <h2>Amazon and Etsy</h2>
            <p>
              The book is sold on Amazon. Some printables are sold on Etsy. Those checkouts belong to
              them, and they have their own privacy rules.
            </p>
          </article>
          <article className="privacy-card privacy-wide">
            <h2>Notes I send</h2>
            <p>
              If you ask for a free file or buy something here, I keep your email so I can send what you asked for
              and, later, a note about something new. Those notes include a link to leave the list. You can also
              email <a href={`mailto:${site.privacyEmail}`}>{site.privacyEmail}</a> and say delete.
            </p>
          </article>
          <article className="privacy-card">
            <h2>Cookies</h2>
            <p>
              Signing up for a free file, or buying a download, sets a cookie so that file can come
              through. It is not an ad tracker. It expires after 30 days.
            </p>
          </article>
          <article className="privacy-card privacy-wide privacy-last">
            <h2>Taking you off the list</h2>
            <p>
              Email <a href={`mailto:${site.privacyEmail}`}>{site.privacyEmail}</a> and say delete. I’ll remove what I
              have.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
