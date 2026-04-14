"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { db } from "@/lib/firebase";
import { getApprovedReviews, type FirestoreReview } from "@/lib/reviews";
import { reviews as fallbackReviews, siteConfig } from "@/lib/site";
import { AnimateIn } from "@/components/ui/animate-in";
import { StaggerChildren } from "@/components/ui/stagger-children";

export function ReviewsSection() {
  const [reviews, setReviews] = useState<
    Array<{ name: string; text: string; stars: number }>
  >(fallbackReviews);

  useEffect(() => {
    getApprovedReviews(db)
      .then((data: FirestoreReview[]) => {
        if (data.length > 0) {
          setReviews(
            data.map((r) => ({ name: r.name, text: r.text, stars: r.stars }))
          );
        }
        // If empty, keep the fallback static reviews
      })
      .catch(() => {
        // Keep fallback reviews on error
      });
  }, []);

  return (
    <section
      id="reviews"
      className="px-6 py-24"
      style={{
        background:
          "linear-gradient(135deg, #120000 0%, #1e0505 60%, #0a0a0b 100%)",
      }}
    >
      <AnimateIn className="mx-auto max-w-5xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/70">
          <Star className="h-4 w-4 fill-accent text-accent" />
          5.0 on Google Reviews
        </div>
        <h2 className="text-4xl font-black text-white">What customers say</h2>
      </AnimateIn>

      <StaggerChildren className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map(({ name, text, stars }) => (
          <div
            key={name}
            className="flex flex-col rounded-2xl border border-border bg-surface p-6"
          >
            <div className="mb-4 flex gap-0.5">
              {Array.from({ length: stars }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-accent text-accent" />
              ))}
            </div>
            <p className="flex-1 text-sm leading-relaxed text-foreground-muted">
              &ldquo;{text}&rdquo;
            </p>
            <div className="mt-5 border-t border-border pt-4">
              <p className="font-semibold text-foreground">{name}</p>
              <p className="text-xs text-foreground-muted">Google Review</p>
            </div>
          </div>
        ))}
      </StaggerChildren>

      <AnimateIn className="mx-auto mt-10 max-w-5xl text-center">
        <p className="mb-4 text-sm text-white/70">
          Had a great experience? Leave the same Google review as on the old site.
        </p>
        <a
          href={siteConfig.googleReviewsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/15 bg-white/8 px-7 py-3 text-sm font-bold text-white transition hover:border-accent/50 hover:bg-accent hover:text-white"
        >
          Leave a Review on Google
        </a>
      </AnimateIn>
    </section>
  );
}
