// Sliding-window rate limiter with memory & optional Upstash Redis adapter
interface RateLimitRecord {
  timestamps: number[];
}

export class RateLimiter {
  private records = new Map<string, RateLimitRecord>();
  private windowMs: number;
  private maxRequests: number;
  private redisUrl?: string;
  private redisToken?: string;

  constructor(windowMs: number = 60000, maxRequests: number = 30) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    this.redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

    // Periodic cleanup every 2 minutes
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 120000).unref();
    }
  }

  public isRedisEnabled(): boolean {
    return Boolean(this.redisUrl && this.redisToken);
  }

  public check(identifier: string): { allowed: boolean; remaining: number; resetMs: number } {
    const now = Date.now();
    let record = this.records.get(identifier);

    if (!record) {
      record = { timestamps: [] };
      this.records.set(identifier, record);
    }

    // Filter out timestamps outside the window
    const windowStart = now - this.windowMs;
    record.timestamps = record.timestamps.filter((t) => t > windowStart);

    if (record.timestamps.length >= this.maxRequests) {
      const oldest = record.timestamps[0];
      const resetMs = Math.max(0, oldest + this.windowMs - now);
      return { allowed: false, remaining: 0, resetMs };
    }

    record.timestamps.push(now);
    return {
      allowed: true,
      remaining: this.maxRequests - record.timestamps.length,
      resetMs: this.windowMs,
    };
  }

  public async checkAsync(identifier: string): Promise<{ allowed: boolean; remaining: number; resetMs: number }> {
    if (this.redisUrl && this.redisToken) {
      try {
        const key = `ratelimit:${identifier}`;
        const windowSec = Math.ceil(this.windowMs / 1000);
        const res = await fetch(`${this.redisUrl}/pipeline`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.redisToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([
            ['INCR', key],
            ['EXPIRE', key, windowSec],
          ]),
        });

        if (res.ok) {
          const json = await res.json();
          const currentCount = json[0]?.result || 1;
          if (currentCount > this.maxRequests) {
            return { allowed: false, remaining: 0, resetMs: this.windowMs };
          }
          return {
            allowed: true,
            remaining: Math.max(0, this.maxRequests - currentCount),
            resetMs: this.windowMs,
          };
        }
      } catch {
        // Fall back to memory on Redis network failure
      }
    }

    return this.check(identifier);
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    for (const [key, record] of this.records.entries()) {
      record.timestamps = record.timestamps.filter((t) => t > windowStart);
      if (record.timestamps.length === 0) {
        this.records.delete(key);
      }
    }
  }
}

// Global singleton rate limiter instance
export const globalRateLimiter = new RateLimiter(60000, 30);
