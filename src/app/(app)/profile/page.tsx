import { requireUser } from "@/lib/auth";
import { logout } from "@/lib/actions-auth";
import { setCurrency } from "@/lib/actions-value";

export default async function Profile() {
  const u = await requireUser();
  return (
    <div className="space-y-3"><h1 className="font-serif text-2xl">{u.name}</h1><p className="text-ink/70">{u.email}</p>
      <form action={async (fd) => { "use server"; await setCurrency(String(fd.get("c"))); }} className="flex gap-2 text-sm"><label>Currency <input name="c" defaultValue={((u.settings as { currency?: string })?.currency) ?? "USD"} maxLength={3} className="w-16 rounded border border-wood/30 bg-white/70 px-2 py-1 uppercase" /></label><button className="rounded bg-accent px-3 text-white">Save</button></form>
      <a href="/api/export" className="block text-sm underline">Export my data (JSON)</a>
      <form action={logout}><button className="rounded-lg border border-wood/30 px-3 py-1.5 text-sm">Log out</button></form></div>
  );
}
