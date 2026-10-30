"use client";

import { useEffect, useRef, useState } from "react";
import { grantTypes } from "@/lib/content";
import { insert, useData } from "@/lib/store";
import {
  ESSAY_MIN_WORDS, emptyApplication, grades, plansOptions, programYears, stepFields, toText, validate, wordCount,
  type Application, type ApplicationInput, type Errors,
} from "@/lib/application";
import { useSite } from "./Providers";

const DRAFT_KEY = "lctc-grant-draft";
const STEPS = ["About you", "Your request", "Your story", "Review"];

export default function ApplyForm() {
  const [a, setA] = useState<ApplicationInput>(emptyApplication);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
    const [done, setDone] = useState<Application | null>(null);
  const loaded = useRef(false);
  const top = useRef<HTMLDivElement>(null);
  const { getConfetti } = useSite();
  const programs = useData("programs");
  const schools = useData("settings").schools;
  const lists = { schools, programs };

  // Restore a saved draft (and ?program= from a program page), then keep saving as the student types.
  useEffect(() => {
    let draft: Partial<ApplicationInput> = {};
    try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}"); } catch {}
    const program = new URLSearchParams(location.search).get("program");
    setA(prev => ({ ...prev, ...draft, ...(program && programs.some(p => p.slug === program) ? { program } : {}) }));
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current || done) return;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(a)); } catch {}
  }, [a, done]);

  const set = <K extends keyof ApplicationInput>(k: K, v: ApplicationInput[K]) => {
    setA(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
  };

  function goTo(n: number) {
    setStep(n);
    top.current?.scrollIntoView({ block: "start" });
  }

  function next() {
    const e = validate(a, lists, stepFields[step]);
    setErrors(e);
    const first = stepFields[step].find(k => e[k]);
    if (first) { document.getElementById("f-" + first)?.focus(); return; }
    goTo(step + 1);
  }

  async function submit() {
    const e = validate(a, lists);
    setErrors(e);
    const bad = stepFields.findIndex(fs => fs.some(k => e[k]));
    if (bad >= 0) { if (bad !== step) goTo(bad); return; }
    const app: Application = { ...a, id: "LCTC-G-" + Math.random().toString(36).slice(2, 8).toUpperCase(), submittedAt: new Date().toISOString() };
    // Goes straight to Admin → Applications.
    insert("applications", { ...app, status: "New" });
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setDone(app);
    top.current?.scrollIntoView({ block: "start" });
    const fx = await getConfetti();
    fx?.({ particleCount: 140, spread: 90, origin: { y: .4 }, colors: ["#015998", "#ff8a3d", "#5fa8e0", "#ffffff"] });
  }

  function download(app: Application) {
    const url = URL.createObjectURL(new Blob([toText(app, programs)], { type: "text/plain" }));
    Object.assign(document.createElement("a"), { href: url, download: `${app.id}.txt` }).click();
    URL.revokeObjectURL(url);
  }

  function startOver() {
    setA(emptyApplication); setDone(null); setStep(0); setErrors({});
  }

  const err = (k: keyof ApplicationInput) => <p className="err" id={"e-" + k}>{errors[k]}</p>;
  const inv = (k: keyof ApplicationInput) => ({ id: "f-" + k, "aria-invalid": errors[k] ? true : undefined, "aria-describedby": "e-" + k });
  const text = (k: keyof ApplicationInput, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, optional = false) => (
    <div className="field">
      <label htmlFor={"f-" + k}>{label} {optional && <span className="opt">(optional)</span>}</label>
      <input type="text" value={a[k] as string} onChange={e => set(k, e.target.value)} {...inv(k)} {...props} />
      {err(k)}
    </div>
  );
  const select = (k: keyof ApplicationInput, label: string, options: { value: string; label: string }[]) => (
    <div className="field">
      <label htmlFor={"f-" + k}>{label}</label>
      <select value={a[k] as string} onChange={e => set(k, e.target.value)} {...inv(k)}>
        <option value="">Choose…</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {err(k)}
    </div>
  );
  const opts = (xs: string[]) => xs.map(x => ({ value: x, label: x }));

  const minor = a.grade !== "Adult learner";
  const words = wordCount(a.essay);
  const program = programs.find(p => p.slug === a.program);
  const grant = grantTypes.find(g => g.id === a.grantType);

  if (done) {
    return (
      <div className="form-card done-box" ref={top} aria-live="polite">
        <svg className="check" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="36" /><path d="m28 43 10 10 18-20" /></svg>
        <p className="pill-ok">Application received</p>
        <h2 className="form-title">Thank you, {done.firstName}!</h2>
        <p className="form-sub" style={{ marginBottom: 0 }}>Your application for a <b>{grant?.name.toLowerCase()}</b> has been sent to the Foundation. Your confirmation number:</p>
        <p className="conf-id">{done.id}</p>
        <p className="form-sub">Keep this number for your records. The Foundation reviews every application and will email you with a decision. You can download or print a copy below.</p>
        <div className="done-actions">
          <button className="btn blue" type="button" onClick={() => download(done)}>Download a copy</button>
          <button className="btn line" type="button" onClick={() => window.print()}>Print</button>
        </div>
        <p style={{ marginTop: 18 }}><button className="back" type="button" onClick={startOver}>Start another application</button></p>
      </div>
    );
  }

  return (
    <div className="form-card" ref={top} style={{ scrollMarginTop: 110 }}>
      <ol className="stepper">
        {STEPS.map((s, k) => <li key={s} className={k === step ? "on" : k < step ? "done" : ""} aria-current={k === step ? "step" : undefined}>{s}</li>)}
      </ol>

      <form noValidate onSubmit={e => { e.preventDefault(); if (step < 3) next(); else submit(); }}>

        {step === 0 && (
          <section>
            <h2 className="form-title">About you</h2>
            <p className="form-sub">Tell us who you are and where you train.</p>
            <div className="row2">
              {text("firstName", "First name", { autoComplete: "given-name" })}
              {text("lastName", "Last name", { autoComplete: "family-name" })}
            </div>
            <div className="row2">
              {text("email", "Email", { type: "email", autoComplete: "email" })}
              {text("phone", "Phone", { type: "tel", autoComplete: "tel", inputMode: "tel" }, true)}
            </div>
            <div className="row2">
              {select("grade", "Grade", opts(grades))}
              {schools.length ? select("school", "Home high school", [...opts(schools), { value: "Other", label: "Other" }]) : text("school", "Home high school", { autoComplete: "off" })}
            </div>
            <div className="row2">
              {select("program", "Tech Campus program", programs.map(p => ({ value: p.slug, label: p.name })))}
              {select("programYear", "Year in program", opts(programYears))}
            </div>
          </section>
        )}

        {step === 1 && (
          <section>
            <h2 className="form-title">Your request</h2>
            <p className="form-sub">Choose the kind of help you need. Not sure? Pick the closest one and explain below.</p>
            <fieldset>
              <legend>I&apos;m applying for</legend>
              <div className="choice-grid" id="f-grantType" tabIndex={-1} aria-describedby="e-grantType">
                {grantTypes.map(g => (
                  <label className="choice" key={g.id}>
                    <input type="radio" name="grantType" value={g.id} checked={a.grantType === g.id} onChange={() => set("grantType", g.id)} />
                    <i aria-hidden="true">{g.icon}</i>
                    <div><b>{g.name}</b><span>{g.text}</span></div>
                  </label>
                ))}
              </div>
              {err("grantType")}
            </fieldset>
            <div className="row2">
              {text("amount", "Amount needed", { inputMode: "decimal", placeholder: "$" }, true)}
              {select("plans", "Plans after Tech Campus", opts(plansOptions))}
            </div>
            <div className="field">
              <label htmlFor="f-purpose">What would this pay for?</label>
              <textarea rows={3} value={a.purpose} onChange={e => set("purpose", e.target.value)} placeholder="For example: my CNA state exam fee and scrubs for clinicals." {...inv("purpose")} />
              {err("purpose")}
            </div>
            <fieldset>
              <legend>Do you qualify for free or reduced-price lunch? <span className="opt" style={{ textTransform: "none", letterSpacing: 0, fontWeight: 500 }}>(optional, helps us prioritize need)</span></legend>
              <div className="seg" style={{ gridTemplateColumns: "repeat(3, 1fr)", maxWidth: 420 }}>
                {["Yes", "No", "Prefer not to say"].map(v => (
                  <button key={v} type="button" aria-pressed={a.freeLunch === v} onClick={() => set("freeLunch", a.freeLunch === v ? "" : v)}>{v}</button>
                ))}
              </div>
            </fieldset>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 className="form-title">Your story</h2>
            <p className="form-sub">Help the committee get to know you, and tell us who can vouch for your work.</p>
            <div className="field">
              <label htmlFor="f-essay">Why did you choose your program, and what will this support help you do next?</label>
              <textarea rows={8} value={a.essay} onChange={e => set("essay", e.target.value)} {...inv("essay")} />
              <p className={"hint" + (words >= ESSAY_MIN_WORDS ? " ok" : "")}>{words} / {ESSAY_MIN_WORDS} words minimum{words >= ESSAY_MIN_WORDS ? " ✓" : ""}</p>
              {err("essay")}
            </div>
            <div className="row2">
              {text("instructorName", "Tech Campus instructor")}
              {text("instructorEmail", "Instructor email", { type: "email" })}
            </div>
            {minor && (
              <div className="row2">
                {text("guardianName", "Parent or guardian name", { autoComplete: "off" })}
                {text("guardianEmail", "Parent or guardian email", { type: "email", autoComplete: "off" })}
              </div>
            )}
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 className="form-title">Review &amp; submit</h2>
            <p className="form-sub">Check everything over. You can edit any section.</p>
            <Review title="About you" onEdit={() => goTo(0)} rows={[
              ["Name", `${a.firstName} ${a.lastName}`], ["Email", a.email], ["Phone", a.phone || "—"],
              ["Grade", a.grade], ["High school", a.school], ["Program", `${program?.name ?? ""} · ${a.programYear}`],
            ]} />
            <Review title="Your request" onEdit={() => goTo(1)} rows={[
              ["Applying for", grant?.name ?? ""], ["Amount", a.amount ? "$" + a.amount.replace(/^\$/, "") : "Not specified"],
              ["Pays for", a.purpose], ["Plans", a.plans], ["Free/reduced lunch", a.freeLunch || "—"],
            ]} />
            <Review title="Your story" onEdit={() => goTo(2)} rows={[
              ["Essay", `${words} words`], ["Instructor", `${a.instructorName} (${a.instructorEmail})`],
              ...(minor ? [["Parent/guardian", `${a.guardianName} (${a.guardianEmail})`] as [string, string]] : []),
            ]} />
            <label className="check-row">
              <input type="checkbox" checked={a.certify} onChange={e => set("certify", e.target.checked)} {...inv("certify")} />
              <span>I certify that the information in this application is true and complete.</span>
            </label>
            {err("certify")}
            <label className="check-row">
              <input type="checkbox" checked={a.consent} onChange={e => set("consent", e.target.checked)} {...inv("consent")} />
              <span>The Foundation may contact my instructor{minor ? " and parent/guardian" : ""} and confirm my enrollment with Tech Campus.</span>
            </label>
            {err("consent")}
          </section>
        )}

        <div className="form-nav">
          {step > 0 ? <button className="btn line" type="button" onClick={() => goTo(step - 1)}>← Back</button> : <span className="hint" style={{ alignSelf: "center" }}>Your progress saves on this device.</span>}
          <button className="btn blue" type="submit">{step < 3 ? "Continue →" : "Submit application"}</button>
        </div>
      </form>
    </div>
  );
}

function Review({ title, rows, onEdit }: { title: string; rows: [string, string][]; onEdit: () => void }) {
  return (
    <div className="review">
      <h3>{title}<button type="button" onClick={onEdit}>Edit</button></h3>
      <dl>{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    </div>
  );
}
