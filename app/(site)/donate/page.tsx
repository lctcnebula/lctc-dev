import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import DonateCheckout from "@/components/DonateCheckout";
import { EmailLink } from "@/components/Live";

export const metadata: Metadata = { title: "Donate", description: "Give to scholarships, tools, certifications and grants for Lake County Tech Campus students." };

const impact = [
  { amt: "$50", text: "gives a student their baseline safety credential" },
  { amt: "$200", text: "pays a state board exam, fingerprinting and licensing fees" },
  { amt: "$500", text: "buys a professional toolkit a student keeps after graduation" },
  { amt: "$1,100", text: "sponsors one student's entire year at Tech Campus" },
];

export default function DonatePage() {
  return (
    <>
      <PageHero image="/assets/img/graduates.jpg" crumbs={[{ label: "Donate" }]} title="Give a student their start">
        Any amount, once or monthly. Every dollar goes to Lake County Tech Campus students.
      </PageHero>

      <section className="block tint" style={{ paddingTop: "clamp(48px, 6vw, 72px)" }}>
        <div className="wrap apply-layout">
          <DonateCheckout />
          <div className="aside">
            <div className="aside-box">
              <h3>What your gift can do</h3>
              <ul className="impact">
                {impact.map(i => <li key={i.amt}><b>{i.amt}</b><span>{i.text}</span></li>)}
              </ul>
            </div>
            <div className="aside-box">
              <h3>Other ways to give</h3>
              <ul>
                <li><Link href="/donations">See every type of donation</Link></li>
                <li><Link href="/pricing">Student giving tiers</Link></li>
                <li><Link href="/contact?topic=Donating%20equipment">Donate tools or equipment</Link></li>
                <li><Link href="/get-involved">Mentor or partner with us</Link></li>
                <li><Link href="/contact?topic=Donating">Give by check or stock</Link></li>
              </ul>
            </div>
            <div className="aside-box tinted">
              <h3>Questions about giving?</h3>
              <p className="hint">Email <EmailLink /> and we&apos;ll get back to you.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
