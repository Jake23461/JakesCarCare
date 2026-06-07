import {
  collection,
  query,
  where,
  getDocs,
  runTransaction,
  doc,
  Timestamp,
  type Firestore,
} from "firebase/firestore";

// ─── Constants ───────────────────────────────────────────────────────────────

export const SERVICES = ["Full Valet", "Exterior Only", "Interior Only"] as const;
export type ServiceName = (typeof SERVICES)[number];

export const AVAILABLE_TIMES = ["09:00", "13:00"] as const;
export type TimeSlot = (typeof AVAILABLE_TIMES)[number];

/** Duration in hours. Add-ons don't extend booking duration. */
export const SERVICE_DURATIONS: Record<string, number> = {
  "Full Valet": 4,
  "Exterior Only": 2,
  "Interior Only": 3,
  "Iron Fallout & Tar Remover": 1.5,
  "Protector Wax": 2.5,
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BookingData {
  name: string;
  phone: string;
  email: string;
  eircode: string;
  service: string;
  date: string; // ISO date string: YYYY-MM-DD
  time: string;
  message: string;
  ironFalloutAddon: boolean;
  protectorWaxAddon: boolean;
  // Hub-driven dynamic selections (the flowpoint path uses these):
  addonIds?: string[];
  customFields?: Record<string, string>;
  adminCreated?: boolean;
  price?: string;
  completed?: boolean;
}

// ─── Hub booking-config (services / add-ons / custom fields) ───────────────────

export interface FlowpointService {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
  depositCents?: number;
}
export interface FlowpointAddon {
  id: string;
  name: string;
  priceCents: number;
  durationMinutes: number;
  appliesToServiceIds: string[];
}
export interface FlowpointCustomField {
  id: string;
  fieldKey: string;
  label: string;
  fieldType: string;
  required: boolean;
  options: string[];
}
export interface FlowpointConfig {
  services: FlowpointService[];
  addons: FlowpointAddon[];
  customFields: FlowpointCustomField[];
}

export interface Booking extends BookingData {
  id: string;
  created: Timestamp;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

/** Returns YYYY-MM-DD in local timezone (avoids UTC offset shifting the date). */
export function toLocalDateString(date: Date | string): string {
  if (typeof date === "string") return date;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getTomorrowDateString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toLocalDateString(tomorrow);
}

// ─── Time helpers ─────────────────────────────────────────────────────────────

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ─── Availability ─────────────────────────────────────────────────────────────

/**
 * Fetches all bookings for a specific date from Firestore and returns
 * which time slots are blocked due to collision with existing services.
 */
export async function getBlockedTimesForDate(
  db: Firestore,
  dateStr: string
): Promise<string[]> {
  const bookingsRef = collection(db, "bookings");
  const q = query(bookingsRef, where("date", "==", dateStr));
  const snap = await getDocs(q);

  const blocked = new Set<string>();

  snap.forEach((docSnap) => {
    const booking = docSnap.data() as BookingData;
    const startMinutes = timeToMinutes(booking.time);
    const duration = SERVICE_DURATIONS[booking.service] ?? 3;
    const endMinutes = startMinutes + duration * 60;

    for (let t = startMinutes; t < endMinutes; t += 60) {
      const timeStr = minutesToTime(t);
      if ((AVAILABLE_TIMES as readonly string[]).includes(timeStr)) {
        blocked.add(timeStr);
      }
    }
  });

  return Array.from(blocked);
}

/**
 * Returns which of AVAILABLE_TIMES are still open for a given date.
 * Falls back to all times if the query fails.
 */
export async function getAvailableTimesForDate(
  db: Firestore,
  dateStr: string
): Promise<string[]> {
  try {
    const blocked = await getBlockedTimesForDate(db, dateStr);
    return AVAILABLE_TIMES.filter((t) => !blocked.includes(t));
  } catch {
    return [...AVAILABLE_TIMES];
  }
}

// ─── Submission ───────────────────────────────────────────────────────────────

/**
 * Submits a booking via a Firestore transaction to prevent double-booking.
 * Throws an error string if the slot is no longer available.
 */
export async function submitBooking(
  db: Firestore,
  data: BookingData
): Promise<void> {
  const { date, time, service } = data;
  const serviceDuration = SERVICE_DURATIONS[service] ?? 3;

  await runTransaction(db, async (transaction) => {
    // Re-fetch bookings for this date inside the transaction
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("date", "==", date));
    const snap = await getDocs(q);

    const blocked = new Set<string>();
    snap.forEach((docSnap) => {
      const b = docSnap.data() as BookingData;
      const start = timeToMinutes(b.time);
      const dur = SERVICE_DURATIONS[b.service] ?? 3;
      const end = start + dur * 60;
      for (let t = start; t < end; t += 60) {
        const ts = minutesToTime(t);
        if ((AVAILABLE_TIMES as readonly string[]).includes(ts)) blocked.add(ts);
      }
    });

    // Check selected slot
    if (blocked.has(time)) {
      throw new Error("This time slot is no longer available. Please select another time.");
    }

    // Check duration overlap
    const startMinutes = timeToMinutes(time);
    const endMinutes = startMinutes + serviceDuration * 60;
    for (let t = startMinutes; t < endMinutes; t += 60) {
      const ts = minutesToTime(t);
      if (blocked.has(ts)) {
        throw new Error("This time slot conflicts with an existing booking. Please select another time.");
      }
    }

    // All clear — create the booking
    const newRef = doc(collection(db, "bookings"));
    transaction.set(newRef, {
      ...data,
      adminCreated: data.adminCreated ?? false,
      created: Timestamp.now(),
    });
  });
}

// ─── Flowpoint (Hub) submission + availability ─────────────────────────────────

const FLOWPOINT_API = "https://hub.flowpointstudios.ie";
const FLOWPOINT_TOKEN = "fp_site_jakescarcare_0a36a4fd88c3";

// Build an ISO instant for a Europe/Dublin wall-clock date + time (handles IST/GMT),
// so the Hub stores the slot at the correct local time regardless of device zone.
function toDublinISO(dateStr: string, time: string): string {
  const guess = new Date(`${dateStr}T${time}:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Dublin", hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  })
    .formatToParts(guess)
    .reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {} as Record<string, string>);
  const asUTC = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  const offsetMin = (asUTC - guess.getTime()) / 60000;
  return new Date(guess.getTime() - offsetMin * 60000).toISOString();
}

// Full booking catalogue from the Hub (services, add-ons, custom fields), fetched
// once and cached. This is what makes the bespoke UI Hub-driven: the site decides
// how each item LOOKS, the Hub decides which items EXIST.
let configCache: FlowpointConfig | null = null;
export async function getFlowpointConfig(): Promise<FlowpointConfig | null> {
  if (configCache) return configCache;
  try {
    const res = await fetch(`${FLOWPOINT_API}/api/public/booking-config?token=${encodeURIComponent(FLOWPOINT_TOKEN)}`);
    if (!res.ok) return null;
    const data = await res.json();
    configCache = {
      services: (data.services ?? []).map((s: Record<string, unknown>) => ({
        id: String(s.id),
        name: String(s.name),
        durationMinutes: Number(s.durationMinutes ?? s.duration ?? 0),
        priceCents: Number(s.priceCents ?? 0),
        depositCents: Number(s.depositCents ?? 0),
      })),
      addons: (data.addons ?? []).map((a: Record<string, unknown>) => ({
        id: String(a.id),
        name: String(a.name),
        priceCents: Number(a.priceCents ?? 0),
        durationMinutes: Number(a.durationMinutes ?? 0),
        appliesToServiceIds: Array.isArray(a.appliesToServiceIds) ? a.appliesToServiceIds.map(String) : [],
      })),
      customFields: (data.customFields ?? []).map((f: Record<string, unknown>) => ({
        id: String(f.id),
        fieldKey: String(f.fieldKey),
        label: String(f.label),
        fieldType: String(f.fieldType ?? "text"),
        required: Boolean(f.required),
        options: Array.isArray(f.options) ? f.options.map(String) : [],
      })),
    };
    return configCache;
  } catch {
    return null;
  }
}

/**
 * Which of AVAILABLE_TIMES are taken for a date, per the Hub. Two-slot model:
 * a slot is unavailable only if the Hub already has a booking at that start.
 * (Kept for the legacy fallback path.)
 */
export async function getFlowpointBlockedTimes(dateStr: string, service: string): Promise<string[]> {
  if (!dateStr || !service) return [];
  try {
    const open = new Set(await getFlowpointOpenSlots(dateStr, service));
    return AVAILABLE_TIMES.filter((t) => !open.has(t));
  } catch {
    return [];
  }
}

/**
 * The bookable start times the Hub has CONFIGURED for this business (e.g. its
 * fixed 09:00/13:00). Used to render the slot buttons, so changing the slot
 * config in the Hub flows through to the site with no code change. Falls back to
 * the built-in two-slot list if the Hub is unreachable or set to interval mode.
 */
let configuredSlotsCache: string[] | null = null;
export async function getFlowpointConfiguredSlots(): Promise<string[]> {
  if (configuredSlotsCache) return configuredSlotsCache;
  try {
    const res = await fetch(
      `${FLOWPOINT_API}/api/public/availability?token=${encodeURIComponent(FLOWPOINT_TOKEN)}`
    );
    if (!res.ok) return [...AVAILABLE_TIMES];
    const data = await res.json();
    const times: string[] = Array.isArray(data.fixedTimes)
      ? data.fixedTimes.map((t: string) => String(t).slice(0, 5))
      : [];
    const result = times.length ? times.sort() : [...AVAILABLE_TIMES];
    configuredSlotsCache = result;
    return result;
  } catch {
    return [...AVAILABLE_TIMES];
  }
}

/**
 * The OPEN (still-bookable) start times for a given date + service, straight from
 * the Hub — already accounts for hours, existing bookings, capacity and blocks.
 */
export async function getFlowpointOpenSlots(dateStr: string, service: string): Promise<string[]> {
  if (!dateStr || !service) return [];
  try {
    const url =
      `${FLOWPOINT_API}/api/public/slots?token=${encodeURIComponent(FLOWPOINT_TOKEN)}` +
      `&service=${encodeURIComponent(service)}&date=${encodeURIComponent(dateStr)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.slots ?? []).map((s: string) => String(s).slice(0, 5));
  } catch {
    return [];
  }
}

/**
 * Submits a booking to the Flowpoint Hub using its first-class fields: add-ons
 * (by id), the Eircode custom field, and notes. The Hub owns the record, runs
 * conflict/capacity checks, and sends the customer + owner emails.
 */
export async function submitToFlowpoint(data: BookingData): Promise<void> {
  const startISO = toDublinISO(data.date, data.time);

  const addons = Array.isArray(data.addonIds) ? data.addonIds : [];
  const customFields =
    data.customFields && typeof data.customFields === "object"
      ? data.customFields
      : data.eircode
        ? { eircode: data.eircode }
        : {};

  const res = await fetch(`${FLOWPOINT_API}/api/public/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-flowpoint-site-token": FLOWPOINT_TOKEN,
    },
    body: JSON.stringify({
      customerName: data.name,
      customerEmail: data.email || undefined,
      customerPhone: data.phone || undefined,
      serviceName: data.service,
      startTime: startISO,
      notes: data.message || undefined,
      addons,
      customFields,
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (body?.code === "SLOT_FULL") {
      throw new Error(
        "That time slot is fully booked. Please pick another time or date."
      );
    }
    throw new Error(
      body?.error ||
        "Couldn't submit your booking. Please try again or call 087 766 5058."
    );
  }
}
