/**
 * Regenerates the full favicon set as the DARK brand version: the car mark
 * (cropped from the logo, text dropped — unreadable at favicon size) centred
 * on the site's dark background with rounded corners.
 *
 * Run from repo root:  node scripts/generate-favicons.mjs
 */
import sharp from "sharp";
import pngToIco from "png-to-ico";
import { writeFileSync } from "node:fs";

const LOGO = "public/gallery/Logo.png"; // 296×250, transparent
const BG = "#0a0a0a";

// Car + sunburst live in the top portion; the two text lines start ~72% down.
// (extract and trim must be separate pipelines — sharp trims before extracting)
const cropped = await sharp(LOGO)
  .extract({ left: 10, top: 15, width: 276, height: 165 })
  .png()
  .toBuffer();
const mark = await sharp(cropped).trim().png().toBuffer();

async function icon(size, out, padRatio = 0.14, radiusRatio = 0.18) {
  const pad = Math.round(size * padRatio);
  const inner = size - pad * 2;
  const resized = await sharp(mark)
    .resize(inner, inner, { fit: "inside" })
    .png()
    .toBuffer();
  const meta = await sharp(resized).metadata();
  const radius = Math.round(size * radiusRatio);
  const bg = Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${BG}"/></svg>`
  );
  await sharp(bg)
    .composite([
      {
        input: resized,
        top: Math.round((size - meta.height) / 2),
        left: Math.round((size - meta.width) / 2),
      },
    ])
    .png()
    .toFile(out);
  console.log("wrote", out);
}

await icon(16, "public/favicon-16x16.png", 0.06, 0.19);
await icon(32, "public/favicon-32x32.png", 0.09, 0.19);
await icon(48, "public/favicon-48x48.png", 0.1, 0.19);
await icon(180, "public/apple-touch-icon.png", 0.16, 0); // iOS rounds itself
await icon(192, "public/android-chrome-192x192.png", 0.16, 0.18);
await icon(512, "public/android-chrome-512x512.png", 0.16, 0.18);

writeFileSync(
  "public/favicon.ico",
  await pngToIco([
    "public/favicon-16x16.png",
    "public/favicon-32x32.png",
    "public/favicon-48x48.png",
  ])
);
console.log("wrote public/favicon.ico");
