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

export class InstagramService {
  private static addMediaProxyUrls(item: MediaItem, username: string): MediaItem {
    const isVideo = item.type === 'video';
    const ext = isVideo ? 'mp4' : 'jpg';
    const filename = `instagram_${username}_${item.id}.${ext}`;
    const downloadUrl = `/api/media?url=${encodeURIComponent(item.url)}&download=true&filename=${encodeURIComponent(filename)}`;

    let carouselMedia: MediaItem[] | undefined;
    if (item.carouselMedia && item.carouselMedia.length > 0) {
      carouselMedia = item.carouselMedia.map((sub, idx) => {
        const subIsVideo = sub.type === 'video';
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
    const cacheKey = `profile:${username}:${forceDemo ? 'demo' : 'live'}`;
    const cached = globalCache.get<Profile>(cacheKey);

    const provider = ProviderFactory.getProvider({ forceDemo });
    const startTime = Date.now();

    if (cached) {
      log('info', {
        action: 'getProfile',
        username,
        provider: provider.name,
        fromCache: true,
      });
      return {
        success: true,
        data: cached,
        metadata: {
          provider: provider.name,
          executionTimeMs: 0,
          isDemo: provider.isDemo,
          timestamp: new Date().toISOString(),
          notice: 'Served from high-speed cache',
        },
      };
    }

    try {
      const result = await provider.getProfile(username);
      const durationMs = Date.now() - startTime;

      globalCache.set(cacheKey, result.data, CACHE_TTL.PROFILE);

      log('info', {
        action: 'getProfile',
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
          notice: result.notice,
        },
      };
    } catch (err: unknown) {
      // Auto-fallback: If configured external provider failed and we're in live mode, fall back to DirectCrawler
      if (!forceDemo && !(provider instanceof DirectCrawlerProvider)) {
        try {
          const directCrawler = new DirectCrawlerProvider();
          const fallbackResult = await directCrawler.getProfile(username);
          const durationMs = Date.now() - startTime;

          globalCache.set(cacheKey, fallbackResult.data, CACHE_TTL.PROFILE);

          log('info', {
            action: 'getProfile_fallback',
            username,
            provider: directCrawler.name,
            durationMs,
            status: 'success',
          });

          return {
            success: true,
            data: fallbackResult.data,
            metadata: {
              provider: directCrawler.name,
              executionTimeMs: durationMs,
              isDemo: false,
              timestamp: new Date().toISOString(),
              notice: `Fetched via built-in Direct Crawler (${provider.name} fallback)`,
            },
          };
        } catch {
          // If fallback also fails, proceed to error handler
        }
      }

      return this.handleServiceError(err, 'getProfile', username, provider, startTime);
    }
  }

  public static async getStories(
    username: string,
    forceDemo: boolean = false
  ): Promise<ApiResponse<StoryResult[]>> {
    const cacheKey = `stories:${username}:${forceDemo ? 'demo' : 'live'}`;
    const cached = globalCache.get<StoryResult[]>(cacheKey);

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
          notice: 'Served from short-lived story cache',
        },
      };
    }

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
        action: 'getStories',
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
          notice: result.notice,
        },
      };
    } catch (err: unknown) {
      return this.handleServiceError(err, 'getStories', username, provider, startTime);
    }
  }

  public static async getHighlights(
    username: string,
    forceDemo: boolean = false
  ): Promise<ApiResponse<HighlightResult[]>> {
    const cacheKey = `highlights:${username}:${forceDemo ? 'demo' : 'live'}`;
    const cached = globalCache.get<HighlightResult[]>(cacheKey);

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
        },
      };
    } catch (err: unknown) {
      return this.handleServiceError(err, 'getHighlights', username, provider, startTime);
    }
  }

  public static async getPosts(
    username: string,
    forceDemo: boolean = false,
    maxId?: string
  ): Promise<ApiResponse<PostResult[]>> {
    const cacheKey = `posts:${username}:${forceDemo ? 'demo' : 'live'}:${maxId || 'initial'}`;
    interface CachedPostsPayload {
      posts: PostResult[];
      nextMaxId?: string;
      hasNextPage?: boolean;
      notice?: string;
    }
    const cached = globalCache.get<CachedPostsPayload>(cacheKey);

    const provider = ProviderFactory.getProvider({ forceDemo });
    const startTime = Date.now();

    if (cached) {
      return {
        success: true,
        data: cached.posts,
        metadata: {
          provider: provider.name,
          executionTimeMs: 0,
          isDemo: provider.isDemo,
          timestamp: new Date().toISOString(),
          notice: cached.notice || 'Served from cache',
          nextMaxId: cached.nextMaxId,
          hasNextPage: cached.hasNextPage,
        },
      };
    }

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
          notice: result.notice,
          nextMaxId: result.nextMaxId,
          hasNextPage: result.hasNextPage,
        },
      };
    } catch (err: unknown) {
      return this.handleServiceError(err, 'getPosts', username, provider, startTime);
    }
  }

  public static async getReels(
    username: string,
    forceDemo: boolean = false
  ): Promise<ApiResponse<ReelResult[]>> {
    const cacheKey = `reels:${username}:${forceDemo ? 'demo' : 'live'}`;
    const cached = globalCache.get<ReelResult[]>(cacheKey);

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
      const result = await provider.getReels(username);
      const durationMs = Date.now() - startTime;

      const processed = result.data.map((r) => ({
        ...this.addMediaProxyUrls(r, username),
        viewCount: r.viewCount,
        playCount: r.playCount,
        audioTitle: r.audioTitle,
        audioArtist: r.audioArtist,
      }));

      globalCache.set(cacheKey, processed, CACHE_TTL.REELS);

      return {
        success: true,
        data: processed,
        metadata: {
          provider: provider.name,
          executionTimeMs: durationMs,
          isDemo: provider.isDemo,
          timestamp: new Date().toISOString(),
          notice: result.notice,
        },
      };
    } catch (err: unknown) {
      return this.handleServiceError(err, 'getReels', username, provider, startTime);
    }
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
    if (
      message.includes('"error_type":"private"') ||
      message.includes('This page is private') ||
      message.includes('private page') ||
      message.toLowerCase().includes('is private') ||
      message.toLowerCase().includes('account is private')
    ) {
      code = 'PRIVATE_ACCOUNT';
      message = 'This Instagram account is private. Its media cannot be viewed without following the account.';
    }

    // Never leak raw JSON / internal provider error bodies to client
    if (message.startsWith('{') || message.includes('ScraperAPI error') || message.includes('RapidAPI error')) {
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
