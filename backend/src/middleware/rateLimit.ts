import type { Request, Response, NextFunction } from "express";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Cleanup old buckets every 10 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 10 * 60 * 1000);

function hit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    const next = { count: 1, resetAt: now + windowMs };
    buckets.set(key, next);
    return { allowed: true, remaining: Math.max(0, limit - 1), resetAt: next.resetAt };
  }
  current.count += 1;
  return { allowed: current.count <= limit, remaining: Math.max(0, limit - current.count), resetAt: current.resetAt };
}

// Extract identifier: prefer JWT subject/user_id over IP to avoid penalizing shared IPs
function getIdentifier(req: Request): string {
  // Try to get user from auth header (parsed by auth middleware later)
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    try {
      // Decode payload without verification (just for rate limit key)
      const payload = JSON.parse(Buffer.from(auth.split(".")[1], "base64url").toString());
      if (payload?.sub || payload?.userId) return `u:${payload.sub || payload.userId}`;
    } catch {}
  }
  return `ip:${req.ip || "unknown"}`;
}

export function makeRateLimit(opts: { namespace: string; limit: number; windowMs: number }) {
  return function rateLimit(req: Request, res: Response, next: NextFunction) {
    const id = getIdentifier(req);
    const key = `${opts.namespace}:${id}`;
    const result = hit(key, opts.limit, opts.windowMs);
    res.setHeader("x-ratelimit-limit", String(opts.limit));
    res.setHeader("x-ratelimit-remaining", String(result.remaining));
    res.setHeader("x-ratelimit-reset", String(Math.ceil(result.resetAt / 1000)));
    if (!result.allowed) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
    next();
  };
}

// Auth: strict (brute force protection)
export const authRateLimit = makeRateLimit({ namespace: "auth", limit: 20, windowMs: 15 * 60 * 1000 });

// Complaints public portal: per IP, generous for normal use
export const complaintRateLimit = makeRateLimit({ namespace: "complaints", limit: 30, windowMs: 10 * 60 * 1000 });

// AI: per user, cost-aware
export const aiRateLimit = makeRateLimit({ namespace: "ai", limit: 50, windowMs: 15 * 60 * 1000 });
