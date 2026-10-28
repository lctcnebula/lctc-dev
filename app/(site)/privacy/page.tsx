import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { EmailLink } from "@/components/Live";
import { site } from "@/lib/content";

export const metadata: Metadata = { title: "Privacy policy", description: `How the ${site.name} website handles the information you share.` };

// Describes how this site actually works today (front-end only, data kept in the visitor's browser).
// Update it when the site moves to a real database or payment processor.
export default function PrivacyPage() {
  return (
    <>
      <PageHero image="/assets/img/laptops.jpg" crumbs={[{ label: "Privacy policy" }]} title="Privacy policy">
        How this website handles the information you share with us.
      </PageHero>
      <section className="block">
        <div className="wrap narrow prose">
          <p><em>Last updated October 28, 2026.</em></p>

          <h2>What you share</h2>
          <p>The forms on this site ask for what we need to respond: your name and email, and for some forms a phone number, your program, your school or a message. Grant applications also ask about your plans, an essay and contacts for an instructor and a parent or guardian.</p>

          <h2>Where it goes</h2>
          <p>This version of the website has no server or database. What you enter in a form is saved in your own browser so Foundation staff can review it from the admin dashboard on that device. It is not sent to us over the internet, sold or shared with anyone.</p>
          <p>Donations on this site run in demo mode: no card is charged and card numbers are never stored.</p>

          <h2>Third-party services</h2>
          <ul>
            <li><b>Google Maps</b> shows the campus location on the <Link href="/contact">contact page</Link>. Google may set cookies when the map loads.</li>
            <li><b>Google reCAPTCHA</b>, when turned on, helps keep spam out of the contact form. It is covered by Google&apos;s privacy policy and terms.</li>
          </ul>

          <h2>Students</h2>
          <p>Student applications are used only to review requests for Foundation support. The Foundation may contact the instructor or guardian listed on the application.</p>

          <h2>Your choices</h2>
          <p>You can clear what this site saved by clearing your browser&apos;s site data. To ask about anything you shared, email <EmailLink />.</p>
        </div>
      </section>
    </>
  );
}
