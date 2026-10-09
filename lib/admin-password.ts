import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

type PasswordRecord = {
  salt?: string;
  hash?: string;
  updatedAt?: string;
  resetId?: string;
  resetExp?: number;
};

const RESET_MS = 30 * 60 * 1000;

function secret() {
  return process.env.SESSION_SECRET || process.env.DOWNLOAD_SECRET || "uuo-admin-session";
}

function sealKey() {
  return createHash("sha256").update(secret()).digest();
}

function filePath() {
  return path.join(process.cwd(), "data", "admin-password.json");
}

function seal(record: PasswordRecord) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", sealKey(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(record), "utf8"), cipher.final()]);
  return JSON.stringify({
    v: 1,
    iv: iv.toString("base64url"),
    tag: cipher.getAuthTag().toString("base64url"),
    data: data.toString("base64url"),
  });
}

function open(text: string): PasswordRecord | null {
  try {
    const parsed = JSON.parse(text) as { iv?: string; tag?: string; data?: string };
    if (!parsed.iv || !parsed.tag || !parsed.data) return null;
    const decipher = createDecipheriv("aes-256-gcm", sealKey(), Buffer.from(parsed.iv, "base64url"));
    decipher.setAuthTag(Buffer.from(parsed.tag, "base64url"));
    const json = Buffer.concat([
      decipher.update(Buffer.from(parsed.data, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    const record = JSON.parse(json) as PasswordRecord;
    return record && typeof record === "object" ? record : null;
  } catch {
    return null;
  }
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

const passwordVersions = "site/admin-password/";

function versionPath() {
  const ms = String(Date.now()).padStart(16, "0");
  const tick = process.hrtime.bigint().toString().padStart(20, "0");
  return `${passwordVersions}${ms}-${tick}.json`;
}

async function readBlobText(url: string) {
  const { get } = await import("@vercel/blob");
  const result = await get(url, { access: "public" });
  if (result && result.statusCode === 200 && result.stream) return readStream(result.stream);
  return null;
}

async function readRecord(): Promise<PasswordRecord | null> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { list } = await import("@vercel/blob");
      const found = await list({ prefix: passwordVersions, limit: 20 });
      const newest = found.blobs
        .filter((blob) => blob.pathname.endsWith(".json"))
        .sort((a, b) => b.pathname.localeCompare(a.pathname))[0];
      if (newest) {
        const text = await readBlobText(newest.url);
        if (text) return open(text);
      }
    } catch {
      if (process.env.VERCEL) return null;
    }
  }

  try {
    return open(await readFile(filePath(), "utf8"));
  } catch {
    return null;
  }
}

async function writeRecord(record: PasswordRecord) {
  const body = seal(record);
  let saved = false;

  try {
    await mkdir(path.dirname(filePath()), { recursive: true });
    await writeFile(filePath(), body, "utf8");
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
        const found = await list({ prefix: passwordVersions, limit: 20 });
        const extras = found.blobs
          .filter((blob) => blob.pathname !== pathname && blob.pathname.endsWith(".json"))
          .sort((a, b) => b.pathname.localeCompare(a.pathname))
          .slice(1);
        if (extras.length) await del(extras.map((blob) => blob.url));
      } catch {
        // The newest file is already saved.
      }
    } catch (error) {
      console.error("Could not store the admin password", error);
    }
  }

  return saved;
}

function hashPassword(password: string, salt: Buffer) {
  return scryptSync(password, salt, 32);
}

export async function passwordMatches(password: string) {
  const record = await readRecord();
  if (record?.hash && record.salt) {
    const actual = hashPassword(password, Buffer.from(record.salt, "base64url"));
    const expected = Buffer.from(record.hash, "base64url");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  const fallback = process.env.ADMIN_PASSWORD?.trim() || "";
  if (!fallback) return false;
  const a = createHash("sha256").update(password.trim()).digest();
  const b = createHash("sha256").update(fallback).digest();
  return timingSafeEqual(a, b);
}

export async function startPasswordReset() {
  const current = (await readRecord()) || {};
  const resetId = randomBytes(16).toString("base64url");
  const resetExp = Date.now() + RESET_MS;
  const saved = await writeRecord({ ...current, resetId, resetExp });
  if (!saved) return null;

  const payload = Buffer.from(JSON.stringify({ purpose: "admin-reset", resetId, exp: resetExp })).toString("base64url");
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export async function validPasswordReset(token: string) {
  const resetId = resetIdFromToken(token);
  if (!resetId) return false;
  const record = await readRecord();
  return Boolean(record?.resetId && record.resetId === resetId && typeof record.resetExp === "number" && record.resetExp > Date.now());
}

function resetIdFromToken(token: string) {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      purpose?: string;
      resetId?: string;
      exp?: number;
    };
    if (data.purpose !== "admin-reset" || !data.resetId || typeof data.exp !== "number" || data.exp <= Date.now()) return null;
    return data.resetId;
  } catch {
    return null;
  }
}

export async function saveAdminPassword(token: string, password: string) {
  if (!(await validPasswordReset(token))) return false;
  const salt = randomBytes(16);
  const saved = await writeRecord({
    salt: salt.toString("base64url"),
    hash: hashPassword(password, salt).toString("base64url"),
    updatedAt: new Date().toISOString(),
  });
  return saved;
}
