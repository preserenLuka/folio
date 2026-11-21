import { db } from "./db";
export async function libraryBooks(userId: string, lib: { id: string; kind: string; smartRule: unknown }) {
  const where = lib.kind === "SMART"
    ? { userId, status: { in: ((lib.smartRule as { status?: never[] } | null)?.status ?? []) } }
    : { userId, entries: { some: { libraryId: lib.id } } };
  return db.userBook.findMany({ where, include: { book: true }, orderBy: { createdAt: "asc" } });
}
