"use client";

// Hero section with:
// - Full-viewport background photo (picsum.photos placeholder — replace for each client)
// - Dark gradient overlay to keep text readable over any photo
// - Staggered entrance animation on page load/refresh (badge → h1 → subtitle → tags → CTAs)
// - Scroll cue chevron
// TODO: Replace BUSINESS_NAME, TAGLINE, DESCRIPTION, PHONE, SEED, and trust tags per client.

import Image from "next/image";
import { motion } from "framer-motion";
import { Phone, MapPin, ArrowRight, ChevronDown } from "lucide-react";

// Change this seed (or swap to a real photo URL) for each client
const BG_IMAGE = "https://picsum.photos/seed/client-hero/1920/1080";

const BUSINESS_NAME = "Business Name";
const TAGLINE = "Your Tagline Here";
const DESCRIPTION =
  "A short, compelling description of the business and what makes it worth calling. One to two sentences.";
const PHONE_DISPLAY = "000 000 0000";
const PHONE_HREF = "tel:0000000000";
const LOCATION = "Your City & County";

const TRUST_TAGS = ["XX+ Years Experience", "5.0 ★ Google Rated", "Tag Three"];

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 36 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, delay, ease: "easeOut" as const },
  };
}

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-32"
    >
      {/* Background photo — replace src with real client photo before launch */}
      <Image
        src={BG_IMAGE}
        alt=""
        fill
        priority
        className="object-cover"
      />

      {/* Dark gradient overlay — adjust opacity values to suit the photo */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(15,37,68,0.94) 0%, rgba(30,58,95,0.88) 55%, rgba(26,56,112,0.91) 100%)",
        }}
      />

      {/* Subtle grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.025) 40px, rgba(255,255,255,0.025) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.025) 40px, rgba(255,255,255,0.025) 41px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Location badge */}
        <motion.div
          {...fadeUp(0)}
          className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm"
        >
          <MapPin className="h-4 w-4 text-orange-400" />
          Serving {LOCATION}
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.12)}
          className="text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {TAGLINE}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.24)}
          className="mx-auto mt-6 max-w-xl text-lg text-white/75 sm:text-xl"
        >
          {DESCRIPTION}
        </motion.p>

        {/* Trust tags */}
        <motion.div
          {...fadeUp(0.36)}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          {TRUST_TAGS.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          {...fadeUp(0.48)}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <a
            href={PHONE_HREF}
            className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-orange-500 px-8 py-3.5 text-lg font-bold text-white shadow-lg transition hover:bg-orange-600 active:scale-95"
          >
            <Phone className="h-5 w-5" />
            {PHONE_DISPLAY}
          </a>
          <a
            href="#services"
            className="inline-flex min-h-[52px] items-center gap-2 rounded-full border border-white/30 px-8 py-3.5 text-lg font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
          >
            Our Services
            <ArrowRight className="h-5 w-5" />
          </a>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/30"
      >
        <ChevronDown className="h-6 w-6" />
      </div>
    </section>
  );
}
