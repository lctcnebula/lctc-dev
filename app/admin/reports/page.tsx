"use client";

import Manager from "@/components/admin/Manager";
import { money } from "@/lib/store";

export default function ReportsAdmin() {
  return (
    <Manager
      collection="reports" title="Yearly reports" noun="years" newLabel="Add year"
      intro={<>One entry per year. The newest year feeds the numbers on the home page; all years show on the <a href="/impact" target="_blank">Impact page</a>.</>}
      search={r => r.year}
      sort={(a, b) => b.year.localeCompare(a.year)}
      columns={[
        { label: "Year", get: r => <b>{r.year}</b>, csv: r => r.year },
        { label: "Students", get: r => r.students.toLocaleString(), csv: r => r.students, className: "num" },
        { label: "Awards", get: r => r.scholarships.toLocaleString(), csv: r => r.scholarships, className: "num" },
        { label: "Awarded", get: r => money(r.granted), csv: r => r.granted, className: "num" },
        { label: "Raised", get: r => money(r.raised), csv: r => r.raised, className: "num" },
        { label: "Donors", get: r => r.donors.toLocaleString(), csv: r => r.donors, className: "num" },
      ]}
      blank={() => ({ year: "", students: 0, scholarships: 0, granted: 0, raised: 0, donors: 0, highlights: [] })}
      fields={[
        { key: "year", label: "Year", required: true, half: true, help: "e.g. 2027" },
        { key: "students", label: "Students supported", type: "number", half: true },
        { key: "scholarships", label: "Scholarships & grants awarded", type: "number", half: true },
        { key: "granted", label: "Dollars awarded", type: "number", half: true },
        { key: "raised", label: "Dollars raised", type: "number", half: true },
        { key: "donors", label: "Donors", type: "number", half: true },
        { key: "highlights", label: "Highlights", type: "lines" },
      ]}
      validate={(r, all) => all.some(x => x.id !== r.id && x.year === r.year.trim()) ? "That year already has a report." : null}
    />
  );
}
