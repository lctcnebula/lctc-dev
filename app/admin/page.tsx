"use client";

import Link from "next/link";
import { can, roleLabels, useUser, type Section } from "@/lib/auth";
import { money, upcoming, useData } from "@/lib/store";
import { frequencies } from "@/lib/seed";
import { fmtDate, fmtDateTime } from "@/components/admin/Manager";

export default function Dashboard() {
  const { user } = useUser();
  const donations = useData("donations");
  const applications = useData("applications");
  const messages = useData("messages");
  const rsvps = useData("rsvps");
  const subscribers = useData("subscribers");
  const alumni = useData("alumni");
  const events = useData("events");
  const reports = useData("reports");
  if (!user) return null;
  const ok = (s: Section) => can(user.role, s);

  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const thisMonth = donations.filter(d => new Date(d.createdAt) >= monthStart);
  const latest = [...reports].sort((a, b) => b.year.localeCompare(a.year))[0];

  const cards: { s: Section; href: string; label: string; value: string | number; sub: string }[] = [
    { s: "donations", href: "/admin/donations", label: "Donations", value: money(donations.reduce((n, d) => n + d.amount, 0)), sub: `${donations.length} gifts · ${money(thisMonth.reduce((n, d) => n + d.amount, 0))} this month` },
    { s: "applications", href: "/admin/applications", label: "Grant applications", value: applications.length, sub: `${applications.filter(a => a.status === "New").length} new` },
    { s: "messages", href: "/admin/messages", label: "Messages", value: messages.length, sub: `${messages.filter(m => m.status === "New").length} new` },
    { s: "rsvps", href: "/admin/rsvps", label: "RSVPs", value: rsvps.reduce((n, r) => n + 1 + r.guests, 0), sub: (n => `people across ${n} event${n === 1 ? "" : "s"}`)(new Set(rsvps.map(r => r.eventId)).size) },
    { s: "subscribers", href: "/admin/subscribers", label: "Subscribers", value: subscribers.length, sub: "event updates" },
    { s: "alumni", href: "/admin/alumni", label: "Alumni", value: alumni.length, sub: `${alumni.filter(a => !a.published).length} pending review` },
    { s: "reports", href: "/admin/reports", label: "Latest year", value: latest?.year ?? "—", sub: latest ? `${money(latest.raised)} raised · ${money(latest.granted)} awarded` : "No reports yet" },
  ];

  type Act = { at: string; s: Section; href: string; text: React.ReactNode };
  const activity: Act[] = [
    ...donations.map(d => ({ at: d.createdAt, s: "donations" as const, href: "/admin/donations", text: <><b>{d.name}</b> gave {money(d.amount)}{frequencies[d.freq]?.short} to {d.fund}</> })),
    ...applications.map(a => ({ at: a.submittedAt, s: "applications" as const, href: "/admin/applications", text: <><b>{a.firstName} {a.lastName}</b> applied for aid</> })),
    ...messages.map(m => ({ at: m.createdAt, s: "messages" as const, href: "/admin/messages", text: <><b>{m.name}</b> sent a message: {m.topic}</> })),
    ...rsvps.map(r => ({ at: r.createdAt, s: "rsvps" as const, href: `/admin/rsvps?event=${r.eventId}`, text: <><b>{r.name}</b> RSVP&apos;d to {events.find(e => e.id === r.eventId)?.title ?? "an event"}</> })),
    ...subscribers.map(x => ({ at: x.createdAt, s: "subscribers" as const, href: "/admin/subscribers", text: <><b>{x.email}</b> subscribed to events</> })),
    ...alumni.map(a => ({ at: a.createdAt, s: "alumni" as const, href: "/admin/alumni", text: <><b>{a.name}</b> joined the alumni list</> })),
  ].filter(a => ok(a.s)).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 12);

  const next = upcoming(events).slice(0, 4);

  return (
    <div className="admin-page">
      <header className="admin-head">
        <div><h1>Welcome, {user.name.split(/\s+/)[0]}</h1><p className="hint">Signed in as {roleLabels[user.role]}.</p></div>
        <div className="admin-actions">
          {ok("events") && <Link className="btn line sm" href="/admin/events">New event</Link>}
          {ok("blog") && <Link className="btn blue sm" href="/admin/blog">Write a post</Link>}
        </div>
      </header>

      <div className="kpis">
        {cards.filter(c => ok(c.s)).map(c => (
          <Link key={c.label} className="kpi" href={c.href}><span>{c.label}</span><b>{c.value}</b><small>{c.sub}</small></Link>
        ))}
      </div>

      <div className="dash-grid">
        <section className="admin-card">
          <h2>Latest submissions</h2>
          {activity.length ? (
            <ul className="activity">{activity.map((a, k) => <li key={k}><Link href={a.href}>{a.text}</Link><time>{fmtDateTime(a.at)}</time></li>)}</ul>
          ) : <p className="hint">Nothing yet.</p>}
        </section>
        {ok("events") && (
          <section className="admin-card">
            <h2>Upcoming events</h2>
            {next.length ? (
              <ul className="activity">
                {next.map(e => {
                  const n = rsvps.filter(r => r.eventId === e.id).reduce((s, r) => s + 1 + r.guests, 0);
                  return <li key={e.id}><Link href={`/admin/rsvps?event=${e.id}`}><b>{e.title}</b> · {n} going{e.capacity ? ` of ${e.capacity}` : ""}</Link><time>{fmtDate(e.date)}</time></li>;
                })}
              </ul>
            ) : <p className="hint">No upcoming events. <Link href="/admin/events">Add one →</Link></p>}
          </section>
        )}
      </div>
    </div>
  );
}
