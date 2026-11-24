/**
 * Universal ScraperAPI HTTP Interceptor & Token Pool
 * 
 * Takes tokens STRICTLY from environment variables (process.env.SCRAPERAPI_TOKENS or SCRAPERAPI_TOKEN).
 * ZERO keys are hardcoded in code.
 * 
 * Features:
 * - Automatically splits comma, space, semicolon, or newline-separated keys from env
 * - Injects the single clean `Authorization: Bearer <token>` header dynamically
 * - Rotates keys round-robin across requests
 * - If a key hits rate limits (429) or quota limits (402), it automatically fails over to the next key
 * - All endpoints (profile, stories, highlights, posts, reels) use this single interceptor
 */

import { InstagramError } from './errors';
import { log } from '@/lib/utils/logger';

interface TokenState {
  token: string;
  cooldownUntil: number;
  failureCount: number;
}

class TokenInterceptorManager {
  private static instance: TokenInterceptorManager;
  private tokens: TokenState[] = [];
  private currentIndex = 0;

  private constructor() {
    this.refreshTokens();
  }

  public static getInstance(): TokenInterceptorManager {
    if (!TokenInterceptorManager.instance) {
      TokenInterceptorManager.instance = new TokenInterceptorManager();
    }
    return TokenInterceptorManager.instance;
  }

  public refreshTokens() {
    const rawTokens = [
      process.env.SCRAPERAPI_TOKENS || '',
      process.env.SCRAPERAPI_TOKEN || '',
    ].join(',');

    // Clean and split by commas, semicolons, whitespace, or newlines
    const parsed = rawTokens
      .split(/[,\s;\n\r]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 20);

    const uniqueTokens = Array.from(new Set(parsed));

    const existingMap = new Map<string, TokenState>(
      this.tokens.map((ts) => [ts.token, ts])
    );

    this.tokens = uniqueTokens.map((token) => {
      const existing = existingMap.get(token);
      return (
        existing || {
          token,
          cooldownUntil: 0,
          failureCount: 0,
        }
      );
    });

    log('info', {
      action: 'TokenInterceptor_initialized',
      totalTokensLoaded: this.tokens.length,
    });
  }

  public getHealthyTokens(): TokenState[] {
    const now = Date.now();
    const available = this.tokens.filter((t) => t.cooldownUntil <= now);
    return available.length > 0 ? available : this.tokens;
  }

  public getNextToken(): string {
    const pool = this.getHealthyTokens();
    if (pool.length === 0) {
      throw new InstagramError(
        'PROVIDER_ERROR',
        'No ScraperAPI tokens found in environment variables. Please set SCRAPERAPI_TOKEN or SCRAPERAPI_TOKENS.',
        500
      );
    }
    const selected = pool[this.currentIndex % pool.length];
    this.currentIndex = (this.currentIndex + 1) % pool.length;
    return selected.token;
  }

  public markFailure(token: string, statusCode: number) {
    const entry = this.tokens.find((t) => t.token === token);
    if (!entry) return;

    entry.failureCount += 1;
    // Put rate-limited or quota-depleted token on 5-minute cooldown
    if (statusCode === 429 || statusCode === 402) {
      entry.cooldownUntil = Date.now() + 5 * 60 * 1000;
      log('warn', {
        action: 'token_interceptor_cooldown',
        tokenMasked: `...${token.slice(-6)}`,
        statusCode,
        cooldownSeconds: 300,
      });
    }
  }

  public markSuccess(token: string) {
    const entry = this.tokens.find((t) => t.token === token);
    if (entry) {
      entry.cooldownUntil = 0;
    }
  }

  public get totalTokens(): number {
    return this.tokens.length;
  }
}

export const tokenInterceptor = TokenInterceptorManager.getInstance();

/**
 * Universal ScraperAPI Fetch Interceptor
 * Injects single Bearer auth, rotates across keys from env, and handles failover automatically.
 */
export async function scraperApiIntercept<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  const url = `https://scraperapi.to/scrape/instagram-scraper/${endpoint}`;
  const total = Math.max(tokenInterceptor.totalTokens, 1);
  const maxAttempts = Math.min(total, 4);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const activeToken = tokenInterceptor.getNextToken();

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.status === 404) {
        throw new InstagramError('PROFILE_NOT_FOUND', 'Target profile or content not found', 404);
      }

      // If token quota is exceeded (402) or rate-limited (429), rotate to next key
      if (res.status === 429 || res.status === 402) {
        tokenInterceptor.markFailure(activeToken, res.status);
        lastError = new InstagramError(
          'RATE_LIMITED',
          `ScraperAPI token quota or rate limit reached (${res.status}). Rotating token.`,
          res.status
        );
        continue;
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        if (res.status === 403 || errText.includes('private') || errText.includes('Private')) {
          throw new InstagramError(
            'PRIVATE_ACCOUNT',
            'This Instagram account is private. Its media cannot be viewed without following the account.',
            403
          );
        }
        tokenInterceptor.markFailure(activeToken, res.status);
        lastError = new InstagramError(
          'PROVIDER_ERROR',
          `ScraperAPI error [${res.status}]: ${errText.slice(0, 100)}`,
          res.status
        );
        continue;
      }

      // Successful call
      tokenInterceptor.markSuccess(activeToken);
      return (await res.json()) as T;
    } catch (err: unknown) {
      if (err instanceof InstagramError && (err.code === 'PRIVATE_ACCOUNT' || err.code === 'PROFILE_NOT_FOUND')) {
        throw err;
      }
      tokenInterceptor.markFailure(activeToken, 502);
      const msg = err instanceof Error ? err.message : 'Network error';
      lastError = new InstagramError('PROVIDER_ERROR', `ScraperAPI network error: ${msg}`, 502);
    }
  }

  throw (
    lastError ||
    new InstagramError(
      'RATE_LIMITED',
      'All ScraperAPI tokens in pool have reached their rate or quota limits.',
      429
    )
  );
}
