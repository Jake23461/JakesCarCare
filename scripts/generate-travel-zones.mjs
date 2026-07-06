/**
 * Traces the real driving-distance service zones around Strokestown by
 * sampling the Routes API along 36 bearings. Outputs lib/travel-zones.ts.
 *
 * Green zone boundary: where (duration <= 15 min OR distance <= 12 km) stops holding.
 * Red boundary: where driving distance hits 45 km.
 */
const KEY = process.env.MAPS_KEY;
const BASE = { lat: 53.7767, lng: -8.0983 };
const MAX_KM = 45;
const FREE_KM = 12;
const FREE_MIN = 15;
const BEARINGS = Array.from({ length: 36 }, (_, i) => i * 10);

const toRad = (d) => (d * Math.PI) / 180;
const toDeg = (r) => (r * 180) / Math.PI;

/** Destination point given start, bearing (deg), straight-line distance (km). */
function destPoint(lat, lng, bearing, distKm) {
  const R = 6371;
  const δ = distKm / R;
  const θ = toRad(bearing);
  const φ1 = toRad(lat);
  const λ1 = toRad(lng);
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
  return { lat: toDeg(φ2), lng: toDeg(λ2) };
}

let calls = 0;
async function road(dest) {
  calls++;
  const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
    },
    body: JSON.stringify({
      origin: { location: { latLng: { latitude: BASE.lat, longitude: BASE.lng } } },
      destination: { location: { latLng: { latitude: dest.lat, longitude: dest.lng } } },
      travelMode: "DRIVE",
      units: "METRIC",
    }),
  });
  if (!res.ok) return null;
  const body = await res.json();
  const r = body.routes?.[0];
  if (!r?.distanceMeters) return null;
  return { km: r.distanceMeters / 1000, min: parseInt(r.duration, 10) / 60 };
}

/** Straight-line radius (km) along a bearing where road distance ≈ targetKm. */
async function traceDistance(bearing, targetKm) {
  let s = targetKm / 1.3;
  let bestS = s;
  for (let i = 0; i < 5; i++) {
    const r = await road(destPoint(BASE.lat, BASE.lng, bearing, s));
    if (!r) { s *= 0.85; continue; }
    bestS = s;
    if (Math.abs(r.km - targetKm) < 1.2) break;
    s = Math.max(3, Math.min(targetKm - 0.5, s * (targetKm / r.km)));
  }
  return destPoint(BASE.lat, BASE.lng, bearing, bestS);
}

/** Straight-line radius along a bearing where the free-zone condition stops holding. */
async function traceFreeZone(bearing) {
  let s = FREE_KM / 1.3;
  let bestS = s;
  for (let i = 0; i < 5; i++) {
    const r = await road(destPoint(BASE.lat, BASE.lng, bearing, s));
    if (!r) { s *= 0.85; continue; }
    bestS = s;
    // Boundary of (km <= 12 OR min <= 15): the more generous criterion wins
    const target = Math.max(s * (FREE_KM / r.km), s * (FREE_MIN / r.min));
    if (Math.abs(target - s) < 0.35) break;
    s = Math.max(1.5, Math.min(25, target));
  }
  return destPoint(BASE.lat, BASE.lng, bearing, bestS);
}

async function pool(items, worker, size = 6) {
  const results = new Array(items.length);
  let idx = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await worker(items[i]);
    }
  }));
  return results;
}

console.log("Tracing service boundary (45 km driving)...");
const boundary = await pool(BEARINGS, (b) => traceDistance(b, MAX_KM));
console.log("Tracing free zone (15 min / 12 km driving)...");
const freeZone = await pool(BEARINGS, (b) => traceFreeZone(b));
console.log(`Done — ${calls} API calls.`);

const fmt = (pts) => pts.map((p) => `  [${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}],`).join("\n");
const out = `/**
 * Real driving-distance zones around Strokestown, traced via the Routes API
 * (36 bearings, one-off generation). Regenerate with scripts if TRAVEL_CONFIG
 * in functions/index.js changes: see TRAVEL_FEE_SETUP.md.
 *
 * FREE_ZONE_POLYGON  — within ~15 min drive (or 12 km) of Strokestown: no fee.
 * SERVICE_BOUNDARY_POLYGON — 45 km driving distance: bookings blocked beyond.
 */
export const FREE_ZONE_POLYGON: [number, number][] = [
${fmt(freeZone)}
];

export const SERVICE_BOUNDARY_POLYGON: [number, number][] = [
${fmt(boundary)}
];
`;

import { writeFileSync } from "node:fs";
writeFileSync(process.argv[2] ?? "travel-zones.ts", out);
console.log("Wrote", process.argv[2] ?? "travel-zones.ts");
