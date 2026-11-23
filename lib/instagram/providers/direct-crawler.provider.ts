import { InstagramProvider, ProviderResult } from './provider.interface';
import {
  Profile,
  StoryResult,
  HighlightResult,
  PostResult,
  ReelResult,
} from '../types';
import { InstagramError } from '../errors';

export class DirectCrawlerProvider implements InstagramProvider {
  public readonly name = 'DirectCrawler (Built-in SSR Engine)';
  public readonly isDemo = false;

  public async getProfile(username: string): Promise<ProviderResult<Profile>> {
    const url = `https://www.instagram.com/${encodeURIComponent(username)}/`;
    let response: Response;

    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      throw new InstagramError('PROVIDER_ERROR', `Failed to reach Instagram: ${msg}`, 502);
    }

    if (response.status === 404) {
      throw new InstagramError('PROFILE_NOT_FOUND', `User @${username} does not exist or was deleted`, 404);
    }

    if (response.status === 429) {
      throw new InstagramError('RATE_LIMITED', 'Instagram direct rate limit encountered. Configure RapidAPI provider for unlimited proxy access.', 429);
    }

    if (!response.ok) {
      throw new InstagramError('PROVIDER_ERROR', `Instagram returned status ${response.status}`, response.status);
    }

    const html = await response.text();

    // Check if account is private
    const isPrivate = html.includes('"is_private":true') || html.includes('This Account is Private');

    // Extract OpenGraph meta tags
    const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] || '';
    const ogDesc = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1] || '';
    const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] || '';

    if (!ogTitle && !html.includes('biography') && !html.includes('full_name')) {
      throw new InstagramError('PROFILE_NOT_FOUND', `Could not find public profile for @${username}`, 404);
    }

    // Parse counts from og:description: "685M Followers, 178 Following, 8,656 Posts - See Instagram photos..."
    let followers: number | undefined;
    let following: number | undefined;
    let postsCount: number | undefined;

    const statsMatch = ogDesc.match(/([\d.,KMkm]+)\s*Followers,\s*([\d.,KMkm]+)\s*Following,\s*([\d.,KMkm]+)\s*Posts/i);
    if (statsMatch) {
      followers = this.parseCount(statsMatch[1]);
      following = this.parseCount(statsMatch[2]);
      postsCount = this.parseCount(statsMatch[3]);
    }

    // Parse full name and bio from script tags or og:title
    let fullName = html.match(/"full_name":"([^"]+)"/)?.[1];
    if (!fullName && ogTitle) {
      // og:title format: "Instagram (@instagram) • Instagram photos and videos"
      const nameMatch = ogTitle.match(/^(.*?)\s*\(@/);
      if (nameMatch) {
        fullName = this.unescapeHtml(nameMatch[1]);
      }
    }

    let biography = html.match(/"biography":"([^"]+)"/)?.[1];
    if (biography) {
      try {
        biography = JSON.parse(`"${biography}"`);
      } catch {
        // use raw if JSON parse fails
      }
    }

    const userId = html.match(/"id":"(\d{5,25})"/)?.[1];
    const isVerified = html.includes('"is_verified":true');

    // Decode HTML entities in avatar URL
    const avatarUrl = this.unescapeHtml(ogImage);

    return {
      data: {
        username,
        fullName: fullName || username,
        avatarUrl: avatarUrl || undefined,
        biography: biography || undefined,
        followers,
        following,
        postsCount,
        verified: isVerified,
        isPrivate,
        userId,
      },
      notice: 'Retrieved live via Direct Instagram SSR Engine (No external API key used)',
    };
  }

  public async getStories(username: string): Promise<ProviderResult<StoryResult[]>> {
    throw new InstagramError(
      'UNSUPPORTED_FEATURE',
      `Instagram does not serve Stories to unauthenticated web crawlers. To view live Stories for @${username}, configure an API key (e.g. RapidAPI) in .env or toggle Demo Mode to inspect media playback.`,
      501
    );
  }

  public async getHighlights(username: string): Promise<HighlightResult[]> {
    throw new InstagramError(
      'UNSUPPORTED_FEATURE',
      `Instagram does not serve Highlights to unauthenticated web crawlers. To view live Highlights for @${username}, configure an API key (e.g. RapidAPI) in .env or toggle Demo Mode.`,
      501
    );
  }

  public async getPosts(username: string, _maxId?: string): Promise<ProviderResult<PostResult[]>> {
    throw new InstagramError(
      'UNSUPPORTED_FEATURE',
      `Full timeline media extraction requires authenticated proxy / RapidAPI provider. Configure INSTAGRAM_RAPIDAPI_KEY in .env or toggle Demo Mode to test full post/video media viewing.`,
      501
    );
  }

  public async getReels(username: string, _maxId?: string): Promise<ProviderResult<ReelResult[]>> {
    throw new InstagramError(
      'UNSUPPORTED_FEATURE',
      `Reels extraction requires authenticated proxy / RapidAPI provider. Configure INSTAGRAM_RAPIDAPI_KEY in .env or toggle Demo Mode to test full reels video streaming and download.`,
      501
    );
  }

  private parseCount(str: string): number {
    const clean = str.replace(/,/g, '').trim().toUpperCase();
    if (clean.endsWith('K')) {
      return Math.round(parseFloat(clean.slice(0, -1)) * 1000);
    }
    if (clean.endsWith('M')) {
      return Math.round(parseFloat(clean.slice(0, -1)) * 1000000);
    }
    if (clean.endsWith('B')) {
      return Math.round(parseFloat(clean.slice(0, -1)) * 1000000000);
    }
    return parseInt(clean, 10) || 0;
  }

  private unescapeHtml(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#064;/g, '@')
      .replace(/&#x2022;/g, '•')
      .replace(/&#39;/g, "'");
  }
}
