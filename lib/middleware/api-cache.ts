// lib/middleware/api-cache.ts — In-Memory API Cache with TTL

interface CacheEntry<T = unknown> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

// Cleanup expired entries every 2 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache) {
      if (now > entry.expiresAt) cache.delete(key);
    }
  }, 2 * 60 * 1000);
}

export function cacheGet<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function cacheSet<T>(key: string, data: T, ttlSeconds: number = 60): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export function cacheInvalidate(key: string): void {
  cache.delete(key);
}

export function cacheInvalidatePattern(pattern: string): void {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

export function cacheClear(): void {
  cache.clear();
}

export function cacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}

// Helper: cache-or-fetch pattern
export async function cachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  const cached = cacheGet<T>(key);
  if (cached !== null) return cached;

  const data = await fetcher();
  cacheSet(key, data, ttlSeconds);
  return data;
}
