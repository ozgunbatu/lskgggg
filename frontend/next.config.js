/** @type {import('next').NextConfig} */

// Backend URL for server-side API proxy (Next.js rewrites)
// Priority: BACKEND_URL env var → NEXT_PUBLIC_API_URL → hardcoded Railway URL
// Set BACKEND_URL in Vercel dashboard to override
const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://lskgggg-production.up.railway.app"; // your Railway backend

const nextConfig = {
  output: "standalone",
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Proxy /api/* to backend — browser never calls backend directly
  async rewrites() {
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
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
