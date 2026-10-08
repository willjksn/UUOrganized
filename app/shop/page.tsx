import type { Metadata } from "next";
import { ActionLink } from "@/components/ActionLink";
import { BookToApp } from "@/components/BookToApp";
import { Paragraphs } from "@/components/Paragraphs";
import { ProductAction } from "@/components/ProductAction";
import { ProductCard } from "@/components/ProductCard";
import { Picture } from "@/components/Picture";
import { getCatalog } from "@/lib/catalog";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await getCatalog();
  return {
    title: "Shop",
    description: copy.shopLede,
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const params = await searchParams;
  const catalog = await getCatalog();
  const copy = catalog.copy;
  const feature = catalog.products.find((product) => product.feature) || catalog.products[0];
  const others = catalog.products.filter((product) => product.slug !== feature?.slug);

  return (
    <section className="section">
      <div className="wrap stack">
        <div className="section-head">
          <p className="eyebrow">{copy.shopEyebrow}</p>
          <h1>{copy.shopHeading}</h1>
          <p className="lede">{copy.shopLede}</p>
        </div>

        {params.checkout === "unavailable" ? (
          <p className="form-error" role="alert">
            The payment page didn’t open. Try again in a minute.
          </p>
        ) : null}
        {params.checkout === "soldout" ? (
          <p className="form-error" role="alert">
            That one is sold out.
          </p>
        ) : null}

        {feature ? (
          <article className="book-feature" id={feature.slug}>
            <div className={feature.backImage ? "cover-pair" : "cover-pair single"}>
              <Picture
                src={feature.image}
                alt={feature.imageAlt}
                width={feature.width}
                height={feature.height}
                sizes="(max-width: 900px) 90vw, 320px"
              />
              {feature.backImage ? (
                <Picture
                  src={feature.backImage}
                  alt={feature.backImageAlt || feature.imageAlt}
                  width={feature.backWidth || feature.width}
                  height={feature.backHeight || feature.height}
                  sizes="(max-width: 900px) 90vw, 320px"
                />
              ) : null}
            </div>
            <div className="prose">
              <p className="eyebrow">{feature.eyebrow}</p>
              <h2>{feature.name}</h2>
              <p>{feature.details || feature.summary}</p>
              <p className="price">{feature.priceLabel}</p>
              <p className="fine">By {site.author}</p>
              <ProductAction product={feature} />
              {feature.slug === "book" ? <BookToApp /> : null}
            </div>
          </article>
        ) : null}

        <div className="product-grid">
          {others.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>

        {copy.shopLaterHeading || copy.shopLaterBody ? (
          <aside className="later">
            {copy.shopLaterEyebrow ? <p className="eyebrow">{copy.shopLaterEyebrow}</p> : null}
            {copy.shopLaterHeading ? <h2>{copy.shopLaterHeading}</h2> : null}
            <Paragraphs text={copy.shopLaterBody} />
            {copy.shopLaterCta ? (
              <ActionLink className="button button-ghost" href={copy.shopLaterHref}>
                {copy.shopLaterCta}
              </ActionLink>
            ) : null}
          </aside>
        ) : null}
      </div>
    </section>
  );
}
