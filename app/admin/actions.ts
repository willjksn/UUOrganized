"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  adminConfigured,
  checkLogin,
  createSession,
  isAdmin,
  sessionCookieOptions,
} from "@/lib/auth";
import { addPerson, listPeople, unsubscribeLink } from "@/lib/audience";
import { queuePostAnnouncement } from "@/lib/announce";
import { easternInputToIso } from "@/lib/clock";
import { markDraft, readDrafts, saveDraft } from "@/lib/drafts";
import { CatalogError, getCatalog, saveImage, saveLetterMedia, savePostMedia, writeCatalog, type Catalog } from "@/lib/catalog";
import { cleanLink } from "@/lib/copy";
import { saveDownload } from "@/lib/downloads";
import { resendReady, sendLetters } from "@/lib/email";
import { cleanEmail, cleanText, tooMany } from "@/lib/http";
import { deletePost, readPosts, slugify as postSlug, writePosts, type Post } from "@/lib/posts";
import { formatPrice, priceToCents, stockCount } from "@/lib/price";
import type { Product } from "@/lib/products";
import { site, socialPlatforms, type SocialName } from "@/lib/site";
import { writeBlogNote, writeCustomNote, writerReady } from "@/lib/writer";

async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

function refresh() {
  revalidatePath("/", "layout");
}

function cleanHref(value: string) {
  const href = value.trim();
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  try {
    const url = new URL(href);
    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
  } catch {
    return null;
  }
  return null;
}

function slugify(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return slug || "product";
}

function uniqueSlug(name: string, products: Product[]) {
  const base = slugify(name);
  let slug = base;
  let count = 2;
  while (products.some((product) => product.slug === slug)) {
    slug = `${base}-${count}`;
    count += 1;
  }
  return slug;
}

async function changeCatalog(mutator: (catalog: Catalog) => Promise<Catalog> | Catalog) {
  const current = await getCatalog();
  const next = await mutator({
    products: current.products.map((product) => ({ ...product })),
    socials: current.socials.map((social) => ({ ...social })),
    shops: { ...current.shops },
    copy: { ...current.copy, principles: [...current.copy.principles] as typeof current.copy.principles },
  });
  await writeCatalog(next);
  refresh();
}

