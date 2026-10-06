import { createHmac, timingSafeEqual } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { cleanEmail } from "./http";

export type PersonSource = "checklist" | "download" | "purchase" | "added";

export type Person = {
  email: string;
  name: string;
  source: PersonSource;
  createdAt: string;
  unsubscribed: boolean;
};

function audiencePath() {
  return path.join(process.cwd(), "data", "audience.json");
}

function secret() {
  return process.env.DOWNLOAD_SECRET || process.env.SESSION_SECRET || "uuo-list";
}

export function unsubscribeToken(email: string) {
  return createHmac("sha256", secret()).update(email.trim().toLowerCase()).digest("base64url");
}

export function unsubscribeLink(email: string, origin: string) {
  const url = new URL("/unsubscribe", origin);
  url.searchParams.set("e", email);
  url.searchParams.set("t", unsubscribeToken(email));
  return url.toString();
}

export function resubscribeLink(email: string, origin: string) {
  const url = new URL("/resubscribe", origin);
  url.searchParams.set("e", email);
  url.searchParams.set("t", unsubscribeToken(email));
  return url.toString();
}

export function validUnsubscribe(email: string, token: string) {
  const clean = cleanEmail(email);
  if (!clean || !token) return false;
  const expected = unsubscribeToken(clean);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function asPerson(value: unknown): Person | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<Person>;
  const email = cleanEmail(raw.email);
  if (!email) return null;
  const source = raw.source;
  return {
    email,
    name: typeof raw.name === "string" ? raw.name.slice(0, 120) : "",
    source: source === "checklist" || source === "download" || source === "purchase" || source === "added" ? source : "added",
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    unsubscribed: Boolean(raw.unsubscribed),
  };
}

async function readStored(): Promise<Person[]> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { get } = await import("@vercel/blob");
      const result = await get("site/audience.json", { access: "public", useCache: false });
      if (result && result.statusCode === 200 && result.stream) {
        return parsePeople(await readStream(result.stream));
      }
    } catch {
      // Fall through to the local file.
    }
  }

  try {
    return parsePeople(await readFile(audiencePath(), "utf8"));
  } catch {
    return [];
  }
}

function parsePeople(text: string) {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(asPerson).filter((person): person is Person => Boolean(person));
  } catch {
    return [];
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

async function writeAudience(people: Person[]) {
  const body = JSON.stringify(people, null, 2);
  let saved = false;

  try {
    await mkdir(path.dirname(audiencePath()), { recursive: true });
    await writeFile(audiencePath(), body, "utf8");
    saved = true;
  } catch {
    // Vercel’s filesystem is read-only.
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      await put("site/audience.json", body, {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      saved = true;
    } catch (error) {
      console.error("Could not store the email list", error);
    }
  }

  return saved;
}

function merge(current: Person[], found: Person[]) {
  const map = new Map(current.map((person) => [person.email, { ...person }]));
  for (const person of found) {
    const existing = map.get(person.email);
    if (!existing) {
      map.set(person.email, person);
      continue;
    }
    if (!existing.name && person.name) existing.name = person.name;
  }
  return [...map.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function harvest(): Promise<Person[]> {
  const found: Person[] = [];

  try {
    const text = await readFile(path.join(process.cwd(), "data", "signups.ndjson"), "utf8");
    for (const line of text.split("\n")) {
      if (!line.trim()) continue;
      try {
        const row = JSON.parse(line) as { type?: string; email?: string; name?: string; createdAt?: string };
        const email = cleanEmail(row.email);
        if (!email) continue;
        const source: PersonSource = row.type === "purchase" ? "purchase" : row.type === "download" ? "download" : "checklist";
        found.push({
          email,
          name: row.name || "",
          source,
          createdAt: row.createdAt || new Date().toISOString(),
          unsubscribed: false,
        });
      } catch {
        // Skip a broken line.
      }
    }
  } catch {
    // No local signup file.
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { get, list } = await import("@vercel/blob");
      const blobs = await list({ prefix: "signups/", limit: 200 });
      for (const blob of blobs.blobs) {
        const result = await get(blob.pathname, { access: "private", useCache: false });
        if (!result || result.statusCode !== 200 || !result.stream) continue;
        try {
          const row = JSON.parse(await readStream(result.stream)) as {
            type?: string;
            email?: string;
            name?: string;
            createdAt?: string;
          };
          const email = cleanEmail(row.email);
          if (!email) continue;
          const source: PersonSource =
            row.type === "purchase" ? "purchase" : row.type === "download" ? "download" : "checklist";
          found.push({
            email,
            name: row.name || "",
            source,
            createdAt: row.createdAt || new Date().toISOString(),
            unsubscribed: false,
          });
        } catch {
          // Skip a broken record.
        }
      }
    } catch (error) {
      console.error("Could not read past signups", error);
    }
  }

  try {
    const { listOrders } = await import("./purchases");
    const orders = await listOrders();
    for (const order of orders) {
      const email = cleanEmail(order.email);
      if (!email) continue;
      found.push({
        email,
        name: order.name || "",
        source: "purchase",
        createdAt: order.createdAt,
        unsubscribed: false,
      });
    }
  } catch {
    // Orders stay optional.
  }

  return found;
}

export async function listPeople() {
  const stored = await readStored();
  const found = await harvest();
  const people = merge(stored, found);
  if (JSON.stringify(people) !== JSON.stringify(stored)) {
    await writeAudience(people);
  }
  return people;
}

export async function addPerson(input: { email: string; name?: string; source: PersonSource }) {
  const email = cleanEmail(input.email);
  if (!email) return false;
  const people = await readStored();
  const existing = people.find((person) => person.email === email);
  if (existing) {
    if (input.name && !existing.name) existing.name = input.name.slice(0, 120);
    existing.unsubscribed = false;
    if (input.source === "purchase") existing.source = "purchase";
  } else {
    people.unshift({
      email,
      name: (input.name || "").slice(0, 120),
      source: input.source,
      createdAt: new Date().toISOString(),
      unsubscribed: false,
    });
  }
  return writeAudience(people);
}

export async function unsubscribe(email: string) {
  const clean = cleanEmail(email);
  if (!clean) return false;
  const people = await readStored();
  const existing = people.find((person) => person.email === clean);
  if (!existing) {
    people.unshift({
      email: clean,
      name: "",
      source: "added",
      createdAt: new Date().toISOString(),
      unsubscribed: true,
    });
  } else {
    existing.unsubscribed = true;
  }
  return writeAudience(people);
}
