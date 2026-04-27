import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jake's Car Care | Mobile Valeting — Roscommon & Longford",
  description:
    "Professional mobile car valeting and detailing across Roscommon and Longford. Full valet, interior clean, exterior wash, and paint-safe detailing. Call 087 766 5058.",
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
    title: "Jake's Car Care | Mobile Valeting — Roscommon & Longford",
    description:
      "From road grime to showroom shine. Professional mobile car valeting across Roscommon and Longford.",
    type: "website",
    locale: "en_IE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
