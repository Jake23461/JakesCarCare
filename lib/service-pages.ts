/**
 * Content for the /services/[service] pages. Durations mirror
 * SERVICE_DURATIONS in lib/bookings.ts; prices mirror the Hub / lib/site.ts.
 */

export type ServicePage = {
  slug: string;
  /** Canonical Hub service name (matches the booking form) */
  name: string;
  title: string;
  metaDescription: string;
  minPrice: number;
  maxPrice: number;
  priceLabel: string;
  durationHours: number;
  lead: string;
  included: string[];
  bestFor: string;
  image: { src: string; alt: string };
};

export const servicePages: ServicePage[] = [
  {
    slug: "full-valet",
    name: "Full Valet",
    title: "Full Car Valet",
    metaDescription:
      "Full mobile car valet in Roscommon & Longford — exterior shampoo and wax, wheels, full interior deep clean. €100–€120, ~4 hours, at your home. Book online.",
    minPrice: 100,
    maxPrice: 120,
    priceLabel: "€100–€120",
    durationHours: 4,
    lead:
      "The complete transformation, inside and out — a full valet covers everything the exterior wash and interior valet do, in one visit. It takes around four hours, and it happens on your own driveway.",
    included: [
      "Exterior shampoo and hand wash",
      "Wax protection applied by hand",
      "Wheel cleaning and tyre shine",
      "All glass cleaned inside and out",
      "Full interior vacuum, including boot",
      "Dashboard, console and trim cleaned",
      "Leather or fabric treatment",
      "Air freshener to finish",
    ],
    bestFor:
      "Cars that haven't had proper attention in months, family cars that work hard, or getting a car ready to sell — dealers notice the difference a proper valet makes to a trade-in.",
    image: { src: "/images/IMG_8082-optimized.jpg", alt: "Car interior after a full valet" },
  },
  {
    slug: "interior-valet",
    name: "Interior Only",
    title: "Interior Valet",
    metaDescription:
      "Deep interior car clean in Roscommon & Longford — full vacuum, dashboard and trim, leather/fabric treatment. €70–€90, ~3 hours, at your home. Book online.",
    minPrice: 70,
    maxPrice: 90,
    priceLabel: "€70–€90",
    durationHours: 3,
    lead:
      "A deep clean of everything inside the car: seats, carpets, boot, dashboard, trim and glass. Around three hours of proper work — not a quick hoover — done wherever the car is parked.",
    included: [
      "Full vacuum — seats, carpets, mats, boot",
      "Dashboard and console deep clean",
      "Door cards and trim detailed",
      "Interior glass cleaned",
      "Leather or fabric treatment",
      "Rubbish removed and taken away",
      "Air freshener to finish",
    ],
    bestFor:
      "Pet hair, kids' spills, work vans and daily commuters — anywhere the inside has gotten away from you while the outside still looks fine.",
    image: { src: "/images/IMG_5935-optimized.jpg", alt: "Van interior after deep cleaning" },
  },
  {
    slug: "exterior-wash",
    name: "Exterior Only",
    title: "Car Wash & Exterior Valet",
    metaDescription:
      "Mobile car wash in Roscommon & Longford — hand shampoo, wax, wheels and tyre shine, brought to your door. €50, ~2 hours, at your home. Book online.",
    minPrice: 50,
    maxPrice: 50,
    priceLabel: "€50",
    durationHours: 2,
    lead:
      "A proper hand car wash and protection for the outside of the car — shampoo, wax, wheels, tyres and glass. Two hours of careful work that a drive-through car wash can't match, done on your own driveway without touching the interior.",
    included: [
      "Pre-rinse and snow foam",
      "Two-bucket hand shampoo",
      "Wax protection applied by hand",
      "Wheel cleaning and tyre shine",
      "Exterior glass cleaned",
      "Paint-safe products throughout",
    ],
    bestFor:
      "Cars whose interiors are already grand, lease returns, or as a regular monthly car wash between full valets. Add protector wax or iron fallout removal at booking for longer-lasting results.",
    image: { src: "/gallery/Exterior.png", alt: "Exterior wash service" },
  },
];
