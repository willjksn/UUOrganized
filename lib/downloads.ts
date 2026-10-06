import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { CatalogError } from "./catalog";

const MAX_BYTES = 10 * 1024 * 1024;

export function downloadPath(slug: string) {
  return `downloads/${slug}.pdf`;
}

function localPath(slug: string) {
  return path.join(process.cwd(), "private", "downloads", `${slug}.pdf`);
}

export function safeDownloadName(name: string, slug: string) {
  const base = name.replace(/\.pdf$/i, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  return `${(base || slug).slice(0, 80)}.pdf`;
}

export async function saveDownload(slug: string, file: File) {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new CatalogError("That product name can’t be saved.");
  if (file.size > MAX_BYTES) throw new CatalogError("That PDF is over 10 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const looksPdf =
    (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) &&
    bytes.subarray(0, 5).toString("utf8") === "%PDF-";
  if (!looksPdf) throw new CatalogError("The download needs to be a PDF.");

  const fileName = safeDownloadName(file.name, slug);
  let saved = false;

  if (!process.env.VERCEL) {
    const target = localPath(slug);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, bytes);
    saved = true;
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      await put(downloadPath(slug), bytes, {
        access: "private",
        contentType: "application/pdf",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      saved = true;
    } catch (error) {
      console.error("Could not store the PDF in Blob", error);
    }
  }

  if (!saved) {
    throw new CatalogError("The PDF could not be saved. On the live site, the Blob store has to be connected.");
  }

  return fileName;
}

export async function readDownload(slug: string) {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { get } = await import("@vercel/blob");
      const result = await get(downloadPath(slug), { access: "private", useCache: false });
      if (result && result.statusCode === 200 && result.stream) {
        const reader = result.stream.getReader();
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }
        return Buffer.concat(chunks);
      }
    } catch {
      // Fall through to the local file for development.
    }
  }

  try {
    return await readFile(localPath(slug));
  } catch {
    return null;
  }
}
