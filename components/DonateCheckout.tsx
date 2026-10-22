"use client";

import { useEffect, useRef, useState } from "react";
import { palette, useSite } from "./Providers";
import { ConfettiButton } from "./Actions";
import { insert, money, now } from "@/lib/store";
import { useUser } from "@/lib/auth";
import { donationTypes, findDonationType, givingTiers, tiersFor } from "@/lib/content";
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
type Receipt = { first: string; line: string; id: string; amt: string; fund: string; card: string; date: string };

export default function DonateCheckout() {
  const top = useRef<HTMLDivElement>(null);
  const { getConfetti } = useSite();
  const [step, setStep] = useState(1);
  const [type, setType] = useState(donationTypes[0]);
  const [amount, setAmount] = useState(type.default);
  const [tier, setTier] = useState("");
  const [qty, setQty] = useState(1);
  const [custom, setCustom] = useState("");
  const [freq, setFreq] = useState<Freq>("once");
  const [amountErr, setAmountErr] = useState("");
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

  // Links elsewhere preselect the gift: /donate?type=scholarships&amount=1000&freq=monthly (or yearly), or
  // /donate?tier=The%20Toolkit&qty=2 for a giving tier; &other=1 jumps to the "any other amount" box. ?fund=Scholarships (the type's name) still works for older links.
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const gt = givingTiers.find(x => x.name === q.get("tier"));
    const t = findDonationType(gt?.type ?? q.get("type") ?? q.get("fund"));
    if (t) pickType(t);
    const fq = q.get("freq");
    if (fq === "monthly" || fq === "yearly") setFreq(fq);
    if (gt && t) return pickTier(gt.name, t, parseInt(q.get("qty") ?? "1"));
    const n = parseFloat(q.get("amount") ?? "");
    if (n >= 5) pickAmount(n, t ?? donationTypes[0]);
    if (q.get("other")) setTimeout(() => { const el = document.getElementById("d-custom"); el?.scrollIntoView({ block: "center" }); el?.focus(); }, 300);
  }, []);

  // Switching type swaps in that type's presets and tiers, so the old amount (preset or typed) is replaced by its default.
  function pickType(t: typeof type) {
    setType(t); setTier(""); setQty(1); setAmount(t.default); setCustom(""); setAmountErr("");
  }

  // A giving tier locks the price: amount = price × how many. A `min` tier starts at its price and can go higher.
  // Picking "Any amount" goes back to the type's presets.
  function pickTier(name: string, t = type, n = 1) {
    const gt = tiersFor(t.slug).find(x => x.name === name);
    const q = Math.min(MAX_QTY, Math.max(1, n || 1));
    setTier(gt ? gt.name : ""); setQty(q); setCustom(""); setAmountErr("");
    setAmount(gt ? gt.amount * (gt.min ? 1 : q) : t.default);
  }
  // One dropdown holds both: a type ("general") gives presets + any amount, a giving tier ("tier:The Toolkit") a fixed price.
  function choose(v: string) {
    const gt = givingTiers.find(x => "tier:" + x.name === v);
    const t = findDonationType(gt ? gt.type : v);
    if (!t) return;
    pickType(t);
    if (gt) pickTier(gt.name, t);
  }
  function changeQty(n: number) {
    if (!chosenTier) return;
    const q = Math.min(MAX_QTY, Math.max(1, n));
    setQty(q); setAmount(chosenTier.amount * q);
  }

  // An amount that isn't one of the type's presets goes in the "other amount" box so it stays visible.
  function pickAmount(n: number, t = type) {
    setAmount(n); setAmountErr("");
    setCustom(t.presets.includes(n) ? "" : String(n));
  }
  const tiers = tiersFor(type.slug), chosenTier = tiers.find(x => x.name === tier);
  const fixed = chosenTier && !chosenTier.min;
  const tierLabel = chosenTier && (fixed && qty > 1 ? `${chosenTier.name} × ${qty}` : chosenTier.name);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const r = top.current?.getBoundingClientRect();
    if (r && r.top < 80) top.current?.scrollIntoView({ block: "start" });
    if (step === 2) setTimeout(() => document.getElementById("d-name")?.focus(), 50);
  }, [step]);

  function reset() {
    setStep(1); pickType(type); setFreq("once");
    setF(blank); setErrs({}); setAlert(""); setReceipt(null);
  }

  const fr = frequencies[freq];
  const brand = brandOf(f.card.replace(/\D/g, ""));
  const set = (k: keyof Fields, v: string) => setF(p => ({ ...p, [k]: v }));

  function next() {
    const least = chosenTier?.min ? chosenTier.amount : 5;
    if (!(amount >= least)) { setAmountErr(`Please enter at least ${money(least)}.`); document.getElementById("d-custom")?.focus(); return; }
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
      insert("donations", { receipt: id, name: f.name.trim(), email: f.email.trim(), amount, freq, fund: type.name, ...(tierLabel && { tier: tierLabel }), card: `${brandNames[b]} ending ${card.slice(-4)}`, createdAt: now() });
      setReceipt({
        first: f.name.trim().split(/\s+/)[0],
        line: `Your ${fr.adj} gift of ${money(amount)} was accepted. A receipt would go to ${f.email.trim()}.`,
        id,
        amt: money(amount) + fr.per,
        fund: tierLabel ? `${type.name} · ${tierLabel}` : type.name,
        card: `${brandNames[b]} ending ${card.slice(-4)}`,
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
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
    <div className="form-card donate-card" ref={top}>
      <div>
        <p className="demo-note" role="note">
          <span aria-hidden="true">⚠️</span>
          <span><b>Demo mode.</b> No card is charged. Completed gifts show up in the admin dashboard. Use test card <code title="Click to fill" onClick={() => fill("4242424242424242")}>4242 4242 4242 4242</code> with any future date and any CVC. <code title="Click to fill" onClick={() => fill("4000000000000002")}>4000 0000 0000 0002</code> shows a decline.</span>
        </p>
        <ol className="steps" aria-hidden="true">{[1, 2, 3].map(n => <li key={n} className={n <= step ? "on" : ""} />)}</ol>

        {step === 1 && (
          <section>
            <h2 className="dm-title" id="dm-title">Make a gift</h2>
            <p className="dm-sub">Pick a type of donation, then choose an amount or enter your own.</p>
            <div className="field">
              <label htmlFor="d-type">Type of donation</label>
              <select id="d-type" value={chosenTier ? "tier:" + chosenTier.name : type.slug} onChange={e => choose(e.target.value)}>
                <optgroup label="Any amount">
                  {donationTypes.map(t => <option key={t.slug} value={t.slug}>{t.icon} {t.name}</option>)}
                </optgroup>
                <optgroup label="Fund something specific">
                  {givingTiers.map(x => <option key={x.name} value={"tier:" + x.name}>{x.item} · {money(x.amount)}{x.min ? "+" : " each"}</option>)}
                </optgroup>
              </select>
              <p className="hint">{chosenTier ? chosenTier.impact : type.text}</p>
            </div>
            <div className="seg" role="group" aria-label="Gift frequency">
              {(Object.keys(frequencies) as Freq[]).map(k => (
                <button key={k} type="button" aria-pressed={freq === k} onClick={() => setFreq(k)}>{frequencies[k].label}</button>
              ))}
            </div>
            {fixed ? (
              <div className="fixed-gift">
                <div>
                  <b>{chosenTier.item}</b>
                  <span>{money(chosenTier.amount)} each</span>
                </div>
                <div className="qty" role="group" aria-label="How many">
                  <button type="button" aria-label="One fewer" disabled={qty <= 1} onClick={() => changeQty(qty - 1)}>−</button>
                  <output aria-live="polite">{qty}</output>
                  <button type="button" aria-label="One more" disabled={qty >= MAX_QTY} onClick={() => changeQty(qty + 1)}>+</button>
                </div>
                <p className="fixed-total">Total <b>{money(amount)}</b></p>
              </div>
            ) : <>
            {!chosenTier && <div className="amounts" role="group" aria-label="Gift amount">
              {type.presets.map(a => (
                <button key={a} className="amt" type="button" aria-pressed={!custom && amount === a} onClick={() => pickAmount(a)}>{money(a)}</button>
              ))}
            </div>}
            <div className="field custom">
              <label htmlFor="d-custom" className="sr-only">Other amount</label>
              <span aria-hidden="true">$</span>
              <input id="d-custom" type="text" inputMode="decimal" placeholder={chosenTier ? `${money(chosenTier.amount)} or more` : "Any other amount"} autoComplete="off" value={custom}
                onChange={e => {
                  const v = e.target.value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1").replace(/(\.\d{2}).+/, "$1");
                  setCustom(v); setAmountErr("");
                  const n = parseFloat(v);
                  if (n > 0) setAmount(n);
                  else if (!v) setAmount(chosenTier ? chosenTier.amount : type.default);
                }} />
              <p className="err">{amountErr}</p>
            </div>
            </>}
            <button className="btn blue pay" type="button" onClick={next}>Continue with {money(amount)}{fr.per}</button>
          </section>
        )}

        {step === 2 && (
          <section>
            <button className="back" type="button" onClick={() => setStep(1)}>← Change amount</button>
            <div className="summary"><span>{fr.label} gift · {tierLabel || type.name}</span><b>{money(amount)}{fr.short}</b></div>
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
            <p className="dm-sub" style={{ fontSize: ".78rem" }}>This is a demo receipt. No money was charged and no email was sent.</p>
            <div className="done-actions">
              <button className="btn blue" type="button" onClick={reset}>Give again</button>
              <ConfettiButton className="btn line">More confetti 🎉</ConfettiButton>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

