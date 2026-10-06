import { savePostAction } from "@/app/admin/actions";
import { isoToEasternInput } from "@/lib/clock";
import type { Post } from "@/lib/posts";

export function PostForm({ post }: { post?: Post }) {
  return (
    <form className="admin-form" action={savePostAction}>
      {post ? <input type="hidden" name="slug" value={post.slug} /> : null}
      <section className="panel">
        <h2>The post</h2>
        <label className="field">
          <span>Title</span>
          <input name="title" required maxLength={140} defaultValue={post?.title || ""} />
        </label>
        <label className="field">
          <span>Short line</span>
          <input
            name="excerpt"
            maxLength={300}
            defaultValue={post?.excerpt || ""}
            placeholder="Shown on the blog list. Leave blank to use the start of the post."
          />
        </label>
        <label className="field">
          <span>The writing</span>
          <textarea name="body" required maxLength={20000} rows={14} defaultValue={post?.body || ""} />
        </label>
        <p className="fine">Leave a blank line between paragraphs.</p>
        <label className="check">
          <input type="checkbox" name="published" defaultChecked={Boolean(post?.published)} />
          Show it on the blog now
        </label>
        <div className="schedule-row">
          <label className="field">
            <span>Publish date</span>
            <input
              name="publishDate"
              type="date"
              defaultValue={post?.publishAt && !post.published ? isoToEasternInput(post.publishAt).slice(0, 10) : ""}
            />
          </label>
          <label className="field">
            <span>Publish time</span>
            <input
              name="publishTime"
              type="time"
              defaultValue={post?.publishAt && !post.published ? isoToEasternInput(post.publishAt).slice(11, 16) : ""}
            />
          </label>
        </div>
        <p className="fine">
          Leave these empty, and leave the box unchecked, to keep a draft. A date and time puts it up then, Eastern time. Checking the box puts it up right away.
        </p>
      </section>
      <section className="panel">
        <h2>Picture or video</h2>
        <label className="field">
          <span>File</span>
          <input name="image" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" />
        </label>
        <p className="fine">A JPG, PNG, or WebP. Or an MP4, WebM, or MOV under 10 MB.</p>
        <label className="field">
          <span>Description</span>
          <input name="imageAlt" maxLength={180} defaultValue={post?.imageAlt || ""} placeholder="What the picture or video shows" />
        </label>
        {post?.image ? (
          <p className="fine">
            {post.media === "video" ? "A video is already saved." : "A picture is already saved."} Upload a new file only to replace it.
          </p>
        ) : null}
      </section>
      <div className="form-actions">
        <button className="button" type="submit">
          {post ? "Save post" : "Save post"}
        </button>
      </div>
    </form>
  );
}
