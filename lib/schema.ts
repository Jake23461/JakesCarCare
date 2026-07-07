/**
 * schema.org JSON-LD builders — all sourced from lib/site.ts and
 * lib/town-data.ts so the published business facts can never drift from the
 * visible site content.
 */

import { siteConfig, services, reviews, openingHours } from "@/lib/site";
import { inAreaTowns } from "@/lib/town-data";
import type { Faq } from "@/lib/faq";

export const SITE_URL = "https://jakescarcare.ie";
export const BUSINESS_ID = `${SITE_URL}/#business`;

/** Extracts min/max € from a tag like "€100–€120" or "€50". */
function priceRange(tag: string): { min: number; max: number } | null {
  const nums = tag.match(/\d+/g)?.map(Number);
  if (!nums?.length) return null;
  return { min: Math.min(...nums), max: Math.max(...nums) };
}

/**
 * The business entity — rendered on the home page, referenced by @id from
 * Service/Breadcrumb schema on subpages.
 *
 * Note on review/aggregateRating: Google doesn't show rating stars for
 * "self-serving" reviews (a business marking up reviews of itself), so this
 * isn't a rich-results play — it exists for AI answer engines, and it must
 * only ever mirror reviews that are visibly rendered on the page.
 */
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["AutoWash", "LocalBusiness"],
    "@id": BUSINESS_ID,
    name: siteConfig.businessName,
    description: siteConfig.description,
    url: SITE_URL,
    telephone: "+353877665058",
    image: `${SITE_URL}/og.jpg`,
    logo: `${SITE_URL}/gallery/Logo.png`,
    priceRange: "€50 - €120",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Strokestown",
      addressRegion: "Co. Roscommon",
      addressCountry: "IE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 53.7767,
      longitude: -8.0983,
    },
    areaServed: inAreaTowns.map((t) => ({
      "@type": "City",
      name: `${t.name}, ${t.county}`,
    })),
    openingHoursSpecification: openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.day,
      opens: "09:00",
      closes: "18:00",
    })),
    sameAs: [siteConfig.facebookHref, siteConfig.tiktokHref],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Mobile valeting services",
      itemListElement: services.map((s) => {
        const range = priceRange(s.tag);
        return {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: s.title,
            description: s.description,
          },
          ...(range && {
            priceSpecification: {
              "@type": "PriceSpecification",
              minPrice: range.min,
              maxPrice: range.max,
              priceCurrency: "EUR",
            },
          }),
        };
      }),
    },
    review: reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      reviewRating: { "@type": "Rating", ratingValue: r.stars, bestRating: 5 },
      reviewBody: r.text,
      datePublished: r.date,
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 5,
      reviewCount: reviews.length,
      bestRating: 5,
    },
  };
}

export function faqSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function serviceSchema(opts: {
  name: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  urlPath: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    serviceType: "Mobile car valeting",
    description: opts.description,
    url: `${SITE_URL}${opts.urlPath}`,
    provider: { "@id": BUSINESS_ID },
    areaServed: inAreaTowns.map((t) => ({ "@type": "City", name: t.name })),
    offers: {
      "@type": "Offer",
      priceSpecification: {
        "@type": "PriceSpecification",
        minPrice: opts.minPrice,
        maxPrice: opts.maxPrice,
        priceCurrency: "EUR",
      },
    },
  };
}

/** Town-page Service schema — only for towns inside the booking area. */
export function townServiceSchema(town: { name: string; county: string; slug: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Mobile car valeting in ${town.name}`,
    serviceType: "Mobile car valeting",
    url: `${SITE_URL}/areas/${town.slug}/`,
    provider: { "@id": BUSINESS_ID },
    areaServed: { "@type": "City", name: `${town.name}, ${town.county}` },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
