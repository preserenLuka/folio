"use client";
import { useActionState, useState } from "react";
import { PageHeader } from "@/components/ui";
import { Icon } from "@/components/icons";
import { importCsv } from "@/lib/actions-import";

export default function ImportPage() {
  const [file, setFile] = useState("");
  const [s, run, pending] = useActionState(importCsv, null as { error?: string; ok?: string } | null);
  return (
    <div className="space-y-5">
      <PageHeader title="Import books" back={{ href: "/profile", label: "Profile" }} />
      <p className="text-sm leading-relaxed text-muted">Upload a Goodreads export or any CSV with a Title column. Author, Pages, Rating and Exclusive Shelf / Status are optional.</p>
      <form action={run} className="space-y-4">
        <label className="card-flat flex cursor-pointer flex-col items-center gap-2 border-dashed !border-line-strong px-4 py-10 text-center transition-colors hover:bg-sunken">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent"><Icon name="up" className="h-6 w-6" /></span>
          <span className="font-semibold">{file || "Choose a CSV file"}</span><span className="text-xs text-muted">.csv up to a few thousand rows</span>
          <input type="file" name="file" accept=".csv,text/csv" required className="sr-only" onChange={(e) => setFile(e.target.files?.[0]?.name ?? "")} />
        </label>
        <button disabled={pending} className="btn btn-primary w-full !min-h-12">{pending ? "Importing…" : "Import"}</button>
      </form>
      {s?.error && <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{s.error}</p>}
      {s?.ok && <p role="status" className="rounded-xl bg-moss-soft px-3 py-2 text-sm text-moss">{s.ok}</p>}
    </div>
  );
}
