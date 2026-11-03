import type { MetadataRoute } from "next";
import { site } from "@/lib/content";
import { readCollection } from "@/lib/server/data";
import { boardSlug } from "@/lib/slug";

export const revalidate = 3600;

// Static pages plus every board member, program, published event and published post in the database.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/about", "/programs", "/events", "/blog", "/get-involved", "/donate", "/donations", "/pricing", "/apply", "/contact", "/board", "/alumni", "/impact"];
  const [board, programs, events, posts] = await Promise.all([
    readCollection("board", null), readCollection("programs", null), readCollection("events", null), readCollection("posts", null),
  ]);
  return [
    ...pages.map(p => ({ url: site.url + p, changeFrequency: "weekly" as const, priority: p === "" ? 1 : .7 })),
    ...board.map(m => ({ url: `${site.url}/board/${boardSlug(m)}`, priority: .4 })),
    ...programs.map(p => ({ url: `${site.url}/programs/${p.slug}`, priority: .5 })),
    ...events.map(e => ({ url: `${site.url}/events/${e.slug}`, lastModified: e.date, priority: .6 })),
    ...posts.map(p => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date, priority: .5 })),
  ];
}
