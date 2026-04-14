"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { siteConfig, navLinks } from "@/lib/site";

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
          ? "border-b border-border bg-surface/95 shadow-lg shadow-black/30 backdrop-blur-sm"
          : "bg-transparent"
      }`}
    >
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
        <a
          href="/"
          className="flex items-center gap-2.5 transition hover:opacity-80"
          aria-label={siteConfig.businessName}
        >
          <span
            aria-hidden="true"
            className="block h-10 w-[72px] shrink-0 bg-contain bg-left bg-no-repeat sm:h-11 sm:w-[80px]"
            style={{ backgroundImage: "url('/gallery/Logo.png')" }}
          />
          <span className="brand-wordmark hidden text-sm text-foreground sm:block">
            {siteConfig.businessName}
          </span>
        </a>

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
          <div className="flex items-center gap-2">
            <a
              href={siteConfig.facebookHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-2 text-xs font-semibold text-foreground/70 transition hover:border-accent/40 hover:text-foreground"
            >
              <FacebookIcon className="h-4 w-4" />
              Facebook
            </a>
            <a
              href={siteConfig.tiktokHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-2 text-xs font-semibold text-foreground/70 transition hover:border-accent/40 hover:text-foreground"
            >
              <TikTokIcon className="h-4 w-4" />
              TikTok
            </a>
          </div>
        </nav>

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
            <div className="mt-3 flex items-center justify-center gap-5 border-t border-border pt-3">
              <a
                href={siteConfig.facebookHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex items-center gap-1.5 text-sm text-foreground/60 transition hover:text-foreground"
              >
                <FacebookIcon className="h-4 w-4" />
                Facebook
              </a>
              <a
                href={siteConfig.tiktokHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex items-center gap-1.5 text-sm text-foreground/60 transition hover:text-foreground"
              >
                <TikTokIcon className="h-4 w-4" />
                TikTok
              </a>
            </div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
