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

interface ScraperApiConfig {
  token: string;
}

export class ScraperApiProvider implements InstagramProvider {
  public readonly name = 'ScraperAPI Instagram';
  public readonly isDemo = false;
  private token: string;

  constructor(config?: Partial<ScraperApiConfig>) {
    this.token = config?.token || process.env.SCRAPERAPI_TOKEN || '';

    if (!this.token) {
      throw new InstagramError(
        'PROVIDER_ERROR',
        'ScraperAPI provider requires SCRAPERAPI_TOKEN environment variable',
        500
      );
    }
  }

  private async fetchEndpoint<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
    const url = `https://scraperapi.to/scrape/instagram-scraper/${endpoint}`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      throw new InstagramError('PROVIDER_ERROR', `ScraperAPI network request failed: ${msg}`, 502);
    }

    if (res.status === 404) {
      throw new InstagramError('PROFILE_NOT_FOUND', 'Target profile or content not found', 404);
    }

    if (res.status === 429) {
      throw new InstagramError('RATE_LIMITED', 'ScraperAPI rate limit reached (2 req/s on Free). Cached results will serve shortly.', 429);
    }

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 403 || errText.includes('private') || errText.includes('Private')) {
        throw new InstagramError('PRIVATE_ACCOUNT', 'This Instagram account is private. Its media cannot be viewed without following the account.', 403);
      }
      throw new InstagramError('PROVIDER_ERROR', `ScraperAPI error [${res.status}]: ${errText.slice(0, 100)}`, res.status);
    }

    return (await res.json()) as T;
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
          const subIsVideo = sub.type === 'video';
          const subUrl = sub.versions?.[0]?.url || sub.url || '';
          const subThumb = sub.thumbnailUrl || subUrl;
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
        const m = item.media?.[0];
        primaryUrl = m?.versions?.[0]?.url || m?.url || '';
        primaryThumb = m?.thumbnailUrl || primaryUrl;
      }

      return {
        id: String(item.id),
        type: isCarousel ? 'carousel' : (isVideo ? 'video' : 'image'),
        url: primaryUrl,
        thumbnailUrl: primaryThumb || primaryUrl,
        caption: item.caption?.text || item.caption || '',
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
      const m = item.media?.[0];
      const url = item.url || item.versions?.[0]?.url || m?.versions?.[0]?.url || m?.url || '';
      const thumbUrl = item.thumbnailUrl || m?.thumbnailUrl || item.versions?.[0]?.url || url;

      return {
        id: String(item.id || `story_${idx}`),
        storyId: String(item.id || `story_${idx}`),
        type: isVideo ? 'video' : 'image',
        url,
        thumbnailUrl: thumbUrl,
        duration: item.duration,
        timestamp: item.takenAt
          ? new Date(item.takenAt * 1000).toISOString()
          : (item.timestamp ? new Date(item.timestamp * 1000).toISOString() : undefined),
        expiresAt: item.expiresAt ? new Date(item.expiresAt * 1000).toISOString() : undefined,
      };
    });

    return { data: stories };
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
      items: (h.items || []).map((m: any, idx: number) => ({
        id: String(m.id || `${h.id}_${idx}`),
        type: m.type === 'video' ? 'video' : 'image',
        url: m.versions?.[0]?.url || m.url || '',
        thumbnailUrl: m.thumbnailUrl || m.versions?.[0]?.url || m.url || '',
      })),
    }));
  }

  public async getReels(username: string): Promise<ProviderResult<ReelResult[]>> {
    const json = await this.fetchEndpoint<any>('reels', { username });
    const items = json.result?.items || [];
    if (!Array.isArray(items)) return { data: [] };

    const reels: ReelResult[] = items.map((item: any) => {
      const m = item.media?.[0];
      const thumbUrl = m?.thumbnailUrl || '';
      const videoUrl = m?.versions?.[0]?.url || m?.url || thumbUrl;

      return {
        id: String(item.id),
        type: 'video',
        url: videoUrl,
        thumbnailUrl: thumbUrl,
        caption: item.caption?.text || item.caption || item.permalink || '',
        timestamp: item.timestamp ? new Date(item.timestamp * 1000).toISOString() : undefined,
        duration: item.duration,
        viewCount: item.viewCount || item.playCount,
        playCount: item.playCount,
        audioTitle: item.audioTitle || 'Original Audio',
        audioArtist: item.audioArtist,
      };
    });

    return { data: reels };
  }
}
