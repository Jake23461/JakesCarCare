import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Canonical URL shape is /path/ — GitHub Pages serves folder/index.html
  trailingSlash: true,
  turbopack: {
    root: __dirname,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      // Firebase Storage
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
