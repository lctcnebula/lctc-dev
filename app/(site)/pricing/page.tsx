import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { donationTypes, givingTiers, majorGift, money } from "@/lib/content";

export const metadata: Metadata = { title: "Giving tiers and pricing", description: "Student-level giving tiers for the CTE Month campaign, from a $25 Career Expo registration to a $10,000+ Innovation Catalyst gift." };

const typeName = (slug: string) => donationTypes.find(t => t.slug === slug)?.name ?? slug;
const give = (name: string) => `/donate?tier=${encodeURIComponent(name)}`;
const price = (t: { amount: number; min?: boolean }) => money(t.amount) + (t.min ? "+" : "");

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
              <p>Each tier has a fixed price and pays for something specific a student needs. At checkout you choose how many, for example two $500 toolkits.</p>
            </div>
            <Link className="text-link" href="/donations">All types of donations →</Link>
          </div>
          <table className="price-table reveal">
            <thead><tr><th scope="col">Giving opportunity</th><th scope="col">Amount</th><th scope="col"><span className="sr-only">Give</span></th></tr></thead>
            <tbody>
              <tr>
                <th scope="row">General donation<small>Goes wherever students need it most</small></th>
                <td>Any amount</td>
                <td><Link className="text-link" href="/donate?type=general">Give →</Link></td>
              </tr>
              {givingTiers.map(t => (
                <tr key={t.name}>
                  <th scope="row">{t.item}<small>{t.name}</small></th>
                  <td>{price(t)}{!t.min && <small> each</small>}</td>
                  <td><Link className="text-link" href={give(t.name)} aria-label={`Give ${price(t)} for ${t.item.toLowerCase()}`}>Give →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="tiers">
            {givingTiers.filter(t => !t.min).map(t => (
              <article className="tier reveal" key={t.name}>
                <h3>{t.name}</h3>
                <p className="tier-price"><b>{money(t.amount)}</b></p>
                <p className="tier-item">{t.item}</p>
                <p className="tier-impact"><span>The impact:</span> {t.impact}</p>
                <p className="hint">Goes to {typeName(t.type)}</p>
                <Link className="btn blue" href={give(t.name)}>Give {money(t.amount)}</Link>
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
                <Link className="btn spark" href={give(majorGift.name)}>Give {money(majorGift.amount)}+</Link>
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
