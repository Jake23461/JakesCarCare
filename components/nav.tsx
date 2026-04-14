"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, Phone, Car } from "lucide-react";
import { siteConfig, navLinks } from "@/lib/site";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-surface/95 backdrop-blur-sm shadow-lg shadow-black/30 border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo / wordmark */}
        <a
          href="/"
          className="flex items-center gap-2.5 transition hover:opacity-80"
          aria-label={siteConfig.businessName}
        >
          {siteConfig.logoSrc ? (
            /* Logo image — drop file at public/images/jakes-logo.png */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={siteConfig.logoSrc}
              alt={siteConfig.businessName}
              className="h-9 w-auto"
            />
          ) : (
            /* Text fallback while logo file is pending */
            <>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                <Car className="h-4 w-4 text-white" />
              </span>
              <span className="text-base font-bold tracking-tight text-foreground">
                {siteConfig.businessName}
              </span>
            </>
          )}
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-foreground/70 transition hover:text-foreground"
            >
              {label}
            </a>
          ))}
          <a
            href={siteConfig.phoneHref}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-accent-dark"
          >
            <Phone className="h-4 w-4" />
            {siteConfig.phoneDisplay}
          </a>
        </nav>

        {/* Mobile: tap-to-call + hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <a
            href={siteConfig.phoneHref}
            aria-label={`Call ${siteConfig.businessName}`}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white shadow"
          >
            <Phone className="h-5 w-5" />
          </a>
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-raised text-foreground transition hover:bg-border"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="border-t border-border bg-surface shadow-xl md:hidden"
        >
          <nav className="flex flex-col gap-1 px-6 py-4">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 font-medium text-foreground/80 transition hover:bg-surface-raised hover:text-foreground"
              >
                {label}
              </a>
            ))}
            <a
              href={siteConfig.phoneHref}
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-bold text-white shadow"
            >
              <Phone className="h-4 w-4" />
              {siteConfig.phoneDisplay}
            </a>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
