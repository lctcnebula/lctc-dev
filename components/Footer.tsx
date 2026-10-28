import Link from "next/link";
import { photoCredits, site } from "@/lib/content";
import { ContactDetails } from "./Live";

export default function Footer() {
  return (
    <footer className="site">
      <div className="wrap">
        <div className="foot">
          <div>
            <span className="logo-chip"><img src="/assets/logo.png" alt="Lake County Tech Campus Foundation" width={1781} height={483} loading="lazy" /></span>
            <p>{site.tagline}</p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul className="two-col">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/donate">Donate</Link></li>
              <li><Link href="/programs">Programs</Link></li>
              <li><Link href="/donate#partner">Partner with us</Link></li>
              <li><Link href="/events">Events</Link></li>
              <li><Link href="/privacy">Privacy policy</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/site-map">Site map</Link></li>
            </ul>
          </div>
          <div>
            <h4>Foundation</h4>
            <ul>
              <li><Link href="/board">Board of directors</Link></li>
              <li><Link href="/impact">Yearly impact</Link></li>
              <li><Link href="/alumni">Alumni</Link></li>
              <li><Link href="/apply">Apply for aid</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ContactDetails className="foot-contact" />
            <p style={{ marginTop: 16 }}><Link href="/login">Sign in →</Link></p>
          </div>
        </div>

        <details className="credits">
          <summary>Photo credits</summary>
          <ul>
            {photoCredits.map(c => (
              <li key={c.text}>{c.text}: <a href={c.byUrl} target="_blank" rel="noopener">{c.by}</a>, {c.license}</li>
            ))}
          </ul>
        </details>

        <div className="fine">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span><Link href="/privacy">Privacy policy</Link> · <Link href="/site-map">Site map</Link></span>
        </div>
      </div>
    </footer>
  );
}
