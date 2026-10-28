"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { palette, useSite } from "./Providers";
import { ConfettiButton } from "./Actions";
import DemoFill from "./DemoFill";
import { insert, money, now } from "@/lib/store";
import { useUser } from "@/lib/auth";
import { donationTypes, findDonationType, givingTiers, type GivingTier } from "@/lib/content";
import { frequencies, type Freq } from "@/lib/seed";

// Demo checkout: nothing is charged, but every completed gift is recorded in Admin → Donations. Swap the submit handler for
// a hosted payment page (Stripe Payment Links, PayPal...) to take real gifts. No upper limit on gift size.

export const funds = donationTypes.map(t => t.name);
const MAX_QTY = 20;
const TEST: Record<string, "ok" | "decline"> = { "4242424242424242": "ok", "5555555555554444": "ok", "378282246310005": "ok", "6011111111111117": "ok", "4000000000000002": "decline" };
const brandNames = { visa: "Visa", mastercard: "Mastercard", amex: "Amex", discover: "Discover" } as const;
type Brand = keyof typeof brandNames | "";

const brandOf = (d: string): Brand => /^4/.test(d) ? "visa" : /^(5[1-5]|2[2-7])/.test(d) ? "mastercard" : /^3[47]/.test(d) ? "amex" : /^6(011|5)/.test(d) ? "discover" : "";
const formatCard = (raw: string) => {
  const d = raw.replace(/\D/g, "").slice(0, 16), b = brandOf(d), dd = d.slice(0, b === "amex" ? 15 : 16);
  return b === "amex" ? dd.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_m, a, c, f) => [a, c, f].filter(Boolean).join(" ")) : dd.replace(/(\d{4})(?=\d)/g, "$1 ");
};
const formatExp = (raw: string) => {
  let d = raw.replace(/\D/g, "").slice(0, 4);
  if (d.length === 1 && d > "1") d = "0" + d;
  return d.length > 2 ? d.slice(0, 2) + " / " + d.slice(2) : d;
};

const blank = { name: "", email: "", card: "", exp: "", cvc: "", zip: "" };
type Fields = typeof blank;
type Receipt = { first: string; line: string; id: string; amt: string; fund: string; card: string; date: string; dedication: string };

// Who the gift is for. Anything but "Just from me" reads back as one sentence saved on the donation record:
// "I am donating in memory of Rosa Diaz because of her love of cooking."
const purposes = {
  general: { icon: "💙", label: "Just from me", text: "A general gift, no dedication.", phrase: "" },
  honor: { icon: "🎉", label: "In honor of someone", text: "Celebrate a person who matters to you.", phrase: "in honor of" },
  memory: { icon: "🕊️", label: "In memory of someone", text: "Remember a loved one with a gift in their name.", phrase: "in memory of" },
  behalf: { icon: "🤝", label: "On behalf of someone", text: "Give for a person, family, class or company.", phrase: "on behalf of" },
} as const;
type Purpose = keyof typeof purposes;
const occasions = ["their birthday", "their graduation", "their wedding", "their retirement", "an anniversary", "the holidays"];
const blankDed = { who: "", why: "", note: "" };
const dedicationLine = (p: Purpose, d: typeof blankDed) =>
  p === "general" || !d.who.trim() ? "" : `I am donating ${purposes[p].phrase} ${d.who.trim()}${d.why.trim() ? " because of " + d.why.trim() : ""}.`;

const fundOf = (t: GivingTier) => findDonationType(t.type) ?? donationTypes[0];
const priceOf = (t: GivingTier) => money(t.amount) + (t.min ? "+" : "");
const DEFAULT = givingTiers.find(t => t.amount === 50) ?? givingTiers[0];

