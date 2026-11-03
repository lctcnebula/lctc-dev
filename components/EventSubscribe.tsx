"use client";

import { useState } from "react";
import { insert, now } from "@/lib/store";

// Sign-ups land in Admin → Subscribers.
export default function EventSubscribe() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return setErr("Please enter a valid email address.");
    setErr("");
    try { await insert("subscribers", { email: v, name: "", createdAt: now() }); setDone(true); }
    catch (x) { setErr((x as Error).message); }
  }

  if (done) return <p className="subscribe-done" role="status">You&apos;re subscribed. We&apos;ll email {email.trim()} before each event.</p>;

  return (
    <form className="subscribe" onSubmit={send} noValidate>
      <label className="sr-only" htmlFor="sub-email">Email address</label>
      <input id="sub-email" type="email" placeholder="you@example.com" autoComplete="email" value={email}
        onChange={e => setEmail(e.target.value)} aria-invalid={!!err} aria-describedby="sub-err" />
      <button className="btn solid" type="submit">Subscribe</button>
      <p id="sub-err" className="subscribe-err" role="alert">{err}</p>
    </form>
  );
}
