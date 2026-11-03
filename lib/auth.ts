"use client";

// Sign-in for staff and members. Accounts and sessions live on the server (lib/server/auth.ts): the browser only
// holds an httpOnly session cookie, and every API call is checked against the signed-in person's role.

import { useSyncExternalStore } from "react";
import { api, refreshAll, useInitialViewer } from "./store";
import type { Viewer } from "./roles";

export { can, demoAccounts, DEMO_PASSWORD, isStaff, roleLabels, type Section, type Viewer } from "./roles";

// undefined: not changed since the page loaded, so the server-rendered viewer still applies.
let current: Viewer | null | undefined;
const listeners = new Set<() => void>();

function set(v: Viewer | null) {
  current = v;
  refreshAll();
  listeners.forEach(l => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

/** The signed-in person, or null. The server renders each page already knowing who is signed in. */
export function useUser(): { user: Viewer | null; ready: boolean } {
  const initial = useInitialViewer();
  const v = useSyncExternalStore(subscribe, () => current, () => undefined);
  return { user: v === undefined ? initial : v, ready: true };
}

export async function signIn(email: string, password: string) {
  const u = await api<Viewer>("/api/auth/signin", { method: "POST", body: JSON.stringify({ email, password }) });
  set(u);
  return u;
}

export async function register(name: string, email: string, password: string) {
  const u = await api<Viewer>("/api/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });
  set(u);
  return u;
}

export async function signOut() {
  await api("/api/auth/signout", { method: "POST" }).catch(() => {});
  set(null);
}
