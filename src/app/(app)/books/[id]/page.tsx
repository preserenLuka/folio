import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { STATUS_LABEL } from "@/lib/status";
import { setStatus, removeBook } from "@/lib/actions-books";
import { redirect } from "next/navigation";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser();
  const { id } = await params;
  const ub = await db.userBook.findFirst({ where: { id, userId: u.id }, include: { book: true } });
  if (!ub) notFound();
  const b = ub.book;
  return (
    <article className="space-y-4">
      <div className="flex gap-4">
        {b.coverUrl && /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.coverUrl} alt="" className="h-48 w-32 rounded object-cover shadow-lg" />}
        <div><h1 className="font-serif text-2xl">{b.title}</h1><p className="text-ink/70">{b.authors.join(", ")}</p>
          <p className="text-sm text-ink/50">{b.pageCount ? `${b.pageCount} pages` : ""} {b.publishedYear ? `· ${b.publishedYear}` : ""}</p></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]).map((s) => (
          <form key={s} action={async () => { "use server"; await setStatus(ub.id, s); }}>
            <button className={`rounded-full px-3 py-1 text-sm ${ub.status === s ? "bg-accent text-white" : "bg-white/60"}`}>{STATUS_LABEL[s]}</button></form>))}
      </div>
      {b.description && <p className="text-sm leading-relaxed">{b.description}</p>}
      <form action={async () => { "use server"; await removeBook(ub.id); redirect("/books"); }}>
        <button className="text-sm text-red-700 underline">Remove from collection</button></form>
    </article>
  );
}
