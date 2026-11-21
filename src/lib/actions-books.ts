"use server";
import { revalidatePath } from "next/cache";
import { ReadingStatus } from "@prisma/client";
import { db } from "./db";
import { requireUser } from "./auth";
import type { BookHit } from "./book-search";

export async function addBook(hit: BookHit, status: ReadingStatus = "WANT_TO_READ") {
  const user = await requireUser();
  const book = await db.book.upsert({
    where: { source_externalId: { source: hit.source, externalId: hit.externalId } },
    update: {},
    create: {
      source: hit.source, externalId: hit.externalId, title: hit.title, authors: hit.authors,
      coverUrl: hit.coverUrl, pageCount: hit.pageCount, publishedYear: hit.publishedYear,
      isbn13: hit.isbn13, description: hit.description, publisher: hit.publisher,
      language: hit.language, categories: hit.categories ?? [],
    },
  });
  const ub = await db.userBook.upsert({
    where: { userId_bookId: { userId: user.id, bookId: book.id } },
    update: {},
    create: { userId: user.id, bookId: book.id, status },
  });
  // Put on the user's default manual library.
  const lib = await db.library.findFirst({ where: { userId: user.id, isDefault: true } });
  if (lib) {
    await db.libraryEntry.upsert({
      where: { libraryId_userBookId: { libraryId: lib.id, userBookId: ub.id } },
      update: {}, create: { libraryId: lib.id, userBookId: ub.id },
    });
  }
  revalidatePath("/", "layout");
  return { id: ub.id };
}

export async function setStatus(userBookId: string, status: ReadingStatus) {
  const user = await requireUser();
  await db.userBook.updateMany({
    where: { id: userBookId, userId: user.id },
    data: {
      status,
      ...(status === "READING" ? { startedAt: new Date() } : {}),
      ...(status === "READ" ? { finishedAt: new Date() } : {}),
    },
  });
  revalidatePath("/", "layout");
}

export async function removeBook(userBookId: string) {
  const user = await requireUser();
  await db.userBook.deleteMany({ where: { id: userBookId, userId: user.id } });
  revalidatePath("/", "layout");
}
