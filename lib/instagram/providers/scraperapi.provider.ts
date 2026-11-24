import { InstagramProvider, ProviderResult } from './provider.interface';
import {
  Profile,
  StoryResult,
  HighlightResult,
  PostResult,
  ReelResult,
  MediaItem,
} from '../types';
import { InstagramError } from '../errors';
import { globalCache, CACHE_TTL } from '../../cache';

interface ScraperApiConfig {
  token?: string;
  tokens?: string[];
}

export class ScraperApiProvider implements InstagramProvider {
  public readonly name = 'ScraperAPI Instagram';
  public readonly isDemo = false;
  private tokens: string[] = [];
  private currentTokenIndex = 0;

  constructor(config?: Partial<ScraperApiConfig>) {
    if (config?.tokens && config.tokens.length > 0) {
      this.tokens = config.tokens.filter(Boolean);
    } else if (config?.token) {
      this.tokens = [config.token];
    } else {
      const envTokens = process.env.SCRAPERAPI_TOKENS
        ? process.env.SCRAPERAPI_TOKENS.split(',').map((t) => t.trim()).filter(Boolean)
        : [];
      if (envTokens.length > 0) {
        this.tokens = envTokens;
      } else if (process.env.SCRAPERAPI_TOKEN) {
        this.tokens = [process.env.SCRAPERAPI_TOKEN.trim()];
      }
    }

    if (this.tokens.length === 0) {
      throw new InstagramError(
        'PROVIDER_ERROR',
        'ScraperAPI provider requires SCRAPERAPI_TOKEN or SCRAPERAPI_TOKENS environment variable',
        500
      );
    }
  }

  private getNextToken(): string {
    const token = this.tokens[this.currentTokenIndex % this.tokens.length];
    this.currentTokenIndex = (this.currentTokenIndex + 1) % this.tokens.length;
    return token;
  }

  private static extractShortcode(obj: any): string {
    if (obj?.code) return String(obj.code);
    if (obj?.shortcode) return String(obj.shortcode);
    const permalink = obj?.permalink || obj?.url || '';
    const match = permalink.match(/\/(?:p|reel|reels)\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : '';
  }

  private static findMp4(obj: any): string {
    if (!obj) return '';
    if (typeof obj.url === 'string' && obj.url.includes('.mp4')) return obj.url;
    if (typeof obj.video_url === 'string' && obj.video_url.includes('.mp4')) return obj.video_url;
    if (Array.isArray(obj.video_versions)) {
      const v = obj.video_versions.find((x: any) => x.url?.includes('.mp4')) || obj.video_versions[0];
      if (v?.url && v.url.includes('.mp4')) return v.url;
    }
    if (Array.isArray(obj.versions)) {
      const v = obj.versions.find((x: any) => x.url?.includes('.mp4'));
      if (v?.url) return v.url;
    }
    if (Array.isArray(obj.media)) {
      for (const m of obj.media) {
        const u = ScraperApiProvider.findMp4(m);
        if (u) return u;
      }
    }
    return '';
  }

  private static isValidCaption(c?: string): boolean {
    if (!c || typeof c !== 'string') return false;
    const trimmed = c.trim();
    return trimmed.length > 0 && !trimmed.startsWith('http://') && !trimmed.startsWith('https://');
  }

  private async fetchEndpoint<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
    const url = `https://scraperapi.to/scrape/instagram-scraper/${endpoint}`;

    let lastError: Error | null = null;
    const maxAttempts = Math.min(this.tokens.length, 3);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const activeToken = this.getNextToken();
      let res: Response;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${activeToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(body),
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Network error';
        lastError = new InstagramError('PROVIDER_ERROR', `ScraperAPI network request failed: ${msg}`, 502);
        continue;
      }

      if (res.status === 404) {
        throw new InstagramError('PROFILE_NOT_FOUND', 'Target profile or content not found', 404);
      }

      // If token is rate-limited (429) or payment/quota required (402), failover to next token
      if (res.status === 429 || res.status === 402) {
        lastError = new InstagramError(
          'RATE_LIMITED',
          `ScraperAPI token quota or rate limit reached (${res.status}). Rotating to next token.`,
          res.status
        );
        continue;
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        if (res.status === 403 || errText.includes('private') || errText.includes('Private')) {
          throw new InstagramError('PRIVATE_ACCOUNT', 'This Instagram account is private. Its media cannot be viewed without following the account.', 403);
        }
        lastError = new InstagramError('PROVIDER_ERROR', `ScraperAPI error [${res.status}]: ${errText.slice(0, 100)}`, res.status);
        continue;
      }

      return (await res.json()) as T;
    }

