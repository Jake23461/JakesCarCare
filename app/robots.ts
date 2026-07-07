import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Note: /admin routes are handled with a robots noindex meta (see
// app/admin/layout.tsx) rather than a Disallow here — a Disallow would stop
// Google from ever seeing the noindex.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://jakescarcare.ie/sitemap.xml",
  };
}
