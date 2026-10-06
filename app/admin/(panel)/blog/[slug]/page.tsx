import Link from "next/link";
import { notFound } from "next/navigation";
import { PostForm } from "@/components/PostForm";
import { readPosts } from "@/lib/posts";

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const posts = await readPosts();
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();

  return (
    <section className="section">
      <div className="wrap narrow">
        <p className="eyebrow">Edit</p>
        <h1>{post.title}</h1>
        {query.error ? (
          <p className="form-error" role="alert">
            {query.error}
          </p>
        ) : null}
        <PostForm post={post} />
        <p className="fine">
          <Link href="/admin/blog">Back to posts</Link>
        </p>
      </div>
    </section>
  );
}
