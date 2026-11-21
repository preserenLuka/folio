# Folio — feature inventory & work packages

Folio is a neutral-named web re-implementation of the *feature set and UX flow* of a visual, shelf-based book tracker (reference app: "SlowRead: book tracker & TBR"). **Do not copy the reference app's name, logo, artwork, fonts, or exact visual identity.** All styling is our own and meant to be customised.

## Sources and confidence

- **[V]** = directly observed in the 3 supplied screen recordings (≈15 s each, TikTok captures). High confidence.
- **[I]** = inferred: standard for this app category or implied by an observed UI element (e.g. a "Stats" tab exists, but its contents were not shown). Medium/low confidence — **verify against the real app or with Luka before building in detail.**
- Public info about the app could not be retrieved (web search returned only unrelated apps). Gaps in the inventory are therefore real; the 3 clips cover the shelf, spine-scan, 3D book viewer and "library value" flows only.

## Observed navigation [V]
Bottom tab bar with 5 tabs: **Home, Books, Library, Stats, Profile**. Library is the visual shelf; a floating top-right toolbar has **search, add (+), and a menu**.

## Feature inventory

### A. Visual library (core differentiator)
1. [V] Library screen renders a **realistic bookshelf**: rows of book spines (real cover-derived spines) and covers, decorative props (candles, plants, figurines, polaroids), seasonal/themed scenes (e.g. Christmas lights/snow).
2. [V] Header shows library name + **book count** ("153 books") and a progress/dots indicator.
3. [V] **Multiple libraries**: list with name and count ("My library · 1 book"), "New library", "Rename", "Delete library", "Reorder libraries", "Open by default".
4. [V] Library menu items: **Books in this library**, **Fills itself** (smart/auto-filled library, e.g. "TBR · Fills itself · 53 books"), **Share as image**, **What it's worth**, **Look** (theme picker), Open by default, Reorder, Delete.
5. [V] Tap a book on the shelf → **book pulls out into a focused 3D view** over a blurred shelf; the book can be **rotated/flipped** (front cover, back cover with blurb, spine, page edges).
6. [V] **Sprayed edges**: page edges are auto-decorated (artwork from the cover/colour); flipping the book reveals the decorated edge ("added from the community" badge — community-contributed book assets).
7. [V] Book viewer actions: **Details, Edit, Photos, Put back** (return to shelf), reading-status chip ("Read ▾") and a "+" quick-action (sparkle button).
8. [I] Drag to arrange books on shelves; sort/auto-arrange (by author, colour, title, date).
9. [I] Per-book spine customisation (colour, height, width, text), custom cover upload.

### B. Adding books
1. [V] **Spine photo scan**: camera screen with Manual/Auto toggle, torch, a frame guide ("Fit the spine in the frame, then tap"); the app recognises the book from the spine photo and shows a result card (title, author, page count, e.g. "A oscuras · Allen, Navessa · 480 pages") with confirm / retry.
2. [V] Result card has tabs/buttons: Info, Edit(filters), Photo, "Put on shelf" (confirm ✓).
3. [V] Search (magnifier) and manual add (+) in the library toolbar.
4. [I] Barcode/ISBN scan; bulk import (CSV/Goodreads/StoryGraph); add from community catalog.
5. [V] Multi-language catalog (Spanish edition shown) and "added from the community" entries.

### C. Library value ("What it's worth") — [V]
1. Pick books to include (checkbox list, **Deselect all**, "127 of 152 priced"), per-book price with source label (e.g. "English edition", "new today", "used"), **"Add price"** for missing, editable.
2. **Calculate · 127** CTA → animated tally ("≈ 4,420 US$", "14 of 127 books"), books stack into a grid while the total counts up, **Skip** button.
3. Final **receipt** view: itemised list, total, "what you paid" comparison (≈5,516 US$ vs paid 2,033 US$), barcode, "PAID" seal. Shareable.
4. Currency detected/selectable (US$ shown).

### D. Reading status & tracking [V/I]
1. [V] Status chip on book ("Read ▾"); TBR is a status-driven smart library.
2. [I] Statuses: Want to read, Reading, Read, Paused, DNF. Current page / % progress, start & finish dates.
3. [I] Reading sessions / timer; log pages per session.
4. [I] Ratings (half-stars), review, notes, quotes (with page), favourites, tags.
5. [I] Home tab: currently reading, today's goal, streak, recent activity.

### E. Books tab [I]
List/grid of all books with filter (status, library, tag, format, owned), sort, search within collection.

### F. Stats tab [I]
Books/pages read per month/year, reading time, streak, avg rating, genres/authors breakdown, yearly recap, goal progress.

### G. Goals [I]
Yearly/monthly/weekly goal by books, pages or minutes; progress ring; reminders.

### H. Profile & settings [I/V]
Account, currency, theme/appearance, default library ("Open by default" [V]), import/export (CSV/JSON), data deletion, notifications, optional subscription/paywall (out of scope).

### I. Sharing [V/I]
Share library as image [V]; share receipt [V]; share book card, reading recap [I]. Public profile/shelf link [I].

### J. Community [V/I]
Community-contributed book assets (sprayed edges, scans) [V]; public notes/reviews, friends/following [I, low priority].

---

