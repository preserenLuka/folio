"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/home", label: "Home" }, { href: "/books", label: "Books" }, { href: "/library", label: "Library" },
  { href: "/stats", label: "Stats" }, { href: "/profile", label: "Profile" },
];
export function TabBar() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-wood/20 bg-paper/95 backdrop-blur md:static md:border-0 md:bg-transparent">
      <ul className="mx-auto flex max-w-3xl justify-around md:justify-start md:gap-6">
        {TABS.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className={`block px-3 py-3 text-sm ${path.startsWith(t.href) ? "font-semibold text-accent" : "text-ink/70"}`}>{t.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
