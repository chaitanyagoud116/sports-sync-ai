// lib/middleware/rate-limiter.ts — In-Memory Rate Limiter (Redis-upgradable)

interface RateEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateEntry>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,      // 60 requests per minute
};

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = `rl:${identifier}`;
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  const allowed = entry.count <= config.maxRequests;

  return { allowed, remaining, resetAt: entry.resetAt };
}

// Pre-configured rate limits for different endpoint types
export const RATE_LIMITS = {
  api: { windowMs: 60_000, maxRequests: 60 },         // General API: 60/min
  auth: { windowMs: 300_000, maxRequests: 10 },        // Auth: 10 per 5 minutes
  ai: { windowMs: 60_000, maxRequests: 10 },           // AI endpoints: 10/min
  divi: { windowMs: 60_000, maxRequests: 30 },         // DIVI chat: 30/min
  upload: { windowMs: 300_000, maxRequests: 20 },      // Uploads: 20 per 5 min
  admin: { windowMs: 60_000, maxRequests: 120 },       // Admin: 120/min
} as const;
