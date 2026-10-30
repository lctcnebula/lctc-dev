import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Stats from "@/components/Stats";
import { ContactDetails, MemberSchools } from "@/components/Live";
import { campusFacts, mission, pillars, site } from "@/lib/content";

export const metadata: Metadata = { title: "About", description: `About the ${site.name} and Lake County Tech Campus.` };

export default function AboutPage() {
  return (
    <>
      <PageHero image="/assets/img/welding.jpg" crumbs={[{ label: "About" }]} title="A foundation for the careers Lake County runs on">
        Launched July 1, 2026 to expand opportunities for Lake County Tech Campus students across Lake and McHenry Counties.
      </PageHero>
      <div style={{ height: 54 }} />
      <Stats />

      <section className="block">
        <div className="wrap split">
          <div className="copy reveal">
            <p className="kicker">Who we are</p>
            <h2>Built around student opportunity</h2>
            <p>The <strong>{site.name}</strong> is a nonprofit created from Tech Campus&apos;s five-year strategic plan, which puts work-based learning, industry partnerships and career readiness first.</p>
            <p>Employers across our region face talent shortages and fast-changing technology. The Foundation is the link between Tech Campus and the business community: it secures funding for lab equipment, credentialing fees, student scholarships and work-based learning, so students graduate with real experience and a clear path into high-demand careers.</p>
            <p>The Foundation is overseen by Elizabeth Del Rio, Foundation and Stakeholder Relations Officer, and guided by a volunteer board of business, industry, education and community leaders.</p>
            <div className="facts">
              {campusFacts.map(f => <div key={f.label}><b>{f.value}</b><span>{f.label}</span></div>)}
            </div>
            <div className="hero-actions">
              <Link className="btn blue" href="/get-involved">Get involved</Link>
              <Link className="btn line" href="/board">Meet the board</Link>
            </div>
          </div>
          <div className="stack reveal">
            <div className="big"><img src="/assets/img/graduates.jpg" alt="Two smiling graduates in caps and gowns" width={1024} height={683} loading="lazy" /></div>
            <ContactDetails className="contact-card" />
          </div>
        </div>
      </section>

      <section className="block tint">
        <div className="wrap">
          <div className="mission-block reveal">
            <p className="kicker">Our mission</p>
            <p className="mission">{mission}</p>
          </div>
          <div className="promises reveal">
            <div><small>Our purpose</small><b>Open doors to opportunity</b><p>Bring together community partners, industry leaders and philanthropic resources to expand opportunities for Tech Campus students.</p></div>
            <div><small>Our commitment</small><b>Invest in what&apos;s possible</b><p>Strengthen career and technical education through meaningful experiences, innovative programs, industry-recognized credentials and student scholarships.</p></div>
            <div><small>Our promise</small><b>Build the foundation for what&apos;s next</b><p>Champion opportunities that help students build the skills, confidence and experience to take their next step.</p></div>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="head reveal">
            <div>
              <p className="kicker">Four pillars</p>
              <h2>Where the Foundation focuses</h2>
            </div>
            <Link className="text-link" href="/donations">Ways to give →</Link>
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

      <MemberSchools />

      <section className="block">
        <div className="wrap">
          <div className="head reveal"><div><p className="kicker">More about us</p><h2>The people and the numbers</h2></div></div>
          <div className="link-cards">
            <Link href="/board"><b>Board of directors</b><span>The volunteers who lead the Foundation.</span></Link>
            <Link href="/impact"><b>Yearly impact</b><span>Students reached, dollars awarded, year by year.</span></Link>
            <Link href="/alumni"><b>Alumni</b><span>Where our students go next.</span></Link>
            <Link href="/blog"><b>Blog</b><span>Event recaps and Foundation news.</span></Link>
          </div>
        </div>
      </section>

      <section className="photo-band" aria-label="Our belief">
        <img src="/assets/img/sparks.jpg" alt="" width={1024} height={696} loading="lazy" />
        <div className="wrap reveal">
          <blockquote>Every student deserves to step confidently into the workforce or higher education.</blockquote>
          <cite>{site.name}</cite>
        </div>
      </section>
    </>
  );
}
