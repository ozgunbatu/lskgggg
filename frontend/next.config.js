/** @type {import('next').NextConfig} */

// BACKEND_URL: server-side only, used for Next.js rewrites
// Must point to your Railway backend URL
const BACKEND_URL = process.env.BACKEND_URL || 
                    process.env.NEXT_PUBLIC_API_URL ||  // fallback for compat
                    "http://backend:4000";               // docker-compose

const nextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // All /api/* requests proxied to backend server-side
  // Browser never calls backend directly → no CORS, no hardcoded URLs
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
