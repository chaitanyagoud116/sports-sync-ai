// lib/middleware/rate-limit.ts
import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

// In-memory store for rate limiting (fallback when Redis is not available)
// Key: "IP:Route", Value: { count: number, resetTime: number }
const store = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(req: NextRequest, config: RateLimitConfig): NextResponse | null {
  // In Next.js App Router middleware, IP can be extracted from headers
  const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
  const path = req.nextUrl.pathname;
  const key = `${ip}:${path}`;
  const now = Date.now();

  const record = store.get(key);

  if (!record) {
    store.set(key, { count: 1, resetTime: now + config.windowMs });
    return null; // Allowed
  }

  if (now > record.resetTime) {
    // Window expired, reset
    store.set(key, { count: 1, resetTime: now + config.windowMs });
    return null; // Allowed
  }

  if (record.count >= config.limit) {
    // Rate limit exceeded
    return NextResponse.json(
      { error: "Too many requests, please try again later." },
      { status: 429, headers: { "Retry-After": Math.ceil((record.resetTime - now) / 1000).toString() } }
    );
  }

  record.count++;
  store.set(key, record);
  return null; // Allowed
}

// Helper to clean up memory store periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
}, 60000); // Clean up every minute
