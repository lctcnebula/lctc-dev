import type { MetadataRoute } from "next";
import { site } from "@/lib/content";
import { seed } from "@/lib/seed";

// Static pages plus the starting programs, events and posts. Items an admin adds later live in
// the browser (front-end only), so they can't be listed here until the site has a real database.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about", "/programs", "/events", "/blog", "/donate", "/apply", "/contact", "/board", "/alumni", "/impact", "/privacy", "/site-map"];
  return [
    ...pages.map(p => ({ url: site.url + p, changeFrequency: "weekly" as const, priority: p === "" ? 1 : .7 })),
    ...seed.board.map(m => ({ url: `${site.url}/board/${m.slug}`, priority: .4 })),
    ...seed.programs.map(p => ({ url: `${site.url}/programs/${p.slug}`, priority: .5 })),
    ...seed.events.filter(e => e.published).map(e => ({ url: `${site.url}/events/${e.slug}`, lastModified: e.date, priority: .6 })),
    ...seed.posts.filter(p => p.published).map(p => ({ url: `${site.url}/blog/${p.slug}`, lastModified: p.date, priority: .5 })),
  ];
}
