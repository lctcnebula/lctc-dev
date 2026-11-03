"use client";

import Link from "next/link";
import { useData } from "@/lib/store";
import { categories, type Category } from "@/lib/seed";
import { SampleTag } from "./Live";

// The Programs page: one photo card per program, linking to its page.
export default function ProgramExplorer() {
  const programs = useData("programs");
  const label = (c: Category) => categories.find(x => x.id === c)?.label;
  const areas = new Set(programs.map(p => p.cat)).size;

  if (!programs.length) return <p className="empty">Programs will appear here once they&apos;re added.</p>;
  return (
    <>
      <div className="head reveal">
        <div>
          <p className="kicker">{programs.length} programs · {areas} career areas</p>
          <h2>Find a program</h2>
          <p>Every program pairs classroom learning with real equipment and industry standards. Open one to see what students learn and where it leads.</p>
        </div>
      </div>
      <div className="program-cards">
        {programs.map((p, k) => (
          <Link key={p.id} className="program-card" href={`/programs/${p.slug}`} style={{ animationDelay: k * 25 + "ms" }}>
            <div className="pc-media">
              <img src={p.image} alt="" width={640} height={420} loading={k < 6 ? "eager" : "lazy"} />
              <span className="pc-cat">{label(p.cat)}</span>
              <SampleTag show={p.sample} />
            </div>
            <div className="pc-body">
              <i aria-hidden="true">{p.icon}</i>
              <h3>{p.name}</h3>
              <p>{p.summary}</p>
              <footer>
                {p.length ? <small>{p.length}</small> : <span />}
                <em>Explore program →</em>
              </footer>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
