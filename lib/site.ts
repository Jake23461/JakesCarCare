/**
 * Jake's Car Care site content configuration
 *
 * All copy, media paths, and data live here.
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

export const heroMedia = {
  mediaType: "image" as "video" | "image",
  // Self-hosted, optimized copy of the hero shot (regenerate with
  // scripts/generate-og.mjs) — same visual as before, no Unsplash hot-link.
  mediaSrc: "/images/hero-wash.jpg",
  posterSrc: "/images/hero-wash.jpg",
  bgImageSrc: "", // solid black hero background (no hot-linked stock image)
  fallbackImageSrc: "/images/hero-wash.jpg",
};

export const siteConfig = {
  businessName: "Jake's Car Care",
  shortName: "Jake's",
  tagline: "From road grime to showroom shine.",
  logoSrc: "/gallery/Logo.png",
  description:
    "Mobile car valeting, car wash and detailing across Roscommon and Longford. Full valet, interior clean, exterior car wash, and paint-safe detailing - we come to you.",
  location: "Strokestown, Co. Roscommon",
  serviceArea: "Roscommon & Longford",
  phoneDisplay: "087 766 5058",
  phoneHref: "tel:0877665058",
  tiktokHref: "https://www.tiktok.com/@jakescarcare4",
  facebookHref: "https://www.facebook.com/profile.php?id=61560837419584",
  googleReviewsHref: "https://g.page/r/CagRJ0TEM8I9EBE/review",
  heroTitleLine1: "Road Grime",
  heroTitleLine2: "to Showroom Shine.",
  heroSubtitle:
    "Mobile car valeting and detailing across Roscommon and Longford.",
  heroScrollPrompt: "Scroll to reveal the finish",
  heroPrimary: { label: "Book a valet", href: "#contact" },
  heroSecondary: { label: "View services", href: "#services" },
} as const;

// Page-absolute hashes so the links work from subpages (/areas/*, /faq/) too
export const navLinks = [
  { href: "/#services", label: "Services" },
  { href: "/areas/", label: "Areas" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/faq/", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
];

export const trustPoints = [
  { label: "Mobile service", sub: "We come to you" },
  { label: "Roscommon & Longford", sub: "Full coverage" },
  { label: "Interior & exterior", sub: "Full valet available" },
  { label: "Professional finish", sub: "Every single time" },
];

export type Service = {
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
};

export const services: Service[] = [
  {
    icon: Car,
    title: "Full Valet",
    description:
      "Complete transformation inside and out. Exterior shampoo and wax, wheel cleaning and tyre shine, window cleaning, full vacuum, dashboard and console clean, leather/fabric treatment, and air freshener.",
    tag: "€100–€120",
  },
  {
    icon: Droplets,
    title: "Exterior Car Wash",
    description:
      "Full exterior car wash and protection - no interior cleaning. Hand shampoo and wax, wheel cleaning and tyre shine, window cleaning, and air freshener. Perfect when the inside is already clean.",
    tag: "€50",
  },
  {
    icon: Sparkles,
    title: "Interior Only",
    description:
      "Deep interior cleaning and restoration. Full vacuum and dust removal, dashboard and console cleaning, leather/fabric treatment, and air freshener. Restores your cabin to showroom condition.",
    tag: "€70–€90",
  },
  {
    icon: Shield,
    title: "Premium Add-ons",
    description:
      "Enhance any service with Protector Wax (+€25) for lasting paint protection and shine, or Iron Fallout & Tar Remover (+€20) to remove embedded particles for a smoother finish. Select during booking.",
    tag: "From +€20",
  },
];

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

export type Review = {
  name: string;
  text: string;
  stars: number;
  /** Month the review was left on Google, e.g. "June 2025" — shown on the card
   *  and used as datePublished in structured data. */
  date: string;
};

export const reviews: Review[] = [
  {
    name: "Bernadette Trimble",
    text: "Jake did a fab job on the full car valet. Better than the shops do.",
    stars: 5,
    date: "June 2025",
  },
  {
    name: "Yasin Machigov",
    text: "Serious work done on my car by Jake. Very respectful and took care of me.",
    stars: 5,
    date: "August 2025",
  },
  {
    name: "Avril",
    text: "Great job on the interior and exterior of my car. Lovely to deal with and prompt replies! Thanks again, Jake!",
    stars: 5,
    date: "September 2025",
  },
];

export type HoursEntry = { day: string; shortDay: string; time: string };

export const openingHours: HoursEntry[] = [
  { day: "Saturday", shortDay: "Sat", time: "9:00 am - 6:00 pm" },
  { day: "Sunday", shortDay: "Sun", time: "9:00 am - 6:00 pm" },
];

const dayToShortDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getTodaysHours(date = new Date()): HoursEntry {
  const today = dayToShortDay[date.getDay()];
  return (
    openingHours.find((e) => e.shortDay === today) ?? {
      day: "Weekends",
      shortDay: "Sat",
      time: "9:00 am - 6:00 pm",
    }
  );
}

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
      content: "Roscommon & Longford\nMobile - we come to you",
      href: "https://maps.google.com/?q=Strokestown+Roscommon+Ireland",
      cta: "Get directions",
      external: true,
    },
  ];
}

export type BeforeAfterPair = {
  before: { src: string; alt: string };
  after: { src: string; alt: string };
  label: string;
};

export const beforeAfterGallery: BeforeAfterPair[] = [
  {
    before: {
      src: "/images/IMG_5927-optimized.jpg",
      alt: "Van interior before valeting",
    },
    after: {
      src: "/images/IMG_5935-optimized.jpg",
      alt: "Van interior after valeting",
    },
    label: "Cabin Deep Clean",
  },
  {
    before: {
      src: "/images/IMG_8069-optimized.jpg",
      alt: "Vehicle interior before clean",
    },
    after: {
      src: "/images/IMG_8082-optimized.jpg",
      alt: "Vehicle interior after clean",
    },
    label: "Interior Transformation",
  },
];
