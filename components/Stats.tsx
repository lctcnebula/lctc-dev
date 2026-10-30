"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useData } from "@/lib/store";

const fmt = (n: number) => n.toLocaleString("en-US");

/** Figures from the most recent yearly report (Admin → Yearly reports). */
export default function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const reports = useData("reports");
  const r = [...reports].sort((a, b) => b.year.localeCompare(a.year))[0];
  const stats = r ? [
    { value: r.students, label: "students supported" },
    { value: r.scholarships, label: "scholarships & grants" },
    { value: r.granted, prefix: "$", label: "awarded to students" },
    { value: r.donors, label: "donors" },
  ] : [];

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target as HTMLElement, end = +el.dataset.count!, pre = el.dataset.prefix || "";
      const t0 = performance.now(), dur = 1400;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = pre + fmt(Math.round(end * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), { threshold: .6 });
    ref.current?.querySelectorAll("[data-count]").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [r]);

  if (!r) return null;
  return (
    <div className="stat-strip">
      <div className="wrap">
        <div className="stats" ref={ref}>
          {stats.map(s => (
            <div className="stat" key={s.label}>
              <b data-count={s.value} data-prefix={s.prefix}>{s.prefix}{fmt(s.value)}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        <p className="stat-note">
          {r.sample ? <><span className="sample-tag">Sample figures</span> </> : null}
          {r.year} school year · <Link href="/impact">See every year →</Link>
        </p>
      </div>
    </div>
  );
}
