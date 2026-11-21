import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { TabBar } from "@/components/tab-bar";
import { Icon, Logo } from "@/components/icons";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="mx-auto max-w-3xl px-5 pb-32 pt-[max(1rem,env(safe-area-inset-top))] md:pb-16">
      <header className="mb-6 flex items-center justify-between gap-3">
        <Link href="/home" className="flex items-center gap-2"><Logo /><span className="display text-xl">Folio</span></Link>
        <TabBar variant="desktop" />
        <Link href="/search" aria-label="Add a book" className="btn btn-primary !h-10 !min-h-0 !w-10 !p-0 md:!w-auto md:!px-4"><Icon name="plus" className="h-5 w-5" strokeWidth={2.2} /><span className="hidden md:inline">Add book</span></Link>
      </header>
      <main className="page-enter">{children}</main>
      <TabBar variant="mobile" />
    </div>
  );
}
