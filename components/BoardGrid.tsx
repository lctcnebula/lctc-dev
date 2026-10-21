"use client";

import Link from "next/link";
import { boardSlug, useData } from "@/lib/store";
import type { BoardMember } from "@/lib/seed";
import { SampleTag } from "./Live";

const initials = (n: string) => n.replace(/^(dr|mr|ms|mrs)\.\s+/i, "").split(/\s+/).filter(w => /^[A-Za-z]/.test(w)).slice(0, 2).map(w => w[0]).join("").toUpperCase();

export function Avatar({ m, size = 160 }: { m: BoardMember; size?: number }) {
  return (
    <div className="avatar">{m.photo ? <img src={m.photo} alt="" width={size} height={size} /> : <span aria-hidden="true">{m.sample ? <svg viewBox="0 0 24 24" width="44" height="44" fill="currentColor"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" /></svg> : initials(m.name)}</span>}</div>
  );
}

export const useBoard = () => [...useData("board")].sort((a, b) => a.order - b.order);

export default function BoardGrid() {
  const board = useBoard();
  if (!board.length) return <p className="empty">Board members will be listed here soon.</p>;
  return (
    <div className="people">
      {board.map(m => (
        <Link className="person" key={m.id} href={`/board/${boardSlug(m)}`}>
          <Avatar m={m} />
          <small>{m.role}</small>
          <h3>{m.name} <SampleTag show={m.sample} /></h3>
          {m.company && <p className="company">{m.company}</p>}
          {m.bio && <p>{m.bio.trim().split(/\n\s*\n/)[0]}</p>}
          <span className="more">View profile</span>
        </Link>
      ))}
    </div>
  );
}
