import { ActionLink } from "@/components/ActionLink";
import { FaqList } from "@/components/FaqList";
import { BlogCard } from "@/components/BlogCard";
import { EmailSignup } from "@/components/EmailSignup";
import { Picture } from "@/components/Picture";
import { Portrait } from "@/components/Portrait";
import { ProductCard } from "@/components/ProductCard";
import { WaitlistForm } from "@/components/WaitlistForm";
import { getCatalog } from "@/lib/catalog";
import { withPublicHome } from "@/lib/copy";
import { publishedPosts, readPosts } from "@/lib/posts";
import { getPricingView } from "@/lib/pricing-view";
import { site } from "@/lib/site";

export default async function HomePage() {
  const [catalog, pricing] = await Promise.all([getCatalog(), getPricingView()]);
  const copy = withPublicHome(catalog.copy);
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
            <p className="eyebrow">Real. Ready. Slightly unhinged.</p>
            <h1 className="display">Practical systems for the stuff nobody tells you about.</h1>
            <p className="lede">
              When life suddenly puts you in charge of medications, appointments, paperwork, and everything
              in between, you need a way to keep track of it all. Start with the caregiver guides and
              practical tools built from real experience.
            </p>
            <div className="actions">
              <ActionLink className="button" href="/shop" cta="explore-books">
                Explore the Books &amp; Tools
              </ActionLink>
              <ActionLink className="button button-ghost" href="/#checklist" cta="get-checklist">
                Get the Free 48-Hour Checklist
              </ActionLink>
            </div>
          </div>
          <figure className="hero-cover">
            <Picture
              src={book?.image || "/images/book-cover.jpg"}
              alt={book?.imageAlt || "Book cover of Who the Hell Put Me in Charge?! by Stormi J."}
              width={book?.width || 1000}
              height={book?.height || 1250}
              priority
              sizes="(max-width: 900px) 80vw, 440px"
            />
            <figcaption>Who the Hell Put Me in Charge?! · Stormi J.</figcaption>
          </figure>
        </div>
      </section>

      <section className="section problem" aria-labelledby="problem-heading">
        <div className="wrap narrow">
          <h2 id="problem-heading">Nobody gave you the damn manual.</h2>
          <p className="editorial">
            One minute you are living your life. The next you are keeping up with doctors, medication
            changes, insurance calls, equipment, and a hundred details you cannot afford to forget. UUO
            was built for that kind of real life.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="tools-heading">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Available now</p>
            <h2 id="tools-heading">Start with the book. Keep going with the tools.</h2>
            <p className="lede">
              <em>Who the Hell Put Me in Charge?!</em> is the caregiver guide, from Unhinged. Unfiltered.
              Organized. The printables pick up the daily list.
            </p>
          </div>
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
          <p className="fine pending-note">
            A profanity-free edition is not for sale yet. It will show up here when there is a real cover
            and a place to buy it.
          </p>
        </div>
      </section>

      <section className="section band" id="waitlist" aria-labelledby="command-home-heading">
        <div className="wrap command-home">
          <div>
            <p className="eyebrow">Coming next</p>
            <h2 id="command-home-heading">The UUO Command Center is coming.</h2>
            <p className="brand-by">by Unhinged. Unfiltered. Organized.</p>
            <p className="lede">
              We are testing a digital space designed to help caregivers organize schedules, medications,
              follow-ups, documents, and help from family. Join the interest list for updates and possible
              early testing opportunities.
            </p>
            <p className="prelaunch-note">App in private testing; features and availability may change.</p>
          </div>
          <WaitlistForm />
        </div>
      </section>

      <section className="section" aria-labelledby="story-heading">
        <div className="wrap story">
          <Portrait src="/images/stormi.jpg" alt="Stormi J holding her book, Who the Hell Put Me in Charge?!" />
          <div className="prose">
            <p className="eyebrow">Stormi J.</p>
            <h2 id="story-heading">I did not plan any of this.</h2>
            <p>
              My mom had a stroke. One day I was living my life. The next, I was responsible for
              medications, appointments, equipment, paperwork, symptoms, and phone calls.
            </p>
            <p>
              I looked for a system. Somewhere to put the list, the bottles, the questions, and the “did
              we already give that?” I couldn’t find one that sounded like real life, so I made the lists
              and trackers I needed. Those became the book, the printables, and Unhinged. Unfiltered.
              Organized.
            </p>
            <div className="actions">
              <ActionLink className="button" href="/about" cta="read-story">
                Read My Story
              </ActionLink>
            </div>
          </div>
        </div>
      </section>

      <section className="section band" id="checklist" aria-labelledby="checklist-heading">
        <div className="wrap checklist">
          <div className="checklist-preview">
            <Picture
              src="/images/checklist-teaser.jpg"
              alt="Top of the First 48 Hours Home checklist: Don’t forget this shit."
              width={796}
              height={226}
              sizes="(max-width: 860px) 100vw, 560px"
            />
          </div>
          <div>
            <p className="eyebrow">Free</p>
            <h2 id="checklist-heading">First 48 Hours Home Checklist.</h2>
            <p className="attitude">Don’t forget this shit.</p>
            <p>
              A useful starting point for the day someone comes home and the house is not ready. Leave your
              email and the checklist downloads. A copy is emailed when delivery is connected.
            </p>
            <EmailSignup
              buttonLabel="Send me the checklist"
              note="The checklist comes to this email. Notes about new printables are a separate, optional choice."
            />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="professionals-heading">
        <div className="wrap narrow">
          <p className="eyebrow">For programs and agencies</p>
          <h2 id="professionals-heading">Books and printables for the people who send families home.</h2>
          <p className="lede">
            Caregiver programs, discharge planners, social workers, and home-care agencies can ask for book
            information, printables, or a review copy.
          </p>
          <div className="actions">
            <ActionLink className="button" href="/for-professionals" cta="for-professionals">
              Request Book Information
            </ActionLink>
          </div>
        </div>
      </section>

      <section className="section band" aria-labelledby="home-faq-heading">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">UUO Command Center, in private testing</p>
            <h2 id="home-faq-heading">The stuff you should not have to guess.</h2>
            <p className="lede">
              These answers describe the UUO Command Center app. Public signup is not open yet.
            </p>
          </div>
          <FaqList items={pricing.preview} />
          <div className="actions">
            <ActionLink className="button button-ghost" href="/faq" cta="see-faq">
              See all FAQs
            </ActionLink>
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
    </>
  );
}