    throw lastError || new InstagramError('RATE_LIMITED', 'All ScraperAPI tokens in pool have reached their rate or quota limits.', 429);
  }

  public async getProfile(username: string): Promise<ProviderResult<Profile>> {
    const json = await this.fetchEndpoint<any>('userInfo', { username });
    const user = json.result;

    if (!user || (!user.username && !user.userId)) {
      throw new InstagramError('PROFILE_NOT_FOUND', `Profile @${username} not found on Instagram`, 404);
    }

    return {
      data: {
        username: user.username || username,
        fullName: user.fullName || user.username,
        avatarUrl: user.avatarUrl || '',
        biography: user.biography || '',
        followers: user.followersCount ?? 0,
        following: user.followingCount ?? 0,
        postsCount: user.postsCount ?? 0,
        verified: Boolean(user.isVerified),
        externalUrl: user.externalUrl,
        isPrivate: Boolean(user.isPrivate),
        userId: String(user.userId || ''),
      },
    };
  }

  public async getPosts(username: string, maxId?: string): Promise<ProviderResult<PostResult[]>> {
    const json = await this.fetchEndpoint<any>('posts', {
      username,
      ...(maxId ? { maxId } : {}),
    });
    const items = json.result?.items || [];
    const nextMaxId = json.result?.pageInfo?.maxId;
    const hasNextPage = Boolean(json.result?.pageInfo?.hasNextPage);

    if (!Array.isArray(items)) return { data: [], hasNextPage: false };

    const posts: PostResult[] = items.map((item: any) => {
      const isCarousel = item.type === 'carousel';
      const isVideo = item.type === 'video';

      let carouselMedia: MediaItem[] | undefined;
      let primaryUrl = '';
      let primaryThumb = '';

      if (isCarousel && Array.isArray(item.media)) {
        carouselMedia = item.media.map((sub: any, idx: number) => {
          const subMp4 = ScraperApiProvider.findMp4(sub);
          const subIsVideo = sub.type === 'video' || Boolean(subMp4);
          const subThumb = sub.thumbnailUrl || sub.versions?.[0]?.url || sub.url || '';
          const subUrl = subMp4 || subThumb;
          return {
            id: String(sub.id || `${item.id}_${idx}`),
            type: subIsVideo ? 'video' : 'image',
            url: subUrl,
            thumbnailUrl: subThumb,
            width: sub.width,
            height: sub.height,
          };
        });
        primaryUrl = carouselMedia?.[0]?.url || '';
        primaryThumb = carouselMedia?.[0]?.thumbnailUrl || primaryUrl;
      } else {
        const itemMp4 = ScraperApiProvider.findMp4(item);
        const m = item.media?.[0];
        const mThumb = m?.thumbnailUrl || m?.versions?.[0]?.url || m?.url || '';
        primaryUrl = itemMp4 || mThumb;
        primaryThumb = mThumb || primaryUrl;
      }

      const postMp4 = ScraperApiProvider.findMp4(item);
      const effectiveIsVideo = isVideo && (Boolean(postMp4) || isCarousel);

      const rawCaption = item.caption?.text || (typeof item.caption === 'string' ? item.caption : '');
      const cleanCaption = ScraperApiProvider.isValidCaption(rawCaption) ? rawCaption : '';

      return {
        id: String(item.id),
        type: isCarousel ? 'carousel' : (effectiveIsVideo ? 'video' : 'image'),
        url: primaryUrl,
        thumbnailUrl: primaryThumb || primaryUrl,
        caption: cleanCaption,
        timestamp: item.timestamp ? new Date(item.timestamp * 1000).toISOString() : undefined,
        likeCount: item.likeCount,
        commentCount: item.commentCount,
        carouselMedia,
      };
    });

    return {
      data: posts,
      nextMaxId,
      hasNextPage,
    };
  }

  public async getStories(username: string): Promise<ProviderResult<StoryResult[]>> {
    const json = await this.fetchEndpoint<any>('stories', { username });
    const items = json.result?.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      return { data: [], notice: `No active stories found for @${username} (stories expire after 24 hours)` };
    }

    const stories: StoryResult[] = items.map((item: any, idx: number) => {
      const isVideo = item.type === 'video';
      const mp4Url = isVideo ? ScraperApiProvider.findMp4(item) : '';
      const m = item.media?.[0];
      const thumbUrl = item.thumbnailUrl || m?.thumbnailUrl || m?.versions?.[0]?.url || '';
      const url = mp4Url || item.url || item.versions?.[0]?.url || m?.versions?.[0]?.url || m?.url || '';

      return {
        id: String(item.id || `story_${idx}`),
        storyId: String(item.id || `story_${idx}`),
        type: isVideo && Boolean(mp4Url) ? 'video' : 'image',
        url,
        thumbnailUrl: thumbUrl || url,
        duration: item.duration,
        timestamp: item.takenAt
          ? new Date(item.takenAt * 1000).toISOString()
          : (item.timestamp ? new Date(item.timestamp * 1000).toISOString() : undefined),
        expiresAt: item.expiresAt ? new Date(item.expiresAt * 1000).toISOString() : undefined,
      };
    });

    return { data: stories };
  }

  public async getHighlightStories(highlightId: string): Promise<MediaItem[]> {
    const json = await this.fetchEndpoint<any>('highlightStories', { highlightId });
    const items = json.result?.items || [];
    if (!Array.isArray(items)) return [];

    return items.map((m: any, idx: number) => {
      const isVideo = m.type === 'video';
      const mp4Url = isVideo ? ScraperApiProvider.findMp4(m) : '';
      const thumbUrl = m.thumbnailUrl || m.coverImageUrl || m.versions?.[0]?.url || '';
      const url = mp4Url || m.url || m.versions?.[0]?.url || '';
      return {
        id: String(m.id || `${highlightId}_${idx}`),
        type: isVideo && Boolean(mp4Url) ? 'video' : 'image',
        url,
        thumbnailUrl: thumbUrl || url,
        duration: m.duration,
        width: m.width,
        height: m.height,
        timestamp: m.takenAt ? new Date(m.takenAt * 1000).toISOString() : undefined,
      };
    });
  }

  public async getHighlights(username: string): Promise<HighlightResult[]> {
    const json = await this.fetchEndpoint<any>('highlights', { username });
    const items = json.result?.items || [];
    if (!Array.isArray(items)) return [];

    return items.map((h: any) => ({
      id: String(h.id),
      title: h.title || 'Highlight',
      coverUrl: h.coverImageUrl || '',
      mediaCount: h.mediaCount || 0,
      items: [],
    }));
  }

  public async getReels(username: string, maxId?: string): Promise<ProviderResult<ReelResult[]>> {
    const json = await this.fetchEndpoint<any>('reels', {
      username,
      ...(maxId ? { maxId } : {}),
    });
    const items = json.result?.items || [];
    const nextMaxId = json.result?.pageInfo?.maxId;
    const hasNextPage = Boolean(json.result?.pageInfo?.hasNextPage);
    if (!Array.isArray(items)) return { data: [], hasNextPage: false };

    // In ScraperAPI, the raw /api/reels endpoint returns thumbnails without mp4 video streams.
    // However, the Instagram posts feed contains full mp4 streams and genuine text captions for the user's reels.
    // Fetch posts (page 1 and page 2 if needed) to enrich reels with real video URLs and captions.
    interface PostVideoMeta {
      url: string;
      caption?: string;
      likeCount?: number;
      commentCount?: number;
    }

    const poolKey = `posts_pool:${username}`;
    const cursorKey = `posts_cursor:${username}`;

    const cachedPool = globalCache.get<Record<string, PostVideoMeta>>(poolKey) || {};
    const postsMap = new Map<string, PostVideoMeta>(Object.entries(cachedPool));
    let nextPostsCursor = globalCache.get<string>(cursorKey) || undefined;

    const hasUnmatched = () =>
      items.some((item) => {
        const sc = ScraperApiProvider.extractShortcode(item);
        const m = postsMap.get(String(item.id)) || (sc ? postsMap.get(sc) : undefined);
        return !m || !m.url || !m.url.includes('.mp4');
      });

    try {
      let pageCount = 0;
      const maxPagesToFetch = 2;

      while (hasUnmatched() && pageCount < maxPagesToFetch) {
        pageCount++;
        const postsRes: any = await this.fetchEndpoint<any>('posts', {
          username,
          ...(nextPostsCursor ? { maxId: nextPostsCursor } : {}),
        });

        const pItems = postsRes.result?.items || [];
        if (!Array.isArray(pItems) || pItems.length === 0) break;

        for (const p of pItems) {
          const vUrl = ScraperApiProvider.findMp4(p) || p.video_url;
          const captionText = p.caption?.text || (typeof p.caption === 'string' ? p.caption : undefined);
          const meta: PostVideoMeta = {
            url: vUrl || '',
            caption: ScraperApiProvider.isValidCaption(captionText) ? captionText : undefined,
            likeCount: p.likeCount,
            commentCount: p.commentCount,
          };
          postsMap.set(String(p.id), meta);
          const sc = ScraperApiProvider.extractShortcode(p);
          if (sc) postsMap.set(sc, meta);
        }

        nextPostsCursor = postsRes.result?.pageInfo?.maxId || undefined;
        if (!postsRes.result?.pageInfo?.hasNextPage || !nextPostsCursor) break;
      }

      const updatedPool: Record<string, PostVideoMeta> = {};
      postsMap.forEach((v, k) => {
        updatedPool[k] = v;
      });
      globalCache.set(poolKey, updatedPool, CACHE_TTL.POSTS);
      if (nextPostsCursor) {
        globalCache.set(cursorKey, nextPostsCursor, CACHE_TTL.POSTS);
      }
    } catch {
      // Non-blocking: continue if posts lookup encounters an issue
    }

    const reels: ReelResult[] = items.map((item: any) => {
      const m = item.media?.[0];
      const thumbUrl = m?.thumbnailUrl || '';
      const reelSc = ScraperApiProvider.extractShortcode(item);
      const matched =
        postsMap.get(String(item.id)) ||
        (reelSc ? postsMap.get(reelSc) : undefined);
      const videoUrl =
        matched?.url && matched.url.includes('.mp4')
          ? matched.url
          : (ScraperApiProvider.findMp4(item) || thumbUrl);

      // Extract genuine caption text, never leak raw URL permalinks as the caption
      const rawCaption = item.caption?.text || (typeof item.caption === 'string' ? item.caption : '');
      const caption =
        matched?.caption || (ScraperApiProvider.isValidCaption(rawCaption) ? rawCaption : '');

      return {
        id: String(item.id),
        type: 'video',
        url: videoUrl,
        thumbnailUrl: thumbUrl,
        caption,
        timestamp: item.timestamp ? new Date(item.timestamp * 1000).toISOString() : undefined,
        duration: item.duration,
        viewCount: item.viewCount || item.playCount || matched?.likeCount,
        playCount: item.playCount,
        audioTitle: item.audioTitle || 'Original Audio',
        audioArtist: item.audioArtist,
        shortcode: reelSc || undefined,
      };
    });

    return {
      data: reels,
      nextMaxId,
      hasNextPage,
    };
  }
}
