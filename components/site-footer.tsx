import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { servicePages } from "@/lib/service-pages";
import { towns } from "@/lib/town-data";

/**
 * Shared footer for every page — the site's main internal-linking surface
 * (services, town pages, info) plus a consistent NAP block.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface px-6 py-14">
      <div className="mx-auto max-w-5xl">
        {/* Link columns */}
        <div className="grid gap-10 text-left sm:grid-cols-3">
          <nav aria-label="Services">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-foreground-muted">
              Services
            </p>
            <ul className="flex flex-col gap-2.5">
              {servicePages.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}/`}
                    className="text-sm text-foreground-muted transition hover:text-accent"
                  >
                    {s.title} — {s.priceLabel}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/#contact"
                  className="text-sm font-semibold text-accent transition hover:text-accent-dark"
                >
                  Book a valet →
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Areas we cover">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-foreground-muted">
              Areas we cover
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {towns.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/areas/${t.slug}/`}
                    className="text-sm text-foreground-muted transition hover:text-accent"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/areas/"
                  className="text-sm font-semibold text-accent transition hover:text-accent-dark"
                >
                  All areas →
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Information">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-foreground-muted">
              Info
            </p>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/faq/" className="text-sm text-foreground-muted transition hover:text-accent">
                  Frequently asked questions
                </Link>
              </li>
              <li>
                <Link href="/#reviews" className="text-sm text-foreground-muted transition hover:text-accent">
                  Reviews
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-sm text-foreground-muted transition hover:text-accent">
                  Contact & booking
                </Link>
              </li>
              <li>
                <a
                  href={siteConfig.facebookHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground-muted transition hover:text-accent"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.tiktokHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground-muted transition hover:text-accent"
                >
                  TikTok
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.googleReviewsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-accent transition hover:text-accent-dark"
                >
                  Leave a Google review →
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* NAP + brand */}
        <div className="mt-12 border-t border-border pt-8 text-center">
          {siteConfig.logoSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={siteConfig.logoSrc}
              alt={siteConfig.businessName}
              className="mx-auto mb-4 h-14 w-auto opacity-90"
            />
          )}
          <p className="text-sm font-semibold text-foreground">
            {siteConfig.businessName} · Strokestown, Co. Roscommon
          </p>
          <p className="mt-1 text-sm text-foreground-muted">
            <a href={siteConfig.phoneHref} className="transition hover:text-accent">
              087 766 5058
            </a>{" "}
            · Weekends 9:00–18:00 · Mobile — we come to you
          </p>
          <p className="mt-6 text-xs text-foreground-muted/40">
            &copy; {new Date().getFullYear()} {siteConfig.businessName}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
