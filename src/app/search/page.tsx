import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { SearchClient } from "@/components/search-client";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Add a book" };
export default async function Search() {
  await requireUser();
  return (<div className="page-enter mx-auto max-w-3xl px-5 pb-16 pt-[max(1rem,env(safe-area-inset-top))]">
    <PageHeader title="Add a book" back={{ href: "/home", label: "Back" }} />
    <SearchClient />
    <p className="mt-8 text-center text-sm text-muted">Can’t find it? <Link className="font-semibold text-accent" href="/add">Add it manually</Link></p></div>);
}
