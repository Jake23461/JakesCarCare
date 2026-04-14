import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  turbopack: {
    root: __dirname,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      // Unsplash — stock placeholder images used during development
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Picsum — general-purpose development placeholders
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      // Firebase Storage
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
