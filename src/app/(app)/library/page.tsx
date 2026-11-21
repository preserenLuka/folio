import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Shelf } from "@/components/shelf";
import { libraryBooks } from "@/lib/library-books";
import { LibraryMenu, NewLibrary } from "@/components/library-menu";
import { EmptyState } from "@/components/ui";
import { Icon } from "@/components/icons";

export const metadata = { title: "Shelf" };

export default async function Library({ searchParams }: { searchParams: Promise<{ lib?: string; sort?: string }> }) {
  const u = await requireUser();
  const { lib: libId, sort } = await searchParams;
  const libs = await db.library.findMany({ where: { userId: u.id }, orderBy: { position: "asc" } });
  const lib = libs.find((l) => l.id === libId) ?? libs.find((l) => l.isDefault) ?? libs[0];
  let items = await libraryBooks(u.id, lib);
  if (sort === "title") items.sort((a, b) => a.book.title.localeCompare(b.book.title));
  if (sort === "author") items.sort((a, b) => (a.book.authors[0] ?? "").localeCompare(b.book.authors[0] ?? ""));
  if (sort === "color") items.sort((a, b) => (a.spineColor ?? "").localeCompare(b.spineColor ?? ""));
  if (sort === "recent") items = [...items].reverse();
  const sorts = [["", "Added"], ["recent", "Newest"], ["title", "Title"], ["author", "Author"], ["color", "Colour"]];
  const q = (s: string) => `/library?lib=${lib.id}${s ? `&sort=${s}` : ""}`;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="display text-[1.9rem]">Your shelf</h1>
        <LibraryMenu lib={{ id: lib.id, name: lib.name, kind: lib.kind, theme: lib.theme, isDefault: lib.isDefault, statuses: ((lib.smartRule as { status?: string[] } | null)?.status ?? []) }} /></div>
      <div className="no-scrollbar -mx-5 flex items-center gap-2 overflow-x-auto px-5">
        {libs.map((l) => <Link key={l.id} href={`/library?lib=${l.id}`} className={`chip ${l.id === lib.id ? "chip-on" : ""}`}>{l.name}{l.kind === "SMART" && <Icon name="sparkle" className="h-3.5 w-3.5" />}</Link>)}
        <NewLibrary />
      </div>
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{items.length} {items.length === 1 ? "book" : "books"}{lib.kind === "SMART" ? " · fills itself" : ""}</span>
        <span className="flex gap-3">{sorts.map(([s, l]) => <Link key={s} href={q(s)} className={(sort ?? "") === s ? "font-bold text-ink" : "hover:text-ink"}>{l}</Link>)}</span>
      </div>
      <Shelf theme={lib.theme} books={items.map((i) => ({ id: i.id, title: i.book.title, author: i.book.authors[0], spineColor: i.spineColor, pages: i.book.pageCount, coverUrl: i.book.coverUrl, fav: i.isFavorite }))} />
      {items.length === 0 && <EmptyState icon="shelf" title="This shelf is empty" body={lib.kind === "SMART" ? "Books that match this shelf's rule will appear here automatically." : "Add books to see them stand up on the shelf."} href="/search" cta="Add a book" />}
    </div>
  );
}
