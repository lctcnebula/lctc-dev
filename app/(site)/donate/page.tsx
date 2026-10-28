import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import DonateCheckout from "@/components/DonateCheckout";
import WaysToHelp from "@/components/WaysToHelp";
import { EmailLink } from "@/components/Live";
import { majorGift, money, partnerRoadmap, programImpact } from "@/lib/content";

export const metadata: Metadata = { title: "Donate", description: "Fund certifications, toolkits, work-based learning and scholarships for Lake County Tech Campus students, or partner with the Foundation." };

export default function DonatePage() {
  return (
    <>
      <PageHero image="/assets/img/graduates.jpg" crumbs={[{ label: "Donate" }]} title="Give a student their start">
        Behind every tool, every certification exam and every career breakthrough is a donor who saw what was possible.
      </PageHero>

      <section className="block tint" id="give">
        <div className="wrap">
          <div className="head reveal">
            <div>
              <p className="kicker">Giving opportunities</p>
              <h2>Choose what you fund</h2>
              <p>Each gift pays for something specific a student needs. Pick one, then choose how many.</p>
            </div>
          </div>
          <DonateCheckout>
            <div className="aside">
              <div className="aside-box">
                <h3>Other ways to give</h3>
                <ul>
                  <li><Link href="/contact?topic=Donating%20equipment">Donate tools or equipment</Link></li>
                  <li><Link href="/contact?topic=Donating">Give by check or stock</Link></li>
                  <li><Link href="#partner">Partner as a business</Link></li>
                  <li><Link href="#volunteer">Mentor or volunteer</Link></li>
                </ul>
              </div>
              <div className="aside-box tinted">
                <h3>Questions about giving?</h3>
                <p className="hint">Email <EmailLink /> and we&apos;ll get back to you.</p>
              </div>
            </div>
          </DonateCheckout>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="major reveal">
            <div>
              <p className="kicker">{money(majorGift.amount)}+ major investments</p>
              <h2>{majorGift.name}</h2>
              <p>{majorGift.text}</p>
              <div className="hero-actions">
                <Link className="btn spark" href={`/donate?tier=${encodeURIComponent(majorGift.name)}`}>Give {money(majorGift.amount)}+</Link>
                <Link className="btn line" href="/contact?topic=Donating">Talk to us about a major gift</Link>
              </div>
            </div>
            <ul>
              {majorGift.areas.map(a => <li key={a.name}><b>{a.name}</b><small>{a.sub}</small><span>{a.text}</span></li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="block tint">
        <div className="wrap">
          <div className="head reveal">
            <div>
              <p className="kicker">Program by program</p>
              <h2>What your gift funds</h2>
              <p>Donor gifts go to the equipment, credentials and experiences each program needs.</p>
            </div>
          </div>
          <div className="program-impact">
            {programImpact.map(p => <div className="reveal" key={p.name}><b>{p.name}</b><span>{p.text}</span></div>)}
          </div>
        </div>
      </section>

      <section className="block" id="partner">
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

      <section className="block tint" id="volunteer">
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
    </>
  );
}
