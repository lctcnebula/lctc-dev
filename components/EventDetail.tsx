"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAll, insert, now, upcoming, useData } from "@/lib/store";
import { useUser } from "@/lib/auth";
import type { FoundationEvent } from "@/lib/seed";
import { eventParts, timeRange } from "./EventCard";
import { Missing } from "./Missing";
import { SampleTag } from "./Live";
import { Prose } from "./Prose";
import DemoFill from "./DemoFill";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// "6:30 PM" on 2026-11-05 -> 20261105T183000 (floating local time, fine for a single-region foundation)
function icsStamp(date: string, t: string) {
  const m = t.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
  let h = m ? +m[1] : 9; const min = m?.[2] ? +m[2] : 0;
  if (m?.[3]?.toUpperCase() === "PM" && h < 12) h += 12;
  if (m?.[3]?.toUpperCase() === "AM" && h === 12) h = 0;
  return date.replace(/-/g, "") + "T" + String(h).padStart(2, "0") + String(min).padStart(2, "0") + "00";
}

function calendarLinks(e: FoundationEvent) {
  const s = icsStamp(e.date, e.start), en = icsStamp(e.date, e.end || e.start);
  const google = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(e.title) +
    `&dates=${s}/${en}&details=` + encodeURIComponent(e.summary) + "&location=" + encodeURIComponent(e.location);
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//LCTC Foundation//Events//EN", "BEGIN:VEVENT", `UID:${e.id}@lctcfoundation`,
    `DTSTART:${s}`, `DTEND:${en}`, `SUMMARY:${e.title}`, `LOCATION:${e.location}`, `DESCRIPTION:${e.summary}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return { google, ics: "data:text/calendar;charset=utf-8," + encodeURIComponent(ics) };
}

export default function EventDetail({ slug }: { slug: string }) {
  const events = useData("events");
  const rsvps = useData("rsvps");
  const posts = useData("posts");
  const e = events.find(x => x.slug === slug && x.published);
  if (!e) return <Missing what="event" back="/events" />;

  const p = eventParts(e.date);
  const isUpcoming = upcoming([e]).length > 0;
  const taken = rsvps.filter(r => r.eventId === e.id).reduce((n, r) => n + 1 + r.guests, 0);
  const left = e.capacity > 0 ? Math.max(0, e.capacity - taken) : Infinity;
  const recaps = posts.filter(x => x.published && x.eventId === e.id);
  const cal = calendarLinks(e);

  return (
    <>
      <section className="page-hero">
        {e.image && <img src={e.image} alt="" width={1024} height={683} />}
        <div className="wrap">
          <p className="crumbs"><Link href="/">Home</Link> / <Link href="/events">Events</Link> / {p.m} {p.d}</p>
          <h1>{e.title}</h1>
          <p>{e.summary}</p>
        </div>
      </section>

      <section className="block">
        <div className="wrap detail">
          <div>
            <p className="kicker">About this event <SampleTag show={e.sample} /></p>
            <h2>{isUpcoming ? "What to expect" : "This event has passed"}</h2>
            <Prose text={e.body} />
            {recaps.length > 0 && (
              <div className="recaps">
                <h3>From the blog</h3>
                {recaps.map(r => <Link key={r.id} className="text-link" href={`/blog/${r.slug}`}>{r.title} →</Link>)}
              </div>
            )}
            <p style={{ marginTop: 32 }}><Link className="text-link" href="/events">← All events</Link></p>
          </div>
          <aside className="side-card">
            <dl style={{ display: "grid", gap: 14 }}>
              <div><dt>Date</dt><dd>{p.full}</dd></div>
              <div><dt>Time</dt><dd>{timeRange(e)}</dd></div>
              <div><dt>Where</dt><dd>{e.location || "To be announced"}</dd></div>
              {isUpcoming && e.capacity > 0 && <div><dt>Spots left</dt><dd>{left} of {e.capacity}</dd></div>}
            </dl>
            {isUpcoming && <RsvpForm e={e} left={left} cal={cal} />}
          </aside>
        </div>
      </section>
    </>
  );
}

function RsvpForm({ e, left, cal }: { e: FoundationEvent; left: number; cal: { google: string; ics: string } }) {
  const { user } = useUser();
  const [f, setF] = useState({ name: "", email: "", guests: "0", note: "" });
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (user) setF(p => ({ ...p, name: p.name || user.name, email: p.email || user.email }));
  }, [user]);

  const calButtons = (
    <div className="cal-links">
      <a className="btn line" href={cal.google} target="_blank" rel="noopener">Google Calendar</a>
      <a className="btn line" href={cal.ics} download={`${e.slug}.ics`}>Apple / Outlook</a>
    </div>
  );

  if (!e.rsvpOpen) return <p className="hint">RSVPs aren&apos;t open for this event. {calButtons}</p>;
  if (done) return (
    <div className="rsvp-done" role="status">
      <p className="pill-ok">You&apos;re on the list</p>
      <p>See you there, {f.name.trim().split(/\s+/)[0]}. Add it to your calendar:</p>
      {calButtons}
      <button className="link-btn" type="button" onClick={() => { setF({ name: "", email: "", guests: "0", note: "" }); setDone(false); }}>RSVP for someone else</button>
    </div>
  );
  if (left === 0) return <p className="form-alert">This event is full. Contact us to join the waitlist.</p>;

  function send(ev: React.FormEvent) {
    ev.preventDefault();
    const guests = Math.max(0, Math.floor(+f.guests || 0));
    if (f.name.trim().length < 2) return setErr("Please enter your name.");
    if (!emailRe.test(f.email.trim())) return setErr("Please enter a valid email address.");
    if (1 + guests > left) return setErr(`Only ${left} spot${left === 1 ? "" : "s"} left.`);
    const email = f.email.trim().toLowerCase();
    if (getAll("rsvps").some(r => r.eventId === e.id && r.email.toLowerCase() === email)) return setErr("You've already RSVP'd with this email.");
    setErr("");
    insert("rsvps", { eventId: e.id, name: f.name.trim(), email, guests, note: f.note.trim(), createdAt: now() });
    setDone(true);
  }

  const set = (k: keyof typeof f) => (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF(p => ({ ...p, [k]: ev.target.value }));
  return (
    <form className="rsvp" onSubmit={send} noValidate>
      <h3>RSVP</h3>
      <DemoFill onFill={() => { setF({ name: "Jordan Rivera", email: "jordan.rivera@example.com", guests: "1", note: "Looking forward to it!" }); setErr(""); }} />
      {err && <p className="form-alert" role="alert">{err}</p>}
      <div className="field"><label htmlFor="r-name">Name</label><input id="r-name" value={f.name} onChange={set("name")} autoComplete="name" /></div>
      <div className="field"><label htmlFor="r-email">Email</label><input id="r-email" type="email" value={f.email} onChange={set("email")} autoComplete="email" /></div>
      <div className="field"><label htmlFor="r-guests">Guests you&apos;re bringing</label><input id="r-guests" type="number" min={0} max={10} value={f.guests} onChange={set("guests")} /></div>
      <div className="field"><label htmlFor="r-note">Note <span className="opt">(optional)</span></label><textarea id="r-note" rows={2} style={{ minHeight: 0 }} value={f.note} onChange={set("note")} placeholder="Dietary needs, accessibility, questions" /></div>
      <button className="btn blue" type="submit">Reserve my spot</button>
      {!user && <p className="hint" style={{ textAlign: "center" }}><Link href="/login">Sign in</Link> to fill this in automatically.</p>}
    </form>
  );
}
