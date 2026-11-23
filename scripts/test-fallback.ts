import { InstagramService } from '../lib/instagram/services/instagram.service';
import { ProviderFactory } from '../lib/instagram/providers/factory';

async function testFallback() {
  console.log('Testing Automatic Fallback to DirectCrawlerProvider...');

  // Set invalid RapidAPI host so it fails
  process.env.INSTAGRAM_RAPIDAPI_KEY = 'invalid_key';
  process.env.INSTAGRAM_RAPIDAPI_HOST = 'invalid.host.doesnotexist.com';

  const res = await InstagramService.getProfile('instagram');
  console.log('Result success:', res.success);
  if (!res.success) {
    throw new Error('Fallback failed to retrieve profile: ' + JSON.stringify(res.error));
  }
  console.log('Username:', res.data?.username);
  console.log('Followers:', res.data?.followers);
  if (res.metadata) {
    console.log('Provider used:', res.metadata.provider);
    console.log('Notice:', res.metadata.notice);
  }

  if (res.data?.username !== 'instagram') {
    throw new Error('Profile username mismatch');
  }

  console.log('[PASS] Automatic fallback to DirectCrawler succeeded even when RapidAPI failed completely!');
}

testFallback().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
