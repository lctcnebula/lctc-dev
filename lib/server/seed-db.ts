// Creates the tables and loads the starting content from lib/seed.ts. Safe to run again: existing rows are kept.
// With `reset`, all content and submissions are wiped first (accounts are kept; the demo logins are restored).

import { query, schema, sql } from "./db";
import { hashPassword } from "./auth";
import { DEMO_PASSWORD } from "../roles";
import { seed } from "../seed";
import { collections } from "./data";

export async function seedDatabase({ reset = false } = {}) {
  for (const s of schema) await query(s);
  if (reset) {
    await sql`DELETE FROM records`;
    await sql`DELETE FROM settings`;
  }
  await sql`INSERT INTO settings (id, data) VALUES (1, ${JSON.stringify(seed.settings)}::jsonb) ON CONFLICT (id) DO NOTHING`;

  // Lists are shown newest first, so the first seed item gets the latest timestamp and the seed order is kept.
  const base = new Date().toISOString();
  const added: Record<string, number> = {};
  for (const k of collections) {
    if (k === "users") continue;
    const r = await query(
      `INSERT INTO records (collection, id, data, created_at)
       SELECT $1, e->>'id', e, $2::timestamptz - (ord * interval '1 second')
       FROM jsonb_array_elements($3::jsonb) WITH ORDINALITY AS t(e, ord)
       ON CONFLICT (collection, id) DO NOTHING RETURNING id`,
      [k, base, JSON.stringify(seed[k])],
    );
    added[k] = r.length;
  }

  // The demo logins all use DEMO_PASSWORD. Their seed hashes are from the old browser-only login, so rehash here.
  let users = 0;
  for (const u of seed.users) {
    const r = await sql`
      INSERT INTO users (id, name, email, role, pass, created_at)
      VALUES (${u.id}, ${u.name}, ${u.email}, ${u.role}, ${await hashPassword(DEMO_PASSWORD)}, ${u.createdAt})
      ON CONFLICT (email) DO NOTHING RETURNING id`;
    users += r.length;
  }
  return { ...added, users };
}
