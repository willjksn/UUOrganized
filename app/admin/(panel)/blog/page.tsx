import Link from "next/link";
import { DeletePostButton } from "@/components/DeletePostButton";
import { Picture } from "@/components/Picture";
import { easternLabel } from "@/lib/clock";
import { readPosts } from "@/lib/posts";

export default async function BlogAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; removed?: string; error?: string; note?: string }>;
}) {
  const params = await searchParams;
  const posts = await readPosts();
  const ordered = [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <section className="section admin-main">
      <div className="wrap stack">
        {params.saved && params.note === "1" ? (
          <p className="form-success">Saved. It’s waiting on Emails. Write it yourself, or click Write it. Nothing goes out until you send it.</p>
        ) : params.saved && params.note === "later" ? (
          <p className="form-success">Saved. It stays off the blog until the time you picked, then it goes up on its own. The email waits on Emails after that.</p>
        ) : params.saved && params.note === "missed" ? (
          <p className="form-success">Saved. The announcement could not be stored. The post is still up.</p>
        ) : params.removed ? (
          <p className="form-success">Removed.</p>
        ) : params.saved ? (
          <p className="form-success">Saved.</p>
        ) : null}
        {params.error ? (
          <p className="form-error" role="alert">
            {params.error}
          </p>
        ) : null}
        <div className="admin-head">
          <div>
            <p className="eyebrow">Writing</p>
            <h1>Blog</h1>
            <p className="fine">A draft stays here until you show it, or until the time you picked.</p>
          </div>
          <Link className="button" href="/admin/blog/new">
            New post
          </Link>
        </div>
        {ordered.length ? (
          <div className="admin-list">
            {ordered.map((post) => (
              <article className="admin-row" key={post.slug}>
                {post.image ? (
                  post.media === "video" ? (
                    <video className="admin-thumb" src={post.image} muted playsInline preload="metadata" aria-hidden="true" />
                  ) : (
                    <Picture src={post.image} alt="" width={post.width} height={post.height} />
                  )
                ) : (
                  <div className="letter-mark" aria-hidden="true">
                    {post.title.slice(0, 1)}
                  </div>
                )}
                <div>
                  <h2>{post.title}</h2>
                  <p className="fine tag-row">
                    <span className="tag">{post.published ? "On the blog" : post.publishAt ? "Scheduled" : "Draft"}</span>
                    <span className="tag">
                      {post.publishAt && !post.published
                        ? `${easternLabel(post.publishAt)} Eastern`
                        : new Date(post.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
                    </span>
                  </p>
                </div>
                <div className="admin-actions">
                  <Link className="button button-small" href={`/admin/blog/${post.slug}`}>
                    Edit
                  </Link>
                  {post.published ? (
                    <Link className="button button-ghost button-small" href={`/blog/${post.slug}`}>
                      View
                    </Link>
                  ) : null}
                  <DeletePostButton slug={post.slug} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="panel empty-note">No posts yet.</p>
        )}
      </div>
    </section>
  );
}
