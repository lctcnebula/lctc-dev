"use client";

import Link from "next/link";
import { boardSlug } from "@/lib/store";
import { Avatar, useBoard } from "./BoardGrid";
import { Missing } from "./Missing";
import { SampleTag } from "./Live";
import { Prose } from "./Prose";

export default function BoardProfile({ slug }: { slug: string }) {
  const board = useBoard();
  const i = board.findIndex(m => boardSlug(m) === slug);
  if (i < 0) return <Missing what="board member" back="/board" />;
  const m = board[i], prev = board[i - 1], next = board[i + 1];
  const first = m.name.replace(/^(dr|mr|ms|mrs)\.\s+/i, "").split(/\s+/)[0];

  return (
    <>
      <section className="page-hero short">
        <div className="wrap">
          <p className="crumbs"><Link href="/">Home</Link> / <Link href="/about">About</Link> / <Link href="/board">Board</Link> / {m.name}</p>
        </div>
      </section>

      <section className="block">
        <div className="wrap profile">
          <div className="profile-card person">
            <Avatar m={m} size={320} />
            <small>{m.role}</small>
            <h1>{m.name} <SampleTag show={m.sample} /></h1>
            {m.company && <p className="company">{m.company}</p>}
            {m.linkedin && <a className="btn line sm" href={m.linkedin} target="_blank" rel="noopener">LinkedIn ↗</a>}
          </div>
          <div>
            <p className="kicker">About {first}</p>
            {m.bio.trim()
              ? <Prose text={m.bio} />
              : <p className="lead-muted">{m.name} serves as {/^[aeiou]/i.test(m.role) ? "an" : "a"} {m.role} of the Lake County Tech Campus Foundation, helping expand opportunities for students across Lake and McHenry Counties.</p>}
            <div className="hero-actions">
              <Link className="btn blue" href="/contact?topic=General%20question">Contact the Foundation</Link>
              <Link className="btn line" href="/board">All board members</Link>
            </div>
          </div>
        </div>

        <nav className="wrap profile-nav" aria-label="Other board members">
          {prev ? <Link href={`/board/${boardSlug(prev)}`}><small>← Previous</small><b>{prev.name}</b></Link> : <span />}
          {next ? <Link className="next" href={`/board/${boardSlug(next)}`}><small>Next →</small><b>{next.name}</b></Link> : <span />}
        </nav>
      </section>
    </>
  );
}
