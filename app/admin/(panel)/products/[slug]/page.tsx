import { notFound } from "next/navigation";
import { ProductForm } from "@/components/ProductForm";
import { getCatalog } from "@/lib/catalog";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const catalog = await getCatalog();
  const product = catalog.products.find((item) => item.slug === slug);
  if (!product) notFound();

  return (
    <section className="section">
      <div className="wrap narrow">
        <p className="eyebrow">Edit</p>
        <h1>{product.name}</h1>
        {query.error ? (
          <p className="form-error" role="alert">
            {query.error}
          </p>
        ) : null}
        <ProductForm product={product} />
      </div>
    </section>
  );
}
