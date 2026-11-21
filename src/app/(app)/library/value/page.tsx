import { PageHeader } from "@/components/ui";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ValueClient } from "@/components/value-client";

export default async function Value() {
  const u = await requireUser();
  const lib = await db.library.findFirst({ where: { userId: u.id, isDefault: true } });
  const items = await db.userBook.findMany({ where: { userId: u.id, entries: { some: { libraryId: lib?.id } } }, include: { book: true }, orderBy: { createdAt: "asc" } });
  const currency = ((u.settings as { currency?: string })?.currency) ?? "USD";
  return (<div><PageHeader title="Library value" back={{ href: "/library", label: "Shelf" }} />
    <ValueClient currency={currency} libName={lib?.name ?? "Library"} rows={items.map((i) => ({ id: i.id, title: i.book.title, author: i.book.authors.join(", "), coverUrl: i.book.coverUrl, price: i.price ? Number(i.price) : null, paid: i.pricePaid ? Number(i.pricePaid) : null }))} /></div>);
}
