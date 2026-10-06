import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type DraftStatus = "pending" | "sent" | "skipped";

export type MailDraft = {
  id: string;
  postSlug: string;
  postTitle: string;
  subject: string;
  body: string;
  source: "ai" | "plain";
  status: DraftStatus;
  createdAt: string;
};

function draftsPath() {
  return path.join(process.cwd(), "data", "drafts.json");
}

function asDraft(value: unknown): MailDraft | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<MailDraft>;
  if (typeof raw.id !== "string" || typeof raw.postSlug !== "string") return null;
  const status = raw.status === "sent" || raw.status === "skipped" ? raw.status : "pending";
  return {
    id: raw.id,
    postSlug: raw.postSlug,
    postTitle: typeof raw.postTitle === "string" ? raw.postTitle : "",
    subject: typeof raw.subject === "string" ? raw.subject : "",
    body: typeof raw.body === "string" ? raw.body : "",
    source: raw.source === "plain" ? "plain" : "ai",
    status,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
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

function parseDrafts(text: string) {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(asDraft).filter((draft): draft is MailDraft => Boolean(draft));
  } catch {
    return [];
  }
}

export async function readDrafts(): Promise<MailDraft[]> {
  if (process.env.BLOB_READ_WRITE_TOKEN && process.env.VERCEL) {
    try {
      const { get } = await import("@vercel/blob");
      const result = await get("site/drafts.json", { access: "public", useCache: false });
      if (result && result.statusCode === 200 && result.stream) {
        return parseDrafts(await readStream(result.stream));
      }
    } catch {
      // Fall through to the local file.
    }
  }

  try {
    return parseDrafts(await readFile(draftsPath(), "utf8"));
  } catch {
    return [];
  }
}

async function writeDrafts(drafts: MailDraft[]) {
  const body = JSON.stringify(drafts, null, 2);
  let saved = false;

  try {
    await mkdir(path.dirname(draftsPath()), { recursive: true });
    await writeFile(draftsPath(), body, "utf8");
    saved = true;
  } catch {
    // Vercel’s filesystem is read-only.
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      await put("site/drafts.json", body, {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      saved = true;
    } catch (error) {
      console.error("Could not store drafts", error);
    }
  }

  if (!saved) throw new Error("The announcement could not be saved.");
}

export async function draftForPost(slug: string) {
  const drafts = await readDrafts();
  return drafts.find((draft) => draft.postSlug === slug) || null;
}

export async function listPending() {
  const drafts = await readDrafts();
  return drafts.filter((draft) => draft.status === "pending");
}

export async function saveDraft(draft: MailDraft) {
  const drafts = await readDrafts();
  const next = drafts.some((item) => item.id === draft.id)
    ? drafts.map((item) => (item.id === draft.id ? draft : item))
    : [draft, ...drafts];
  await writeDrafts(next);
}

export async function markDraft(id: string, status: DraftStatus) {
  const drafts = await readDrafts();
  await writeDrafts(drafts.map((draft) => (draft.id === id ? { ...draft, status } : draft)));
}
