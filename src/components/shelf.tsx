import Link from "next/link";
import { spineColorFor } from "@/lib/status";

type Spine = { id: string; title: string; spineColor: string | null; pages: number | null };

/** Minimal wooden shelf of book spines. Work package WP-SHELF replaces this with the rich renderer. */
export function Shelf({ books, perRow = 10 }: { books: Spine[]; perRow?: number }) {
  const rows: Spine[][] = [];
  for (let i = 0; i < books.length; i += perRow) rows.push(books.slice(i, i + perRow));
  if (!rows.length) rows.push([]);
  return (
    <div className="rounded-xl bg-wood/90 p-3">
      {rows.map((row, i) => (
        <div key={i} className="mb-1 flex h-28 items-end gap-0.5 border-b-8 border-wood px-1">
          {row.map((b) => (
            <Link key={b.id} href={`/books/${b.id}`} title={b.title}
              style={{ background: b.spineColor ?? spineColorFor(b.title), height: `${70 + ((b.title.length * 7) % 30)}%`, width: `${Math.min(34, Math.max(16, (b.pages ?? 250) / 14))}px` }}
              className="flex-none rounded-sm shadow-md">
              <span className="block origin-center truncate text-[9px] text-white/90 [writing-mode:vertical-rl]">{b.title}</span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
