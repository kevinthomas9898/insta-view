import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/utils/site';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/media'], // Prevent bot bandwidth exhaustion on proxy streaming
      },
      // Explicitly allow AI Answer Engines & Generative Search Bots (AEO & GEO)
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Google-Extended',
          'Applebot',
          'Bytespider',
          'CCBot',
        ],
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
