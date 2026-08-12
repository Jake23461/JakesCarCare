# Travel Distance & Call-Out Fee — Setup

The booking form now live-checks the customer's Eircode against your base in
**Strokestown**, shows the driving distance/time, adds a **call-out fee** on top
of the service price, and **blocks bookings beyond 45 km** (with a WhatsApp
fallback so far-away customers can still reach you).

## How the fee works

All rules live in one place: `TRAVEL_CONFIG` in [functions/index.js](functions/index.js).

| Rule | Value | Meaning |
|---|---|---|
| Free zone | ≤ 15 min drive (or ≤ 12 km) | No call-out fee |
| Rate | €0.50 per km beyond the free 12 km | e.g. 20 km away → €4 → rounded to €5 |
| Rounding | Up to the nearest €5 | Fees read clean: €5, €10, €15... |
| Cap | €20 maximum | No fee ever exceeds €20 inside the area |
| Cutoff | 45 km driving distance | Form blocks booking, offers WhatsApp instead |

Examples: 20 km / 22 min → **+€5** · 30 km / 33 min → **+€10** · 44 km → **+€20 (cap)** · 50 km → **blocked**.
(Fees halved + capped in Aug 2026 after a booking drop-off — was €1/km uncapped.)

To change any number, edit `TRAVEL_CONFIG` and redeploy functions (step 4 below).

### The map zones

The booking-form map draws the free zone and the 45 km boundary as **real
driving-distance shapes** (traced road-by-road), baked into
[lib/travel-zones.ts](lib/travel-zones.ts). If you change the fee rules above,
regenerate them so the map matches:

```bash
MAPS_KEY="<your Routes API key>" node scripts/generate-travel-zones.mjs lib/travel-zones.ts
npm run deploy
```

(Edit the constants at the top of `scripts/generate-travel-zones.mjs` to match
your new `TRAVEL_CONFIG` first. ~220 Routes API calls, well within free tier.)

## One-time setup (≈5 minutes)

The distance check uses Google's **Routes API** through your existing Firebase
project (`valeting-1d9a7`), so there's no new account — just enable the API and
give the function a key.

1. **Enable the Routes API**
   Go to <https://console.cloud.google.com/apis/library/routes.googleapis.com?project=valeting-1d9a7>
   and click **Enable**.

2. **Create an API key**
   <https://console.cloud.google.com/apis/credentials?project=valeting-1d9a7>
   → **Create credentials → API key**. Then click the new key and under
   **API restrictions** choose *Restrict key* → tick **Routes API** only. Copy the key.

3. **Store the key as a secret** (from the repo root):
   ```bash
   firebase functions:secrets:set MAPS_API_KEY
   # paste the key when prompted
   ```

4. **Deploy the function** (also redeploy after any fee tweak):
   ```bash
   firebase deploy --only functions
   ```

5. **Build & deploy the site** (GitHub Pages, same as always):
   ```bash
   npm run deploy
   ```

## Cost

Routes API calls are only made when someone types a complete, valid Eircode
(one call per lookup). Google's free tier covers thousands of calls per month —
at this site's traffic the cost is €0.

## How it reaches FlowPoint Hub

Bookings on this site are submitted to FlowPoint Hub. The travel result is
appended to the booking **notes**, e.g.:

> Travel: 28.4 km (~32 min) from Strokestown — call-out fee €20

so you see the distance and fee on every booking in the Hub. The normalised
Eircode also lands in the booking's Eircode custom field.

If the lookup fails (typo, Google hiccup), the customer can still book — the
notes say the distance check was unavailable so you know to confirm the fee.

## Local preview (before the API key is set up)

On `localhost` only, if the Cloud Function isn't reachable the form falls back
to a rough estimate based on the Eircode routing key (marked "(estimate)" in
the UI and notes). Production never uses the estimate — it always calls the
real function.
