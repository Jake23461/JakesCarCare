import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

// ─── Types ───────────────────────────────────────────────────────────────────

/** Result of the calculateTravel Cloud Function (fee rules live server-side). */
export interface TravelQuote {
  /** Normalised Eircode, e.g. "F42 AB12" */
  eircode: string;
  /** Driving distance from Strokestown in km */
  distanceKm: number;
  /** Driving time from Strokestown in minutes */
  durationMin: number;
  /** Call-out fee in euro (0 when inside the free zone) */
  calloutFee: number;
  /** True when within the free travel zone (~15 min drive) */
  freeZone: boolean;
  /** True when beyond the service-area cutoff — booking is blocked */
  tooFar: boolean;
  /** The cutoff distance in km, for display */
  maxKm: number;
  /** The free-zone radius in km, for drawing the map circle */
  freeKm?: number;
  /** Strokestown base coordinates (for the map) */
  origin?: { lat: number; lng: number } | null;
  /** Customer's geocoded coordinates (for the map) */
  dest?: { lat: number; lng: number } | null;
  /** Encoded driving-route polyline from Strokestown to the customer */
  polyline?: string | null;
  /** True when this quote came from the local dev estimate, not Google */
  estimated?: boolean;
}

// ─── Eircode validation ───────────────────────────────────────────────────────

/**
 * Routing key (e.g. F42, or Dublin's D6W) + 4-character unique identifier.
 * Deliberately looser than the official Eircode alphabet: anything shaped like
 * an Eircode is sent to the server, whose strict validation returns a friendly
 * "doesn't look valid" the customer can actually see — a strict client check
 * would just silently do nothing while they wonder why.
 */
export const EIRCODE_RE = /^(D6W|[A-Z]\d{2})\s?[0-9A-Z]{4}$/i;

export function isValidEircode(value: string): boolean {
  return EIRCODE_RE.test(value.trim());
}

// ─── Quote fetch ──────────────────────────────────────────────────────────────

const calculateTravel = httpsCallable<{ eircode: string }, TravelQuote>(
  functions,
  "calculateTravel"
);

export async function getTravelQuote(eircode: string): Promise<TravelQuote> {
  try {
    const result = await calculateTravel({ eircode: eircode.trim() });
    return result.data;
  } catch (err) {
    // On localhost only: if the Cloud Function isn't reachable (e.g. not yet
    // deployed), fall back to a rough routing-key estimate so the feature can
    // be previewed. Production always uses the real function.
    if (isLocalhost()) {
      const mock = mockQuote(eircode);
      if (mock) return mock;
    }
    throw err;
  }
}

// ─── Dev-only estimate (never used in production) ────────────────────────────
// Straight-line distance from Strokestown to the routing-key's town centre,
// scaled by a road-winding factor. Fee rules mirror TRAVEL_CONFIG in
// functions/index.js. Unknown routing keys fall through to the error state.

const STROKESTOWN = { lat: 53.7767, lng: -8.0983 };

const ROUTING_KEY_COORDS: Record<string, { lat: number; lng: number }> = {
  F42: { lat: 53.72, lng: -8.15 }, // Strokestown/Tulsk side of the F42 area
  F45: { lat: 53.7681, lng: -8.4922 }, // Castlerea
  F52: { lat: 53.9714, lng: -8.2958 }, // Boyle
  N39: { lat: 53.7276, lng: -7.7933 }, // Longford
  N41: { lat: 53.9469, lng: -8.09 }, // Carrick-on-Shannon
  N37: { lat: 53.4239, lng: -7.9407 }, // Athlone
  F91: { lat: 54.2766, lng: -8.4761 }, // Sligo
  H91: { lat: 53.2707, lng: -9.0568 }, // Galway
  F31: { lat: 53.8578, lng: -9.2966 }, // Castlebar
  N91: { lat: 53.5259, lng: -7.3382 }, // Mullingar
};

function isLocalhost(): boolean {
  return (
    typeof window !== "undefined" &&
    /^(localhost|127\.|192\.168\.)/.test(window.location.hostname)
  );
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function mockQuote(eircode: string): TravelQuote | null {
  const raw = eircode.trim().toUpperCase().replace(/\s+/g, "");
  const key = raw.slice(0, 3);
  const coords = ROUTING_KEY_COORDS[key];
  if (!coords) return null;

  const distanceKm = Math.round(haversineKm(STROKESTOWN, coords) * 1.3 * 10) / 10;
  const durationMin = Math.round((distanceKm / 60) * 60); // ~60 km/h average
  const maxKm = 45;
  const tooFar = distanceKm > maxKm;
  const freeZone = !tooFar && (durationMin <= 15 || distanceKm <= 12);
  const calloutFee =
    tooFar || freeZone ? 0 : Math.ceil((distanceKm - 12) / 5) * 5;

  return {
    eircode: `${raw.slice(0, 3)} ${raw.slice(3)}`,
    distanceKm,
    durationMin,
    calloutFee,
    freeZone,
    tooFar,
    maxKm,
    freeKm: 12,
    origin: { lat: STROKESTOWN.lat, lng: STROKESTOWN.lng },
    dest: { lat: coords.lat, lng: coords.lng },
    polyline: null, // straight-line fallback is drawn when no route exists
    estimated: true,
  };
}
