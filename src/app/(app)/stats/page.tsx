import { requireUser } from "@/lib/auth";
import { computeStats, goalProgress } from "@/lib/stats";
import { GoalsPanel } from "@/components/goals-panel";
import { Icon } from "@/components/icons";

export const metadata = { title: "Stats" };
const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default async function Stats() {
  const u = await requireUser();
  const [s, goals] = await Promise.all([computeStats(u.id), goalProgress(u.id)]);
  const year = new Date().getFullYear(), curMonth = new Date().getMonth();
  const max = Math.max(1, ...s.perMonth.map((m) => m.books));
  const maxMin = Math.max(1, ...s.activity.map((a) => a?.minutes ?? 0));
  const yearGoal = goals.find((g) => g.type === "BOOKS" && g.period === "YEAR");
  const tiles: [string, string | number, string][] = [
    ["Pages", s.pagesThisYear.toLocaleString(), "page"], ["Hours read", (s.minutes / 60).toFixed(1), "clock"], ["Day streak", s.streak, "flame"],
    ["Avg rating", s.avgRating ? s.avgRating.toFixed(2) : "—", "star"], ["In collection", s.total, "books"], ["All-time read", s.readTotal, "check"],
  ];
  const Bars = ({ title, rows }: { title: string; rows: [string, number][] }) => (
    <div className="card-flat p-4"><div className="eyebrow mb-3">{title}</div>
      {rows.length ? <ul className="space-y-2.5">{rows.map(([n, c]) => <li key={n}><div className="mb-1 flex justify-between gap-2 text-sm"><span className="truncate font-medium">{n}</span><span className="text-muted">{c}</span></div>
        <div className="progress"><span style={{ width: `${(c / rows[0][1]) * 100}%` }} /></div></li>)}</ul> : <p className="text-sm text-muted">Finish a book this year to see this.</p>}</div>);

  return (
    <div className="stagger space-y-5">
      <div><div className="eyebrow mb-1">Your reading year</div><h1 className="display text-[1.9rem]">{year} in books</h1></div>

      <section className="card relative overflow-hidden bg-accent p-5 !text-accent-ink" style={{ background: "var(--accent)" }}>
        <div className="text-sm font-semibold opacity-80">Books finished</div>
        <div className="display mt-1 text-[4.5rem] leading-none">{s.readThisYear}</div>
        {yearGoal ? <div className="mt-3"><div className="mb-1.5 flex justify-between text-xs font-semibold opacity-90"><span>Goal: {yearGoal.target}</span><span>{Math.round((yearGoal.current / yearGoal.target) * 100)}%</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-black/20"><div className="h-full rounded-full bg-white/90 transition-all duration-700" style={{ width: `${Math.min(100, (yearGoal.current / yearGoal.target) * 100)}%` }} /></div></div>
          : <p className="mt-3 text-sm opacity-80">Set a yearly goal below to track your pace.</p>}
        <Icon name="books" className="absolute -right-3 -top-3 h-28 w-28 opacity-15" strokeWidth={1.2} />
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{tiles.map(([k, v, ic]) => (
        <div key={k} className="card-flat p-3.5"><Icon name={ic} className="mb-2 h-[18px] w-[18px] text-accent" /><div className="display text-2xl">{v}</div><div className="text-xs text-muted">{k}</div></div>))}</div>

      <section className="card-flat p-4"><div className="eyebrow mb-4">Books per month</div>
        <div className="flex h-36 items-end gap-1.5">{s.perMonth.map((m, i) => (
          <div key={i} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5" title={`${M[i]}: ${m.books} books, ${m.pages.toLocaleString()} pages`}>
            <span className={`text-[10px] font-bold ${m.books ? "text-ink" : "text-transparent"}`}>{m.books || 0}</span>
            <div className={`w-full rounded-t-md transition-all duration-700 ${i === curMonth ? "bg-accent" : "bg-accent/45 group-hover:bg-accent/70"}`} style={{ height: `${Math.max(m.books ? 6 : 2, (m.books / max) * 78)}%` }} />
            <span className={`text-[10px] ${i === curMonth ? "font-bold text-ink" : "text-muted"}`}>{M[i][0]}</span></div>))}</div></section>

      <section className="card-flat p-4"><div className="mb-3 flex items-center justify-between"><div className="eyebrow">Last 12 weeks</div><div className="flex items-center gap-1 text-[10px] text-muted">Less {[0.15, 0.4, 0.7, 1].map((o) => <span key={o} className="h-2.5 w-2.5 rounded-[3px] bg-accent" style={{ opacity: o }} />)} More</div></div>
        <div className="grid grid-flow-col grid-rows-7 gap-1" style={{ gridTemplateColumns: "repeat(13, 1fr)" }}>{s.activity.map((a, i) => (
          <span key={i} title={a ? `${a.date}: ${a.minutes} min` : undefined} className={`aspect-square rounded-[4px] ${a ? (a.minutes ? "bg-accent" : "bg-sunken") : "opacity-0"}`} style={a?.minutes ? { opacity: 0.25 + 0.75 * (a.minutes / maxMin) } : undefined} />))}</div></section>

      <div className="grid gap-3 sm:grid-cols-2"><Bars title="Top authors" rows={s.topAuthors} /><Bars title="Top genres" rows={s.topGenres} /></div>
      {s.longest && <div className="card-flat flex items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent"><Icon name="page" /></span><div className="min-w-0"><div className="eyebrow">Longest book this year</div><div className="display truncate text-lg">{s.longest}</div></div></div>}
      <GoalsPanel goals={goals.map((g) => ({ id: g.id, type: g.type, period: g.period, target: g.target, current: g.current }))} />
    </div>
  );
}
