import Link from "next/link";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import UpcomingEvents from "@/components/UpcomingEvents";
import GiveCta from "@/components/GiveCta";
import { DonateButton } from "@/components/Actions";
import { OutsideScholarshipsLink, ProgramCount, ProgramPaths, SchoolTicker } from "@/components/Live";
import { grantTypes, site } from "@/lib/content";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />

      <SchoolTicker />

      <section className="intro reveal">
        <div className="wrap">
          <h2>Creating bright futures for students and families in Lake County</h2>
          <p>Tech Campus students learn a trade with their hands, on the same equipment they&apos;ll use at work. The Foundation makes sure cost never decides who gets to finish.</p>
          <p style={{ marginTop: 18 }}><Link className="text-link" href="/about">More about the Foundation →</Link></p>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="head reveal">
            <div>
              <p className="kicker">What we do</p>
              <h2>Building futures, one trade at a time</h2>
              <p>We fill the gaps between a great program and a great start: the fees, gear and connections that help students finish strong.</p>
            </div>
          </div>
          <div className="grid three">
            <article className="card reveal">
              <div className="media"><img src="/assets/img/graduates.jpg" alt="Two smiling graduates in caps and gowns" width={1024} height={683} loading="lazy" /><span className="badge">Celebrating achievements</span></div>
              <div className="content">
                <h3>Scholarships &amp; grants</h3>
                <p>Scholarships for students heading to college, apprenticeships or the workforce, plus grants for students who need help right now.</p>
                <Link className="more" href="/apply">Apply for aid</Link>
              </div>
            </article>
            <article className="card reveal">
              <div className="media"><img src="/assets/img/welder-shop.jpg" alt="A welding student in an apron inspecting a metal piece in the shop" width={1024} height={683} loading="lazy" /><span className="badge">Removing barriers</span></div>
              <div className="content">
                <h3>Tools &amp; Equipment</h3>
                <p>Starter kits, uniforms and protective gear, so no student misses out because of what their family can afford.</p>
                <DonateButton className="more" fund="innovation">Help equip a student</DonateButton>
              </div>
            </article>
            <article className="card reveal">
              <div className="media"><img src="/assets/img/nurse-sim.jpg" alt="A health careers student practicing patient care in a simulation lab" width={1023} height={716} loading="lazy" /><span className="badge">Empowering futures</span></div>
              <div className="content">
                <h3>Certifications</h3>
                <p>Covering exam and licensing fees so students leave with the industry credentials employers ask for.</p>
                <DonateButton className="more" fund="credentials">Fund a certification</DonateButton>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="aid" aria-labelledby="aid-title">
        <div className="wrap" style={{ paddingBlock: "clamp(80px, 10vw, 120px)" }}>
          <div className="reveal">
            <p className="kicker">For students</p>
            <h2 id="aid-title">Need help finishing your program?</h2>
            <p className="sub">Any Tech Campus student can apply for Foundation support. One short application covers scholarships, grants for tools and fees, and emergency help. It takes about 10 minutes, and your progress saves as you go.</p>
            <div className="hero-actions">
              <Link className="btn spark" href="/apply">Start your application</Link>
              <OutsideScholarshipsLink />
            </div>
          </div>
          <div className="aid-list reveal">
            {grantTypes.map(g => (
              <div className="aid-item" key={g.id}>
                <i aria-hidden="true">{g.icon}</i>
                <b>{g.name}</b>
                <span>{g.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block tint">
        <div className="wrap">
          <div className="head reveal">
            <div>
              <p className="kicker">The programs you support</p>
              <h2>Programs your gift reaches</h2>
              <p>Every program pairs classroom learning with real equipment and industry standards.</p>
            </div>
            <Link className="text-link" href="/programs">See all <ProgramCount /> programs →</Link>
          </div>
          <ProgramPaths limit={6} />
        </div>
      </section>

      <section className="photo-band" aria-label="Our belief">
        <img src="/assets/img/sparks.jpg" alt="" width={1024} height={696} loading="lazy" />
        <div className="wrap reveal">
          <blockquote>Every student deserves a skill they can build a life on.</blockquote>
          <cite>{site.name}</cite>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="head reveal">
            <div>
              <p className="kicker">Events</p>
              <h2>We are stronger together</h2>
              <p>Foundation gatherings where donors, alumni and students meet. RSVP online in a minute.</p>
            </div>
            <Link className="text-link" href="/events">All events →</Link>
          </div>
          <UpcomingEvents limit={3} />
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <GiveCta />
          <p style={{ textAlign: "center", marginTop: 28 }}><Link className="text-link" href="/get-involved">More ways to help →</Link></p>
        </div>
      </section>
    </>
  );
}
