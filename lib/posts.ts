import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { queuePostAnnouncement } from "./announce";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  image: string;
  imageAlt: string;
  media: "image" | "video";
  width: number;
  height: number;
  published: boolean;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function postsPath() {
  return path.join(process.cwd(), "data", "posts.json");
}

function asPost(value: unknown): Post | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<Post>;
  if (typeof raw.slug !== "string" || typeof raw.title !== "string") return null;
  return {
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt || "",
    body: raw.body || "",
    image: raw.image || "",
    imageAlt: raw.imageAlt || "",
    media: raw.media === "video" ? "video" : "image",
    width: raw.width || 1200,
    height: raw.height || 1200,
    published: Boolean(raw.published),
    publishAt: typeof raw.publishAt === "string" && raw.publishAt ? raw.publishAt : null,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString(),
  };
}

async function readStream(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function parsePosts(text: string) {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(asPost).filter((post): post is Post => Boolean(post));
  } catch {
    return [];
  }
}

const postVersions = "site/posts/";

function versionPath() {
  const ms = String(Date.now()).padStart(16, "0");
  const tick = process.hrtime.bigint().toString().padStart(20, "0");
  return `${postVersions}${ms}-${tick}.json`;
}

function newestFirst(pathA: string, pathB: string) {
  return pathB.localeCompare(pathA);
}

async function readBlob(url: string) {
  const { get } = await import("@vercel/blob");
  const result = await get(url, { access: "public" });
  if (result && result.statusCode === 200 && result.stream) return parsePosts(await readStream(result.stream));
  return null;
}

async function blobPosts() {
  const { list } = await import("@vercel/blob");
  const found = await list({ prefix: postVersions, limit: 100 });
  const versions = found.blobs
    .filter((blob) => blob.pathname.endsWith(".json"))
    .sort((a, b) => newestFirst(a.pathname, b.pathname));
  if (versions[0]) {
    const posts = await readBlob(versions[0].url);
    if (posts) return posts;
    throw new Error("The posts could not be read.");
  }

  const legacy = await readBlob("site/posts.json");
  return legacy || [];
}

async function loadPosts(): Promise<Post[]> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      return await blobPosts();
    } catch (error) {
      if (process.env.VERCEL) throw error;
    }
  }

  try {
    return parsePosts(await readFile(postsPath(), "utf8"));
  } catch {
    return [];
  }
}

async function releaseDuePosts(posts: Post[]) {
  const now = Date.now();
  const due = posts.filter((post) => {
    if (post.published || !post.publishAt) return false;
    const when = new Date(post.publishAt).getTime();
    return !Number.isNaN(when) && when <= now;
  });
  if (!due.length) return posts;

  const stamp = new Date().toISOString();
  const dueSlugs = new Set(due.map((post) => post.slug));
  const next = posts.map((post) =>
    dueSlugs.has(post.slug) ? { ...post, published: true, publishAt: null, updatedAt: stamp } : post,
  );

  try {
    await writePosts(next);
  } catch (error) {
    console.error("Could not publish a scheduled post", error instanceof Error ? error.message : "failed");
    return posts;
  }

  for (const post of next) {
    if (!dueSlugs.has(post.slug)) continue;
    try {
      await queuePostAnnouncement(post);
    } catch (error) {
      console.error("Could not queue the announcement", error instanceof Error ? error.message : "failed");
    }
  }

  return next;
}

export async function readPosts(): Promise<Post[]> {
  return releaseDuePosts(await loadPosts());
}

export async function deletePost(slug: string) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const posts = await readPosts();
    if (!posts.some((post) => post.slug === slug)) return;
    await writePosts(posts.filter((post) => post.slug !== slug));
    const after = await readPosts();
    if (!after.some((post) => post.slug === slug)) return;
  }
  throw new Error("The post is still there.");
}

export async function writePosts(posts: Post[]) {
  const body = JSON.stringify(posts, null, 2);
  let saved = false;

  try {
    await mkdir(path.dirname(postsPath()), { recursive: true });
    await writeFile(postsPath(), body, "utf8");
    saved = true;
  } catch {
    // Vercel’s filesystem is read-only.
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put, list, del } = await import("@vercel/blob");
      const pathname = versionPath();
      await put(pathname, body, {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      saved = true;
      try {
        const found = await list({ prefix: postVersions, limit: 100 });
        const extras = found.blobs
          .filter((blob) => blob.pathname !== pathname)
          .sort((a, b) => newestFirst(a.pathname, b.pathname))
          .slice(4);
        if (extras.length) await del(extras.map((blob) => blob.url));
      } catch {
        // An older copy can stay. The newest file is the list.
      }
    } catch (error) {
      console.error("Could not store posts", error);
    }
  }

  if (!saved) throw new Error("The post could not be saved.");
}

export function publishedPosts(posts: Post[]) {
  return posts.filter((post) => post.published).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function slugify(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "note";
}
