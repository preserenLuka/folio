import { db } from "./db";
import { periodStart } from "./dates";

export async function goalProgress(userId: string) {
  const goals = await db.goal.findMany({ where: { userId, year: new Date().getFullYear() } });
  return Promise.all(goals.map(async (g) => {
    const since = periodStart(g.period);
    let current = 0;
    if (g.type === "BOOKS") current = await db.userBook.count({ where: { userId, status: "READ", finishedAt: { gte: since } } });
    else {
      const agg = await db.readingSession.aggregate({ where: { userBook: { userId }, startedAt: { gte: since } }, _sum: { minutes: true, pagesRead: true } });
      current = (g.type === "PAGES" ? agg._sum.pagesRead : agg._sum.minutes) ?? 0;
    }
    return { ...g, current };
  }));
}

export async function computeStats(userId: string, year = new Date().getFullYear()) {
  const [read, sessions, all] = await Promise.all([
    db.userBook.findMany({ where: { userId, status: "READ" }, include: { book: true } }),
    db.readingSession.findMany({ where: { userBook: { userId } }, select: { startedAt: true, minutes: true, pagesRead: true } }),
    db.userBook.count({ where: { userId } }),
  ]);
  const thisYear = read.filter((r) => (r.finishedAt ?? r.updatedAt).getFullYear() === year);
  const perMonth = Array.from({ length: 12 }, () => ({ books: 0, pages: 0 }));
  for (const r of thisYear) { const m = (r.finishedAt ?? r.updatedAt).getMonth(); perMonth[m].books++; perMonth[m].pages += r.book.pageCount ?? 0; }
  const rated = read.filter((r) => r.rating != null);
  const count = (xs: string[]) => Object.entries(xs.reduce<Record<string, number>>((a, x) => ((a[x] = (a[x] ?? 0) + 1), a), {})).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const days = new Set(sessions.map((s) => s.startedAt.toISOString().slice(0, 10)));
  let streak = 0; const d = new Date();
  if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (days.has(d.toISOString().slice(0, 10))) { streak++; d.setDate(d.getDate() - 1); }
  const mins = new Map<string, number>();
  for (const x of sessions) { const k = x.startedAt.toISOString().slice(0, 10); mins.set(k, (mins.get(k) ?? 0) + x.minutes); }
  const dayKey = (n: number) => { const t = new Date(); t.setUTCDate(t.getUTCDate() - n); return t.toISOString().slice(0, 10); };
  const week = Array.from({ length: 7 }, (_, i) => { const k = dayKey(6 - i); return { label: "SMTWTFS"[new Date(k + "T00:00:00Z").getUTCDay()], active: days.has(k), today: i === 6 }; });
  // 12 weeks of activity, Sunday-aligned columns (null = padding before the first day).
  const first = new Date(dayKey(12 * 7 - 1) + "T00:00:00Z").getUTCDay();
  const activity: ({ date: string; minutes: number } | null)[] = [...Array<null>(first).fill(null), ...Array.from({ length: 12 * 7 }, (_, i) => { const k = dayKey(12 * 7 - 1 - i); return { date: k, minutes: mins.get(k) ?? 0 }; })];
  return {
    week, activity, total: all, readTotal: read.length, readThisYear: thisYear.length,
    pagesThisYear: thisYear.reduce((s, r) => s + (r.book.pageCount ?? 0), 0),
    minutes: sessions.reduce((s, x) => s + x.minutes, 0), streak, perMonth,
    avgRating: rated.length ? rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length : null,
    topAuthors: count(thisYear.flatMap((r) => r.book.authors)),
    topGenres: count(thisYear.flatMap((r) => r.book.categories.slice(0, 2))),
    longest: [...thisYear].sort((a, b) => (b.book.pageCount ?? 0) - (a.book.pageCount ?? 0))[0]?.book.title ?? null,
  };
}
