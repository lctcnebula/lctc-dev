// Neon Postgres. DATABASE_URL is set by the Vercel Neon integration (run `vercel env pull .env.local` for local dev).
//
// Tables (created by scripts/setup-db.ts):
//   records   one row per item in a collection (programs, events, donations…), the item itself as JSONB
//   settings  the Foundation's contact details and member schools, a single JSONB row
//   users     accounts, with an scrypt password hash that never leaves the server
//   sessions  signed-in browsers, keyed by a hash of the cookie token

import { neon } from "@neondatabase/serverless";

type Row = Record<string, unknown>;
let client: ReturnType<typeof neon> | null = null;

function db() {
  if (!client) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set. Run `vercel env pull .env.local`.");
    client = neon(process.env.DATABASE_URL);
  }
  return client;
}

/** Tagged template: sql`SELECT * FROM users WHERE id = ${id}`. Values are always sent as parameters. */
export const sql = (strings: TemplateStringsArray, ...values: unknown[]) => db()(strings, ...values) as Promise<Row[]>;

/** A query string with $1, $2 placeholders. */
export const query = (text: string, params: unknown[] = []) => db().query(text, params) as Promise<Row[]>;

export const schema = [
  `CREATE TABLE IF NOT EXISTS records (
    collection text NOT NULL,
    id text NOT NULL,
    data jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (collection, id)
  )`,
  `CREATE INDEX IF NOT EXISTS records_email ON records (collection, lower(data->>'email'))`,
  `CREATE TABLE IF NOT EXISTS settings (id int PRIMARY KEY DEFAULT 1 CHECK (id = 1), data jsonb NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS users (
    id text PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    role text NOT NULL CHECK (role IN ('superadmin', 'admin', 'accountant', 'user')),
    pass text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token text PRIMARY KEY,
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL
  )`,
];
