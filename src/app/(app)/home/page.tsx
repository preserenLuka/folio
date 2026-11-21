import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export default async function Home() {
  const u = await requireUser();
  const reading = await db.userBook.findMany({ where: { userId: u.id, status: "READING" }, include: { book: true }, take: 5 });
  const total = await db.userBook.count({ where: { userId: u.id } });
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl">Hello, {u.name}</h1>
      <section>
        <h2 className="mb-2 text-sm uppercase tracking-wide text-ink/60">Currently reading</h2>
        {reading.length === 0 ? <p className="text-ink/70">Nothing in progress. <Link className="underline" href="/search">Find a book</Link>.</p> :
          <ul className="space-y-2">{reading.map((r) => (
            <li key={r.id}><Link href={`/books/${r.id}`} className="block rounded-lg bg-white/60 p-3">
              {r.book.title} <span className="text-ink/60">· p.{r.currentPage}/{r.book.pageCount ?? "?"}</span></Link></li>))}</ul>}
      </section>
      <p className="text-sm text-ink/60">{total} books in your collection.</p>
    </div>
  );
}
