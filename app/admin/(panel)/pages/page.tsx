import Link from "next/link";
import { CopyForm } from "@/components/CopyForm";
import { getCatalog } from "@/lib/catalog";

export default async function WordsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { copy } = await getCatalog();

  return (
    <section className="section">
      <div className="wrap narrow">
        <p className="eyebrow">Pages</p>
        <h1>Pages</h1>
        <p className="fine">Open a section, change the words, then save once at the bottom.</p>
        {params.saved ? <p className="form-success">Saved.</p> : null}
        {params.error ? (
          <p className="form-error" role="alert">
            {params.error}
          </p>
        ) : null}
        <CopyForm copy={copy} />
        <p className="fine">
          <Link href="/admin">Back to products</Link>
        </p>
      </div>
    </section>
  );
}