export async function loginAction(formData: FormData) {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (tooMany(`login:${ip}`, 8)) redirect("/admin/login?error=rate");
  if (!adminConfigured()) redirect("/admin/login?error=setup");

  const email = cleanText(formData.get("email"), 254);
  const password = cleanText(formData.get("password"), 200);
  if (!checkLogin(email, password)) redirect("/admin/login?error=1");

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, createSession(), sessionCookieOptions());
  redirect("/admin");
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin();
  const name = cleanText(formData.get("name"), 140);
  const summary = cleanText(formData.get("summary"), 500);
  const offer = cleanText(formData.get("offer"), 10);
  const freeDownload = offer === "free" || (!offer && formData.get("freeDownload") === "on");
  const paidDownload = offer === "paid";
  const ships = offer === "ship";
  const href = cleanHref(cleanText(formData.get("href"), 2000)) || "";
  const enteredPrice = cleanText(formData.get("priceLabel"), 80);
  const cents = priceToCents(enteredPrice);
  const stock = stockCount(cleanText(formData.get("stock"), 12));
  const shippingCents = priceToCents(cleanText(formData.get("shipping"), 40), true);
  const shippingIntlRaw = cleanText(formData.get("shippingIntl"), 40);
  const shippingIntlCents = shippingIntlRaw ? priceToCents(shippingIntlRaw, true) : null;
  const existingSlug = cleanText(formData.get("slug"), 80);
  const back = existingSlug ? `/admin/products/${existingSlug}` : "/admin/products/new";
  if (!name || !summary) {
    redirect(`${back}?error=${encodeURIComponent("Add a name and a short description.")}`);
  }
  if (!freeDownload && !paidDownload && !ships && !href) {
    redirect(`${back}?error=${encodeURIComponent("Add a button link, or choose a download.")}`);
  }
  if ((paidDownload || ships) && !cents) {
    redirect(`${back}?error=${encodeURIComponent("Enter a price like $18. On-site sales charge that amount.")}`);
  }
  if ((paidDownload || ships) && Number.isNaN(stock)) {
    redirect(`${back}?error=${encodeURIComponent("The number for sale has to be a whole number, or left blank for a download you can keep selling.")}`);
  }
  if (ships && stock == null) {
    redirect(`${back}?error=${encodeURIComponent("Enter how many you have for sale.")}`);
  }
  if (ships && shippingCents == null) {
    redirect(`${back}?error=${encodeURIComponent("Enter a shipping price for the United States, like $6 or $0.")}`);
  }
  if (ships && shippingIntlRaw && shippingIntlCents == null) {
    redirect(`${back}?error=${encodeURIComponent("The shipping price outside the United States has to look like $12.")}`);
  }

  try {
    await changeCatalog(async (catalog) => {
      const current = catalog.products.find((product) => product.slug === existingSlug);
      const slug = current?.slug || uniqueSlug(name, catalog.products);
      const imageFile = formData.get("image");
      const backFile = formData.get("backImage");
      let image = current?.image || "";
      let imageAlt = cleanText(formData.get("imageAlt"), 180) || name;
      let width = current?.width || 1200;
      let height = current?.height || 1200;
      let backImage = current?.backImage;
      let backImageAlt = cleanText(formData.get("backImageAlt"), 180);
      let backWidth = current?.backWidth;
      let backHeight = current?.backHeight;

      if (imageFile instanceof File && imageFile.size > 0) {
        const saved = await saveImage(imageFile, slug);
        image = saved.src;
        width = saved.width;
        height = saved.height;
      }
      if (backFile instanceof File && backFile.size > 0) {
        const saved = await saveImage(backFile, `${slug}-back`);
        backImage = saved.src;
        backWidth = saved.width;
        backHeight = saved.height;
        if (!backImageAlt) backImageAlt = `${name} back`;
      }
      if (!image) throw new CatalogError("Add a picture.");

      const downloadFile = formData.get("downloadFile");
      let fileName = current?.fileName || "";
      if (freeDownload || paidDownload) {
        if (downloadFile instanceof File && downloadFile.size > 0) {
          fileName = await saveDownload(slug, downloadFile);
        } else if (!fileName) {
          throw new CatalogError("Add the PDF for this download.");
        }
      }

      const onSite = paidDownload || ships;
      const product: Product = {
        slug,
        name,
        eyebrow: cleanText(formData.get("eyebrow"), 60),
        summary,
        details: cleanText(formData.get("details"), 2000),
        priceLabel: onSite ? formatPrice(cents || 0) : enteredPrice || (freeDownload ? "Free" : "See price"),
        priceCents: onSite ? cents || 0 : 0,
        cta: cleanText(formData.get("cta"), 40) || (freeDownload ? "Send me the file" : onSite ? "Buy now" : "Buy"),
        href: freeDownload || onSite ? "" : href,
        external: freeDownload || onSite ? false : formData.get("external") === "on",
        freeDownload,
        paidDownload,
        ships,
        stock: onSite ? (Number.isNaN(stock) ? null : stock) : null,
        shippingCents: ships ? shippingCents || 0 : 0,
        shippingIntlCents: ships ? shippingIntlCents : null,
        fileName: freeDownload || paidDownload ? fileName : "",
        image,
        imageAlt,
        width,
        height,
        featured: formData.get("featured") === "on",
        feature: formData.get("feature") === "on",
        backImage,
        backImageAlt: backImageAlt || undefined,
        backWidth,
        backHeight,
      };

      if (product.feature) {
        catalog.products = catalog.products.map((item) => ({ ...item, feature: item.slug === slug }));
      }

      const index = catalog.products.findIndex((item) => item.slug === slug);
      if (index >= 0) catalog.products[index] = product;
      else catalog.products.push(product);
      return catalog;
    });
  } catch (error) {
    if (!(error instanceof CatalogError)) throw error;
    const target = existingSlug ? `/admin/products/${existingSlug}` : "/admin/products/new";
    redirect(`${target}?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin?saved=1");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const slug = cleanText(formData.get("slug"), 80);
  await changeCatalog((catalog) => {
    catalog.products = catalog.products.filter((product) => product.slug !== slug);
    return catalog;
  });
  redirect("/admin?saved=1");
}

export async function moveProductAction(formData: FormData) {
  await requireAdmin();
  const slug = cleanText(formData.get("slug"), 80);
  const direction = formData.get("direction") === "up" ? -1 : 1;
  await changeCatalog((catalog) => {
    const index = catalog.products.findIndex((product) => product.slug === slug);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= catalog.products.length) return catalog;
    const [item] = catalog.products.splice(index, 1);
    catalog.products.splice(next, 0, item);
    return catalog;
  });
  redirect("/admin");
}

export async function saveShopsAction(formData: FormData) {
  await requireAdmin();
  try {
    await changeCatalog((catalog) => {
      const amazon = shopUrl(formData.get("amazon"), "Amazon");
      const etsy = shopUrl(formData.get("etsy"), "Etsy");
      const previous = catalog.shops;
      catalog.products = catalog.products.map((product) => {
        if (product.href === previous.amazon) return { ...product, href: amazon };
        if (product.href === previous.etsy) return { ...product, href: etsy };
        return product;
      });
      if (catalog.copy.shopLaterHref === previous.etsy) catalog.copy.shopLaterHref = etsy;
      catalog.shops = { amazon, etsy };
      return catalog;
    });
  } catch (error) {
    if (!(error instanceof CatalogError)) throw error;
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin?saved=1");
}

function shopUrl(value: FormDataEntryValue | null, label: string) {
  const href = cleanHref(cleanText(value, 2000));
  if (!href || !href.startsWith("https://")) {
    throw new CatalogError(`${label} needs a full link, starting with https://`);
  }
  return href;
}

