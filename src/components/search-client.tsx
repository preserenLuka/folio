"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addBook } from "@/lib/actions-books";
import type { BookHit } from "@/lib/book-search";
import { Cover, EmptyState } from "./ui";
import { Icon } from "./icons";

export function SearchClient() {
  const [q, setQ] = useState(""); const [hits, setHits] = useState<BookHit[]>([]);
  const [msg, setMsg] = useState(""); const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [adding, setAdding] = useState<string | null>(null); const [pending, start] = useTransition(); const router = useRouter();
  async function scan() {
    // BarcodeDetector is available in Chromium/Android/Safari 17+; fall back to typing the ISBN.
    const BD = (window as unknown as { BarcodeDetector?: new (o: object) => { detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
    if (!BD || !navigator.mediaDevices) { setMsg("Barcode scanning isn't supported in this browser. Type the ISBN instead."); return; }
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).catch(() => null);
    if (!stream) { setMsg("Camera access was blocked."); return; }
    const v = document.createElement("video"); v.srcObject = stream; v.playsInline = true; await v.play();
    const det = new BD({ formats: ["ean_13"] }); setMsg("Point the camera at the barcode…");
    const t0 = Date.now();
    while (Date.now() - t0 < 20000) {
      const c = await det.detect(v).catch(() => []);
      if (c[0]) { stream.getTracks().forEach((t) => t.stop()); setQ(c[0].rawValue); search(c[0].rawValue); return; }
      await new Promise((r) => setTimeout(r, 250));
    }
    stream.getTracks().forEach((t) => t.stop()); setMsg("No barcode found.");
  }
  function run(e: React.FormEvent) { e.preventDefault(); if (q.trim()) search(q); }
  async function search(query: string) {
    setMsg(""); setState("loading");
    try {
      const r = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
      const j = await r.json(); setHits(j.results ?? []); setState(j.error ? "error" : "done");
    } catch { setState("error"); }
  }
  return (
    <div className="space-y-4">
      <form onSubmit={run} className="flex gap-2">
        <div className="relative flex-1"><Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, author or ISBN" className="field !rounded-full !pl-11" autoFocus enterKeyHint="search" aria-label="Search books" /></div>
        <button type="button" onClick={scan} className="btn btn-icon flex-none" aria-label="Scan barcode"><Icon name="scan" className="h-5 w-5" /></button>
      </form>
      {msg && <p role="status" className="rounded-xl bg-sunken px-3 py-2 text-sm text-muted">{msg}</p>}

      {state === "loading" && <ul className="space-y-3" aria-busy>{[0, 1, 2, 3].map((i) => <li key={i} className="flex gap-3"><div className="skeleton aspect-[2/3] w-14" /><div className="flex-1 space-y-2 py-1"><div className="skeleton h-4 w-3/4" /><div className="skeleton h-3 w-1/2" /></div></li>)}</ul>}
      {state === "error" && <div className="card-flat"><EmptyState icon="sparkle" title="Search failed" body="The book database didn't respond. Try again in a moment." /></div>}
      {state === "done" && hits.length === 0 && <div className="card-flat"><EmptyState icon="search" title="No results" body="Try fewer words, the author's name, or the ISBN." href="/add" cta="Add manually" /></div>}
      {state === "idle" && <div className="card-flat"><EmptyState icon="scan" title="Find your next book" body="Search by title, author or ISBN, or tap the scanner to read a barcode." /></div>}

      {state === "done" && hits.length > 0 && (
        <ul className="card-flat divide-y divide-line overflow-hidden">
          {hits.map((h) => { const key = h.source + h.externalId; return (
            <li key={key} className="flex items-center gap-3.5 p-3.5">
              <Cover url={h.coverUrl} title={h.title} className="w-14" />
              <div className="min-w-0 flex-1"><div className="line-clamp-2 text-[15px] font-semibold leading-snug">{h.title}</div><div className="mt-0.5 truncate text-sm text-muted">{h.authors.join(", ")}{h.pageCount ? ` · ${h.pageCount} pages` : ""}</div></div>
              <button disabled={pending} onClick={() => { setAdding(key); start(async () => { await addBook(h, "WANT_TO_READ"); router.push("/books"); }); }} className="btn btn-soft !px-3.5">
                {adding === key && pending ? "Adding…" : <><Icon name="plus" className="h-4 w-4" />Add</>}</button>
            </li>); })}
        </ul>)}
    </div>
  );
}
