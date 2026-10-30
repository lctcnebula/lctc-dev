import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import { ContactDetails } from "@/components/Live";
import { site } from "@/lib/content";

export const metadata: Metadata = { title: "Contact", description: `Contact the ${site.name}.` };

export default function ContactPage() {
  return (
    <>
      <PageHero image="/assets/img/laptops.jpg" crumbs={[{ label: "Contact" }]} title="We'd love to hear from you">
        Whether you want to give, mentor, partner or simply learn more, reach out.
      </PageHero>
      <section className="block tint">
        <div className="wrap apply-layout">
          <ContactForm />
          <div className="aside">
            <div className="aside-box">
              <ContactDetails className="contact-list" maps />
            </div>
            <div className="aside-box tinted">
              <h3>Students</h3>
              <p className="hint">Looking for financial help? Use the <Link href="/apply">grant application</Link> instead.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
