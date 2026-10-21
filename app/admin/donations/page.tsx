"use client";

import Manager, { fmtDateTime } from "@/components/admin/Manager";
import { funds } from "@/components/DonateCheckout";
import { money, now, useData } from "@/lib/store";

export default function DonationsAdmin() {
  return (
    <Manager
      collection="donations" title="Donations" noun="donations" newLabel="Record a gift"
      intro="Every gift made on the donate page lands here. Record checks and offline gifts with “Record a gift”."
      search={r => `${r.name} ${r.email} ${r.fund} ${r.receipt}`}
      sort={(a, b) => b.createdAt.localeCompare(a.createdAt)}
      filters={[
        { label: "All", test: () => true },
        { label: "One-time", test: r => r.freq === "once" },
        { label: "Monthly", test: r => r.freq === "monthly" },
      ]}
      headerExtra={<DonationTotals />}
      columns={[
        { label: "Date", get: r => fmtDateTime(r.createdAt), csv: r => r.createdAt },
        { label: "Donor", get: r => <><b>{r.name}</b><small>{r.email}</small></>, csv: r => r.name },
        { label: "Email", get: () => null, csv: r => r.email, className: "hide" },
        { label: "Amount", get: r => <b>{money(r.amount)}{r.freq === "monthly" ? "/mo" : ""}</b>, csv: r => r.amount, className: "num" },
        { label: "Frequency", get: () => null, csv: r => r.freq, className: "hide" },
        { label: "Fund", get: r => <>{r.fund}{r.tier && <small>{r.tier}</small>}</>, csv: r => r.tier ? `${r.fund} · ${r.tier}` : r.fund },
        { label: "Method", get: r => r.card, csv: r => r.card },
        { label: "Receipt", get: r => <code>{r.receipt}</code>, csv: r => r.receipt },
      ]}
      blank={() => ({ name: "", email: "", amount: 0, freq: "once", fund: funds[0], card: "Check", receipt: "LCTC-" + Math.random().toString(36).slice(2, 8).toUpperCase(), createdAt: now() })}
      fields={[
        { key: "name", label: "Donor name", required: true, half: true },
        { key: "email", label: "Email", type: "email", half: true },
        { key: "amount", label: "Amount ($)", type: "number", required: true, half: true },
        { key: "freq", label: "Frequency", type: "select", required: true, half: true, options: [{ value: "once", label: "One-time" }, { value: "monthly", label: "Monthly" }] },
        { key: "fund", label: "Fund", type: "select", required: true, half: true, options: funds.map(f => ({ value: f, label: f })) },
        { key: "card", label: "Payment method", half: true, help: "e.g. Check #1042, Cash, Visa ending 4242" },
        { key: "receipt", label: "Receipt number", required: true, half: true },
        { key: "createdAt", label: "Received", type: "readonly", half: true, show: r => fmtDateTime(r.createdAt) },
      ]}
      validate={r => (+r.amount > 0 ? null : "Enter an amount above $0.")}
    />
  );
}

function DonationTotals() {
  const d = useData("donations");
  const total = d.reduce((n, x) => n + x.amount, 0);
  const monthly = d.filter(x => x.freq === "monthly").reduce((n, x) => n + x.amount, 0);
  return <span className="totals"><b>{money(total)}</b> recorded · <b>{money(monthly)}</b>/mo recurring</span>;
}
