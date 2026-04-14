/**
 * Jake's Car Care — site content configuration
 *
 * All copy, media paths, and data live here.
 * Swap mediaSrc/bgImageSrc/posterSrc once you have real TikTok-exported assets.
 */

import {
  Car,
  Droplets,
  Sparkles,
  Shield,
  MapPin,
  Phone,
  Clock3,
  type LucideIcon,
} from "lucide-react";

// ─── Hero media ─────────────────────────────────────────────────────────────
//
// HOW TO SWAP IN YOUR OWN VIDEOS:
//   1. Export your TikTok clean-car reveal as an .mp4
//   2. Drop it into public/videos/jakes-car-care-reveal.mp4
//   3. Add poster/bg images to public/images/
//   4. Update the four paths below — that's the only change needed.
//
// Current state: Unsplash/picsum placeholders (clearly marked).

export const heroMedia = {
  /** Switch to "video" once your .mp4 is in /public/videos/ */
  mediaType: "image" as "video" | "image",

  /** PLACEHOLDER → replace with: /videos/jakes-car-care-reveal.mp4 */
  mediaSrc:
    "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1920&q=80",

  /** PLACEHOLDER → replace with: /images/jakes-car-care-poster.jpg */
  posterSrc: "/images/jakes-car-care-poster.jpg",

  /** PLACEHOLDER → replace with: /images/jakes-car-care-dirty.jpg */
  bgImageSrc:
    "https://images.unsplash.com/photo-1558981852-426c349548ab?auto=format&fit=crop&w=1920&q=80",

  /** Fallback still if video fails */
  fallbackImageSrc:
    "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1920&q=80",
};

// ─── Site config ─────────────────────────────────────────────────────────────

export const siteConfig = {
  businessName: "Jake's Car Care",
  shortName: "Jake's",
  tagline: "From road grime to showroom shine.",
  /** Drop logo file at public/images/jakes-logo.png to activate everywhere */
  logoSrc: "/images/jakes-logo.png",
  description:
    "Mobile car valeting and detailing across Roscommon and Longford. Full valet, interior clean, exterior wash, and paint-safe detailing — we come to you.",
  location: "Strokestown, Co. Roscommon",
  serviceArea: "Roscommon & Longford",
  phoneDisplay: "087 766 5058",
  phoneHref: "tel:0877665058",
  tiktokHref: "https://www.tiktok.com/@jakescarcare4",
  heroTitleLine1: "Road Grime",
  heroTitleLine2: "to Showroom Shine.",
  heroSubtitle:
    "Mobile car valeting and detailing across Roscommon and Longford.",
  heroScrollPrompt: "Scroll to reveal the finish",
  heroPrimary: { label: "Book a valet", href: "#contact" },
  heroSecondary: { label: "View services", href: "#services" },
} as const;

// ─── Navigation ──────────────────────────────────────────────────────────────

export const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#about", label: "About" },
  { href: "#reviews", label: "Reviews" },
  { href: "#contact", label: "Contact" },
];

// ─── Trust strip ─────────────────────────────────────────────────────────────

export const trustPoints = [
  { label: "Mobile service", sub: "We come to you" },
  { label: "Roscommon & Longford", sub: "Full coverage" },
  { label: "Interior & exterior", sub: "Full valet available" },
  { label: "Professional finish", sub: "Every single time" },
];

// ─── Services ────────────────────────────────────────────────────────────────

export type Service = {
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
};

export const services: Service[] = [
  {
    icon: Droplets,
    title: "Exterior Wash",
    description:
      "Full exterior foam pre-wash, contact wash, rinse, and hand dry. Door shuts, arches, and wheels all cleaned. Leaves your car spotless and protected.",
    tag: "From €40",
  },
  {
    icon: Sparkles,
    title: "Interior Valet",
    description:
      "Deep vacuum, dashboard and trim wipe-down, glass clean, seat and carpet steam clean, odour treatment, and leather conditioning where applicable.",
    tag: "From €60",
  },
  {
    icon: Car,
    title: "Full Valet",
    description:
      "Complete inside-and-out transformation. Our most popular package — exterior wash plus full interior valet for a showroom-ready result.",
    tag: "From €100",
  },
  {
    icon: Shield,
    title: "Paint-Safe Detailing",
    description:
      "Iron fallout removal, tar decontamination, clay bar treatment, and paint protection. Ideal before long trips or selling your vehicle.",
    tag: "From €80",
  },
];

