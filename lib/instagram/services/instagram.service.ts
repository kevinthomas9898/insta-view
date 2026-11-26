import { ProviderFactory } from '../providers/factory';
import { InstagramProvider } from '../providers/provider.interface';
import { DirectCrawlerProvider } from '../providers/direct-crawler.provider';
import {
  Profile,
  StoryResult,
  HighlightResult,
  PostResult,
  ReelResult,
  ApiResponse,
  ProviderMetadata,
  MediaItem,
} from '../types';
import { InstagramError } from '../errors';
import { globalCache, CACHE_TTL } from '../../cache';
import { log } from '../../utils/logger';
import { isProfileOptedOut } from '../../storage/opt-out';

export class InstagramService {
  private static async checkOptOut<T>(username: string): Promise<ApiResponse<T> | null> {
    if (await isProfileOptedOut(username)) {
      return {
        success: false,
        error: {
          code: 'PROFILE_OPTED_OUT',
          message: `@${username} has been opted out of public indexing upon owner request under DMCA & privacy compliance.`,
        },
        metadata: {
          provider: 'OptOutRegistry',
          executionTimeMs: 0,
          isDemo: false,
          timestamp: new Date().toISOString(),
        },
      };
    }
    return null;
  }

  private static addMediaProxyUrls(item: MediaItem, username: string): MediaItem {
    const isVideo = item.type === 'video' && Boolean(item.url && item.url.includes('.mp4'));
    const ext = isVideo ? 'mp4' : 'jpg';
    const filename = `instagram_${username}_${item.id}.${ext}`;
    const downloadUrl = `/api/media?url=${encodeURIComponent(item.url)}&download=true&filename=${encodeURIComponent(filename)}`;

    let carouselMedia: MediaItem[] | undefined;
    if (item.carouselMedia && item.carouselMedia.length > 0) {
      carouselMedia = item.carouselMedia.map((sub, idx) => {
        const subIsVideo = sub.type === 'video' && Boolean(sub.url && sub.url.includes('.mp4'));
        const subExt = subIsVideo ? 'mp4' : 'jpg';
        const subFilename = `instagram_${username}_${item.id}_${idx + 1}.${subExt}`;
        return {
          ...sub,
          downloadUrl: `/api/media?url=${encodeURIComponent(sub.url)}&download=true&filename=${encodeURIComponent(subFilename)}`,
        };
      });
    }

    return {
      ...item,
      downloadUrl,
      carouselMedia,
    };
  }

  public static async getProfile(
    username: string,
    forceDemo: boolean = false
  ): Promise<ApiResponse<Profile>> {
    const optOut = await this.checkOptOut<Profile>(username);
    if (optOut) return optOut;

    const cacheKey = `profile:${username}:${forceDemo ? 'demo' : 'live'}`;
    const cached = globalCache.get<Profile>(cacheKey);

    const chain = ProviderFactory.getFallbackChain({ forceDemo });
    const startTime = Date.now();

    if (cached) {
      log('info', {
        action: 'getProfile',
        username,
        provider: chain[0].name,
        fromCache: true,
      });
      return {
        success: true,
        data: cached,
        metadata: {
          provider: chain[0].name,
          executionTimeMs: 0,
          isDemo: chain[0].isDemo,
          timestamp: new Date().toISOString(),
          notice: 'Served from high-speed cache',
        },
      };
    }

    let lastErr: unknown;
    for (let i = 0; i < chain.length; i++) {
      const provider = chain[i];
      try {
        const result = await provider.getProfile(username);
        const durationMs = Date.now() - startTime;

        globalCache.set(cacheKey, result.data, CACHE_TTL.PROFILE);

        log('info', {
          action: i === 0 ? 'getProfile' : 'getProfile_failover',
          username,
          provider: provider.name,
          durationMs,
          status: 'success',
        });

        return {
          success: true,
          data: result.data,
          metadata: {
            provider: provider.name,
            executionTimeMs: durationMs,
            isDemo: provider.isDemo,
            timestamp: new Date().toISOString(),
            notice: i > 0 ? `Fetched via ${provider.name} (${chain[0].name} failover)` : result.notice,
          },
        };
      } catch (err: unknown) {
        lastErr = err;
      }
    }

    return this.handleServiceError(lastErr, 'getProfile', username, chain[0], startTime);
  }

