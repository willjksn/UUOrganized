import { ProductForm } from "@/components/ProductForm";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <section className="section">
      <div className="wrap narrow">
        <p className="eyebrow">New product</p>
        <h1>Add a product</h1>
        {params.error ? (
          <p className="form-error" role="alert">
            {params.error}
          </p>
        ) : null}
        <ProductForm />
      </div>
    </section>
  );
}
