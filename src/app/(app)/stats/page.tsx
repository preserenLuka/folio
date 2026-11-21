import { requireUser } from "@/lib/auth";
import { computeStats, goalProgress } from "@/lib/stats";
import { GoalsPanel } from "@/components/goals-panel";

const M = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
export default async function Stats() {
  const u = await requireUser();
  const [s, goals] = await Promise.all([computeStats(u.id), goalProgress(u.id)]);
  const max = Math.max(1, ...s.perMonth.map((m) => m.books));
  const Card = ({ k, v }: { k: string; v: string | number }) => <div className="rounded-xl bg-white/60 p-3"><div className="text-xs uppercase text-ink/50">{k}</div><div className="font-serif text-2xl">{v}</div></div>;
  const List = ({ title, rows }: { title: string; rows: [string, number][] }) => <div className="rounded-xl bg-white/60 p-3"><div className="mb-1 text-xs uppercase text-ink/50">{title}</div>{rows.length ? rows.map(([n, c]) => <div key={n} className="flex justify-between text-sm"><span className="truncate">{n}</span><span>{c}</span></div>) : <div className="text-sm text-ink/40">—</div>}</div>;
  return (
    <div className="space-y-5">
      <h1 className="font-serif text-2xl">{new Date().getFullYear()} in books</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card k="Books read" v={s.readThisYear} /><Card k="Pages" v={s.pagesThisYear.toLocaleString()} />
        <Card k="Hours read" v={(s.minutes / 60).toFixed(1)} /><Card k="Day streak" v={s.streak} />
        <Card k="Avg rating" v={s.avgRating ? s.avgRating.toFixed(2) : "—"} /><Card k="In collection" v={s.total} />
        <Card k="All-time read" v={s.readTotal} /><Card k="Longest" v={s.longest ?? "—"} />
      </div>
      <div className="rounded-xl bg-white/60 p-3"><div className="mb-2 text-xs uppercase text-ink/50">Books per month</div>
        <div className="flex h-28 items-end gap-1">{s.perMonth.map((m, i) => <div key={i} className="flex flex-1 flex-col items-center gap-1"><div className="w-full rounded-t bg-accent" style={{ height: `${(m.books / max) * 100}%`, minHeight: m.books ? 4 : 1 }} title={`${m.books} books, ${m.pages} pages`} /><span className="text-[10px] text-ink/50">{M[i]}</span></div>)}</div></div>
      <div className="grid gap-3 sm:grid-cols-2"><List title="Top authors" rows={s.topAuthors} /><List title="Top genres" rows={s.topGenres} /></div>
      <GoalsPanel goals={goals.map((g) => ({ id: g.id, type: g.type, period: g.period, target: g.target, current: g.current }))} />
    </div>
  );
}
