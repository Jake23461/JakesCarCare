import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { SiteFooter } from "@/components/site-footer";
import { FaqList } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";
import { faqs } from "@/lib/faq";
import { faqSchema, breadcrumbSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ — Mobile Car Valeting | Jake's Car Care",
  description:
    "Prices, call-out fees, what you need to provide, wet-weather policy and more — everything customers ask about mobile car valeting in Roscommon & Longford.",
  alternates: { canonical: "/faq/" },
};

export default function FaqPage() {
  return (
    <>
      <Nav />
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq/" },
        ])}
      />
      <main className="bg-background px-6 pb-24 pt-32 text-foreground">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Good to know
          </p>
          <h1 className="text-4xl font-black text-foreground">
            Frequently asked questions
          </h1>
          <p className="mt-4 max-w-2xl text-base text-foreground-muted">
            Everything customers ask before booking a mobile valet with{" "}
            {siteConfig.businessName}. Not covered here? Call or text{" "}
            <a href={siteConfig.phoneHref} className="font-semibold text-accent">
              {siteConfig.phoneDisplay}
            </a>
            .
          </p>

          <div className="mt-10">
            <FaqList faqs={faqs} />
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/#contact"
              className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-accent-dark"
            >
              Book your valet
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
