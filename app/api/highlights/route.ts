import { NextRequest, NextResponse } from 'next/server';
import { InstagramService } from '@/lib/instagram/services/instagram.service';
import { apiQuerySchema } from '@/lib/validation/schemas';
import { globalRateLimiter } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const parsed = apiQuerySchema.safeParse({
    username: searchParams.get('username') || '',
    demo: searchParams.get('demo') || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_USERNAME',
          message: parsed.error.issues[0]?.message || 'Invalid username',
        },
      },
      { status: 400 }
    );
  }

  const result = await InstagramService.getHighlights(parsed.data.username, parsed.data.demo);
  const status = result.success ? 200 : (result.error?.code === 'UNSUPPORTED_FEATURE' ? 501 : 400);

  return NextResponse.json(result, { status });
}
