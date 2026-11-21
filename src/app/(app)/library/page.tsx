import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Shelf } from "@/components/shelf";
import { libraryBooks } from "@/lib/library-books";
import { LibraryMenu, NewLibrary } from "@/components/library-menu";

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
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2 overflow-x-auto text-sm">
          {libs.map((l) => <Link key={l.id} href={`/library?lib=${l.id}`} className={`whitespace-nowrap rounded-full px-3 py-1 ${l.id === lib.id ? "bg-accent text-white" : "bg-white/60"}`}>{l.name}{l.kind === "SMART" ? " ✦" : ""}</Link>)}
          <NewLibrary />
        </div>
        <LibraryMenu lib={{ id: lib.id, name: lib.name, kind: lib.kind, theme: lib.theme, isDefault: lib.isDefault, statuses: ((lib.smartRule as { status?: string[] } | null)?.status ?? []) }} />
      </div>
      <div className="flex items-center justify-between text-sm text-ink/60">
        <span>{items.length} books{lib.kind === "SMART" ? " · fills itself" : ""}</span>
        <span className="flex gap-2">{sorts.map(([s, l]) => <Link key={s} href={q(s)} className={(sort ?? "") === s ? "font-semibold text-accent" : ""}>{l}</Link>)}</span>
      </div>
      <Shelf theme={lib.theme} books={items.map((i) => ({ id: i.id, title: i.book.title, author: i.book.authors[0], spineColor: i.spineColor, pages: i.book.pageCount, coverUrl: i.book.coverUrl, fav: i.isFavorite }))} />
      {items.length === 0 && <p className="text-center text-sm text-ink/60">Empty shelf. <Link className="underline" href="/search">Add a book</Link>.</p>}
    </div>
  );
}
