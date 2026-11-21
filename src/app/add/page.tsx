import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { addManualBook } from "@/lib/actions-tracking";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Add manually" };
export default async function Add() {
  await requireUser();
  return (
    <div className="page-enter mx-auto max-w-md px-5 pb-16 pt-[max(1rem,env(safe-area-inset-top))]">
      <PageHeader title="Add manually" back={{ href: "/search", label: "Search instead" }} />
      <form className="card-flat space-y-4 p-5" action={async (fd) => { "use server"; const id = await addManualBook(fd); if (id) redirect(`/books/${id}`); }}>
        <div><label className="label" htmlFor="t">Title</label><input id="t" name="title" required className="field" /></div>
        <div><label className="label" htmlFor="a">Author(s)</label><input id="a" name="author" placeholder="Comma separated" className="field" /></div>
        <div><label className="label" htmlFor="p">Pages</label><input id="p" name="pages" type="number" inputMode="numeric" className="field" /></div>
        <div><label className="label" htmlFor="c">Cover image URL <span className="font-normal">(optional)</span></label><input id="c" name="coverUrl" type="url" className="field" /></div>
        <button className="btn btn-primary w-full !min-h-12">Add to library</button>
      </form>
    </div>
  );
}
