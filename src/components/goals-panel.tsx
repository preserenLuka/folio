"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setGoal, deleteGoal } from "@/lib/actions-tracking";
import { Icon } from "./icons";

type G = { id: string; type: string; period: string; target: number; current: number };
export function Ring({ pct, label, size = 72 }: { pct: number; label: string; size?: number }) {
  const r = 28, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" role="img" aria-label={label}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="var(--sunken)" strokeWidth="7" />
      <circle cx="36" cy="36" r={r} fill="none" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, pct))} transform="rotate(-90 36 36)" style={{ transition: "stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)" }} />
      <text x="36" y="40.500" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--ink)">{label}</text>
    </svg>
  );
}
export function GoalsPanel({ goals }: { goals: G[] }) {
  const [pending, start] = useTransition(); const router = useRouter(); const [open, setOpen] = useState(goals.length === 0);
  return (
    <section className="card-flat p-4">
      <div className="mb-3 flex items-center justify-between"><div className="eyebrow">Reading goals</div>
        <button className="btn btn-soft !min-h-8 !px-3 !py-1 text-xs" onClick={() => setOpen(!open)}><Icon name="plus" className="h-3.5 w-3.5" />{open ? "Close" : "New goal"}</button></div>
      {goals.length === 0 && !open && <p className="text-sm text-muted">No goals yet.</p>}
      <ul className="space-y-3">{goals.map((g) => (
        <li key={g.id} className="flex items-center gap-3.5">
          <Ring pct={g.current / g.target} label={`${Math.round((g.current / g.target) * 100)}%`} size={60} />
          <div className="min-w-0 flex-1"><div className="font-semibold">{g.current} of {g.target} {g.type.toLowerCase()}</div><div className="text-xs capitalize text-muted">this {g.period.toLowerCase()}</div></div>
          <button aria-label="Remove goal" className="btn btn-ghost !min-h-9 !w-9 !p-0" onClick={() => start(async () => { await deleteGoal(g.id); router.refresh(); })}><Icon name="trash" className="h-4 w-4" /></button>
        </li>))}</ul>
      {open && (
        <form className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4" action={(fd) => start(async () => { await setGoal(fd); router.refresh(); setOpen(false); })}>
          <input name="target" type="number" min={1} placeholder="Target" className="field" required aria-label="Target" />
          <select name="type" className="field" aria-label="Type"><option value="BOOKS">books</option><option value="PAGES">pages</option><option value="MINUTES">minutes</option></select>
          <select name="period" className="field" aria-label="Period"><option value="YEAR">per year</option><option value="MONTH">per month</option><option value="WEEK">per week</option></select>
          <button disabled={pending} className="btn btn-primary col-span-3">{pending ? "Saving…" : "Set goal"}</button></form>)}
    </section>);
}
