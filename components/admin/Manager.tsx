"use client";

// One table + editor used by every admin section. Each section describes its columns and
// form fields; this handles search, filters, create/edit/delete, CSV export and image upload.

import { useEffect, useMemo, useRef, useState } from "react";
import { insert, remove, slugify, update, useData } from "@/lib/store";
import type { CollectionKey } from "@/lib/seed";
import { useSite } from "../Providers";
import { shrink } from "@/lib/image";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Row = Record<string, any> & { id: string };

export type Field = {
  key: string;
  label: string;
  type?: "text" | "email" | "textarea" | "long" | "date" | "number" | "select" | "checkbox" | "image" | "lines" | "slug" | "readonly";
  options?: { value: string; label: string }[];
  help?: string;
  required?: boolean;
  half?: boolean;
  /** For "slug": the field it is generated from. For "readonly": how to show the value. */
  from?: string;
  show?: (r: Row) => React.ReactNode;
};

export type Column = { label: string; get: (r: Row) => React.ReactNode; csv?: (r: Row) => string | number; className?: string };

type Props = {
  collection: CollectionKey;
  title: string;
  intro?: React.ReactNode;
  columns: Column[];
  fields: Field[];
  search: (r: Row) => string;
  blank?: () => Row | Omit<Row, "id">;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  filters?: { label: string; test: (r: Row) => boolean }[];
  sort?: (a: Row, b: Row) => number;
  where?: (r: Row) => boolean;
  rowActions?: (r: Row) => React.ReactNode;
  validate?: (r: Row, all: Row[]) => string | null;
  beforeSave?: (r: Row, isNew: boolean) => Row | Promise<Row>;
  /** Opens the "new" form on load with these values (e.g. a blog post for a given event). */
  startNew?: Partial<Row> | null;
  headerExtra?: React.ReactNode;
  newLabel?: string;
  /** Plural noun for the counter, e.g. "donations". */
  noun?: string;
};

export function csvDownload(name: string, columns: Column[], rows: Row[]) {
  const esc = (v: unknown) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const cols = columns.filter(c => c.csv);
  const text = [cols.map(c => esc(c.label)).join(","), ...rows.map(r => cols.map(c => esc(c.csv!(r))).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  Object.assign(document.createElement("a"), { href: url, download: `${name}-${new Date().toISOString().slice(0, 10)}.csv` }).click();
  URL.revokeObjectURL(url);
}

export const fmtDate = (iso: string) => iso ? new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
export const fmtDateTime = (iso: string) => iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "";


export default function Manager(p: Props) {
  const all = useData(p.collection) as unknown as Row[];
  const { say } = useSite();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState(0);
  const [draft, setDraft] = useState<Row | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [err, setErr] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const canEdit = p.canEdit ?? true, canDelete = p.canDelete ?? true;

  const rows = useMemo(() => {
    const f = p.filters?.[filter];
    const needle = q.trim().toLowerCase();
    const out = all.filter(r => (!p.where || p.where(r)) && (!f || f.test(r)) && (!needle || p.search(r).toLowerCase().includes(needle)));
    return p.sort ? [...out].sort(p.sort) : out;
  }, [all, q, filter, p]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (draft && !d.open) d.showModal();
    if (!draft && d.open) d.close();
  }, [draft]);

  function open(r: Row | null, preset?: Partial<Row>) {
    setErr("");
    setIsNew(!r);
    setDraft(r ? { ...r } : ({ ...(p.blank?.() ?? {}), ...preset } as Row));
  }

  const started = useRef(false);
  useEffect(() => {
    if (p.startNew && !started.current) { started.current = true; open(null, p.startNew); }
  }, [p.startNew]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    let d = { ...draft };
    for (const f of p.fields) {
      if (f.type === "slug" && !String(d[f.key] || "").trim()) d[f.key] = slugify(String(d[f.from!] || ""));
      if (f.type === "lines") d[f.key] = (d[f.key] ?? []).map((s: string) => s.trim()).filter(Boolean);
      if (f.type === "number") d[f.key] = Number(d[f.key]) || 0;
      if (f.required && f.type !== "checkbox" && !String(d[f.key] ?? "").trim()) return setErr(`${f.label} is required.`);
    }
    for (const f of p.fields) {
      if (f.type === "slug" && all.some(r => r.id !== d.id && r[f.key] === d[f.key])) return setErr(`Another item already uses the URL "${d[f.key]}". Change it.`);
    }
    const problem = p.validate?.(d, all);
    if (problem) return setErr(problem);
    try {
      if (p.beforeSave) d = await p.beforeSave(d, isNew);
      if (isNew) insert(p.collection, d as never);
      else { const { id, ...rest } = d; update(p.collection, id, rest as never); }
      say(isNew ? "Added" : "Saved");
      setDraft(null);
    } catch (x) { setErr((x as Error).message); }
  }

  function del(r: Row) {
    if (!confirm("Delete this item? This can't be undone.")) return;
    remove(p.collection, r.id);
    setDraft(null);
    say("Deleted");
  }

  const set = (k: string, v: unknown) => setDraft(d => d && { ...d, [k]: v });

  return (
    <div className="admin-page">
      <header className="admin-head">
        <div>
          <h1>{p.title}</h1>
          {p.intro && <p className="hint">{p.intro}</p>}
        </div>
        <div className="admin-actions">
          {p.headerExtra}
          <button className="btn line sm" type="button" onClick={() => csvDownload(p.collection, p.columns, rows)} disabled={!rows.length}>Export CSV</button>
          {p.canCreate !== false && canEdit && <button className="btn blue sm" type="button" onClick={() => open(null)}>{p.newLabel ?? "Add new"}</button>}
        </div>
      </header>

      <div className="admin-tools">
        <input type="search" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} aria-label="Search" />
        {p.filters && (
          <div className="filters" role="group" aria-label="Filter">
            {p.filters.map((f, k) => (
              <button key={f.label} className="chip" type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}>
                {f.label}<span className="n">{all.filter(r => (!p.where || p.where(r)) && f.test(r)).length}</span>
              </button>
            ))}
          </div>
        )}
        <span className="hint">{rows.length} {p.noun ?? "items"}</span>
      </div>

      <div className="table-wrap">
        <table className="admin-table">
          <thead><tr>{p.columns.map(c => <th key={c.label} className={c.className}>{c.label}</th>)}<th aria-label="Actions" /></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} onClick={() => open(r)} tabIndex={0} onKeyDown={e => { if (e.key === "Enter") open(r); }}>
                {p.columns.map(c => <td key={c.label} className={c.className}>{c.get(r)}</td>)}
                <td className="row-actions" onClick={e => e.stopPropagation()}>
                  {p.rowActions?.(r)}
                  <button type="button" className="link-btn" onClick={() => open(r)}>{canEdit ? "Edit" : "View"}</button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={p.columns.length + 1} className="table-empty">Nothing here yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <dialog ref={dialog} className="drawer" onClose={() => setDraft(null)} aria-label={isNew ? "New item" : "Edit item"}>
        {draft && (
          <form onSubmit={save} noValidate>
            <header>
              <h2>{isNew ? (p.newLabel ?? "Add new") : canEdit ? "Edit" : "Details"}</h2>
              <button type="button" className="x" aria-label="Close" onClick={() => setDraft(null)}>×</button>
            </header>
            <div className="drawer-body">
              {draft.sample && <p className="demo-note">This is sample content. Saving any change marks it as your own.</p>}
              {err && <p className="form-alert" role="alert">{err}</p>}
              <div className="drawer-grid">
                {p.fields.map(f => <FieldInput key={f.key} f={f} row={draft} set={set} disabled={!canEdit} onError={setErr} />)}
              </div>
            </div>
            <footer>
              {!isNew && canDelete && <button type="button" className="btn line sm danger" onClick={() => del(draft)}>Delete</button>}
              <span style={{ flex: 1 }} />
              <button type="button" className="btn line sm" onClick={() => setDraft(null)}>{canEdit ? "Cancel" : "Close"}</button>
              {canEdit && <button type="submit" className="btn blue sm">{isNew ? "Add" : "Save"}</button>}
            </footer>
          </form>
        )}
      </dialog>
    </div>
  );
}

