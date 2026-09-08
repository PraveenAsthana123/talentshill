import type { NextRequest } from 'next/server';

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private windowMs: number;
  private maxRequests: number;
  private cleanupTimer: ReturnType<typeof setInterval>;

  constructor(windowMs = 60_000, maxRequests = 5) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.cleanupTimer = setInterval(() => this.cleanup(), 5 * 60_000);

    // Allow garbage collection of the timer
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  check(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const entry = this.store.get(key);

    if (!entry) {
      this.store.set(key, { timestamps: [now] });
      return { allowed: true, remaining: this.maxRequests - 1 };
    }

    // Filter out timestamps outside the current window
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    if (entry.timestamps.length >= this.maxRequests) {
      const oldestInWindow = entry.timestamps[0];
      const retryAfter = Math.ceil((oldestInWindow + this.windowMs - now) / 1000);

      return {
        allowed: false,
        remaining: 0,
        retryAfter: Math.max(retryAfter, 1),
      };
    }

    entry.timestamps.push(now);

    return {
      allowed: true,
      remaining: this.maxRequests - entry.timestamps.length,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, entry] of this.store.entries()) {
      entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

      if (entry.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }
}

// Pre-configured instances
export const contactLimiter = new RateLimiter(60_000, 5);   // 5 per minute
export const surveyLimiter = new RateLimiter(60_000, 3);     // 3 per minute
export const authLimiter = new RateLimiter(300_000, 10);     // 10 per 5 min

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  return '127.0.0.1';
}
