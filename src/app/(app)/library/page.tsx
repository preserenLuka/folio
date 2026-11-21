import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Shelf } from "@/components/shelf";

export default async function Library() {
  const u = await requireUser();
  const libs = await db.library.findMany({ where: { userId: u.id }, orderBy: { position: "asc" } });
  const lib = libs.find((l) => l.isDefault) ?? libs[0];
  const where = lib.kind === "SMART"
    ? { userId: u.id, status: { in: ((lib.smartRule as { status?: never[] } | null)?.status ?? []) } }
    : { userId: u.id, entries: { some: { libraryId: lib.id } } };
  const items = await db.userBook.findMany({ where, include: { book: true }, orderBy: { createdAt: "asc" } });
  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-sm">{libs.map((l) => <span key={l.id} className={`rounded-full px-3 py-1 ${l.id === lib.id ? "bg-accent text-white" : "bg-white/60"}`}>{l.name}</span>)}</div>
      <p className="text-sm text-ink/60">{items.length} books</p>
      <Shelf books={items.map((i) => ({ id: i.id, title: i.book.title, spineColor: i.spineColor, pages: i.book.pageCount }))} />
      <p className="text-xs text-ink/50">Library switcher, themes and drag-to-arrange: see FEATURES.md (WP-LIBRARIES, WP-SHELF).</p>
    </div>
  );
}
