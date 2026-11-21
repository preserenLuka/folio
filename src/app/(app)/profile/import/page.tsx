"use client";
import { useActionState } from "react";
import Link from "next/link";
import { importCsv } from "@/lib/actions-import";

export default function ImportPage() {
  const [s, run, pending] = useActionState(importCsv, null as { error?: string; ok?: string } | null);
  return (
    <div className="space-y-3"><Link href="/profile" className="text-sm underline">← Profile</Link>
      <h1 className="font-serif text-2xl">Import books</h1>
      <p className="text-sm text-ink/70">Upload a Goodreads export or any CSV with a Title column (Author, Pages, Rating, Exclusive Shelf / Status optional).</p>
      <form action={run} className="space-y-3"><input type="file" name="file" accept=".csv,text/csv" required />
        <button disabled={pending} className="block rounded-lg bg-accent px-4 py-2 text-white">{pending ? "Importing…" : "Import"}</button></form>
      {s?.error && <p className="text-red-700">{s.error}</p>}{s?.ok && <p className="text-green-800">{s.ok}</p>}</div>
  );
}