export async function saveSocialsAction(formData: FormData) {
  await requireAdmin();
  try {
    await changeCatalog((catalog) => {
      catalog.socials = socialPlatforms.map((name) => {
        const href = cleanText(formData.get(name), 300);
        if (!href) return { name, href: "" };
        const cleaned = cleanHref(href);
        if (!cleaned || !cleaned.startsWith("http")) {
          throw new CatalogError(`${name} needs a full link, starting with https://`);
        }
        return { name: name as SocialName, href: cleaned };
      });
      return catalog;
    });
  } catch (error) {
    if (!(error instanceof CatalogError)) throw error;
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin?saved=1");
}

function requiredText(formData: FormData, name: string, label: string, max: number) {
  const value = cleanText(formData.get(name), max);
  if (!value) throw new CatalogError(`Add ${label}.`);
  return value;
}

function linkValue(formData: FormData, name: string, label: string, required: boolean) {
  const href = cleanLink(cleanText(formData.get(name), 500));
  if (href === null || (required && !href)) {
    throw new CatalogError(`${label} needs a link starting with /, #, or https://`);
  }
  return href;
}

export async function saveCopyAction(formData: FormData) {
  await requireAdmin();
  try {
    await changeCatalog(async (catalog) => {
      const principles = [0, 1, 2, 3].map((index) =>
        requiredText(formData, `principle${index}`, `word ${index + 1} in the bar`, 24),
      );
      const copy = {
        ...catalog.copy,
        description: requiredText(formData, "description", "the short description", 300),
        promoMessage: cleanText(formData.get("promoMessage"), 180),
        promoCode: cleanText(formData.get("promoCode"), 40),
        homeEyebrow: requiredText(formData, "homeEyebrow", "the home label", 80),
        homeHeadline: requiredText(formData, "homeHeadline", "the home headline", 80),
        homeHeadlineEm: cleanText(formData.get("homeHeadlineEm"), 80),
        homeLede: requiredText(formData, "homeLede", "the home sentence", 300),
        homePrimaryCta: requiredText(formData, "homePrimaryCta", "the home button", 40),
        homePrimaryHref: linkValue(formData, "homePrimaryHref", "The home button", true),
        homeSecondaryCta: cleanText(formData.get("homeSecondaryCta"), 40),
        homeSecondaryHref: linkValue(formData, "homeSecondaryHref", "The second home button", false),
        heroImageAlt: requiredText(formData, "heroImageAlt", "a description of the home picture", 180),
        heroCaption: cleanText(formData.get("heroCaption"), 140),
        principles: principles as typeof catalog.copy.principles,
        toolsEyebrow: requiredText(formData, "toolsEyebrow", "the tools label", 80),
        toolsHeading: requiredText(formData, "toolsHeading", "the tools heading", 160),
        storyEyebrow: requiredText(formData, "storyEyebrow", "the story label", 80),
        storyHeading: requiredText(formData, "storyHeading", "the story heading", 160),
        storyBody: requiredText(formData, "storyBody", "the story", 4000),
        storyLinkText: cleanText(formData.get("storyLinkText"), 40),
        storyLinkHref: linkValue(formData, "storyLinkHref", "The story link", false),
        storyImageAlt: requiredText(formData, "storyImageAlt", "a description of your picture", 180),
        checklistEyebrow: requiredText(formData, "checklistEyebrow", "the checklist label", 80),
        checklistHeading: requiredText(formData, "checklistHeading", "the checklist heading", 160),
        checklistAttitude: cleanText(formData.get("checklistAttitude"), 160),
        checklistBody: requiredText(formData, "checklistBody", "the checklist sentence", 800),
        checklistButton: requiredText(formData, "checklistButton", "the checklist button", 40),
        checklistNote: cleanText(formData.get("checklistNote"), 240),
        checklistImageAlt: requiredText(formData, "checklistImageAlt", "a description of the checklist picture", 180),
        aboutEyebrow: requiredText(formData, "aboutEyebrow", "the about label", 80),
        aboutHeading: requiredText(formData, "aboutHeading", "the about heading", 160),
        aboutImageAlt: cleanText(formData.get("aboutImageAlt"), 180),
        aboutBody: requiredText(formData, "aboutBody", "the about story", 4000),
        aboutQuote: cleanText(formData.get("aboutQuote"), 300),
        aboutNote: cleanText(formData.get("aboutNote"), 180),
        aboutPoints: cleanText(formData.get("aboutPoints"), 800),
        aboutPrimaryCta: cleanText(formData.get("aboutPrimaryCta"), 40),
        aboutPrimaryHref: linkValue(formData, "aboutPrimaryHref", "The about button", false),
        aboutSecondaryCta: cleanText(formData.get("aboutSecondaryCta"), 40),
        aboutSecondaryHref: linkValue(formData, "aboutSecondaryHref", "The second about button", false),
        shopEyebrow: requiredText(formData, "shopEyebrow", "the shop label", 80),
        shopHeading: requiredText(formData, "shopHeading", "the shop heading", 160),
        shopLede: requiredText(formData, "shopLede", "the shop sentence", 300),
        shopLaterEyebrow: cleanText(formData.get("shopLaterEyebrow"), 80),
        shopLaterHeading: cleanText(formData.get("shopLaterHeading"), 160),
        shopLaterBody: cleanText(formData.get("shopLaterBody"), 800),
        shopLaterCta: cleanText(formData.get("shopLaterCta"), 40),
        shopLaterHref: linkValue(formData, "shopLaterHref", "The shop note button", false),
        contactEyebrow: requiredText(formData, "contactEyebrow", "the contact label", 80),
        contactHeading: requiredText(formData, "contactHeading", "the contact heading", 160),
        contactBody: requiredText(formData, "contactBody", "the contact sentence", 800),
      };

      const heroFile = formData.get("heroImage");
      if (heroFile instanceof File && heroFile.size > 0) {
        const saved = await saveImage(heroFile, "hero");
        copy.heroImage = saved.src;
        copy.heroWidth = saved.width;
        copy.heroHeight = saved.height;
      }
      const storyFile = formData.get("storyImage");
      if (storyFile instanceof File && storyFile.size > 0) {
        const saved = await saveImage(storyFile, "portrait");
        copy.storyImage = saved.src;
      }
      const aboutFile = formData.get("aboutMedia");
      if (aboutFile instanceof File && aboutFile.size > 0) {
        const saved = await savePostMedia(aboutFile, "about");
        copy.aboutImage = saved.src;
        copy.aboutMedia = saved.media;
      }
      const checklistFile = formData.get("checklistImage");
      if (checklistFile instanceof File && checklistFile.size > 0) {
        const saved = await saveImage(checklistFile, "checklist");
        copy.checklistImage = saved.src;
        copy.checklistWidth = saved.width;
        copy.checklistHeight = saved.height;
      }

      if (copy.homeSecondaryCta && !copy.homeSecondaryHref) {
        throw new CatalogError("The second home button needs a link.");
      }
      if (copy.aboutPrimaryCta && !copy.aboutPrimaryHref) {
        throw new CatalogError("The about button needs a link.");
      }
      if (copy.aboutSecondaryCta && !copy.aboutSecondaryHref) {
        throw new CatalogError("The second about button needs a link.");
      }
      if (copy.shopLaterCta && !copy.shopLaterHref) {
        throw new CatalogError("The shop note button needs a link.");
      }

      catalog.copy = copy;
      return catalog;
    });
  } catch (error) {
    if (!(error instanceof CatalogError)) throw error;
    redirect(`/admin/pages?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin/pages?saved=1");
}

export async function addEmailAction(formData: FormData) {
  await requireAdmin();
  const email = cleanEmail(formData.get("email"));
  if (!email) redirect("/admin/emails?error=Enter%20a%20real%20email%20address.");
  const name = cleanText(formData.get("name"), 120);
  const saved = await addPerson({ email, name, source: "added" });
  if (!saved) redirect("/admin/emails?error=That%20address%20could%20not%20be%20saved.");
  redirect("/admin/emails?added=1");
}

export async function removeEmailAction(formData: FormData) {
  await requireAdmin();
  const email = cleanEmail(formData.get("email"));
  if (!email) redirect("/admin/emails");
  const { unsubscribe } = await import("@/lib/audience");
  await unsubscribe(email);
  redirect("/admin/emails?removed=1");
}

export async function sendLetterAction(formData: FormData) {
  await requireAdmin();
  if (tooMany("letters", 3)) {
    redirect("/admin/emails?error=Wait%20a%20minute%20before%20sending%20another%20note.");
  }
  if (!resendReady()) {
    redirect("/admin/emails?error=Email%20isn%E2%80%99t%20connected%20yet.%20The%20list%20is%20still%20saved.");
  }

  const subject = cleanText(formData.get("subject"), 140);
  const body = cleanText(formData.get("body"), 8000);
  if (!subject || !body) redirect("/admin/emails?error=Write%20a%20subject%20and%20a%20message.");

  const people = await listPeople();
  const subscribed = people.filter((person) => !person.unsubscribed);
  const everyone = formData.get("everyone") === "yes";
  const picked = new Set(
    formData
      .getAll("to")
      .map((value) => cleanEmail(value))
      .filter((value): value is string => Boolean(value)),
  );
  const recipients = everyone ? subscribed : subscribed.filter((person) => picked.has(person.email));
  if (!recipients.length) redirect("/admin/emails?error=Pick%20someone%2C%20or%20choose%20everyone%20on%20the%20list.");

  let media: { kind: "image" | "video"; url: string } | null = null;
  const mediaFile = formData.get("media");
  if (mediaFile instanceof File && mediaFile.size > 0) {
    try {
      const saved = await saveLetterMedia(mediaFile);
      media = {
        kind: saved.kind,
        url: saved.src.startsWith("http") ? saved.src : new URL(saved.src, site.url).toString(),
      };
    } catch (error) {
      const message = error instanceof CatalogError ? error.message : "That file could not be saved.";
      redirect(`/admin/emails?error=${encodeURIComponent(message)}`);
    }
  }

  const result = await sendLetters(
    recipients,
    subject,
    body,
    (email) => {
      return unsubscribeLink(email, site.url);
    },
    media,
  );

  if (!result.sent) redirect("/admin/emails?error=The%20note%20did%20not%20send.");
  redirect(`/admin/emails?sent=${result.sent}${result.failed ? `&failed=${result.failed}` : ""}`);
}

export async function draftLetterAction(request: string): Promise<{ subject: string; body: string } | { error: string }> {
  if (!(await isAdmin())) return { error: "Sign in again, then try the writer." };
  if (tooMany("writer", 8)) return { error: "Wait a minute before asking again." };
  const prompt = cleanText(request, 1000);
  if (!prompt) return { error: "Say what the note should be about." };
  if (!writerReady()) return { error: "The writer isn’t connected yet." };
  try {
    return await writeCustomNote(prompt);
  } catch {
    return { error: "The note could not be written. Try again." };
  }
}

export async function sendAnnouncementAction(formData: FormData) {
  await requireAdmin();
  const id = cleanText(formData.get("id"), 120);
  const drafts = await readDrafts();
  const draft = drafts.find((item) => item.id === id && item.status === "pending");
  if (!draft) redirect("/admin/emails");

  if (formData.get("decision") === "skip") {
    await markDraft(id, "skipped");
    redirect("/admin/emails?kept=1");
  }

  if (tooMany("letters", 3)) {
    redirect("/admin/emails?error=Wait%20a%20minute%20before%20sending%20another%20note.");
  }
  if (!resendReady()) {
    redirect("/admin/emails?error=Email%20isn%E2%80%99t%20connected%20yet.%20The%20list%20is%20still%20saved.");
  }

  const subject = cleanText(formData.get("subject"), 140);
  const body = cleanText(formData.get("body"), 8000);
  if (!subject || !body) redirect("/admin/emails?error=Write%20a%20subject%20and%20a%20message.");

  const people = await listPeople();
  const recipients = people.filter((person) => !person.unsubscribed);
  if (!recipients.length) redirect("/admin/emails?error=Nobody%20is%20on%20the%20list%20yet.");

  const result = await sendLetters(
    recipients,
    subject,
    body,
    (email) => {
      return unsubscribeLink(email, site.url);
    },
  );

  if (!result.sent) redirect("/admin/emails?error=The%20note%20did%20not%20send.");
  await markDraft(id, "sent");
  redirect(`/admin/emails?sent=${result.sent}${result.failed ? `&failed=${result.failed}` : ""}`);
}

export async function rewriteAnnouncementAction(formData: FormData) {
  await requireAdmin();
  if (tooMany("writer", 8)) {
    redirect("/admin/emails?error=Wait%20a%20minute%20before%20asking%20again.");
  }
  const id = cleanText(formData.get("id"), 120);
  const drafts = await readDrafts();
  const draft = drafts.find((item) => item.id === id && item.status === "pending");
  if (!draft) redirect("/admin/emails");
  if (!writerReady()) redirect("/admin/emails?error=The%20writer%20isn%E2%80%99t%20connected%20yet.");

  const posts = await readPosts();
  const post = posts.find((item) => item.slug === draft.postSlug);
  if (!post) redirect("/admin/emails?error=That%20post%20is%20gone%2C%20so%20it%20can%E2%80%99t%20be%20rewritten.");

  const url = new URL(`/blog/${post.slug}`, site.url).toString();
  const written = await writeBlogNote(post.title, post.excerpt, post.body, url);
  if (written.source !== "ai") redirect("/admin/emails?error=The%20note%20could%20not%20be%20written.%20Try%20again.");

  await saveDraft({
    ...draft,
    postTitle: post.title,
    subject: written.subject,
    body: written.body,
    source: "ai",
  });
  redirect(`/admin/emails?rewritten=1&open=${encodeURIComponent(id)}`);
}

export async function savePostAction(formData: FormData) {
  await requireAdmin();
  const title = cleanText(formData.get("title"), 140);
  const body = cleanText(formData.get("body"), 20000);
  const currentSlug = cleanText(formData.get("slug"), 80);
  if (!title || !body) {
    const back = currentSlug ? `/admin/blog/${currentSlug}` : "/admin/blog/new";
    redirect(`${back}?error=${encodeURIComponent("A post needs a title and the writing.")}`);
  }

  const posts = await readPosts();
  const current = posts.find((post) => post.slug === currentSlug);
  let slug = current?.slug || postSlug(title);
  if (!current && posts.some((post) => post.slug === slug)) {
    slug = `${slug}-${posts.length + 1}`.slice(0, 70);
  }

  let image = current?.image || "";
  let media: "image" | "video" = current?.media === "video" ? "video" : "image";
  let width = current?.width || 1200;
  let height = current?.height || 1200;
  const imageAlt = cleanText(formData.get("imageAlt"), 180);
  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      const saved = await savePostMedia(imageFile, `blog-${slug}`);
      image = saved.src;
      media = saved.media;
      width = saved.width;
      height = saved.height;
    } catch (error) {
      const message = error instanceof CatalogError ? error.message : "That file could not be saved.";
      redirect(`/admin/blog/${current ? current.slug : "new"}?error=${encodeURIComponent(message)}`);
    }
  }

  const excerpt = cleanText(formData.get("excerpt"), 300) || body.replace(/\s+/g, " ").slice(0, 180);
  const now = new Date().toISOString();
  const wantsNow = formData.get("published") === "on";
  const rawDate = cleanText(formData.get("publishDate"), 10);
  const rawTime = cleanText(formData.get("publishTime"), 5);
  let published = false;
  let publishAt: string | null = null;
  if (wantsNow) {
    published = true;
  } else if (rawDate || rawTime) {
    const back = currentSlug ? `/admin/blog/${currentSlug}` : "/admin/blog/new";
    if (!rawDate || !rawTime) {
      redirect(`${back}?error=${encodeURIComponent("Pick both a date and a time.")}`);
    }
    const iso = easternInputToIso(`${rawDate}T${rawTime}`);
    if (!iso) {
      redirect(`${back}?error=${encodeURIComponent("Pick a real date and time.")}`);
    }
    if (new Date(iso).getTime() <= Date.now()) {
      published = true;
    } else {
      publishAt = iso;
    }
  }
  const post: Post = {
    slug,
    title,
    excerpt,
    body,
    image,
    imageAlt: imageAlt || title,
    media,
    width,
    height,
    published,
    publishAt,
    createdAt: current?.createdAt || now,
    updatedAt: now,
  };

  const next = current ? posts.map((item) => (item.slug === current.slug ? post : item)) : [post, ...posts];
  try {
    await writePosts(next);
  } catch {
    redirect(`/admin/blog/${current ? current.slug : "new"}?error=The%20post%20could%20not%20be%20saved.`);
  }
  refresh();
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);

  let note = "";
  if (post.publishAt) {
    note = "later";
  } else if (post.published && !current?.published) {
    try {
      if (await queuePostAnnouncement(post)) note = "1";
    } catch {
      note = "missed";
    }
  }

  redirect(`/admin/blog?saved=1${note ? `&note=${note}` : ""}`);
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin();
  const slug = cleanText(formData.get("slug"), 80);
  if (!slug) redirect("/admin/blog?error=That%20post%20could%20not%20be%20removed.");
  try {
    await deletePost(slug);
  } catch {
    redirect("/admin/blog?error=That%20post%20is%20still%20there.%20Try%20again.");
  }
  refresh();
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  redirect("/admin/blog?removed=1");
}
