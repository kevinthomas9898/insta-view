import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { addOptOutRecord } from '@/lib/storage/opt-out';
import { globalCache } from '@/lib/cache';
import { globalRateLimiter } from '@/lib/rate-limit';

const optOutSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50),
  email: z.string().email('Valid email is required'),
  reason: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  // Rate-limiting check: max 10 requests per minute per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateLimit = globalRateLimiter.check(`remove-profile:${ip}`);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again in a few moments.',
        },
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = optOutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message || 'Invalid input data',
          },
        },
        { status: 400 }
      );
    }

    const { username, email, reason, notes } = parsed.data;
    const cleanUsername = username.toLowerCase().replace(/^@/, '').trim();

    // 1. Add to persistent blocklist
    await addOptOutRecord({
      username: cleanUsername,
      email,
      reason,
      notes,
    });

    // 2. Invalidate all cached data for this username
    globalCache.delete(`profile:${cleanUsername}:live`);
    globalCache.delete(`profile:${cleanUsername}:demo`);
    globalCache.delete(`stories:${cleanUsername}:live`);
    globalCache.delete(`stories:${cleanUsername}:demo`);
    globalCache.delete(`highlights:${cleanUsername}:live`);
    globalCache.delete(`highlights:${cleanUsername}:demo`);
    globalCache.delete(`posts:${cleanUsername}:live`);
    globalCache.delete(`posts:${cleanUsername}:demo`);
    globalCache.delete(`reels:${cleanUsername}:live`);
    globalCache.delete(`reels:${cleanUsername}:demo`);

    return NextResponse.json({
      success: true,
      message: `Opt-out confirmed. @${cleanUsername} is now blocked from InstaView searches.`,
      username: cleanUsername,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error processing request';
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: msg,
        },
      },
      { status: 500 }
    );
  }
}
