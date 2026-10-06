import { cache } from "react";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import bundledCatalog from "../data/catalog.json";
import { fillCopy, defaultCopy, type SiteCopy } from "./copy";
import { products as seedProducts, type Product } from "./products";
import { site, socialPlatforms, type SocialName } from "./site";

export type SocialLink = {
  name: SocialName;
  href: string;
};

export type ShopLinks = {
  amazon: string;
  etsy: string;
};

export type Catalog = {
  products: Product[];
  socials: SocialLink[];
  shops: ShopLinks;
  copy: SiteCopy;
};

export class CatalogError extends Error {}

function catalogPath() {
  return path.join(process.cwd(), "data", "catalog.json");
}

function defaultCatalog(): Catalog {
  return {
    products: seedProducts.map((product) => ({ ...product })),
    socials: socialPlatforms.map((name) => ({ name, href: "" })),
    shops: { amazon: site.amazon, etsy: site.etsy },
    copy: defaultCopy(),
  };
}

function shopLink(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  try {
    const url = new URL(value.trim());
    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
  } catch {
    return fallback;
  }
  return fallback;
}

function isSocialName(value: string): value is SocialName {
  return (socialPlatforms as readonly string[]).includes(value);
}

function normalize(value: unknown): Catalog {
  const fallback = defaultCatalog();
  if (!value || typeof value !== "object") return fallback;
  const raw = value as { products?: unknown; socials?: unknown; shops?: unknown; copy?: unknown };
  const savedShops = raw.shops && typeof raw.shops === "object" ? (raw.shops as { amazon?: unknown; etsy?: unknown }) : {};
  const products = Array.isArray(raw.products)
    ? raw.products.filter(isProduct).map(fillProduct)
    : fallback.products;
  const saved = new Map<SocialName, string>();
  if (Array.isArray(raw.socials)) {
    for (const item of raw.socials) {
      if (!item || typeof item !== "object") continue;
      const name = String((item as { name?: unknown }).name || "");
      const href = String((item as { href?: unknown }).href || "");
      if (isSocialName(name)) saved.set(name, href);
    }
  }
  return {
    products: products.length ? products : fallback.products,
    socials: socialPlatforms.map((name) => ({ name, href: saved.get(name) || "" })),
    shops: {
      amazon: shopLink(savedShops.amazon, fallback.shops.amazon),
      etsy: shopLink(savedShops.etsy, fallback.shops.etsy),
    },
    copy: fillCopy(raw.copy),
  };
}

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const product = value as Partial<Product>;
  return typeof product.slug === "string" && typeof product.name === "string";
}

function fillProduct(product: Product): Product {
  return {
    slug: product.slug,
    name: product.name,
    eyebrow: product.eyebrow || "",
    summary: product.summary || "",
    details: product.details || "",
    priceLabel: product.priceLabel || "",
    cta: product.cta || "Buy",
    href: product.href || (product.freeDownload || product.paidDownload || product.ships ? "" : "/"),
    external: Boolean(product.external),
    image: product.image || "/images/book-cover.jpg",
    imageAlt: product.imageAlt || product.name,
    width: product.width || 1200,
    height: product.height || 1200,
    featured: Boolean(product.featured),
    feature: Boolean(product.feature),
    backImage: product.backImage,
    backImageAlt: product.backImageAlt,
    backWidth: product.backWidth,
    backHeight: product.backHeight,
    freeDownload: Boolean(product.freeDownload) && !product.ships && !product.paidDownload,
    paidDownload: Boolean(product.paidDownload) && !product.ships,
    ships: Boolean(product.ships),
    stock: storedStock(product),
    shippingCents: product.ships ? storedCents(product.shippingCents, true) : 0,
    shippingIntlCents: product.ships ? storedIntl(product.shippingIntlCents) : null,
    priceCents: paidCents(product),
    fileName: product.fileName || "",
  };
}

function storedCents(value: unknown, allowZero: boolean) {
  const cents = Number(value);
  const minimum = allowZero ? 0 : 50;
  if (!Number.isInteger(cents) || cents < minimum || cents > 99_999_999) return 0;
  return cents;
}

function storedIntl(value: unknown) {
  if (value == null || value === "") return null;
  const cents = Number(value);
  if (!Number.isInteger(cents) || cents < 0 || cents > 99_999_999) return null;
  return cents;
}

function storedStock(product: Product) {
  if (!product.paidDownload && !product.ships) return null;
  if (product.stock == null || product.stock === ("" as unknown)) return null;
  const stock = Number(product.stock);
  if (!Number.isInteger(stock) || stock < 0) return null;
  return stock;
}

function paidCents(product: Product) {
  if (!product.paidDownload && !product.ships) return 0;
  return storedCents(product.priceCents, false);
}

async function readBlobCatalog() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const { get } = await import("@vercel/blob");
    const result = await get("site/catalog.json", { access: "public", useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const reader = result.stream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    return normalize(JSON.parse(Buffer.concat(chunks).toString("utf8")));
  } catch {
    return null;
  }
}

async function readCatalog(): Promise<Catalog> {
  if (process.env.BLOB_READ_WRITE_TOKEN && process.env.VERCEL) {
    const fromBlob = await readBlobCatalog();
    if (fromBlob) return fromBlob;
  }

  try {
    return normalize(JSON.parse(await readFile(catalogPath(), "utf8")));
  } catch {
    return normalize(bundledCatalog);
  }
}

