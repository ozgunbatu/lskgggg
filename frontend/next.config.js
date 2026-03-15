/** @type {import('next').NextConfig} */

// IMPORTANT FOR VERCEL DEPLOYMENT:
// Set NEXT_PUBLIC_API_URL = https://lskgggg-production.up.railway.app in Vercel dashboard.
// This variable is baked into the build at compile time.
// Without it, the rewrite destination falls back to the hardcoded Railway URL below.
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||      // ← Vercel: set this env var
  process.env.BACKEND_URL ||              // ← Docker: auto-set
  "https://lskgggg-production.up.railway.app"; // ← hard fallback

const nextConfig = {
  output: "standalone",
  eslint:     { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  async rewrites() {
    return [{
      source: "/api/:path*",
      destination: `${BACKEND_URL}/:path*`,
    }];
  },

  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options",           value: "DENY" },
        { key: "X-Content-Type-Options",    value: "nosniff" },
        { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
      ],
    }];
  },
};

module.exports = nextConfig;
