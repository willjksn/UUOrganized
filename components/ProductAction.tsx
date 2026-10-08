import Link from "next/link";
import type { Product } from "@/lib/products";
import { stockLabel } from "@/lib/price";
import { FreeDownload } from "./FreeDownload";

export function ProductAction({ product }: { product: Product }) {
  const onSite = Boolean(product.paidDownload || product.ships);
  const left = stockLabel(product.stock);

  if (onSite && product.stock === 0) {
    return (
      <div className="signup">
        <button className="button" type="button" disabled>
          Sold out
        </button>
        {left ? <p className="fine">{left}</p> : null}
      </div>
    );
  }

  if (onSite) {
    return (
      <form className="signup" action="/api/checkout" method="post">
        <input type="hidden" name="slug" value={product.slug} />
        <button className="button" type="submit">
          {product.cta || "Buy now"}
        </button>
        <p className="fine">
          {left ? `${left}. ` : ""}
          {product.ships
            ? "Pay by card. Shipping is added for the address at checkout."
            : "Pay by card. The file downloads after payment, and a copy is emailed."}{" "}
          <Link href="/shop/privacy">Privacy note</Link>
        </p>
      </form>
    );
  }

  if (product.freeDownload) {
    return <FreeDownload slug={product.slug} name={product.name} label={product.cta || "Send me the file"} />;
  }

  if (product.external && product.href) {
    return (
      <a
        className="button"
        href={product.href}
        target="_blank"
        rel={product.href.includes("amazon.com") ? "sponsored noreferrer" : "noreferrer"}
      >
        {product.cta}
      </a>
    );
  }

  return (
    <Link className="button" href={product.href || "/shop"}>
      {product.cta}
    </Link>
  );
}
