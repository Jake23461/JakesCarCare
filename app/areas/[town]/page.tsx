import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Car, Clock3, MapPin, MessageCircle } from "lucide-react";
import { Nav } from "@/components/nav";
import { SiteFooter } from "@/components/site-footer";
import { TownMap } from "@/components/town-map";
import { FaqList } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, townServiceSchema } from "@/lib/schema";
import { towns } from "@/lib/town-data";
import { servicePages } from "@/lib/service-pages";
import { faqs } from "@/lib/faq";
import { siteConfig } from "@/lib/site";

const WHATSAPP = "https://wa.me/353877665058";

export function generateStaticParams() {
  return towns.map((t) => ({ town: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ town: string }>;
}): Promise<Metadata> {
  const { town: slug } = await params;
  const town = towns.find((t) => t.slug === slug);
  if (!town) return {};
  const feeText =
    !town.inServiceArea
      ? "by arrangement"
      : town.calloutFee === 0
        ? "free call-out"
        : `€${town.calloutFee} call-out`;
  return {
    title: `Mobile Car Valeting ${town.name} | Jake's Car Care`,
    description: `Professional mobile car valeting in ${town.name}, ${town.county} — Jake comes to your home or workplace (${town.drivingKm > 0 ? `${town.drivingKm} km from Strokestown, ${feeText}` : "home base, no call-out fee"}). Full valet €100–€120. Weekends 9–6.`,
    alternates: { canonical: `/areas/${town.slug}/` },
  };
}

export default async function TownPage({
  params,
}: {
  params: Promise<{ town: string }>;
}) {
  const { town: slug } = await params;
  const town = towns.find((t) => t.slug === slug);
  if (!town) notFound();

  const townFaqs = faqs.filter(
    (f) => f.tags.includes("travel") || f.tags.includes("practical")
  ).slice(0, 3);

  return (
    <>
      <Nav />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Areas", path: "/areas/" },
          { name: town.name, path: `/areas/${town.slug}/` },
        ])}
      />
      {town.inServiceArea && <JsonLd data={townServiceSchema(town)} />}

      <main className="bg-background px-6 pb-24 pt-32 text-foreground">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <Link href="/areas/" className="hover:underline">
              Areas we cover
            </Link>
          </p>
          <h1 className="text-4xl font-black leading-tight text-foreground">
            Mobile Car Valeting in {town.name}, {town.county}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-foreground-muted">
            Jake&apos;s Car Care brings professional valeting to {town.name} —
            full valets, deep interior cleans and exterior washes done at your
            home or workplace, weekends 9:00–18:00. You provide an outdoor tap
            and a socket; Jake brings everything else.
          </p>

          {/* Driving facts — real numbers, unique to this page */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface p-5 text-center">
              <Car className="mx-auto mb-2 h-5 w-5 text-accent" />
              <p className="text-lg font-black text-foreground">
                {town.drivingKm === 0 ? "Home base" : `${town.drivingKm} km`}
              </p>
              <p className="text-xs text-foreground-muted">from Strokestown by road</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 text-center">
              <Clock3 className="mx-auto mb-2 h-5 w-5 text-accent" />
              <p className="text-lg font-black text-foreground">
                {town.drivingMin === 0 ? "0 min" : `~${town.drivingMin} min`}
              </p>
              <p className="text-xs text-foreground-muted">driving time</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 text-center">
              <MapPin className="mx-auto mb-2 h-5 w-5 text-accent" />
              {!town.inServiceArea ? (
                <p className="text-lg font-black text-foreground-muted">
                  By arrangement
                </p>
              ) : town.calloutFee === 0 ? (
                <p className="text-lg font-black text-green-500">Free call-out</p>
              ) : (
                <p className="text-lg font-black text-accent">
                  +€{town.calloutFee} call-out
                </p>
              )}
              <p className="text-xs text-foreground-muted">
                {town.inServiceArea
                  ? "shown at booking from your Eircode"
                  : "outside the 45 km booking area"}
              </p>
            </div>
          </div>

          <p className="mt-8 text-base leading-relaxed text-foreground-muted">
            {town.intro}
          </p>

          <div className="mt-8">
            <TownMap name={town.name} lat={town.lat} lng={town.lng} />
          </div>

          {/* CTA */}
          <div className="mt-8 rounded-2xl border border-border bg-surface p-6 text-center">
            {town.inServiceArea ? (
              <>
                <p className="text-sm text-foreground-muted">
                  Pick a weekend slot and see your exact price — the form shows
                  the {town.calloutFee === 0 ? "zero " : ""}call-out fee for
                  your Eircode before you confirm.
                </p>
                <Link
                  href="/#contact"
                  className="mt-4 inline-flex min-h-[52px] items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-accent-dark"
                >
                  Book a valet in {town.name}
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-foreground-muted">
                  {town.name} is outside the standard online-booking area, but
                  Jake takes on bigger jobs here by arrangement — a full valet,
                  or two or three cars in one visit.
                </p>
                <a
                  href={`${WHATSAPP}?text=${encodeURIComponent(
                    `Hi Jake, I'm in ${town.name} — I know it's outside your usual area but I'd like to ask about a valet.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-[52px] items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-accent-dark"
                >
                  <MessageCircle className="h-5 w-5" />
                  Message Jake on WhatsApp
                </a>
              </>
            )}
          </div>

          {/* Services */}
          <h2 className="mt-14 text-2xl font-black text-foreground">
            Services in {town.name}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {servicePages.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}/`}
                className="group rounded-2xl border border-border bg-surface p-5 transition hover:border-accent/40 hover:bg-surface-raised"
              >
                <h3 className="text-base font-bold text-foreground group-hover:text-accent">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm font-semibold text-accent">
                  {s.priceLabel}
                </p>
                <p className="mt-2 text-xs text-foreground-muted">
                  ~{s.durationHours} hours at your home
                </p>
              </Link>
            ))}
          </div>

          {/* Nearby villages */}
          <h2 className="mt-14 text-2xl font-black text-foreground">
            Also covering near {town.name}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-foreground-muted">
            {town.inServiceArea
              ? `The same service covers the villages and townlands around ${town.name}, including ${town.nearbyVillages.join(", ")} — enter your Eircode when booking and your exact call-out fee appears on a map.`
              : `For ${town.nearbyVillages.join(", ")} and the surrounding townlands, the same arrangement applies — message Jake with your location and the job you have in mind.`}
          </p>

          {/* FAQs */}
          <h2 className="mt-14 text-2xl font-black text-foreground">
            Common questions
          </h2>
          <div className="mt-6">
            <FaqList faqs={townFaqs} />
          </div>
          <p className="mt-4 text-sm text-foreground-muted">
            More questions?{" "}
            <Link href="/faq/" className="font-semibold text-accent hover:underline">
              See the full FAQ
            </Link>{" "}
            or call{" "}
            <a href={siteConfig.phoneHref} className="font-semibold text-accent">
              {siteConfig.phoneDisplay}
            </a>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
