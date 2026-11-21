import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Folio — your book shelf", description: "Track, shelve and read your books." };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f6f1e7" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="min-h-dvh antialiased">{children}</body></html>);
}