function FieldInput({ f, row, set, disabled, onError }: { f: Field; row: Row; set: (k: string, v: unknown) => void; disabled: boolean; onError: (m: string) => void }) {
  const id = "fld-" + f.key;
  const v = row[f.key];
  const cls = "field" + (f.half ? " half" : "");
  const label = <label htmlFor={id}>{f.label}{!f.required && f.type !== "checkbox" && f.type !== "readonly" && <span className="opt"> (optional)</span>}</label>;
  const help = f.help && <p className="hint">{f.help}</p>;

  if (f.type === "readonly") return (
    <div className={cls}><span className="lbl">{f.label}</span><div className="ro">{f.show ? f.show(row) : String(v ?? "") || "—"}</div></div>
  );
  if (f.type === "checkbox") return (
    <label className={"check-row " + (f.half ? "half" : "")}><input type="checkbox" checked={!!v} disabled={disabled} onChange={e => set(f.key, e.target.checked)} /> <span>{f.label}{help}</span></label>
  );
  if (f.type === "image") return (
    <div className={cls}>
      {label}
      <div className="img-field">
        {v ? <img src={v} alt="" /> : <span className="img-empty">No image</span>}
        {!disabled && (
          <div>
            <input id={id} type="file" accept="image/*" onChange={async e => {
              const file = e.target.files?.[0]; if (!file) return;
              try { set(f.key, await shrink(file)); } catch (x) { onError((x as Error).message); }
            }} />
            <input type="text" placeholder="…or paste an image URL / path" value={v?.startsWith("data:") ? "" : v ?? ""} onChange={e => set(f.key, e.target.value)} aria-label={f.label + " URL"} />
            {v && <button type="button" className="link-btn" onClick={() => set(f.key, "")}>Remove image</button>}
          </div>
        )}
      </div>
      {help}
    </div>
  );
  if (f.type === "select") return (
    <div className={cls}>{label}
      <select id={id} value={v ?? ""} disabled={disabled} onChange={e => set(f.key, e.target.value)}>
        {!f.required && <option value="">—</option>}
        {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>{help}
    </div>
  );
  if (f.type === "textarea" || f.type === "long" || f.type === "lines") return (
    <div className={cls + " full"}>{label}
      <textarea id={id} rows={f.type === "long" ? 12 : 4} disabled={disabled}
        value={f.type === "lines" ? (v ?? []).join("\n") : v ?? ""}
        onChange={e => set(f.key, f.type === "lines" ? e.target.value.split("\n") : e.target.value)} />
      {f.type === "lines" ? <p className="hint">One per line.</p> : help}
    </div>
  );
  return (
    <div className={cls}>{label}
      <input id={id} disabled={disabled}
        type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "email" ? "email" : "text"}
        value={v ?? ""}
        placeholder={f.type === "slug" ? slugify(String(row[f.from!] || "")) || "generated-from-title" : undefined}
        onChange={e => set(f.key, f.type === "number" ? (e.target.value === "" ? "" : +e.target.value) : f.type === "slug" ? slugify(e.target.value) : e.target.value)} />
      {f.type === "slug" ? <p className="hint">Web address. Leave blank to generate from the {f.from}.</p> : help}
    </div>
  );
}
