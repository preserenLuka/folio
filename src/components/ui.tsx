import Link from "next/link";
import { Icon } from "./icons";
import { spineColorFor } from "@/lib/status";

/** Book cover with a typographic fallback so lists never show holes. */
export function Cover({ url, title, author, className = "w-14", color }: { url?: string | null; title: string; author?: string; className?: string; color?: string | null }) {
  const bg = color ?? spineColorFor(title);
  return (
    <div className={`relative flex-none aspect-[2/3] overflow-hidden rounded-[6px] shadow-[0_6px_14px_-6px_rgba(40,25,10,.45)] ring-1 ring-black/5 ${className}`} style={{ background: bg }}>
      {url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        : <div className="flex h-full flex-col justify-between p-[10%] text-white">
          <span className="display line-clamp-4 text-[11px] leading-tight">{title}</span>
          {author && <span className="line-clamp-1 text-[8px] opacity-75">{author}</span>}
        </div>}
      <span className="pointer-events-none absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-black/25 to-transparent" />
    </div>
  );
}

export function ProgressBar({ pct, className = "" }: { pct: number; className?: string }) {
  return <div className={`progress ${className}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} /></div>;
}

export function PageHeader({ title, eyebrow, back, action }: { title: string; eyebrow?: string; back?: { href: string; label: string }; action?: React.ReactNode }) {
  return (
    <div className="mb-5">
      {back && <Link href={back.href} className="-ml-1 mb-2 inline-flex items-center gap-1 rounded-full py-1 pr-3 text-sm font-medium text-muted hover:text-ink"><Icon name="back" className="h-4 w-4" />{back.label}</Link>}
      <div className="flex items-end justify-between gap-3">
        <div>{eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}<h1 className="display text-[1.9rem]">{title}</h1></div>
        {action}
      </div>
    </div>
  );
}

export function EmptyState({ icon = "books", title, body, href, cta, secondary }: { icon?: string; title: string; body: string; href?: string; cta?: string; secondary?: { href: string; label: string } }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft text-accent"><Icon name={icon} className="h-8 w-8" strokeWidth={1.5} /></div>
      <h2 className="display text-xl">{title}</h2>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted">{body}</p>
      {href && cta && <Link href={href} className="btn btn-primary mt-5">{cta}</Link>}
      {secondary && <Link href={secondary.href} className="btn btn-ghost mt-1">{secondary.label}</Link>}
    </div>
  );
}

const STATUS_STYLE: Record<string, string> = {
  READING: "bg-accent-soft text-accent", READ: "bg-moss-soft text-moss", WANT_TO_READ: "bg-sunken text-muted", PAUSED: "bg-sunken text-gold", DNF: "bg-sunken text-danger",
};
export function StatusBadge({ status, label }: { status: string; label: string }) {
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[status] ?? STATUS_STYLE.WANT_TO_READ}`}>{label}</span>;
}

/** Read-only star row (supports halves). */
export function Stars({ value, className = "h-3.5 w-3.5" }: { value: number; className?: string }) {
  return (
    <span className="inline-flex gap-0.5 text-gold" aria-label={`${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => <StarGlyph key={n} fill={value >= n ? 1 : value >= n - 0.5 ? 0.5 : 0} className={className} />)}
    </span>
  );
}
export function StarGlyph({ fill, className = "h-6 w-6" }: { fill: 0 | 0.5 | 1; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <Icon name="star" className="absolute inset-0 h-full w-full opacity-35" strokeWidth={1.6} />
      {fill > 0 && <span className="absolute inset-0" style={{ clipPath: fill === 0.5 ? "inset(0 50% 0 0)" : undefined }}><Icon name="star" fill className="h-full w-full" strokeWidth={1.6} /></span>}
    </span>
  );
}
