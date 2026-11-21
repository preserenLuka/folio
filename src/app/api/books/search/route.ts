import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { searchBooks } from "@/lib/book-search";

export async function GET(req: Request) {
  if (!(await getUser())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const q = new URL(req.url).searchParams.get("q") ?? "";
  try { return NextResponse.json({ results: await searchBooks(q) }); }
  catch { return NextResponse.json({ results: [], error: "search_failed" }, { status: 502 }); }
}
