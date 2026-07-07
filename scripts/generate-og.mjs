/**
 * Generates the optimized hero image and the OG share card from the master
 * hero photo. Run from the repo root:  node scripts/generate-og.mjs
 *
 * Outputs:
 *   public/images/hero-wash.jpg  — 1920w q78 hero (replaces Unsplash hot-link)
 *   public/og.jpg                — 1200×630 share card (photo + gradient + logo + text)
 */
import sharp from "sharp";

const SRC = "public/gallery/option 3.jpg"; // 6000×3376 master
const LOGO = "public/gallery/Logo.png";

// 1. Hero: downscale to 1920w, good quality, progressive
await sharp(SRC)
  .resize({ width: 1920 })
  .jpeg({ quality: 78, progressive: true, mozjpeg: true })
  .toFile("public/images/hero-wash.jpg");
console.log("wrote public/images/hero-wash.jpg");

// 2. OG card: 1200×630 cover crop + dark gradient + logo + strapline
const gradientAndText = Buffer.from(`
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="45%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.88)"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="60" y="520" font-family="Arial Black, Arial, sans-serif" font-size="56"
        font-weight="900" fill="#ffffff" letter-spacing="1">JAKE'S CAR CARE</text>
  <text x="60" y="575" font-family="Arial, sans-serif" font-size="30"
        fill="#e5e5e5">Mobile Valeting — Roscommon &amp; Longford · 087 766 5058</text>
</svg>`);

const logo = await sharp(LOGO).resize({ height: 110 }).png().toBuffer();

await sharp(SRC)
  .resize(1200, 630, { fit: "cover", position: "attention" })
  .composite([
    { input: gradientAndText, top: 0, left: 0 },
    { input: logo, top: 40, left: 60 },
  ])
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile("public/og.jpg");
console.log("wrote public/og.jpg");
