"use client";

import { useState } from "react";
import { insert, now, useData } from "@/lib/store";
import type { Alum } from "@/lib/seed";
import { SampleTag } from "./Live";
import DemoFill from "./DemoFill";
import { shrink } from "@/lib/image";

const initials = (name: string) => name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");

export default function AlumniList() {
  const alumni = useData("alumni").filter(a => a.published);
  if (!alumni.length) return <p className="empty">Alumni stories are coming soon. Be the first to share yours below.</p>;
  return (
    <div className="alumni-grid">
      {alumni.map(a => <AlumCard key={a.id} a={a} />)}
    </div>
  );
}

// Long stories are clipped to a few lines with a toggle.
function AlumCard({ a }: { a: Alum }) {
  const [open, setOpen] = useState(false);
  const long = a.story.length > 220;
  const meta = [a.year && "Class of " + a.year, a.program !== "Other" && a.program].filter(Boolean) as string[];
  return (
    <article className="alum-card">
      <header>
        {a.photo ? <img className="alum-avatar" src={a.photo} alt={a.name} width={64} height={64} loading="lazy" /> : <span className="alum-avatar" aria-hidden="true">{initials(a.name)}</span>}
        <div>
          <h3>{a.name}</h3>
          {(meta.length > 0 || a.sample) && <p>{meta.map((m, i) => <span key={m}>{i > 0 && " · "}<span className="nw">{m}</span></span>)} <SampleTag show={a.sample} /></p>}
        </div>
      </header>
      {a.now && <p className="alum-now"><span>Now</span>{a.now}</p>}
      {a.story && <>
        <blockquote className={long && !open ? "clamped" : undefined}>{a.story}</blockquote>
        {long && <button type="button" className="alum-more" aria-expanded={open} onClick={() => setOpen(o => !o)}>{open ? "Show less" : "Read more"}</button>}
      </>}
    </article>
  );
}

// Submissions arrive unpublished in Admin → Alumni for review.
export function AlumniForm() {
  const programs = useData("programs");
  const blank = { name: "", email: "", program: "", year: "", now: "", story: "", photo: "", share: true };
  const [f, setF] = useState(blank);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF(p => ({ ...p, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (f.name.trim().length < 2) return setErr("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) return setErr("Please enter a valid email address.");
    if (!/^\d{4}$/.test(f.year.trim())) return setErr("Enter the year you finished, like 2019.");
    setErr("");
    insert("alumni", {
      name: f.name.trim(), email: f.email.trim(), program: f.program, year: f.year.trim(), now: f.now.trim(),
      story: f.share ? f.story.trim() : "", photo: f.share ? f.photo : "", published: false, createdAt: now(),
    });
    setDone(true);
  }

  if (done) return (
    <div className="form-card done-box" aria-live="polite">
      <svg className="check" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="36" /><path d="m28 43 10 10 18-20" /></svg>
      <p className="pill-ok">Welcome back</p>
      <h2 className="form-title">Thanks, {f.name.trim().split(/\s+/)[0]}!</h2>
      <p className="form-sub">You&apos;re on the alumni list. If you shared a story, it will appear here after a quick review.</p>
      <button className="btn line" type="button" onClick={() => { setF(blank); setDone(false); }}>Submit another</button>
    </div>
  );

  return (
    <form className="form-card" onSubmit={send} noValidate>
      <h2 className="form-title">Join the alumni network</h2>
      <p className="form-sub">Finished a Tech Campus program? Stay in touch, and tell us where you are now.</p>
      <DemoFill onFill={() => { setF(p => ({ ...p, name: "Alex Morgan", email: "alex.morgan@example.com", program: programs[0]?.name ?? "", year: "2021", now: "Apprentice at a local fabrication shop", story: "Tech Campus gave me hands-on skills and my first certification. I started an apprenticeship right after graduating." })); setErr(""); }} />
      {err && <p className="form-alert" role="alert">{err}</p>}
      <div className="row2">
        <div className="field"><label htmlFor="al-name">Name</label><input id="al-name" value={f.name} onChange={set("name")} autoComplete="name" /></div>
        <div className="field"><label htmlFor="al-email">Email</label><input id="al-email" type="email" value={f.email} onChange={set("email")} autoComplete="email" /></div>
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="al-program">Program</label>
          <select id="al-program" value={f.program} onChange={set("program")}>
            <option value="">Choose…</option>
            {programs.map(p => <option key={p.id}>{p.name}</option>)}
            <option>Other</option>
          </select>
        </div>
        <div className="field"><label htmlFor="al-year">Year finished</label><input id="al-year" inputMode="numeric" maxLength={4} placeholder="2019" value={f.year} onChange={set("year")} /></div>
      </div>
      <div className="field"><label htmlFor="al-now">What you do now <span className="opt">(optional)</span></label><input id="al-now" placeholder="e.g. Journeyman electrician at…" value={f.now} onChange={set("now")} /></div>
      <div className="field">
        <label htmlFor="al-photo">Photo <span className="opt">(optional)</span></label>
        <div className="photo-pick">
          {f.photo ? <img src={f.photo} alt="Your photo" width={64} height={64} /> : <span aria-hidden="true">📷</span>}
          <input id="al-photo" type="file" accept="image/*" onChange={async e => {
            const file = e.target.files?.[0]; if (!file) return;
            try { const photo = await shrink(file, 600); setF(p => ({ ...p, photo })); setErr(""); } catch (x) { setErr((x as Error).message); }
            e.target.value = "";
          }} />
          {f.photo && <button type="button" className="link-btn" onClick={() => setF(p => ({ ...p, photo: "" }))}>Remove</button>}
        </div>
      </div>
      <div className="field"><label htmlFor="al-story">Your story <span className="opt">(optional)</span></label><textarea id="al-story" rows={4} value={f.story} onChange={set("story")} /></div>
      <label className="check-row"><input type="checkbox" checked={f.share} onChange={set("share")} /> It&apos;s OK to share my story and photo on this site</label>
      <button className="btn blue" type="submit">Join</button>
    </form>
  );
}
