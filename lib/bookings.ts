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
  adminCreated?: boolean;
  price?: string;
  completed?: boolean;
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
