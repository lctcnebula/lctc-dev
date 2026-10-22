"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isStaff, roleLabels, signOut, useUser } from "@/lib/auth";
import { money, useData } from "@/lib/store";
import { frequencies } from "@/lib/seed";
import { eventParts } from "./EventCard";

export default function Account() {
  const router = useRouter();
  const { user, ready } = useUser();
  const rsvps = useData("rsvps");
  const events = useData("events");
  const donations = useData("donations");
  useEffect(() => { if (ready && !user) router.replace("/login"); }, [ready, user, router]);
  if (!user) return <div style={{ minHeight: "50vh" }} />;

  const mine = rsvps.filter(r => r.email.toLowerCase() === user.email.toLowerCase());
  const gifts = donations.filter(d => d.email.toLowerCase() === user.email.toLowerCase());

  return (
    <div className="account">
      <header className="account-head">
        <div>
          <p className="kicker">{roleLabels[user.role]} account</p>
          <h1 className="form-title">Hi, {user.name.split(/\s+/)[0]}</h1>
          <p className="hint">{user.email}</p>
        </div>
        <div className="hero-actions" style={{ marginTop: 0 }}>
          {isStaff(user.role) && <Link className="btn blue" href="/admin">Admin dashboard</Link>}
          <button className="btn line" type="button" onClick={() => { signOut(); router.replace("/"); }}>Sign out</button>
        </div>
      </header>

      <div className="account-grid">
        <section className="aside-box">
          <h2>My RSVPs</h2>
          {mine.length ? (
            <ul className="plain-list">
              {mine.map(r => {
                const e = events.find(x => x.id === r.eventId);
                return <li key={r.id}>{e ? <Link href={`/events/${e.slug}`}>{e.title}</Link> : "Removed event"}<span>{e && eventParts(e.date).full}{r.guests ? ` · +${r.guests} guest${r.guests > 1 ? "s" : ""}` : ""}</span></li>;
              })}
            </ul>
          ) : <p className="hint">No RSVPs yet. <Link href="/events">See upcoming events →</Link></p>}
        </section>
        <section className="aside-box">
          <h2>My giving</h2>
          {gifts.length ? (
            <ul className="plain-list">
              {gifts.map(d => <li key={d.id}><b>{money(d.amount)}{frequencies[d.freq]?.per}</b><span>{d.fund} · {new Date(d.createdAt).toLocaleDateString("en-US")} · {d.receipt}</span></li>)}
            </ul>
          ) : <p className="hint">No gifts yet. <Link href="/donate">Make your first gift →</Link></p>}
        </section>
      </div>
    </div>
  );
}