// ─── Service areas ────────────────────────────────────────────────────────────

export const serviceAreas = [
  "Strokestown",
  "Roscommon Town",
  "Longford Town",
  "Castlerea",
  "Boyle",
  "Ballymahon",
  "Edgeworthstown",
  "Carrick-on-Shannon",
  "Athlone",
  "Loughrea",
];

// ─── Reviews (placeholders — add real Google reviews when available) ──────────

export type Review = {
  name: string;
  text: string;
  stars: number;
};

export const reviews: Review[] = [
  {
    name: "Ciarán M.",
    text: "Jake did a brilliant job on my Audi — hadn't been properly cleaned in years and it came out looking brand new. Highly recommend.",
    stars: 5,
  },
  {
    name: "Aoife B.",
    text: "Fantastic service. Jake came to my workplace, did the full valet in a couple of hours, and the car was immaculate. Will definitely be booking again.",
    stars: 5,
  },
  {
    name: "Seán F.",
    text: "Best value I've found for mobile valeting in Roscommon. Professional attitude, quality products, and a great finish every time.",
    stars: 5,
  },
];

// ─── Opening hours ────────────────────────────────────────────────────────────

export type HoursEntry = { day: string; shortDay: string; time: string };

export const openingHours: HoursEntry[] = [
  { day: "Monday", shortDay: "Mon", time: "9:00 am – 6:00 pm" },
  { day: "Tuesday", shortDay: "Tue", time: "9:00 am – 6:00 pm" },
  { day: "Wednesday", shortDay: "Wed", time: "9:00 am – 6:00 pm" },
  { day: "Thursday", shortDay: "Thu", time: "9:00 am – 6:00 pm" },
  { day: "Friday", shortDay: "Fri", time: "9:00 am – 6:00 pm" },
  { day: "Saturday", shortDay: "Sat", time: "9:00 am – 6:00 pm" },
  { day: "Sunday", shortDay: "Sun", time: "Closed" },
];

const dayToShortDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getTodaysHours(date = new Date()): HoursEntry {
  const today = dayToShortDay[date.getDay()];
  return openingHours.find((e) => e.shortDay === today) ?? openingHours[0];
}

// ─── Contact cards ────────────────────────────────────────────────────────────

export type ContactCard = {
  icon: LucideIcon;
  title: string;
  content: string;
  href: string;
  cta: string;
  external?: boolean;
};

export function getContactCards(): ContactCard[] {
  const today = getTodaysHours();
  return [
    {
      icon: Phone,
      title: "Call or text",
      content: siteConfig.phoneDisplay,
      href: siteConfig.phoneHref,
      cta: "Call now",
    },
    {
      icon: Clock3,
      title: "Today's hours",
      content: `${today.day}\n${today.time}`,
      href: "#contact",
      cta: "View all hours",
    },
    {
      icon: MapPin,
      title: "Service area",
      content: "Roscommon & Longford\nMobile — we come to you",
      href: `https://maps.google.com/?q=Strokestown+Roscommon+Ireland`,
      cta: "Get directions",
      external: true,
    },
  ];
}

// ─── Before/after gallery (placeholders) ─────────────────────────────────────
//
// Replace these with real before/after shots once Jake provides photos.

export type BeforeAfterPair = {
  before: { src: string; alt: string };
  after: { src: string; alt: string };
  label: string;
};

export const beforeAfterGallery: BeforeAfterPair[] = [
  {
    before: {
      src: "https://images.unsplash.com/photo-1558981852-426c349548ab?auto=format&fit=crop&w=800&q=80",
      alt: "Dirty car exterior before valeting",
    },
    after: {
      src: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80",
      alt: "Gleaming car exterior after full valet",
    },
    label: "Full Exterior Valet",
  },
  {
    before: {
      src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
      alt: "Car interior before deep clean",
    },
    after: {
      src: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80",
      alt: "Clean car interior after valet",
    },
    label: "Interior Deep Clean",
  },
];
