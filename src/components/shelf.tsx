import Link from "next/link";
import { spineColorFor } from "@/lib/status";
import { themeOf } from "@/lib/themes";

export type Spine = { id: string; title: string; author?: string; spineColor: string | null; pages: number | null; coverUrl: string | null; edge?: string | null; fav?: boolean };

/** Width from page count, height from a stable hash so the shelf looks organic. */
function dims(b: Spine) {
  let h = 0; for (const c of b.title) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  return { w: Math.round(Math.min(46, Math.max(18, (b.pages ?? 280) / 12))), h: 112 + (h % 34) };
}

export function Shelf({ books, theme = "classic", perRow = 9 }: { books: Spine[]; theme?: string; perRow?: number }) {
  const t = themeOf(theme);
  const rows: Spine[][] = [];
  for (let i = 0; i < books.length; i += perRow) rows.push(books.slice(i, i + perRow));
  while (rows.length < 3) rows.push([]);
  return (
    <div className="rounded-[1.75rem] p-3 pt-5 shadow-[inset_0_2px_12px_rgba(0,0,0,.35),0_10px_30px_-14px_rgba(0,0,0,.5)] ring-1 ring-black/10" style={{ background: `radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, ${t.bg} 82%, white), ${t.bg} 70%)`, color: t.text }}>
      {rows.map((row, i) => (
        <div key={i} className="relative mb-2">
          <div className="flex h-40 items-end gap-[2px] px-2">
            {row.map((b) => {
              const { w, h } = dims(b);
              const base = b.spineColor ?? spineColorFor(b.title);
              return (
                <Link key={b.id} href={`/books/${b.id}`} title={`${b.title}${b.author ? " — " + b.author : ""}`}
                  className="group relative flex-none overflow-hidden rounded-[2px] shadow-[2px_0_4px_rgba(0,0,0,.45)] transition-transform duration-200 hover:-translate-y-2 focus-visible:-translate-y-2 active:-translate-y-3"
                  style={{ width: w, height: h, background: base }}>
                  {b.coverUrl && /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.coverUrl} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay" />}
                  <span className="relative block h-full w-full overflow-hidden px-[3px] py-1.5 text-[10px] font-medium leading-none text-white/95 [writing-mode:vertical-rl] [text-orientation:mixed]">
                    {b.title}
                  </span>
                  {b.fav && <span className="absolute inset-x-0 bottom-1 mx-auto h-1.5 w-1.5 rounded-full bg-white/90" />}
                  <span className="absolute inset-x-0 top-0 h-1" style={{ background: "rgba(255,255,255,.18)" }} />
                </Link>
              );
            })}
            {i === 0 && row.length < perRow && <span className="mb-1 ml-2 text-2xl opacity-80 drop-shadow">{t.prop}</span>}
          </div>
          <div className="h-3 rounded-sm" style={{ background: `linear-gradient(${t.boardTop},${t.board})`, boxShadow: "0 4px 6px rgba(0,0,0,.4)" }} />
        </div>
      ))}
    </div>
  );
}
