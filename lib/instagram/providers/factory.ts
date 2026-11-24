import { InstagramProvider } from './provider.interface';
import { DirectCrawlerProvider } from './direct-crawler.provider';
import { RapidApiProvider } from './rapidapi.provider';
import { ScraperApiProvider } from './scraperapi.provider';
import { DemoProvider } from './demo.provider';

export interface ProviderOptions {
  forceDemo?: boolean;
}

export class ProviderFactory {
  public static getProvider(options?: ProviderOptions): InstagramProvider {
    // 1. Explicit demo requested via query flag or env var
    if (options?.forceDemo || process.env.INSTAGRAM_PROVIDER === 'demo') {
      return new DemoProvider();
    }

    // 2. Explicit direct crawler requested via env
    if (process.env.INSTAGRAM_PROVIDER === 'direct') {
      return new DirectCrawlerProvider();
    }

    // 3. ScraperAPI explicitly set or token present
    const scraperToken = (process.env.SCRAPERAPI_TOKEN || process.env.SCRAPERAPI_TOKENS || '').trim();
    if (
      process.env.INSTAGRAM_PROVIDER === 'scraperapi' ||
      (scraperToken !== '' && process.env.INSTAGRAM_PROVIDER !== 'rapidapi.com')
    ) {
      return new ScraperApiProvider();
    }

    // 4. RapidAPI configured with API key
    if (process.env.INSTAGRAM_RAPIDAPI_KEY && process.env.INSTAGRAM_RAPIDAPI_KEY.trim() !== '') {
      return new RapidApiProvider();
    }

    // 5. Built-in zero-key direct public crawler
    return new DirectCrawlerProvider();
  }
}
