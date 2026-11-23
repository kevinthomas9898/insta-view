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

interface RapidApiConfig {
  apiKey: string;
  host: string;
}

export class RapidApiProvider implements InstagramProvider {
  public readonly name = 'RapidAPI Instagram Scraper';
  public readonly isDemo = false;
  private apiKey: string;
  private host: string;

  constructor(config?: Partial<RapidApiConfig>) {
    this.apiKey = config?.apiKey || process.env.INSTAGRAM_RAPIDAPI_KEY || '';
    this.host = config?.host || process.env.INSTAGRAM_RAPIDAPI_HOST || 'instagram-scraper-api2.p.rapidapi.com';

    if (!this.apiKey) {
      throw new InstagramError(
        'PROVIDER_ERROR',
        'RapidAPI provider requires INSTAGRAM_RAPIDAPI_KEY environment variable',
        500
      );
    }
  }

  private async fetchFromRapidApi<T>(path: string, params: Record<string, string>): Promise<T> {
    const url = new URL(`https://${this.host}${path}`);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host,
          'Accept': 'application/json',
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      throw new InstagramError('PROVIDER_ERROR', `RapidAPI network request failed: ${msg}`, 502);
    }

    if (res.status === 404) {
      const errText = await res.text();
      if (errText.includes('does not exist') || errText.includes('Endpoint')) {
        throw new InstagramError('PROVIDER_ERROR', `Endpoint ${path} does not exist on RapidAPI host ${this.host}`, 404);
      }
      throw new InstagramError('PROFILE_NOT_FOUND', 'Target profile or content not found', 404);
    }

    if (res.status === 429) {
      throw new InstagramError('RATE_LIMITED', 'RapidAPI rate limit exceeded. Please upgrade plan or try again later.', 429);
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new InstagramError('PROVIDER_ERROR', `RapidAPI error [${res.status}]: ${errText.slice(0, 200)}`, res.status);
    }

