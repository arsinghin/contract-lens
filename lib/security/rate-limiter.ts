/**
 * In-Memory Sliding Window Rate Limiter for Next.js API Routes
 * Protects against API key quota exhaustion and automated document flood attacks.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  intervalMs?: number; // Time window (default: 60,000ms = 1 minute)
  maxRequests?: number; // Allowed requests per window (default: 20)
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; resetInMs: number } {
  const intervalMs = options.intervalMs || 60 * 1000;
  const maxRequests = options.maxRequests || 20;

  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + intervalMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInMs: intervalMs,
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, record.resetTime - now),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetInMs: Math.max(0, record.resetTime - now),
  };
}
