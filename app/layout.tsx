import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { heroMedia } from "@/lib/site";
import "./globals.css";

const FLOWPOINT_TOKEN = "fp_site_jakescarcare_0a36a4fd88c3";
const FLOWPOINT_API = "https://hub.flowpointstudios.ie";

export const metadata: Metadata = {
  metadataBase: new URL("https://jakescarcare.ie"),
  title: "Mobile Car Valeting & Car Wash — Roscommon & Longford | Jake's Car Care",
  description:
    "Professional mobile car valeting and car wash across Roscommon and Longford. Full valet, interior clean, exterior car wash, and paint-safe detailing — we come to you. Call 087 766 5058.",
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Mobile Car Valeting & Car Wash — Roscommon & Longford | Jake's Car Care",
    description:
      "From road grime to showroom shine. Professional mobile car valeting and car wash across Roscommon and Longford.",
    type: "website",
    locale: "en_IE",
    url: "https://jakescarcare.ie",
    siteName: "Jake's Car Care",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Jake's Car Care — mobile valeting" }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-IE" className="h-full">
      <head>
        {/* Hero uses a raw <img>, so preload it for LCP */}
        <link rel="preload" as="image" href={heroMedia.mediaSrc} fetchPriority="high" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Script
          src={`${FLOWPOINT_API}/widget/track.js`}
          data-flowpoint-token={FLOWPOINT_TOKEN}
          data-api-base={FLOWPOINT_API}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
