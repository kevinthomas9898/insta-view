import { InstagramService } from '../lib/instagram/services/instagram.service';
import { DirectCrawlerProvider } from '../lib/instagram/providers/direct-crawler.provider';
import { DemoProvider } from '../lib/instagram/providers/demo.provider';
import { validateMediaUrl } from '../lib/utils/url';

async function runTestSuite() {
  console.log('====================================================');
  console.log('   INSTA-VIEW BACKEND TEST SUITE & VERIFICATION   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, extra?: unknown) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`, extra ?? '');
      failed++;
    }
  }

  // 1. Direct Live Crawler Provider (Live Public Instagram Profile)
  console.log('--- TEST GROUP 1: Direct Crawler Provider (Live Public SSR) ---');
  try {
    const crawler = new DirectCrawlerProvider();
    const liveProfile = await crawler.getProfile('instagram');
    
    assert(liveProfile.data.username === 'instagram', 'Live profile username matches');
    assert(Boolean(liveProfile.data.followers && liveProfile.data.followers > 100000000), `Live follower count retrieved (>100M): ${liveProfile.data.followers?.toLocaleString()}`);
    assert(Boolean(liveProfile.data.avatarUrl && liveProfile.data.avatarUrl.includes('cdninstagram.com')), `Live profile photo URL from Meta CDN: ${liveProfile.data.avatarUrl?.substring(0, 70)}...`);
    assert(Boolean(liveProfile.data.biography), `Live bio retrieved: "${liveProfile.data.biography}"`);
  } catch (err: unknown) {
    assert(false, 'Live crawler profile failed', err);
  }

  // 2. Demo Provider (Full Media Verification)
  console.log('\n--- TEST GROUP 2: Demo Provider (Media Verification) ---');
  try {
    const demo = new DemoProvider();

    // 2.1 Profile
    const demoProfile = await demo.getProfile('photography_daily');
    assert(demoProfile.data.username === 'photography_daily', 'Demo profile returns requested username');
    assert(demo.isDemo === true, 'Provider is flagged as demo');
    assert(demoProfile.notice?.includes('DEMO DATA') === true, 'Notice explicitly labels DEMO DATA');

    // 2.2 Stories
    const demoStories = await demo.getStories('photography_daily');
    assert(demoStories.data.length >= 3, `Demo stories returned: ${demoStories.data.length} items`);
    assert(demoStories.data.some((s) => s.type === 'video'), 'Stories include video media item');
    assert(demoStories.data.some((s) => s.type === 'image'), 'Stories include image media item');
    assert(Boolean(demoStories.data[0].url.startsWith('http')), 'Story URLs are valid HTTP(S) links');

    // 2.3 Highlights
    const demoHighlights = await demo.getHighlights('photography_daily');
    assert(demoHighlights.length >= 2, `Demo highlights returned: ${demoHighlights.length} albums`);
    assert(demoHighlights[0].items.length > 0, `Highlight album contains ${demoHighlights[0].items.length} items`);

    // 2.4 Posts (including Carousel & Video)
    const demoPosts = await demo.getPosts('photography_daily');
    assert(demoPosts.data.length >= 3, `Demo posts returned: ${demoPosts.data.length} posts`);
    const carouselPost = demoPosts.data.find((p) => p.type === 'carousel');
    assert(Boolean(carouselPost && carouselPost.carouselMedia && carouselPost.carouselMedia.length >= 3), 'Carousel post has multiple child media slides');
    const videoPost = demoPosts.data.find((p) => p.type === 'video');
    assert(Boolean(videoPost && videoPost.url.endsWith('.mp4')), 'Video post contains playable MP4 URL');

    // 2.5 Reels
    const demoReels = await demo.getReels('photography_daily');
    assert(demoReels.data.length >= 2, `Demo reels returned: ${demoReels.data.length} reels`);
    assert(Boolean(demoReels.data[0].audioTitle), `Reel contains audio title: "${demoReels.data[0].audioTitle}"`);
    assert(Boolean(demoReels.data[0].duration && demoReels.data[0].duration > 0), `Reel has valid duration: ${demoReels.data[0].duration}s`);
  } catch (err: unknown) {
    assert(false, 'Demo provider execution failed', err);
  }

  // 3. InstagramService (Cache, Proxy URL Generation & Metadata)
  console.log('\n--- TEST GROUP 3: Service Layer & Caching ---');
  try {
    const res1 = await InstagramService.getProfile('testuser', true);
    assert(res1.success === true, 'Service getProfile succeeded');
    assert(Boolean(res1.metadata?.isDemo), 'Service metadata correctly marks demo status');

    // Second call should hit in-memory cache
    const res2 = await InstagramService.getProfile('testuser', true);
    assert(res2.metadata?.executionTimeMs === 0, 'Cached request returned in 0ms');

    // Posts should have download URLs generated
    const postsRes = await InstagramService.getPosts('testuser', true);
    assert(Boolean(postsRes.data?.[0]?.downloadUrl?.includes('/api/media')), 'Post contains formatted /api/media download URL');
  } catch (err: unknown) {
    assert(false, 'Service layer test failed', err);
  }

  // 4. Security & SSRF Protection
  console.log('\n--- TEST GROUP 4: Security & SSRF Defense ---');
  const allowedTestUrl = 'https://scontent.cdninstagram.com/v/t51.2885-15/photo.jpg';
  try {
    const validated = validateMediaUrl(allowedTestUrl);
    assert(validated.hostname === 'scontent.cdninstagram.com', 'Valid Instagram CDN domain accepted');
  } catch {
    assert(false, 'Valid CDN domain was incorrectly blocked');
  }

  const blockedUrls = [
    'http://127.0.0.1:8080/admin',
    'http://localhost/secret',
    'http://169.254.169.254/latest/meta-data/',
    'http://192.168.1.1/router',
    'ftp://evil.com/file',
    'https://unauthorized-domain.evil.com/payload',
  ];

  for (const badUrl of blockedUrls) {
    try {
      validateMediaUrl(badUrl);
      assert(false, `SSRF check failed to block dangerous URL: ${badUrl}`);
    } catch {
      assert(true, `Dangerous URL properly blocked: ${badUrl}`);
    }
  }

  // Summary
  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
