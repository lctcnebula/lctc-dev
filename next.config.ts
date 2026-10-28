import type { NextConfig } from "next";

// Front-end only: no API routes, no environment variables. Deploys to Vercel as-is.
const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  // Types of donations, Pricing and Get involved were folded into the donate page.
  async redirects() {
    return [
      { source: "/donations", destination: "/donate", permanent: true },
      { source: "/pricing", destination: "/donate", permanent: true },
      { source: "/get-involved", destination: "/donate#partner", permanent: true },
    ];
  },
};

export default nextConfig;
