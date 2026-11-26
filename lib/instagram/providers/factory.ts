import { InstagramProvider } from './provider.interface';
import { DirectCrawlerProvider } from './direct-crawler.provider';
import { RapidApiProvider } from './rapidapi.provider';
import { ScraperApiProvider } from './scraperapi.provider';
import { DemoProvider } from './demo.provider';

export interface ProviderOptions {
  forceDemo?: boolean;
}

export interface ProviderStatus {
  name: string;
  configured: boolean;
  isPrimary: boolean;
  type: string;
}

export class ProviderFactory {
  public static getProvider(options?: ProviderOptions): InstagramProvider {
    return this.getFallbackChain(options)[0];
  }

  /**
   * Returns an ordered list of providers for automatic failover.
   * If a provider encounters a 429, timeout, or 502, the service can fall back
   * seamlessly to the next provider in the chain.
   */
  public static getFallbackChain(options?: ProviderOptions): InstagramProvider[] {
    // 1. Explicit demo requested
    if (options?.forceDemo || process.env.INSTAGRAM_PROVIDER === 'demo') {
      return [new DemoProvider()];
    }

    const chain: InstagramProvider[] = [];
    const hasRapidApi = Boolean(process.env.INSTAGRAM_RAPIDAPI_KEY && process.env.INSTAGRAM_RAPIDAPI_KEY.trim() !== '');
    const scraperToken = (process.env.SCRAPERAPI_TOKEN || process.env.SCRAPERAPI_TOKENS || '').trim();
    const hasScraperApi = scraperToken !== '';

    // Primary selection based on explicit configuration
    if (process.env.INSTAGRAM_PROVIDER === 'direct') {
      chain.push(new DirectCrawlerProvider());
      if (hasRapidApi) chain.push(new RapidApiProvider());
      if (hasScraperApi) chain.push(new ScraperApiProvider());
    } else if (process.env.INSTAGRAM_PROVIDER === 'scraperapi' || (!hasRapidApi && hasScraperApi)) {
      chain.push(new ScraperApiProvider());
      if (hasRapidApi) chain.push(new RapidApiProvider());
      chain.push(new DirectCrawlerProvider());
    } else if (hasRapidApi) {
      chain.push(new RapidApiProvider());
      if (hasScraperApi) chain.push(new ScraperApiProvider());
      chain.push(new DirectCrawlerProvider());
    } else {
      if (hasScraperApi) chain.push(new ScraperApiProvider());
      chain.push(new DirectCrawlerProvider());
    }

    // Direct crawler is always guaranteed in the chain
    if (!chain.some((p) => p instanceof DirectCrawlerProvider)) {
      chain.push(new DirectCrawlerProvider());
    }

    return chain;
  }

  /**
   * Returns the configuration health status of all supported providers.
   */
  public static getProviderStatuses(): ProviderStatus[] {
    const hasRapidApi = Boolean(process.env.INSTAGRAM_RAPIDAPI_KEY && process.env.INSTAGRAM_RAPIDAPI_KEY.trim() !== '');
    const scraperToken = (process.env.SCRAPERAPI_TOKEN || process.env.SCRAPERAPI_TOKENS || '').trim();
    const hasScraperApi = scraperToken !== '';
    const activeProvider = this.getProvider();

    return [
      {
        name: 'Direct Crawler (SSR)',
        configured: true,
        isPrimary: activeProvider instanceof DirectCrawlerProvider,
        type: 'Zero-key Public Instagram Parser',
      },
      {
        name: 'RapidAPI Provider',
        configured: hasRapidApi,
        isPrimary: activeProvider instanceof RapidApiProvider,
        type: 'Proxy API Gateway',
      },
      {
        name: 'ScraperAPI Provider',
        configured: hasScraperApi,
        isPrimary: activeProvider instanceof ScraperApiProvider,
        type: 'Rotating Token Proxy Pool',
      },
      {
        name: 'Demo Mock Provider',
        configured: true,
        isPrimary: activeProvider instanceof DemoProvider,
        type: 'Offline Fixtures',
      },
    ];
  }
}
