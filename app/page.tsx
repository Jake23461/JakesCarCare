import Image from "next/image";
import { Phone, MapPin, CheckCircle, Star } from "lucide-react";
import { Nav } from "@/components/nav";
import { ScrollExpandHero } from "@/components/ui/scroll-expansion-hero";
import { AnimateIn } from "@/components/ui/animate-in";
import { StaggerChildren } from "@/components/ui/stagger-children";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import Link from "next/link";
import { BookingSection } from "@/components/booking-section";
import { CoverageMap } from "@/components/coverage-map";
import { FaqList } from "@/components/faq-section";
import { SiteFooter } from "@/components/site-footer";
import { JsonLd } from "@/components/json-ld";
import { localBusinessSchema } from "@/lib/schema";
import { homeFaqs } from "@/lib/faq";
import { ReviewsSection } from "@/components/reviews-section";
import { GallerySection } from "@/components/gallery-section";
import {
  siteConfig,
  heroMedia,
  trustPoints,
  services,
  serviceAreas,
  openingHours,
  getContactCards,
} from "@/lib/site";

export default function Home() {
  const contactCards = getContactCards();

  return (
    <>
      <Nav />
      <JsonLd data={localBusinessSchema()} />

      <main className="flex flex-col bg-background text-foreground">
        {/* ── 1. Scroll-Expansion Hero ───────────────────────────────────────── */}
        <ScrollExpandHero
          mediaType={heroMedia.mediaType}
          mediaSrc={heroMedia.mediaSrc}
          posterSrc={heroMedia.posterSrc}
          bgImageSrc={heroMedia.bgImageSrc}
          titleLine1={siteConfig.heroTitleLine1}
          titleLine2={siteConfig.heroTitleLine2}
          headingLine1="Jake's"
          headingLine2="Car Care."
          logoSrc="" // keep the hero clean — logo lives in the nav and footer
          logoAlt={siteConfig.businessName}
          subtitle={siteConfig.heroSubtitle}
          scrollPrompt={siteConfig.heroScrollPrompt}
          ctaPrimary={siteConfig.heroPrimary}
          ctaSecondary={siteConfig.heroSecondary}
        >
          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* Page content below — revealed after the hero expansion completes   */}
          {/* ─────────────────────────────────────────────────────────────────── */}

          {/* ── 2. Trust Strip ────────────────────────────────────────────────── */}
          <section className="border-b border-border bg-surface px-6 py-12">
            <StaggerChildren className="mx-auto grid max-w-5xl grid-cols-2 gap-6 lg:grid-cols-4">
              {trustPoints.map(({ label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2.5 text-center"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <CheckCircle className="h-5 w-5 text-accent" />
                  </div>
                  <p className="text-sm font-bold text-foreground">{label}</p>
                  <p className="text-xs text-foreground-muted">{sub}</p>
                </div>
              ))}
            </StaggerChildren>
          </section>

          {/* ── 3. Services ───────────────────────────────────────────────────── */}
          <section id="services" className="bg-background px-6 py-24">
            <AnimateIn className="mx-auto max-w-5xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                What we offer
              </p>
              <h2 className="text-4xl font-black text-foreground">
                Our Services
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-foreground-muted">
                Every job is done by hand, at your location, with
                professional-grade products. No rushing, no shortcuts.
              </p>
            </AnimateIn>

            <StaggerChildren className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.map(({ icon: Icon, title, description, tag }) => (
                <div
                  key={title}
                  className="flex flex-col rounded-2xl border border-border bg-surface p-6 transition hover:border-accent/40 hover:bg-surface-raised"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground-muted">
                    {description}
                  </p>
                  <div className="mt-4 inline-flex w-fit rounded-full bg-accent/10 px-3 py-1">
                    <span className="text-xs font-semibold text-accent">
                      {tag}
                    </span>
                  </div>
                </div>
              ))}
            </StaggerChildren>

            <AnimateIn className="mx-auto mt-12 max-w-5xl text-center">
              <a
                href={siteConfig.phoneHref}
                className="cta-pulse inline-flex min-h-[52px] items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-accent-dark"
              >
                <Phone className="h-5 w-5" />
                Call for a quote — {siteConfig.phoneDisplay}
              </a>
            </AnimateIn>
          </section>

          {/* ── 4. Before & After ─────────────────────────────────────────────── */}
          <GallerySection />

          {/* ── 5. About / Why Jake's ─────────────────────────────────────────── */}
          <section id="about" className="bg-background px-6 py-24">
            <AnimateIn className="mx-auto max-w-5xl">
              <div className="grid items-start gap-12 lg:grid-cols-2">
                {/* Left: copy + trust points */}
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    Why choose Jake&apos;s
                  </p>
                  <h2 className="text-4xl font-black text-foreground">
                    A professional finish, at your door
                  </h2>
                  <p className="mt-6 text-base leading-relaxed text-foreground-muted">
                    Jake is a dedicated mobile valeter serving Roscommon and
                    Longford. Using professional-grade products and techniques —
                    the same used by dealerships and detailing studios — Jake
                    delivers showroom results without you leaving home.
                  </p>
                  <p className="mt-4 text-base leading-relaxed text-foreground-muted">
                    No fixed location means lower overheads and more competitive
                    pricing. Every job is done properly, by hand, with care for
                    your paintwork and upholstery.
                  </p>

                  <ul className="mt-8 flex flex-col gap-4">
                    {[
                      "Fully mobile — we come to your home or workplace",
                      "Paint-safe products only — no harsh chemicals",
                      "Interior & exterior specialists",
                      "Serving Strokestown, Roscommon, Longford & beyond",
                    ].map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                        <span className="text-sm text-foreground-muted">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <a
                      href={siteConfig.phoneHref}
                      className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-bold text-white shadow transition hover:bg-accent-dark"
                    >
                      <Phone className="h-4 w-4" />
                      Book your valet today
                    </a>
                  </div>
                </div>

                {/* Right: stat cards + location card */}
                <div className="grid grid-cols-2 gap-4 lg:sticky lg:top-24">
                  <div
                    className="flex flex-col items-center justify-center rounded-2xl p-8 text-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #1a0000 0%, #3d0000 100%)",
                      border: "1px solid rgba(220,38,38,0.15)",
                    }}
                  >
                    <AnimatedCounter
                      value={100}
                      suffix="+"
                      label="Happy customers"
                      className="flex flex-col items-center gap-1"
                      labelClassName="text-xs text-white/50 mt-1"
                    />
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-2xl bg-accent p-8 text-center">
                    <div className="text-4xl font-extrabold text-white">
                      5.0
                    </div>
                    <div className="mt-1.5 flex gap-0.5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-white text-white"
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-white/70">Google Rating</p>
                  </div>

                  <div className="col-span-2 overflow-hidden rounded-2xl border border-border">
                    <div className="relative h-48">
                      <Image
                        src="/images/service-area.png"
                        alt="Jake's Car Care mobile valeting service area"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
                        <MapPin className="h-6 w-6 text-accent" />
                        <p className="font-bold text-white">
                          {siteConfig.serviceArea}
                        </p>
                        <p className="text-sm text-white/60">
                          Mobile — we come to you
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateIn>
          </section>

          {/* ── 6. Service Areas ──────────────────────────────────────────────── */}
          <section className="border-y border-border bg-surface px-6 py-16">
            <AnimateIn className="mx-auto max-w-5xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Coverage
              </p>
              <h2 className="mb-8 text-3xl font-black text-foreground">
                Areas we serve
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {serviceAreas.map((area) => (
                  <span
                    key={area}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-4 py-2 text-sm font-medium text-foreground-muted"
                  >
                    <MapPin className="h-3.5 w-3.5 text-accent" />
                    {area}
                  </span>
                ))}
                <span className="rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
                  + surrounding areas
                </span>
              </div>

              {/* Live coverage map — traced free zone + 45 km boundary */}
              <div className="mx-auto mt-10 max-w-3xl">
                <CoverageMap />
              </div>

              {/* Travel / call-out fee explainer */}
              <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-surface-raised p-5 text-center">
                  <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    Free travel zone
                  </p>
                  <p className="mt-1 text-xs text-foreground-muted">
                    No call-out fee anywhere inside the green zone
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-surface-raised p-5 text-center">
                  <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent/10">
                    <MapPin className="h-4 w-4 text-accent" />
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    Further out?
                  </p>
                  <p className="mt-1 text-xs text-foreground-muted">
                    A small call-out fee is added — enter your Eircode when
                    booking and see it instantly on a map
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-surface-raised p-5 text-center">
                  <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent/10">
                    <Phone className="h-4 w-4 text-accent" />
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    Up to 45 km out
                  </p>
                  <p className="mt-1 text-xs text-foreground-muted">
                    Further than that? Message Jake — exceptions possible for
                    bigger jobs
                  </p>
                </div>
              </div>

              <p className="mt-6 text-sm text-foreground-muted">
                Not sure if we cover your area? Call us —{" "}
                <a
                  href={siteConfig.phoneHref}
                  className="font-semibold text-foreground transition hover:text-accent"
                >
                  {siteConfig.phoneDisplay}
                </a>
              </p>
            </AnimateIn>
          </section>

          {/* ── 7. Reviews ────────────────────────────────────────────────────── */}
          <ReviewsSection />

          {/* ── 8. Opening Hours ──────────────────────────────────────────────── */}
          <section className="bg-background px-6 py-16">
            <AnimateIn className="mx-auto max-w-lg">
              <h2 className="mb-8 text-center text-3xl font-black text-foreground">
                Opening Hours
              </h2>
              <p className="mb-5 text-center text-sm text-foreground-muted">
                Weekends only until further notice.
              </p>
              <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
                {openingHours.map(({ day, time }) => (
                  <li
                    key={day}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {day}
                    </span>
                    <span
                      className={
                        time === "Closed"
                          ? "text-sm text-foreground-muted"
                          : "text-sm font-semibold text-foreground"
                      }
                    >
                      {time}
                    </span>
                  </li>
                ))}
              </ul>
            </AnimateIn>
          </section>

          {/* ── 8b. FAQ ───────────────────────────────────────────────────────── */}
          <section id="faq" className="border-t border-border bg-surface px-6 py-24">
            <AnimateIn className="mx-auto max-w-3xl">
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Good to know
              </p>
              <h2 className="mb-8 text-center text-3xl font-black text-foreground">
                Frequently asked questions
              </h2>
              <FaqList faqs={homeFaqs} />
              <p className="mt-6 text-center text-sm text-foreground-muted">
                <Link
                  href="/faq/"
                  className="font-semibold text-accent transition hover:text-accent-dark"
                >
                  See all FAQs →
                </Link>
              </p>
            </AnimateIn>
          </section>

          {/* ── 9. Booking ────────────────────────────────────────────────────── */}
          <section id="contact" className="bg-background px-6 py-24">
            <AnimateIn className="mx-auto max-w-3xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Ready for a showroom finish?
              </p>
              <h2 className="text-4xl font-black text-foreground">
                Book your valet
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-foreground-muted">
                Pick your service and a weekend slot below. We&apos;ll confirm
                by phone or email within 24 hours. Your Eircode shows your
                travel distance and any call-out fee on a map before you book —
                no surprises.
              </p>
            </AnimateIn>

            <div className="mx-auto mt-12 max-w-3xl">
              <BookingSection />
            </div>

            {/* Fallback: prefer a call */}
            <AnimateIn className="mx-auto mt-10 max-w-3xl">
              <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <Phone className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Prefer to call?
                  </p>
                  <p className="text-xs text-foreground-muted">
                    Weekends only until further notice
                  </p>
                </div>
                <a
                  href={siteConfig.phoneHref}
                  className="flex-shrink-0 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-dark"
                >
                  <Phone className="h-4 w-4" />
                  {siteConfig.phoneDisplay}
                </a>
              </div>
            </AnimateIn>

            {/* Contact info cards */}
            <div className="mx-auto mt-6 max-w-3xl grid gap-4 sm:grid-cols-3">
              {contactCards.map(({ icon: Icon, title, content, href, cta, external }) => (
                <div
                  key={title}
                  className="flex flex-col rounded-2xl border border-border bg-surface p-5"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                    {title}
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm font-bold text-foreground">
                    {content}
                  </p>
                  <a
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="mt-3 inline-flex items-center text-xs font-semibold text-accent transition hover:text-accent-dark"
                  >
                    {cta} →
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* ── Footer ────────────────────────────────────────────────────────── */}
          <SiteFooter />
        </ScrollExpandHero>
      </main>
    </>
  );
}