  public static async getStories(
    username: string,
    forceDemo: boolean = false
  ): Promise<ApiResponse<StoryResult[]>> {
    const optOut = await this.checkOptOut<StoryResult[]>(username);
    if (optOut) return optOut;

    const cacheKey = `stories:${username}:${forceDemo ? 'demo' : 'live'}`;
    const cached = globalCache.get<StoryResult[]>(cacheKey);

    const chain = ProviderFactory.getFallbackChain({ forceDemo });
    const startTime = Date.now();

    if (cached) {
      return {
        success: true,
        data: cached,
        metadata: {
          provider: chain[0].name,
          executionTimeMs: 0,
          isDemo: chain[0].isDemo,
          timestamp: new Date().toISOString(),
          notice: 'Served from short-lived story cache',
        },
      };
    }

    let lastErr: unknown;
    for (let i = 0; i < chain.length; i++) {
      const provider = chain[i];
      try {
        const result = await provider.getStories(username);
        const durationMs = Date.now() - startTime;

        const processedStories = result.data.map((s) => ({
          ...this.addMediaProxyUrls(s, username),
          storyId: s.storyId,
          expiresAt: s.expiresAt,
        }));

        globalCache.set(cacheKey, processedStories, CACHE_TTL.STORIES);

        log('info', {
          action: i === 0 ? 'getStories' : 'getStories_failover',
          username,
          provider: provider.name,
          durationMs,
          status: 'success',
        });

        return {
          success: true,
          data: processedStories,
          metadata: {
            provider: provider.name,
            executionTimeMs: durationMs,
            isDemo: provider.isDemo,
            timestamp: new Date().toISOString(),
            notice: i > 0 ? `Fetched via ${provider.name} (${chain[0].name} failover)` : result.notice,
          },
        };
      } catch (err: unknown) {
        lastErr = err;
      }
    }

    return this.handleServiceError(lastErr, 'getStories', username, chain[0], startTime);
  }

  public static async getHighlights(
    username: string,
    forceDemo: boolean = false
  ): Promise<ApiResponse<HighlightResult[]>> {
    const optOut = await this.checkOptOut<HighlightResult[]>(username);
    if (optOut) return optOut;

    const cacheKey = `highlights:${username}:${forceDemo ? 'demo' : 'live'}`;
    const cached = globalCache.get<HighlightResult[]>(cacheKey);

    const chain = ProviderFactory.getFallbackChain({ forceDemo });
    const startTime = Date.now();

    if (cached) {
      return {
        success: true,
        data: cached,
        metadata: {
          provider: chain[0].name,
          executionTimeMs: 0,
          isDemo: chain[0].isDemo,
          timestamp: new Date().toISOString(),
        },
      };
    }

    let lastErr: unknown;
    for (let i = 0; i < chain.length; i++) {
      const provider = chain[i];
      try {
        const result = await provider.getHighlights(username);
        const durationMs = Date.now() - startTime;

        const processed = result.map((hl) => ({
          ...hl,
          items: hl.items.map((it) => this.addMediaProxyUrls(it, username)),
        }));

        globalCache.set(cacheKey, processed, CACHE_TTL.HIGHLIGHTS);

        return {
          success: true,
          data: processed,
          metadata: {
            provider: provider.name,
            executionTimeMs: durationMs,
            isDemo: provider.isDemo,
            timestamp: new Date().toISOString(),
            notice: i > 0 ? `Fetched via ${provider.name} (${chain[0].name} failover)` : undefined,
          },
        };
      } catch (err: unknown) {
        lastErr = err;
      }
    }

    return this.handleServiceError(lastErr, 'getHighlights', username, chain[0], startTime);
  }

