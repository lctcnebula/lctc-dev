import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { donationTypes, givingTiers, majorGift, money } from "@/lib/content";

export const metadata: Metadata = { title: "Giving tiers and pricing", description: "Student-level giving tiers for the CTE Month campaign, from a $25 Career Expo registration to a $10,000+ Innovation Catalyst gift." };

const typeName = (slug: string) => donationTypes.find(t => t.slug === slug)?.name ?? slug;

export default function PricingPage() {
  return (
    <>
      <PageHero image="/assets/img/welding.jpg" crumbs={[{ href: "/donate", label: "Donate" }, { label: "Pricing" }]} title="Giving tiers and pricing">
        Behind every tool, every certification exam and every career breakthrough is a donor who saw what was possible.
      </PageHero>

      <section className="block">
        <div className="wrap">
          <div className="head reveal">
            <div>
              <p className="kicker">CTE Month campaign · February 2027</p>
              <h2>Student-level giving tiers</h2>
              <p>Each tier pays for something specific a student needs. Pick one and you&apos;ll go to checkout with the amount filled in.</p>
            </div>
            <Link className="text-link" href="/donations">All types of donations →</Link>
          </div>
          <div className="tiers">
            {givingTiers.map(t => (
              <article className="tier reveal" key={t.name}>
                <h3>{t.name}</h3>
                <p className="tier-price"><b>{money(t.amount)}</b></p>
                <p className="tier-item">{t.item}</p>
                <p className="tier-impact"><span>The impact:</span> {t.impact}</p>
                <p className="hint">Goes to {typeName(t.type)}</p>
                <Link className="btn blue" href={`/donate?tier=${encodeURIComponent(t.name)}`}>Give {money(t.amount)}</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="block tint">
        <div className="wrap">
          <div className="major reveal">
            <div>
              <p className="kicker">{money(majorGift.amount)}+ major investments</p>
              <h2>{majorGift.name}</h2>
              <p>{majorGift.text}</p>
              <div className="hero-actions">
                <Link className="btn spark" href={`/donate?type=innovation&amount=${majorGift.amount}`}>Give {money(majorGift.amount)}</Link>
                <Link className="btn line" href="/contact?topic=Donating">Talk to us about a major gift</Link>
              </div>
            </div>
            <ul>
              {majorGift.areas.map(a => <li key={a.name}><b>{a.name}</b><small>{a.sub}</small><span>{a.text}</span></li>)}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
