"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setPrice } from "@/lib/actions-value";

type Row = { id: string; title: string; author: string; coverUrl: string | null; price: number | null; paid: number | null };
const fmt = (n: number, cur: string) => new Intl.NumberFormat("en", { style: "currency", currency: cur, maximumFractionDigits: 2 }).format(n);

export function ValueClient({ rows, currency, libName }: { rows: Row[]; currency: string; libName: string }) {
  const [sel, setSel] = useState<Set<string>>(new Set(rows.filter((r) => r.price != null).map((r) => r.id)));
  const [stage, setStage] = useState<"pick" | "count" | "receipt">("pick");
  const [shown, setShown] = useState(0); const [pending, start] = useTransition(); const router = useRouter();
  const chosen = useMemo(() => rows.filter((r) => sel.has(r.id) && r.price != null), [rows, sel]);
  const total = chosen.reduce((s, r) => s + (r.price ?? 0), 0);
  const paid = chosen.reduce((s, r) => s + (r.paid ?? 0), 0);
  const priced = rows.filter((r) => r.price != null).length;

  function calc() {
    setStage("count"); setShown(0);
    const t0 = performance.now(), dur = 2600;
    const tick = (t: number) => { const k = Math.min(1, (t - t0) / dur); setShown(total * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); else setTimeout(() => setStage("receipt"), 700); };
    requestAnimationFrame(tick);
  }

  if (stage === "count") return (
    <div className="space-y-4 text-center">
      <button onClick={() => setStage("receipt")} className="ml-auto block btn btn-soft !min-h-9">Skip</button>
      <div className="display text-5xl text-accent">≈ {fmt(shown, currency)}</div>
      <p className="text-ink/60">{Math.min(chosen.length, Math.ceil((shown / (total || 1)) * chosen.length))} of {chosen.length} books</p>
      <div className="grid grid-cols-8 gap-1 sm:grid-cols-12">
        {chosen.map((r, i) => <div key={r.id} className="aspect-[2/3] rounded-sm bg-line-strong bg-cover transition-all duration-500"
          style={{ backgroundImage: r.coverUrl ? `url(${r.coverUrl})` : undefined, opacity: i < (shown / (total || 1)) * chosen.length ? 1 : 0.1, transform: i < (shown / (total || 1)) * chosen.length ? "scale(1)" : "scale(.6)" }} />)}
      </div>
    </div>);

  if (stage === "receipt") return (
    <div className="space-y-3">
      <div className="mx-auto max-w-sm bg-white px-5 py-6 text-[#231d17] font-mono text-sm shadow-xl" style={{ clipPath: "polygon(0 0,100% 0,100% calc(100% - 8px),96% 100%,92% calc(100% - 8px),88% 100%,84% calc(100% - 8px),80% 100%,76% calc(100% - 8px),72% 100%,68% calc(100% - 8px),64% 100%,60% calc(100% - 8px),56% 100%,52% calc(100% - 8px),48% 100%,44% calc(100% - 8px),40% 100%,36% calc(100% - 8px),32% 100%,28% calc(100% - 8px),24% 100%,20% calc(100% - 8px),16% 100%,12% calc(100% - 8px),8% 100%,4% calc(100% - 8px),0 100%)" }}>
        <div className="text-center font-serif text-xl">{libName}</div>
        <div className="mb-3 text-center text-xs text-ink/50">{new Date().toLocaleDateString()} · LIBRARY VALUE</div>
        <ul className="space-y-1">{chosen.map((r) => <li key={r.id} className="flex justify-between gap-2"><span className="truncate">{r.title}</span><span>{fmt(r.price ?? 0, currency)}</span></li>)}</ul>
        <div className="my-3 border-t border-dashed border-ink/40" />
        <div className="flex justify-between text-base font-bold"><span>TOTAL</span><span>≈ {fmt(total, currency)}</span></div>
        {paid > 0 && <div className="flex justify-between text-ink/60"><span>What you paid*</span><span>{fmt(paid, currency)}</span></div>}
        <div className="mt-3 h-10" style={{ background: "repeating-linear-gradient(90deg,#000 0 2px,#fff 2px 4px,#000 4px 5px,#fff 5px 8px)" }} />
        <div className="mt-3 inline-block -rotate-6 rounded-full border-4 border-red-700 px-3 py-1 font-bold text-red-700">PAID</div>
      </div>
      <button onClick={() => setStage("pick")} className="btn btn-soft mx-auto">Back</button>
    </div>);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm"><span className="text-ink/60">{priced} of {rows.length} priced</span>
        <button className="font-semibold text-accent" onClick={() => setSel(new Set())}>Deselect all</button></div>
      <ul className="card-flat divide-y divide-line overflow-hidden px-3">{rows.map((r) => (
        <li key={r.id} className="flex items-center gap-3 py-2">
          <input type="checkbox" className="h-5 w-5 accent-[var(--accent)]" checked={sel.has(r.id)} onChange={() => setSel((s) => { const n = new Set(s); n.has(r.id) ? n.delete(r.id) : n.add(r.id); return n; })} />
          <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{r.title}</div><div className="truncate text-xs text-ink/50">{r.author}</div></div>
          <input defaultValue={r.price ?? ""} placeholder="Add price" type="number" step="0.01" className="field !min-h-9 !w-24 !px-2 !py-1 text-right !text-sm"
            onBlur={(e) => start(async () => { await setPrice(r.id, e.target.value === "" ? null : Number(e.target.value), currency); router.refresh(); })} />
        </li>))}</ul>
      <button disabled={pending || chosen.length === 0} onClick={calc} className="btn btn-primary sticky bottom-24 w-full !min-h-12 shadow-lg md:bottom-4">Calculate · {chosen.length}</button>
    </div>);
}
