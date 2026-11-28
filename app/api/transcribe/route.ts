import { NextRequest, NextResponse } from 'next/server';
import { globalRateLimiter } from '@/lib/rate-limit';
import { transcribeMedia } from '@/lib/transcribe/whisper';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';
  const rateCheck = globalRateLimiter.check(ip);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: `Too many requests. Please wait ${Math.ceil(rateCheck.resetMs / 1000)} seconds.`,
        },
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { mediaUrl, shortcode, caption } = body;

    if (!mediaUrl && !shortcode) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_INPUT',
            message: 'A valid mediaUrl or reel shortcode is required.',
          },
        },
        { status: 400 }
      );
    }

    let targetUrl = mediaUrl;

    // If only shortcode provided, resolve it
    if (!targetUrl && shortcode) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ig-storyviewer.vercel.app';
      const resolveRes = await fetch(`${siteUrl}/api/resolve?shortcode=${encodeURIComponent(shortcode)}&type=reel`);
      if (resolveRes.ok) {
        const resolveData = await resolveRes.json();
        targetUrl = resolveData?.data?.item?.url;
      }
    }

    if (!targetUrl) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MEDIA_NOT_FOUND',
            message: 'Could not locate playable media stream for transcription.',
          },
        },
        { status: 404 }
      );
    }

    const transcript = await transcribeMedia(targetUrl, shortcode, caption);

    // Generate formatted SRT string
    const srt = transcript.segments
      .map((s, idx) => {
        const formatTime = (sec: number) => {
          const hrs = Math.floor(sec / 3600).toString().padStart(2, '0');
          const mins = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
          const secs = Math.floor(sec % 60).toString().padStart(2, '0');
          const ms = Math.floor((sec % 1) * 1000).toString().padStart(3, '0');
          return `${hrs}:${mins}:${secs},${ms}`;
        };
        return `${idx + 1}\n${formatTime(s.start)} --> ${formatTime(s.end)}\n${s.text}\n`;
      })
      .join('\n');

    return NextResponse.json({
      success: true,
      data: {
        ...transcript,
        srt,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Transcription processing failed.';
    console.error('[API /transcribe Error]:', message);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TRANSCRIPTION_FAILED',
          message,
        },
      },
      { status: 500 }
    );
  }
}
