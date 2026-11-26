import { NextResponse } from 'next/server';
import { ProviderFactory } from '@/lib/instagram/providers/factory';
import { globalCache } from '@/lib/cache';
import { globalRateLimiter } from '@/lib/rate-limit';
import { getOptOutCount } from '@/lib/storage/opt-out';

const startTime = Date.now();

export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const optOutCount = await getOptOutCount();

  return NextResponse.json(
    {
      status: 'healthy',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds,
      cache: {
        engine: globalCache.isRedisEnabled() ? 'Upstash Redis (L2) + Memory (L1)' : 'In-Memory Cache (L1)',
        redisEnabled: globalCache.isRedisEnabled(),
        itemsInMemory: globalCache.size(),
      },
      rateLimiter: {
        distributed: globalRateLimiter.isRedisEnabled(),
      },
      providers: ProviderFactory.getProviderStatuses(),
      compliance: {
        optOutBlocklistActive: true,
        optedOutProfilesCount: optOutCount,
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
