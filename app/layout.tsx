import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jake's Car Care | Mobile Valeting — Roscommon & Longford",
  description:
    "Professional mobile car valeting and detailing across Roscommon and Longford. Full valet, interior clean, exterior wash, and paint-safe detailing. Call 087 766 5058.",
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
