"use client";

import Manager, { type Row } from "@/components/admin/Manager";
import { boardSlug, getAll, update, useData } from "@/lib/store";

const byOrder = (a: { order: number }, b: { order: number }) => a.order - b.order;

// Writes 1, 2, 3... in the given sequence so positions never have gaps or ties.
function renumber(list: { id: string; order: number }[]) {
  list.forEach((m, i) => { if (m.order !== i + 1) update("board", m.id, { order: i + 1 }); });
}

function move(id: string, by: -1 | 1) {
  const list = [...getAll("board")].sort(byOrder);
  const i = list.findIndex(m => m.id === id), j = i + by;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  renumber(list);
}

// Saving a member at position 3 slides whoever was at 3 and below down one place.
function placeAt(r: Row) {
  const others = getAll("board").filter(m => m.id !== r.id).sort(byOrder);
  const at = Math.min(Math.max(1, Math.round(+r.order || others.length + 1)), others.length + 1);
  others.forEach((m, i) => {
    const want = i + 1 < at ? i + 1 : i + 2;
    if (m.order !== want) update("board", m.id, { order: want });
  });
  return { ...r, order: at };
}

export default function BoardAdmin() {
  const board = [...useData("board")].sort(byOrder);
  const last = board.length;
  const pos = (id: string) => board.findIndex(m => m.id === id);
  return (
    <Manager
      collection="board" title="Board members" noun="members" newLabel="Add member"
      intro={<>Shown on the <a href="/board" target="_blank">Board page</a> in this order, and each member gets a profile page. Use ↑ ↓ to change someone&apos;s position.</>}
      search={r => `${r.name} ${r.role} ${r.company ?? ""}`}
      sort={(a, b) => a.order - b.order}
      columns={[
        { label: "#", get: r => pos(r.id) + 1, csv: r => r.order, className: "num" },
        { label: "Name", get: r => <><b>{r.name}</b>{r.company && <small>{r.company}</small>}</>, csv: r => r.name },
        { label: "Position", get: r => r.role, csv: r => r.role },
      ]}
      rowActions={r => (
        <>
          <button type="button" className="link-btn" aria-label={`Move ${r.name} up`} disabled={pos(r.id) === 0} onClick={() => move(r.id, -1)}>↑</button>
          <button type="button" className="link-btn" aria-label={`Move ${r.name} down`} disabled={pos(r.id) === last - 1} onClick={() => move(r.id, 1)}>↓</button>
          <a className="link-btn" href={`/board/${boardSlug({ name: r.name, slug: r.slug })}`} target="_blank">View ↗</a>
        </>
      )}
      blank={() => ({ name: "", slug: "", role: "Board Member", company: "", bio: "", photo: "", linkedin: "", order: last + 1 })}
      fields={[
        { key: "name", label: "Name", required: true, half: true },
        { key: "role", label: "Position on the board", required: true, half: true, help: "e.g. Board Chair, Vice Chair, Treasurer, Secretary, Board Member" },
        { key: "company", label: "Company or organization", half: true },
        { key: "order", label: "Order", type: "number", half: true, help: "1 shows first. Others move down to make room." },
        { key: "slug", label: "Profile URL", type: "slug", from: "name" },
        { key: "bio", label: "Bio", type: "long", help: "Shown on their profile page; the first paragraph also shows on the Board page. Blank lines start a new paragraph." },
        { key: "linkedin", label: "LinkedIn URL", help: "Optional. Starts with https://" },
        { key: "photo", label: "Photo", type: "image" },
      ]}
      validate={r => (r.linkedin && !/^https?:\/\//.test(r.linkedin) ? "The LinkedIn URL should start with https://" : null)}
      beforeSave={placeAt}
    />
  );
}
