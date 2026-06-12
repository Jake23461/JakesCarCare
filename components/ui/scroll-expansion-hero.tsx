"use client";

/**
 * ScrollExpandHero
 *
 * Cinematic scroll-expansion hero. Dirty background → compact media card →
 * scroll-to-expand → full-viewport clean reveal → bold heading + logo + CTAs.
 *
 * Reusable for other client sites — pass all media, copy, and logo as props.
 *
 * Accessibility: prefers-reduced-motion → skips animation, shows expanded
 * state immediately with normal scroll behaviour.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export interface ScrollExpandHeroProps {
  /** "video" plays a looping muted video; "image" shows a still reveal */
  mediaType?: "video" | "image";
  /** Path or URL for the clean-car video/image shown expanding */
  mediaSrc: string;
  /** Poster image for video (shown while loading) */
  posterSrc?: string;
  /** Full-screen background image — the "dirty" before state. Omit/empty for a
   *  solid black background. */
  bgImageSrc?: string;
  /** First line of the splitting headline (shown during scroll animation) */
  titleLine1: string;
  /** Second line of the splitting headline */
  titleLine2: string;
  /**
   * Heading shown after full expansion.
   * First word / line — styled in white.
   */
  headingLine1?: string;
  /**
   * Heading shown after full expansion.
   * Second word / line — styled in the accent colour.
   */
  headingLine2?: string;
  /** Logo image src — shown above the heading in the post-reveal overlay */
  logoSrc?: string;
  /** Alt text for the logo */
  logoAlt?: string;
  /** Subtitle shown after full expansion */
  subtitle?: string;
  /** Scroll cue text */
  scrollPrompt?: string;
  /** Primary CTA button */
  ctaPrimary?: { label: string; href: string };
  /** Secondary CTA button */
  ctaSecondary?: { label: string; href: string };
  /** Page sections rendered below the hero once expanded */
  children?: ReactNode;
}

