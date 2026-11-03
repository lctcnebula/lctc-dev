"use client";

// The browser's view of the data in Neon Postgres. Pages read collections with useData(); the server renders each
// page with the public content already filled in (see <DataProvider> in app/layout.tsx), and anything private
// (donations, applications, messages…) is fetched from /api/data the first time a page asks for it. The server
// decides what each viewer may see and change; see lib/server/data.ts.

import { createContext, createElement, useContext, useEffect, useSyncExternalStore } from "react";
import { seed, type CollectionKey, type DB, type FoundationEvent } from "./seed";
import type { Viewer } from "./roles";

type Item<K extends CollectionKey> = DB[K][number];
export type Initial = Partial<DB>;

const cache: Partial<DB> = {};
const loading = new Set<keyof DB>();
const listeners = new Set<() => void>();
const EMPTY: never[] = [];
const emit = () => listeners.forEach(l => l());

const InitialData = createContext<{ data: Initial; viewer: Viewer | null }>({ data: {}, viewer: null });
export const useInitialViewer = () => useContext(InitialData).viewer;

/** Hands the server-rendered data to every useData() call below it. */
export function DataProvider({ data, viewer, children }: { data: Initial; viewer: Viewer | null; children: React.ReactNode }) {
  return createElement(InitialData.Provider, { value: { data, viewer } }, children);
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...init?.headers }, cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || "Something went wrong. Please try again.");
  return json as T;
}

const url = (k: keyof DB) => k === "settings" ? "/api/settings" : `/api/data/${k}`;

/** Fetches a collection again from the server. */
export async function refresh<K extends keyof DB>(k: K) {
  if (loading.has(k)) return;
  loading.add(k);
  try { cache[k] = await api<DB[K]>(url(k)); emit(); }
  catch { /* keep what we have */ }
  finally { loading.delete(k); }
}

/** After signing in or out, what the viewer may see changes, so everything is fetched again. */
export function refreshAll() {
  (Object.keys(cache) as (keyof DB)[]).forEach(k => { delete cache[k]; void refresh(k); });
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

/** Live view of a collection (or settings). */
export function useData<K extends keyof DB>(k: K): DB[K] {
  const init = useContext(InitialData).data[k];
  const fallback = (init ?? (k === "settings" ? seed.settings : EMPTY)) as DB[K];
  const value = useSyncExternalStore(subscribe, () => (cache[k] ?? fallback) as DB[K], () => fallback);
  useEffect(() => {
    if (k in cache) return;
    if (init) { cache[k] = init; return; }
    void refresh(k);
  }, [k, init]);
  return value;
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const now = () => new Date().toISOString();

export function getAll<K extends CollectionKey>(k: K): DB[K] { return (cache[k] ?? EMPTY) as DB[K]; }

function put<K extends CollectionKey>(k: K, list: Item<K>[]) { cache[k] = list as DB[K]; emit(); }

export async function insert<K extends CollectionKey>(k: K, item: Omit<Item<K>, "id"> & { id?: string }): Promise<Item<K>> {
  const saved = await api<Item<K>>(url(k), { method: "POST", body: JSON.stringify(item) });
  if (cache[k]) put(k, [saved, ...(cache[k] as Item<K>[]).filter(x => (x as { id: string }).id !== (saved as { id: string }).id)]);
  return saved;
}

/** Shows the change straight away; if the server refuses it, the collection is reloaded and the error thrown. */
export async function update<K extends CollectionKey>(k: K, id: string, patch: Partial<Item<K>> & Record<string, unknown>) {
  const list = cache[k] as Item<K>[] | undefined;
  if (list) put(k, list.map(x => (x as { id: string }).id === id ? { ...x, ...patch, sample: false } : x));
  try {
    const saved = await api<Item<K>>(`${url(k)}/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) });
    const now = cache[k] as Item<K>[] | undefined;
    if (now) put(k, now.map(x => (x as { id: string }).id === id ? saved : x));
    return saved;
  } catch (e) { void refresh(k); throw e; }
}

export async function remove<K extends CollectionKey>(k: K, id: string) {
  const list = cache[k] as Item<K>[] | undefined;
  if (list) put(k, list.filter(x => (x as { id: string }).id !== id));
  try { await api(`${url(k)}/${encodeURIComponent(id)}`, { method: "DELETE" }); }
  catch (e) { void refresh(k); throw e; }
}

export async function saveSettings(patch: Partial<DB["settings"]>) {
  cache.settings = await api<DB["settings"]>("/api/settings", { method: "PUT", body: JSON.stringify(patch) });
  emit();
}

/** Super admin only: wipes content and submissions on the server and reloads the starting content. */
export async function resetAll() {
  await api("/api/admin/reset", { method: "POST" });
  refreshAll();
}

export { boardSlug, slugify } from "./slug";

export function upcoming(events: FoundationEvent[], at = new Date()) {
  const today = new Date(at.getFullYear(), at.getMonth(), at.getDate());
  return events.filter(e => e.published && new Date(e.date + "T00:00:00") >= today).sort((a, b) => a.date.localeCompare(b.date));
}

export function past(events: FoundationEvent[], at = new Date()) {
  const today = new Date(at.getFullYear(), at.getMonth(), at.getDate());
  return events.filter(e => e.published && new Date(e.date + "T00:00:00") < today).sort((a, b) => b.date.localeCompare(a.date));
}

export { money } from "./content";
export { api };
