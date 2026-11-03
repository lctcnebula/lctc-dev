// Accounts and sign-in sessions. Passwords are hashed with scrypt and a per-user salt; the browser holds only a
// random session token in an httpOnly cookie, and the database keeps a SHA-256 of that token.

import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { sql } from "./db";
import type { Viewer } from "../roles";
import type { Role } from "../seed";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;
const COOKIE = "lctc_session";
const DAYS = 30;

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function checkPassword(password: string, stored: string) {
  const [kind, salt, key] = stored.split("$");
  if (kind !== "scrypt" || !salt || !key) return false;
  const want = Buffer.from(key, "base64");
  const got = await scrypt(password, Buffer.from(salt, "base64"), want.length);
  return timingSafeEqual(got, want);
}

const digest = (token: string) => createHash("sha256").update(token).digest("hex");
const toViewer = (r: Record<string, unknown>): Viewer => ({ id: String(r.id), name: String(r.name), email: String(r.email), role: r.role as Role });

export async function startSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + DAYS * 864e5);
  await sql`INSERT INTO sessions (token, user_id, expires_at) VALUES (${digest(token)}, ${userId}, ${expires})`;
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await sql`DELETE FROM sessions WHERE token = ${digest(token)}`;
  jar.delete(COOKIE);
}

/** The signed-in person for this request, or null. */
export async function currentUser(): Promise<Viewer | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const rows = await sql`
    SELECT u.id, u.name, u.email, u.role FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ${digest(token)} AND s.expires_at > now()`;
  return rows[0] ? toViewer(rows[0]) : null;
}

export async function signIn(email: string, password: string) {
  const rows = await sql`SELECT id, name, email, role, pass FROM users WHERE email = ${email.trim().toLowerCase()}`;
  const u = rows[0];
  if (!u || !(await checkPassword(password, String(u.pass)))) throw new Error("That email and password don't match.");
  await startSession(String(u.id));
  return toViewer(u);
}

export async function register(name: string, email: string, password: string) {
  const e = email.trim().toLowerCase();
  if (name.trim().length < 2) throw new Error("Please enter your name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) throw new Error("Please enter a valid email address.");
  if (password.length < 8) throw new Error("Use at least 8 characters for your password.");
  const id = "u" + randomBytes(6).toString("hex");
  const rows = await sql`
    INSERT INTO users (id, name, email, role, pass) VALUES (${id}, ${name.trim()}, ${e}, 'user', ${await hashPassword(password)})
    ON CONFLICT (email) DO NOTHING RETURNING id, name, email, role`;
  if (!rows[0]) throw new Error("An account with that email already exists. Try signing in.");
  await startSession(id);
  return toViewer(rows[0]);
}
