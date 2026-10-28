import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { seed } from "@/lib/seed";

export const metadata: Metadata = { title: "Site map", description: "Every page on the Lake County Tech Campus Foundation website." };

const groups = [
  { name: "Foundation", links: [["/", "Home"], ["/about", "About"], ["/board", "Board of directors"], ["/impact", "Yearly impact"], ["/alumni", "Alumni"], ["/contact", "Contact"]] },
  { name: "Give & get involved", links: [["/donate", "Donate"], ["/donate#partner", "Industry Partner Roadmap"], ["/donate#volunteer", "Volunteer"]] },
  { name: "Students", links: [["/programs", "Programs"], ["/apply", "Apply for aid"]] },
  { name: "News", links: [["/events", "Events"], ["/blog", "Blog"]] },
  { name: "About this site", links: [["/privacy", "Privacy policy"], ["/login", "Sign in"]] },
];

export default function SiteMapPage() {
  return (
    <>
      <PageHero image="/assets/img/construction.jpg" crumbs={[{ label: "Site map" }]} title="Site map" />
      <section className="block">
        <div className="wrap site-map">
          {groups.map(g => (
            <div key={g.name}>
              <h2>{g.name}</h2>
              <ul>{g.links.map(([href, label]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul>
            </div>
          ))}
          <div>
            <h2>Programs</h2>
            <ul>{seed.programs.map(p => <li key={p.slug}><Link href={`/programs/${p.slug}`}>{p.name}</Link></li>)}</ul>
          </div>
        </div>
      </section>
    </>
  );
}
