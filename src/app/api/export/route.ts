import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const u = await requireUser();
  const data = await db.userBook.findMany({ where: { userId: u.id }, include: { book: true, notes: true, sessions: true, entries: { include: { library: { select: { name: true } } } } } });
  return new Response(JSON.stringify({ exportedAt: new Date(), books: data }, null, 2), { headers: { "content-type": "application/json", "content-disposition": "attachment; filename=folio-export.json" } });
}
