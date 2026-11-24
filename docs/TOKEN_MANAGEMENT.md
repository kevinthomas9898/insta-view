# Token Pool & Interceptor Architecture

## 1. Principles of Token Security

1. **Zero Hardcoded Keys:** Under no circumstances are ScraperAPI keys committed to Git or hardcoded in source files. All keys are injected via environment variables.
2. **Universal Interceptor:** A centralized singleton ([lib/instagram/token-pool.ts](file:///d:/Kevin/Projects/Personal%20Projects/insta-view/lib/instagram/token-pool.ts)) manages all token loading, cleaning, round-robin distribution, and auto-failovers.
3. **No Individual Endpoint Modification:** Providers never manage tokens directly. They make API requests exclusively through `TokenInterceptor.execute()`.

---

## 2. Environment Variables Configuration

Set either or both in your `.env.local` or Vercel Project Settings:

```bash
# Multiple tokens separated by commas, semicolons, or newlines
SCRAPERAPI_TOKENS=key_alpha_123,key_beta_456,key_gamma_789

# Or a single primary token
SCRAPERAPI_TOKEN=key_primary_000
```

### Automatic Token Sanitization
The interceptor splits inputs using regex `/[,\s;\n\r]+/` and filters out empty strings or duplicate tokens automatically. If multiple keys are passed in `SCRAPERAPI_TOKEN` as comma-separated values, it cleans and parses each key individually.

---

## 3. How the Interceptor Works

```ts
import { tokenInterceptor } from '@/lib/instagram/token-pool';

// Execute an HTTP request with automatic token rotation & failover
const result = await tokenInterceptor.execute(async (token) => {
  const res = await fetch(`https://api.scraperapi.com/structured/instagram/user?api_key=${token}&username=${username}`);
  if (res.status === 400 || res.status === 401 || res.status === 403 || res.status === 429) {
    throw new Error(`PROVIDER_REJECTED_${res.status}`);
  }
  return res.json();
});
```

### Rotation & Failover Sequence
1. **Round-Robin Selection:** Requests cycle predictably across active tokens (`token_1 -> token_2 -> token_3 -> ...`).
2. **Quota / Error Demotion:** If a token throws a 401 (Invalid), 403 (Forbidden), 429 (Rate Limit), or 400 (Bad Request), the interceptor marks the token as failed and immediately re-attempts the request using the next available token in the pool.
3. **Graceful Fallback:** If all ScraperAPI tokens are depleted, the system automatically falls back to `DirectCrawlerProvider` (public SSR crawl) before resorting to `DemoProvider`.
