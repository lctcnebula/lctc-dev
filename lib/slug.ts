// URL helpers, used by both the server and the browser.

export function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

/** A board member's profile URL part. Members saved before slugs existed fall back to their name. */
export const boardSlug = (m: { slug?: string; name: string }) => m.slug || slugify(m.name.replace(/^(dr|mr|ms|mrs)\.\s+/i, ""));
