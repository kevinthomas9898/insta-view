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

    const contentType = upstreamRes.headers.get('content-type') || 'application/octet-stream';
    const contentLength = upstreamRes.headers.get('content-length');
    const contentRange = upstreamRes.headers.get('content-range');

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', contentType);
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }

    // Determine clean safe filename for download
    if (download) {
      const isVideo = contentType.includes('video') || validatedUrl.pathname.endsWith('.mp4') || Boolean(filename && filename.endsWith('.mp4'));
      const defaultExt = isVideo ? 'mp4' : 'jpg';
      const cleanFilename = (filename || `instagram_media.${defaultExt}`).replace(/[^a-zA-Z0-9._-]/g, '_');
      responseHeaders.set('Content-Disposition', `attachment; filename="${cleanFilename}"`);
      if (isVideo) {
        responseHeaders.set('Content-Type', 'video/mp4');
      }
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
