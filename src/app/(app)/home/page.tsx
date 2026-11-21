import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { computeStats, goalProgress } from "@/lib/stats";
import { Ring } from "@/components/goals-panel";

export default async function Home() {
  const u = await requireUser();
  const [reading, s, goals, recent] = await Promise.all([
    db.userBook.findMany({ where: { userId: u.id, status: "READING" }, include: { book: true }, orderBy: { updatedAt: "desc" }, take: 5 }),
    computeStats(u.id), goalProgress(u.id),
    db.userBook.findMany({ where: { userId: u.id }, include: { book: true }, orderBy: { updatedAt: "desc" }, take: 6 }),
  ]);
  const hr = new Date().getHours();
  return (
    <div className="space-y-6">
      <div><h1 className="font-serif text-2xl">Good {hr < 12 ? "morning" : hr < 18 ? "afternoon" : "evening"}, {u.name}</h1>
        <p className="text-sm text-ink/60">{s.streak > 0 ? `🔥 ${s.streak}-day reading streak` : "Log a session today to start a streak."}</p></div>
      <section><h2 className="mb-2 text-sm uppercase tracking-wide text-ink/60">Currently reading</h2>
        {reading.length === 0 ? <p className="text-ink/70">Nothing in progress. <Link className="underline" href="/library?lib=">Pick from your shelf</Link> or <Link className="underline" href="/search">find a book</Link>.</p> :
          <ul className="space-y-2">{reading.map((r) => { const pct = r.book.pageCount ? (r.currentPage / r.book.pageCount) * 100 : 0; return (
            <li key={r.id}><Link href={`/books/${r.id}`} className="flex gap-3 rounded-xl bg-white/60 p-3">
              {r.book.coverUrl && /* eslint-disable-next-line @next/next/no-img-element */ <img src={r.book.coverUrl} alt="" className="h-20 w-14 rounded object-cover" />}
              <div className="flex-1"><div className="font-medium">{r.book.title}</div><div className="text-xs text-ink/60">p.{r.currentPage}/{r.book.pageCount ?? "?"}</div>
                <div className="mt-2 h-1.5 overflow-hidden rounded bg-black/10"><div className="h-full bg-accent" style={{ width: `${pct}%` }} /></div></div></Link></li>); })}</ul>}</section>
      {goals.length > 0 && <section><h2 className="mb-2 text-sm uppercase tracking-wide text-ink/60">Goals</h2><div className="flex flex-wrap gap-4">{goals.map((g) => <div key={g.id} className="flex items-center gap-2"><Ring pct={g.current / g.target} label={`${Math.round((g.current / g.target) * 100)}%`} /><span className="text-sm">{g.current}/{g.target} {g.type.toLowerCase()}<br /><span className="text-xs text-ink/50">this {g.period.toLowerCase()}</span></span></div>)}</div></section>}
      <section><h2 className="mb-2 text-sm uppercase tracking-wide text-ink/60">Recent activity</h2>
        <ul className="text-sm text-ink/70">{recent.map((r) => <li key={r.id}><Link href={`/books/${r.id}`} className="underline">{r.book.title}</Link> · {r.status.replace(/_/g, " ").toLowerCase()}</li>)}</ul></section>
    </div>
  );
}
