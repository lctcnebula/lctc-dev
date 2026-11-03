// Reading and writing collections, with the access rules enforced here rather than in the browser.
//
// Reads: content (programs, events, posts, board, alumni, reports, scholarships) is public, minus drafts and
// private fields. Submissions (donations, applications, messages, subscribers, RSVPs) are staff only, except that a
// signed-in member sees their own donations and RSVPs, and anyone sees how many seats each event has taken.
// Writes: staff with access to a collection's section can do anything to it. Visitors can only add the things the
// public forms send (a gift, an application, a message, an RSVP, a newsletter signup, an alumni story).

import { randomBytes } from "node:crypto";
import { query, sql } from "./db";
import { hashPassword } from "./auth";
import { can, sectionOf, type Viewer } from "../roles";
import { seed, type CollectionKey, type DB, type Settings } from "../seed";

type Doc = Record<string, unknown> & { id: string };

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export const collections = Object.keys(seed).filter(k => k !== "settings") as CollectionKey[];
export const isCollection = (k: string): k is CollectionKey => (collections as string[]).includes(k);

// Collections everyone can read; the rest come back empty (or trimmed) unless the viewer has access.
const PUBLIC: CollectionKey[] = ["programs", "events", "posts", "board", "alumni", "reports", "scholarships"];
// Collections the public forms add to.
const PUBLIC_CREATE: CollectionKey[] = ["donations", "applications", "messages", "rsvps", "subscribers", "alumni"];

const newId = () => Date.now().toString(36) + randomBytes(3).toString("hex");
const staffFor = (v: Viewer | null, k: CollectionKey) => can(v?.role, sectionOf[k]);
const sameEmail = (a: unknown, b: string) => String(a ?? "").toLowerCase() === b.toLowerCase();

async function rows(k: CollectionKey): Promise<Doc[]> {
  const r = await sql`SELECT data FROM records WHERE collection = ${k} ORDER BY created_at DESC, id`;
  return r.map(x => x.data as Doc);
}

async function users(): Promise<Doc[]> {
  const r = await sql`SELECT id, name, email, role, created_at FROM users ORDER BY created_at, email`;
  return r.map(u => ({ id: String(u.id), name: u.name, email: u.email, role: u.role, createdAt: new Date(u.created_at as string).toISOString(), pass: "set" }));
}

/** A collection as this viewer is allowed to see it. */
export async function readCollection<K extends CollectionKey>(k: K, v: Viewer | null): Promise<DB[K]> {
  if (k === "users") return (staffFor(v, k) ? await users() : []) as DB[K];
  const staff = staffFor(v, k);
  if (!staff && !PUBLIC.includes(k) && k !== "rsvps" && k !== "donations") return [] as DB[K];
  let list = await rows(k);
  if (!staff) {
    if (k === "events" || k === "posts") list = list.filter(x => x.published);
    if (k === "alumni") list = list.filter(x => x.published).map(({ email: _, ...x }) => x as Doc);
    // Seat counts for every event, plus the member's own RSVPs in full.
    if (k === "rsvps") list = list.map(r => v && sameEmail(r.email, v.email) ? r : { id: r.id, eventId: r.eventId, guests: r.guests, name: "", email: "", note: "", createdAt: "" });
    if (k === "donations") list = v ? list.filter(d => sameEmail(d.email, v.email)) : [];
  }
  return list as DB[K];
}

export async function readSettings(): Promise<Settings> {
  const r = await sql`SELECT data FROM settings WHERE id = 1`;
  return { ...seed.settings, ...((r[0]?.data as Partial<Settings>) ?? {}) };
}

export async function saveSettings(patch: Partial<Settings>, v: Viewer | null) {
  if (!can(v?.role, "settings")) throw new HttpError(403, "You don't have access to settings.");
  const next = { ...(await readSettings()), ...patch };
  await sql`INSERT INTO settings (id, data) VALUES (1, ${JSON.stringify(next)}::jsonb) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`;
  return next;
}

// What a visitor's form is allowed to set. Staff-only fields (status, published, sample) are fixed here.
function fromPublic(k: CollectionKey, d: Doc): Doc {
  const { sample: _s, status: _st, published: _p, ...rest } = d;
  const base = { ...rest, createdAt: new Date().toISOString() } as Doc;
  if (k === "applications" || k === "messages") return { ...base, status: "New" };
  if (k === "alumni") return { ...base, published: false };
  if (k === "donations" && !(Number(base.amount) > 0)) throw new HttpError(400, "Enter an amount above $0.");
  return base;
}

