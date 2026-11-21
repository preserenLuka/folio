"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as A from "@/lib/actions-libraries";
import { THEMES } from "@/lib/themes";
import { STATUS_LABEL } from "@/lib/status";
import { Icon } from "./icons";

type Lib = { id: string; name: string; kind: "MANUAL" | "SMART"; theme: string; isDefault: boolean; statuses: string[] };

export function LibraryMenu({ lib }: { lib: Lib }) {
  const [open, setOpen] = useState(false); const [pending, start] = useTransition(); const router = useRouter();
  const [statuses, setStatuses] = useState<string[]>(lib.statuses);
  const [renaming, setRenaming] = useState(false); const [name, setName] = useState(lib.name); const [confirmDel, setConfirmDel] = useState(false);
  const run = (f: () => Promise<unknown>, after?: () => void) => start(async () => { await f(); after?.(); router.refresh(); });
  const item = "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium hover:bg-sunken disabled:opacity-50";
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="btn btn-icon" aria-label="Shelf options" aria-expanded={open}><Icon name="dots" className="h-5 w-5" fill /></button>
      {open && <button className="fixed inset-0 z-10 cursor-default" aria-label="Close menu" onClick={() => setOpen(false)} />}
      {open && (
        <div className="pop-in card absolute right-0 z-20 mt-2 w-72 max-w-[85vw] overflow-hidden !rounded-2xl py-1" aria-busy={pending}>
          {renaming ? (
            <form className="flex gap-2 p-3" onSubmit={(e) => { e.preventDefault(); if (name.trim()) run(() => A.renameLibrary(lib.id, name.trim()), () => setRenaming(false)); }}>
              <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className="field !min-h-9 !py-1.5" aria-label="Shelf name" /><button className="btn btn-primary !min-h-9">Save</button></form>
          ) : <button className={item} onClick={() => setRenaming(true)}><Icon name="pencil" className="h-4 w-4 text-muted" />Rename</button>}
          <a className={item} href="/library/value"><Icon name="coin" className="h-4 w-4 text-muted" />What it’s worth</a>
          <a className={item} href={`/api/library/${lib.id}/share`} target="_blank" rel="noreferrer"><Icon name="share" className="h-4 w-4 text-muted" />Share as image</a>
          <div className="border-t border-line px-4 pb-2 pt-3"><div className="eyebrow mb-2">Look</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(THEMES).map(([id, t]) => (
                <button key={id} title={t.name} aria-label={t.name} aria-pressed={lib.theme === id} onClick={() => run(() => A.setLibraryTheme(lib.id, id))}
                  className={`h-8 w-8 rounded-full ring-offset-2 ring-offset-surface transition-all ${lib.theme === id ? "ring-2 ring-accent" : "ring-1 ring-black/10"}`} style={{ background: t.bg }} />))}
            </div></div>
          <div className="border-t border-line px-4 py-3">
            <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-[var(--accent)]" checked={lib.kind === "SMART"} onChange={(e) => run(() => A.setSmartRule(lib.id, e.target.checked ? (statuses.length ? statuses : ["WANT_TO_READ"]) : []))} />Fills itself</label>
            {lib.kind === "SMART" && <div className="mt-2 flex flex-wrap gap-1.5">{Object.entries(STATUS_LABEL).map(([s, l]) => (
              <button key={s} onClick={() => { const n = statuses.includes(s) ? statuses.filter((x) => x !== s) : [...statuses, s]; setStatuses(n); run(() => A.setSmartRule(lib.id, n)); }}
                className={`chip !px-2.5 !py-1 text-xs ${statuses.includes(s) ? "chip-on" : ""}`}>{l}</button>))}</div>}
          </div>
          <div className="border-t border-line">
            <button className={item} disabled={lib.isDefault} onClick={() => run(() => A.setDefaultLibrary(lib.id))}><Icon name={lib.isDefault ? "check" : "bookmark"} className="h-4 w-4 text-muted" />{lib.isDefault ? "Opens by default" : "Open by default"}</button>
            <div className="flex"><button className={item} onClick={() => run(() => A.moveLibrary(lib.id, -1))}><Icon name="back" className="h-4 w-4 text-muted" />Move left</button>
              <button className={item} onClick={() => run(() => A.moveLibrary(lib.id, 1))}>Move right<Icon name="next" className="h-4 w-4 text-muted" /></button></div>
            {!confirmDel ? <button className={`${item} text-danger`} onClick={() => setConfirmDel(true)}><Icon name="trash" className="h-4 w-4" />Delete shelf</button>
              : <div className="flex items-center gap-2 px-4 py-2.5"><span className="flex-1 text-xs text-muted">Books stay in your collection.</span><button className="btn btn-soft !min-h-8 !px-3 !py-1" onClick={() => setConfirmDel(false)}>No</button>
                <button className="btn !min-h-8 !px-3 !py-1 bg-danger text-paper" onClick={() => run(() => A.deleteLibrary(lib.id), () => router.push("/library"))}>Delete</button></div>}
          </div>
        </div>)}
    </div>
  );
}

export function NewLibrary() {
  const router = useRouter(); const [pending, start] = useTransition(); const [open, setOpen] = useState(false); const [name, setName] = useState("");
  if (open) return (
    <form className="pop-in flex flex-none items-center gap-1.5" onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; const fd = new FormData(); fd.set("name", name.trim()); start(async () => { const id = await A.createLibrary(fd); setOpen(false); setName(""); router.push(`/library?lib=${id}`); }); }}>
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Shelf name" aria-label="Shelf name" className="field !min-h-9 !w-36 !rounded-full !py-1 !text-sm" onKeyDown={(e) => e.key === "Escape" && setOpen(false)} />
      <button disabled={pending} className="btn btn-primary !min-h-9 !px-3.5 !py-1">{pending ? "…" : "Add"}</button></form>);
  return <button className="chip flex-none !border-dashed" onClick={() => setOpen(true)}><Icon name="plus" className="h-3.5 w-3.5" />New shelf</button>;
}
