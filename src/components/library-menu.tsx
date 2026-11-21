"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as A from "@/lib/actions-libraries";
import { THEMES } from "@/lib/themes";
import { STATUS_LABEL } from "@/lib/status";

type Lib = { id: string; name: string; kind: "MANUAL" | "SMART"; theme: string; isDefault: boolean; statuses: string[] };

export function LibraryMenu({ lib }: { lib: Lib }) {
  const [open, setOpen] = useState(false); const [pending, start] = useTransition(); const router = useRouter();
  const [statuses, setStatuses] = useState<string[]>(lib.statuses);
  const run = (f: () => Promise<unknown>, after?: () => void) => start(async () => { await f(); after?.(); router.refresh(); });
  const item = "block w-full px-4 py-2 text-left text-sm hover:bg-black/5";
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="rounded-full bg-white/70 px-3 py-1 text-sm" aria-label="Library menu">⋯</button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-64 overflow-hidden rounded-xl border border-wood/20 bg-paper shadow-xl" aria-busy={pending}>
          <button className={item} onClick={() => { const n = prompt("Rename library", lib.name); if (n) run(() => A.renameLibrary(lib.id, n)); }}>Rename</button>
          <a className={item} href="/library/value">What it’s worth</a>
          <a className={item} href={`/api/library/${lib.id}/share`} target="_blank">Share as image</a>
          <div className="px-4 py-2 text-xs uppercase text-ink/50">Look</div>
          <div className="flex flex-wrap gap-1 px-4 pb-2">
            {Object.entries(THEMES).map(([id, t]) => (
              <button key={id} title={t.name} onClick={() => run(() => A.setLibraryTheme(lib.id, id))}
                className={`h-7 w-7 rounded-full border-2 ${lib.theme === id ? "border-accent" : "border-transparent"}`} style={{ background: t.bg }} />))}
          </div>
          <div className="border-t border-wood/10 px-4 py-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={lib.kind === "SMART"} onChange={(e) => run(() => A.setSmartRule(lib.id, e.target.checked ? (statuses.length ? statuses : ["WANT_TO_READ"]) : []))} />Fills itself</label>
            {lib.kind === "SMART" && <div className="mt-1 flex flex-wrap gap-1">{Object.entries(STATUS_LABEL).map(([s, l]) => (
              <button key={s} onClick={() => { const n = statuses.includes(s) ? statuses.filter((x) => x !== s) : [...statuses, s]; setStatuses(n); run(() => A.setSmartRule(lib.id, n)); }}
                className={`rounded-full px-2 py-0.5 text-xs ${statuses.includes(s) ? "bg-accent text-white" : "bg-black/5"}`}>{l}</button>))}</div>}
          </div>
          <button className={item} disabled={lib.isDefault} onClick={() => run(() => A.setDefaultLibrary(lib.id))}>{lib.isDefault ? "✓ Opens by default" : "Open by default"}</button>
          <button className={item} onClick={() => run(() => A.moveLibrary(lib.id, -1))}>Move left</button>
          <button className={item} onClick={() => run(() => A.moveLibrary(lib.id, 1))}>Move right</button>
          <button className={`${item} text-red-700`} onClick={() => { if (confirm("Delete this library? Books stay in your collection.")) run(() => A.deleteLibrary(lib.id), () => router.push("/library")); }}>Delete library</button>
        </div>)}
    </div>
  );
}

export function NewLibrary() {
  const router = useRouter(); const [pending, start] = useTransition();
  return <button disabled={pending} className="rounded-full border border-dashed border-wood/40 px-3 py-1 text-sm"
    onClick={() => { const name = prompt("Library name"); if (!name) return; const fd = new FormData(); fd.set("name", name); start(async () => { const id = await A.createLibrary(fd); router.push(`/library?lib=${id}`); }); }}>+ New library</button>;
}
