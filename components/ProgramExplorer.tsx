"use client";

import Link from "next/link";
import { useData } from "@/lib/store";
import { SampleTag } from "./Live";

export default function ProgramExplorer() {
  const programs = useData("programs");

  if (!programs.length) return <p className="empty">Programs will appear here once they&apos;re added.</p>;
  return (
    <div className="paths">
      {programs.map((p, k) => (
        <Link key={p.id} className="path" href={`/programs/${p.slug}`} style={{ animationDelay: k * 25 + "ms" }}>
          <i aria-hidden="true">{p.icon}</i>
          <div>
            <b>{p.name} <SampleTag show={p.sample} /></b>
            <span>{p.summary}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
