export type BookHit = {
  source: "openlibrary" | "google";
  externalId: string;
  title: string;
  authors: string[];
  coverUrl?: string;
  pageCount?: number;
  publishedYear?: number;
  isbn13?: string;
  description?: string;
  publisher?: string;
  language?: string;
  categories?: string[];
};

async function openLibrary(q: string): Promise<BookHit[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=20&fields=key,title,author_name,cover_i,number_of_pages_median,first_publish_year,isbn,publisher,language,subject`;
  const r = await fetch(url, { next: { revalidate: 3600 } });
  if (!r.ok) throw new Error(`openlibrary ${r.status}`);
  const j = await r.json();
  return (j.docs ?? []).map((d: any): BookHit => ({
    source: "openlibrary",
    externalId: d.key,
    title: d.title,
    authors: d.author_name ?? [],
    coverUrl: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : undefined,
    pageCount: d.number_of_pages_median,
    publishedYear: d.first_publish_year,
    isbn13: (d.isbn ?? []).find((i: string) => i.length === 13),
    publisher: d.publisher?.[0],
    language: d.language?.[0],
    categories: (d.subject ?? []).slice(0, 5),
  }));
}

async function googleBooks(q: string): Promise<BookHit[]> {
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=20${key ? `&key=${key}` : ""}`;
  const r = await fetch(url, { next: { revalidate: 3600 } });
  if (!r.ok) throw new Error(`google ${r.status}`);
  const j = await r.json();
  return (j.items ?? []).map((i: any): BookHit => {
    const v = i.volumeInfo ?? {};
    const isbn13 = (v.industryIdentifiers ?? []).find((x: any) => x.type === "ISBN_13")?.identifier;
    return {
      source: "google", externalId: i.id, title: v.title ?? "Untitled", authors: v.authors ?? [],
      coverUrl: v.imageLinks?.thumbnail?.replace("http://", "https://"),
      pageCount: v.pageCount || undefined,
      publishedYear: v.publishedDate ? parseInt(v.publishedDate.slice(0, 4)) : undefined,
      isbn13, description: v.description, publisher: v.publisher, language: v.language,
      categories: v.categories,
    };
  });
}

/** Open Library first (no key, generous); fall back to / merge with Google Books. */
export async function searchBooks(q: string): Promise<BookHit[]> {
  q = q.trim();
  if (!q) return [];
  const [ol, gb] = await Promise.allSettled([openLibrary(q), googleBooks(q)]);
  const hits = [
    ...(ol.status === "fulfilled" ? ol.value : []),
    ...(gb.status === "fulfilled" ? gb.value : []),
  ];
  const seen = new Set<string>();
  return hits.filter((h) => {
    const k = (h.isbn13 ?? `${h.title}|${h.authors[0] ?? ""}`).toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
