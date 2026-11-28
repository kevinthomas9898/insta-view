import http from 'http';
import https from 'https';
import { globalCache, CACHE_TTL } from '@/lib/cache';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

function browserHeaders(cookie?: string): Record<string, string> {
  const h: Record<string, string> = {
    'user-agent': UA,
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'accept-language': 'en-US,en;q=0.9',
    'accept-encoding': 'identity',
    'sec-ch-ua': '"Chromium";v="126", "Google Chrome";v="126", "Not;A=Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'upgrade-insecure-requests': '1',
  };
  if (cookie) h.cookie = cookie;
  return h;
}

const cleanUrl = (u?: string | null): string | null =>
  u ? String(u).replace(/\\u002F/g, '/').replace(/\\/g, '').replace(/&amp;/g, '&') : null;

class CookieJar {
  private map = new Map<string, string>();

  absorb(headers: http.IncomingHttpHeaders) {
    const lines = headers['set-cookie'];
    if (!Array.isArray(lines)) return;
    for (const line of lines) {
      const pair = String(line).split(';')[0];
      const i = pair.indexOf('=');
      if (i > 0) this.map.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
    }
  }

  toString(): string {
    return [...this.map.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }
}

function requestOnce(urlStr: string, jar: CookieJar): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    let parsed: URL;
    try {
      parsed = new URL(urlStr);
    } catch {
      reject(new Error('Invalid URL: ' + urlStr));
      return;
    }
    const lib = parsed.protocol === 'http:' ? http : https;
    const req = lib.request(
      parsed,
      {
        method: 'GET',
        headers: browserHeaders(jar.toString()),
        timeout: 15000,
      },
      (res) => {
        jar.absorb(res.headers);
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
        res.on('end', () =>
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf8'),
          })
        );
        res.on('error', reject);
      }
    );
    req.on('timeout', () => req.destroy(new Error('Request timed out')));
    req.on('error', reject);
    req.end();
  });
}

async function requestFollowingRedirects(url: string, jar: CookieJar, maxRedirects = 6) {
  let current = url;
  for (let i = 0; i <= maxRedirects; i++) {
    const res = await requestOnce(current, jar);
    const location = res.headers && res.headers.location;
    if (res.status >= 300 && res.status < 400 && location && i < maxRedirects) {
      current = new URL(location, current).toString();
      continue;
    }
    return { status: res.status, finalUrl: current, html: res.body };
  }
  return { status: 0, finalUrl: current, html: '' };
}

function* jsonBlobs(html: string) {
  const re = /<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) yield m[1];
}

function walkObjects(node: unknown, depth: number, visit: (obj: Record<string, any>) => void) {
  if (depth > 28) return;
  if (typeof node === 'string') {
    const t = node.trim();
    if (
      t.length > 2 &&
      t.length < 2_000_000 &&
      ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']')))
    ) {
      try {
        walkObjects(JSON.parse(t), depth + 1, visit);
      } catch {}
    }
    return;
  }
  if (!node || typeof node !== 'object') return;
  visit(node as Record<string, any>);
  for (const v of Object.values(node)) walkObjects(v, depth + 1, visit);
}

function extractMediaFromHtml(html: string, wantCode: string): any {
  const candidates: any[] = [];
  for (const blob of jsonBlobs(html)) {
    let root: unknown;
    try {
      root = JSON.parse(blob);
    } catch {
      continue;
    }
    walkObjects(root, 0, (o) => {
      if (
        !Array.isArray(o) &&
        (o.video_versions || o.image_versions2 || o.carousel_media) &&
        (o.code || o.pk) &&
        o.user
      ) {
        candidates.push(o);
      }
    });
  }
  if (!candidates.length) return null;
  return (
    candidates.find((c) => wantCode && c.code === wantCode && typeof c.video_duration === 'number') ||
    candidates.find((c) => wantCode && c.code === wantCode) ||
    candidates.find((c) => typeof c.video_duration === 'number') ||
    candidates[0]
  );
}

function parseShortcode(input: string): string | null {
  const s = String(input || '').trim();
  const m = s.match(/instagram\.com\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{8,15}$/.test(s)) return s;
  return null;
}

/**
 * Pure Node.js Serverless Instagram Reel Stream Extractor.
 * Zero external binaries (works on Vercel, Linux, Windows, macOS).
 */
export async function extractReelStreamUrl(shortcodeOrUrl: string): Promise<string | null> {
  const code = parseShortcode(shortcodeOrUrl);
  if (!code) return null;

  const cacheKey = `reel_stream:${code}`;
  const cached = globalCache.get<string>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const jar = new CookieJar();
    const pageUrl = `https://www.instagram.com/reel/${code}/`;
    let media: any = null;

    for (let attempt = 0; attempt < 2 && !media; attempt++) {
      const page = await requestFollowingRedirects(pageUrl, jar);
      if (page.html) {
        media = extractMediaFromHtml(page.html, code);
      }
      if (!media && attempt === 0) {
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    if (media && Array.isArray(media.video_versions) && media.video_versions.length > 0) {
      const videoUrl = cleanUrl(media.video_versions[0].url);
      if (videoUrl) {
        globalCache.set(cacheKey, videoUrl, CACHE_TTL.REELS);
        return videoUrl;
      }
    }
  } catch (err) {
    console.warn('[MediaResolver] Pure Node.js extraction failed, falling back:', err);
  }

  return null;
}
