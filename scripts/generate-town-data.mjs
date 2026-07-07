/**
 * Generates lib/town-data.ts: real driving distance/time/fee from Strokestown
 * to each service-area town via the Routes API (same key as the Firebase
 * MAPS_API_KEY secret). Hand-written intros/villages live in TOWN_META below.
 *
 * Run:  MAPS_KEY="<key>" node scripts/generate-town-data.mjs
 * Re-run only if TRAVEL_CONFIG in functions/index.js changes.
 */
import { writeFileSync } from "node:fs";

const KEY = process.env.MAPS_KEY;
if (!KEY) throw new Error("Set MAPS_KEY");

const BASE = { lat: 53.7767, lng: -8.0983 }; // Strokestown
// Fee rules — mirror TRAVEL_CONFIG in functions/index.js
const FREE_MIN = 15, FREE_KM = 12, RATE = 1, ROUND = 5, MAX_KM = 45;

const TOWN_META = [
  {
    slug: "strokestown", name: "Strokestown", county: "Co. Roscommon",
    lat: 53.7767, lng: -8.0983,
    nearbyVillages: ["Tulsk", "Elphin", "Scramoge", "Kilglass", "Ruskey"],
    intro:
      "Strokestown is home base — Jake's Car Care operates from the town itself, so there's never a call-out fee here. Whether you're near the Park House end of town or out toward Kilglass, Strokestown bookings can often be fitted in around other jobs at short notice.",
  },
  {
    slug: "roscommon-town", name: "Roscommon Town", county: "Co. Roscommon",
    lat: 53.6333, lng: -8.1897,
    nearbyVillages: ["Four Mile House", "Ballymurray", "Knockcroghery", "Kilteevan"],
    intro:
      "Roscommon Town is Jake's busiest patch outside home — a straightforward run down the N61 most weekends. Estate driveways, workplace car parks near the town centre: wherever the car is parked, the van comes to it.",
  },
  {
    slug: "castlerea", name: "Castlerea", county: "Co. Roscommon",
    lat: 53.7681, lng: -8.4922,
    nearbyVillages: ["Ballintubber", "Ballymoe", "Loughglynn", "Frenchpark"],
    intro:
      "Castlerea sits about half an hour west of Strokestown, and Jake covers it — and the villages along the way — most weekends. Handy if you use the train: leave the car at home on Saturday morning and come back to it valeted.",
  },
  {
    slug: "boyle", name: "Boyle", county: "Co. Roscommon",
    lat: 53.9714, lng: -8.2958,
    nearbyVillages: ["Cootehall", "Knockvicar", "Croghan", "Ballyfarnon"],
    intro:
      "Boyle marks the northern edge of the regular run. Between Lough Key day trips and daily commuting, north Roscommon cars earn their grime — a weekend valet on your own driveway beats queueing at a wash bay in town.",
  },
  {
    slug: "carrick-on-shannon", name: "Carrick-on-Shannon", county: "Co. Leitrim",
    lat: 53.9469, lng: -8.09,
    nearbyVillages: ["Leitrim Village", "Drumsna", "Jamestown", "Cortober"],
    intro:
      "Apartment blocks and marina car parks don't make car care easy in Carrick-on-Shannon — which is exactly where a mobile valet earns its keep. Jake works right where you park; all he needs is access to an outdoor tap and a socket.",
  },
  {
    slug: "ballymahon", name: "Ballymahon", county: "Co. Longford",
    lat: 53.5647, lng: -7.7656,
    nearbyVillages: ["Tang", "Abbeyshrule", "Colehill", "Kenagh"],
    intro:
      "Ballymahon and the Center Parcs corridor make an easy southern run. South Longford customers usually book the car in for a weekend morning — the valet happens on the driveway while you get on with your Saturday.",
  },
  {
    slug: "edgeworthstown", name: "Edgeworthstown", county: "Co. Longford",
    lat: 53.6957, lng: -7.6089,
    nearbyVillages: ["Ardagh", "Ballinalee", "Abbeylara", "Granard"],
    intro:
      "Edgeworthstown's spot on the N4 and N55 means serious commuter mileage — and the road film that comes with it. Jake covers the town and the surrounding townlands at weekends, working on your own driveway or outside the office.",
  },
  {
    slug: "longford-town", name: "Longford Town", county: "Co. Longford",
    lat: 53.7276, lng: -7.7933,
    nearbyVillages: ["Newtownforbes", "Killashee", "Clondra", "Drumlish"],
    intro:
      "Longford Town is closer than most people guess — about 25 minutes from Strokestown door to door. Estates around the town, offices on the Dublin Road, apartments near the station: Jake valets wherever you can park, and the exact call-out fee appears the moment you enter your Eircode.",
  },
  {
    slug: "athlone", name: "Athlone", county: "Co. Westmeath",
    lat: 53.4239, lng: -7.9407,
    nearbyVillages: ["Glasson", "Ballykeeran", "Monksland", "Bealnamulla"],
    intro:
      "Athlone falls just outside the standard 45 km booking area, so online slots aren't offered — but for bigger jobs (a full valet, or two or three cars together) Jake will make the trip by arrangement.",
  },
  {
    slug: "loughrea", name: "Loughrea", county: "Co. Galway",
    lat: 53.1986, lng: -8.5686,
    nearbyVillages: ["Craughwell", "Kilrickle", "Bullaun"],
    intro:
      "Loughrea is well beyond the everyday run from Strokestown, but for full-day work — multiple cars, a small fleet, or a serious detail — Jake will travel by arrangement. Message ahead with what you need and he'll quote the trip.",
  },
];

