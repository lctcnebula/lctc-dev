"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { can, isStaff, roleLabels, signOut, useUser, type Section } from "@/lib/auth";
import { useData } from "@/lib/store";

type NavItem = { s: Section; href: string; label: string; count?: () => number };
const groups: { title: string; items: Omit<NavItem, "count">[] }[] = [
  { title: "Overview", items: [{ s: "dashboard", href: "/admin", label: "Dashboard" }] },
  { title: "Submissions", items: [
    { s: "donations", href: "/admin/donations", label: "Donations" },
    { s: "applications", href: "/admin/applications", label: "Grant applications" },
    { s: "messages", href: "/admin/messages", label: "Messages" },
    { s: "rsvps", href: "/admin/rsvps", label: "Event RSVPs" },
    { s: "subscribers", href: "/admin/subscribers", label: "Subscribers" },
  ] },
  { title: "Content", items: [
    { s: "events", href: "/admin/events", label: "Events" },
    { s: "blog", href: "/admin/blog", label: "Blog" },
    { s: "programs", href: "/admin/programs", label: "Programs" },
    { s: "board", href: "/admin/board", label: "Board members" },
    { s: "alumni", href: "/admin/alumni", label: "Alumni" },
    { s: "reports", href: "/admin/reports", label: "Yearly reports" },
    { s: "scholarships", href: "/admin/scholarships", label: "Outside scholarships" },
  ] },
  { title: "Settings", items: [
    { s: "users", href: "/admin/users", label: "Staff & users" },
    { s: "settings", href: "/admin/settings", label: "Site settings" },
  ] },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, ready } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const newApps = useData("applications").filter(a => a.status === "New").length;
  const newMsgs = useData("messages").filter(m => m.status === "New").length;
  const pendingAlumni = useData("alumni").filter(a => !a.published).length;
  const badge: Partial<Record<Section, number>> = { applications: newApps, messages: newMsgs, alumni: pendingAlumni };

  useEffect(() => { if (ready && !isStaff(user?.role)) router.replace("/login"); }, [ready, user, router]);
  useEffect(() => setOpen(false), [pathname]);

  if (!ready || !user || !isStaff(user.role)) return <div className="admin-loading">Loading…</div>;

  const section = groups.flatMap(g => g.items).filter(i => pathname === i.href || (i.href !== "/admin" && pathname.startsWith(i.href)))[0];
  const allowed = !section || can(user.role, section.s);

  return (
    <div className="admin">
      <aside className={"admin-nav" + (open ? " open" : "")}>
        <Link className="admin-brand" href="/admin"><img src="/assets/logo.png" alt="LCTC Foundation" width={1781} height={483} /><span>Admin</span></Link>
        <nav aria-label="Admin">
          {groups.map(g => {
            const items = g.items.filter(i => can(user.role, i.s));
            if (!items.length) return null;
            return (
              <div key={g.title}>
                <p>{g.title}</p>
                {items.map(i => (
                  <Link key={i.href} href={i.href} className={section?.href === i.href ? "on" : ""} aria-current={section?.href === i.href ? "page" : undefined}>
                    {i.label}{badge[i.s] ? <span className="nav-badge">{badge[i.s]}</span> : null}
                  </Link>
                ))}
              </div>
            );
          })}
        </nav>
        <div className="admin-me">
          <b>{user.name}</b>
          <span className="role-pill">{roleLabels[user.role]}</span>
          <div>
            <Link href="/" target="_blank">View site ↗</Link>
            <button type="button" onClick={() => { signOut(); router.replace("/login"); }}>Sign out</button>
          </div>
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-top">
          <button className="admin-burger" type="button" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(o => !o)}>☰</button>
          <span className="demo-flag">Demo checkout: no cards are charged</span>
        </div>
        {allowed ? children : (
          <div className="admin-card"><h1>No access</h1><p className="hint">Your role ({roleLabels[user.role]}) can&apos;t open this section. Ask a super admin if you need it.</p></div>
        )}
      </div>
    </div>
  );
}
