import { InstagramError } from '../instagram/errors';

// Known safe CDN domains for Instagram and media proxies
const ALLOWED_MEDIA_DOMAINS = [
  'cdninstagram.com',
  'fbcdn.net',
  'instagram.com',
  'fbsbx.com',
  'akamaihd.net',
  'anonyig.com',
  'media.anonyig.com',
  'scraperapi.to',
  'wikimedia.org',
  'pexels.com',
  'images.pexels.com',
  'mozilla.net',
  'interactive-examples.mdn.mozilla.net',
  'w3schools.com',
  'commondatastorage.googleapis.com',
];

/**
 * Validates a media URL to prevent Server-Side Request Forgery (SSRF).
 * Blocks internal network IPs, non-HTTP(S) schemes, localhost, and unauthorized domains.
 */
export function validateMediaUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new InstagramError('INVALID_URL', 'The provided media URL is malformed', 400);
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new InstagramError('SSRF_BLOCKED', 'Invalid URL protocol', 400);
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block loopback, private ranges, metadata services
  const blockedPatterns = [
    /^localhost$/,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./, // AWS/GCP instance metadata IP
    /^0\./,
    /::1/,
    /fc00:/,
    /fe80:/,
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(hostname)) {
      throw new InstagramError('SSRF_BLOCKED', 'Access to internal network addresses is forbidden', 403);
    }
  }

  // Check if domain ends with one of the allowed hostnames
  const isAllowed = ALLOWED_MEDIA_DOMAINS.some(
    (allowed) => hostname === allowed || hostname.endsWith('.' + allowed)
  );

  if (!isAllowed) {
    // If not in standard Instagram/safe CDN list, only allow if explicitly configured in environment
    const extraAllowed = (process.env.ALLOWED_MEDIA_DOMAINS || '')
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);

    const isExtraAllowed = extraAllowed.some(
      (allowed) => hostname === allowed || hostname.endsWith('.' + allowed)
    );

    if (!isExtraAllowed) {
      throw new InstagramError(
        'SSRF_BLOCKED',
        `Domain ${hostname} is not in the allowed media delivery hosts`,
        403
      );
    }
  }

  return parsed;
}
