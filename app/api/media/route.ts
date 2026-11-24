import { NextRequest, NextResponse } from 'next/server';
import { validateMediaUrl } from '@/lib/utils/url';
import { mediaQuerySchema } from '@/lib/validation/schemas';
import { log } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = mediaQuerySchema.safeParse({
    url: searchParams.get('url') || '',
    download: searchParams.get('download') || undefined,
    filename: searchParams.get('filename') || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_URL',
          message: parsed.error.issues[0]?.message || 'Invalid media parameters',
        },
      },
      { status: 400 }
    );
  }

  const { url, download, filename } = parsed.data;

  // SSRF Protection: strictly validate hostname and protocol
  let validatedUrl: URL;
  try {
    validatedUrl = validateMediaUrl(url);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Blocked media host';
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SSRF_BLOCKED',
          message: msg,
        },
      },
      { status: 403 }
    );
  }

  // Forward range request header if video playback is seeking
  const rangeHeader = request.headers.get('range');
  const upstreamHeaders: HeadersInit = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': '*/*',
  };

  // Only send Instagram referer if fetching from Instagram/Meta CDNs
  if (
    validatedUrl.hostname.includes('cdninstagram.com') ||
    validatedUrl.hostname.includes('fbcdn.net') ||
    validatedUrl.hostname.includes('instagram.com')
  ) {
    upstreamHeaders['Referer'] = 'https://www.instagram.com/';
  }

  if (rangeHeader) {
    upstreamHeaders['Range'] = rangeHeader;
  }

  try {
    const upstreamRes = await fetch(validatedUrl.toString(), {
      headers: upstreamHeaders,
    });

    if (!upstreamRes.ok && upstreamRes.status !== 206) {
      log('warn', {
        action: 'proxyMedia',
        upstreamStatus: upstreamRes.status,
        url: validatedUrl.hostname,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MEDIA_FETCH_FAILED',
            message: `Upstream media server returned ${upstreamRes.status} ${upstreamRes.statusText}`,
          },
        },
        { status: upstreamRes.status }
      );
    }

    const upstreamContentType = upstreamRes.headers.get('content-type') || 'application/octet-stream';
    const urlStr = validatedUrl.toString().toLowerCase();
    const isImage =
      upstreamContentType.includes('image') ||
      urlStr.includes('.jpg') ||
      urlStr.includes('.jpeg') ||
      urlStr.includes('.png') ||
      urlStr.includes('.webp') ||
      urlStr.includes('dst-jpg') ||
      urlStr.includes('dst-png') ||
      urlStr.includes('_photo') ||
      urlStr.includes('t51.2885-15') ||
      urlStr.includes('t51.82787-15');

    const isVideo =
      !isImage &&
      (upstreamContentType.includes('video') ||
        urlStr.includes('.mp4') ||
        urlStr.includes('video_dashinit') ||
        urlStr.includes('t51.2885-29'));

    const effectiveContentType = isVideo ? 'video/mp4' : upstreamContentType;

    const contentLength = upstreamRes.headers.get('content-length');
    const contentRange = upstreamRes.headers.get('content-range');

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', effectiveContentType);
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }

    // Determine clean safe filename for download
    if (download) {
      const defaultExt = isVideo ? 'mp4' : 'jpg';
      let cleanFilename = (filename || `instagram_media.${defaultExt}`).replace(/[^a-zA-Z0-9._-]/g, '_');

      // Safety guard: if the file is actually an image, ensure the extension is .jpg, not .mp4
      if (isImage && cleanFilename.toLowerCase().endsWith('.mp4')) {
        cleanFilename = cleanFilename.replace(/\.mp4$/i, '.jpg');
      }
      // Safety guard: if the file is actually a video, ensure the extension is .mp4
      if (isVideo && !cleanFilename.toLowerCase().endsWith('.mp4')) {
        cleanFilename = cleanFilename.replace(/\.[a-zA-Z0-9]+$/i, '') + '.mp4';
      }

      responseHeaders.set('Content-Disposition', `attachment; filename="${cleanFilename}"`);
      // Prevent browser disk caching of potentially interrupted or corrupt downloads
      responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      responseHeaders.set('Pragma', 'no-cache');
      responseHeaders.set('Expires', '0');
    } else {
      responseHeaders.set('Cache-Control', 'private, max-age=3600');
    }

    const statusCode = rangeHeader && upstreamRes.status === 206 ? 206 : 200;

    return new Response(upstreamRes.body, {
      status: statusCode,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network failure';
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'MEDIA_FETCH_FAILED',
          message: `Failed to stream media: ${msg}`,
        },
      },
      { status: 502 }
    );
  }
}