export async function createItem(k: CollectionKey, input: Record<string, unknown>, v: Viewer | null): Promise<Doc> {
  const staff = staffFor(v, k);
  if (!staff && !PUBLIC_CREATE.includes(k)) throw new HttpError(403, "You don't have access to add this.");
  if (k === "users") return createUser(input);
  let d = { ...input, id: newId() } as Doc;
  if (!staff) d = fromPublic(k, d);
  const email = String(d.email ?? "").trim().toLowerCase();

  // A newsletter signup that already exists is fine: hand back the existing one.
  if (k === "subscribers") {
    const have = await sql`SELECT data FROM records WHERE collection = 'subscribers' AND lower(data->>'email') = ${email}`;
    if (have[0]) return have[0].data as Doc;
  }
  if (k === "rsvps") {
    const ev = (await rows("events")).find(e => e.id === d.eventId);
    if (!ev) throw new HttpError(404, "That event doesn't exist.");
    const list = (await rows("rsvps")).filter(r => r.eventId === d.eventId);
    if (!staff && list.some(r => sameEmail(r.email, email))) throw new HttpError(409, "You've already RSVP'd with this email.");
    const taken = list.reduce((n, r) => n + 1 + Number(r.guests || 0), 0);
    if (!staff && Number(ev.capacity) > 0 && taken + 1 + Number(d.guests || 0) > Number(ev.capacity)) throw new HttpError(409, "Sorry, there aren't enough seats left.");
  }
  await sql`INSERT INTO records (collection, id, data) VALUES (${k}, ${d.id}, ${JSON.stringify(d)}::jsonb)`;
  return d;
}

/** Editing clears the "sample" flag, since the content is now the Foundation's own. */
export async function updateItem(k: CollectionKey, id: string, patch: Record<string, unknown>, v: Viewer | null): Promise<Doc> {
  if (!staffFor(v, k)) throw new HttpError(403, "You don't have access to change this.");
  if (k === "users") return updateUser(id, patch, v!);
  const { id: _i, ...rest } = patch;
  const r = await sql`
    UPDATE records SET data = data || ${JSON.stringify({ ...rest, sample: false })}::jsonb, updated_at = now()
    WHERE collection = ${k} AND id = ${id} RETURNING data`;
  if (!r[0]) throw new HttpError(404, "That item no longer exists.");
  return r[0].data as Doc;
}

export async function removeItem(k: CollectionKey, id: string, v: Viewer | null) {
  if (!staffFor(v, k)) throw new HttpError(403, "You don't have access to delete this.");
  if (k === "users") {
    if (id === v!.id) throw new HttpError(400, "You can't delete your own account.");
    await sql`DELETE FROM users WHERE id = ${id}`;
    return;
  }
  await sql`DELETE FROM records WHERE collection = ${k} AND id = ${id}`;
}

// Staff accounts. The admin form sends `newPassword`; only its hash is stored.
async function createUser(input: Record<string, unknown>): Promise<Doc> {
  const email = String(input.email ?? "").trim().toLowerCase(), pw = String(input.newPassword ?? "");
  if (pw.length < 8) throw new HttpError(400, "Set a password of at least 8 characters.");
  const id = "u" + randomBytes(6).toString("hex");
  const r = await sql`
    INSERT INTO users (id, name, email, role, pass) VALUES (${id}, ${String(input.name ?? "").trim()}, ${email}, ${String(input.role)}, ${await hashPassword(pw)})
    ON CONFLICT (email) DO NOTHING RETURNING id`;
  if (!r[0]) throw new HttpError(409, "Another account uses that email.");
  return (await users()).find(u => u.id === id)!;
}

async function updateUser(id: string, patch: Record<string, unknown>, v: Viewer): Promise<Doc> {
  if (id === v.id && patch.role && patch.role !== "superadmin") throw new HttpError(400, "You can't remove your own super admin access.");
  const sets: string[] = [], params: unknown[] = [];
  const add = (col: string, val: unknown) => { params.push(val); sets.push(`${col} = $${params.length}`); };
  if (patch.name !== undefined) add("name", String(patch.name).trim());
  if (patch.email !== undefined) add("email", String(patch.email).trim().toLowerCase());
  if (patch.role !== undefined) add("role", String(patch.role));
  if (patch.newPassword) {
    if (String(patch.newPassword).length < 8) throw new HttpError(400, "Passwords need at least 8 characters.");
    add("pass", await hashPassword(String(patch.newPassword)));
  }
  if (sets.length) {
    params.push(id);
    try { await query(`UPDATE users SET ${sets.join(", ")} WHERE id = $${params.length}`, params); }
    catch { throw new HttpError(409, "Another account uses that email."); }
  }
  const u = (await users()).find(x => x.id === id);
  if (!u) throw new HttpError(404, "That account no longer exists.");
  return u;
}
