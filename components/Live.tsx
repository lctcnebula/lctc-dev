"use client";

// Small pieces of public pages that read admin-managed data.

import Link from "next/link";
import { useData } from "@/lib/store";
import { categories } from "@/lib/seed";
import { CopyButton } from "./Actions";

export function SampleTag({ show, children = "Sample" }: { show?: boolean; children?: React.ReactNode }) {
  return show ? <span className="sample-tag" title="Placeholder content. Edit or delete it in the admin dashboard.">{children}</span> : null;
}


export function ProgramCount() {
  return <>{useData("programs").length}</>;
}

export function SchoolTicker() {
  const schools = useData("settings").schools;
  if (!schools.length) return null;
  return (
    <div className="wrap ticker" aria-label="Member high schools">
      <p>Students come from {schools.length} member high schools</p>
      <div className="ticker-track">
        {[...schools, ...schools].map((s, k) => <span key={k} aria-hidden={k >= schools.length}>{s}</span>)}
      </div>
    </div>
  );
}

/** About-page school list; hidden until the Foundation adds schools in Admin → Settings. */
export function MemberSchools() {
  const schools = useData("settings").schools;
  if (!schools.length) return null;
  return (
    <section className="block tint">
      <div className="wrap">
        <div className="head reveal">
          <div>
            <p className="kicker">Our community</p>
            <h2>{schools.length} member high schools</h2>
            <p>Students from these schools take part in Tech Campus programs.</p>
          </div>
        </div>
        <div className="school-grid">{schools.map(s => <span key={s}>{s}</span>)}</div>
      </div>
    </section>
  );
}

/** Shown only while Admin → Outside scholarships has entries, so it never points at an empty section. */
export function OutsideScholarshipsLink() {
  if (!useData("scholarships").length) return null;
  return <Link className="btn ghost" href="/apply#outside-scholarships">Outside scholarships</Link>;
}

export function EmailLink() {
  const { email } = useData("settings");
  return <a href={`mailto:${email}`}>{email}</a>;
}

/** Email / phone / address list. Rows the admin left blank are hidden. */
export function ContactDetails({ className, maps }: { className: string; maps?: boolean }) {
  const s = useData("settings");
  const map = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(s.address);
  return (
    <dl className={className}>
      <div><dt>Email</dt><dd><a href={`mailto:${s.email}`}>{s.email}</a><CopyButton text={s.email} /></dd></div>
      {s.phone && <div><dt>Phone</dt><dd><a href={"tel:" + s.phone.replace(/[^\d+]/g, "")}>{s.phone}</a></dd></div>}
      {s.address && <div><dt>Visit</dt><dd>{s.address}{maps && <><br /><a href={map} target="_blank" rel="noopener">Open in Maps →</a></>}</dd></div>}
    </dl>
  );
}

export function ProgramPaths({ limit }: { limit?: number }) {
  const programs = useData("programs").slice(0, limit);
  const label = (id: string) => categories.find(c => c.id === id)?.label;
  if (!programs.length) return <p className="empty">Programs will appear here once they&apos;re added.</p>;
  return (
    <div className="paths">
      {programs.map(p => (
        <Link key={p.id} className="path" href={`/programs/${p.slug}`}>
          <i aria-hidden="true">{p.icon}</i>
          <div><small>{label(p.cat)} <SampleTag show={p.sample} /></small><b>{p.name}</b><span>{p.summary}</span></div>
        </Link>
      ))}
    </div>
  );
}
