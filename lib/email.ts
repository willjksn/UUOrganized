import { resubscribeLink } from "./audience";
import { checklistFile } from "./records";
import { site } from "./site";

export function resendReady() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
}

async function send(payload: Record<string, unknown>) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error("Resend error", response.status, await response.text());
    return false;
  }

  return true;
}

export async function sendChecklist(to: string, downloadUrl: string) {
  const from = process.env.RESEND_FROM || `Stormi J <${site.email}>`;
  const pdf = await checklistFile();

  return send({
    from,
    to,
    reply_to: site.email,
    subject: "Your First 48 Hours checklist",
    text: [
      "From Stormi J.",
      "",
      "Your First 48 Hours Home checklist is attached.",
      "",
      "You do not have to solve everything today. Start here, write it down, and handle one damn thing at a time.",
      "",
      `You can also download it here: ${downloadUrl}`,
      "",
      "Stormi J.",
      site.url,
    ].join("\n"),
    html: `
      <div style="background:#f7f4ef;padding:32px;color:#231d14;font-family:Georgia,serif;">
        <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">Stormi J.</p>
        <h1 style="font-weight:500;font-size:32px;line-height:1.1;margin:0 0 16px;">Your First 48 Hours checklist</h1>
        <p style="font-size:18px;line-height:1.5;">You do not have to solve everything today. Start here, write it down, and handle one damn thing at a time.</p>
        <p><a href="${downloadUrl}" style="color:#8c4f4f;">Download the checklist</a></p>
        <p>The file is attached too.</p>
        <p style="margin-top:28px;">Stormi J.</p>
      </div>
    `,
    attachments: [
      {
        filename: "UUO-First-48-Hours-Home-Checklist.pdf",
        content: pdf.toString("base64"),
      },
    ],
  });
}

export async function sendDownload(to: string, name: string, fileName: string, downloadUrl: string, pdf: Buffer) {
  const from = process.env.RESEND_FROM || `Stormi J <${site.email}>`;

  return send({
    from,
    to,
    reply_to: site.email,
    subject: `Your ${name}`,
    text: [
      "From Stormi J.",
      "",
      `${name} is attached.`,
      "",
      `You can also download it here: ${downloadUrl}`,
      "",
      "Stormi J.",
      site.url,
    ].join("\n"),
    html: `
      <div style="background:#f7f4ef;padding:32px;color:#231d14;font-family:Georgia,serif;">
        <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">Stormi J.</p>
        <h1 style="font-weight:500;font-size:32px;line-height:1.1;margin:0 0 16px;">Your ${escapeHtml(name)}</h1>
        <p style="font-size:18px;line-height:1.5;">The file is attached. You can also download it from the button below.</p>
        <p><a href="${downloadUrl}" style="color:#8c4f4f;">Download ${escapeHtml(name)}</a></p>
        <p style="margin-top:28px;">Stormi J.</p>
      </div>
    `,
    attachments: [
      {
        filename: fileName,
        content: pdf.toString("base64"),
      },
    ],
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPurchase(to: string, name: string, fileName: string, downloadUrl: string, pdf: Buffer) {
  const from = process.env.RESEND_FROM || `Stormi J <${site.email}>`;

  return send({
    from,
    to,
    reply_to: site.email,
    subject: `Your ${name}`,
    text: [
      "From Stormi J.",
      "",
      `You bought ${name}. The file is attached.`,
      "",
      `You can also download it here: ${downloadUrl}`,
      "",
      "Stormi J.",
      site.url,
    ].join("\n"),
    html: `
      <div style="background:#f7f4ef;padding:32px;color:#231d14;font-family:Georgia,serif;">
        <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">Stormi J.</p>
        <h1 style="font-weight:500;font-size:32px;line-height:1.1;margin:0 0 16px;">Your ${escapeHtml(name)}</h1>
        <p style="font-size:18px;line-height:1.5;">You bought this. The file is attached, and the button downloads it again.</p>
        <p><a href="${downloadUrl}" style="color:#8c4f4f;">Download ${escapeHtml(name)}</a></p>
        <p style="margin-top:28px;">Stormi J.</p>
      </div>
    `,
    attachments: [
      {
        filename: fileName,
        content: pdf.toString("base64"),
      },
    ],
  });
}

export async function sendShipment(to: string, productName: string, total: string, address: string) {
  const from = process.env.RESEND_FROM || `Stormi J <${site.email}>`;
  const where = address || "the address from checkout";

  return send({
    from,
    to,
    reply_to: site.email,
    subject: `Your ${productName} is paid`,
    text: [
      "From Stormi J.",
      "",
      `You bought ${productName}.`,
      `Total paid: ${total}.`,
      "",
      "It will ship to:",
      where,
      "",
      "Stormi J.",
      site.url,
    ].join("\n"),
    html: `
      <div style="background:#f7f4ef;padding:32px;color:#231d14;font-family:Georgia,serif;">
        <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">Stormi J.</p>
        <h1 style="font-weight:500;font-size:32px;line-height:1.1;margin:0 0 16px;">Your ${escapeHtml(productName)} is paid</h1>
        <p style="font-size:18px;line-height:1.5;">Total paid: ${escapeHtml(total)}.</p>
        <p style="white-space:pre-line;">It will ship to:<br>${escapeHtml(where)}</p>
        <p style="margin-top:28px;">Stormi J.</p>
      </div>
    `,
  });
}

export async function sendAdminReset(to: string, resetUrl: string) {
  const from = process.env.RESEND_FROM || `Stormi J <${site.email}>`;
  return send({
    from,
    to,
    subject: "Reset Your Admin Password",
    text: [
      "A password reset was requested for the UU Organized admin.",
      "",
      "This link works for 30 minutes:",
      resetUrl,
      "",
      "If you didn’t ask for this, ignore it. The current password stays as it is.",
    ].join("\n"),
  });
}

export async function sendUnsubscribed(to: string) {
  const from = process.env.RESEND_FROM || `Stormi J <${site.email}>`;
  const back = resubscribeLink(to, site.url);
  return send({
    from,
    to,
    reply_to: site.email,
    subject: "You’re Off The List",
    text: [
      "You’re off the list.",
      "",
      "I won't send notes to this address.",
      "",
      `If you change your mind, you can get back on: ${back}`,
      "",
      "Stormi J.",
    ].join("\n"),
    html: `
      <div style="background:#f7f4ef;padding:32px;color:#231d14;font-family:Georgia,serif;">
        <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">Stormi J.</p>
        <h1 style="font-weight:500;font-size:32px;line-height:1.1;margin:0 0 16px;">You’re off the list.</h1>
        <p style="font-size:18px;line-height:1.5;">I won't send notes to this address.</p>
        <p style="font-size:18px;line-height:1.5;">If you change your mind, you can get back on.</p>
        <p><a href="${escapeHtml(back)}" style="color:#8c4f4f;">Put me back on the list</a></p>
        <p style="margin-top:28px;">Stormi J.</p>
      </div>
    `,
  });
}

export async function notifySale(subject: string, text: string, replyTo?: string) {
  const from = process.env.RESEND_FROM || `Stormi J <${site.email}>`;
  const to = process.env.ADMIN_EMAIL || site.email;
  return send({
    from,
    to,
    reply_to: replyTo || site.email,
    subject,
    text,
  });
}

export type LetterMedia = { kind: "image" | "video"; url: string };

export async function sendLetters(
  recipients: { email: string }[],
  subject: string,
  body: string,
  unsubscribeUrl: (email: string) => string,
  media?: LetterMedia | null,
) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || `Stormi J <${site.email}>`;
  if (!key || !process.env.RESEND_FROM) return { sent: 0, failed: recipients.length };

  let sent = 0;
  let failed = 0;
  for (let index = 0; index < recipients.length; index += 50) {
    const chunk = recipients.slice(index, index + 50);
    const response = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        chunk.map((person) => {
          const leave = unsubscribeUrl(person.email);
          return {
            from,
            to: [person.email],
            reply_to: site.email,
            subject,
            text: `${letterText(body, media)}\n\n—\nYou’re on the list at ${site.url}.\nUnsubscribe: ${leave}`,
            html: letterHtml(body, leave, media),
          };
        }),
      ),
    });
    if (response.ok) sent += chunk.length;
    else {
      failed += chunk.length;
      console.error("Resend batch error", response.status, await response.text());
    }
  }

  return { sent, failed };
}