## Data model (see `prisma/schema.prisma`)
`User` → `Library` (MANUAL | SMART with `smartRule`, `theme`, `isDefault`, `position`) → `LibraryEntry` (shelf placement) → `UserBook` (status, progress, rating, dates, price/paid/currency, spine/edge customisation, favourite) → `Book` (shared catalog: Open Library / Google Books / manual). `UserBook` also owns `ReadingSession`, `Note` (NOTE/QUOTE/REVIEW), `BookPhoto`, `UserBookTag`. `User` owns `Tag` and `Goal`.

## What is already built (foundation, this PR)
Next.js 15 App Router + TS + Tailwind 4, Postgres/Prisma, email+password auth (bcrypt + signed JWT cookie; no external provider), 5-tab layout (mobile bottom bar / desktop top nav), book search (`/api/books/search`, Open Library + Google Books merged & de-duplicated), add-to-collection server action, Books list with status filter, book detail with status change & remove, **basic** spine shelf on Library (default library + the auto-filled TBR library data), simple Home/Stats/Profile pages. Registration seeds "My library" and a smart "TBR" library.

## Work packages (parallel threads)

Conflict rules: each WP owns the files listed under **Owns**. Shared files (`prisma/schema.prisma`, `src/components/tab-bar.tsx`, `src/app/(app)/layout.tsx`) change only via the small, additive edits noted. **Schema changes: new tables/columns only, one migration per WP named `wp-<id>-…`; never edit existing columns.** Merge order for schema-touching WPs: any; rebase before merge.

| ID | Package | Owns | Depends on |
|---|---|---|---|
| WP-SHELF | Rich shelf renderer: real spines from covers (colour extraction), heights/widths by page count, rows, props, themes/"Look", drag-to-arrange, auto-sort, seasonal scenes | `src/components/shelf*`, `src/lib/shelf/*` | — |
| WP-BOOKVIEW | 3D focused book viewer (rotate/flip, back cover blurb, spine, sprayed edges generator), Details/Edit/Photos/Put back actions, status chip, quick actions | `src/app/(app)/books/[id]/*`, `src/components/book-viewer/*` | — |
| WP-LIBRARIES | Multiple libraries CRUD: switcher, rename, delete, reorder, default, smart-library rule editor ("Fills itself"), library menu | `src/app/(app)/library/*`, `src/lib/actions-libraries.ts` | WP-SHELF (soft) |
| WP-ADD | Add-book flows: richer search UI, manual entry form, ISBN/barcode scan (BarcodeDetector/zxing), spine-photo flow UI (camera capture + upload + OCR/vision match), bulk add | `src/app/search/*`, `src/app/(app)/add/*`, `src/lib/ingest/*` | — |
| WP-VISION | Server-side spine/cover recognition endpoint (image → book candidates via OCR/LLM vision + catalog search) | `src/app/api/vision/*`, `src/lib/vision/*` | WP-ADD (consumer) |
| WP-VALUE | "What it's worth": price sources, per-book price edit, selection list, calculate animation, receipt view, share image | `src/app/(app)/library/value/*`, `src/lib/pricing/*` | WP-LIBRARIES (soft) |
| WP-TRACKING | Reading progress, sessions/timer, start/finish dates, rating, reviews, quotes, notes, tags, favourites | `src/app/(app)/books/[id]/tracking/*`, `src/lib/actions-tracking.ts` | WP-BOOKVIEW (UI mount point) |
| WP-HOME | Home tab: currently reading, streak, today's goal, recent activity | `src/app/(app)/home/*` | WP-TRACKING (data) |
| WP-BOOKS | Books tab: grid/list, filters, sort, in-collection search, tags view | `src/app/(app)/books/page.tsx`, `src/components/books-list/*` | — |
| WP-STATS | Stats tab: charts, yearly recap, genre/author breakdown | `src/app/(app)/stats/*`, `src/lib/stats/*` | WP-TRACKING (data) |
| WP-GOALS | Goals CRUD, progress rings, reminders | `src/app/(app)/goals/*`, `src/lib/actions-goals.ts` | WP-TRACKING (data) |
| WP-SHARE | Share as image (shelf, receipt, recap), public profile/shelf links | `src/app/share/*`, `src/lib/share/*` | WP-SHELF, WP-VALUE |
| WP-IMPORT | Import/export (CSV, Goodreads, StoryGraph, JSON backup), account deletion | `src/app/(app)/profile/data/*`, `src/lib/import/*` | — |
| WP-PROFILE | Settings: currency, theme, default library, notifications, account | `src/app/(app)/profile/*` (except `data/`) | — |
| WP-UPLOADS | File storage abstraction (S3/R2/Vercel Blob) for photos & custom covers | `src/lib/storage/*`, `src/app/api/upload/*` | — |
| WP-PWA | PWA manifest, offline shell, install prompt, responsive/desktop polish, a11y pass | `public/*`, `src/app/manifest.ts` | — |
| WP-COMMUNITY *(optional, last)* | Shared community assets (sprayed edges/scans), public notes, following | `src/app/community/*` | most others |
| WP-QA | E2E tests (Playwright), CI, seed script, Docker/Railway/Vercel deploy docs | `e2e/*`, `.github/*`, `scripts/*` | — |

**Suggested first wave (no inter-dependencies):** WP-SHELF, WP-BOOKVIEW, WP-ADD, WP-BOOKS, WP-UPLOADS, WP-PROFILE, WP-IMPORT, WP-QA. **Second wave:** WP-LIBRARIES, WP-TRACKING, WP-VISION, WP-VALUE. **Third:** WP-HOME, WP-STATS, WP-GOALS, WP-SHARE, WP-PWA, WP-COMMUNITY.
