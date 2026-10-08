import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PromoBar } from "@/components/PromoBar";
import { getCatalog } from "@/lib/catalog";
import { withPublicHome } from "@/lib/copy";
import { site } from "@/lib/site";
import "./globals.css";

export const dynamic = "force-dynamic";

const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const sans = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export async function generateMetadata(): Promise<Metadata> {
  const copy = withPublicHome((await getCatalog()).copy);
  return {
    metadataBase: new URL(site.url),
    title: {
      default: "Unhinged. Unfiltered. Organized.",
      template: "%s · Unhinged. Unfiltered. Organized.",
    },
    description: copy.description,
    authors: [{ name: "Stormi J." }],
    openGraph: {
      type: "website",
      url: site.url,
      siteName: "Unhinged. Unfiltered. Organized.",
      title: "Unhinged. Unfiltered. Organized.",
      description: copy.description,
      images: [
        {
          url: copy.heroImage,
          width: copy.heroWidth,
          height: copy.heroHeight,
          alt: copy.heroImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Unhinged. Unfiltered. Organized.",
      description: copy.description,
      images: [copy.heroImage],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#F7F4EF",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const copy = withPublicHome((await getCatalog()).copy);
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a className="skip" href="#content">
          Skip to content
        </a>
        <PromoBar message={copy.promoMessage} code={copy.promoCode} />
        <Header />
        <main id="content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
