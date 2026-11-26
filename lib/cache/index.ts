interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class HybridCache {
  private memoryCache = new Map<string, CacheEntry<unknown>>();
  private redisUrl?: string;
  private redisToken?: string;

  constructor() {
    this.redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    this.redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 60000).unref();
    }
  }

  public isRedisEnabled(): boolean {
    return Boolean(this.redisUrl && this.redisToken);
  }

  public get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  public async getAsync<T>(key: string): Promise<T | null> {
    // 1. Check L1 in-memory cache
    const local = this.get<T>(key);
    if (local !== null) return local;

    // 2. Check L2 Redis cache if configured
    if (this.redisUrl && this.redisToken) {
      try {
        const res = await fetch(`${this.redisUrl}/get/${encodeURIComponent(key)}`, {
          headers: { Authorization: `Bearer ${this.redisToken}` },
          cache: 'no-store',
        });
        if (res.ok) {
          const json = await res.json();
          if (json.result) {
            const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
            // Populate L1 cache for 60 seconds
            this.set(key, parsed, 60);
            return parsed as T;
          }
        }
      } catch {
        // Fall back gracefully to memory
      }
    }

    return null;
  }

  public set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.memoryCache.set(key, { value, expiresAt });

    // Background push to Redis if configured
    if (this.redisUrl && this.redisToken) {
      const serialized = JSON.stringify(value);
      fetch(`${this.redisUrl}/set/${encodeURIComponent(key)}?ex=${ttlSeconds}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.redisToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serialized),
      }).catch(() => {});
    }
  }

  public async setAsync<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.set(key, value, ttlSeconds);
  }

  public delete(key: string): void {
    this.memoryCache.delete(key);

    if (this.redisUrl && this.redisToken) {
      fetch(`${this.redisUrl}/del/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.redisToken}` },
      }).catch(() => {});
    }
  }

  public clear(): void {
    this.memoryCache.clear();
  }

  public size(): number {
    return this.memoryCache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiresAt) {
        this.memoryCache.delete(key);
      }
    }
  }
}

export const globalCache = new HybridCache();

// TTLs in seconds (can be overridden via process.env)
export const CACHE_TTL = {
  PROFILE: parseInt(process.env.CACHE_TTL_PROFILE || '600', 10), // 10 minutes
  POSTS: parseInt(process.env.CACHE_TTL_POSTS || '900', 10),     // 15 minutes
  REELS: parseInt(process.env.CACHE_TTL_REELS || '900', 10),     // 15 minutes
  STORIES: parseInt(process.env.CACHE_TTL_STORIES || '180', 10), // 3 minutes (short-lived)
  HIGHLIGHTS: parseInt(process.env.CACHE_TTL_HIGHLIGHTS || '900', 10), // 15 minutes
};
