/** @type {import('next').NextConfig} */

// BACKEND PROXY CONFIGURATION
// This rewrites /api/* requests to the Railway backend.
// The URL is hardcoded here as the primary value.
// Override via BACKEND_URL env var in docker-compose, or 
// NEXT_PUBLIC_API_URL in Vercel (both evaluated at build time).
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_URL ||
  "https://lskgggg-production.up.railway.app";

console.log("[next.config.js] BACKEND_URL =", BACKEND_URL);

const nextConfig = {
  output: "standalone",
  eslint:     { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  async rewrites() {
    console.log("[rewrites] proxying /api/* →", BACKEND_URL);
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",        value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
