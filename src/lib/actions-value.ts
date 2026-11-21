"use server";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { requireUser } from "./auth";

export async function setPrice(id: string, price: number | null, currency: string) {
  const u = await requireUser();
  await db.userBook.updateMany({ where: { id, userId: u.id }, data: { price, priceCurrency: currency } });
  revalidatePath("/library/value");
}
export async function setCurrency(currency: string) {
  const u = await requireUser();
  const cur = await db.user.findUniqueOrThrow({ where: { id: u.id } });
  await db.user.update({ where: { id: u.id }, data: { settings: { ...(cur.settings as object), currency: currency.toUpperCase().slice(0, 3) } } });
  revalidatePath("/", "layout");
}