function letterText(body: string, media?: LetterMedia | null) {
  const extra = !media ? "" : media.kind === "video" ? `\n\nWatch: ${media.url}` : `\n\nPicture: ${media.url}`;
  return `${body.trim()}${extra}`;
}

function letterHtml(body: string, leave: string, media?: LetterMedia | null) {
  const blocks = body
    .trim()
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const onlyUrl = part.match(/^(https?:\/\/\S+)$/);
      if (onlyUrl) {
        return `<p style="font-size:18px;line-height:1.5;"><a href="${escapeHtml(onlyUrl[1])}" style="color:#8c4f4f;text-decoration:underline;">Read the note</a></p>`;
      }
      return `<p style="font-size:18px;line-height:1.5;">${linkify(escapeHtml(part)).replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
  const picture = media
    ? media.kind === "image"
      ? `<p><img src="${escapeHtml(media.url)}" alt="" style="max-width:100%;height:auto;border-radius:12px;"></p>`
      : `<p><a href="${escapeHtml(media.url)}" style="color:#8c4f4f;">Watch the video</a></p>`
    : "";

  return `
    <div style="background:#f7f4ef;padding:32px;color:#231d14;font-family:Georgia,serif;">
      <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">Stormi J.</p>
      ${blocks}
      ${picture}
      <p style="margin-top:28px;font-family:Arial,sans-serif;font-size:13px;color:#5e564e;">
        You’re on the list at ${escapeHtml(site.url)}.<br>
        <a href="${escapeHtml(leave)}" style="color:#8c4f4f;">Unsubscribe</a>
      </p>
    </div>
  `;
}

function linkify(value: string) {
  return value.replace(/https?:\/\/[^\s<]+/g, (url) => {
    const clean = url.replace(/[),.;]+$/, "");
    const tail = url.slice(clean.length);
    return `<a href="${clean}" style="color:#8c4f4f;text-decoration:underline;">${clean}</a>${tail}`;
  });
}

export async function notifyOwner(subject: string, text: string, replyTo?: string) {
  const from = process.env.RESEND_FROM || `Stormi J <${site.email}>`;
  return send({
    from,
    to: site.email,
    reply_to: replyTo || site.email,
    subject,
    text,
  });
}
