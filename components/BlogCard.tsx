import Link from "next/link";
import { Picture } from "@/components/Picture";
import type { Post } from "@/lib/posts";

export function BlogCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  return (
    <Link className={compact ? "blog-card blog-card-compact" : "blog-card"} href={`/blog/${post.slug}`}>
      {post.image ? (
        <span className="blog-thumb">
          {post.media === "video" ? (
            <video src={post.image} muted playsInline preload="metadata" aria-hidden="true" />
          ) : (
            <Picture src={post.image} alt="" width={post.width} height={post.height} />
          )}
          {post.media === "video" ? <span className="blog-play" aria-hidden="true" /> : null}
        </span>
      ) : (
        <span className="blog-mark" aria-hidden="true">
          {post.title.slice(0, 1)}
        </span>
      )}
      <span>
        <time dateTime={post.createdAt}>
          {new Date(post.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
        </time>
        <h2>{post.title}</h2>
        {compact ? null : <p>{post.excerpt}</p>}
      </span>
    </Link>
  );
}
