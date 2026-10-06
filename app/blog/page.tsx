import type { Metadata } from "next";
import { BlogCard } from "@/components/BlogCard";
import { Brush } from "@/components/Brush";
import { publishedPosts, readPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes from Stormi J.",
};

export default async function BlogPage() {
  const posts = publishedPosts(await readPosts());

  return (
    <section className="section">
      <div className="wrap blog-wrap">
        <p className="eyebrow">Stormi J.</p>
        <h1>Notes.</h1>
        <Brush />
        <p className="blog-lede">Things I write down.</p>
        {posts.length ? (
          <div className="blog-list">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="blog-empty">Nothing posted yet.</p>
        )}
      </div>
    </section>
  );
}
