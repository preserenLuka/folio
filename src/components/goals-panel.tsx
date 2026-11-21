"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setGoal, deleteGoal } from "@/lib/actions-tracking";

type G = { id: string; type: string; period: string; target: number; current: number };
export function Ring({ pct, label }: { pct: number; label: string }) {
  const r = 28, c = 2 * Math.PI * r;
  return <svg width="72" height="72" viewBox="0 0 72 72"><circle cx="36" cy="36" r={r} fill="none" stroke="rgba(0,0,0,.1)" strokeWidth="7" /><circle cx="36" cy="36" r={r} fill="none" stroke="#b4532a" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, pct))} transform="rotate(-90 36 36)" /><text x="36" y="40" textAnchor="middle" fontSize="13">{label}</text></svg>;
}
export function GoalsPanel({ goals }: { goals: G[] }) {
  const [pending, start] = useTransition(); const router = useRouter();
  return (
    <section className="rounded-xl bg-white/60 p-3">
      <div className="mb-2 text-xs uppercase text-ink/50">Goals</div>
      <div className="mb-3 flex flex-wrap gap-4">{goals.map((g) => (
        <div key={g.id} className="flex items-center gap-2"><Ring pct={g.current / g.target} label={`${Math.round((g.current / g.target) * 100)}%`} />
          <div className="text-sm"><div>{g.current}/{g.target} {g.type.toLowerCase()}</div><div className="text-xs text-ink/50">this {g.period.toLowerCase()}</div>
            <button className="text-xs text-red-700 underline" onClick={() => start(async () => { await deleteGoal(g.id); router.refresh(); })}>remove</button></div></div>))}
        {goals.length === 0 && <p className="text-sm text-ink/50">No goals yet.</p>}</div>
      <form className="flex flex-wrap gap-2 text-sm" action={(fd) => start(async () => { await setGoal(fd); router.refresh(); })}>
        <input name="target" type="number" min={1} placeholder="Target" className="w-24 rounded border border-wood/30 bg-white/70 px-2 py-1" required />
        <select name="type" className="rounded border border-wood/30 bg-white/70 px-2 py-1"><option value="BOOKS">books</option><option value="PAGES">pages</option><option value="MINUTES">minutes</option></select>
        <select name="period" className="rounded border border-wood/30 bg-white/70 px-2 py-1"><option value="YEAR">per year</option><option value="MONTH">per month</option><option value="WEEK">per week</option></select>
        <button disabled={pending} className="rounded bg-accent px-3 py-1 text-white">Set goal</button></form>
    </section>);
}
