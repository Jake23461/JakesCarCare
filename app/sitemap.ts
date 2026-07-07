import type { MetadataRoute } from "next";
import { towns } from "@/lib/town-data";
import { servicePages } from "@/lib/service-pages";

export const dynamic = "force-static";

const BASE = "https://jakescarcare.ie";
// Bump when page content meaningfully changes — no fake freshness.
const CONTENT_UPDATED = new Date("2026-07-07");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, lastModified: CONTENT_UPDATED, priority: 1 },
    { url: `${BASE}/areas/`, lastModified: CONTENT_UPDATED, priority: 0.8 },
    ...towns.map((t) => ({
      url: `${BASE}/areas/${t.slug}/`,
      lastModified: CONTENT_UPDATED,
      priority: t.inServiceArea ? 0.8 : 0.5,
    })),
    ...servicePages.map((s) => ({
      url: `${BASE}/services/${s.slug}/`,
      lastModified: CONTENT_UPDATED,
      priority: 0.8,
    })),
    { url: `${BASE}/faq/`, lastModified: CONTENT_UPDATED, priority: 0.7 },
  ];
}
