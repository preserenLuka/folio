"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";

const TABS = [
  { href: "/home", label: "Home", icon: "home" }, { href: "/books", label: "Books", icon: "books" }, { href: "/library", label: "Shelf", icon: "shelf" },
  { href: "/stats", label: "Stats", icon: "stats" }, { href: "/profile", label: "Profile", icon: "user" },
];

export function TabBar({ variant }: { variant: "mobile" | "desktop" }) {
  const path = usePathname();
  const on = (h: string) => path === h || path.startsWith(h + "/");
  if (variant === "desktop")
    return (
      <nav aria-label="Main" className="hidden gap-1 rounded-full border border-line bg-surface p-1 md:flex">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} aria-current={on(t.href) ? "page" : undefined} className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${on(t.href) ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}>
            <Icon name={t.icon} className="h-4 w-4" />{t.label}
          </Link>
        ))}
      </nav>
    );
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <ul className="mx-auto flex max-w-md justify-between rounded-[1.75rem] border border-line bg-surface/90 p-1.5 shadow-[0_10px_30px_-8px_rgba(40,25,10,.35)] backdrop-blur-xl">
        {TABS.map((t) => (
          <li key={t.href} className="flex-1">
            <Link href={t.href} aria-current={on(t.href) ? "page" : undefined} className={`flex flex-col items-center gap-0.5 rounded-[1.25rem] py-2 text-[10.5px] font-semibold transition-colors ${on(t.href) ? "bg-accent-soft text-accent" : "text-muted"}`}>
              <Icon name={t.icon} className="h-[22px] w-[22px]" strokeWidth={on(t.href) ? 2.1 : 1.7} />{t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
