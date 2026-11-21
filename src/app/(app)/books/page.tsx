import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { STATUS_LABEL } from "@/lib/status";
import { Cover, EmptyState, ProgressBar, StatusBadge, Stars } from "@/components/ui";
import { Icon } from "@/components/icons";

export const metadata = { title: "Books" };
type S = keyof typeof STATUS_LABEL;

export default async function Books({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; sort?: string }> }) {
  const u = await requireUser();
  const { status, q, sort } = await searchParams;
  const valid = status && status in STATUS_LABEL ? (status as S) : undefined;
  const [items, counts] = await Promise.all([
    db.userBook.findMany({ where: { userId: u.id, ...(valid ? { status: valid } : {}), ...(q ? { book: { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { authors: { has: q } }] } } : {}) }, include: { book: true }, orderBy: sort === "rating" ? { rating: { sort: "desc", nulls: "last" } } : sort === "title" ? { book: { title: "asc" } } : { updatedAt: "desc" } }),
    db.userBook.groupBy({ by: ["status"], where: { userId: u.id }, _count: true }),
  ]);
  const count = (s?: S) => (s ? counts.find((c) => c.status === s)?._count ?? 0 : counts.reduce((a, c) => a + c._count, 0));
  const href = (o: { status?: string; sort?: string }) => { const p = new URLSearchParams(); const st = "status" in o ? o.status : valid; const so = "sort" in o ? o.sort : sort; if (st) p.set("status", st); if (so) p.set("sort", so); if (q) p.set("q", q); const t = p.toString(); return `/books${t ? `?${t}` : ""}`; };
  const sorts = [["", "Recent"], ["title", "Title"], ["rating", "Rating"]];
  const empty = count() === 0;

  return (
    <div className="space-y-4">
      <h1 className="display text-[1.9rem]">Your books</h1>
      <form className="relative">
        <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input name="q" defaultValue={q} placeholder="Search title or author" className="field !rounded-full !pl-11" enterKeyHint="search" />
        {valid && <input type="hidden" name="status" value={valid} />}{sort && <input type="hidden" name="sort" value={sort} />}
      </form>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        <Link href={href({ status: undefined })} className={`chip ${!valid ? "chip-on" : ""}`}>All <span className="opacity-60">{count()}</span></Link>
        {(Object.keys(STATUS_LABEL) as S[]).map((s) => (
          <Link key={s} href={href({ status: s })} className={`chip ${valid === s ? "chip-on" : ""}`}>{STATUS_LABEL[s]} <span className="opacity-60">{count(s)}</span></Link>))}
      </div>
      {!empty && <div className="flex items-center justify-between text-xs text-muted"><span>{items.length} {items.length === 1 ? "book" : "books"}</span>
        <span className="flex items-center gap-3">{sorts.map(([s, l]) => <Link key={s} href={href({ sort: s || undefined })} className={(sort ?? "") === s ? "font-bold text-ink" : "hover:text-ink"}>{l}</Link>)}</span></div>}

      {items.length > 0 ? (
        <ul className="card-flat divide-y divide-line overflow-hidden">
          {items.map((i) => (
            <li key={i.id}><Link href={`/books/${i.id}`} className="row-link flex gap-3.5 p-3.5">
              <Cover url={i.customCoverUrl ?? i.book.coverUrl} title={i.book.title} className="w-14" color={i.spineColor} />
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                <div className="line-clamp-2 text-[15px] font-semibold leading-snug">{i.book.title}</div>
                <div className="truncate text-sm text-muted">{i.book.authors.join(", ") || "Unknown author"}</div>
                <div className="mt-0.5 flex items-center gap-2"><StatusBadge status={i.status} label={STATUS_LABEL[i.status]} />{i.rating != null && <Stars value={i.rating} />}{i.isFavorite && <Icon name="heart" fill className="h-3.5 w-3.5 text-accent" />}</div>
                {i.status === "READING" && i.book.pageCount ? <ProgressBar pct={(i.currentPage / i.book.pageCount) * 100} className="mt-1" /> : null}
              </div>
              <Icon name="next" className="h-4 w-4 flex-none self-center text-line-strong" />
            </Link></li>))}
        </ul>
      ) : (
        <div className="card-flat">{empty
          ? <EmptyState icon="books" title="Your collection is empty" body="Search by title, author or ISBN, scan a barcode, or import your Goodreads export." href="/search" cta="Add your first book" secondary={{ href: "/profile/import", label: "Import from CSV" }} />
          : <EmptyState icon="search" title="No matches" body={q ? `Nothing found for “${q}”.` : "No books with this status yet."} href="/books" cta="Clear filters" />}</div>
      )}
    </div>
  );
}
