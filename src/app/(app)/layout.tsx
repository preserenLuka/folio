import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { TabBar } from "@/components/tab-bar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-4 md:pb-8">
      <header className="mb-4 flex items-center justify-between">
        <span className="font-serif text-xl">Folio</span>
        <Link href="/search" className="rounded-full bg-accent px-4 py-1.5 text-sm text-white">+ Add book</Link>
      </header>
      <div className="md:hidden" />
      <div className="hidden md:block"><TabBar /></div>
      <main>{children}</main>
      <div className="md:hidden"><TabBar /></div>
    </div>
  );
}
