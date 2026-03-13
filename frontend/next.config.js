/** @type {import('next').NextConfig} */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 
                    process.env.BACKEND_URL || 
                    "http://backend:4000";  // docker-compose service name

const nextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Proxy /api/* to backend — works without CORS, no env var at runtime needed
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },

  // Security headers
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
