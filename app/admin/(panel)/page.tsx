import Link from "next/link";
import { moveProductAction, saveShopsAction, saveSocialsAction } from "../actions";
import { DeleteProductButton } from "@/components/DeleteProductButton";
import { Picture } from "@/components/Picture";
import { getCatalog } from "@/lib/catalog";
import { resendReady } from "@/lib/email";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const catalog = await getCatalog();

  return (
    <section className="section admin-main">
      <div className="wrap stack">
        {params.saved ? <p className="form-success">Saved.</p> : null}
        {params.error ? (
          <p className="form-error" role="alert">
            {params.error}
          </p>
        ) : null}

        <div className="admin-head">
          <div>
            <p className="eyebrow">Shop</p>
            <h1>Products</h1>
            <p className="fine">
              {resendReady()
                ? "Sales and free files email from Stormi J. A paid order also lands under Orders."
                : "Downloads still work in the browser. Email delivery needs Resend connected."}
            </p>
          </div>
          <Link className="button" href="/admin/products/new">
            Add a product
          </Link>
        </div>

        <div className="admin-list">
          {catalog.products.map((product, index) => (
            <article className="admin-row" key={product.slug}>
              <Picture
                src={product.image}
                alt=""
                width={product.width}
                height={product.height}
              />
              <div>
                <h2>{product.name}</h2>
                <p className="fine tag-row">
                  <span className="tag">{product.priceLabel}</span>
                  {product.freeDownload ? <span className="tag">Free download</span> : null}
                  {product.paidDownload ? <span className="tag">Paid download</span> : null}
                  {product.ships ? <span className="tag">Ships</span> : null}
                  {product.stock == null ? null : (
                    <span className="tag">{product.stock === 0 ? "Sold out" : `${product.stock} left`}</span>
                  )}
                  {product.featured ? <span className="tag">Home</span> : null}
                  {product.feature ? <span className="tag">Large</span> : null}
                </p>
              </div>
              <div className="admin-actions">
                <Link className="button button-small" href={`/admin/products/${product.slug}`}>
                  Edit
                </Link>
                <form action={moveProductAction}>
                  <input type="hidden" name="slug" value={product.slug} />
                  <input type="hidden" name="direction" value="up" />
                  <button className="button button-ghost button-small" type="submit" disabled={index === 0}>
                    Up
                  </button>
                </form>
                <form action={moveProductAction}>
                  <input type="hidden" name="slug" value={product.slug} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    className="button button-ghost button-small"
                    type="submit"
                    disabled={index === catalog.products.length - 1}
                  >
                    Down
                  </button>
                </form>
                <DeleteProductButton slug={product.slug} />
              </div>
            </article>
          ))}
        </div>

        <form className="panel" action={saveShopsAction}>
          <h2>Amazon and Etsy</h2>
          <p className="fine">
            These are the footer buttons. A shop button that still uses the old link updates with them, including Browse the Etsy shop.
          </p>
          <label className="field">
            <span>Amazon</span>
            <input name="amazon" type="url" required maxLength={2000} defaultValue={catalog.shops.amazon} placeholder="https://" />
          </label>
          <label className="field">
            <span>Etsy</span>
            <input name="etsy" type="url" required maxLength={2000} defaultValue={catalog.shops.etsy} placeholder="https://" />
          </label>
          <button className="button" type="submit">
            Save shop links
          </button>
        </form>

        <details className="panel social-panel">
          <summary>Social links</summary>
          <form action={saveSocialsAction}>
            <p>These are the brand accounts. Leave a box empty to hide that network.</p>
            {catalog.socials.map((social) => (
              <label className="field" key={social.name}>
                <span>{social.name}</span>
                <input
                  name={social.name}
                  type="url"
                  inputMode="url"
                  placeholder="https://"
                  defaultValue={social.href}
                />
              </label>
            ))}
            <button className="button" type="submit">
              Save social links
            </button>
          </form>
        </details>
      </div>
    </section>
  );
}
