"use client";

// Front-end only data store. Every collection lives in this browser's localStorage under
// "lctc:<name>", starting from lib/seed.ts. To move to a real backend later, keep these
// function signatures and swap the bodies for API calls.

import { useSyncExternalStore } from "react";
import { seed, type CollectionKey, type DB, type FoundationEvent } from "./seed";

const PREFIX = "lctc:";
const cache: Partial<DB> = {};
const listeners = new Set<() => void>();

function read<K extends keyof DB>(k: K): DB[K] {
  if (k in cache) return cache[k] as DB[K];
  let v: DB[K] = seed[k];
  try {
    const raw = localStorage.getItem(PREFIX + k);
    if (raw) v = k === "settings" ? { ...seed.settings, ...JSON.parse(raw) } : withNewSeed(k, JSON.parse(raw));
  } catch {}
  cache[k] = v;
  return v;
}

// Seed items added after this browser first saved a collection would otherwise never show up.
// "lctc:_seen" remembers which seed ids each collection has already been given, so new ones are
// added once while ones an admin deleted stay deleted.
function withNewSeed<K extends keyof DB>(k: K, stored: DB[K]): DB[K] {
  const list = stored as { id: string }[], fresh = seed[k] as { id: string }[];
  let seen: Record<string, string[]> = {};
  try { seen = JSON.parse(localStorage.getItem(PREFIX + "_seen") || "{}"); } catch {}
  const known = new Set([...(seen[k] || []), ...list.map(x => x.id)]);
  const added = fresh.filter(x => !known.has(x.id));
  seen[k] = fresh.map(x => x.id);
  try { localStorage.setItem(PREFIX + "_seen", JSON.stringify(seen)); } catch {}
  return (added.length ? [...list, ...added] : list) as DB[K];
}

function write<K extends keyof DB>(k: K, v: DB[K]) {
  try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); }
  catch { throw new Error("This browser's storage is full. Remove some images or old entries and try again."); }
  cache[k] = v;
  listeners.forEach(l => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (!e.key?.startsWith(PREFIX)) return;
    delete cache[e.key.slice(PREFIX.length) as keyof DB];
    l();
  };
  addEventListener("storage", onStorage);
  return () => { listeners.delete(l); removeEventListener("storage", onStorage); };
}

/** Live view of a collection (or settings). Renders seed data on the server, stored data in the browser. */
export function useData<K extends keyof DB>(k: K): DB[K] {
  return useSyncExternalStore(subscribe, () => read(k), () => seed[k]);
}

type Item<K extends CollectionKey> = DB[K][number];

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const now = () => new Date().toISOString();

export function getAll<K extends CollectionKey>(k: K): DB[K] { return read(k); }

export function insert<K extends CollectionKey>(k: K, item: Omit<Item<K>, "id"> & { id?: string }): Item<K> {
  const full = { ...item, id: item.id || uid() } as Item<K>;
  write(k, [full, ...(read(k) as Item<K>[])] as DB[K]);
  return full;
}

/** Editing an item clears its "sample" flag, since the content is now the admin's own. */
export function update<K extends CollectionKey>(k: K, id: string, patch: Partial<Item<K>>) {
  write(k, (read(k) as Item<K>[]).map(x => (x as { id: string }).id === id ? { ...x, ...patch, sample: false } : x) as DB[K]);
}

export function remove<K extends CollectionKey>(k: K, id: string) {
  write(k, (read(k) as Item<K>[]).filter(x => (x as { id: string }).id !== id) as DB[K]);
}

export function saveSettings(patch: Partial<DB["settings"]>) {
  write("settings", { ...read("settings"), ...patch });
}

/** Wipes every change made in this browser and returns to the seed data. */
export function resetAll() {
  (Object.keys(seed) as (keyof DB)[]).forEach(k => { try { localStorage.removeItem(PREFIX + k); } catch {} delete cache[k]; });
  try { localStorage.removeItem(PREFIX + "_seen"); } catch {}
  listeners.forEach(l => l());
}

export function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

export function upcoming(events: FoundationEvent[], at = new Date()) {
  const today = new Date(at.getFullYear(), at.getMonth(), at.getDate());
  return events.filter(e => e.published && new Date(e.date + "T00:00:00") >= today).sort((a, b) => a.date.localeCompare(b.date));
}

export function past(events: FoundationEvent[], at = new Date()) {
  const today = new Date(at.getFullYear(), at.getMonth(), at.getDate());
  return events.filter(e => e.published && new Date(e.date + "T00:00:00") < today).sort((a, b) => b.date.localeCompare(a.date));
}

export const money = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
