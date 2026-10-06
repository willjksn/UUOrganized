import type { Metadata } from "next";
import { ActionLink } from "@/components/ActionLink";
import { Brush } from "@/components/Brush";
import { Paragraphs } from "@/components/Paragraphs";
import { Portrait } from "@/components/Portrait";
import { getCatalog } from "@/lib/catalog";
import { paragraphs, type SiteCopy } from "@/lib/copy";

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await getCatalog();
  return {
    title: "About",
    description: paragraphs(copy.aboutBody)[0]?.slice(0, 180) || copy.description,
  };
}

export default async function AboutPage() {
  const { copy } = await getCatalog();
  const points = paragraphs(copy.aboutPoints);

  return (
    <>
      <section className="section">
        <div className="wrap story">
          <AboutMedia copy={copy} />
          <div className="prose">
            <p className="eyebrow">{copy.aboutEyebrow}</p>
            <h1>{copy.aboutHeading}</h1>
            <Brush />
            <Paragraphs text={copy.aboutBody} />
          </div>
        </div>
      </section>

      <section className="section band">
        <div className="wrap story">
          <div className="prose">
            {copy.aboutQuote ? <p className="quote">{copy.aboutQuote}</p> : null}
            {copy.aboutNote ? <p className="fine">{copy.aboutNote}</p> : null}
          </div>
          <div>
            {points.length ? (
              <ul className="checks">
                {points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            ) : null}
            <div className="actions actions-spaced">
              {copy.aboutPrimaryCta ? (
                <ActionLink className="button" href={copy.aboutPrimaryHref}>
                  {copy.aboutPrimaryCta}
                </ActionLink>
              ) : null}
              {copy.aboutSecondaryCta ? (
                <ActionLink className="button button-ghost" href={copy.aboutSecondaryHref}>
                  {copy.aboutSecondaryCta}
                </ActionLink>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function AboutMedia({ copy }: { copy: SiteCopy }) {
  const src = copy.aboutImage || copy.storyImage;
  const alt = copy.aboutImageAlt || copy.storyImageAlt;
  if (copy.aboutMedia === "video" && copy.aboutImage) {
    return (
      <div className="portrait-frame">
        <video src={copy.aboutImage} autoPlay muted loop playsInline aria-label={alt} />
      </div>
    );
  }
  return <Portrait src={src} alt={alt} priority />;
}
