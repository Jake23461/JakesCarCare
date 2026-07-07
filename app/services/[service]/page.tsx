import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Clock3 } from "lucide-react";
import { Nav } from "@/components/nav";
import { SiteFooter } from "@/components/site-footer";
import { FaqList } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";
import { servicePages } from "@/lib/service-pages";
import { inAreaTowns } from "@/lib/town-data";
import { faqs } from "@/lib/faq";
import { siteConfig } from "@/lib/site";

export function generateStaticParams() {
  return servicePages.map((s) => ({ service: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service } = await params;
  const svc = servicePages.find((s) => s.slug === service);
  if (!svc) return {};
  return {
    title: `${svc.title} — ${svc.priceLabel} | Jake's Car Care`,
    description: svc.metaDescription,
    alternates: { canonical: `/services/${svc.slug}/` },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  const svc = servicePages.find((s) => s.slug === service);
  if (!svc) notFound();

  const svcFaqs = faqs
    .filter((f) => f.tags.includes("practical") || f.tags.includes("pricing"))
    .slice(0, 3);
  const others = servicePages.filter((s) => s.slug !== svc.slug);

  return (
    <>
      <Nav />
      <JsonLd
        data={serviceSchema({
          name: svc.title,
          description: svc.metaDescription,
          minPrice: svc.minPrice,
          maxPrice: svc.maxPrice,
          urlPath: `/services/${svc.slug}/`,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services", path: "/#services" },
          { name: svc.title, path: `/services/${svc.slug}/` },
        ])}
      />

      <main className="bg-background px-6 pb-24 pt-32 text-foreground">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Services
          </p>
          <h1 className="text-4xl font-black leading-tight text-foreground">
            {svc.title} — {svc.priceLabel}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-foreground-muted">
            {svc.lead}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground">
              <Clock3 className="h-4 w-4 text-accent" />~{svc.durationHours} hours
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-bold text-accent">
              {svc.priceLabel}
            </span>
            <span className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground-muted">
              At your home or workplace
            </span>
          </div>

          <div className="relative mt-8 h-64 overflow-hidden rounded-2xl border border-border sm:h-80">
            <Image
              src={svc.image.src}
              alt={svc.image.alt}
              fill
              className="object-cover"
            />
          </div>

          <h2 className="mt-12 text-2xl font-black text-foreground">
            What&apos;s included
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {svc.included.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                <span className="text-sm text-foreground-muted">{item}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-12 text-2xl font-black text-foreground">
            Who it&apos;s for
          </h2>
          <p className="mt-4 text-base leading-relaxed text-foreground-muted">
            {svc.bestFor}
          </p>

          <div className="mt-10 rounded-2xl border border-border bg-surface p-6 text-center">
            <p className="text-sm text-foreground-muted">
              Available across {inAreaTowns.map((t) => t.name).join(", ")} and
              everywhere within 45 km of Strokestown. Your Eircode shows the
              exact call-out fee (free within ~15 minutes) before you confirm.
            </p>
            <Link
              href="/#contact"
              className="mt-4 inline-flex min-h-[52px] items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-accent-dark"
            >
              Book a {svc.title.toLowerCase()}
            </Link>
          </div>

          <h2 className="mt-14 text-2xl font-black text-foreground">
            Common questions
          </h2>
          <div className="mt-6">
            <FaqList faqs={svcFaqs} />
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

          <h2 className="mt-14 text-2xl font-black text-foreground">
            Other services
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {others.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}/`}
                className="group rounded-2xl border border-border bg-surface p-5 transition hover:border-accent/40 hover:bg-surface-raised"
              >
                <h3 className="text-base font-bold text-foreground group-hover:text-accent">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm font-semibold text-accent">
                  {s.priceLabel} · ~{s.durationHours}h
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
