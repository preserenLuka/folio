import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logout } from "@/lib/actions-auth";
import { setCurrency } from "@/lib/actions-value";
import { Icon } from "@/components/icons";

export const metadata = { title: "Profile" };

export default async function Profile() {
  const u = await requireUser();
  const row = "row-link flex items-center gap-3 px-4 py-3.5";
  const ico = "grid h-9 w-9 flex-none place-items-center rounded-xl bg-sunken text-ink";
  return (
    <div className="stagger space-y-6">
      <div className="flex items-center gap-4">
        <div className="display grid h-16 w-16 place-items-center rounded-full bg-accent text-2xl text-accent-ink">{u.name.trim()[0]?.toUpperCase()}</div>
        <div className="min-w-0"><h1 className="display truncate text-2xl">{u.name}</h1><p className="truncate text-sm text-muted">{u.email}</p></div>
      </div>

      <section>
        <h2 className="eyebrow mb-2 px-1">Preferences</h2>
        <form action={async (fd) => { "use server"; await setCurrency(String(fd.get("c"))); }} className="card-flat flex items-center gap-3 px-4 py-3">
          <span className={ico}><Icon name="coin" className="h-5 w-5" /></span>
          <label htmlFor="cur" className="flex-1 text-[15px] font-medium">Currency<span className="block text-xs font-normal text-muted">Used for library value</span></label>
          <input id="cur" name="c" defaultValue={((u.settings as { currency?: string })?.currency) ?? "USD"} maxLength={3} className="field !w-20 !min-h-0 !py-1.5 text-center font-semibold uppercase" />
          <button className="btn btn-soft !min-h-9 !py-1.5">Save</button>
        </form>
      </section>

      <section>
        <h2 className="eyebrow mb-2 px-1">Your data</h2>
        <div className="card-flat divide-y divide-line overflow-hidden">
          <Link href="/profile/import" className={row}><span className={ico}><Icon name="up" className="h-5 w-5" /></span><span className="flex-1 text-[15px] font-medium">Import from CSV / Goodreads</span><Icon name="next" className="h-4 w-4 text-line-strong" /></Link>
          <a href="/api/export" className={row}><span className={ico}><Icon name="down" className="h-5 w-5" /></span><span className="flex-1 text-[15px] font-medium">Export everything (JSON)</span><Icon name="next" className="h-4 w-4 text-line-strong" /></a>
          <Link href="/library/value" className={row}><span className={ico}><Icon name="coin" className="h-5 w-5" /></span><span className="flex-1 text-[15px] font-medium">What is my library worth?</span><Icon name="next" className="h-4 w-4 text-line-strong" /></Link>
        </div>
      </section>

      <form action={logout}><button className="btn btn-outline w-full"><Icon name="out" className="h-4 w-4" />Log out</button></form>
    </div>
  );
}
