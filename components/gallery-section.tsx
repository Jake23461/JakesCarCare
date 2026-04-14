"use client";

import Image from "next/image";
import { beforeAfterGallery, siteConfig } from "@/lib/site";
import { AnimateIn } from "@/components/ui/animate-in";
import { StaggerChildren } from "@/components/ui/stagger-children";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.253h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.5a8.18 8.18 0 004.82 1.54V6.6a4.85 4.85 0 01-1.05.09z" />
    </svg>
  );
}

export function GallerySection() {
  return (
    <section className="bg-surface px-6 py-24">
      <AnimateIn className="mx-auto max-w-5xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          The results speak for themselves
        </p>
        <h2 className="text-4xl font-black text-foreground">Before &amp; After</h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-foreground-muted">
          Every car we touch leaves looking showroom-ready.
        </p>
      </AnimateIn>

      <StaggerChildren className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2">
        {beforeAfterGallery.map(({ before, after, label }) => (
          <div key={label} className="overflow-hidden rounded-2xl border border-border">
            <div className="grid grid-cols-2">
              <div className="relative h-56 sm:h-64">
                <Image
                  src={before.src}
                  alt={before.alt}
                  fill
                  sizes="(max-width: 639px) 50vw, 25vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />
                <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white/70">
                  Before
                </span>
              </div>
              <div className="relative h-56 sm:h-64">
                <Image
                  src={after.src}
                  alt={after.alt}
                  fill
                  sizes="(max-width: 639px) 50vw, 25vw"
                  className="object-cover"
                />
                <span className="absolute right-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  After
                </span>
              </div>
            </div>
            <div className="border-t border-border bg-surface-raised px-5 py-3">
              <p className="text-sm font-semibold text-foreground">{label}</p>
            </div>
          </div>
        ))}
      </StaggerChildren>

      <AnimateIn className="mx-auto mt-8 max-w-4xl">
        <div className="relative overflow-hidden rounded-[28px] border border-accent/20 bg-[linear-gradient(135deg,rgba(61,0,0,0.85)_0%,rgba(16,16,18,0.98)_45%,rgba(10,10,12,1)_100%)] p-6 text-center shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              See more transformations
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/72 sm:text-base">
              Check out our TikTok and Facebook for more transformations, fresh before and afters,
              and recent work from around Roscommon and Longford.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href={siteConfig.tiktokHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-[48px] items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-accent/40 hover:bg-accent/10 hover:shadow-[0_0_0_1px_rgba(220,38,38,0.16)]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition group-hover:bg-accent group-hover:text-white">
                  <TikTokIcon className="h-4 w-4" />
                </span>
                <span className="text-left">
                  <span className="block text-[11px] uppercase tracking-[0.2em] text-white/45">
                    Follow on
                  </span>
                  <span className="block">TikTok</span>
                </span>
              </a>
              <a
                href={siteConfig.facebookHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-[48px] items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-accent/40 hover:bg-accent/10 hover:shadow-[0_0_0_1px_rgba(220,38,38,0.16)]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition group-hover:bg-accent group-hover:text-white">
                  <FacebookIcon className="h-4 w-4" />
                </span>
                <span className="text-left">
                  <span className="block text-[11px] uppercase tracking-[0.2em] text-white/45">
                    Follow on
                  </span>
                  <span className="block">Facebook</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </AnimateIn>
    </section>
  );
}
