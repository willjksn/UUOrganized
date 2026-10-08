import Link from "next/link";
import { loginHref, signupHref } from "@/lib/app-links";
import { getCatalog, publicSocials } from "@/lib/catalog";
import { publicNav } from "@/lib/nav";
import { site } from "@/lib/site";
import { SocialIcon } from "./SocialIcon";

const pages = [...publicNav, { href: "/pricing", label: "Pricing" }, { href: "/contact", label: "Contact" }];

export async function Footer() {
  const catalog = await getCatalog();
  const socials = publicSocials(catalog);

  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <img
            className="footer-logo"
            src="/images/logo-lockup.png"
            alt="Unhinged. Unfiltered. Organized. Real. Ready. Slightly unhinged."
            width={1607}
            height={758}
          />
        </div>
        <nav aria-label="Footer">
          <p className="eyebrow">Pages</p>
          <ul className="footer-links">
            {pages.map((page) => (
              <li key={page.href}>
                <Link href={page.href}>{page.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/privacy">Privacy</Link>
            </li>
            <li>
              <a href={loginHref} data-cta="login">Log In</a>
            </li>
            <li>
              <a href={signupHref("free")} data-cta="start-free">Start Free</a>
            </li>
          </ul>
        </nav>
        <div>
          <p className="eyebrow">The shop</p>
          <div className="chip-row">
            <a
              className="chip"
              href={catalog.shops.amazon}
              target="_blank"
              rel={catalog.shops.amazon.includes("amazon.com") ? "sponsored noreferrer" : "noreferrer"}
            >
              Amazon
            </a>
            <a className="chip" href={catalog.shops.etsy} target="_blank" rel="noreferrer">
              Etsy
            </a>
          </div>
          <p className="fine">As an Amazon Associate, I earn from qualifying purchases.</p>
          {socials.length ? (
            <>
              <p className="eyebrow social-label">{site.name}</p>
              <div className="social-row">
                {socials.map((social) => (
                  <a
                    key={social.name}
                    className={`social-icon social-icon-${social.name.toLowerCase()}`}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${site.name} on ${social.name}`}
                  >
                    <SocialIcon name={social.name} />
                  </a>
                ))}
              </div>
            </>
          ) : null}
          <p className="fine footer-mail">
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
      </div>
      <div className="wrap footer-fine">
        <p>© {new Date().getFullYear()} {site.author} Unhinged. Unfiltered. Organized.</p>
      </div>
    </footer>
  );
}
