import type { Product } from "@/lib/products";
import { Picture } from "./Picture";
import { ProductAction } from "./ProductAction";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card" id={product.slug}>
      <div className="card-media">
        <Picture
          src={product.image}
          alt={product.imageAlt}
          width={product.width}
          height={product.height}
          sizes="(max-width: 800px) 100vw, 50vw"
        />
      </div>
      <div className="card-body">
        <p className="eyebrow">{product.eyebrow}</p>
        <h3>{product.name}</h3>
        <p>{product.summary}</p>
        <p className="price">{product.priceLabel}</p>
        <ProductAction product={product} />
      </div>
    </article>
  );
}
