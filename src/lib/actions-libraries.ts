"use server";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { requireUser } from "./auth";
import { THEMES } from "./themes";

const refresh = () => revalidatePath("/library", "layout");

export async function createLibrary(fd: FormData) {
  const u = await requireUser();
  const name = String(fd.get("name") ?? "").trim() || "New library";
  const smart = fd.get("smart") === "on";
  const statuses = fd.getAll("status").map(String);
  const pos = await db.library.count({ where: { userId: u.id } });
  const lib = await db.library.create({ data: {
    userId: u.id, name, position: pos,
    kind: smart ? "SMART" : "MANUAL",
    smartRule: smart ? { status: statuses.length ? statuses : ["WANT_TO_READ"] } : undefined,
  } });
  refresh(); return lib.id;
}
async function own(id: string) {
  const u = await requireUser();
  const l = await db.library.findFirst({ where: { id, userId: u.id } });
  if (!l) throw new Error("not found");
  return { u, l };
}
export async function renameLibrary(id: string, name: string) {
  await own(id); await db.library.update({ where: { id }, data: { name: name.trim() || "Untitled" } }); refresh();
}
export async function setLibraryTheme(id: string, theme: string) {
  await own(id); if (theme in THEMES) await db.library.update({ where: { id }, data: { theme } }); refresh();
}
export async function setDefaultLibrary(id: string) {
  const { u } = await own(id);
  await db.$transaction([
    db.library.updateMany({ where: { userId: u.id }, data: { isDefault: false } }),
    db.library.update({ where: { id }, data: { isDefault: true } }),
  ]); refresh();
}
export async function deleteLibrary(id: string) {
  const { u, l } = await own(id);
  if ((await db.library.count({ where: { userId: u.id } })) <= 1) return;
  await db.library.delete({ where: { id } });
  if (l.isDefault) {
    const first = await db.library.findFirst({ where: { userId: u.id }, orderBy: { position: "asc" } });
    if (first) await db.library.update({ where: { id: first.id }, data: { isDefault: true } });
  }
  refresh();
}
export async function moveLibrary(id: string, dir: -1 | 1) {
  const { u } = await own(id);
  const all = await db.library.findMany({ where: { userId: u.id }, orderBy: { position: "asc" } });
  const i = all.findIndex((l) => l.id === id), j = i + dir;
  if (j < 0 || j >= all.length) return;
  [all[i], all[j]] = [all[j], all[i]];
  await db.$transaction(all.map((l, p) => db.library.update({ where: { id: l.id }, data: { position: p } })));
  refresh();
}
export async function setSmartRule(id: string, statuses: string[]) {
  await own(id); await db.library.update({ where: { id }, data: { kind: "SMART", smartRule: { status: statuses } } }); refresh();
}
export async function toggleInLibrary(libraryId: string, userBookId: string) {
  const { u } = await own(libraryId);
  const ub = await db.userBook.findFirst({ where: { id: userBookId, userId: u.id } });
  if (!ub) return;
  const ex = await db.libraryEntry.findUnique({ where: { libraryId_userBookId: { libraryId, userBookId } } });
  if (ex) await db.libraryEntry.delete({ where: { id: ex.id } });
  else await db.libraryEntry.create({ data: { libraryId, userBookId } });
  revalidatePath("/", "layout");
}
