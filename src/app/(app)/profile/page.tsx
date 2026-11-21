import { requireUser } from "@/lib/auth";
import { logout } from "@/lib/actions-auth";

export default async function Profile() {
  const u = await requireUser();
  return (
    <div className="space-y-3"><h1 className="font-serif text-2xl">{u.name}</h1><p className="text-ink/70">{u.email}</p>
      <form action={logout}><button className="rounded-lg border border-wood/30 px-3 py-1.5 text-sm">Log out</button></form></div>
  );
}
