import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/utils/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const currentDate = new Date();

  // Note: Google strictly prohibits hash fragments (#stories) in sitemap URLs.
  // Only actual valid URLs on this exact domain are allowed.
  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];
}
