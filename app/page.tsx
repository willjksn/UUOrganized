import { ActionLink } from "@/components/ActionLink";
import { BlogCard } from "@/components/BlogCard";
import { Brush } from "@/components/Brush";
import { EmailSignup } from "@/components/EmailSignup";
import { Paragraphs } from "@/components/Paragraphs";
import { Picture } from "@/components/Picture";
import { Portrait } from "@/components/Portrait";
import { StoryBlurb } from "@/components/StoryBlurb";
import { ProductCard } from "@/components/ProductCard";
import { getCatalog } from "@/lib/catalog";
import { withPublicHome } from "@/lib/copy";
import { publishedPosts, readPosts } from "@/lib/posts";
import { signupHref } from "@/lib/app-links";
import { site } from "@/lib/site";

export default async function HomePage() {
  const catalog = await getCatalog();
  const copy = withPublicHome(catalog.copy);
  const supportAt = copy.homeLede.indexOf("UUO Command Center helps");
  const heroLede = supportAt > 0
    ? [copy.homeLede.slice(0, supportAt).trim(), copy.homeLede.slice(supportAt).trim()]
    : [copy.homeLede];
  const featured = catalog.products.filter((product) => product.featured);
  const notes = publishedPosts(await readPosts());
  const notePreview = notes.slice(0, 3);
  const book = catalog.products.find((product) => product.slug === "book");
  const bookImage = book?.image.startsWith("http") ? book.image : `${site.url}${book?.image || "/images/book-cover.jpg"}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: site.name,
        url: site.url,
        description: copy.description,
      },
      {
        "@type": "Book",
        name: book?.name || "Who the Hell Put Me in Charge?!",
        author: { "@type": "Person", name: "Stormi J." },
        url: book?.href || catalog.shops.amazon,
        image: bookImage,
        description: book?.summary || copy.description,
      },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="section hero">
        <div className="wrap hero-grid">
          <div>
            <p className="eyebrow">{copy.homeEyebrow}</p>
            <h1 className="display">
              {copy.homeHeadline}
              {copy.homeHeadlineEm ? (
                <>
                  <br />
                  <em>{copy.homeHeadlineEm}</em>
                </>
              ) : null}
            </h1>
            <Brush />
            {heroLede.map((paragraph, index) => (
              <p className={index === 0 ? "lede" : "hero-support"} key={paragraph}>
                {paragraph}
              </p>
            ))}
            <div className="actions">
              <ActionLink className="button" href={copy.homePrimaryHref} cta="start-free">
                {copy.homePrimaryCta}
              </ActionLink>
              {copy.homeSecondaryCta ? (
                <ActionLink className="button button-ghost" href={copy.homeSecondaryHref} cta="explore-command-center">
                  {copy.homeSecondaryCta}
                </ActionLink>
              ) : null}
            </div>
            <p className="fine hero-next">
              <ActionLink href="/shop#book">Shop the book</ActionLink>
            </p>
          </div>
          <figure className="hero-cover">
            <Picture
              src={copy.heroImage}
              alt={copy.heroImageAlt}
              width={copy.heroWidth}
              height={copy.heroHeight}
              priority
              sizes="(max-width: 900px) 80vw, 440px"
            />
            {copy.heroCaption ? <figcaption>{copy.heroCaption}</figcaption> : null}
          </figure>
        </div>
      </section>

      <div className="band-rule">
        <ul className="wrap principles">
          {copy.principles.map((word, index) => (
            <li key={`${word}-${index}`}>{word}</li>
          ))}
        </ul>
      </div>

      <section className="section band" aria-labelledby="command-home-heading">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">The UUO Command Center App</p>
            <h2 id="command-home-heading">The book teaches the system. The app helps you run it.</h2>
            <p className="lede">
              Open the app when the list is still in your head: the dose, the appointment, the reference
              number, and who is taking the next turn.
            </p>
          </div>
          <div className="command-preview">
            <article>
              <h3>Today</h3>
              <p>Medications, visits, follow-ups, and the things you are waiting on, gathered into the day you are in.</p>
            </article>
            <article>
              <h3>Medications</h3>
              <p>The schedule you enter, a photo of the label, and the refill note. You review it before it is saved.</p>
            </article>
            <article>
              <h3>The calls</h3>
              <p>Insurance, the pharmacy, the agency. The name, the number, and the reference number have a place.</p>
            </article>
            <article>
              <h3>Supplies</h3>
              <p>The things you cannot run out of, with the reorder link for the place you already buy them.</p>
            </article>
            <article>
              <h3>The handoff</h3>
              <p>What the next person actually needs when they take a shift, instead of another group text.</p>
            </article>
            <article>
              <h3>Say it once</h3>
              <p>Type it, say it, or photograph it. Ask UUO later about what is already written down.</p>
            </article>
          </div>
          <div className="actions">
            <a className="button" href={signupHref("free")} data-cta="start-free">
              Start Free
            </a>
            <ActionLink className="button button-ghost" href="/command-center" cta="explore-command-center">
              Explore the Command Center
            </ActionLink>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">{copy.toolsEyebrow}</p>
            <h2>{copy.toolsHeading}</h2>
          </div>
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap story">
          <Portrait src={copy.storyImage} alt={copy.storyImageAlt} />
          <div className="prose">
            <p className="eyebrow">{copy.storyEyebrow}</p>
            <h2>{copy.storyHeading}</h2>
            <StoryBlurb text={copy.storyBody} moreLabel={copy.storyLinkText || "Read the story"} />
          </div>
        </div>
      </section>

      {notePreview.length ? (
        <section className="section notes-section">
          <div className="wrap">
            <div className="section-head notes-head">
              <p className="eyebrow">Notes</p>
              <h2>From the desk.</h2>
            </div>
            <div className="home-notes">
              {notePreview.map((post) => (
                <BlogCard key={post.slug} post={post} compact />
              ))}
            </div>
            {notes.length > 3 ? (
              <p className="fine notes-more">
                <ActionLink href="/blog">All the notes</ActionLink>
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="section band" id="checklist">
        <div className="wrap checklist">
          <div className="checklist-preview">
            <Picture
              src={copy.checklistImage}
              alt={copy.checklistImageAlt}
              width={copy.checklistWidth}
              height={copy.checklistHeight}
              sizes="(max-width: 860px) 100vw, 560px"
            />
          </div>
          <div>
            <p className="eyebrow">{copy.checklistEyebrow}</p>
            <h2>{copy.checklistHeading}</h2>
            {copy.checklistAttitude ? <p className="attitude">{copy.checklistAttitude}</p> : null}
            <Paragraphs text={copy.checklistBody} />
            <EmailSignup buttonLabel={copy.checklistButton} note={copy.checklistNote} />
          </div>
        </div>
      </section>
    </>
  );
}
