"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/apply", label: "Apply for aid", className: "apply-link" },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 10);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isOn = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className={"site" + (scrolled ? " scrolled" : "")}>
      <div className="wrap bar">
        <Link className="brand" href="/" aria-label="LCTC Foundation home">
          <img src="/assets/logo.png" alt="Lake County Tech Campus Foundation" width={1781} height={483} />
        </Link>
        <nav className={"main" + (open ? " open" : "")} id="nav" aria-label="Main">
          <ul>
            {links.map(l => (
              <li key={l.href}>
                <Link href={l.href} className={[l.className, isOn(l.href) && "on"].filter(Boolean).join(" ")} aria-current={isOn(l.href) ? "page" : undefined} onClick={() => setOpen(false)}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link className={"pill-btn" + (isOn("/donate") ? " on" : "")} href="/donate">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.5 3 4.5 6.8 4.5c2.1 0 3.6 1.1 4.2 2.4h2c.6-1.3 2.1-2.4 4.2-2.4 3.8 0 5.9 4 4.4 7.3C19.5 16.4 12 21 12 21Z" /></svg>
          Donate
        </Link>
        <button className="menu-toggle" type="button" aria-controls="nav" aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(o => !o)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
