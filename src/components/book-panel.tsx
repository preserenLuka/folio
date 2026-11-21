"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as T from "@/lib/actions-tracking";
import { toggleInLibrary } from "@/lib/actions-libraries";
import { setStatus, removeBook } from "@/lib/actions-books";
import { STATUS_LABEL } from "@/lib/status";
import { EDGE_IDS } from "./book-3d";
import { Icon } from "./icons";
import { ProgressBar, StarGlyph } from "./ui";

type Note = { id: string; kind: "NOTE" | "QUOTE" | "REVIEW"; body: string; page: number | null };
type Props = {
  id: string; status: keyof typeof STATUS_LABEL; rating: number | null; fav: boolean; page: number; pages: number | null;
  notes: Note[]; sessions: { id: string; minutes: number; pagesRead: number; at: string }[];
  libs: { id: string; name: string; kind: string; has: boolean }[];
  details: { owned: boolean; format: string; price: string; paid: string; currency: string; started: string; finished: string; spine: string; edge: string; pages: string };
};
const TABS = { read: "Progress", notes: "Notes", shelves: "Shelves", edit: "Details" } as const;

export function BookPanel(p: Props) {
  const [tab, setTab] = useState<keyof typeof TABS>("read");
  const [pending, start] = useTransition(); const router = useRouter();
  const go = (f: () => Promise<unknown>) => start(async () => { await f(); router.refresh(); });
  const [page, setPage] = useState(String(p.page)); const [mins, setMins] = useState("20");
  const [kind, setKind] = useState<"NOTE" | "QUOTE" | "REVIEW">("NOTE"); const [body, setBody] = useState(""); const [npage, setNpage] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);
  const pct = p.pages ? Math.min(100, Math.round((p.page / p.pages) * 100)) : 0;

  return (
    <div className={`space-y-5 transition-opacity ${pending ? "opacity-70" : ""}`} aria-busy={pending}>
      <div className="no-scrollbar -mx-5 flex items-center gap-2 overflow-x-auto px-5">
        {(Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]).map((s) => <button key={s} onClick={() => go(() => setStatus(p.id, s))} className={`chip ${p.status === s ? "chip-on" : ""}`}>{p.status === s && <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />}{STATUS_LABEL[s]}</button>)}
      </div>

      <div className="card-flat flex items-center justify-between px-4 py-3">
        <div className="flex items-center" role="group" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => {
            const v = p.rating ?? 0;
            return <button key={n} aria-label={`${n} stars`} className="text-gold transition-transform active:scale-90" onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); const half = e.clientX - rect.left < rect.width / 2; const r = n - (half ? 0.5 : 0); go(() => T.rate(p.id, r === p.rating ? null : r)); }}>
              <StarGlyph fill={v >= n ? 1 : v >= n - 0.5 ? 0.5 : 0} className="h-8 w-8" /></button>;
          })}
          {p.rating != null && <span className="ml-2 text-sm font-semibold tabular-nums text-muted">{p.rating}</span>}
        </div>
        <button onClick={() => go(() => T.toggleFavorite(p.id))} className={`grid h-10 w-10 place-items-center rounded-full transition-transform active:scale-90 ${p.fav ? "bg-accent-soft text-accent" : "text-muted hover:bg-sunken"}`} aria-label={p.fav ? "Remove from favourites" : "Add to favourites"} aria-pressed={p.fav}><Icon name="heart" fill={p.fav} className="h-5 w-5" /></button>
      </div>

      <nav className="flex border-b border-line" role="tablist">
        {(Object.keys(TABS) as (keyof typeof TABS)[]).map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`-mb-px flex-1 border-b-2 py-2.5 text-sm font-semibold transition-colors ${tab === t ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"}`}>{TABS[t]}</button>)}
      </nav>

      {tab === "read" && (<div className="space-y-5">
        <div className="card-flat p-4">
          <div className="flex items-end justify-between"><div className="display text-4xl">{pct}<span className="text-xl text-muted">%</span></div><div className="text-sm text-muted">Page {p.page}{p.pages ? ` of ${p.pages}` : ""}</div></div>
          <ProgressBar pct={pct} className="mt-3 !h-2" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label" htmlFor="pg">Current page</label><input id="pg" className="field" inputMode="numeric" type="number" value={page} onChange={(e) => setPage(e.target.value)} /></div>
          <div><label className="label" htmlFor="mn">Session (minutes)</label><input id="mn" className="field" inputMode="numeric" type="number" value={mins} onChange={(e) => setMins(e.target.value)} /></div>
          <button className="btn btn-primary col-span-2" disabled={pending} onClick={() => go(() => T.logSession(p.id, Number(mins) || 0, Number(page)))}><Icon name="clock" className="h-4 w-4" />{pending ? "Saving…" : "Log reading session"}</button>
          <button className="btn btn-soft col-span-2" disabled={pending} onClick={() => go(() => T.setProgress(p.id, Number(page)))}>Just update the page</button>
        </div>
        <div><h3 className="eyebrow mb-2">Recent sessions</h3>
          {p.sessions.length === 0 ? <p className="rounded-2xl border border-dashed border-line-strong p-4 text-center text-sm text-muted">No sessions yet. Log your first one above.</p>
            : <ul className="card-flat divide-y divide-line">{p.sessions.map((s) => <li key={s.id} className="flex items-center justify-between px-4 py-3 text-sm"><span className="text-muted">{new Date(s.at + "T00:00:00").toLocaleDateString("en", { day: "numeric", month: "short" })}</span><span className="font-medium">{s.minutes} min · {s.pagesRead} pages</span></li>)}</ul>}</div>
      </div>)}

      {tab === "notes" && (<div className="space-y-4">
        <div className="card-flat space-y-3 p-4">
          <div className="flex gap-2">{(["NOTE", "QUOTE", "REVIEW"] as const).map((k) => <button key={k} className={`chip ${kind === k ? "chip-on" : ""}`} onClick={() => setKind(k)}>{k[0] + k.slice(1).toLowerCase()}</button>)}</div>
          <textarea className="field" rows={3} value={body} onChange={(e) => setBody(e.target.value)} aria-label="Note text" placeholder={kind === "QUOTE" ? "A line worth keeping…" : kind === "REVIEW" ? "What did you think?" : "Your thoughts…"} />
          <div className="flex gap-2"><input className="field !w-28" type="number" inputMode="numeric" placeholder="Page" aria-label="Page" value={npage} onChange={(e) => setNpage(e.target.value)} />
            <button disabled={pending || !body.trim()} className="btn btn-primary flex-1" onClick={() => { go(() => T.addNote(p.id, kind, body, npage ? Number(npage) : null)); setBody(""); setNpage(""); }}>Save {kind.toLowerCase()}</button></div>
        </div>
        {p.notes.length === 0 && <p className="py-4 text-center text-sm text-muted">Quotes, thoughts and reviews will collect here.</p>}
        <ul className="space-y-3">{p.notes.map((n) => <li key={n.id} className={`card-flat p-4 text-[15px] ${n.kind === "QUOTE" ? "border-l-4 border-l-accent" : ""}`}>
          <div className="eyebrow mb-1.5 flex justify-between"><span>{n.kind}{n.page ? ` · p.${n.page}` : ""}</span>
            <button aria-label="Delete note" className="text-muted hover:text-danger" onClick={() => go(() => T.deleteNote(n.id))}><Icon name="trash" className="h-4 w-4" /></button></div>
          <div className={`leading-relaxed ${n.kind === "QUOTE" ? "display !font-normal italic" : ""}`}>{n.body}</div></li>)}</ul>
      </div>)}

      {tab === "shelves" && (<div className="space-y-2">
        <p className="text-sm text-muted">Choose which shelves this book stands on.</p>
        <ul className="card-flat divide-y divide-line">{p.libs.map((l) => (
          <li key={l.id}><label className={`flex items-center gap-3 px-4 py-3.5 ${l.kind === "SMART" ? "opacity-60" : "cursor-pointer"}`}>
            <input type="checkbox" className="h-5 w-5 accent-[var(--accent)]" checked={l.has} disabled={l.kind === "SMART"} onChange={() => go(() => toggleInLibrary(l.id, p.id))} />
            <span className="flex-1 font-medium">{l.name}</span>{l.kind === "SMART" && <span className="chip !py-0.5 text-[11px]"><Icon name="sparkle" className="h-3 w-3" />fills itself</span>}</label></li>))}</ul>
      </div>)}

      {tab === "edit" && (
        <form className="grid grid-cols-2 gap-3" action={(fd) => go(() => T.updateDetails(p.id, fd))}>
          <div><label className="label">Pages</label><input name="pageCount" type="number" defaultValue={p.details.pages} className="field" /></div>
          <div><label className="label">Format</label><select name="format" defaultValue={p.details.format} className="field"><option value="">—</option>{["HARDCOVER", "PAPERBACK", "EBOOK", "AUDIOBOOK", "OTHER"].map((f) => <option key={f} value={f}>{f[0] + f.slice(1).toLowerCase()}</option>)}</select></div>
          <div><label className="label">Started</label><input name="startedAt" type="date" defaultValue={p.details.started} className="field" /></div>
          <div><label className="label">Finished</label><input name="finishedAt" type="date" defaultValue={p.details.finished} className="field" /></div>
          <div><label className="label">Value</label><input name="price" type="number" step="0.01" defaultValue={p.details.price} className="field" /></div>
          <div><label className="label">Paid</label><input name="pricePaid" type="number" step="0.01" defaultValue={p.details.paid} className="field" /></div>
          <div><label className="label">Currency</label><input name="currency" defaultValue={p.details.currency || "USD"} maxLength={3} className="field uppercase" /></div>
          <label className="flex items-end gap-2 pb-3 text-sm font-medium"><input name="owned" type="checkbox" className="h-5 w-5 accent-[var(--accent)]" defaultChecked={p.details.owned} /> I own this</label>
          <div><label className="label">Spine colour</label><input name="spineColor" type="color" defaultValue={p.details.spine || "#5a3d2b"} className="field !p-1" /></div>
          <div><label className="label">Sprayed edges</label><select name="sprayedEdges" defaultValue={p.details.edge} className="field"><option value="">None</option>{EDGE_IDS.map((e) => <option key={e} value={e}>{e[0].toUpperCase() + e.slice(1)}</option>)}</select></div>
          <button disabled={pending} className="btn btn-primary col-span-2">{pending ? "Saving…" : "Save changes"}</button>
          {!confirmDel ? <button type="button" className="btn btn-danger col-span-2" onClick={() => setConfirmDel(true)}><Icon name="trash" className="h-4 w-4" />Remove from collection</button>
            : <div className="pop-in col-span-2 flex items-center gap-2 rounded-2xl border border-danger/40 p-3"><span className="flex-1 text-sm">Remove this book for good?</span>
              <button type="button" className="btn btn-soft !min-h-9" onClick={() => setConfirmDel(false)}>Cancel</button>
              <button type="button" className="btn !min-h-9 bg-danger text-paper" onClick={() => go(async () => { await removeBook(p.id); router.push("/books"); })}>Remove</button></div>}
        </form>)}
    </div>
  );
}
