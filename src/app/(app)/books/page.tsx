import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { STATUS_LABEL } from "@/lib/status";

export default async function Books({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const u = await requireUser();
  const { status } = await searchParams;
  const valid = status && status in STATUS_LABEL ? (status as keyof typeof STATUS_LABEL) : undefined;
  const items = await db.userBook.findMany({ where: { userId: u.id, ...(valid ? { status: valid } : {}) }, include: { book: true }, orderBy: { updatedAt: "desc" } });
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2 text-sm">
        <Link href="/books" className={`rounded-full px-3 py-1 ${!valid ? "bg-accent text-white" : "bg-white/60"}`}>All</Link>
        {(Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]).map((s) => (
          <Link key={s} href={`/books?status=${s}`} className={`rounded-full px-3 py-1 ${valid === s ? "bg-accent text-white" : "bg-white/60"}`}>{STATUS_LABEL[s]}</Link>))}
      </div>
      <ul className="divide-y divide-wood/10">
        {items.map((i) => (
          <li key={i.id}><Link href={`/books/${i.id}`} className="flex gap-3 py-3">
            {i.book.coverUrl && /* eslint-disable-next-line @next/next/no-img-element */ <img src={i.book.coverUrl} alt="" className="h-20 w-14 rounded object-cover" />}
            <div><div className="font-medium">{i.book.title}</div><div className="text-sm text-ink/60">{i.book.authors.join(", ")}</div>
              <div className="text-xs text-ink/50">{STATUS_LABEL[i.status]}</div></div></Link></li>))}
      </ul>
      {items.length === 0 && <p className="py-8 text-center text-ink/60">No books here yet.</p>}
    </div>
  );
}
