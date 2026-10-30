"use client";

import { useState } from "react";
import { insert, now, useData } from "@/lib/store";
import { SampleTag } from "./Live";

export default function AlumniList() {
  const alumni = useData("alumni").filter(a => a.published);
  if (!alumni.length) return <p className="empty">Alumni stories are coming soon. Be the first to share yours below.</p>;
  return (
    <div className="grid three">
      {alumni.map(a => (
        <article className="card alum" key={a.id}>
          {a.photo && <div className="media"><img src={a.photo} alt="" width={600} height={600} loading="lazy" /></div>}
          <div className="content">
            <p className="time">{[a.program, a.year && "Class of " + a.year].filter(Boolean).join(" · ")} <SampleTag show={a.sample} /></p>
            <h3>{a.name}</h3>
            {a.now && <p className="alum-now">{a.now}</p>}
            {a.story && <p>{a.story}</p>}
          </div>
        </article>
      ))}
    </div>
  );
}

// Submissions arrive unpublished in Admin → Alumni for review.
export function AlumniForm() {
  const programs = useData("programs");
  const blank = { name: "", email: "", program: "", year: "", now: "", story: "", share: true };
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
      story: f.share ? f.story.trim() : "", photo: "", published: false, createdAt: now(),
    });
    setDone(true);
  }

  if (done) return (
    <div className="form-card done-box" aria-live="polite">
      <svg className="check" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="36" /><path d="m28 43 10 10 18-20" /></svg>
      <p className="pill-ok">Welcome back</p>
      <h2 className="form-title">Thanks, {f.name.trim().split(/\s+/)[0]}!</h2>
      <p className="form-sub">You&apos;re on the alumni list. If you shared a story, it will appear here after a quick review.</p>
    </div>
  );

  return (
    <form className="form-card" onSubmit={send} noValidate>
      <h2 className="form-title">Join the alumni network</h2>
      <p className="form-sub">Finished a Tech Campus program? Stay in touch, and tell us where you are now.</p>
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
      <div className="field"><label htmlFor="al-story">Your story <span className="opt">(optional)</span></label><textarea id="al-story" rows={4} value={f.story} onChange={set("story")} /></div>
      <label className="check-row"><input type="checkbox" checked={f.share} onChange={set("share")} /> It&apos;s OK to share my story on this site</label>
      <button className="btn blue" type="submit">Join</button>
    </form>
  );
}
