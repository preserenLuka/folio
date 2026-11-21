const P: Record<string, React.ReactNode> = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h5v-5.5h4V20h5V9.5" /></>,
  books: <><path d="M4 4h4v16H4z" /><path d="M10 4h4v16h-4z" /><path d="m16.2 5.2 3.7-.9 3 15.3-3.7.9z" transform="translate(-1.5 0)" /></>,
  shelf: <><path d="M3 20h18" /><path d="M5 20V9l3-1v12" /><path d="M11 20V5h4v15" /><path d="M18 20V10h2v10" /></>,
  stats: <><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" /></>,
  back: <><path d="m15 5-7 7 7 7" /></>,
  next: <><path d="m9 5 7 7-7 7" /></>,
  flame: <><path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.2 1 2 2 2 0-3-1-5 1-8Z" /></>,
  star: <><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /></>,
  heart: <><path d="M12 20s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7.5 4.5 4.5 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" /></>,
  check: <><path d="m5 12.5 4.5 4.5L19 7.5" /></>,
  dots: <><circle cx="5" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="19" cy="12" r="1.2" /></>,
  scan: <><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><path d="M7 12h10" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  page: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 12h5M10 16h5" /></>,
  down: <><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" /></>,
  up: <><path d="M12 16V5m0 0-4 4m4-4 4 4M5 20h14" /></>,
  share: <><path d="M12 15V4m0 0L8 8m4-4 4 4" /><path d="M5 12v7h14v-7" /></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>,
  bookmark: <><path d="M6 3h12v18l-6-4-6 4z" /></>,
  coin: <><circle cx="12" cy="12" r="8.5" /><path d="M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.5 0-2.5.8-2.5 1.9 0 2.6 5 1.2 5 3.9 0 1.1-1 2-2.5 2-1.2 0-2.200-.5-2.700-1.400M12 6.500v1.500m0 8v1.500" /></>,
  out: <><path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9" /></>,
  pencil: <><path d="m4 20 1-4L16 5l3 3L8 19z" /></>,
  sparkle: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.500 2.500M15.500 15.500 18 18M18 6l-2.500 2.500M8.500 15.500 6 18" /></>,
};

export function Icon({ name, className = "h-5 w-5", fill = false, strokeWidth = 1.8 }: { name: keyof typeof P | string; className?: string; fill?: boolean; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {P[name] ?? null}
    </svg>
  );
}

/** The Folio mark: three leaning spines. */
export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect x="4" y="7" width="7" height="20" rx="1.8" fill="var(--accent)" />
      <rect x="13" y="4" width="7" height="23" rx="1.8" fill="var(--ink)" />
      <rect x="22" y="9" width="7" height="18" rx="1.8" fill="var(--gold)" transform="rotate(8 25.500 18)" />
    </svg>
  );
}
