import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import BoardGrid from "@/components/BoardGrid";

export const metadata: Metadata = { title: "Board of directors", description: "The staff and volunteer board who lead the Lake County Tech Campus Foundation." };

export default function BoardPage() {
  return (
    <>
      <PageHero image="/assets/img/mentoring.jpg" crumbs={[{ href: "/about", label: "About" }, { label: "Board" }]} title="Our board of directors">
        Business, industry, education and community leaders who volunteer their time to advance student success across Lake and McHenry Counties.
      </PageHero>
      <section className="block tint"><div className="wrap"><BoardGrid /></div></section>
    </>
  );
}
