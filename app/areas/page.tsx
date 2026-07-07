import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import { Nav } from "@/components/nav";
import { SiteFooter } from "@/components/site-footer";
import { CoverageMap } from "@/components/coverage-map";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/schema";
import { inAreaTowns, byArrangementTowns } from "@/lib/town-data";

export const metadata: Metadata = {
  title: "Areas We Cover — Mobile Valeting Roscommon & Longford | Jake's Car Care",
  description:
    "Jake's Car Care covers everywhere within a 45 km drive of Strokestown — Roscommon Town, Longford, Castlerea, Boyle, Carrick-on-Shannon and more. Free call-out within 15 minutes' drive.",
  alternates: { canonical: "/areas/" },
};

export default function AreasPage() {
  return (
    <>
      <Nav />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Areas", path: "/areas/" },
        ])}
      />
      <main className="bg-background px-6 pb-24 pt-32 text-foreground">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Coverage
          </p>
          <h1 className="text-4xl font-black text-foreground">Areas we cover</h1>
          <p className="mt-4 max-w-2xl text-base text-foreground-muted">
            Jake drives to your home or workplace from Strokestown, Co.
            Roscommon. Call-out is <strong className="text-foreground">free within 12 km or a
            15-minute drive</strong> (the green zone below). Beyond that it&apos;s €1 per
            kilometre after the first 12 km, rounded up to the nearest €5 — and
            the booking form shows your exact fee the moment you enter your
            Eircode. Online booking covers everywhere within a 45 km drive.
          </p>

          <div className="mt-10">
            <CoverageMap />
          </div>

          {/* Bookable towns */}
          <h2 className="mt-14 text-2xl font-black text-foreground">
            Book online in these areas
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inAreaTowns.map((t) => (
              <Link
                key={t.slug}
                href={`/areas/${t.slug}/`}
                className="group rounded-2xl border border-border bg-surface p-5 transition hover:border-accent/40 hover:bg-surface-raised"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  <h3 className="text-base font-bold text-foreground group-hover:text-accent">
                    {t.name}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-foreground-muted">
                  {t.drivingKm === 0
                    ? "Home base — no call-out fee"
                    : `${t.drivingKm} km · ~${t.drivingMin} min drive`}
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {t.calloutFee === 0 ? (
                    <span className="text-green-500">Free call-out</span>
                  ) : (
                    <span className="text-accent">+€{t.calloutFee} call-out</span>
                  )}
                </p>
              </Link>
            ))}
          </div>

          {/* By arrangement */}
          <h2 className="mt-14 text-2xl font-black text-foreground">
            By arrangement
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-foreground-muted">
            These are beyond the 45 km online-booking limit, but Jake takes on
            bigger jobs here — full valets or multiple cars in one visit.
            Message him on WhatsApp to arrange it.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {byArrangementTowns.map((t) => (
              <Link
                key={t.slug}
                href={`/areas/${t.slug}/`}
                className="group rounded-2xl border border-border bg-surface p-5 opacity-90 transition hover:border-accent/40 hover:bg-surface-raised"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-foreground-muted" />
                  <h3 className="text-base font-bold text-foreground group-hover:text-accent">
                    {t.name}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-foreground-muted">
                  {t.drivingKm} km · ~{t.drivingMin} min drive
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground-muted">
                  Bigger jobs by arrangement
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
