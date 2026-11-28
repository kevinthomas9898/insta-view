import { spawn } from 'child_process';
import { globalCache, CACHE_TTL } from '@/lib/cache';

/**
 * Extracts a high-definition progressive video/audio stream URL
 * from an Instagram Reel shortcode or link.
 */
export async function extractReelStreamUrl(shortcodeOrUrl: string): Promise<string | null> {
  const shortcode = shortcodeOrUrl.replace(/^.*\/reels?\/([A-Za-z0-9_-]+).*$/, '$1').trim();
  const cacheKey = `reel_stream:${shortcode}`;

  const cached = globalCache.get<string>(cacheKey);
  if (cached) {
    return cached;
  }

  const targetUrl = shortcodeOrUrl.startsWith('http')
    ? shortcodeOrUrl
    : `https://www.instagram.com/reel/${encodeURIComponent(shortcode)}/`;

  return new Promise((resolve) => {
    let resolved = false;

    const child = spawn('python', ['-m', 'yt_dlp', '-g', targetUrl], {
      windowsHide: true,
    });

    let stdout = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.on('error', () => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    });

    child.on('close', (code) => {
      if (!resolved) {
        resolved = true;
        if (code === 0 && stdout) {
          const lines = stdout.trim().split('\n').map((l) => l.trim()).filter(Boolean);
          const progressiveUrl = lines[0];
          if (progressiveUrl && progressiveUrl.startsWith('http')) {
            globalCache.set(cacheKey, progressiveUrl, CACHE_TTL.REELS);
            resolve(progressiveUrl);
            return;
          }
        }
        resolve(null);
      }
    });

    // Safety timeout after 15 seconds
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try {
          child.kill();
        } catch {}
        resolve(null);
      }
    }, 15000);
  });
}