export function ScrollExpandHero({
  mediaType = "video",
  mediaSrc,
  posterSrc,
  bgImageSrc,
  titleLine1,
  titleLine2,
  headingLine1,
  headingLine2,
  logoSrc,
  logoAlt = "Logo",
  subtitle,
  scrollPrompt = "Scroll to reveal",
  ctaPrimary,
  ctaSecondary,
  children,
}: ScrollExpandHeroProps) {
  const prefersReducedMotion = useReducedMotion();

  const [progress, setProgress] = useState(prefersReducedMotion ? 1 : 0);
  const [expanded, setExpanded] = useState(!!prefersReducedMotion);
  const [isMobile, setIsMobile] = useState(false);

  const progressRef = useRef(prefersReducedMotion ? 1 : 0);
  const expandedRef = useRef(!!prefersReducedMotion);
  const touchStartY = useRef(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const advance = (delta: number) => {
      if (expandedRef.current) return;
      const next = Math.min(Math.max(progressRef.current + delta, 0), 1);
      progressRef.current = next;
      setProgress(next);
      if (next >= 1) {
        expandedRef.current = true;
        setExpanded(true);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (expandedRef.current) return;
      e.preventDefault();
      advance(e.deltaY * 0.0013);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (expandedRef.current) return;
      e.preventDefault();
      const deltaY = touchStartY.current - e.touches[0].clientY;
      advance(deltaY * (deltaY < 0 ? 0.007 : 0.005));
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      touchStartY.current = 0;
    };

    const handleScroll = () => {
      if (!expandedRef.current) window.scrollTo(0, 0);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prefersReducedMotion]);

  // ── Visual interpolation ──────────────────────────────────────────────────
  const minW = isMobile ? 260 : 360;
  const maxW = isMobile ? 860 : 1540;
  const minH = isMobile ? 340 : 460;
  const maxH = isMobile ? 620 : 880;

  const mediaW = minW + progress * (maxW - minW);
  const mediaH = minH + progress * (maxH - minH);

  const titleShiftVw = progress * (isMobile ? 24 : 17);
  const titleOpacity = Math.max(0, 1 - progress * 2.2);
  const bgOpacity = 1 - progress;
  const mediaOverlay = Math.max(0, 0.55 - progress * 0.6);
  const borderRadius = (1 - progress) * 16;

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero section ─────────────────────────────────────────── */}
      <section
        className="relative w-full overflow-hidden"
        style={{ height: "100dvh", minHeight: "100dvh" }}
      >
        {/* Background — a client photo (the "dirty before"), or solid black when
            no image is provided. Fades to black as the media expands. */}
        <div
          className="absolute inset-0 z-0 bg-black"
          style={{ opacity: bgOpacity, transition: "none" }}
        >
          {bgImageSrc && (
            <>
              <Image
                src={bgImageSrc}
                alt=""
                fill
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-black/55" />
            </>
          )}
        </div>

        {/* Expanding clean-car media */}
        <div
          className="absolute top-1/2 left-1/2 z-10 overflow-hidden"
          style={{
            width: `${mediaW}px`,
            height: `${mediaH}px`,
            maxWidth: "98vw",
            maxHeight: "96dvh",
            transform: "translate(-50%, -50%)",
            borderRadius: `${borderRadius}px`,
            transition: "none",
            willChange: "width, height, border-radius",
          }}
        >
          {mediaType === "video" ? (
            <video
              src={mediaSrc}
              poster={posterSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={mediaSrc}
                alt="Clean car after valeting"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div
            className="absolute inset-0 bg-black pointer-events-none"
            style={{ opacity: mediaOverlay, transition: "none" }}
          />
        </div>

        {/* ── Splitting headline — animates during scroll ─────────── */}
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 pointer-events-none select-none px-4"
          style={{ opacity: titleOpacity, transition: "none" }}
        >
          <span
            className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white uppercase tracking-tighter leading-none text-center"
            style={{
              transform: `translateX(-${titleShiftVw}vw)`,
              transition: "none",
              textShadow: "0 4px 30px rgba(0,0,0,0.8)",
            }}
          >
            {titleLine1}
          </span>
          <span
            className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white uppercase tracking-tighter leading-none text-center"
            style={{
              transform: `translateX(${titleShiftVw}vw)`,
              transition: "none",
              textShadow: "0 4px 30px rgba(0,0,0,0.8)",
            }}
          >
            {titleLine2}
          </span>
        </div>

        {/* ── Scroll cue ───────────────────────────────────────────── */}
        <motion.div
          className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2 pointer-events-none"
          animate={{ opacity: progress < 0.04 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.p
            className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {scrollPrompt}
          </motion.p>
        </motion.div>

        {/* ── Post-expansion overlay: logo + bold heading + CTAs ───── */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-30 flex flex-col items-center justify-end pb-10 px-6"
          style={{
            /* Gradient covers lower ~65% of the hero frame */
            background:
              "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.2) 65%, transparent 100%)",
            height: "72%",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: expanded ? 1 : 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="mx-auto w-full max-w-2xl text-center">
            {/* Logo */}
            {logoSrc && (
              <motion.div
                className="mb-5 flex justify-center"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: expanded ? 1 : 0, scale: expanded ? 1 : 0.85 }}
                transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoSrc}
                  alt={logoAlt}
                  className="h-20 w-auto sm:h-24 md:h-28 drop-shadow-2xl"
                />
              </motion.div>
            )}

            {/* Bold heading — the "brand moment" after the reveal */}
            {(headingLine1 || headingLine2) && (
              <motion.div
                className="mb-4 leading-none"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: expanded ? 1 : 0, y: expanded ? 0 : 16 }}
                transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
              >
                {headingLine1 && (
                  <h1
                    className="block text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none"
                    style={{ textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}
                  >
                    {headingLine1}
                  </h1>
                )}
                {headingLine2 && (
                  <h1
                    className="block text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter text-accent leading-none"
                    style={{ textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}
                  >
                    {headingLine2}
                  </h1>
                )}
              </motion.div>
            )}

            {/* Subtitle */}
            {subtitle && (
              <motion.p
                className="mb-6 text-sm sm:text-base text-white/70 font-medium leading-snug"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: expanded ? 1 : 0, y: expanded ? 0 : 10 }}
                transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              >
                {subtitle}
              </motion.p>
            )}

            {/* CTAs */}
            {(ctaPrimary || ctaSecondary) && (
              <motion.div
                className="flex flex-wrap items-center justify-center gap-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: expanded ? 1 : 0, y: expanded ? 0 : 8 }}
                transition={{ duration: 0.5, delay: 0.38, ease: "easeOut" }}
              >
                {ctaPrimary && (
                  <a
                    href={ctaPrimary.href}
                    className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {ctaPrimary.label}
                  </a>
                )}
                {ctaSecondary && (
                  <a
                    href={ctaSecondary.href}
                    className="inline-flex min-h-[52px] items-center gap-2 rounded-full border border-white/35 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {ctaSecondary.label}
                  </a>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* ── Page content revealed after expansion ────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        aria-hidden={!expanded}
      >
        {children}
      </motion.div>
    </div>
  );
}
