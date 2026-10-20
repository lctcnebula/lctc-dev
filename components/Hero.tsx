"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { slides } from "@/lib/content";
import { DonateButton } from "./Actions";
import { eventParts, timeRange } from "./EventCard";
import { useUpcomingEvents } from "./UpcomingEvents";

const DUR = 6000;
const pad = (n: number) => String(n).padStart(2, "0");

export default function Hero() {
  const next = useUpcomingEvents()[0];
  const nextEvent = next && { title: next.title, slug: next.slug, date: eventParts(next.date).long, time: timeRange(next) };
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0); // bumps to restart the dot progress animation
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  const n = slides.length;

  const go = useCallback((k: number) => { setI((k + n) % n); setCycle(c => c + 1); }, [n]);

  useEffect(() => {
    clearInterval(timer.current);
    if (paused || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer.current = setInterval(() => { setI(x => (x + 1) % n); setCycle(c => c + 1); }, DUR);
    return () => clearInterval(timer.current);
  }, [paused, n, cycle]);

  return (
    <section className={"hero" + (paused ? " paused" : "")} id="top" aria-roledescription="carousel" aria-label="Students at work"
      style={{ "--dur": DUR + "ms" } as React.CSSProperties} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {slides.map((s, k) => (
        <div key={s.src} className={"slide" + (k === i ? " active" : "")} aria-hidden={k !== i}>
          <img src={s.src} alt={s.alt} width={s.w} height={s.h} fetchPriority={k === 0 ? "high" : undefined} loading={k === 0 ? "eager" : "lazy"} />
        </div>
      ))}

      <div className="hero-copy">
        <div className="wrap">
          <div>
            <p className="eyebrow">Lake County Tech Campus Foundation</p>
            <h1>Skills. Success. <em>Future.</em></h1>
            <p className="lede">We help Lake County students turn hands-on career training into real careers, through scholarships, grants, tools, certifications and the community behind them.</p>
            <div className="hero-actions">
              <DonateButton className="btn spark">Donate today</DonateButton>
              <Link className="btn ghost" href="/apply">Students: apply for aid</Link>
            </div>
          </div>
          {nextEvent && (
            <Link className="next-up" href={`/events/${nextEvent.slug}`}>
              <small>Next Foundation event</small>
              <b>{nextEvent.title}</b>
              <span>{nextEvent.date} · <span className="nowrap">{nextEvent.time}</span></span>
            </Link>
          )}
        </div>
      </div>

      <div className="slide-ui">
        <div className="wrap">
          <p className="caption" aria-live="polite"><b>{pad(i + 1)}</b> / {pad(n)} &nbsp;·&nbsp; {slides[i].caption}</p>
          <div className="dots" role="group" aria-label="Choose slide">
            {slides.map((s, k) => (
              <button key={k === i ? `on-${cycle}` : s.src} className={"dot" + (k === i ? " active" : "")} type="button" aria-label={"Show " + s.caption} aria-current={k === i} onClick={() => go(k)} />
            ))}
          </div>
          <button className="arrow" type="button" aria-label="Previous slide" onClick={() => go(i - 1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button className="arrow" type="button" aria-label="Next slide" onClick={() => go(i + 1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
