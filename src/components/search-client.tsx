"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addBook } from "@/lib/actions-books";
import type { BookHit } from "@/lib/book-search";

export function SearchClient() {
  const [q, setQ] = useState(""); const [hits, setHits] = useState<BookHit[]>([]);
  const [msg, setMsg] = useState(""); const [pending, start] = useTransition(); const router = useRouter();
  async function run(e: React.FormEvent) {
    e.preventDefault(); setMsg("Searching…");
    const r = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`);
    const j = await r.json(); setHits(j.results ?? []); setMsg(j.results?.length ? "" : j.error ? "Search failed, try again." : "No results.");
  }
  return (
    <div className="space-y-3">
      <form onSubmit={run} className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, author or ISBN" className="flex-1 rounded-lg border border-wood/30 bg-white/70 px-3 py-2" autoFocus />
        <button className="rounded-lg bg-accent px-4 text-white">Search</button>
      </form>
      {msg && <p className="text-sm text-ink/60">{msg}</p>}
      <ul className="divide-y divide-wood/10">
        {hits.map((h) => (
          <li key={h.source + h.externalId} className="flex items-center gap-3 py-3">
            {h.coverUrl && /* eslint-disable-next-line @next/next/no-img-element */ <img src={h.coverUrl} alt="" className="h-20 w-14 rounded object-cover" />}
            <div className="min-w-0 flex-1"><div className="truncate font-medium">{h.title}</div><div className="truncate text-sm text-ink/60">{h.authors.join(", ")} {h.pageCount ? `· ${h.pageCount}p` : ""}</div></div>
            <button disabled={pending} onClick={() => start(async () => { await addBook(h, "WANT_TO_READ"); router.push("/books"); })} className="rounded-full bg-accent px-3 py-1 text-sm text-white">Add to TBR</button>
          </li>))}
      </ul>
    </div>
  );
}
