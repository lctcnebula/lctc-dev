"use client";

import { useEffect, useState } from "react";
import { insert, now } from "@/lib/store";
import { useUser } from "@/lib/auth";

// Messages land in Admin → Messages.
const topics = ["General question", "Donating", "Donating equipment", "Volunteering", "Business partnership", "Student aid", "Events", "Alumni"];

export default function ContactForm() {
  const { user } = useUser();
  const [f, setF] = useState({ name: "", email: "", topic: topics[0], message: "" });
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const t = new URLSearchParams(location.search).get("topic");
    if (t && topics.includes(t)) setF(p => ({ ...p, topic: t }));
  }, []);
  useEffect(() => {
    if (user) setF(p => ({ ...p, name: p.name || user.name, email: p.email || user.email }));
  }, [user]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (f.name.trim().length < 2) return setErr("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) return setErr("Please enter a valid email address.");
    if (f.message.trim().length < 5) return setErr("Please write a short message.");
    setErr("");
    insert("messages", { name: f.name.trim(), email: f.email.trim(), topic: f.topic, message: f.message.trim(), status: "New", createdAt: now() });
    setSent(true);
  }

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF(p => ({ ...p, [k]: e.target.value }));

  if (sent) return (
    <div className="form-card done-box" aria-live="polite">
      <svg className="check" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="36" /><path d="m28 43 10 10 18-20" /></svg>
      <p className="pill-ok">Message sent</p>
      <h2 className="form-title">Thanks, {f.name.trim().split(/\s+/)[0]}!</h2>
      <p className="form-sub">We&apos;ll reply to {f.email.trim()} soon.</p>
      <button className="btn line" type="button" onClick={() => { setSent(false); setF(p => ({ ...p, message: "" })); }}>Send another message</button>
    </div>
  );

  return (
    <form className="form-card" onSubmit={send} noValidate>
      <h2 className="form-title">Send us a message</h2>
      <p className="form-sub">We read every message and usually reply within two business days.</p>
      {err && <p className="form-alert" role="alert">{err}</p>}
      <div className="row2">
        <div className="field"><label htmlFor="c-name">Name</label><input id="c-name" value={f.name} onChange={set("name")} autoComplete="name" /></div>
        <div className="field"><label htmlFor="c-email">Email</label><input id="c-email" type="email" value={f.email} onChange={set("email")} autoComplete="email" /></div>
      </div>
      <div className="field">
        <label htmlFor="c-topic">Topic</label>
        <select id="c-topic" value={f.topic} onChange={set("topic")}>{topics.map(t => <option key={t}>{t}</option>)}</select>
      </div>
      <div className="field"><label htmlFor="c-msg">Message</label><textarea id="c-msg" rows={6} value={f.message} onChange={set("message")} /></div>
      <button className="btn blue" type="submit">Send message</button>
    </form>
  );
}
