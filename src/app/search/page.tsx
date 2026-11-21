import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { SearchClient } from "@/components/search-client";

export default async function Search() {
  await requireUser();
  return (<div className="mx-auto max-w-3xl px-4 py-4"><Link href="/library" className="text-sm underline">← Back</Link>
    <h1 className="my-3 font-serif text-2xl">Add a book</h1><SearchClient /></div>);
}
