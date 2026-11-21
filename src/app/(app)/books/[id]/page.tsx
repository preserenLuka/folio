import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { spineColorFor } from "@/lib/status";
import { Book3D } from "@/components/book-3d";
import { BookPanel } from "@/components/book-panel";

const d = (x: Date | null) => (x ? x.toISOString().slice(0, 10) : "");
export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser();
  const { id } = await params;
  const ub = await db.userBook.findFirst({ where: { id, userId: u.id }, include: { book: true, notes: { orderBy: { createdAt: "desc" } }, sessions: { orderBy: { startedAt: "desc" }, take: 8 }, entries: true } });
  if (!ub) notFound();
  const libs = await db.library.findMany({ where: { userId: u.id }, orderBy: { position: "asc" } });
  const b = ub.book;
  return (
    <article className="space-y-2">
      <Link href="/library" className="text-sm underline">← Put back on the shelf</Link>
      <Book3D title={b.title} author={b.authors.join(", ")} coverUrl={ub.customCoverUrl ?? b.coverUrl} blurb={b.description} pages={b.pageCount ?? 300} color={ub.spineColor ?? spineColorFor(b.title)} edge={ub.sprayedEdges} />
      <div className="text-center"><h1 className="font-serif text-2xl">{b.title}</h1>
        <p className="text-ink/70">{b.authors.join(", ")}</p>
        <p className="text-sm text-ink/50">{[b.pageCount && `${b.pageCount} pages`, b.publishedYear, b.publisher].filter(Boolean).join(" · ")}</p></div>
      <BookPanel id={ub.id} status={ub.status} rating={ub.rating} fav={ub.isFavorite} page={ub.currentPage} pages={b.pageCount}
        notes={ub.notes.map((n) => ({ id: n.id, kind: n.kind, body: n.body, page: n.page }))}
        sessions={ub.sessions.map((s) => ({ id: s.id, minutes: s.minutes, pagesRead: s.pagesRead, at: s.startedAt.toISOString().slice(0, 10) }))}
        libs={libs.map((l) => ({ id: l.id, name: l.name, kind: l.kind, has: ub.entries.some((e) => e.libraryId === l.id) }))}
        details={{ owned: ub.owned, format: ub.format ?? "", price: ub.price?.toString() ?? "", paid: ub.pricePaid?.toString() ?? "", currency: ub.priceCurrency ?? "", started: d(ub.startedAt), finished: d(ub.finishedAt), spine: ub.spineColor ?? "", edge: ub.sprayedEdges ?? "", pages: String(b.pageCount ?? "") }} />
      {b.description && <details className="rounded-lg bg-white/50 p-3 text-sm"><summary className="cursor-pointer">Blurb</summary><p className="mt-2 leading-relaxed">{b.description}</p></details>}
    </article>
  );
}