  public static async getHighlightStories(
    highlightId: string,
    username: string,
    forceDemo: boolean = false
  ): Promise<ApiResponse<MediaItem[]>> {
    const optOut = await this.checkOptOut<MediaItem[]>(username);
    if (optOut) return optOut;

    const cacheKey = `highlight_stories:${highlightId}:${forceDemo ? 'demo' : 'live'}`;
    const cached = globalCache.get<MediaItem[]>(cacheKey);

    const provider = ProviderFactory.getProvider({ forceDemo });
    const startTime = Date.now();

    if (cached) {
      return {
        success: true,
        data: cached,
        metadata: {
          provider: provider.name,
          executionTimeMs: 0,
          isDemo: provider.isDemo,
          timestamp: new Date().toISOString(),
        },
      };
    }

    try {
      let items: MediaItem[] = [];
      if (typeof provider.getHighlightStories === 'function') {
        items = await provider.getHighlightStories(highlightId);
      } else {
        const cachedHighlights = globalCache.get<HighlightResult[]>(`highlights:${username}:${forceDemo ? 'demo' : 'live'}`);
        const hl = cachedHighlights?.find((h) => h.id === highlightId);
        if (hl && hl.items.length > 0) {
          items = hl.items;
        }
      }

      const durationMs = Date.now() - startTime;
      const processed = items.map((it) => this.addMediaProxyUrls(it, username));

      globalCache.set(cacheKey, processed, CACHE_TTL.HIGHLIGHTS);

      // Also update the highlight in cached highlights if present
      const cachedHighlights = globalCache.get<HighlightResult[]>(`highlights:${username}:${forceDemo ? 'demo' : 'live'}`);
      if (cachedHighlights) {
        const targetHl = cachedHighlights.find((h) => h.id === highlightId);
        if (targetHl) {
          targetHl.items = processed;
          targetHl.mediaCount = processed.length;
        }
      }

      return {
        success: true,
        data: processed,
        metadata: {
          provider: provider.name,
          executionTimeMs: durationMs,
          isDemo: provider.isDemo,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (err: unknown) {
      return this.handleServiceError(err, 'getHighlightStories', username, provider, startTime);
    }
  }

  public static async getPosts(
    username: string,
    forceDemo: boolean = false,
    maxId?: string
  ): Promise<ApiResponse<PostResult[]>> {
    const optOut = await this.checkOptOut<PostResult[]>(username);
    if (optOut) return optOut;

    const cacheKey = `posts:${username}:${forceDemo ? 'demo' : 'live'}:${maxId || 'initial'}`;
    interface CachedPostsPayload {
      posts: PostResult[];
      nextMaxId?: string;
      hasNextPage?: boolean;
      notice?: string;
    }
    const cached = globalCache.get<CachedPostsPayload>(cacheKey);

    const chain = ProviderFactory.getFallbackChain({ forceDemo });
    const startTime = Date.now();

    if (cached) {
      return {
        success: true,
        data: cached.posts,
        metadata: {
          provider: chain[0].name,
          executionTimeMs: 0,
          isDemo: chain[0].isDemo,
          timestamp: new Date().toISOString(),
          notice: cached.notice || 'Served from cache',
          nextMaxId: cached.nextMaxId,
          hasNextPage: cached.hasNextPage,
        },
      };
    }

    let lastErr: unknown;
    for (let i = 0; i < chain.length; i++) {
      const provider = chain[i];
      try {
        const result = await provider.getPosts(username, maxId);
        const durationMs = Date.now() - startTime;

        const processed = result.data.map((p) => ({
          ...this.addMediaProxyUrls(p, username),
          likeCount: p.likeCount,
          commentCount: p.commentCount,
        }));

        globalCache.set(
          cacheKey,
          {
            posts: processed,
            nextMaxId: result.nextMaxId,
            hasNextPage: result.hasNextPage,
            notice: result.notice,
          },
          CACHE_TTL.POSTS
        );

        return {
          success: true,
          data: processed,
          metadata: {
            provider: provider.name,
            executionTimeMs: durationMs,
            isDemo: provider.isDemo,
            timestamp: new Date().toISOString(),
            notice: i > 0 ? `Fetched via ${provider.name} (${chain[0].name} failover)` : result.notice,
            nextMaxId: result.nextMaxId,
            hasNextPage: result.hasNextPage,
          },
        };
      } catch (err: unknown) {
        lastErr = err;
      }
    }

    return this.handleServiceError(lastErr, 'getPosts', username, chain[0], startTime);
  }

  public static async getReels(
    username: string,
    forceDemo: boolean = false,
    maxId?: string
  ): Promise<ApiResponse<ReelResult[]>> {
    const optOut = await this.checkOptOut<ReelResult[]>(username);
    if (optOut) return optOut;

    const cacheKey = `reels:${username}:${forceDemo ? 'demo' : 'live'}:${maxId || 'initial'}`;
    const cached = globalCache.get<{
      reels: ReelResult[];
      nextMaxId?: string;
      hasNextPage?: boolean;
      notice?: string;
    } | ReelResult[]>(cacheKey);

    const chain = ProviderFactory.getFallbackChain({ forceDemo });
    const startTime = Date.now();

    if (cached) {
      const cachedReels = Array.isArray(cached) ? cached : cached.reels;
      // Poisoned Cache Defense: If cached reels contain .jpg thumbnails or lack valid .mp4 streams, invalidate cache immediately
      const isPoisoned = cachedReels?.some(
        (r) =>
          (!r.url || !r.url.includes('.mp4')) &&
          (r.url?.includes('.jpg') || r.url?.includes('t51.82787-15'))
      );
      if (isPoisoned) {
        log('warn', {
          action: 'getReels',
          username,
          message: 'Invalidating poisoned cache containing jpg thumbnails for reels',
        });
        globalCache.delete(cacheKey);
      } else {
        return {
          success: true,
          data: cachedReels,
          metadata: {
            provider: chain[0].name,
            executionTimeMs: 0,
            isDemo: chain[0].isDemo,
            timestamp: new Date().toISOString(),
            notice: Array.isArray(cached) ? undefined : cached.notice,
            nextMaxId: Array.isArray(cached) ? undefined : cached.nextMaxId,
            hasNextPage: Array.isArray(cached) ? undefined : cached.hasNextPage,
          },
        };
      }
    }

    let lastErr: unknown;
    for (let i = 0; i < chain.length; i++) {
      const provider = chain[i];
      try {
        const result = await provider.getReels(username, maxId);
        const durationMs = Date.now() - startTime;

        // Cross-enrich reels with video URLs from pooled posts if available
        const poolObj = globalCache.get<Record<string, { url: string; caption?: string }>>(`posts_pool:${username}`) || {};

        const processed = result.data.map((r) => {
          let reelItem = { ...r };
          const poolEntry = poolObj[reelItem.id] || (reelItem.shortcode ? poolObj[reelItem.shortcode] : undefined);
          if ((!reelItem.url || !reelItem.url.includes('.mp4')) && poolEntry?.url?.includes('.mp4')) {
            reelItem.url = poolEntry.url;
          }
          if (!reelItem.caption && poolEntry?.caption) {
            reelItem.caption = poolEntry.caption;
          }
          return {
            ...this.addMediaProxyUrls(reelItem, username),
            viewCount: r.viewCount,
            playCount: r.playCount,
            audioTitle: r.audioTitle,
            audioArtist: r.audioArtist,
          };
        });

        globalCache.set(
          cacheKey,
          {
            reels: processed,
            nextMaxId: result.nextMaxId,
            hasNextPage: result.hasNextPage,
            notice: result.notice,
          },
          CACHE_TTL.REELS
        );

        return {
          success: true,
          data: processed,
          metadata: {
            provider: provider.name,
            executionTimeMs: durationMs,
            isDemo: provider.isDemo,
            timestamp: new Date().toISOString(),
            notice: i > 0 ? `Fetched via ${provider.name} (${chain[0].name} failover)` : result.notice,
            nextMaxId: result.nextMaxId,
            hasNextPage: result.hasNextPage,
          },
        };
      } catch (err: unknown) {
        lastErr = err;
      }
    }

    return this.handleServiceError(lastErr, 'getReels', username, chain[0], startTime);
  }

  private static handleServiceError<T>(
    err: unknown,
    action: string,
    username: string,
    provider: InstagramProvider,
    startTime: number
  ): ApiResponse<T> {
    const durationMs = Date.now() - startTime;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';
    let details: unknown;

    if (err instanceof InstagramError) {
      code = err.code;
      message = err.message;
      details = err.details;
    } else if (err instanceof Error) {
      message = err.message;
    }

    // Normalize any provider error indicating a private profile
    const lower = message.toLowerCase();
    if (
      lower.includes('private') ||
      lower.includes('403') ||
      lower.includes('this page is private') ||
      lower.includes('account is private') ||
      lower.includes('is private')
    ) {
      code = 'PRIVATE_ACCOUNT';
      message = 'This Instagram account is private. Its media cannot be viewed without following the account.';
    }

    // Never leak raw JSON / internal provider error bodies to client
    if (
      message.startsWith('{') ||
      message.includes('ScraperAPI error') ||
      message.includes('RapidAPI error') ||
      message.includes('error_type')
    ) {
      if (code !== 'PRIVATE_ACCOUNT' && code !== 'RATE_LIMITED' && code !== 'PROFILE_NOT_FOUND') {
        message = 'Unable to retrieve media for this profile at this time. Please try again.';
      }
    }

    log('error', {
      action,
      username,
      provider: provider.name,
      durationMs,
      status: 'failure',
      errorCategory: code,
      message,
    });

    return {
      success: false,
      error: { code, message, details },
      metadata: {
        provider: provider.name,
        executionTimeMs: durationMs,
        isDemo: provider.isDemo,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
