import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { computeStats, goalProgress } from "@/lib/stats";
import { Ring } from "@/components/goals-panel";
import { Cover, ProgressBar, EmptyState } from "@/components/ui";
import { Icon } from "@/components/icons";

export const metadata = { title: "Home" };

export default async function Home() {
  const u = await requireUser();
  const [reading, s, goals, recent] = await Promise.all([
    db.userBook.findMany({ where: { userId: u.id, status: "READING" }, include: { book: true }, orderBy: { updatedAt: "desc" }, take: 6 }),
    computeStats(u.id), goalProgress(u.id),
    db.userBook.findMany({ where: { userId: u.id }, include: { book: true }, orderBy: { updatedAt: "desc" }, take: 10 }),
  ]);
  const now = new Date(), hr = now.getHours();
  const first = u.name.split(" ")[0];
  const pctOf = (r: (typeof reading)[number]) => (r.book.pageCount ? Math.min(100, (r.currentPage / r.book.pageCount) * 100) : 0);
  const [hero, ...others] = reading;
  const steps = [
    { done: s.total > 0, label: "Add your first book", href: "/search" },
    { done: goals.length > 0, label: "Set a reading goal", href: "/stats" },
    { done: s.minutes > 0, label: "Log a reading session", href: reading[0] ? `/books/${reading[0].id}` : "/books" },
  ];
  const onboarding = steps.some((x) => !x.done) && s.readTotal === 0 && s.minutes === 0;

  return (
    <div className="stagger space-y-7">
      <div>
        <div className="eyebrow mb-1">{now.toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long" })}</div>
        <h1 className="display text-[2rem]">Good {hr < 12 ? "morning" : hr < 18 ? "afternoon" : "evening"},<br />{first}</h1>
      </div>

      {onboarding && (
        <section className="card p-5">
          <h2 className="display text-xl">Let’s get your shelf started</h2>
          <ol className="mt-4">{steps.map((x, i) => (
            <li key={x.label} className="relative flex gap-3 pb-4 last:pb-0">
              {i < steps.length - 1 && <span className="absolute left-[11px] top-6 h-full w-px bg-line-strong" />}
              <span className={`z-10 grid h-6 w-6 flex-none place-items-center rounded-full border-2 ${x.done ? "border-accent bg-accent text-accent-ink" : "border-line-strong bg-surface"}`}>{x.done && <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />}</span>
              <Link href={x.href} className={`text-[15px] font-medium ${x.done ? "text-muted line-through" : "hover:text-accent"}`}>{x.label}</Link>
            </li>))}</ol>
        </section>
      )}

      <section className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`grid h-9 w-9 place-items-center rounded-full ${s.streak > 0 ? "bg-accent-soft text-accent" : "bg-sunken text-muted"}`}><Icon name="flame" className="h-5 w-5" fill={s.streak > 0} /></span>
            <div><div className="text-[15px] font-semibold leading-tight">{s.streak > 0 ? `${s.streak}-day streak` : "No streak yet"}</div>
              <div className="text-xs text-muted">{s.streak > 0 ? "Keep it going today" : "Log a session to start one"}</div></div>
          </div>
        </div>
        <div className="mt-4 flex justify-between">{s.week.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className={`grid h-8 w-8 place-items-center rounded-full text-xs ${d.active ? "bg-accent text-accent-ink" : d.today ? "border-2 border-dashed border-accent/60 text-accent" : "bg-sunken text-transparent"}`}>{d.active ? <Icon name="check" className="h-4 w-4" strokeWidth={3} /> : "·"}</span>
            <span className={`text-[10px] font-semibold ${d.today ? "text-ink" : "text-muted"}`}>{d.label}</span>
          </div>))}</div>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between"><h2 className="display text-xl">Continue reading</h2>{reading.length > 0 && <Link href="/books?status=READING" className="text-sm font-semibold text-accent">See all</Link>}</div>
        {!hero ? (
          <div className="card"><EmptyState icon="books" title="Nothing in progress" body="Pick a book from your shelf, or find something new to start." href="/search" cta="Find a book" secondary={{ href: "/books?status=WANT_TO_READ", label: "Browse want-to-read" }} /></div>
        ) : (
          <Link href={`/books/${hero.id}`} className="card flex gap-4 p-4 transition-transform active:scale-[.99]">
            <Cover url={hero.customCoverUrl ?? hero.book.coverUrl} title={hero.book.title} author={hero.book.authors[0]} className="w-24" color={hero.spineColor} />
            <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
              <div><div className="display line-clamp-2 text-lg">{hero.book.title}</div><div className="mt-0.5 truncate text-sm text-muted">{hero.book.authors.join(", ")}</div></div>
              <div>
                <div className="mb-1.5 flex justify-between text-xs"><span className="font-semibold">{Math.round(pctOf(hero))}%</span><span className="text-muted">p.{hero.currentPage}{hero.book.pageCount ? ` / ${hero.book.pageCount}` : ""}</span></div>
                <ProgressBar pct={pctOf(hero)} />
                <span className="btn btn-primary mt-3 !min-h-9 !py-1.5">Log a session</span>
              </div>
            </div>
          </Link>
        )}
        {others.length > 0 && (
          <ul className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-1">{others.map((r) => (
            <li key={r.id} className="w-36 flex-none"><Link href={`/books/${r.id}`} className="card-flat flex items-center gap-2.5 p-2.5">
              <Cover url={r.customCoverUrl ?? r.book.coverUrl} title={r.book.title} className="w-9" color={r.spineColor} />
              <div className="min-w-0"><div className="line-clamp-2 text-xs font-semibold leading-tight">{r.book.title}</div><div className="mt-1 text-[11px] text-muted">{Math.round(pctOf(r))}%</div></div></Link></li>))}</ul>
        )}
      </section>

      {goals.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between"><h2 className="display text-xl">Goals</h2><Link href="/stats" className="text-sm font-semibold text-accent">Manage</Link></div>
          <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">{goals.map((g) => (
            <div key={g.id} className="card flex w-52 flex-none items-center gap-3 p-3.5">
              <Ring pct={g.current / g.target} label={`${Math.round((g.current / g.target) * 100)}%`} />
              <div className="text-sm"><div className="font-semibold leading-tight">{g.current} / {g.target}</div><div className="text-xs capitalize text-muted">{g.type.toLowerCase()} · {g.period.toLowerCase()}</div></div>
            </div>))}</div>
        </section>
      )}

      {recent.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between"><h2 className="display text-xl">Recently updated</h2><Link href="/books" className="text-sm font-semibold text-accent">All books</Link></div>
          <ul className="no-scrollbar -mx-5 flex gap-3.5 overflow-x-auto px-5 pb-2">{recent.map((r) => (
            <li key={r.id} className="w-24 flex-none"><Link href={`/books/${r.id}`} className="block transition-transform active:scale-95">
              <Cover url={r.customCoverUrl ?? r.book.coverUrl} title={r.book.title} author={r.book.authors[0]} className="w-24" color={r.spineColor} />
              <div className="mt-2 line-clamp-2 text-xs font-semibold leading-tight">{r.book.title}</div></Link></li>))}</ul>
        </section>
      )}
    </div>
  );
}
