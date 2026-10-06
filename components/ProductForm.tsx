import Link from "next/link";
import { saveProductAction } from "@/app/admin/actions";
import { formatPrice } from "@/lib/price";
import type { Product } from "@/lib/products";

function formatShipping(cents: number | null | undefined) {
  if (cents == null) return "";
  return formatPrice(cents);
}

export function ProductForm({ product }: { product?: Product }) {
  const offer = product?.ships ? "ship" : product?.paidDownload ? "paid" : product?.freeDownload ? "free" : "link";

  return (
    <form className="admin-form" action={saveProductAction}>
      {product ? <input type="hidden" name="slug" value={product.slug} /> : null}

      <section className="panel">
        <h2>The listing</h2>
        <label className="field">
          <span>Name</span>
          <input name="name" required maxLength={140} defaultValue={product?.name || ""} />
        </label>
        <label className="field">
          <span>Small label</span>
          <input name="eyebrow" maxLength={60} defaultValue={product?.eyebrow || ""} placeholder="Printable" />
        </label>
        <label className="field">
          <span>Short description</span>
          <textarea name="summary" required maxLength={500} rows={3} defaultValue={product?.summary || ""} />
        </label>
        <label className="field">
          <span>Longer description</span>
          <textarea name="details" maxLength={2000} rows={5} defaultValue={product?.details || ""} />
        </label>
        <label className="field">
          <span>Price</span>
          <input name="priceLabel" maxLength={80} defaultValue={product?.priceLabel || ""} placeholder="$18 or See price on Etsy" />
        </label>
        <label className="field">
          <span>Button text</span>
          <input name="cta" maxLength={40} defaultValue={product?.cta || ""} placeholder="Buy, or Send me the file" />
        </label>
      </section>

      <section className="panel">
        <h2>How they get it</h2>
        <div className="choice-grid">
          <label className="choice">
            <input type="radio" name="offer" value="link" defaultChecked={offer === "link"} />
            <strong>Button link</strong>
            <span>Amazon, Etsy, or another page.</span>
          </label>
          <label className="choice">
            <input type="radio" name="offer" value="free" defaultChecked={offer === "free"} />
            <strong>Free download</strong>
            <span>Email, then the file.</span>
          </label>
          <label className="choice">
            <input type="radio" name="offer" value="paid" defaultChecked={offer === "paid"} />
            <strong>Paid download</strong>
            <span>Card, then the file.</span>
          </label>
          <label className="choice">
            <input type="radio" name="offer" value="ship" defaultChecked={offer === "ship"} />
            <strong>Ships</strong>
            <span>Card, plus shipping.</span>
          </label>
        </div>
      </section>

      <section className="panel panel-link">
        <h2>The button</h2>
        <label className="field">
          <span>Button link</span>
          <input name="href" maxLength={2000} defaultValue={product?.href || ""} placeholder="https://" />
        </label>
        <label className="check">
          <input type="checkbox" name="external" defaultChecked={product?.external ?? true} />
          Open the link in a new tab
        </label>
      </section>

      <section className="panel panel-price">
        <h2>How many you have</h2>
        <label className="field">
          <span>Number for sale</span>
          <input name="stock" inputMode="numeric" maxLength={6} defaultValue={product?.stock ?? ""} placeholder="12" />
        </label>
        <p className="fine">Required when it ships. The number drops by one after each paid order, and the shop shows what’s left.</p>
      </section>

      <section className="panel panel-ship">
        <h2>Shipping</h2>
        <div className="admin-split">
          <label className="field">
            <span>United States</span>
            <input name="shipping" maxLength={40} defaultValue={product?.ships ? formatShipping(product.shippingCents) : ""} placeholder="$6 or $0" />
          </label>
          <label className="field">
            <span>Outside the United States</span>
            <input name="shippingIntl" maxLength={40} defaultValue={product?.shippingIntlCents == null ? "" : formatShipping(product.shippingIntlCents)} placeholder="Blank means US only" />
          </label>
        </div>
        <p className="fine">At checkout they pick the one that matches the address. That price is added to the product price.</p>
      </section>

      <section className="panel panel-file">
        <h2>The file</h2>
        <label className="field">
          <span>PDF</span>
          <input name="downloadFile" type="file" accept="application/pdf,.pdf" />
        </label>
        {product?.fileName ? <p className="fine">A PDF is already saved ({product.fileName}). Upload a new one only to replace it.</p> : null}
      </section>

      <section className="panel">
        <h2>On the shop</h2>
        <label className="check">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} />
          Show on the home page
        </label>
        <label className="check">
          <input type="checkbox" name="feature" defaultChecked={product?.feature ?? false} />
          Use the large layout on the shop
        </label>
      </section>

      <section className="panel">
        <h2>Pictures</h2>
        <label className="field">
          <span>Picture</span>
          <input name="image" type="file" accept="image/jpeg,image/png,image/webp" />
        </label>
        <label className="field">
          <span>Picture description</span>
          <input name="imageAlt" maxLength={180} defaultValue={product?.imageAlt || ""} />
        </label>
        <label className="field">
          <span>Second picture, optional</span>
          <input name="backImage" type="file" accept="image/jpeg,image/png,image/webp" />
        </label>
        <label className="field">
          <span>Second picture description</span>
          <input name="backImageAlt" maxLength={180} defaultValue={product?.backImageAlt || ""} />
        </label>
      </section>

      <div className="form-actions">
        <button className="button" type="submit">
          {product ? "Save product" : "Add product"}
        </button>
        <Link className="button button-ghost" href="/admin">
          Cancel
        </Link>
      </div>
    </form>
  );
}
