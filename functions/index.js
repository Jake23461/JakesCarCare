/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
admin.initializeApp();

// Google Maps API key — set with: firebase functions:secrets:set MAPS_API_KEY
const mapsApiKey = defineSecret('MAPS_API_KEY');

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
// setGlobalOptions({ maxInstances: 10 }); // This line is removed as per the edit hint.

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// ─── Travel / call-out fee ───────────────────────────────────────────────────
// Jake travels from Strokestown. Within ~15 min drive (or under 12 km) there's
// no call-out fee. Beyond that it's €1 per km past the free 12 km allowance,
// rounded up to the nearest €5. Past maxKm the booking form blocks entirely.
// Tweak the numbers here, then redeploy: firebase deploy --only functions
const TRAVEL_CONFIG = {
  base: { latitude: 53.7767, longitude: -8.0983 }, // Strokestown, Co. Roscommon
  freeDriveMinutes: 15,
  freeKm: 12,
  ratePerKm: 1,
  roundFeeToNearest: 5,
  maxKm: 45,
};

const EIRCODE_RE = /^(D6W|[AC-FHKNPRTV-Y]\d{2})\s?[0-9AC-FHKNPRTV-Y]{4}$/i;

exports.calculateTravel = onCall(
  { region: 'europe-west1', secrets: [mapsApiKey], cors: true, maxInstances: 5 },
  async (request) => {
    const raw = String(request.data?.eircode ?? '').trim().toUpperCase().replace(/\s+/g, '');
    if (!EIRCODE_RE.test(raw)) {
      throw new HttpsError('invalid-argument', "That doesn't look like a valid Eircode.");
    }
    const eircode = `${raw.slice(0, 3)} ${raw.slice(3)}`;

    const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': mapsApiKey.value(),
        'X-Goog-FieldMask':
          'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,routes.legs.endLocation',
      },
      body: JSON.stringify({
        origin: { location: { latLng: TRAVEL_CONFIG.base } },
        destination: { address: `${eircode}, Ireland` },
        travelMode: 'DRIVE',
        units: 'METRIC',
      }),
    });

    const body = res.ok ? await res.json() : null;
    const route = body?.routes?.[0];
    if (!route?.distanceMeters || !route?.duration) {
      throw new HttpsError('not-found', "We couldn't locate that Eircode — please double-check it.");
    }

    const distanceKm = Math.round(route.distanceMeters / 100) / 10;
    const durationMin = Math.round(parseInt(route.duration, 10) / 60);

    const cfg = TRAVEL_CONFIG;
    const tooFar = distanceKm > cfg.maxKm;
    const freeZone = !tooFar && (durationMin <= cfg.freeDriveMinutes || distanceKm <= cfg.freeKm);
    const calloutFee = tooFar || freeZone
      ? 0
      : Math.ceil(((distanceKm - cfg.freeKm) * cfg.ratePerKm) / cfg.roundFeeToNearest) * cfg.roundFeeToNearest;

    // Route geometry for the booking-form map
    const end = route.legs?.[0]?.endLocation?.latLng;
    const origin = { lat: cfg.base.latitude, lng: cfg.base.longitude };
    const dest = end ? { lat: end.latitude, lng: end.longitude } : null;
    const polyline = route.polyline?.encodedPolyline ?? null;

    return {
      eircode,
      distanceKm,
      durationMin,
      calloutFee,
      freeZone,
      tooFar,
      maxKm: cfg.maxKm,
      freeKm: cfg.freeKm,
      origin,
      dest,
      polyline,
    };
  }
);

// Configure your email transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jakehanrahan13@gmail.com',
    pass: 'iezylxpvthoxpmhw' // App password, no spaces
  }
});

exports.notifyOnBooking = onDocumentCreated('bookings/{bookingId}', async (event) => {
  const booking = event.data.data();
  // Format the booking date if available
  let bookingDate = 'No date provided';
  if (booking.date) {
    try {
      bookingDate = booking.date.toDate ? booking.date.toDate().toLocaleString() : new Date(booking.date).toLocaleString();
    } catch (e) {
      bookingDate = booking.date.toString();
    }
  }

  // Send admin notification
  const mailOptions = {
    from: 'jakehanrahan13@gmail.com',
    to: 'jakehanrahan13@gmail.com',
    subject: 'New Booking Received!',
    text:
      `A new booking was made!\n\n` +
      `Name: ${booking.name || 'N/A'}\n` +
      `Phone: ${booking.phone || 'N/A'}\n` +
      `Email: ${booking.email || 'N/A'}\n` +
      `Service: ${booking.service || 'N/A'}\n` +
      `Date: ${booking.date || 'N/A'}\n` +
      `Time: ${booking.time || 'N/A'}\n` +
      `Eircode: ${booking.eircode || 'N/A'}\n` +
      (typeof booking.travelDistanceKm === 'number'
        ? `Distance: ${booking.travelDistanceKm} km (~${booking.travelMinutes || '?'} min from Strokestown)\n`
        : '') +
      (typeof booking.calloutFee === 'number'
        ? `Call-out fee: ${booking.calloutFee > 0 ? '€' + booking.calloutFee : 'None (free zone)'}\n`
        : '') +
      (booking.message ? `Message: ${booking.message}\n` : '') +
      `\nFull details:\n${JSON.stringify(booking, null, 2)}`
  };
  await transporter.sendMail(mailOptions);

  // Send confirmation to customer if email is provided.
  // Skip when source === 'flowpoint' — Flowpoint sends its own customer email,
  // so we'd double-up if a future webhook bridge mirrors those bookings here.
  if (booking.email && booking.source !== 'flowpoint') {
    // Extract details for a friendly message
    const customerName = booking.name || 'Customer';
    const service = booking.service || 'your selected service';
    const date = booking.date || 'your chosen date';
    const time = booking.time || 'your chosen time';
    const eircode = booking.eircode || 'your Eircode';
    const customerMailOptions = {
      from: 'jakehanrahan13@gmail.com',
      to: booking.email,
      subject: "Your Booking with Jake’s Car Care is Confirmed!",
      text:
        `Hi ${customerName},\n\n` +
        `Thank you for booking with Jake’s Car Care!\n\n` +
        `We’ve received your booking for ${service} on ${date} at ${time} (Eircode: ${eircode}).\n` +
        (typeof booking.calloutFee === 'number' && booking.calloutFee > 0
          ? `A call-out fee of €${booking.calloutFee} applies for your area and will be added to your service price.\n`
          : '') +
        `We’ll be in touch soon to confirm the details and answer any questions.\n\n` +
        `If you need to change or cancel your booking, just text 0877665058.\n\n` +
        `Looking forward to making your car shine!\n\n` +
        `Best regards,\nJake’s Car Care Team`
    };
    await transporter.sendMail(customerMailOptions);
  }

  return null;
});
