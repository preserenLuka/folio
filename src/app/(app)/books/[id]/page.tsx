import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { spineColorFor } from "@/lib/status";
import { Book3D } from "@/components/book-3d";
import { BookPanel } from "@/components/book-panel";
import { Icon } from "@/components/icons";

const d = (x: Date | null) => (x ? x.toISOString().slice(0, 10) : "");
export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser();
  const { id } = await params;
  const ub = await db.userBook.findFirst({ where: { id, userId: u.id }, include: { book: true, notes: { orderBy: { createdAt: "desc" } }, sessions: { orderBy: { startedAt: "desc" }, take: 8 }, entries: true } });
  if (!ub) notFound();
  const libs = await db.library.findMany({ where: { userId: u.id }, orderBy: { position: "asc" } });
  const b = ub.book;
  const color = ub.spineColor ?? spineColorFor(b.title);
  const meta = [b.pageCount && `${b.pageCount} pages`, b.publishedYear, b.publisher].filter(Boolean);
  return (
    <article className="space-y-4">
      <div className="-mx-5 -mt-2 rounded-b-[2.5rem] px-5 pb-2 pt-1" style={{ background: `radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, ${color} 38%, transparent), transparent 70%)` }}>
        <Link href="/library" className="btn btn-icon" aria-label="Back to the shelf"><Icon name="back" className="h-5 w-5" /></Link>
        <Book3D title={b.title} author={b.authors.join(", ")} coverUrl={ub.customCoverUrl ?? b.coverUrl} blurb={b.description} pages={b.pageCount ?? 300} color={color} edge={ub.sprayedEdges} />
      </div>
      <div className="text-center"><h1 className="display text-[1.75rem]">{b.title}</h1>
        <p className="mt-1 text-muted">{b.authors.join(", ")}</p>
        {meta.length > 0 && <p className="mt-2 text-xs text-muted">{meta.join("  ·  ")}</p>}</div>
      <BookPanel id={ub.id} status={ub.status} rating={ub.rating} fav={ub.isFavorite} page={ub.currentPage} pages={b.pageCount}
        notes={ub.notes.map((n) => ({ id: n.id, kind: n.kind, body: n.body, page: n.page }))}
        sessions={ub.sessions.map((s) => ({ id: s.id, minutes: s.minutes, pagesRead: s.pagesRead, at: s.startedAt.toISOString().slice(0, 10) }))}
        libs={libs.map((l) => ({ id: l.id, name: l.name, kind: l.kind, has: ub.entries.some((e) => e.libraryId === l.id) }))}
        details={{ owned: ub.owned, format: ub.format ?? "", price: ub.price?.toString() ?? "", paid: ub.pricePaid?.toString() ?? "", currency: ub.priceCurrency ?? "", started: d(ub.startedAt), finished: d(ub.finishedAt), spine: ub.spineColor ?? "", edge: ub.sprayedEdges ?? "", pages: String(b.pageCount ?? "") }} />
      {b.description && <details className="card-flat group p-4 text-sm"><summary className="flex cursor-pointer list-none items-center justify-between font-semibold">About this book<Icon name="next" className="h-4 w-4 transition-transform group-open:rotate-90" /></summary><p className="mt-3 leading-relaxed text-ink/80">{b.description}</p></details>}
    </article>
  );
}
