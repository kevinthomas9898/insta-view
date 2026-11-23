interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  constructor() {
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 60000).unref();
    }
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  public set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

export const globalCache = new MemoryCache();

// TTLs in seconds (can be overridden via process.env)
export const CACHE_TTL = {
  PROFILE: parseInt(process.env.CACHE_TTL_PROFILE || '600', 10), // 10 minutes
  POSTS: parseInt(process.env.CACHE_TTL_POSTS || '900', 10),     // 15 minutes
  REELS: parseInt(process.env.CACHE_TTL_REELS || '900', 10),     // 15 minutes
  STORIES: parseInt(process.env.CACHE_TTL_STORIES || '180', 10), // 3 minutes (short-lived)
  HIGHLIGHTS: parseInt(process.env.CACHE_TTL_HIGHLIGHTS || '900', 10), // 15 minutes
};
