"use server";
import { revalidatePath } from "next/cache";
import { NoteKind, BookFormat } from "@prisma/client";
import { db } from "./db";
import { requireUser } from "./auth";

async function mine(id: string) {
  const u = await requireUser();
  const ub = await db.userBook.findFirst({ where: { id, userId: u.id }, include: { book: true } });
  if (!ub) throw new Error("not found");
  return { u, ub };
}
const refresh = () => revalidatePath("/", "layout");

export async function rate(id: string, rating: number | null) {
  await mine(id); await db.userBook.update({ where: { id }, data: { rating } }); refresh();
}
export async function toggleFavorite(id: string) {
  const { ub } = await mine(id); await db.userBook.update({ where: { id }, data: { isFavorite: !ub.isFavorite } }); refresh();
}
export async function setProgress(id: string, page: number) {
  const { ub } = await mine(id);
  const max = ub.book.pageCount ?? Infinity;
  const p = Math.max(0, Math.min(Math.floor(page), max));
  const data: Record<string, unknown> = { currentPage: p };
  if (ub.status === "WANT_TO_READ" && p > 0) { data.status = "READING"; data.startedAt = ub.startedAt ?? new Date(); }
  if (ub.book.pageCount && p >= ub.book.pageCount) { data.status = "READ"; data.finishedAt = new Date(); }
  await db.userBook.update({ where: { id }, data }); refresh();
}
export async function logSession(id: string, minutes: number, endPage: number | null) {
  const { ub } = await mine(id);
  const now = new Date();
  const start = ub.currentPage;
  const end = endPage ?? start;
  await db.readingSession.create({ data: {
    userBookId: id, startedAt: new Date(now.getTime() - minutes * 60000), endedAt: now, minutes: Math.max(0, Math.round(minutes)),
    startPage: start, endPage: end, pagesRead: Math.max(0, end - start),
  } });
  if (endPage != null) await setProgress(id, endPage);
  refresh();
}
export async function addNote(id: string, kind: NoteKind, body: string, page: number | null) {
  await mine(id);
  if (!body.trim()) return;
  await db.note.create({ data: { userBookId: id, kind, body: body.trim(), page } }); refresh();
}
export async function deleteNote(noteId: string) {
  const u = await requireUser();
  await db.note.deleteMany({ where: { id: noteId, userBook: { userId: u.id } } }); refresh();
}
export async function updateDetails(id: string, fd: FormData) {
  await mine(id);
  const num = (k: string) => { const v = String(fd.get(k) ?? "").trim(); return v === "" ? null : Number(v); };
  const date = (k: string) => { const v = String(fd.get(k) ?? ""); return v ? new Date(v) : null; };
  const fmt = String(fd.get("format") ?? "");
  const price = num("price"), paid = num("pricePaid");
  await db.userBook.update({ where: { id }, data: {
    owned: fd.get("owned") === "on",
    format: fmt in BookFormat ? (fmt as BookFormat) : null,
    price, pricePaid: paid, priceCurrency: String(fd.get("currency") ?? "") || null,
    startedAt: date("startedAt"), finishedAt: date("finishedAt"),
    spineColor: String(fd.get("spineColor") ?? "") || null,
    sprayedEdges: String(fd.get("sprayedEdges") ?? "") || null,
  } });
  const pages = num("pageCount");
  const ub = await db.userBook.findUniqueOrThrow({ where: { id } });
  if (pages !== null) await db.book.update({ where: { id: ub.bookId }, data: { pageCount: pages } });
  refresh();
}
export async function addManualBook(fd: FormData) {
  const u = await requireUser();
  const title = String(fd.get("title") ?? "").trim();
  if (!title) return null;
  const pc = Number(fd.get("pages") ?? 0) || null;
  const book = await db.book.create({ data: {
    source: "manual", externalId: `${u.id}-${Date.now()}`, title,
    authors: String(fd.get("author") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    pageCount: pc, coverUrl: String(fd.get("coverUrl") ?? "") || null,
  } });
  const ub = await db.userBook.create({ data: { userId: u.id, bookId: book.id, status: "WANT_TO_READ" } });
  const lib = await db.library.findFirst({ where: { userId: u.id, isDefault: true } });
  if (lib) await db.libraryEntry.create({ data: { libraryId: lib.id, userBookId: ub.id } });
  refresh(); return ub.id;
}
export async function setGoal(fd: FormData) {
  const u = await requireUser();
  const type = String(fd.get("type")) as "BOOKS" | "PAGES" | "MINUTES";
  const period = String(fd.get("period") ?? "YEAR") as "YEAR" | "MONTH" | "WEEK";
  const target = Number(fd.get("target"));
  const year = new Date().getFullYear();
  if (!target || target < 1) return;
  await db.goal.upsert({ where: { userId_type_period_year: { userId: u.id, type, period, year } }, update: { target }, create: { userId: u.id, type, period, year, target } });
  refresh();
}
export async function deleteGoal(id: string) {
  const u = await requireUser(); await db.goal.deleteMany({ where: { id, userId: u.id } }); refresh();
}
