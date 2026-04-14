"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { getBeforeAfterItems, type GalleryItem } from "@/lib/gallery";
import { beforeAfterGallery } from "@/lib/site";
import { AnimateIn } from "@/components/ui/animate-in";
import { StaggerChildren } from "@/components/ui/stagger-children";

type DisplayPair = {
  before: { src: string; alt: string };
  after: { src: string; alt: string };
  label: string;
};

function firestoreItemToDisplayPair(item: GalleryItem): DisplayPair {
  return {
    before: {
      src: item.beforeUrl ?? item.url,
      alt: `Before — ${item.label ?? "valeting"}`,
    },
    after: {
      src: item.url,
      alt: `After — ${item.label ?? "valeting"}`,
    },
    label: item.label ?? "Before & After",
  };
}

export function GallerySection() {
  const [pairs, setPairs] = useState<DisplayPair[]>(beforeAfterGallery);

  useEffect(() => {
    getBeforeAfterItems(db)
      .then((items) => {
        if (items.length > 0) {
          setPairs(items.map(firestoreItemToDisplayPair));
        }
        // Keep fallback if Firestore collection is empty
      })
      .catch(() => {
        // Keep fallback on error
      });
  }, []);

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
        {pairs.map(({ before, after, label }) => (
          <div
            key={label}
            className="overflow-hidden rounded-2xl border border-border"
          >
            <div className="grid grid-cols-2">
              <div className="relative h-56 sm:h-64">
                <Image
                  src={before.src}
                  alt={before.alt}
                  fill
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
    </section>
  );
}
