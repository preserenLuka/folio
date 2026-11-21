"use server";
import { revalidatePath } from "next/cache";
import { ReadingStatus } from "@prisma/client";
import { db } from "./db";
import { requireUser } from "./auth";

/** Minimal RFC4180 CSV parser (quotes, escaped quotes, newlines in fields). */
function parseCsv(t: string) {
  const rows: string[][] = []; let row: string[] = [], f = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; row.push(f); f = ""; if (row.some(Boolean)) rows.push(row); row = []; }
    else f += c;
  }
  row.push(f); if (row.some(Boolean)) rows.push(row);
  return rows;
}
const shelfToStatus = (s: string): ReadingStatus => s === "read" ? "READ" : s === "currently-reading" ? "READING" : "WANT_TO_READ";

/** Accepts Goodreads export CSV or a generic CSV with Title/Author/Pages/Rating columns. */
export async function importCsv(_: unknown, fd: FormData) {
  const u = await requireUser();
  const file = fd.get("file") as File | null;
  if (!file || !file.size) return { error: "Choose a CSV file." };
  const rows = parseCsv(await file.text());
  const head = rows.shift()?.map((h) => h.trim().toLowerCase()) ?? [];
  const ix = (...n: string[]) => head.findIndex((h) => n.includes(h));
  const iT = ix("title"), iA = ix("author"), iP = ix("number of pages", "pages"), iR = ix("my rating", "rating"),
    iS = ix("exclusive shelf", "status"), iI = ix("isbn13", "isbn"), iD = ix("date read", "finished");
  if (iT < 0) return { error: "No Title column found." };
  const lib = await db.library.findFirst({ where: { userId: u.id, isDefault: true } });
  let added = 0;
  for (const r of rows) {
    const title = r[iT]?.trim(); if (!title) continue;
    const isbn = (iI >= 0 ? r[iI] : "").replace(/[="]/g, "").trim() || null;
    const ext = `${u.id}-${isbn ?? title}`.slice(0, 200);
    const book = await db.book.upsert({ where: { source_externalId: { source: "import", externalId: ext } }, update: {},
      create: { source: "import", externalId: ext, title, authors: iA >= 0 && r[iA] ? [r[iA].trim()] : [], pageCount: iP >= 0 ? Number(r[iP]) || null : null, isbn13: isbn && isbn.length === 13 ? isbn : null,
        coverUrl: isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false` : null } });
    const rating = iR >= 0 ? Number(r[iR]) || null : null;
    const status = iS >= 0 ? shelfToStatus(r[iS]?.trim().toLowerCase()) : "WANT_TO_READ";
    const fin = iD >= 0 && r[iD] ? new Date(r[iD]) : null;
    const ub = await db.userBook.upsert({ where: { userId_bookId: { userId: u.id, bookId: book.id } }, update: {},
      create: { userId: u.id, bookId: book.id, status, rating, finishedAt: fin && !isNaN(+fin) ? fin : null } });
    if (lib) await db.libraryEntry.upsert({ where: { libraryId_userBookId: { libraryId: lib.id, userBookId: ub.id } }, update: {}, create: { libraryId: lib.id, userBookId: ub.id } });
    added++;
  }
  revalidatePath("/", "layout");
  return { ok: `Imported ${added} books.` };
}
