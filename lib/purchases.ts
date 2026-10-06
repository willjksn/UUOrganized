import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { addPerson } from "./audience";
import { getCatalog, takeOneFromStock } from "./catalog";
import { readDownload } from "./downloads";
import { notifySale, sendPurchase, sendShipment } from "./email";
import { formatPrice } from "./price";
import { downloadToken, saveRecord } from "./records";
import { getCheckoutSession } from "./stripe";
import { site } from "./site";

export type Fulfillment =
  | { state: "paid"; slug: string; name: string; fileName: string; emailed: boolean; ships: boolean }
  | { state: "unpaid" | "missing" | "nofile" | "error" };

export type Purchase = {
  sessionId: string;
  slug: string;
  email: string;
  name: string;
  product: string;
  emailed: boolean;
  createdAt: string;
  ships: boolean;
  amountCents: number;
  shippingCents: number;
  totalCents: number;
  address: string;
  stockAfter: number | null;
};

function safeSession(sessionId: string) {
  return /^cs_[A-Za-z0-9_]+$/.test(sessionId);
}

function localPath(sessionId: string) {
  return path.join(process.cwd(), "data", "purchases", `${sessionId}.json`);
}

function asPurchase(value: Partial<Purchase> | null, sessionId: string): Purchase | null {
  if (!value?.sessionId && !sessionId) return null;
  return {
    sessionId: value?.sessionId || sessionId,
    slug: value?.slug || "",
    email: value?.email || "",
    name: value?.name || "",
    product: value?.product || value?.slug || "Sale",
    emailed: Boolean(value?.emailed),
    createdAt: value?.createdAt || new Date(0).toISOString(),
    ships: Boolean(value?.ships),
    amountCents: Number(value?.amountCents) || 0,
    shippingCents: Number(value?.shippingCents) || 0,
    totalCents: Number(value?.totalCents) || 0,
    address: value?.address || "",
    stockAfter: value?.stockAfter == null ? null : Number(value.stockAfter),
  };
}

async function readPurchase(sessionId: string): Promise<Purchase | null> {
  if (!safeSession(sessionId)) return null;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { get } = await import("@vercel/blob");
      const result = await get(`purchases/${sessionId}.json`, { access: "private", useCache: false });
      if (result && result.statusCode === 200 && result.stream) {
        const reader = result.stream.getReader();
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }
        return asPurchase(JSON.parse(Buffer.concat(chunks).toString("utf8")), sessionId);
      }
    } catch {
      // Fall through to the local file.
    }
  }

  try {
    return asPurchase(JSON.parse(await readFile(localPath(sessionId), "utf8")), sessionId);
  } catch {
    return null;
  }
}

async function writePurchase(purchase: Purchase, exclusive: boolean) {
  let saved = false;
  const body = JSON.stringify(purchase);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      await put(`purchases/${purchase.sessionId}.json`, body, {
        access: "private",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: !exclusive,
      });
      saved = true;
    } catch {
      saved = false;
    }
  }

  if (!process.env.VERCEL) {
    try {
      const target = localPath(purchase.sessionId);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, body, exclusive ? { flag: "wx" } : undefined);
      saved = true;
    } catch {
      if (exclusive) saved = false;
    }
  }

  return saved;
}

