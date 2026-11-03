"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** Shown when a slug isn't in the data. Waits a moment so a page's data can finish loading first. */
export function Missing({ what, back }: { what: string; back: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 150); return () => clearTimeout(t); }, []);
  if (!show) return <div style={{ minHeight: "60vh" }} />;
  return (
    <section className="block" style={{ textAlign: "center", minHeight: "60vh" }}>
      <div className="wrap">
        <p className="kicker" style={{ justifyContent: "center" }}>Not found</p>
        <h2>We couldn&apos;t find that {what}</h2>
        <p style={{ color: "var(--muted)", margin: "18px auto 30px", maxWidth: "46ch" }}>It may have been renamed or removed.</p>
        <Link className="btn blue" href={back}>See all</Link>
      </div>
    </section>
  );
}
