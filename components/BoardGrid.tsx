"use client";

import { useData } from "@/lib/store";
import { SampleTag } from "./Live";

const initials = (n: string) => n.split(/\s+/).filter(w => /^[A-Za-z]/.test(w)).slice(0, 2).map(w => w[0]).join("").toUpperCase();

export default function BoardGrid() {
  const board = [...useData("board")].sort((a, b) => a.order - b.order);
  if (!board.length) return <p className="empty">Board members will be listed here soon.</p>;
  return (
    <div className="people">
      {board.map(m => (
        <article className="person" key={m.id}>
          <div className="avatar">{m.photo ? <img src={m.photo} alt="" width={160} height={160} /> : <span aria-hidden="true">{m.sample ? <svg viewBox="0 0 24 24" width="44" height="44" fill="currentColor"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" /></svg> : initials(m.name)}</span>}</div>
          <small>{m.role}</small>
          <h3>{m.name} <SampleTag show={m.sample} /></h3>
          {m.bio && <p>{m.bio}</p>}
        </article>
      ))}
    </div>
  );
}
