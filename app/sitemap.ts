import type { MetadataRoute } from "next";
import { publishedPosts, readPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = ["", "/shop", "/about", "/blog", "/contact", "/privacy"];
  const now = new Date();
  const posts = publishedPosts(await readPosts());

  return [
    ...paths.map((path) => ({
      url: `${site.url}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...posts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
