import type { Metadata } from "next";
import Link from "next/link";
import ApplyForm from "@/components/ApplyForm";
import OutsideScholarships from "@/components/OutsideScholarships";
import { EmailLink } from "@/components/Live";

export const metadata: Metadata = {
  title: "Apply for a grant",
  description: "Lake County Tech Campus students can apply for Foundation scholarships, tools and equipment grants, certification fee grants and emergency help.",
};

export default function ApplyPage() {
  return (
    <>
      <section className="page-hero">
        <img src="/assets/img/graduates.jpg" alt="" width={1024} height={683} />
        <div className="wrap">
          <p className="crumbs"><Link href="/">Home</Link> / Student aid</p>
          <h1>Apply for Foundation support</h1>
          <p>Scholarships, grants for tools and fees, and emergency help for Lake County Tech Campus students. One application covers all of it.</p>
        </div>
      </section>

      <section className="block tint" style={{ paddingTop: "clamp(48px, 6vw, 72px)" }}>
        <div className="wrap apply-layout">
          <ApplyForm />
          <div className="aside">
            <div className="aside-box">
              <h3>Who can apply</h3>
              <ul>
                <li>Any student currently enrolled in a Tech Campus program</li>
                <li>Juniors, seniors and adult learners</li>
              </ul>
            </div>
            <div className="aside-box">
              <h3>How it works</h3>
              <ol>
                <li>Fill in the four short steps (about 10 minutes).</li>
                <li>Press &quot;Submit application&quot;. It goes straight to the Foundation, and you get a confirmation number.</li>
                <li>The Foundation reviews your application and may contact your instructor.</li>
                <li>We email you with a decision.</li>
              </ol>
            </div>
            <div className="aside-box tinted">
              <h3>Questions?</h3>
              <p className="hint">Email <EmailLink />. Your school counselor can also help.</p>
            </div>
          </div>
        </div>
      </section>

      <OutsideScholarships />
    </>
  );
}
