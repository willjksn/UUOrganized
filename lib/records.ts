import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { mkdir, appendFile, readFile } from "fs/promises";
import path from "path";

export type SignupRecord = {
  type: "checklist" | "contact" | "download" | "purchase";
  email: string;
  name?: string;
  message?: string;
  product?: string;
  createdAt: string;
};

const secret = () => process.env.DOWNLOAD_SECRET || "uuo-checklist-link";

export function checklistPath() {
  return path.join(process.cwd(), "private", "checklist.pdf");
}

export async function checklistFile() {
  return readFile(checklistPath());
}

export function downloadToken(subject = "") {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 14;
  const payload = subject ? `${subject}.${exp}` : String(exp);
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function validToken(token: string | null, subject = "") {
  if (!token) return false;
  const parts = token.split(".");
  const sig = parts.pop();
  const payload = parts.join(".");
  if (!sig || !payload) return false;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const expText = subject ? (payload.startsWith(`${subject}.`) ? payload.slice(subject.length + 1) : "") : payload;
  const exp = Number(expText);
  return Number.isFinite(exp) && exp > Date.now();
}

export async function saveRecord(record: SignupRecord) {
  let saved = false;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      await put(`signups/${record.createdAt}-${randomUUID()}.json`, JSON.stringify(record), {
        access: "private",
        contentType: "application/json",
      });
      saved = true;
    } catch (error) {
      console.error("Could not store signup in Blob", error);
    }
  }

  try {
    const dir = path.join(process.cwd(), "data");
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, "signups.ndjson"), `${JSON.stringify(record)}\n`, "utf8");
    saved = true;
  } catch {
    // Vercel’s filesystem is read-only. Blob or email is the production store.
  }

  if (!saved) {
    console.info(JSON.stringify({ uuo: "signup", record }));
  }

  return saved;
}
