import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "Folio", short_name: "Folio", start_url: "/home", display: "standalone", background_color: "#f6f1e7", theme_color: "#b4532a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }] };
}