export const getCatalog = cache(readCatalog);

export async function takeOneFromStock(slug: string) {
  const catalog = await readCatalog();
  const product = catalog.products.find((item) => item.slug === slug);
  if (!product || product.stock == null) return { tracked: false, left: null, oversold: false };
  if (product.stock <= 0) return { tracked: true, left: 0, oversold: true };
  product.stock -= 1;
  await writeCatalog(catalog);
  return { tracked: true, left: product.stock, oversold: false };
}

export async function writeCatalog(catalog: Catalog) {
  const body = JSON.stringify(catalog, null, 2);
  let saved = false;

  try {
    await mkdir(path.dirname(catalogPath()), { recursive: true });
    await writeFile(catalogPath(), body, "utf8");
    saved = true;
  } catch {
    // The Vercel filesystem is read-only. Blob keeps the catalog there.
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      await put("site/catalog.json", body, {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      saved = true;
    } catch (error) {
      console.error("Could not store catalog in Blob", error);
    }
  }

  if (!saved) {
    throw new CatalogError("The catalog could not be saved. On Vercel, connect a Blob store.");
  }
}

export function imageSize(buffer: Buffer) {
  if (buffer.length > 24 && buffer[0] === 0x89 && buffer[1] === 0x50) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
        return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      offset += 2 + length;
    }
  }

  return { width: 1200, height: 1200 };
}

const imageTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function saveImage(file: File, slug: string) {
  if (!imageTypes[file.type]) {
    throw new CatalogError("Use a JPG, PNG, or WebP picture.");
  }
  if (file.size > 6_000_000) {
    throw new CatalogError("Pictures need to be under 6 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const size = imageSize(buffer);
  const filename = `${slug}-${Date.now()}.${imageTypes[file.type]}`;

  if (process.env.VERCEL && process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`products/${filename}`, buffer, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return { src: blob.url, ...size };
  }

  try {
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
    return { src: `/uploads/${filename}`, ...size };
  } catch {
    throw new CatalogError("The picture could not be saved. On Vercel, connect a Blob store.");
  }
}

const letterMediaTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export async function savePostMedia(file: File, slug: string) {
  const kind = mediaKind(file);
  if (!kind) throw new CatalogError("Use a JPG, PNG, WebP, MP4, WebM, or MOV.");
  if (file.size > (kind.video ? 10_000_000 : 6_000_000)) {
    throw new CatalogError(kind.video ? "Videos need to be under 10 MB." : "Pictures need to be under 6 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const size = kind.video ? { width: 1280, height: 720 } : imageSize(buffer);
  const filename = `${slug}-${Date.now()}.${kind.ext}`;
  const type = file.type || (kind.video ? `video/${kind.ext === "mov" ? "quicktime" : kind.ext}` : `image/${kind.ext === "jpg" ? "jpeg" : kind.ext}`);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(`blog/${filename}`, buffer, {
        access: "public",
        contentType: type,
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return { src: blob.url, ...size, media: kind.video ? ("video" as const) : ("image" as const) };
    } catch (error) {
      console.error("Could not store the blog file", error instanceof Error ? error.message : "failed");
      if (process.env.VERCEL) {
        throw new CatalogError("That file could not be saved. On Vercel, connect a Blob store.");
      }
    }
  }

  try {
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
    return { src: `/uploads/${filename}`, ...size, media: kind.video ? ("video" as const) : ("image" as const) };
  } catch {
    throw new CatalogError("That file could not be saved. On Vercel, connect a Blob store.");
  }
}

function mediaKind(file: File) {
  const fromType = letterMediaTypes[file.type];
  if (fromType) return { ext: fromType, video: file.type.startsWith("video/") };
  const name = file.name.toLowerCase();
  if (name.endsWith(".mp4")) return { ext: "mp4", video: true };
  if (name.endsWith(".webm")) return { ext: "webm", video: true };
  if (name.endsWith(".mov")) return { ext: "mov", video: true };
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return { ext: "jpg", video: false };
  if (name.endsWith(".png")) return { ext: "png", video: false };
  if (name.endsWith(".webp")) return { ext: "webp", video: false };
  return null;
}

export async function saveLetterMedia(file: File) {
  const ext = letterMediaTypes[file.type];
  if (!ext) throw new CatalogError("Use a JPG, PNG, WebP, MP4, or WebM.");
  const video = file.type.startsWith("video/");
  if (file.size > (video ? 10_000_000 : 6_000_000)) {
    throw new CatalogError(video ? "Videos need to be under 10 MB." : "Pictures need to be under 6 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `note-${Date.now()}.${ext}`;

  if (process.env.VERCEL && process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`letters/${filename}`, buffer, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return { src: blob.url, kind: video ? ("video" as const) : ("image" as const) };
  }

  try {
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
    return { src: `/uploads/${filename}`, kind: video ? ("video" as const) : ("image" as const) };
  } catch {
    throw new CatalogError("That file could not be saved. On Vercel, connect a Blob store.");
  }
}

export function publicSocials(catalog: Catalog) {
  return catalog.socials.filter((social) => social.href.startsWith("http"));
}
