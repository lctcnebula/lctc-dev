"use client";

import Manager, { fmtDate } from "@/components/admin/Manager";
import { now, update } from "@/lib/store";

export default function AlumniAdmin() {
  return (
    <Manager
      collection="alumni" title="Alumni" noun="alumni" newLabel="Add alum"
      intro="Sign-ups from the Alumni page arrive here as pending. Approve to show their story on the site."
      search={r => `${r.name} ${r.email} ${r.program} ${r.year} ${r.now}`}
      sort={(a, b) => Number(a.published) - Number(b.published) || b.createdAt.localeCompare(a.createdAt)}
      filters={[{ label: "All", test: () => true }, { label: "Pending", test: r => !r.published }, { label: "Published", test: r => r.published }]}
      rowActions={r => !r.published ? <button type="button" className="link-btn" onClick={() => void update("alumni", r.id, { published: true }).catch(x => alert((x as Error).message))}>Approve</button> : null}
      columns={[
        { label: "Name", get: r => <><b>{r.name}</b><small>{r.email}</small></>, csv: r => r.name },
        { label: "Email", get: () => null, csv: r => r.email, className: "hide" },
        { label: "Program", get: r => <>{r.program}{r.year && <small>Class of {r.year}</small>}</>, csv: r => r.program },
        { label: "Year", get: () => null, csv: r => r.year, className: "hide" },
        { label: "Now", get: r => r.now, csv: r => r.now },
        { label: "Joined", get: r => fmtDate(r.createdAt), csv: r => r.createdAt },
        { label: "Status", get: r => <span className={"status " + (r.published ? "s-approved" : "s-new")}>{r.published ? "Published" : "Pending"}</span>, csv: r => (r.published ? "Published" : "Pending") },
      ]}
      blank={() => ({ name: "", email: "", program: "", year: "", now: "", story: "", photo: "", published: true, createdAt: now() })}
      fields={[
        { key: "name", label: "Name", required: true, half: true },
        { key: "email", label: "Email", type: "email", half: true },
        { key: "program", label: "Program", half: true },
        { key: "year", label: "Year finished", half: true },
        { key: "now", label: "What they do now" },
        { key: "story", label: "Story", type: "textarea" },
        { key: "photo", label: "Photo", type: "image" },
        { key: "published", label: "Show on the Alumni page", type: "checkbox" },
      ]}
    />
  );
}
