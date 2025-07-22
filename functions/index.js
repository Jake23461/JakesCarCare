/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
admin.initializeApp();

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
      (booking.message ? `Message: ${booking.message}\n` : '') +
      `\nFull details:\n${JSON.stringify(booking, null, 2)}`
  };
  await transporter.sendMail(mailOptions);

  // Send confirmation to customer if email is provided
  if (booking.email) {
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
        `We’ll be in touch soon to confirm the details and answer any questions.\n\n` +
        `If you need to change or cancel your booking, just text 0877665058.\n\n` +
        `Looking forward to making your car shine!\n\n` +
        `Best regards,\nJake’s Car Care Team`
    };
    await transporter.sendMail(customerMailOptions);
  }

  return null;
});
