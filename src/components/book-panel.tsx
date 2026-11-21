"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as T from "@/lib/actions-tracking";
import { toggleInLibrary } from "@/lib/actions-libraries";
import { setStatus, removeBook } from "@/lib/actions-books";
import { STATUS_LABEL } from "@/lib/status";
import { EDGE_IDS } from "./book-3d";

type Note = { id: string; kind: "NOTE" | "QUOTE" | "REVIEW"; body: string; page: number | null };
type Props = {
  id: string; status: keyof typeof STATUS_LABEL; rating: number | null; fav: boolean; page: number; pages: number | null;
  notes: Note[]; sessions: { id: string; minutes: number; pagesRead: number; at: string }[];
  libs: { id: string; name: string; kind: string; has: boolean }[];
  details: { owned: boolean; format: string; price: string; paid: string; currency: string; started: string; finished: string; spine: string; edge: string; pages: string };
};

export function BookPanel(p: Props) {
  const [tab, setTab] = useState<"read" | "notes" | "edit" | "shelves">("read");
  const [pending, start] = useTransition(); const router = useRouter();
  const go = (f: () => Promise<unknown>) => start(async () => { await f(); router.refresh(); });
  const [page, setPage] = useState(String(p.page)); const [mins, setMins] = useState("20");
  const [kind, setKind] = useState<"NOTE" | "QUOTE" | "REVIEW">("NOTE"); const [body, setBody] = useState(""); const [npage, setNpage] = useState("");
  const pct = p.pages ? Math.round((p.page / p.pages) * 100) : 0;
  const chip = (on: boolean) => `rounded-full px-3 py-1 text-sm ${on ? "bg-accent text-white" : "bg-white/60"}`;
  const input = "rounded-lg border border-wood/30 bg-white/70 px-3 py-2";
  return (
    <div className="space-y-4" aria-busy={pending}>
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]).map((s) => <button key={s} onClick={() => go(() => setStatus(p.id, s))} className={chip(p.status === s)}>{STATUS_LABEL[s]}</button>)}
        <button onClick={() => go(() => T.toggleFavorite(p.id))} className="ml-auto text-xl" aria-label="Favourite">{p.fav ? "♥" : "♡"}</button>
      </div>
      <div className="flex items-center gap-1" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => {
          const v = p.rating ?? 0;
          return <button key={n} className="relative text-2xl text-amber-500" onClick={(e) => { const half = e.nativeEvent.offsetX < (e.currentTarget as HTMLElement).clientWidth / 2; const r = n - (half ? 0.5 : 0); go(() => T.rate(p.id, r === p.rating ? null : r)); }}>
            {v >= n ? "★" : v >= n - 0.5 ? "⯪" : "☆"}</button>;
        })}
        {p.rating != null && <span className="ml-2 text-sm text-ink/60">{p.rating}</span>}
      </div>
      <nav className="flex gap-2 border-b border-wood/10 pb-2 text-sm">
        {(["read", "notes", "shelves", "edit"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={chip(tab === t)}>{{ read: "Progress", notes: "Notes", shelves: "Shelves", edit: "Edit" }[t]}</button>)}
      </nav>

      {tab === "read" && (<div className="space-y-3">
        <div className="h-2 overflow-hidden rounded bg-black/10"><div className="h-full bg-accent" style={{ width: `${pct}%` }} /></div>
        <p className="text-sm text-ink/70">Page {p.page}{p.pages ? ` of ${p.pages} · ${pct}%` : ""}</p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-sm">Current page<br /><input className={`${input} w-24`} type="number" value={page} onChange={(e) => setPage(e.target.value)} /></label>
          <label className="text-sm">Session (min)<br /><input className={`${input} w-24`} type="number" value={mins} onChange={(e) => setMins(e.target.value)} /></label>
          <button className="rounded-lg bg-accent px-4 py-2 text-white" onClick={() => go(() => T.logSession(p.id, Number(mins) || 0, Number(page)))}>Log session</button>
          <button className="rounded-lg border border-wood/30 px-3 py-2" onClick={() => go(() => T.setProgress(p.id, Number(page)))}>Just update page</button>
        </div>
        <ul className="text-sm text-ink/70">{p.sessions.map((s) => <li key={s.id}>{s.at} — {s.minutes} min, {s.pagesRead} pages</li>)}</ul>
      </div>)}

      {tab === "notes" && (<div className="space-y-3">
        <div className="flex gap-2">{(["NOTE", "QUOTE", "REVIEW"] as const).map((k) => <button key={k} className={chip(kind === k)} onClick={() => setKind(k)}>{k[0] + k.slice(1).toLowerCase()}</button>)}</div>
        <textarea className={`${input} w-full`} rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder={kind === "QUOTE" ? "A line worth keeping…" : kind === "REVIEW" ? "What did you think?" : "Your thoughts…"} />
        <div className="flex gap-2"><input className={`${input} w-24`} type="number" placeholder="Page" value={npage} onChange={(e) => setNpage(e.target.value)} />
          <button className="rounded-lg bg-accent px-4 text-white" onClick={() => { go(() => T.addNote(p.id, kind, body, npage ? Number(npage) : null)); setBody(""); setNpage(""); }}>Save</button></div>
        <ul className="space-y-2">{p.notes.map((n) => <li key={n.id} className="rounded-lg bg-white/60 p-3 text-sm"><div className="text-xs uppercase text-ink/50">{n.kind}{n.page ? ` · p.${n.page}` : ""}</div>
          <div className={n.kind === "QUOTE" ? "font-serif italic" : ""}>{n.body}</div><button className="mt-1 text-xs text-red-700 underline" onClick={() => go(() => T.deleteNote(n.id))}>Delete</button></li>)}</ul>
      </div>)}

      {tab === "shelves" && (<div className="space-y-2">
        <p className="text-sm text-ink/60">Which libraries is this book on?</p>
        {p.libs.map((l) => <label key={l.id} className="flex items-center gap-2"><input type="checkbox" checked={l.has} disabled={l.kind === "SMART"} onChange={() => go(() => toggleInLibrary(l.id, p.id))} />{l.name}{l.kind === "SMART" && <span className="text-xs text-ink/50"> (fills itself)</span>}</label>)}
      </div>)}

      {tab === "edit" && (
        <form className="grid grid-cols-2 gap-3 text-sm" action={(fd) => go(() => T.updateDetails(p.id, fd))}>
          <label>Pages<br /><input name="pageCount" type="number" defaultValue={p.details.pages} className={`${input} w-full`} /></label>
          <label>Format<br /><select name="format" defaultValue={p.details.format} className={`${input} w-full`}><option value="">—</option>{["HARDCOVER", "PAPERBACK", "EBOOK", "AUDIOBOOK", "OTHER"].map((f) => <option key={f}>{f}</option>)}</select></label>
          <label>Started<br /><input name="startedAt" type="date" defaultValue={p.details.started} className={`${input} w-full`} /></label>
          <label>Finished<br /><input name="finishedAt" type="date" defaultValue={p.details.finished} className={`${input} w-full`} /></label>
          <label>Value<br /><input name="price" type="number" step="0.01" defaultValue={p.details.price} className={`${input} w-full`} /></label>
          <label>Paid<br /><input name="pricePaid" type="number" step="0.01" defaultValue={p.details.paid} className={`${input} w-full`} /></label>
          <label>Currency<br /><input name="currency" defaultValue={p.details.currency || "USD"} maxLength={3} className={`${input} w-full uppercase`} /></label>
          <label className="flex items-end gap-2 pb-2"><input name="owned" type="checkbox" defaultChecked={p.details.owned} /> I own this</label>
          <label>Spine colour<br /><input name="spineColor" type="color" defaultValue={p.details.spine || "#5a3d2b"} className="h-10 w-full" /></label>
          <label>Sprayed edges<br /><select name="sprayedEdges" defaultValue={p.details.edge} className={`${input} w-full`}><option value="">None</option>{EDGE_IDS.map((e) => <option key={e}>{e}</option>)}</select></label>
          <button className="col-span-2 rounded-lg bg-accent px-4 py-2 text-white">Save changes</button>
          <button type="button" className="col-span-2 text-left text-red-700 underline" onClick={() => { if (confirm("Remove this book from your collection?")) go(async () => { await removeBook(p.id); router.push("/books"); }); }}>Remove from collection</button>
        </form>)}
    </div>
  );
}
