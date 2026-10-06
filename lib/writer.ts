import { cleanText } from "./http";

const SYSTEM = [
  "You write emails for Stormi J of Unhinged. Unfiltered. Organized.",
  "Her voice is plain, warm, and direct. Short sentences. She may say shit when it fits the post.",
  "Do not sound like a company, a newsletter, or a marketer.",
  "No hashtags, no emoji, no 'Hey friends', no 'I hope this finds you well'.",
  "Return only JSON with two string fields: subject and body.",
  "The subject is under 80 characters, and the first letter of every word is a capital letter.",
  "The body is plain text. Put a blank line between paragraphs. Keep it under 900 characters.",
  "End the body with Stormi J.",
  "Do not add an unsubscribe line.",
].join(" ");

function geminiKey() {
  return process.env.GEMINI_API_KEY || process.env.Gemini_API_Key || "";
}

export function writerReady() {
  return Boolean(geminiKey());
}

export function plainAnnouncement(title: string, excerpt: string, url: string) {
  const overview = excerpt.trim();
  return {
    subject: cleanText(title, 140) || "A new note",
    body: ["I put a new note up.", overview, url, "Stormi J."].filter(Boolean).join("\n\n"),
  };
}

export async function writeBlogNote(title: string, excerpt: string, body: string, url: string) {
  const plain = plainAnnouncement(title, excerpt, url);
  if (!writerReady()) return { ...plain, source: "plain" as const };

  const instruction = [
    "Write an email announcing that a new blog post is up.",
    "Give a brief overview, not a full recap.",
    `Put this link on its own line, with no other words on that line: ${url}`,
    "",
    `Title: ${title}`,
    excerpt ? `Short line: ${excerpt}` : "",
    "",
    "Post:",
    body.slice(0, 2500),
  ]
    .filter((line) => line !== "")
    .join("\n");

  try {
    const note = await complete(instruction);
    return { subject: note.subject, body: placeLink(note.body, url), source: "ai" as const };
  } catch (error) {
    console.error("Writer error", error instanceof Error ? error.message : "failed");
    return { ...plain, source: "plain" as const };
  }
}

export async function writeCustomNote(request: string) {
  if (!writerReady()) throw new Error("The writer isn’t connected.");
  return complete(`Write an email from this request:\n${request}`);
}

async function complete(instruction: string) {
  const key = geminiKey();
  if (!key) throw new Error("The writer isn’t connected.");

  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: instruction }] }],
        generationConfig: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: "minimal" },
        },
      }),
      signal: AbortSignal.timeout(20000),
    },
  );

  if (!response.ok) {
    throw new Error(`Writer responded ${response.status}`);
  }

  const payload = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
  const note = asNote(text);
  if (!note) throw new Error("The writer returned an empty note.");
  return note;
}

function placeLink(body: string, url: string) {
  const stripped = body
    .split(url)
    .join(" ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return `${stripped}\n\n${url}`;
}

function titleSubject(value: string) {
  return value.replace(/[A-Za-z]+(?:['’][A-Za-z]+)?/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

function asNote(text: string) {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");
  try {
    const parsed = JSON.parse(trimmed) as { subject?: unknown; body?: unknown };
    const subject = titleSubject(cleanText(parsed.subject, 140));
    const body = cleanText(typeof parsed.body === "string" ? parsed.body : "", 4000);
    if (!subject || !body) return null;
    return { subject, body };
  } catch {
    return null;
  }
}