    return (await res.json()) as T;
  }

  public async getProfile(username: string): Promise<ProviderResult<Profile>> {
    // Normalizes different RapidAPI & scraper endpoints (e.g. /v1/info, /info, or /userInfo)
    const json = await this.fetchFromRapidApi<any>('/v1/info', {
      username_or_id_or_url: username,
    });

    const user = json.result?.user || json.result?.profile || json.data || json.user || json.result || json;
    if (!user || (!user.username && !user.pk && !user.id)) {
      throw new InstagramError('PROFILE_NOT_FOUND', `Profile @${username} not found on Instagram`, 404);
    }

    return {
      data: {
        username: user.username || username,
        fullName: user.full_name || user.fullName || user.name,
        avatarUrl: user.profile_pic_url_hd || user.profile_pic_url || user.avatarUrl,
        biography: user.biography || user.bio,
        followers: user.follower_count ?? user.followers ?? user.followersCount,
        following: user.following_count ?? user.following ?? user.followingCount,
        postsCount: user.media_count ?? user.posts_count ?? user.postsCount,
        verified: Boolean(user.is_verified || user.isVerified || user.verified),
        externalUrl: user.external_url || user.externalUrl,
        isPrivate: Boolean(user.is_private || user.isPrivate),
        userId: String(user.pk || user.id || ''),
      },
    };
  }

  public async getStories(username: string): Promise<ProviderResult<StoryResult[]>> {
    const json = await this.fetchFromRapidApi<any>('/v1/stories', {
      username_or_id_or_url: username,
    });

    const items = json.result?.items || json.data?.items || json.items || json.stories || [];
    if (!Array.isArray(items) || items.length === 0) {
      return { data: [], notice: `No active stories found for @${username} (stories expire after 24 hours)` };
    }

    const stories: StoryResult[] = items.map((item: any, idx: number) => {
      const isVideo = Boolean(item.type === 'video' || item.is_video || item.media_type === 2 || item.video_url);
      
      let url = '';
      let thumbUrl = '';

      if (Array.isArray(item.media) && item.media.length > 0) {
        const m = item.media[0];
        url = m.versions?.[0]?.url || m.url || '';
        thumbUrl = m.thumbnailUrl || m.versions?.[0]?.url || url;
      } else {
        url = isVideo
          ? item.video_versions?.[0]?.url || item.video_url || item.display_url
          : item.image_versions2?.candidates?.[0]?.url || item.display_url || item.thumbnail_url;
        thumbUrl = item.image_versions2?.candidates?.[0]?.url || item.thumbnail_url || url;
      }

      return {
        id: String(item.id || item.pk || `story_${idx}`),
        storyId: String(item.id || item.pk || `story_${idx}`),
        type: isVideo ? 'video' : 'image',
        url: url || '',
        thumbnailUrl: thumbUrl || url,
        width: item.original_width || item.dimensions?.width,
        height: item.original_height || item.dimensions?.height,
        duration: item.video_duration,
        timestamp: item.taken_at ? new Date(item.taken_at * 1000).toISOString() : (item.timestamp ? new Date(item.timestamp * 1000).toISOString() : undefined),
        expiresAt: item.expiring_at ? new Date(item.expiring_at * 1000).toISOString() : undefined,
      };
    });

    return { data: stories };
  }

  public async getHighlights(username: string): Promise<HighlightResult[]> {
    const json = await this.fetchFromRapidApi<any>('/v1/highlights', {
      username_or_id_or_url: username,
    });

    const trays = json.result?.items || json.data?.items || json.items || json.tray || [];
    if (!Array.isArray(trays)) return [];

    return trays.map((tray: any) => {
      const rawItems = tray.items || tray.media || [];
      const items: MediaItem[] = rawItems.map((item: any) => {
        const isVideo = Boolean(item.type === 'video' || item.is_video || item.media_type === 2);
        let url = '';
        let thumbUrl = '';

        if (item.versions && item.versions.length > 0) {
          url = item.versions[0].url || '';
          thumbUrl = item.thumbnailUrl || item.versions[0].url;
        } else {
          url = isVideo
            ? item.video_versions?.[0]?.url || item.video_url
            : item.image_versions2?.candidates?.[0]?.url || item.display_url;
          thumbUrl = item.image_versions2?.candidates?.[0]?.url || item.thumbnail_url || url;
        }

        return {
          id: String(item.id || item.pk),
          type: isVideo ? 'video' : 'image',
          url: url || '',
          thumbnailUrl: thumbUrl || url,
          timestamp: item.taken_at ? new Date(item.taken_at * 1000).toISOString() : undefined,
        };
      });

      return {
        id: String(tray.id || tray.pk),
        title: tray.title || 'Highlight',
        coverUrl: tray.cover_media?.cropped_image_version?.url || tray.cover_media_crop_info?.crop_url || tray.coverUrl || '',
        mediaCount: items.length || tray.media_count || 0,
        items,
      };
    });
  }

  public async getPosts(username: string, _maxId?: string): Promise<ProviderResult<PostResult[]>> {
    const json = await this.fetchFromRapidApi<any>('/v1/posts', {
      username_or_id_or_url: username,
    });

    const items = json.result?.items || json.data?.items || json.items || [];
    if (!Array.isArray(items)) return { data: [] };

    const posts: PostResult[] = items.map((item: any) => {
      const isCarousel = item.type === 'carousel' || item.media_type === 8 || Boolean(item.carousel_media);
      const isVideo = !isCarousel && (item.type === 'video' || item.media_type === 2 || Boolean(item.video_url));

      let carouselMedia: MediaItem[] | undefined;
      let mediaUrl = '';
      let thumbUrl = '';

      // Handle AnonyIG / ScraperAPI format (item.media array)
      if (Array.isArray(item.media) && item.media.length > 0) {
        if (isCarousel) {
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
          mediaUrl = carouselMedia?.[0]?.url || '';
          thumbUrl = carouselMedia?.[0]?.thumbnailUrl || mediaUrl;
        } else {
          const m = item.media[0];
          mediaUrl = m.versions?.[0]?.url || m.url || '';
          thumbUrl = m.thumbnailUrl || mediaUrl;
        }
      } else if (isCarousel && Array.isArray(item.carousel_media)) {
        // Handle traditional RapidAPI format (item.carousel_media)
        carouselMedia = item.carousel_media.map((sub: any) => ({
          id: String(sub.id || sub.pk),
          type: (sub.media_type === 2 || sub.video_url) ? 'video' : 'image',
          url: (sub.video_versions?.[0]?.url || sub.video_url) || (sub.image_versions2?.candidates?.[0]?.url || sub.display_url),
          thumbnailUrl: sub.image_versions2?.candidates?.[0]?.url || sub.thumbnail_url,
        }));
        mediaUrl = carouselMedia?.[0]?.url || '';
        thumbUrl = carouselMedia?.[0]?.thumbnailUrl || mediaUrl;
      } else {
        mediaUrl = isVideo
          ? item.video_versions?.[0]?.url || item.video_url
          : item.image_versions2?.candidates?.[0]?.url || item.display_url || item.url;
        thumbUrl = item.image_versions2?.candidates?.[0]?.url || item.thumbnail_url || mediaUrl;
      }

      return {
        id: String(item.id || item.pk || item.code),
        type: isCarousel ? 'carousel' : (isVideo ? 'video' : 'image'),
        url: mediaUrl || '',
        thumbnailUrl: thumbUrl || mediaUrl,
        caption: item.caption?.text || item.caption,
        timestamp: item.taken_at ? new Date(item.taken_at * 1000).toISOString() : (item.timestamp ? new Date(item.timestamp * 1000).toISOString() : undefined),
        likeCount: item.like_count ?? item.likeCount,
        commentCount: item.comment_count ?? item.commentCount,
        carouselMedia,
      };
    });

    return { data: posts };
  }

  public async getReels(username: string): Promise<ProviderResult<ReelResult[]>> {
    const json = await this.fetchFromRapidApi<any>('/v1/reels', {
      username_or_id_or_url: username,
    });

    const items = json.result?.items || json.data?.items || json.items || [];
    if (!Array.isArray(items)) return { data: [] };

    const reels: ReelResult[] = items.map((item: any) => {
      const media = item.media || item;
      let videoUrl = '';
      let thumbUrl = '';

      if (Array.isArray(item.media) && item.media.length > 0) {
        const m = item.media[0];
        videoUrl = m.versions?.[0]?.url || m.url || '';
        thumbUrl = m.thumbnailUrl || videoUrl;
      } else {
        videoUrl = media.video_versions?.[0]?.url || media.video_url || media.url;
        thumbUrl = media.image_versions2?.candidates?.[0]?.url || media.thumbnail_url || videoUrl;
      }

      return {
        id: String(media.id || media.pk || media.code || item.id),
        type: 'video',
        url: videoUrl || '',
        thumbnailUrl: thumbUrl || '',
        caption: media.caption?.text || media.caption,
        timestamp: media.taken_at ? new Date(media.taken_at * 1000).toISOString() : (item.timestamp ? new Date(item.timestamp * 1000).toISOString() : undefined),
        duration: media.video_duration || item.duration,
        viewCount: media.view_count || media.play_count || item.viewCount,
        playCount: media.play_count || item.playCount,
        audioTitle: media.music_metadata?.music_info?.music_asset_info?.title || media.clips_metadata?.audio_type,
        audioArtist: media.music_metadata?.music_info?.music_asset_info?.display_artist,
      };
    });

    return { data: reels };
  }
}
