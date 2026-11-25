/**
 * Smart Instagram URL & Input Resolver
 * Intelligently extracts usernames, media types (stories, reels, posts),
 * and target tabs when users paste direct Instagram links or type handles.
 */

export interface ParsedInstagramInput {
  raw: string;
  username?: string;
  type: 'profile' | 'story' | 'reel' | 'post';
  targetTab: 'stories' | 'highlights' | 'posts' | 'reels';
  shortcode?: string;
  storyId?: string;
}

export function parseInstagramInput(input: string): ParsedInstagramInput {
  const trimmed = (input || '').trim();
  if (!trimmed) {
    return { raw: '', type: 'profile', targetTab: 'stories' };
  }

  // Handle full or partial URLs
  try {
    const urlCandidate =
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : trimmed.toLowerCase().includes('instagram.com') || trimmed.toLowerCase().includes('instagr.am')
        ? `https://${trimmed.replace(/^\/+/, '')}`
        : null;

    if (urlCandidate) {
      const url = new URL(urlCandidate);
      const pathname = url.pathname.replace(/\/+$/, '');
      const segments = pathname.split('/').filter(Boolean);

      // Pattern 1: /stories/:username/:storyId?
      if (segments[0] === 'stories' && segments[1]) {
        return {
          raw: trimmed,
          username: segments[1].replace(/^@/, ''),
          storyId: segments[2],
          type: 'story',
          targetTab: 'stories',
        };
      }

      // Pattern 2: /reel/:shortcode or /reels/:shortcode or /tv/:shortcode
      if ((segments[0] === 'reel' || segments[0] === 'reels' || segments[0] === 'tv') && segments[1]) {
        return {
          raw: trimmed,
          shortcode: segments[1],
          type: 'reel',
          targetTab: 'reels',
        };
      }

      // Pattern 3: /p/:shortcode
      if (segments[0] === 'p' && segments[1]) {
        return {
          raw: trimmed,
          shortcode: segments[1],
          type: 'post',
          targetTab: 'posts',
        };
      }

      // Pattern 4: /share/reel/:shortcode or /share/p/:shortcode
      if (segments[0] === 'share' && segments[1] && segments[2]) {
        const isReel = segments[1] === 'reel' || segments[1] === 'reels';
        return {
          raw: trimmed,
          shortcode: segments[2],
          type: isReel ? 'reel' : 'post',
          targetTab: isReel ? 'reels' : 'posts',
        };
      }

      // Pattern 5: /:username/reel/:shortcode or /:username/p/:shortcode
      const reservedPaths = ['explore', 'direct', 'accounts', 'about', 'developer', 'reels', 'p', 'stories', 'share', 'tv'];
      if (segments[0] && !reservedPaths.includes(segments[0].toLowerCase())) {
        const user = segments[0].replace(/^@/, '');
        if (segments[1] && (segments[1] === 'reel' || segments[1] === 'reels')) {
          return {
            raw: trimmed,
            username: user,
            shortcode: segments[2],
            type: 'reel',
            targetTab: 'reels',
          };
        }
        if (segments[1] && segments[1] === 'p') {
          return {
            raw: trimmed,
            username: user,
            shortcode: segments[2],
            type: 'post',
            targetTab: 'posts',
          };
        }

        // Standard profile: /:username
        return {
          raw: trimmed,
          username: user,
          type: 'profile',
          targetTab: 'stories',
        };
      }
    }
  } catch {
    // URL parsing failed; fallback to handle cleaning
  }

  // Clean standard @username or raw text
  let cleaned = trimmed;
  cleaned = cleaned.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '');
  cleaned = cleaned.replace(/\/.*$/, '');
  cleaned = cleaned.replace(/^@+/, '');
  cleaned = cleaned.replace(/[^a-zA-Z0-9._]/g, '');

  return {
    raw: trimmed,
    username: cleaned,
    type: 'profile',
    targetTab: 'stories',
  };
}
