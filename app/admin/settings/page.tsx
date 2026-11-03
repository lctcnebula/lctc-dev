"use client";

import { useEffect, useState } from "react";
import { useSite } from "@/components/Providers";
import { can, useUser } from "@/lib/auth";
import { resetAll, saveSettings, useData } from "@/lib/store";

export default function SettingsAdmin() {
  const s = useData("settings");
  const { user } = useUser();
  const { say } = useSite();
  const [f, setF] = useState({ email: s.email, phone: s.phone, address: s.address, schools: s.schools.join("\n") });
  useEffect(() => setF({ email: s.email, phone: s.phone, address: s.address, schools: s.schools.join("\n") }), [s]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF(p => ({ ...p, [k]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) return say("Enter a valid email address.");
    try {
      await saveSettings({ email: f.email.trim(), phone: f.phone.trim(), address: f.address.trim(), schools: f.schools.split("\n").map(x => x.trim()).filter(Boolean) });
      say("Settings saved");
    } catch (x) { say((x as Error).message); }
  }

  return (
    <div className="admin-page">
      <header className="admin-head"><div><h1>Site settings</h1><p className="hint">Contact details shown across the site, and the member school list used on the home page and in the grant application.</p></div></header>
      <form className="admin-card" onSubmit={save}>
        <div className="drawer-grid">
          <div className="field half"><label htmlFor="s-email">Foundation email</label><input id="s-email" type="email" value={f.email} onChange={set("email")} /></div>
          <div className="field half"><label htmlFor="s-phone">Phone <span className="opt">(optional)</span></label><input id="s-phone" value={f.phone} onChange={set("phone")} /></div>
          <div className="field full"><label htmlFor="s-address">Mailing address <span className="opt">(optional)</span></label><input id="s-address" value={f.address} onChange={set("address")} /><p className="hint">Hidden on the site while blank.</p></div>
          <div className="field full"><label htmlFor="s-schools">Member high schools</label><textarea id="s-schools" rows={10} value={f.schools} onChange={set("schools")} /><p className="hint">One per line.</p></div>
        </div>
        <button className="btn blue sm" type="submit">Save settings</button>
      </form>
      {can(user?.role, "users") && (
        <div className="admin-card danger-zone">
          <h2>Reset demo data</h2>
          <p className="hint">Deletes every change and submission in the database (donations, applications, messages, RSVPs, edits to content) and restores the sample content. Accounts are kept, and the demo logins are restored.</p>
          <button className="btn line sm danger" type="button" onClick={async () => {
            if (!confirm("Delete all content and submissions in the database and restore the sample content? This can't be undone.")) return;
            try { await resetAll(); say("Demo data restored"); } catch (x) { say((x as Error).message); }
          }}>Reset everything</button>
        </div>
      )}
    </div>
  );
}
