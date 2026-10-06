import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Brush } from "@/components/Brush";
import { Paragraphs } from "@/components/Paragraphs";
import { Picture } from "@/components/Picture";
import { publishedPosts, readPosts } from "@/lib/posts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = publishedPosts(await readPosts()).find((item) => item.slug === slug);
  if (!post) return { title: "Blog" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = publishedPosts(await readPosts()).find((item) => item.slug === slug);
  if (!post) notFound();

  return (
    <article className="section">
      <div className="wrap blog-article">
        <p className="fine">
          <Link href="/blog">Notes</Link>
        </p>
        <p className="eyebrow">
          {new Date(post.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
        </p>
        <h1>{post.title}</h1>
        <Brush />
        {post.image ? (
          <figure className="blog-figure">
            {post.media === "video" ? (
              <video className="blog-hero" src={post.image} controls playsInline preload="metadata" aria-label={post.imageAlt} />
            ) : (
              <Picture
                className="blog-hero"
                src={post.image}
                alt={post.imageAlt}
                width={post.width}
                height={post.height}
                priority
              />
            )}
          </figure>
        ) : null}
        <div className="prose blog-body">
          <Paragraphs text={post.body} />
        </div>
      </div>
    </article>
  );
}
