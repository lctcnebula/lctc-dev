import type { NextConfig } from "next";

// Front-end only: no API routes, no environment variables. Deploys to Vercel as-is.
const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
};

export default nextConfig;