export default function DonateCheckout({ children }: { children?: ReactNode }) {
  const top = useRef<HTMLDivElement>(null);
  const { getConfetti } = useSite();
  const [step, setStep] = useState(1);
  const [tier, setTier] = useState<GivingTier>(DEFAULT);
  const [qty, setQty] = useState(1);
  const [custom, setCustom] = useState("");
  const [freq, setFreq] = useState<Freq>("once");
  const [amountErr, setAmountErr] = useState("");
  const [purpose, setPurpose] = useState<Purpose>("general");
  const [ded, setDed] = useState(blankDed);
  const [dedErr, setDedErr] = useState("");
  const [f, setF] = useState<Fields>(blank);
  const [errs, setErrs] = useState<Partial<Fields>>({});
  const [alert, setAlert] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  // Signed-in members get their name and email filled in, so the gift shows in their account.
  const { user } = useUser();
  useEffect(() => {
    if (user) setF(p => ({ ...p, name: p.name || user.name, email: p.email || user.email }));
  }, [user]);

  // Links elsewhere preselect the gift: /donate?tier=The%20Toolkit&qty=2&freq=monthly. ?type=credentials (a pillar)
  // picks that pillar's first opportunity; ?amount= sets the major gift amount.
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const t = findDonationType(q.get("type") ?? q.get("fund"));
    const gt = givingTiers.find(x => x.name === q.get("tier")) ?? (t && givingTiers.find(x => x.type === t.slug));
    if (gt) pick(gt, parseInt(q.get("qty") ?? "1"));
    const fq = q.get("freq");
    if (fq === "monthly" || fq === "yearly") setFreq(fq);
    const n = parseFloat(q.get("amount") ?? "");
    if (gt?.min && n >= gt.amount) setCustom(String(n));
    if (gt || t) setTimeout(() => top.current?.scrollIntoView({ block: "start" }), 300);
  }, []);

  function pick(t: GivingTier, n = 1) {
    setTier(t); setQty(Math.min(MAX_QTY, Math.max(1, n || 1))); setCustom(""); setAmountErr("");
  }
  // Choosing a card swaps the gift and brings the checkout into view (it sits below the cards on every screen size).
  function choose(t: GivingTier) {
    pick(t); setStep(1);
    requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
  }

  // A fixed tier is price × how many; the major gift starts at its price and the donor can type more.
  const amount = tier.min ? Math.max(parseFloat(custom) || 0, 0) || tier.amount : tier.amount * qty;
  const fund = fundOf(tier);
  const label = !tier.min && qty > 1 ? `${tier.item} × ${qty}` : tier.item;
  const dedication = dedicationLine(purpose, ded);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const r = top.current?.getBoundingClientRect();
    if (r && r.top < 80) top.current?.scrollIntoView({ block: "start" });
    if (step === 2) setTimeout(() => document.getElementById("d-name")?.focus(), 50);
  }, [step]);

  function reset() {
    setStep(1); pick(tier); setFreq("once"); setPurpose("general"); setDed(blankDed);
    setF(blank); setErrs({}); setAlert(""); setReceipt(null);
  }

  const fr = frequencies[freq];
  const brand = brandOf(f.card.replace(/\D/g, ""));
  const set = (k: keyof Fields, v: string) => setF(p => ({ ...p, [k]: v }));

  function next() {
    if (tier.min && amount < tier.amount) { setAmountErr(`Please enter at least ${money(tier.amount)}.`); document.getElementById("d-custom")?.focus(); return; }
    if (purpose !== "general" && ded.who.trim().length < 2) { setDedErr("Tell us who this gift is for."); document.getElementById("d-who")?.focus(); return; }
    setStep(2);
  }

  function fill(num: string) {
    if (step !== 2) return;
    setF(p => ({
      ...p, card: formatCard(num),
      exp: p.exp || "12 / " + String((new Date().getFullYear() + 3) % 100).padStart(2, "0"),
      cvc: p.cvc || (brandOf(num) === "amex" ? "1234" : "123"),
      zip: p.zip || "60030",
    }));
  }
  function validate() {
    const e: Partial<Fields> = {};
    const card = f.card.replace(/\D/g, ""), exp = f.exp.replace(/\D/g, ""), now = new Date();
    if (f.name.trim().length < 2) e.name = "Enter the name on the card.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Enter a valid email address.";
    if (card.length < 15) e.card = "Enter the full card number.";
    else if (!TEST[card]) e.card = "Demo mode only accepts test cards. Use 4242 4242 4242 4242.";
    const mm = +exp.slice(0, 2), yy = +exp.slice(2, 4);
    if (exp.length !== 4 || mm < 1 || mm > 12) e.exp = "Use MM / YY.";
    else if (2000 + yy < now.getFullYear() || (2000 + yy === now.getFullYear() && mm < now.getMonth() + 1)) e.exp = "This card has expired.";
    const need = brandOf(card) === "amex" ? 4 : 3;
    if (f.cvc.length !== need) e.cvc = need + " digits.";
    if (f.zip.length !== 5) e.zip = "5-digit ZIP.";
    setErrs(e);
    const first = (["name", "email", "card", "exp", "cvc", "zip"] as const).find(k => e[k]);
    if (first) document.getElementById("d-" + first)?.focus();
    return !first;
  }

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setAlert("");
    if (!validate()) return;
    const card = f.card.replace(/\D/g, "");
    setBusy(true);
    setTimeout(async () => {
      setBusy(false);
      if (TEST[card] === "decline") {
        setAlert("Your card was declined. Try a different card.");
        setErrs({ card: " " }); document.getElementById("d-card")?.focus();
        return;
      }
      const b = brandOf(card) as keyof typeof brandNames;
      const id = "LCTC-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      insert("donations", {
        receipt: id, name: f.name.trim(), email: f.email.trim(), amount, freq, fund: fund.name, tier: label,
        ...(dedication && { dedication, ...(ded.note.trim() && { note: ded.note.trim() }) }),
        card: `${brandNames[b]} ending ${card.slice(-4)}`, createdAt: now(),
      });
      setReceipt({
        first: f.name.trim().split(/\s+/)[0],
        line: `Your ${fr.adj} gift of ${money(amount)} was accepted. A receipt would go to ${f.email.trim()}.`,
        id,
        amt: money(amount) + fr.per,
        fund: `${label} · ${fund.name}`,
        card: `${brandNames[b]} ending ${card.slice(-4)}`,
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        dedication,
      });
      setF(p => ({ ...p, card: "", exp: "", cvc: "" }));
      setStep(3);
      const fx = await getConfetti();
      if (!fx) return;
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const fire = (o: object) => fx({ colors: [...palette, "#ffd166"], ...o });
      setTimeout(() => {
        fire({ particleCount: reduce ? 60 : 160, spread: 100, startVelocity: 50, origin: { y: .55 } });
        if (!reduce) setTimeout(() => {
          fire({ particleCount: 90, angle: 60, spread: 70, origin: { x: 0, y: .8 } });
          fire({ particleCount: 90, angle: 120, spread: 70, origin: { x: 1, y: .8 } });
        }, 250);
      }, 350);
    }, 1700);
  }

  const payLabel = `Donate ${money(amount)}${freq === "once" ? "" : " " + fr.adj}`;
  const field = (k: keyof Fields, label: string, props: React.InputHTMLAttributes<HTMLInputElement>, fmt?: (v: string) => string, extra?: React.ReactNode) => (
    <div className={"field" + (k === "card" ? " cardnum" : "")}>
      <label htmlFor={"d-" + k}>{label}</label>
      <input id={"d-" + k} type="text" autoComplete="off" value={f[k]} aria-invalid={errs[k] ? true : undefined} aria-describedby={"e-" + k}
        onChange={e => set(k, fmt ? fmt(e.target.value) : e.target.value)} {...props} />
      {extra}
      <p className="err" id={"e-" + k}>{errs[k]?.trim()}</p>
    </div>
  );

  return (
    <>
      <div className="gift-options" role="group" aria-label="Giving opportunities">
        {givingTiers.map(t => (
          <button key={t.name} type="button" className="gift-option" aria-pressed={tier.name === t.name} onClick={() => choose(t)}>
            <i aria-hidden="true">{t.icon}</i>
            <span className="go-price"><b>{priceOf(t)}</b>{!t.min && <small>each</small>}</span>
            <b className="go-name">{t.item}</b>
            <span className="go-impact">{t.impact}</span>
            <small className="go-pillar">{fundOf(t).name}</small>
          </button>
        ))}
      </div>

      <div className="apply-layout give-layout">
    <div className="form-card donate-card" ref={top}>
      <div>
        <p className="demo-note" role="note">
          <span aria-hidden="true">⚠️</span>
          <span><b>Demo mode.</b> No card is charged. Completed gifts show up in the admin dashboard. Use test card <code title="Click to fill" onClick={() => fill("4242424242424242")}>4242 4242 4242 4242</code> with any future date and any CVC. <code title="Click to fill" onClick={() => fill("4000000000000002")}>4000 0000 0000 0002</code> shows a decline.</span>
        </p>
        <ol className="steps" aria-hidden="true">{[1, 2, 3].map(n => <li key={n} className={n <= step ? "on" : ""} />)}</ol>

        {step === 1 && (
          <section>
            <div className="field">
              <label htmlFor="d-type">Fund something specific</label>
              <select id="d-type" value={tier.name} onChange={e => { const t = givingTiers.find(x => x.name === e.target.value); if (t) pick(t); }}>
                {givingTiers.map(x => <option key={x.name} value={x.name}>{x.icon} {x.item} · {priceOf(x)}{x.min ? "" : " each"}</option>)}
              </select>
              <p className="hint">Goes to {fund.name}.</p>
            </div>
            <div className="fixed-gift">
              <div>
                <b>{tier.item}</b>
                <span>{tier.min ? `${money(tier.amount)} minimum` : `${money(tier.amount)} each`}</span>
              </div>
              {tier.min ? (
                <div className="field custom">
                  <label htmlFor="d-custom" className="sr-only">Gift amount</label>
                  <span aria-hidden="true">$</span>
                  <input id="d-custom" type="text" inputMode="decimal" placeholder={tier.amount.toLocaleString("en-US")} autoComplete="off" value={custom}
                    aria-invalid={amountErr ? true : undefined} aria-describedby="e-custom"
                    onChange={e => { setCustom(e.target.value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1").replace(/(\.\d{2}).+/, "$1")); setAmountErr(""); }} />
                </div>
              ) : (
                <div className="qty" role="group" aria-label="How many">
                  <button type="button" aria-label="One fewer" disabled={qty <= 1} onClick={() => setQty(qty - 1)}>−</button>
                  <output aria-live="polite">{qty}</output>
                  <button type="button" aria-label="One more" disabled={qty >= MAX_QTY} onClick={() => setQty(qty + 1)}>+</button>
                </div>
              )}
              {amountErr && <p className="err" id="e-custom">{amountErr}</p>}
              <p className="fixed-total">Total <b>{money(amount)}</b></p>
            </div>
            <div className="seg" role="group" aria-label="Gift frequency">
              {(Object.keys(frequencies) as Freq[]).map(k => (
                <button key={k} type="button" aria-pressed={freq === k} onClick={() => setFreq(k)}>{frequencies[k].label}</button>
              ))}
            </div>

            <h3 className="dm-h3">Who is this gift for?</h3>
            <fieldset>
              <legend className="sr-only">Who is this gift for?</legend>
              <div className="choice-grid">
                {(Object.keys(purposes) as Purpose[]).map(k => (
                  <label className="choice" key={k}>
                    <input type="radio" name="purpose" checked={purpose === k} onChange={() => { setPurpose(k); setDedErr(""); }} />
                    <i aria-hidden="true">{purposes[k].icon}</i>
                    <div><b>{purposes[k].label}</b><span>{purposes[k].text}</span></div>
                  </label>
                ))}
              </div>
            </fieldset>
            {purpose !== "general" && <div className="dedicate">
              <div className="field">
                <label htmlFor="d-who">Their name</label>
                <input id="d-who" type="text" autoComplete="off" placeholder="e.g. Rosa Diaz, the Class of 2026, Acme Builders" value={ded.who} aria-invalid={dedErr ? true : undefined} aria-describedby="e-who"
                  onChange={e => { setDed(d => ({ ...d, who: e.target.value })); setDedErr(""); }} />
                <p className="err" id="e-who">{dedErr}</p>
              </div>
              <div className="field">
                <label htmlFor="d-why">Occasion or reason <span className="opt">optional</span></label>
                <input id="d-why" type="text" autoComplete="off" placeholder="e.g. their birthday, her love of cooking" value={ded.why} onChange={e => setDed(d => ({ ...d, why: e.target.value }))} />
                <div className="chips occasions" role="group" aria-label="Common occasions">
                  {occasions.map(o => <button key={o} type="button" className="chip" aria-pressed={ded.why === o} onClick={() => setDed(d => ({ ...d, why: d.why === o ? "" : o }))}>{o.replace(/^(their|an|the) /, "")}</button>)}
                </div>
              </div>
              <div className="field">
                <label htmlFor="d-note">A note for them <span className="opt">optional</span></label>
                <textarea id="d-note" rows={2} maxLength={300} placeholder="Happy birthday, Mom. This one's for the next generation of chefs." value={ded.note} onChange={e => setDed(d => ({ ...d, note: e.target.value }))} />
              </div>
              <blockquote className="dedication" aria-live="polite">
                {dedication || <>I am donating {purposes[purpose].phrase} <u>their name</u> because of <u>the occasion</u>.</>}
              </blockquote>
            </div>}
            <button className="btn blue pay" type="button" onClick={next}>Continue with {money(amount)}{fr.per}</button>
          </section>
        )}

        {step === 2 && (
          <section>
            <button className="back" type="button" onClick={() => setStep(1)}>← Change amount</button>
            <div className="summary"><span>{fr.label} gift · {label}{dedication && <small>{dedication}</small>}</span><b>{money(amount)}{fr.short}</b></div>
            <DemoFill label="Autofill test donor and card" onFill={() => { setF(p => ({ ...p, name: p.name || "Jordan Rivera", email: p.email || "jordan.rivera@example.com" })); fill("4242424242424242"); setErrs({}); }} />
            <form onSubmit={submit} noValidate autoComplete="off">
              {alert && <p className="form-alert" role="alert">{alert}</p>}
              <div className="row2">
                {field("name", "Full name", {})}
                {field("email", "Email for receipt", { type: "email" })}
              </div>
              <div className="cardbox">
                {field("card", "Card number", { inputMode: "numeric", placeholder: "1234 1234 1234 1234" }, formatCard,
                  <span className={"brand-tag " + brand}>{brand ? brandNames[brand] : "Card"}</span>)}
                <div className="row3">
                  {field("exp", "Expiry", { inputMode: "numeric", placeholder: "MM / YY" }, formatExp)}
                  {field("cvc", "CVC", { inputMode: "numeric", placeholder: brand === "amex" ? "1234" : "123" }, v => v.replace(/\D/g, "").slice(0, 4))}
                  {field("zip", "ZIP", { inputMode: "numeric", placeholder: "60030" }, v => v.replace(/\D/g, "").slice(0, 5))}
                </div>
              </div>
              <button className="btn blue pay" type="submit" disabled={busy}>
                {busy ? <><span className="spinner" aria-hidden="true" /> Processing…</> : payLabel}
              </button>
              <p className="secure">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                Demo checkout. Card details never leave this page.
              </p>
            </form>
          </section>
        )}

        {step === 3 && receipt && (
          <section className="done-box" aria-live="polite">
            <svg className="check" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="36" /><path d="m28 43 10 10 18-20" /></svg>
            <p className="pill-ok">Donation accepted</p>
            <h2 className="dm-title">Thank you, {receipt.first}!</h2>
            <p className="dm-sub" style={{ marginBottom: 0 }}>{receipt.line}</p>
            <dl className="receipt">
              <div><dt>Confirmation</dt><dd>{receipt.id}</dd></div>
              <div><dt>Amount</dt><dd>{receipt.amt}</dd></div>
              <div><dt>Designation</dt><dd>{receipt.fund}</dd></div>
              <div><dt>Payment</dt><dd>{receipt.card}</dd></div>
              <div><dt>Date</dt><dd>{receipt.date}</dd></div>
            </dl>
            {receipt.dedication && <blockquote className="dedication">{receipt.dedication}</blockquote>}
            <p className="dm-sub" style={{ fontSize: ".78rem" }}>This is a demo receipt. No money was charged and no email was sent.</p>
            <div className="done-actions">
              <button className="btn blue" type="button" onClick={reset}>Give again</button>
              <ConfettiButton className="btn line">More confetti 🎉</ConfettiButton>
            </div>
          </section>
        )}
      </div>
    </div>
        {children}
      </div>
    </>
  );
}

