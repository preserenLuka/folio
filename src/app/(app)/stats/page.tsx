import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export default async function Stats() {
  const u = await requireUser();
  const read = await db.userBook.findMany({ where: { userId: u.id, status: "READ" }, include: { book: true } });
  const pages = read.reduce((s, r) => s + (r.book.pageCount ?? 0), 0);
  return (
    <div className="space-y-2"><h1 className="font-serif text-2xl">Stats</h1>
      <p>{read.length} books read · {pages.toLocaleString()} pages</p>
      <p className="text-sm text-ink/60">Charts, streaks and goals: WP-STATS, WP-GOALS.</p></div>
  );
}