export async function listOrders() {
  const byId = new Map<string, Purchase>();

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { list } = await import("@vercel/blob");
      const found = await list({ prefix: "purchases/", limit: 200 });
      for (const blob of found.blobs) {
        const sessionId = blob.pathname.replace(/^purchases\//, "").replace(/\.json$/, "");
        const row = await readPurchase(sessionId);
        if (row) byId.set(row.sessionId, row);
      }
    } catch (error) {
      console.error("Could not list sales", error);
    }
  }

  try {
    const names = await readdir(path.join(process.cwd(), "data", "purchases"));
    for (const name of names) {
      if (!name.endsWith(".json")) continue;
      const row = await readPurchase(name.slice(0, -5));
      if (row) byId.set(row.sessionId, row);
    }
  } catch {
    // No local sales yet.
  }

  return [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function fulfillPaidSession(sessionId: string): Promise<Fulfillment> {
  if (!safeSession(sessionId)) return { state: "missing" };
  const session = await getCheckoutSession(sessionId);
  if (!session) return { state: "error" };
  if (session.paymentStatus !== "paid") return { state: "unpaid" };
  if (!/^[a-z0-9-]+$/.test(session.slug)) return { state: "missing" };

  const catalog = await getCatalog();
  const product = catalog.products.find(
    (item) => item.slug === session.slug && (item.paidDownload || item.ships),
  );
  if (!product) return { state: "missing" };

  const file = product.ships ? Buffer.from("") : await readDownload(product.slug);
  if (!product.ships && !file) {
    const claimed = await writePurchase(blankPurchase(session, product.name, false), true);
    if (claimed) {
      await notifySale(
        "Paid download is missing its file",
        `${session.email || "A buyer"} paid for ${product.name}, and the PDF is not in the store.`,
        session.email || undefined,
      );
    }
    return { state: "nofile" };
  }

  const fileName = product.fileName || `${product.slug}.pdf`;
  const existing = await readPurchase(sessionId);
  if (existing?.emailed) {
    return { state: "paid", slug: product.slug, name: product.name, fileName, emailed: true, ships: product.ships || false };
  }

  const fresh = !existing;
  const readyToRetry = existing ? Date.now() - Date.parse(existing.createdAt) > 20_000 : false;
  if (existing && !readyToRetry) {
    return { state: "paid", slug: product.slug, name: product.name, fileName, emailed: false, ships: Boolean(existing.ships) };
  }

  const purchase = existing || blankPurchase(session, product.name, Boolean(product.ships));
  if (fresh) {
    const claimed = await writePurchase(purchase, true);
    if (!claimed) {
      const winner = await readPurchase(sessionId);
      return {
        state: "paid",
        slug: product.slug,
        name: product.name,
        fileName,
        emailed: Boolean(winner?.emailed),
        ships: Boolean(winner?.ships),
      };
    }
    const stock = await takeOneFromStock(product.slug);
    purchase.stockAfter = stock.tracked ? stock.left : null;
  }

  const downloadUrl = `${site.url}/api/purchase?token=${downloadToken(`buy:${product.slug}`)}&slug=${product.slug}`;
  const emailed = session.email
    ? product.ships
      ? await sendShipment(session.email, product.name, formatPrice(session.totalCents), session.address)
      : await sendPurchase(session.email, product.name, fileName, downloadUrl, file || Buffer.from(""))
    : false;
  await writePurchase({ ...purchase, emailed }, false);
  if (fresh) {
    await saveRecord({
      type: "purchase",
      email: session.email || "unknown",
      product: product.name,
      createdAt: purchase.createdAt,
    });
    if (session.email) {
      await addPerson({ email: session.email, name: session.buyerName, source: "purchase" }).catch(() => undefined);
    }
    await notifySale(
      `Sale: ${product.name}`,
      [
        `${session.buyerName || "A buyer"} (${session.email || "no email"}) bought ${product.name}.`,
        `Item: ${formatPrice(session.amountCents)}`,
        `Shipping: ${formatPrice(session.shippingCents)}`,
        `Total: ${formatPrice(session.totalCents)}`,
        purchase.stockAfter == null ? "Number for sale: not tracked" : `Number left: ${purchase.stockAfter}`,
        session.address ? `Ship to:\n${session.address}` : "No shipping address. This was a download.",
      ].join("\n"),
      session.email || undefined,
    );
  }

  return { state: "paid", slug: product.slug, name: product.name, fileName, emailed, ships: Boolean(product.ships) };
}

function blankPurchase(
  session: {
    id: string;
    slug: string;
    email: string;
    buyerName: string;
    address: string;
    amountCents: number;
    shippingCents: number;
    totalCents: number;
  },
  productName: string,
  ships: boolean,
): Purchase {
  return {
    sessionId: session.id,
    slug: session.slug,
    email: session.email,
    name: session.buyerName,
    product: productName,
    emailed: false,
    createdAt: new Date().toISOString(),
    ships,
    amountCents: session.amountCents,
    shippingCents: session.shippingCents,
    totalCents: session.totalCents,
    address: session.address,
    stockAfter: null,
  };
}
