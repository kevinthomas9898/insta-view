import { NextRequest, NextResponse } from 'next/server';
import { globalRateLimiter } from '@/lib/rate-limit';
import { transcribeMedia } from '@/lib/transcribe/whisper';
import { extractReelStreamUrl } from '@/lib/transcribe/media-resolver';

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
    const isImageOrDummy =
      !targetUrl ||
      targetUrl.includes('.jpg') ||
      targetUrl.includes('.jpeg') ||
      targetUrl.includes('.png') ||
      targetUrl.includes('flower.mp4') ||
      targetUrl.includes('pexels') ||
      targetUrl.includes('dashinit');

    // Always ensure we have a genuine progressive stream when shortcode is available
    if (shortcode && (isImageOrDummy || !targetUrl.includes('fbcdn.net'))) {
      const stream = await extractReelStreamUrl(shortcode);
      if (stream) {
        targetUrl = stream;
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

    const formatTime = (sec: number) => {
      const hrs = Math.floor(sec / 3600).toString().padStart(2, '0');
      const mins = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
      const secs = Math.floor(sec % 60).toString().padStart(2, '0');
      const ms = Math.floor((sec % 1) * 1000).toString().padStart(3, '0');
      return `${hrs}:${mins}:${secs},${ms}`;
    };

    // Generate formatted SRT strings for both spoken (Hinglish/Gujlish) and exact English translation
    const srt = transcript.segments
      .map((s, idx) => `${idx + 1}\n${formatTime(s.start)} --> ${formatTime(s.end)}\n${s.text}\n`)
      .join('\n');

    const translationSrt = transcript.hasTranslation
      ? transcript.segments
          .map((s, idx) => `${idx + 1}\n${formatTime(s.start)} --> ${formatTime(s.end)}\n${s.translatedText || s.text}\n`)
          .join('\n')
      : undefined;

    return NextResponse.json({
      success: true,
      data: {
        ...transcript,
        srt,
        translationSrt,
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
