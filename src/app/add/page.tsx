import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { addManualBook } from "@/lib/actions-tracking";

export default async function Add() {
  await requireUser();
  const input = "w-full rounded-lg border border-wood/30 bg-white/70 px-3 py-2";
  return (
    <div className="mx-auto max-w-md px-4 py-4"><Link href="/search" className="text-sm underline">← Search instead</Link>
      <h1 className="my-3 font-serif text-2xl">Add manually</h1>
      <form className="space-y-3" action={async (fd) => { "use server"; const id = await addManualBook(fd); if (id) redirect(`/books/${id}`); }}>
        <input name="title" placeholder="Title" required className={input} /><input name="author" placeholder="Author(s), comma separated" className={input} />
        <input name="pages" type="number" placeholder="Pages" className={input} /><input name="coverUrl" type="url" placeholder="Cover image URL (optional)" className={input} />
        <button className="w-full rounded-lg bg-accent py-2 text-white">Add to library</button></form></div>
  );
}