async function road(dest) {
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
  if (!res.ok) throw new Error(`Routes API ${res.status}`);
  const r = (await res.json()).routes?.[0];
  return { km: Math.round(r.distanceMeters / 100) / 10, min: Math.round(parseInt(r.duration, 10) / 60) };
}

const rows = [];
for (const meta of TOWN_META) {
  const { km, min } =
    meta.slug === "strokestown" ? { km: 0, min: 0 } : await road(meta);
  const inServiceArea = km <= MAX_KM;
  const freeZone = min <= FREE_MIN || km <= FREE_KM;
  const calloutFee =
    !inServiceArea || freeZone ? 0 : Math.ceil(((km - FREE_KM) * RATE) / ROUND) * ROUND;
  rows.push({ ...meta, drivingKm: km, drivingMin: min, calloutFee, inServiceArea, freeZone });
  console.log(`${meta.name}: ${km} km / ${min} min → ${inServiceArea ? (freeZone ? "free zone" : `€${calloutFee}`) : "OUT OF AREA"}`);
}

const body = rows
  .map(
    (t) => `  {
    slug: ${JSON.stringify(t.slug)},
    name: ${JSON.stringify(t.name)},
    county: ${JSON.stringify(t.county)},
    lat: ${t.lat},
    lng: ${t.lng},
    drivingKm: ${t.drivingKm},
    drivingMin: ${t.drivingMin},
    calloutFee: ${t.calloutFee},
    inServiceArea: ${t.inServiceArea},
    freeZone: ${t.freeZone},
    nearbyVillages: ${JSON.stringify(t.nearbyVillages)},
    intro:
      ${JSON.stringify(t.intro)},
  },`
  )
  .join("\n");

writeFileSync(
  "lib/town-data.ts",
  `/**
 * Per-town driving facts from Strokestown — generated by
 * scripts/generate-town-data.mjs (Routes API). Regenerate if the fee rules in
 * functions/index.js TRAVEL_CONFIG change. Intros/villages are hand-written.
 */
export type TownData = {
  slug: string;
  name: string;
  county: string;
  lat: number;
  lng: number;
  drivingKm: number;
  drivingMin: number;
  /** € call-out fee (0 in the free zone or out of area) */
  calloutFee: number;
  /** Within the 45 km driving cutoff — bookable online */
  inServiceArea: boolean;
  freeZone: boolean;
  nearbyVillages: string[];
  intro: string;
};

export const towns: TownData[] = [
${body}
];

export const inAreaTowns = towns.filter((t) => t.inServiceArea);
export const byArrangementTowns = towns.filter((t) => !t.inServiceArea);
`
);
console.log("wrote lib/town-data.ts");
