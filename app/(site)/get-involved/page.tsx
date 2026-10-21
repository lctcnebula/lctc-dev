import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import WaysToHelp from "@/components/WaysToHelp";
import GiveCta from "@/components/GiveCta";
import { partnerRoadmap, pillars } from "@/lib/content";

export const metadata: Metadata = { title: "Get involved", description: "Donate, mentor, partner or sponsor to support Lake County Tech Campus students." };

export default function GetInvolvedPage() {
  return (
    <>
      <PageHero image="/assets/img/catering.jpg" crumbs={[{ label: "Get involved" }]} title="Brighter futures start with you">
        Give your time, your expertise or your company&apos;s support. Pick the way that fits and we&apos;ll take it from there.
      </PageHero>

      <section className="block">
        <div className="wrap">
          <div className="head reveal">
            <div>
              <p className="kicker">Give</p>
              <h2>Choose a pillar to support</h2>
              <p>The Foundation&apos;s work rests on four pillars. Every gift, any size, goes straight to students.</p>
            </div>
            <Link className="text-link" href="/donations">All types of donations →</Link>
          </div>
          <div className="pillars">
            {pillars.map(p => (
              <Link className="reveal" key={p.name} href={`/donate?type=${p.type}`}>
                <i aria-hidden="true">{p.icon}</i>
                <b>{p.name}</b>
                <span>{p.text}</span>
                <em>Give to this pillar →</em>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="head reveal">
            <div>
              <p className="kicker">For businesses</p>
              <h2>T.E.C.H. Industry Partner Roadmap</h2>
              <p>Empowering students through industry collaboration. Start anywhere: following us online is a first step, and funding scholarships is the last.</p>
            </div>
            <Link className="text-link" href="/contact?topic=Business%20partnership">Become a partner →</Link>
          </div>
          <div className="roadmap">
            {partnerRoadmap.map(r => (
              <article className="road reveal" key={r.name}>
                <header><i aria-hidden="true">{r.letter}</i><h3>{r.name}</h3><small>{r.sub}</small></header>
                <ol>{r.steps.map(x => <li key={x}>{x}</li>)}</ol>
              </article>
            ))}
          </div>
          <p className="hint center"><b>Give Me Ten + TECH 50:</b> students start with ten hours of workplace exposure, then can earn up to fifty hours of paid, skill-based experience with a training-site partner.</p>
        </div>
      </section>

      <section className="block tint">
        <div className="wrap">
          <div className="head reveal">
            <div>
              <p className="kicker">Volunteer &amp; partner</p>
              <h2>More ways to help</h2>
            </div>
            <Link className="text-link" href="/contact">Contact the Foundation →</Link>
          </div>
          <WaysToHelp />
        </div>
      </section>

      <section className="block">
        <div className="wrap"><GiveCta /></div>
      </section>
    </>
  );
}
