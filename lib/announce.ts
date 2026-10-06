import { draftForPost, saveDraft } from "./drafts";

export async function queuePostAnnouncement(post: { slug: string; title: string }) {
  if (await draftForPost(post.slug)) return false;
  await saveDraft({
    id: `blog-${post.slug}`,
    postSlug: post.slug,
    postTitle: post.title,
    subject: "",
    body: "",
    source: "plain",
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  return true;
}
