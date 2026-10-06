import Link from "next/link";
import { PostForm } from "@/components/PostForm";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <section className="section">
      <div className="wrap narrow">
        <p className="eyebrow">Blog</p>
        <h1>New post</h1>
        {params.error ? (
          <p className="form-error" role="alert">
            {params.error}
          </p>
        ) : null}
        <PostForm />
        <p className="fine">
          <Link href="/admin/blog">Back to posts</Link>
        </p>
      </div>
    </section>
  );
}
