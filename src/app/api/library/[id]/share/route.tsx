import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { themeOf } from "@/lib/themes";
import { spineColorFor } from "@/lib/status";

/** Shareable SVG poster of the shelf (open in tab → save/share). */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser();
  const { id } = await params;
  const lib = await db.library.findFirst({ where: { id, userId: u.id } });
  if (!lib) return new Response("Not found", { status: 404 });
  const where = lib.kind === "SMART"
    ? { userId: u.id, status: { in: ((lib.smartRule as { status?: never[] } | null)?.status ?? []) } }
    : { userId: u.id, entries: { some: { libraryId: lib.id } } };
  const items = await db.userBook.findMany({ where, include: { book: true } });
  const t = themeOf(lib.theme); const per = 14, W = 1080;
  const rows = Math.max(3, Math.ceil(items.length / per)); const H = 220 + rows * 190;
  const esc = (s: string) => s.replace(/[<>&"]/g, "");
  let body = "";
  items.forEach((b, i) => {
    const r = Math.floor(i / per), c = i % per; const w = Math.min(54, Math.max(26, (b.book.pageCount ?? 280) / 9));
    const h = 130 + ((b.book.title.length * 11) % 40); const x = 40 + c * 70, y = 220 + r * 190 + 150 - h;
    body += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${b.spineColor ?? spineColorFor(b.book.title).replace(/hsl\((\d+) 35% 32%\)/, "hsl($1,35%,32%)")}"/>`;
  });
  for (let r = 0; r < rows; r++) body += `<rect x="20" y="${220 + r * 190 + 150}" width="${W - 40}" height="14" fill="${t.board}"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="${t.bg}"/><text x="40" y="100" fill="${t.text}" font-family="Georgia,serif" font-size="56">${esc(lib.name)}</text><text x="40" y="150" fill="${t.text}" opacity=".7" font-family="Georgia,serif" font-size="28">${items.length} books</text>${body}</svg>`;
  return new Response(svg, { headers: { "content-type": "image/svg+xml" } });
}
